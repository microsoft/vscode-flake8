// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { assert } from 'chai';
import * as sinon from 'sinon';
import { Disposable, FileSystemWatcher, Uri, workspace } from 'vscode';
import { createConfigFileWatchers } from '../../../../common/configWatcher';
import { FLAKE8_CONFIG_FILES } from '../../../../common/constants';

interface MockFileSystemWatcher {
    watcher: FileSystemWatcher;
    changeDisposable: { dispose: sinon.SinonStub };
    createDisposable: { dispose: sinon.SinonStub };
    deleteDisposable: { dispose: sinon.SinonStub };
    fireDidCreate(): Promise<void>;
    fireDidChange(): Promise<void>;
    fireDidDelete(): Promise<void>;
}

function createMockFileSystemWatcher(): MockFileSystemWatcher {
    let onDidChangeHandler: ((e: Uri) => Promise<void>) | undefined;
    let onDidCreateHandler: ((e: Uri) => Promise<void>) | undefined;
    let onDidDeleteHandler: ((e: Uri) => Promise<void>) | undefined;

    const changeDisposable = { dispose: sinon.stub() };
    const createDisposable = { dispose: sinon.stub() };
    const deleteDisposable = { dispose: sinon.stub() };

    const watcher = {
        onDidChange: sinon.stub().callsFake((handler: (e: Uri) => Promise<void>): Disposable => {
            onDidChangeHandler = handler;
            return changeDisposable;
        }),
        onDidCreate: sinon.stub().callsFake((handler: (e: Uri) => Promise<void>): Disposable => {
            onDidCreateHandler = handler;
            return createDisposable;
        }),
        onDidDelete: sinon.stub().callsFake((handler: (e: Uri) => Promise<void>): Disposable => {
            onDidDeleteHandler = handler;
            return deleteDisposable;
        }),
        dispose: sinon.stub(),
    } as unknown as FileSystemWatcher;

    const fakeUri = Uri.file('/fake/config/file');

    return {
        watcher,
        changeDisposable,
        createDisposable,
        deleteDisposable,
        fireDidCreate: async () => {
            if (onDidCreateHandler) {
                await onDidCreateHandler(fakeUri);
            }
        },
        fireDidChange: async () => {
            if (onDidChangeHandler) {
                await onDidChangeHandler(fakeUri);
            }
        },
        fireDidDelete: async () => {
            if (onDidDeleteHandler) {
                await onDidDeleteHandler(fakeUri);
            }
        },
    };
}

suite('Config File Watcher Tests', () => {
    let sandbox: sinon.SinonSandbox;
    let createFileSystemWatcherStub: sinon.SinonStub;
    let mockWatchers: MockFileSystemWatcher[];
    let onConfigChangedCallback: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        onConfigChangedCallback = sandbox.stub().resolves();
        mockWatchers = FLAKE8_CONFIG_FILES.map(() => createMockFileSystemWatcher());

        let watcherIndex = 0;
        createFileSystemWatcherStub = sandbox.stub(workspace, 'createFileSystemWatcher').callsFake(() => {
            return mockWatchers[watcherIndex++].watcher;
        });
    });

    teardown(() => {
        sandbox.restore();
    });

    test('Creates a file watcher for each flake8 config file pattern', () => {
        const onConfigChanged = sandbox.stub().resolves();
        createConfigFileWatchers(onConfigChanged);

        assert.strictEqual(createFileSystemWatcherStub.callCount, FLAKE8_CONFIG_FILES.length);
        for (let i = 0; i < FLAKE8_CONFIG_FILES.length; i++) {
            assert.isTrue(
                createFileSystemWatcherStub.getCall(i).calledWith(`**/${FLAKE8_CONFIG_FILES[i]}`),
                `Expected watcher for pattern **/${FLAKE8_CONFIG_FILES[i]}`,
            );
        }
    });

    test('Server restarts when a config file is created', async () => {
        const onConfigChanged = sandbox.stub().resolves();
        createConfigFileWatchers(onConfigChanged);

        await mockWatchers[0].fireDidCreate();

        assert.isTrue(onConfigChanged.calledOnce, 'Expected onConfigChanged to be called when config file is created');
    });

    test('Server restarts when a config file is changed', async () => {
        const onConfigChanged = sandbox.stub().resolves();
        createConfigFileWatchers(onConfigChanged);

        // Simulate modifying setup.cfg (index 1)
        await mockWatchers[1].fireDidChange();

        assert.isTrue(onConfigChanged.calledOnce, 'Expected onConfigChanged to be called when config file is changed');
    });

    test('Server restarts when a config file is deleted', async () => {
        const onConfigChanged = sandbox.stub().resolves();
        createConfigFileWatchers(onConfigChanged);

        await mockWatchers[FLAKE8_CONFIG_FILES.length - 1].fireDidDelete();

        assert.isTrue(onConfigChanged.calledOnce, 'Expected onConfigChanged to be called when config file is deleted');
    });

    test('Server restarts for each config file type on change', async () => {
        const onConfigChanged = sandbox.stub().resolves();
        createConfigFileWatchers(onConfigChanged);

        for (const mock of mockWatchers) {
            await mock.fireDidChange();
        }

        assert.strictEqual(
            onConfigChanged.callCount,
            FLAKE8_CONFIG_FILES.length,
            `Expected onConfigChanged to be called once for each of the ${FLAKE8_CONFIG_FILES.length} config file patterns`,
        );
    });

    test('Returns a disposable for each watcher', () => {
        const onConfigChanged = sandbox.stub().resolves();
        const disposables = createConfigFileWatchers(onConfigChanged);

        assert.strictEqual(disposables.length, FLAKE8_CONFIG_FILES.length);
        for (const d of disposables) {
            assert.isFunction(d.dispose);
        }
    });

    test('Should dispose all subscriptions and watcher on dispose', () => {
        const watchers = createConfigFileWatchers(onConfigChangedCallback);

        watchers[0].dispose();

        const { changeDisposable, createDisposable, deleteDisposable, watcher: mockWatcher } = mockWatchers[0];
        assert.strictEqual(changeDisposable.dispose.callCount, 1, 'Change subscription should be disposed');
        assert.strictEqual(createDisposable.dispose.callCount, 1, 'Create subscription should be disposed');
        assert.strictEqual(deleteDisposable.dispose.callCount, 1, 'Delete subscription should be disposed');
        assert.strictEqual((mockWatcher.dispose as sinon.SinonStub).callCount, 1, 'Watcher should be disposed');
    });

    test('Should not call callback after dispose', () => {
        const watchers = createConfigFileWatchers(onConfigChangedCallback);

        // Dispose the watcher
        watchers[0].dispose();

        // Get the handlers and call them after disposal
        const changeHandler = (mockWatchers[0].watcher.onDidChange as sinon.SinonStub).getCall(0).args[0];
        changeHandler();

        assert.strictEqual(onConfigChangedCallback.callCount, 0, 'Callback should not be called after dispose');
    });
});
