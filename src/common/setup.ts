// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Thin wrapper: delegates to vscode-common-python-lsp shared package,
// passing the tool-specific EXTENSION_ROOT_DIR.
import { loadServerDefaults as _loadServerDefaults, IServerInfo } from 'vscode-common-python-lsp';
import { EXTENSION_ROOT_DIR } from './constants';

export type { IServerInfo };

export function loadServerDefaults(): IServerInfo {
    return _loadServerDefaults(EXTENSION_ROOT_DIR);
}
