// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';
import { resolveExtensionRoot, ToolConfig } from '@vscode/common-python-lsp';

export const EXTENSION_ROOT_DIR = resolveExtensionRoot(__dirname);

export const FLAKE8_CONFIG_FILES = ['.flake8', 'setup.cfg', 'tox.ini'];

/* eslint-disable @typescript-eslint/naming-convention */
const DEFAULT_SEVERITY: Record<string, string> = {
    E: 'Error',
    F: 'Error',
    I: 'Information',
    W: 'Warning',
};

export const FLAKE8_TOOL_CONFIG: ToolConfig = {
    toolId: 'flake8',
    toolDisplayName: 'Flake8',
    toolModule: 'flake8',
    minimumPythonVersion: { major: 3, minor: 10 },
    configFiles: FLAKE8_CONFIG_FILES,
    serverScript: path.join(EXTENSION_ROOT_DIR, 'bundled', 'tool', 'lsp_server.py'),
    debugServerScript: path.join(EXTENSION_ROOT_DIR, 'bundled', 'tool', '_debug_server.py'),
    settingsDefaults: {
        enabled: true,
        severity: DEFAULT_SEVERITY,
        ignorePatterns: [],
        extraPaths: [],
    },
    trackedSettings: [
        'args',
        'cwd',
        'enabled',
        'severity',
        'path',
        'interpreter',
        'importStrategy',
        'showNotifications',
        'ignorePatterns',
        'extraPaths',
    ],
};
