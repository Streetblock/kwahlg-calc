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
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Keine Überhangmandate nach initialer Verteilung.'));
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
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'A hat 1 Überhangmandat(e).'));
            assert.ok(result.protocolEntries.some((entry) => entry.text === 'Die Gesamtzahl der Sitze wird für den Ausgleich auf 8 erhöht.'));
        }
    }
];
