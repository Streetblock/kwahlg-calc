(function exposeKwahlgCalcLibrary(globalScope) {
    let api;

    if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
        api = {
            ...require('../../js/math/Allocators'),
            ...require('../../js/math/NrwCalculator'),
            ...require('../../js/math/CommitteeCalculator')
        };
        module.exports = api;
    } else {
        api = {
            SainteLagueAllocator,
            DHondtAllocator,
            HareNiemeyerAllocator,
            NrwKWahlGCalculator,
            CommitteeCalculator
        };
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
