// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Type declarations for the ms-python.vscode-python-envs extension API.
 * Subset of types from https://github.com/microsoft/vscode-python-environments/blob/main/src/api.ts
 * covering only the API surface used by this extension.
 */

import { Event, Uri } from 'vscode';

/**
 * Options for executing a Python executable.
 */
export interface PythonCommandRunConfiguration {
    /**
     * Path to the binary like `python.exe` or `python3` to execute.
     */
    executable: string;

    /**
     * Arguments to pass to the python executable.
     */
    args?: string[];
}

/**
 * Contains details on how to use a particular python environment.
 */
export interface PythonEnvironmentExecutionInfo {
    /**
     * Details on how to run the python executable.
     */
    run: PythonCommandRunConfiguration;

    /**
     * Details on how to run the python executable after activating the environment.
     */
    activatedRun?: PythonCommandRunConfiguration;

    /**
     * Details on how to activate an environment.
     */
    activation?: PythonCommandRunConfiguration[];
}

/**
 * Interface representing information about a Python environment.
 */
export interface PythonEnvironmentInfo {
    /**
     * The name of the Python environment.
     */
    readonly name: string;

    /**
     * The display name of the Python environment.
     */
    readonly displayName: string;

    /**
     * The version of the Python environment.
     */
    readonly version: string;

    /**
     * Path to the python binary or environment folder.
     */
    readonly environmentPath: Uri;

    /**
     * Information on how to execute the Python environment.
     */
    readonly execInfo: PythonEnvironmentExecutionInfo;

    /**
     * `sys.prefix` path for the Python installation.
     */
    readonly sysPrefix: string;
}

/**
 * Interface representing the ID of a Python environment.
 */
export interface PythonEnvironmentId {
    /**
     * The unique identifier of the Python environment.
     */
    id: string;

    /**
     * The ID of the manager responsible for the Python environment.
     */
    managerId: string;
}

/**
 * Interface representing a Python environment.
 */
export interface PythonEnvironment extends PythonEnvironmentInfo {
    /**
     * The ID of the Python environment.
     */
    readonly envId: PythonEnvironmentId;
}

/**
 * Type representing the scope for getting a Python environment.
 */
export type GetEnvironmentScope = undefined | Uri;

/**
 * Event arguments for when the current Python environment changes.
 */
export interface DidChangeEnvironmentEventArgs {
    readonly uri: Uri | undefined;
    readonly old: PythonEnvironment | undefined;
    readonly new: PythonEnvironment | undefined;
}

/**
 * Type representing the context for resolving a Python environment.
 */
export type ResolveEnvironmentContext = Uri;

/**
 * The API exported by the ms-python.vscode-python-envs extension.
 * This is the subset of PythonEnvironmentApi used by this extension.
 */
export interface PythonEnvironmentsAPI {
    /**
     * Retrieves the current Python environment within the specified scope.
     */
    getEnvironment(scope: GetEnvironmentScope): Promise<PythonEnvironment | undefined>;

    /**
     * Resolves a Python environment from a Uri context.
     */
    resolveEnvironment(context: ResolveEnvironmentContext): Promise<PythonEnvironment | undefined>;

    /**
     * Event that is fired when the selected Python environment changes.
     */
    onDidChangeEnvironment: Event<DidChangeEnvironmentEventArgs>;
}
