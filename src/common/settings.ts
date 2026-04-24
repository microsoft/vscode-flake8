// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Thin wrapper: delegates to vscode-common-python-lsp shared package.
// Defines ISettings (extends IBaseSettings with flake8-specific fields)
// and provides backward-compatible function signatures.

import { ConfigurationChangeEvent, WorkspaceFolder } from 'vscode';
import {
    IBaseSettings,
    checkIfConfigurationChanged as _checkIfConfigurationChanged,
    getGlobalSettings as _getGlobalSettings,
    getWorkspaceSettings as _getWorkspaceSettings,
    resolveVariables,
} from '@vscode/common-python-lsp';
import { FLAKE8_TOOL_CONFIG } from './constants';
import { traceWarn } from './logging';
import { getInterpreterDetails } from './python';
import { getConfiguration, getWorkspaceFolders } from './vscodeapi';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ISettings extends IBaseSettings {
    enabled: boolean;
    severity: Record<string, string>;
    ignorePatterns: string[];
    extraPaths: string[];
}

export async function getWorkspaceSettings(
    namespace: string,
    workspace: WorkspaceFolder,
    includeInterpreter?: boolean,
): Promise<ISettings> {
    const resolveInterpreter = includeInterpreter ? getInterpreterDetails : undefined;
    const settings = (await _getWorkspaceSettings(
        namespace,
        workspace,
        FLAKE8_TOOL_CONFIG,
        resolveInterpreter,
    )) as ISettings;

    // Post-process: resolve variables in ignorePatterns (tool-specific
    // settings from settingsDefaults don't go through resolveVariables)
    if (settings.ignorePatterns?.length > 0) {
        settings.ignorePatterns = resolveVariables(settings.ignorePatterns, workspace);
    }

    return settings;
}

export function getExtensionSettings(namespace: string, includeInterpreter?: boolean): Promise<ISettings[]> {
    return Promise.all(getWorkspaceFolders().map((w) => getWorkspaceSettings(namespace, w, includeInterpreter)));
}

export async function getGlobalSettings(namespace: string, includeInterpreter?: boolean): Promise<ISettings> {
    const resolveInterpreter = includeInterpreter ? async () => getInterpreterDetails() : undefined;
    const settings = (await _getGlobalSettings(namespace, FLAKE8_TOOL_CONFIG, resolveInterpreter)) as ISettings;

    // Preserve old behavior: when includeInterpreter is false, interpreter is []
    if (!includeInterpreter) {
        settings.interpreter = [];
    }

    return settings;
}

export function checkIfConfigurationChanged(e: ConfigurationChangeEvent, namespace: string): boolean {
    return _checkIfConfigurationChanged(e, namespace, FLAKE8_TOOL_CONFIG.trackedSettings);
}

// Legacy settings logging — kept local because flake8 has custom messages
// that don't fit the shared legacyMappings pattern.
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
