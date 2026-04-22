const assert = require('node:assert/strict');

const { loadNrwCalculator } = require('./helpers/loadMathClasses');

const { SainteLagueAllocator, NrwKWahlGCalculator } = loadNrwCalculator();

function createCalculator() {
    return new NrwKWahlGCalculator(new SainteLagueAllocator());
}

module.exports = [
    {
        name: 'NrwKWahlGCalculator keeps the initial Sainte-Lague allocation when there is no overhang',
        run() {
            const calculator = createCalculator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 600, directMandates: 2, isListApproved: true, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 400, directMandates: 0, isListApproved: true, tempSortKey: 'B' }
            ];

            const result = calculator.calculate(parties, 5, 1000, {});

            assert.deepEqual(
                result.allocatedParties.map((party) => [party.id, party.seats, party.directMandatesAwarded, party.listSeatsAwarded]),
                [['a', 3, 2, 1], ['b', 2, 0, 2]]
            );
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Keine \u00dcberhangmandate nach initialer Verteilung.'));
        }
    },
    {
        name: 'NrwKWahlGCalculator increases total seats when overhang mandates require compensation',
        run() {
            const calculator = createCalculator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 510, directMandates: 4, isListApproved: true, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 490, directMandates: 0, isListApproved: true, tempSortKey: 'B' }
            ];

            const result = calculator.calculate(parties, 5, 1000, {});

            assert.deepEqual(
                result.allocatedParties.map((party) => [party.id, party.seats]),
                [['a', 4], ['b', 4]]
            );
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'A hat 1 \u00dcberhangmandat(e).'));
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Die Gesamtzahl der Sitze wird f\u00fcr den Ausgleich auf 8 erh\u00f6ht.'));
        }
    },
    {
        name: 'NrwKWahlGCalculator keeps parties without list approval outside the proportional allocation',
        run() {
            const calculator = createCalculator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 60, directMandates: 2, isListApproved: true, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 40, directMandates: 0, isListApproved: true, tempSortKey: 'B' },
                { id: 'c', abbreviation: 'C', color: '#333333', votes: 30, directMandates: 1, isListApproved: false, tempSortKey: 'C' }
            ];

            const result = calculator.calculate(parties, 5, 100, {});

            assert.deepEqual(
                result.allocatedParties.map((party) => [party.id, party.seats, party.directMandatesAwarded, party.listSeatsAwarded]),
                [['a', 2, 2, 0], ['b', 2, 0, 2], ['c', 1, 1, 0]]
            );
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Direktmandate nicht im Verh\u00e4ltnisausgleich: 1'));
        }
    },
    {
        name: 'NrwKWahlGCalculator falls back to direct mandates when no approved lists participate',
        run() {
            const calculator = createCalculator();
            const parties = [
                { id: 'c', abbreviation: 'C', color: '#333333', votes: 30, directMandates: 2, isListApproved: false, tempSortKey: 'C' },
                { id: 'd', abbreviation: 'D', color: '#444444', votes: 20, directMandates: 1, isListApproved: false, tempSortKey: 'D' }
            ];

            const result = calculator.calculate(parties, 5, 0, {});

            assert.deepEqual(
                result.allocatedParties.map((party) => [party.id, party.seats]),
                [['c', 2], ['d', 1]]
            );
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Keine Parteien/Stimmen f\u00fcr Verh\u00e4ltnisausgleich. Nur Direktmandate werden vergeben.'));
        }
    }
];
