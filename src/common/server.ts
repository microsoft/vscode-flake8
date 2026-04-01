// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fsapi from 'fs-extra';
import * as path from 'path';
import { Disposable, env, l10n, LanguageStatusSeverity, LogOutputChannel, Uri } from 'vscode';
import { State } from 'vscode-languageclient';
import {
    LanguageClient,
    LanguageClientOptions,
    RevealOutputChannelOn,
    ServerOptions,
} from 'vscode-languageclient/node';
import { DEBUG_SERVER_SCRIPT_PATH, SERVER_SCRIPT_PATH } from './constants';
import { traceError, traceInfo, traceVerbose } from './logging';
import { getDebuggerPath } from './python';
import { getExtensionSettings, getGlobalSettings, ISettings } from './settings';
import { getLSClientTraceLevel, getDocumentSelector } from './utilities';
import { updateStatus } from './status';
import { getConfiguration } from './vscodeapi';

export type IInitOptions = { settings: ISettings[]; globalSettings: ISettings };

/**
 * Parses a .env file and returns a record of environment variables.
 * Supports KEY=VALUE, KEY="VALUE", KEY='VALUE', comments (#), and empty lines.
 */
function parseEnvFile(content: string): Record<string, string> {
    const env: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex < 0) {
            continue;
        }
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (key) {
            env[key] = value;
        }
    }
    return env;
}

/**
 * Reads environment variables from the configured python.envFile (defaults
 * to `${workspaceFolder}/.env`). Returns an empty record when the file
 * does not exist or cannot be read.
 */
async function loadEnvFile(workspacePath: string): Promise<Record<string, string>> {
    try {
        const pythonConfig = getConfiguration('python');
        let envFilePath = pythonConfig.get<string>('envFile', '${workspaceFolder}/.env');
        envFilePath = envFilePath.replace('${workspaceFolder}', workspacePath);

        if (await fsapi.pathExists(envFilePath)) {
            const content = await fsapi.readFile(envFilePath, 'utf-8');
            const envVars = parseEnvFile(content);
            const count = Object.keys(envVars).length;
            if (count > 0) {
                traceInfo(`Loaded ${count} environment variable(s) from ${envFilePath}`);
            }
            return envVars;
        }
    } catch (ex) {
        traceError(`Failed to load envFile: ${ex}`);
    }
    return {};
}

/**
 * Resolves the CWD for spawning the server process.
 *
 * File-based variables (${file*}, ${relativeFile*}) are resolved per-document
 * by the Python server at lint-time, not at server-spawn time. When the
 * configured cwd still contains such a variable we fall back to the workspace
 * path so the server process can be spawned successfully.
 */
export function getServerCwd(settings: ISettings): string {
    const hasFileVariable = /\$\{(file|relativeFile)/.test(settings.cwd);
    return hasFileVariable ? Uri.parse(settings.workspace).fsPath : settings.cwd;
}

async function createServer(
    settings: ISettings,
    serverId: string,
    serverName: string,
    outputChannel: LogOutputChannel,
    initializationOptions: IInitOptions,
): Promise<LanguageClient> {
    const command = settings.interpreter[0];
    const cwd = getServerCwd(settings);

    // Set debugger path needed for debugging Python code.
    const newEnv = { ...process.env };

    // Load environment variables from python.envFile (.env)
    const workspacePath = Uri.parse(settings.workspace).fsPath;
    const envFileVars = await loadEnvFile(workspacePath);
    Object.assign(newEnv, envFileVars);

    const debuggerPath = await getDebuggerPath();
    const isDebugScript = await fsapi.pathExists(DEBUG_SERVER_SCRIPT_PATH);
    if (newEnv.USE_DEBUGPY && debuggerPath) {
        newEnv.DEBUGPY_PATH = debuggerPath;
    } else {
        newEnv.USE_DEBUGPY = 'False';
    }

    // Set import strategy
    newEnv.LS_IMPORT_STRATEGY = settings.importStrategy;

    // Set notification type
    newEnv.LS_SHOW_NOTIFICATION = settings.showNotifications;

    newEnv.PYTHONUTF8 = '1';

    const args =
        newEnv.USE_DEBUGPY === 'False' || !isDebugScript
            ? settings.interpreter.slice(1).concat([SERVER_SCRIPT_PATH])
            : settings.interpreter.slice(1).concat([DEBUG_SERVER_SCRIPT_PATH]);
    traceInfo(`Server run command: ${[command, ...args].join(' ')}`);
    traceInfo(`Server CWD: ${cwd}`);
    traceVerbose(`Server environment: LS_IMPORT_STRATEGY=${newEnv.LS_IMPORT_STRATEGY}, LS_SHOW_NOTIFICATION=${newEnv.LS_SHOW_NOTIFICATION}, PYTHONUTF8=${newEnv.PYTHONUTF8}`);

    const serverOptions: ServerOptions = {
        command,
        args,
        options: { cwd, env: newEnv },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for Python documents
        documentSelector: getDocumentSelector(),
        outputChannel: outputChannel,
        traceOutputChannel: outputChannel,
        revealOutputChannelOn: RevealOutputChannelOn.Never,
        initializationOptions,
    };

    return new LanguageClient(serverId, serverName, serverOptions, clientOptions);
}

let _disposables: Disposable[] = [];
export async function restartServer(
    workspaceSetting: ISettings,
    serverId: string,
    serverName: string,
    outputChannel: LogOutputChannel,
    oldLsClient?: LanguageClient,
): Promise<LanguageClient | undefined> {
    if (oldLsClient) {
        traceInfo(`Server: Stop requested`);
        try {
            await oldLsClient.stop();
        } catch (ex) {
            traceError(`Server: Stop failed: ${ex}`);
        }
    }
    _disposables.forEach((d) => d.dispose());
    _disposables = [];
    updateStatus(undefined, LanguageStatusSeverity.Information, true);

    const serverCwd = getServerCwd(workspaceSetting);
    const newLSClient = await createServer(workspaceSetting, serverId, serverName, outputChannel, {
        settings: await getExtensionSettings(serverId, true),
        globalSettings: await getGlobalSettings(serverId, false),
    });

    traceInfo(`Server: Start requested.`);
    _disposables.push(
        newLSClient.onDidChangeState((e) => {
            switch (e.newState) {
                case State.Stopped:
                    traceVerbose(`Server State: Stopped`);
                    break;
                case State.Starting:
                    traceVerbose(`Server State: Starting`);
                    break;
                case State.Running:
                    traceVerbose(`Server State: Running`);
                    updateStatus(undefined, LanguageStatusSeverity.Information, false);
                    break;
            }
        }),
    );
    try {
        await newLSClient.start();
        await newLSClient.setTrace(getLSClientTraceLevel(outputChannel.logLevel, env.logLevel));
    } catch (ex) {
        updateStatus(l10n.t('Server failed to start.'), LanguageStatusSeverity.Error);
        traceError(`Server: Start failed (CWD: ${serverCwd}): ${ex}`);
    }

    return newLSClient;
}
