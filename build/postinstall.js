// Restore and build the pinned shared source, without a registry package alias.
const { existsSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const pkgDir = path.resolve(__dirname, '../external/vscode-common-python-lsp/typescript');

if (!existsSync(`${pkgDir}/package.json`)) {
    console.error(
        `[postinstall] Shared package submodule not found at "${pkgDir}". ` +
            'Run `git submodule update --init --recursive` and reinstall to build it.',
    );
    process.exit(1);
}

execSync('npm ci --ignore-scripts', { cwd: pkgDir, stdio: 'inherit' });
execSync('npm run build', { cwd: pkgDir, stdio: 'inherit' });
