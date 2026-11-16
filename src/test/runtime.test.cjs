// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');

function loadExtension(deactivate = async () => {}) {
    const calls = [];
    const shared = {
        resolveExtensionRoot: () => root,
        loadServerDefaults: (extensionRoot) => {
            assert.equal(extensionRoot, root);
            return { name: 'Flake8', module: 'flake8' };
        },
        activateToolExtension: (context, options) => {
            calls.push({ context, options });
            return { deactivate };
        },
    };
    const originalLoad = Module._load;
    for (const file of ['extension', 'common/constants', 'common/settings']) {
        delete require.cache[require.resolve(path.join(root, 'out', file))];
    }
    Module._load = function (request, ...args) {
        if (request.endsWith('/vscode-common-python-lsp/typescript/dist')) {
            return shared;
        }
        if (request === './common/settings') {
            return { logLegacySettings: () => calls.push('legacy') };
        }
        return originalLoad.call(this, request, ...args);
    };
    try {
        return { extension: require(path.join(root, 'out/extension')), calls };
    } finally {
        Module._load = originalLoad;
    }
}

test('activation delegates to the shared runtime and retains Flake8 policy and legacy logging', async () => {
    const { extension, calls } = loadExtension();
    const context = { subscriptions: [] };
    await extension.activate(context);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].context, context);
    const { serverInfo, toolConfig, hooks } = calls[0].options;
    assert.deepEqual(serverInfo, { name: 'Flake8', module: 'flake8' });
    assert.equal(toolConfig.toolId, 'flake8');
    assert.deepEqual(toolConfig.configFiles, ['.flake8', 'setup.cfg', 'tox.ini']);
    assert.deepEqual(toolConfig.settingsDefaults, {
        enabled: true,
        severity: { E: 'Error', F: 'Error', I: 'Information', W: 'Warning' },
        ignorePatterns: [],
        extraPaths: [],
    });
    assert.deepEqual(toolConfig.trackedSettings, [
        'args',
        'cwd',
        'enabled',
        'severity',
        'path',
        'interpreter',
        'importStrategy',
        'showNotifications',
        'ignorePatterns',
        'extraPaths',
    ]);
    assert.equal(toolConfig.serverScript, path.join(root, 'bundled', 'tool', 'lsp_server.py'));
    assert.equal(toolConfig.debugServerScript, path.join(root, 'bundled', 'tool', '_debug_server.py'));
    assert.equal(toolConfig.isFormatter, undefined);
    assert.equal(hooks, undefined);
    assert.equal(calls[1], 'legacy');
});

test('deactivation awaits the shared lifetime handle', async () => {
    let finish;
    let stopped = false;
    const shutdown = new Promise((resolve) => {
        finish = resolve;
    });
    const { extension } = loadExtension(() => shutdown);
    await extension.activate({ subscriptions: [] });
    const stopping = extension.deactivate().then(() => {
        stopped = true;
    });
    await Promise.resolve();
    assert.equal(stopped, false);
    finish();
    await stopping;
    assert.equal(stopped, true);
});

test('deactivation before activation is harmless', async () => {
    const { extension } = loadExtension();
    await extension.deactivate();
});
