# Flake8 extension for Visual Studio Code

A Visual Studio Code extension with support for the `flake8` linter. The extension ships with `flake8=6.1.0`.

Note:

-   This extension is supported for all [actively supported versions](https://devguide.python.org/#status-of-python-branches) of the `python` language (i.e., python >= 3.8).
-   Minimum supported version of `flake8` is `5.0.0`.

## Usage

Once installed in Visual Studio Code, flake8 will be automatically executed when you open a Python file.

If you want to disable flake8, you can [disable this extension](https://code.visualstudio.com/docs/editor/extension-marketplace#_disable-an-extension) per workspace in Visual Studio Code.

## Settings

| Settings                | Default                                                                                                                                | Description                                                                                                                                                                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| flake8.args             | `[]`                                                                                                                                   | Custom arguments passed to `flake8`. E.g `"flake8.args" = ["--config=<file>"]`                                                                                                                                                                                                                                           |
| flake8.cwd              | `${workspaceFolder}`                                                                                                                   | This setting specifies the working directory for `flake8`. By default, it uses the root directory of the workspace `${workspaceFolder}`. If you want `flake8` to operate within the directory of the file currently being linted, you can set this to `${fileDirname}`.                                                  |
| flake8.severity         | `{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "info": "Information" }` | Controls mapping of severity from `flake8` to VS Code severity when displaying in the problems window. You can override specific `flake8` error codes `{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "W0611": "Error", "undefined-variable": "Warning" }` |
| flake8.logLevel         | `error`                                                                                                                                | Sets the tracing level for the extension.                                                                                                                                                                                                                                                                                |
| flake8.path             | `[]`                                                                                                                                   | Setting to provide custom `flake8` executable. This will slow down linting, since we will have to run `flake8` executable every time or file save or open. Example 1: `["~/global_env/flake8"]` Example 2: `["conda", "run", "-n", "lint_env", "python", "-m", "flake8"]`                                                |
| flake8.interpreter      | `[]`                                                                                                                                   | Path to a python interpreter to use to run the linter server. When set to `[]`, the interpreter for the workspace is obtained from `ms-python.python` extension. If set to some path, that path takes precedence, and the Python extension is not queried for the interpreter.                                           |
| flake8.importStrategy   | `useBundled`                                                                                                                           | Setting to choose where to load `flake8` from. `useBundled` picks flake8 bundled with the extension. `fromEnvironment` uses `flake8` available in the environment.                                                                                                                                                       |
| flake8.showNotification | `off`                                                                                                                                  | Setting to control when a notification is shown.                                                                                                                                                                                                                                                                         |
| flake8.ignorePatterns   | `[]`                                                                                                                                   | Glob patterns used to exclude files and directories from being linted.                                                                                                                                                                                                                                                   |

## Commands

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| Flake8: Restart Server | Force re-start the linter server. |
