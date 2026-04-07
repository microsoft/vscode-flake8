// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as dotenv from 'dotenv';
import * as fsapi from 'fs-extra';
import * as path from 'path';
import { WorkspaceFolder } from 'vscode';
import { traceInfo, traceWarn } from './logging';
import { getConfiguration } from './vscodeapi';

export function expandTilde(value: string): string {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    if (value === '~') {
        return home;
    }
    if (value.startsWith('~/') || value.startsWith('~\\')) {
        return path.join(home, value.slice(2));
    }
    return value;
}

/**
 * Reads the env file configured via `python.envFile` (defaults to `${workspaceFolder}/.env`),
 * parses it using dotenv, and returns the resulting environment variables.
 * Returns an empty record if the file does not exist or cannot be read.
 */
export async function getEnvFileVars(workspace: WorkspaceFolder): Promise<Record<string, string>> {
    const pythonConfig = getConfiguration('python', workspace.uri);
    let envFilePath = pythonConfig.get<string>('envFile', '${workspaceFolder}/.env') ?? '${workspaceFolder}/.env';

    envFilePath = envFilePath.replace(/\$\{workspaceFolder\}/g, workspace.uri.fsPath);

    envFilePath = expandTilde(envFilePath);

    if (!path.isAbsolute(envFilePath)) {
        envFilePath = path.join(workspace.uri.fsPath, envFilePath);
    }

    try {
        if (await fsapi.pathExists(envFilePath)) {
            const content = await fsapi.readFile(envFilePath, 'utf-8');
            const vars = dotenv.parse(content);
            const count = Object.keys(vars).length;
            if (count > 0) {
                traceInfo(`Loaded ${count} environment variable(s) from ${envFilePath}`);
            }
            return vars;
        }
    } catch (err) {
        traceWarn(`Failed to read env file ${envFilePath}: ${err}`);
    }
    return {};
}
