(function exposeKwahlgCalcLibrary(globalScope) {
    const api = {
        SainteLagueAllocator,
        DHondtAllocator,
        HareNiemeyerAllocator,
        NrwKWahlGCalculator,
        CommitteeCalculator
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
