// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Thin wrapper: delegates to vscode-common-python-lsp shared package.
// isVirtualWorkspace is kept local so tests can sinon.stub it on this module.
import { workspace } from 'vscode';

export {
    createLanguageStatusItem,
    createOutputChannel,
    createStatusBarItem,
    getConfiguration,
    getWorkspaceFolder,
    getWorkspaceFolders,
    onDidChangeActiveTextEditor,
    onDidChangeConfiguration,
    registerCommand,
    registerDocumentFormattingEditProvider,
} from '@vscode/common-python-lsp';

export function isVirtualWorkspace(): boolean {
    const isVirtual = workspace.workspaceFolders && workspace.workspaceFolders.every((f) => f.uri.scheme !== 'file');
    return !!isVirtual;
}
