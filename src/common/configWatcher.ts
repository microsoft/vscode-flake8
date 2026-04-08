// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Disposable, workspace } from 'vscode';
import { FLAKE8_CONFIG_FILES } from './constants';
import { traceError, traceLog } from './logging';

export function createConfigFileWatchers(onConfigChanged: () => Promise<void>): Disposable[] {
    return FLAKE8_CONFIG_FILES.map((pattern) => {
        const watcher = workspace.createFileSystemWatcher(`**/${pattern}`);
        let disposed = false;

        const handleEvent = (event: string) => {
            if (disposed) {
                return;
            }
            traceLog(`Flake8 config file ${event}: ${pattern}`);
            onConfigChanged().catch((e) => traceError(`Config file ${event} handler failed`, e));
        };

        const changeDisposable = watcher.onDidChange(() => handleEvent('changed'));
        const createDisposable = watcher.onDidCreate(() => handleEvent('created'));
        const deleteDisposable = watcher.onDidDelete(() => handleEvent('deleted'));

        return {
            dispose(): void {
                disposed = true;
                changeDisposable.dispose();
                createDisposable.dispose();
                deleteDisposable.dispose();
                watcher.dispose();
            },
        };
    });
}
