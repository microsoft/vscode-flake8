# Flake8 extension for Visual Studio Code

A Visual Studio Code extension with support for the `flake8` linter. The extension ships with `flake8=5.0.4`.

Note:

-   This extension is supported for all [actively supported versions](https://devguide.python.org/#status-of-python-branches) of the `python` language (i.e., python >= 3.7).
-   The bundled `flake8` is only used if there is no installed version of `flake8` found in the selected `python` environment.
-   Minimum supported version of `flake8` is `5.0.0`.

## Usage

Once installed in Visual Studio Code, flake8 will be automatically executed when you open a Python file.

If you want to disable flake8, you can [disable this extension](https://code.visualstudio.com/docs/editor/extension-marketplace#_disable-an-extension) per workspace in Visual Studio Code.

## Configuration
`flake8` can be configured with either a `pyproject.toml` or [`.flake8`](https://flake8.pycqa.org/en/latest/user/configuration.html) file. `flake8` will first check for the configuration file in the root directory, first checking the `pyproject.toml`, before checking the `.flake8` file. You can specify a custom location using the flake8.args as either `--toml-config=/path/to/pyproject.toml` or `--config=/path/to/.flake8`. While flake8 does not natively support the pyproject.toml, support is provided by the [flake8-pyproject](https://pypi.org/project/Flake8-pyproject/) plugin included in the extension.

The following is an example configuration for `flake8` in a `pyproject.toml` file.
We recommend using the `pyproject.toml` format which can be used to configure all of your extensions.
```toml
[tool.flake8]
# Check that this is aligned with your other tools like Black
max-line-length = 120

exclude = [
    # No need to traverse our git directory
    ".git",
    # There's no value in checking cache directories
    "__pycache__"
]

# Use extend-ignore to add to already ignored checks which are anti-patterns like W503.
extend-ignore = [
    # PEP 8 recommends to treat : in slices as a binary operator with the lowest priority, and to leave an equal
    # amount of space on either side, except if a parameter is omitted (e.g. ham[1 + 1 :]).
    # This behaviour may raise E203 whitespace before ':' warnings in style guide enforcement tools like Flake8.
    # Since E203 is not PEP 8 compliant, we tell Flake8 to ignore this warning.
    # https://black.readthedocs.io/en/stable/the_black_code_style/current_style.html#slices    
    "E203"
]
```

## Settings

| Settings                | Default                                                                                                                                | Description                                                                                                                                                                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| flake8.args             | `[]`                                                                                                                                   | Custom arguments passed to `flake8`. E.g `"flake8.args" = ["--config=<file>"]`                                                                                                                                                                                                                                           |
| flake8.severity         | `{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "info": "Information" }` | Controls mapping of severity from `flake8` to VS Code severity when displaying in the problems window. You can override specific `flake8` error codes `{ "convention": "Information", "error": "Error", "fatal": "Error", "refactor": "Hint", "warning": "Warning", "W0611": "Error", "undefined-variable": "Warning" }` |
| flake8.logLevel         | `error`                                                                                                                                | Sets the tracing level for the extension.                                                                                                                                                                                                                                                                                |
| flake8.path             | `[]`                                                                                                                                   | Setting to provide custom `flake8` executable. This will slow down linting, since we will have to run `flake8` executable every time or file save or open. Example 1: `["~/global_env/flake8"]` Example 2: `["conda", "run", "-n", "lint_env", "python", "-m", "flake8"]`                                                |
| flake8.interpreter      | `[]`                                                                                                                                   | Path to a python interpreter to use to run the linter server.                                                                                                                                                                                                                                                            |
| flake8.importStrategy   | `useBundled`                                                                                                                           | Setting to choose where to load `flake8` from. `useBundled` picks flake8 bundled with the extension. `fromEnvironment` uses `flake8` available in the environment.                                                                                                                                                       |
| flake8.showNotification | `off`                                                                                                                                  | Setting to control when a notification is shown.                                                                                                                                                                                                                                                                         |

## Commands

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| Flake8: Restart Server | Force re-start the linter server. |
