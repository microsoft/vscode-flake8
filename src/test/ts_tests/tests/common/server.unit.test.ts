// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { assert } from 'chai';
import { Uri } from 'vscode';
import { getServerCwd } from '../../../../common/server';
import { ISettings } from '../../../../common/settings';

function makeSettings(cwd: string, workspace: string): ISettings {
    return {
        cwd,
        workspace,
        enabled: true,
        args: [],
        severity: {},
        path: [],
        ignorePatterns: [],
        interpreter: [],
        importStrategy: 'fromEnvironment',
        showNotifications: 'onError',
        extraPaths: [],
    };
}

suite('getServerCwd Tests', () => {
    const workspacePath = '/home/user/project';
    const expectedFsPath = Uri.file(workspacePath).fsPath;

    test('Returns cwd unchanged when it is a plain path', () => {
        const settings = makeSettings('/some/plain/path', workspacePath);
        assert.strictEqual(getServerCwd(settings), '/some/plain/path');
    });

    test('Falls back to workspace path when cwd contains ${fileDirname}', () => {
        const settings = makeSettings('${fileDirname}', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Falls back to workspace path when cwd contains ${relativeFileDirname}', () => {
        const settings = makeSettings('${relativeFileDirname}', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Falls back to workspace path when cwd contains ${file}', () => {
        const settings = makeSettings('${file}', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Falls back to workspace path when cwd contains ${relativeFile}', () => {
        const settings = makeSettings('${relativeFile}', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Falls back to workspace path when cwd contains ${fileBasename}', () => {
        const settings = makeSettings('${fileBasename}', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Falls back to workspace path when cwd is a path with an embedded file-variable', () => {
        const settings = makeSettings('/prefix/${fileDirname}/suffix', workspacePath);
        assert.strictEqual(getServerCwd(settings), expectedFsPath);
    });

    test('Returns cwd unchanged when it contains ${workspaceFolder} (non-file variable)', () => {
        const settings = makeSettings('/resolved/workspace', workspacePath);
        assert.strictEqual(getServerCwd(settings), '/resolved/workspace');
    });
});
