const assert = require('node:assert/strict');

const { loadAllocators } = require('./helpers/loadMathClasses');

const { SainteLagueAllocator, DHondtAllocator, HareNiemeyerAllocator } = loadAllocators();

const sampleParties = [
    { id: 'a', abbreviation: 'A', color: '#111111', votes: 1000, tempSortKey: 'A' },
    { id: 'b', abbreviation: 'B', color: '#222222', votes: 800, tempSortKey: 'B' },
    { id: 'c', abbreviation: 'C', color: '#333333', votes: 200, tempSortKey: 'C' }
];

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

module.exports = [
    {
        name: 'Sainte-Lague returns deterministic seat distribution and exposes unresolved ties',
        run() {
            const allocator = new SainteLagueAllocator();
            const result = allocator.calculate(sampleParties, 5, 2000);

            assert.deepEqual(
                result.partyResults.map((party) => [party.id, party.proportionalSeats]),
                [['a', 2], ['b', 2], ['c', 0]]
            );
            assert.deepEqual(normalize(result.tieInfo), {
                partiesInvolved: ['a', 'c'],
                seatsInContention: 1,
                claimFraction: '1/2'
            });
            assert.equal(result.protocolEntries[0].method, 'sainte-lague');
        }
    },
    {
        name: "D'Hondt allocates all seats without a hard stop in the reference scenario",
        run() {
            const allocator = new DHondtAllocator();
            const result = allocator.calculate(sampleParties, 5, 2000);

            assert.deepEqual(
                result.partyResults.map((party) => [party.id, party.proportionalSeats]),
                [['a', 3], ['b', 2], ['c', 0]]
            );
            assert.equal(result.tieInfo, null);
            assert.equal(result.protocolEntries[0].method, 'dhondt');
        }
    },
    {
        name: 'Hare-Niemeyer reports remainder ties when the final seat cannot be assigned uniquely',
        run() {
            const allocator = new HareNiemeyerAllocator();
            const result = allocator.calculate(sampleParties, 5, 2000);

            assert.deepEqual(
                result.partyResults.map((party) => [party.id, party.proportionalSeats]),
                [['a', 2], ['b', 2], ['c', 0]]
            );
            assert.deepEqual(normalize(result.tieInfo), {
                partiesInvolved: ['a', 'c'],
                seatsInContention: 1,
                claimFraction: '1/2'
            });
            assert.equal(result.protocolEntries[0].type, 'hare-summary');
        }
    }
];
