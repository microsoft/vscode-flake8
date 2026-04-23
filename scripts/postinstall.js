// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Builds the shared package's TypeScript dist/ after npm install.
// Skips gracefully when the submodule is not initialized.

"use strict";

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const tsconfig = path.join(
    "submodules",
    "vscode-common-python-lsp",
    "typescript",
    "tsconfig.json",
);

if (fs.existsSync(tsconfig)) {
    console.log("Building shared package (vscode-common-python-lsp)...");
    execSync(`npx tsc -p ${tsconfig}`, { stdio: "inherit" });
} else {
    console.warn(
        "⚠ Shared package submodule not initialized. Run:\n" +
            "  git submodule update --init",
    );
}
