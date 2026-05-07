// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Extension-specific settings: ISettings type extension and legacy settings logging.
// All shared settings resolution is handled by @vscode/common-python-lsp directly.

import { IBaseSettings, getConfiguration, getWorkspaceFolders, traceWarn } from '@vscode/common-python-lsp';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ISettings extends IBaseSettings {
    enabled: boolean;
    severity: Record<string, string>;
    ignorePatterns: string[];
    extraPaths: string[];
}

export function logLegacySettings(): void {
    getWorkspaceFolders().forEach((workspace) => {
        try {
            const legacyConfig = getConfiguration('python', workspace.uri);

            const legacyFlake8Enabled = legacyConfig.get<boolean>('linting.flake8Enabled', false);
            if (legacyFlake8Enabled) {
                traceWarn(`"python.linting.flake8Enabled" is deprecated. You can remove that setting.`);
                traceWarn(
                    'The flake8 extension is always enabled. However, you can disable it per workspace using the extensions view.',
                );
                traceWarn('You can exclude files and folders using the `python.linting.ignorePatterns` setting.');
                traceWarn(
                    `"python.linting.flake8Enabled" value for workspace ${workspace.uri.fsPath}: ${legacyFlake8Enabled}`,
                );
            }

            const legacyCwd = legacyConfig.get<string>('linting.cwd');
            if (legacyCwd) {
                traceWarn(`"python.linting.cwd" is deprecated. Use "flake8.cwd" instead.`);
                traceWarn(`"python.linting.cwd" value for workspace ${workspace.uri.fsPath}: ${legacyCwd}`);
            }

            const legacyArgs = legacyConfig.get<string[]>('linting.flake8Args', []);
            if (legacyArgs.length > 0) {
                traceWarn(`"python.linting.flake8Args" is deprecated. Use "flake8.args" instead.`);
                traceWarn(`"python.linting.flake8Args" value for workspace ${workspace.uri.fsPath}:`);
                traceWarn(`\n${JSON.stringify(legacyArgs, null, 4)}`);
            }

            const legacyPath = legacyConfig.get<string>('linting.flake8Path', '');
            if (legacyPath.length > 0 && legacyPath !== 'flake8') {
                traceWarn(`"python.linting.flake8Path" is deprecated. Use "flake8.path" instead.`);
                traceWarn(`"python.linting.flake8Path" value for workspace ${workspace.uri.fsPath}:`);
                traceWarn(`\n${JSON.stringify(legacyPath, null, 4)}`);
            }
        } catch (err) {
            traceWarn(`Error while logging legacy settings: ${err}`);
        }
    });
}
