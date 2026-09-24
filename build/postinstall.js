// Builds the shared package that lives in the git submodule after install.
//
// Note: a clone made without `--recurse-submodules` actually fails earlier,
// when npm resolves the `file:` dependency during the install phase, before
// this postinstall script runs.
const { existsSync } = require('fs');
const { execSync } = require('child_process');

const pkgDir = 'external/vscode-common-python-lsp/typescript';

if (!existsSync(`${pkgDir}/package.json`)) {
    console.warn(
        `[postinstall] Shared package submodule not found at "${pkgDir}". ` +
            'Run `git submodule update --init --recursive` and reinstall to build it.',
    );
    process.exit(0);
}

// Already built (e.g. by a prior install or the packaging pipeline); nothing to do.
if (existsSync(`${pkgDir}/dist/index.js`)) {
    process.exit(0);
}

// TypeScript may be installed in the root node_modules when npm can hoist the
// submodule's version. Resolve from the package directory so both layouts work.
try {
    require.resolve('typescript/bin/tsc', { paths: [pkgDir] });
} catch {
    console.warn(
        `[postinstall] TypeScript toolchain not installed for "${pkgDir}"; ` +
            'skipping the shared package build. Run `npm ci` from the repository root ' +
            'before building the extension.',
    );
    process.exit(0);
}

execSync(`npm --prefix ${pkgDir} run build`, { stdio: 'inherit' });
