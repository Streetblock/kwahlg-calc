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
    const context = createMathContext();
    const allocatorsPath = path.join(workspaceRoot, 'js', 'math', 'Allocators.js');
    const exports = loadScript(
        allocatorsPath,
        '{ SainteLagueAllocator, DHondtAllocator, HareNiemeyerAllocator }',
        context
    );

    return { ...exports, context };
}

function loadNrwCalculator() {
    const { context, ...allocators } = loadAllocators();
    const nrwPath = path.join(workspaceRoot, 'js', 'math', 'NrwCalculator.js');
    const { NrwKWahlGCalculator } = loadScript(
        nrwPath,
        '{ NrwKWahlGCalculator }',
        context
    );

    return { ...allocators, NrwKWahlGCalculator };
}

function loadCommitteeCalculator() {
    const { context, ...allocators } = loadAllocators();
    const committeePath = path.join(workspaceRoot, 'js', 'math', 'CommitteeCalculator.js');
    const { CommitteeCalculator } = loadScript(
        committeePath,
        '{ CommitteeCalculator }',
        context
    );

    return { ...allocators, CommitteeCalculator };
}

module.exports = {
    loadAllocators,
    loadNrwCalculator,
    loadCommitteeCalculator
};
