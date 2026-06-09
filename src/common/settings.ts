// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Extension-specific settings: ISettings type extension and legacy settings logging.
// All shared settings resolution is handled by @vscode/common-python-lsp directly.

import {
    IBaseSettings,
    getConfiguration,
    getWorkspaceFolders,
    logLegacySettings as _logLegacySettings,
    traceWarn,
} from '@vscode/common-python-lsp';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ISettings extends IBaseSettings {
    enabled: boolean;
    severity: Record<string, string>;
    ignorePatterns: string[];
    extraPaths: string[];
}

export function logLegacySettings(): void {
    // Handle flake8Enabled separately — it has custom messaging not covered
    // by the shared helper's simple "use X instead" pattern.
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
        } catch (err) {
            traceWarn(`Error while logging legacy settings: ${err}`);
        }
    });

    // Standard legacy key → new key mappings handled by the shared helper.
    _logLegacySettings('flake8', [
        { legacyKey: 'linting.cwd', newKey: 'cwd' },
        { legacyKey: 'linting.flake8Args', newKey: 'args', isArray: true },
        { legacyKey: 'linting.flake8Path', newKey: 'path' },
    ]);
}
