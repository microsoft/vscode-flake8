// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Thin wrapper: delegates to vscode-common-python-lsp shared package,
// passing the flake8-specific config file patterns and tool name.
import { Disposable } from 'vscode';
import { createConfigFileWatchers as _createConfigFileWatchers } from 'vscode-common-python-lsp';
import { FLAKE8_CONFIG_FILES } from './constants';

export function createConfigFileWatchers(onConfigChanged: () => Promise<void>): Disposable[] {
    return _createConfigFileWatchers(FLAKE8_CONFIG_FILES, 'Flake8', onConfigChanged);
}
