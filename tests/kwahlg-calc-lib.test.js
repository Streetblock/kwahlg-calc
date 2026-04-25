const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { loadKwahlgCalcLib } = require('./helpers/loadMathClasses');

const workspaceRoot = path.resolve(__dirname, '..');

function runScriptInContext(relativePath, context) {
    const filePath = path.join(workspaceRoot, relativePath);
    const source = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(source, context, { filename: filePath });
}

module.exports = [
    {
        name: 'KWahlG calculation library exposes the public calculation classes',
        run() {
            const library = loadKwahlgCalcLib();

            assert.equal(typeof library.SainteLagueAllocator, 'function');
            assert.equal(typeof library.DHondtAllocator, 'function');
            assert.equal(typeof library.HareNiemeyerAllocator, 'function');
            assert.equal(typeof library.NrwKWahlGCalculator, 'function');
            assert.equal(typeof library.CommitteeCalculator, 'function');
        }
    },
    {
        name: 'KWahlG calculation library is directly requireable in Node',
        run() {
            const packagePath = path.join(workspaceRoot, 'lib', 'kwahlg-calc');
            delete require.cache[require.resolve(packagePath)];

            const library = require(packagePath);

            assert.equal(typeof library.SainteLagueAllocator, 'function');
            assert.equal(typeof library.NrwKWahlGCalculator, 'function');
            assert.equal(typeof library.CommitteeCalculator, 'function');
        }
    },
    {
        name: 'KWahlG calculation browser bundle exposes globals without CommonJS',
        run() {
            const context = {
                console,
                JSON,
                Math
            };
            context.globalThis = context;
            vm.createContext(context);

            runScriptInContext('lib/kwahlg-calc/dist/kwahlg-calc.umd.js', context);

            assert.equal(typeof context.KWahlGCalcLib.SainteLagueAllocator, 'function');
            assert.equal(typeof context.KWahlGCalcLib.NrwKWahlGCalculator, 'function');
            assert.equal(typeof context.KWahlGCalcLib.CommitteeCalculator, 'function');
        }
    },
    {
        name: 'KWahlG calculation library entrypoint fails clearly when browser prerequisites are missing',
        run() {
            const context = {
                console,
                JSON,
                Math
            };
            context.globalThis = context;
            vm.createContext(context);

            assert.throws(
                () => runScriptInContext('lib/kwahlg-calc/index.js', context),
                /Missing exports: SainteLagueAllocator, DHondtAllocator, HareNiemeyerAllocator, NrwKWahlGCalculator, CommitteeCalculator/
            );
        }
    }
];
