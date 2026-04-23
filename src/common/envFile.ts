// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Thin wrapper: delegates to vscode-common-python-lsp shared package.
// expandTilde is re-exported from the shared settings module for settings.ts compat.
export { getEnvFileVars, expandTilde } from 'vscode-common-python-lsp';
