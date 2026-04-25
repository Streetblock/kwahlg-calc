const fs = require('fs');
const path = require('path');
const vm = require('vm');

const workspaceRoot = path.resolve(__dirname, '..', '..');

function loadScript(filePath, exportsExpression, context) {
    const source = fs.readFileSync(filePath, 'utf8');
    const wrappedSource = `${source}\nthis.__testExports = ${exportsExpression};`;
    vm.runInContext(wrappedSource, context, { filename: filePath });
    const exported = context.__testExports;
    delete context.__testExports;
    return exported;
}

function createMathContext() {
    const context = {
        console,
        JSON,
        Math
    };
    vm.createContext(context);
    return context;
}

function loadAllocators() {
    const { context, ...library } = loadKwahlgCalcLib();
    const {
        SainteLagueAllocator,
        DHondtAllocator,
        HareNiemeyerAllocator
    } = library;

    return {
        SainteLagueAllocator,
        DHondtAllocator,
        HareNiemeyerAllocator,
        context
    };
}

function loadNrwCalculator() {
    return loadKwahlgCalcLib();
}

function loadCommitteeCalculator() {
    return loadKwahlgCalcLib();
}

function loadKwahlgCalcLib() {
    const context = createMathContext();
    const mathFiles = [
        path.join(workspaceRoot, 'js', 'math', 'Allocators.js'),
        path.join(workspaceRoot, 'js', 'math', 'NrwCalculator.js'),
        path.join(workspaceRoot, 'js', 'math', 'CommitteeCalculator.js')
    ];

    mathFiles.forEach((filePath) => {
        const source = fs.readFileSync(filePath, 'utf8');
        vm.runInContext(source, context, { filename: filePath });
    });

    const entrypointPath = path.join(workspaceRoot, 'lib', 'kwahlg-calc', 'index.js');
    const library = loadScript(entrypointPath, 'KWahlGCalcLib', context);

    return { ...library, context };
}

module.exports = {
    loadAllocators,
    loadNrwCalculator,
    loadCommitteeCalculator,
    loadKwahlgCalcLib
};
