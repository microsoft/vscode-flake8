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
        showNotifications: 'off',
        extraPaths: [],
    };
}

suite('getServerCwd Tests', () => {
    const workspacePath = '/home/user/project';
    const workspaceUri = Uri.file(workspacePath).toString();

    test('Returns cwd unchanged when it is a plain path', () => {
        const settings = makeSettings('/some/plain/path', workspaceUri);
        assert.strictEqual(getServerCwd(settings), '/some/plain/path');
    });

    test('Falls back to workspace path when cwd contains ${fileDirname}', () => {
        const settings = makeSettings('${fileDirname}', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Falls back to workspace path when cwd contains ${relativeFileDirname}', () => {
        const settings = makeSettings('${relativeFileDirname}', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Falls back to workspace path when cwd contains ${file}', () => {
        const settings = makeSettings('${file}', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Falls back to workspace path when cwd contains ${relativeFile}', () => {
        const settings = makeSettings('${relativeFile}', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Falls back to workspace path when cwd contains ${fileBasename}', () => {
        const settings = makeSettings('${fileBasename}', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Falls back to workspace path when cwd is a path with an embedded file-variable', () => {
        const settings = makeSettings('/prefix/${fileDirname}/suffix', workspaceUri);
        assert.strictEqual(getServerCwd(settings), Uri.parse(workspaceUri).fsPath);
    });

    test('Returns cwd unchanged when it contains ${workspaceFolder} (non-file variable)', () => {
        const settings = makeSettings('/resolved/workspace', workspaceUri);
        assert.strictEqual(getServerCwd(settings), '/resolved/workspace');
    });
});
