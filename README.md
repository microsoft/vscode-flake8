# Flake8 extension for Visual Studio Code

A Visual Studio Code extension with support for the Flake8 linter. The extension ships with `flake8==7.1.1`.

> **Note**: The minimum version of Flake8 this extension supports is 7.0.0. If you are having issues with Flake8, please report it to [this issue tracker](https://github.com/PyCQA/flake8/issues) as this extension is just a wrapper around Flake8.

This extension supports all [actively supported versions](https://devguide.python.org/versions/#status-of-python-versions) of the Python language.

For more information on Flake8, see https://flake8.pycqa.org/

-   Minimum supported version of `flake8` is `7.0.0`.

## Usage and Features

The Flake8 extension provides features to improve your productivity while working on Python code in Visual Studio Code. Check out the [Settings section](#settings) below for more details on how to customize the extension.

-   **Integrated Linting**: Once this extension is installed in Visual Studio Code, Flake8 is automatically executed when you open a Python file, providing immediate feedback on your code quality.
-   **Customizable Flake8 Version**: By default, this extension uses the version of Flake8 that is shipped with the extension. However, you can configure it to use a different binary installed in your environment through the `flake8.importStrategy` setting, or set it to a custom Flake8 executable through the `flake8.path` settings.
-   **Mono repo support**: If you are working with a mono repo, you can configure the extension to lint Python files in subfolders of the workspace root folder by setting the `flake8.cwd` setting to `${fileDirname}`. You can also set it to ignore/skip linting for certain files or folder paths by specifying a glob pattern to the `flake8.ignorePatterns` setting.
-   **Customizable Linting Rules**: You can customize the severity of specific Flake8 error codes through the `flake8.severity` setting.

### Disabling Flake8

You can skip linting with Flake8 for specific files or directories by setting the `flake8.ignorePatterns` setting.

If you wish to disable linting with Flake8 for your entire workspace or globally, you can [disable this extension](https://code.visualstudio.com/docs/editor/extension-marketplace#_disable-an-extension) in Visual Studio Code. Alternatively, you can also disable Flake8 for your entire workspace by setting `"flake8.enabled" : false` in your `settings.json` file.

## Settings

There are several settings you can configure to customize the behavior of this extension.

<table>
    <thead>
        <tr>
            <th>Settings</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>flake8.args</td>
            <td><code>[]</code></td>
            <td>Arguments passed to Flake8 for linting Python files. Each argument should be provided as a separate string in the array. <br> Example: <code>"flake8.args": ["--config=<file>"] </code></td>
        </tr>
        <tr>
            <td>flake8.cwd</td>
            <td><code>${workspaceFolder}</code></td>
            <td>Sets the current working directory used to lint Python files with Flake8. By default, it uses the root directory of the workspace <code>${workspaceFolder}</code>. You can set it to <code>${fileDirname}</code> to use the parent folder of the file being linted as the working directory for Flake8.</td>
        </tr>
        <tr>
            <td>flake8.severity</td>
            <td><code>{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "info": "Information" }</code></td>
            <td>Mapping of Flake8's message types to VS Code's diagnostic severity levels as displayed in the Problems window. You can also use it to override specific Flake8 error codes. <br> Example: <code>{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "W0611": "Error", "undefined-variable": "Warning" }</code></td>
        </tr>
        <tr>
            <td>flake8.path</td>
            <td><code>[]</code></td>
            <td>"Path or command to be used by the extension to lint Python files with Flake8. Accepts an array of a single or multiple strings. If passing a command, each argument should be provided as a separate string in the array. If set to <code>["flake8"]</code>, it will use the version of Flake8 available in the PATH environment variable. <br> Note: Using this option may slowdown linting. <br>Examples: <br>- <code>"flake8.path" : ["~/global_env/flake8"]</code> <br>- <code>"flake8.path" : ["conda", "run", "-n", "lint_env", "python", "-m", "flake8"]</code> <br>- <code>"flake8.path" : ["flake8"]</code> <br>- <code>"flake8.path" : ["${interpreter}", "-m", "flake8"]</code></td>
        </tr>
        <tr>
            <td>flake8.interpreter</td>
            <td><code>[]</code></td>
            <td>Path to a Python executable or a command that will be used to launch the Flake8 server and any subprocess. Accepts an array of a single or multiple strings. When set to <code>[]</code>, the extension will use the path to the selected Python interpreter. If passing a command, each argument should be provided as a separate string in the array.</td>
        </tr>
        <tr>
            <td>flake8.importStrategy</td>
            <td><code>useBundled</code></td>
            <td>Defines which Flake8 binary to be used to lint Python files. When set to useBundled, the extension will use the Flake8 binary that is shipped with the extension. When set to fromEnvironment, the extension will attempt to use the Flake8 binary and all dependencies that are available in the currently selected environment. <br> Note: If the extension can't find a valid Flake8 binary in the selected environment, it will fallback to using the Flake8 binary that is shipped with the extension. This setting will be overriden if <code>flake8.path</code> is set.</td>
        </tr>
        <tr>
            <td>flake8.showNotification</td>
            <td><code>off</code></td>
            <td>Controls when notifications are shown by this extension. Accepted values are onError, onWarning, always and off.</td>
        </tr>
        <tr>
            <td>flake8.ignorePatterns</td>
            <td><code>[]</code></td>
            <td>Configure [glob patterns](https://docs.python.org/3/library/fnmatch.html) as supported by the fnmatch Python library to exclude files or folders from being linted with Flake8.</td>
        <tr>
            <td>flake8.enabled</td>
            <td><code>true</code></td>
            <td>Specifies whether to enable or disable linting Python files using Flake8. This setting can be applied globally or at the workspace level. If disabled, the linting server itself will continue to be active and monitor read and write events, but it won't perform linting or expose Code Actions. </td>
        </tr>
    </tbody>
</table>

The following variables are supported for substitution in the `flake8.args`, `flake8.cwd`, `flake8.path`, `flake8.interpreter` and `flake8.ignorePatterns` settings:

-   `${workspaceFolder}`
-   `${workspaceFolder:FolderName}`
-   `${userHome}`
-   `${env:EnvVarName}`

The `flake8.path` setting also supports the `${interpreter}` variable as one of the entries of the array. This variable is subtituted based on the value of the `flake8.interpreter` setting.

## Commands

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| Flake8: Restart Server | Force re-start the linter server. |

## Logging

From the Command Palette (**View** > **Command Palette ...**), run the **Developer: Set Log Level...** command. Select **Flake8** from the **Extension logs** group. Then select the log level you want to set.

Alternatively, you can set the `flake8.trace.server` setting to `verbose` to get more detailed logs from the Flake8 server. This can be helpful when filing bug reports.

To open the logs, click on the language status icon (`{}`) on the bottom right of the Status bar, next to the Python language mode. Locate the **Flake8** entry and select **Open logs**.

## Troubleshooting

In this section, you will find some common issues you might encounter and how to resolve them. If you are experiencing any issues that are not covered here, please [file an issue](https://github.com/microsoft/vscode-flake8/issues).

-   If the `flake8.importStrategy` setting is set to `fromEnvironment` but Flake8 is not found in the selected environment, this extension will fallback to using the Flake8 binary that is shipped with the extension. However, if there are dependencies installed in the environment, those dependencies will be used along with the shipped Flake8 binary. This can lead to problems if the dependencies are not compatible with the shipped Flake8 binary.

    To resolve this issue, you can:

    -   Set the `flake8.importStrategy` setting to `useBundled` and the `flake8.path` setting to point to the custom binary of Flake8 you want to use; or
    -   Install Flake8 in the selected environment.
