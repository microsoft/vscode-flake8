// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';
import { ToolConfig } from '@vscode/common-python-lsp';

const folderName = path.basename(__dirname);
export const EXTENSION_ROOT_DIR =
    folderName === 'common' ? path.dirname(path.dirname(__dirname)) : path.dirname(__dirname);
export const BUNDLED_PYTHON_SCRIPTS_DIR = path.join(EXTENSION_ROOT_DIR, 'bundled');
export const SERVER_SCRIPT_PATH = path.join(BUNDLED_PYTHON_SCRIPTS_DIR, 'tool', `lsp_server.py`);
export const DEBUG_SERVER_SCRIPT_PATH = path.join(BUNDLED_PYTHON_SCRIPTS_DIR, 'tool', `_debug_server.py`);
export const PYTHON_MAJOR = 3;
export const PYTHON_MINOR = 10;
export const PYTHON_VERSION = `${PYTHON_MAJOR}.${PYTHON_MINOR}`;
export const LS_SERVER_RESTART_DELAY = 1000;
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
    minimumPythonVersion: { major: PYTHON_MAJOR, minor: PYTHON_MINOR },
    configFiles: FLAKE8_CONFIG_FILES,
    serverScript: SERVER_SCRIPT_PATH,
    debugServerScript: DEBUG_SERVER_SCRIPT_PATH,
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
