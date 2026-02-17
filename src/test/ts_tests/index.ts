// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as glob from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
    });

    const testsRoot = path.resolve(__dirname, './tests');

    return new Promise((c, e) => {
        // Use any cast to work around type incompatibilities with new glob
        // versions
        const files = glob.sync('**/**.test.js', { cwd: testsRoot });

        // Add files to the test suite
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
            // Run the mocha test
            mocha.run((failures: number) => {
                if (failures > 0) {
                    e(new Error(`${failures} tests failed.`));
                } else {
                    c();
                }
            });
        } catch (err) {
            console.error(err);
            e(err);
        }
    });
}
