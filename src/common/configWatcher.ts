// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Disposable, workspace } from 'vscode';
import { FLAKE8_CONFIG_FILES } from './constants';
import { traceLog } from './logging';

export function createConfigFileWatchers(onConfigChanged: () => Promise<void>): Disposable[] {
    return FLAKE8_CONFIG_FILES.map((pattern) => {
        const watcher = workspace.createFileSystemWatcher(`**/${pattern}`);
        const changeDisposable = watcher.onDidChange(async (e) => {
            traceLog(`Configuration file changed: ${e.fsPath}`);
            await onConfigChanged();
        });
        const createDisposable = watcher.onDidCreate(async (e) => {
            traceLog(`Configuration file created: ${e.fsPath}`);
            await onConfigChanged();
        });
        const deleteDisposable = watcher.onDidDelete(async (e) => {
            traceLog(`Configuration file deleted: ${e.fsPath}`);
            await onConfigChanged();
        });
        return Disposable.from(watcher, changeDisposable, createDisposable, deleteDisposable);
    });
}
