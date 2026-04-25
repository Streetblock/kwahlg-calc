(function exposeKwahlgCalcLibrary(globalScope) {
    const REQUIRED_EXPORTS = [
        'SainteLagueAllocator',
        'DHondtAllocator',
        'HareNiemeyerAllocator',
        'NrwKWahlGCalculator',
        'CommitteeCalculator'
    ];

    function createPublicApi(source, environmentLabel) {
        const api = {};
        const missingExports = [];

        REQUIRED_EXPORTS.forEach((exportName) => {
            if (typeof source[exportName] === 'function') {
                api[exportName] = source[exportName];
            } else {
                missingExports.push(exportName);
            }
        });

        if (missingExports.length > 0) {
            throw new Error(
                `KWahlGCalcLib could not initialize in ${environmentLabel}. ` +
                `Missing exports: ${missingExports.join(', ')}.`
            );
        }

        return api;
    }

    let api;

    if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
        api = createPublicApi({
            ...require('../../js/math/Allocators'),
            ...require('../../js/math/NrwCalculator'),
            ...require('../../js/math/CommitteeCalculator')
        }, 'Node/CommonJS');
        module.exports = api;
    } else {
        api = createPublicApi({
            SainteLagueAllocator: typeof SainteLagueAllocator === 'function' ? SainteLagueAllocator : globalScope.SainteLagueAllocator,
            DHondtAllocator: typeof DHondtAllocator === 'function' ? DHondtAllocator : globalScope.DHondtAllocator,
            HareNiemeyerAllocator: typeof HareNiemeyerAllocator === 'function' ? HareNiemeyerAllocator : globalScope.HareNiemeyerAllocator,
            NrwKWahlGCalculator: typeof NrwKWahlGCalculator === 'function' ? NrwKWahlGCalculator : globalScope.NrwKWahlGCalculator,
            CommitteeCalculator: typeof CommitteeCalculator === 'function' ? CommitteeCalculator : globalScope.CommitteeCalculator
        }, 'browser globals');
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
