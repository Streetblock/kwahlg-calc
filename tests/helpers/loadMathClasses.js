const path = require('path');
const vm = require('vm');

const workspaceRoot = path.resolve(__dirname, '..', '..');

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
    const packagePath = path.join(workspaceRoot, 'lib', 'kwahlg-calc');
    delete require.cache[require.resolve(packagePath)];
    const library = require(packagePath);

    return { ...library, context: createMathContext() };
}

module.exports = {
    loadAllocators,
    loadNrwCalculator,
    loadCommitteeCalculator,
    loadKwahlgCalcLib
};
