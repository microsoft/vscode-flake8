// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConfigurationChangeEvent, WorkspaceFolder } from 'vscode';
import { traceLog } from './log/logging';
import { LoggingLevelSettingType } from './log/types';
import { getInterpreterDetails } from './python';
import { getConfiguration, getWorkspaceFolders } from './vscodeapi';

/* eslint-disable @typescript-eslint/naming-convention */
const DEFAULT_SEVERITY: Record<string, string> = {
    E: 'Error',
    F: 'Error',
    I: 'Information',
    W: 'Warning',
};
export interface ISettings {
    cwd: string;
    workspace: string;
    logLevel: LoggingLevelSettingType;
    args: string[];
    severity: Record<string, string>;
    path: string[];
    interpreter: string[];
    importStrategy: string;
    showNotifications: string;
}

export async function getExtensionSettings(namespace: string, includeInterpreter?: boolean): Promise<ISettings[]> {
    const settings: ISettings[] = [];
    const workspaces = getWorkspaceFolders();

    for (const workspace of workspaces) {
        const workspaceSetting = await getWorkspaceSettings(namespace, workspace, includeInterpreter);
        settings.push(workspaceSetting);
    }

    return settings;
}

function resolveWorkspace(workspace: WorkspaceFolder, value: string): string {
    return value.replace('${workspaceFolder}', workspace.uri.fsPath);
}

function getArgs(namespace: string, workspace: WorkspaceFolder): string[] {
    const config = getConfiguration(namespace, workspace.uri);
    const args = config.get<string[]>('args', []);

    if (args.length > 0) {
        return args;
    }

    const legacyConfig = getConfiguration('python', workspace.uri);
    const legacyArgs = legacyConfig.get<string[]>('linting.flake8Args', []);
    if (legacyArgs.length > 0) {
        traceLog('Using legacy Flake8 args from `python.linting.flake8Args`');
        return legacyArgs;
    }

    return [];
}

function getPath(namespace: string, workspace: WorkspaceFolder): string[] {
    const config = getConfiguration(namespace, workspace.uri);
    const path = config.get<string[]>('path', []);

    if (path.length > 0) {
        return path;
    }

    const legacyConfig = getConfiguration('python', workspace.uri);
    const legacyPath = legacyConfig.get<string>('linting.flake8Path', '');
    if (legacyPath.length > 0 && legacyPath !== 'flake8') {
        traceLog('Using legacy Flake8 path from `python.linting.flake8Path`');
        return [legacyPath];
    }
    return [];
}

function getCwd(namespace: string, workspace: WorkspaceFolder): string {
    const legacyConfig = getConfiguration('python', workspace.uri);
    const legacyCwd = legacyConfig.get<string>('linting.cwd');

    if (legacyCwd) {
        traceLog('Using cwd from `python.linting.cwd`.');
        return resolveWorkspace(workspace, legacyCwd);
    }

    return workspace.uri.fsPath;
}

export function getInterpreterFromSetting(namespace: string) {
    const config = getConfiguration(namespace);
    return config.get<string[]>('interpreter');
}

export async function getWorkspaceSettings(
    namespace: string,
    workspace: WorkspaceFolder,
    includeInterpreter?: boolean,
): Promise<ISettings> {
    const config = getConfiguration(namespace, workspace.uri);

    let interpreter: string[] | undefined = [];
    if (includeInterpreter) {
        interpreter = getInterpreterFromSetting(namespace);
        if (interpreter === undefined || interpreter.length === 0) {
            interpreter = (await getInterpreterDetails(workspace.uri)).path;
        }
    }

    const args = getArgs(namespace, workspace).map((s) => resolveWorkspace(workspace, s));
    const path = getPath(namespace, workspace).map((s) => resolveWorkspace(workspace, s));
    const workspaceSetting = {
        cwd: getCwd(namespace, workspace),
        workspace: workspace.uri.toString(),
        logLevel: config.get<LoggingLevelSettingType>('logLevel', 'error'),
        args,
        severity: config.get<Record<string, string>>('severity', DEFAULT_SEVERITY),
        path,
        interpreter: (interpreter ?? []).map((s) => resolveWorkspace(workspace, s)),
        importStrategy: config.get<string>('importStrategy', 'fromEnvironment'),
        showNotifications: config.get<string>('showNotifications', 'off'),
    };
    return workspaceSetting;
}

export function checkIfConfigurationChanged(e: ConfigurationChangeEvent, namespace: string): boolean {
    const settings = [
        `${namespace}.logLevel`,
        `${namespace}.args`,
        `${namespace}.severity`,
        `${namespace}.path`,
        `${namespace}.interpreter`,
        `${namespace}.importStrategy`,
        `${namespace}.showNotifications`,
    ];
    const changed = settings.map((s) => e.affectsConfiguration(s));
    return changed.includes(true);
}
