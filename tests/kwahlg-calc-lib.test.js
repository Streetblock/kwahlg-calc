const assert = require('node:assert/strict');

const { loadKwahlgCalcLib } = require('./helpers/loadMathClasses');

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
    }
];
