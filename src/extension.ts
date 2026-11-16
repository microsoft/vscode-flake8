// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as vscode from 'vscode';
import {
    activateToolExtension,
    loadServerDefaults,
    ToolExtensionRuntime,
} from '../external/vscode-common-python-lsp/typescript/dist';
import { EXTENSION_ROOT_DIR, FLAKE8_TOOL_CONFIG } from './common/constants';
import { logLegacySettings } from './common/settings';

let runtime: ToolExtensionRuntime | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const serverInfo = loadServerDefaults(EXTENSION_ROOT_DIR);
    runtime = activateToolExtension(context, {
        serverInfo,
        toolConfig: FLAKE8_TOOL_CONFIG,
    });

    logLegacySettings();
}

export async function deactivate(): Promise<void> {
    await runtime?.deactivate();
}
