// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';

import { runTests } from '@vscode/test-electron';

// Compute extension root directly — cannot import from constants.ts here
// because it transitively pulls in @vscode/common-python-lsp which requires
// the vscode module (unavailable outside the extension host).
const EXTENSION_ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = EXTENSION_ROOT_DIR;

        // The path to test runner
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './index');

        // Download VS Code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath });
    } catch (err) {
        console.error('Failed to run tests');
        console.error(err);
        process.exit(1);
    }
}

main();
