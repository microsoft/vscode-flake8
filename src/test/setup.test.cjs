// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const postinstall = fs.readFileSync(path.join(root, 'build/postinstall.js'), 'utf8');

function install(exists) {
    const commands = [];
    vm.runInNewContext(postinstall, {
        __dirname: path.join(root, 'build'),
        require: (name) => {
            if (name === 'fs') {
                return { existsSync: exists };
            }
            if (name === 'child_process') {
                return { execSync: (command, options) => commands.push({ command, cwd: options.cwd }) };
            }
            return require(name);
        },
        console: { error() {} },
        process: {
            exit: (code) => {
                throw new Error(`exit ${code}`);
            },
        },
    });
    return commands;
}

test('postinstall restores locked source dependencies and rebuilds even with existing dist', () => {
    const commands = install(() => true);
    assert.deepEqual(commands, [
        {
            command: 'npm ci --ignore-scripts',
            cwd: path.join(root, 'external', 'vscode-common-python-lsp', 'typescript'),
        },
        {
            command: 'npm run build',
            cwd: path.join(root, 'external', 'vscode-common-python-lsp', 'typescript'),
        },
    ]);
});

test('postinstall fails when the pinned submodule is unavailable', () => {
    assert.throws(() => install(() => false), /exit 1/);
});
