# Flake8 extension for Visual Studio Code 

A Visual Studio Code extension with support for the Flake8 linter. The extension ships with `flake8==7.3.0`.

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

## Development

This extension bundles the shared [`vscode-common-python-lsp`](https://github.com/microsoft/vscode-common-python-lsp) library as a git submodule at `external/vscode-common-python-lsp`. The submodule must be initialized before installing dependencies, because `npm install` builds the shared library from it.

When cloning the repository, pull the submodule at the same time:

```bash
git clone --recurse-submodules https://github.com/microsoft/vscode-flake8.git
```

If you already cloned without `--recurse-submodules`, initialize (or update) the submodule from the repository root:

```bash
git submodule update --init --recursive
```

Then choose the appropriate local package-feed setup below.

### Local package feeds

Use Node.js supported by this repository and Python 3.10 or later. Both setup commands create or reuse `.venv` and install the Python bundling tools. Choose the appropriate setup below before installing dependencies. Committed lockfiles use public npm URLs; Microsoft setup rewrites working copies for proxy installs.

#### Public contributors (non-Microsoft employees)

Use the public setup, which selects `https://registry.npmjs.org/` and `https://pypi.org/simple/` for its child processes. No Microsoft account or internal-feed credentials are needed, and this command works before `node_modules` exists:

From the repository root:

```bash
npm run setup
```

For subsequent npm installs, use `npm ci`. Public contributors do not need the Microsoft feed commands or lockfile hook.

#### Microsoft employees only

> **Microsoft users only:** The commands in this section configure Microsoft package feeds. Public contributors should use the public setup above.

Use the Microsoft setup, which selects `https://packagefeedproxy.microsoft.io/npm/` and `https://packagefeedproxy.microsoft.io/pypi/simple/` for its child processes:

```bash
npm run setup:msft
```

Microsoft setup initializes submodules, then rewrites public npm and Yarn `resolved` URLs in the root and shared TypeScript `package-lock.json` files to the npm proxy before running `npm ci`. Versions, integrity hashes, formatting, and private-feed URLs are preserved. The public setup leaves lockfiles unchanged.

After pulling a new lockfile from GitHub, rerun `npm run setup:msft`, or run the dependency-free rewrite step alone before your next install/build:

```bash
npm run setup:msft-registry
```

The standalone step requires the submodule to be initialized and both lockfiles to exist. Rewriting is idempotent and stops on missing or invalid lockfiles. Keep committed lockfile URLs public using the optional pre-commit hook below (or `npm run normalize-lockfile` for the root lockfile). The shared lockfile belongs to the submodule; do not commit its local proxy URL changes.

For subsequent root npm installs, use:

```bash
npm run ci:msft
```

This rewrites both lockfiles, then runs root `npm ci` with the proxy registry explicitly selected for package, audit, and metadata requests. It requires the submodule to be initialized; use `npm run setup:msft` for full setup, including the shared package and Python dependencies.

Local setup, lockfile rewriting, and `ci:msft` share the feed URLs in `build/package-feeds.json`.

Both setup commands use the same implementation, stop on errors, and keep registry overrides scoped to setup's child processes; they do not change your shell environment, edit `.npmrc`, or add credentials. The standalone rewrite step only edits lockfiles; it does not configure the registry for subsequent commands.

After setup, run `npm run compile` to build the extension. For subsequent Python commands, use `.venv\Scripts\python.exe` on Windows or `.venv/bin/python` on macOS/Linux (or activate that virtual environment). Registry overrides are not retained after setup.

#### Microsoft contributor pre-commit hook

If you use the Microsoft feeds and will commit changes, enable the recommended lockfile hook once per clone (no installed npm dependencies are required). It is not needed just to install or build:

```bash
npm run setup-hooks
```

The installer sets the clone's local `core.hooksPath` to `.githooks`, which also affects its linked worktrees. It refuses to replace an existing hook or a different hooks configuration. If you already use hooks, add `node build/normalize-package-lock.js --staged` to your existing pre-commit hook instead. Only enable this configuration in worktrees/branches that contain these hook files.

Before a local commit, the hook converts known `Pylance_PublicPackages`, `packagefeedproxy.microsoft.io/npm/`, and named `1es-public/npm-public` mirror tarball URLs in the staged root `package-lock.json` to public npm URLs. It preserves versions, integrity hashes, formatting, and intentional Azure-hosted dependencies such as `msft_consumption`. Unknown feeds are left unchanged. It re-stages only the lockfile; if normalization is needed and the lockfile has unstaged changes, the commit is blocked without modifying it. Stage or stash those changes, then retry.

To normalize manually, run `npm run normalize-lockfile`, review the changes, and stage them. To disable the installed hook, run `git config --local --unset core.hooksPath`. These are local Git hooks: GitHub and Dependabot do not execute them. No workflow writes changes to PR branches.

### GitHub Actions package feeds

The PR and push workflows set `PIP_INDEX_URL` to `https://packagefeedproxy.microsoft.io/pypi/simple/` for pip and nox installs. Their Node installation steps select `https://packagefeedproxy.microsoft.io/npm/` explicitly through `npm run ci:msft`, so these workflows do not set `NPM_CONFIG_REGISTRY`. CodeQL retains both environment variables because its autobuild step does not use the install helper. The npm endpoint follows the [TypeScript CI package-feed-proxy job](https://github.com/microsoft/TypeScript/blob/main/.github/workflows/ci.yml).

The shared lint and VSIX build actions and applicable PR/push test jobs use `npm run ci:msft`, rewriting working-copy lockfile URLs before installation and explicitly selecting the proxy for npm requests. Workflows do not commit these rewrites or change local registry configuration or Dependabot configuration. Existing dependency caches are retained; the VSIX build also retains its offline-cache preference. CodeQL retains workflow-level feed settings for its autobuild step.

### Azure release package feeds

The DevDiv Azure stable/prerelease pipelines pass the npm proxy to their build/publish templates using `customNPMRegistry`. After initializing submodules, their dependency install steps use `npm run ci:msft` to rewrite both npm lockfiles and install through the proxy.

Each Python bootstrap and bundled-library install step explicitly sets `PIP_INDEX_URL` from `PIP_PROXY_INDEX_URL`, selecting the pip proxy even when a template's authentication setup changes the job-level index. Release triggers, approval gates, signing, and publishing behavior are unchanged.

Dependabot continues to use public registries and its existing update settings. Legacy Azure stable, prerelease, and validation definitions are unchanged.
