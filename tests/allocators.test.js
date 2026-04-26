const assert = require('node:assert/strict');

const { loadAllocators } = require('./helpers/loadMathClasses');

const { SainteLagueAllocator, DHondtAllocator, HareNiemeyerAllocator, NrwBezirksvertretungAllocator } = loadAllocators();

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
        name: "D'Hondt records automatically resolved ties in the structured protocol",
        run() {
            const allocator = new DHondtAllocator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 100, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 100, tempSortKey: 'B' }
            ];

            const result = allocator.calculate(parties, 3, 200);

            assert.deepEqual(
                result.partyResults.map((party) => [party.id, party.proportionalSeats]),
                [['a', 2], ['b', 1]]
            );
            assert.equal(result.lotteryInfos.length, 2);
            assert.equal(result.protocolEntries[1].type, 'lottery-info-list');
            assert.deepEqual(normalize(result.protocolEntries[1].items[0].partiesInvolved), ['a', 'b']);
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
    },
    {
        name: 'Allocators return the documented contract shape',
        run() {
            const sainte = new SainteLagueAllocator().calculate(sampleParties, 5, 2000);
            const dhondt = new DHondtAllocator().calculate(sampleParties, 5, 2000);
            const hare = new HareNiemeyerAllocator().calculate(sampleParties, 5, 2000);

            [sainte, dhondt, hare].forEach((result) => {
                assert.ok(Array.isArray(result.partyResults));
                assert.ok(Array.isArray(result.protocolEntries));
                assert.ok(Array.isArray(result.lotteryInfos));
                assert.ok(result.tieInfo === null || typeof result.tieInfo === 'object');
                assert.equal(typeof result.partyResults[0].id, 'string');
                assert.equal(typeof result.partyResults[0].proportionalSeats, 'number');
            });

            assert.ok(Array.isArray(dhondt.allocationTable));
        }
    },
    {
        name: 'NrwBezirksvertretungAllocator applies the 2.5% threshold',
        run() {
            const allocator = new NrwBezirksvertretungAllocator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 500, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 300, tempSortKey: 'B' },
                { id: 'c', abbreviation: 'C', color: '#333333', votes: 180, tempSortKey: 'C' },
                { id: 'd', abbreviation: 'D', color: '#444444', votes: 20, tempSortKey: 'D' } // 2%
            ];

            const result = allocator.calculate(parties, 10);

            const seats = Object.fromEntries(result.partyResults.map((party) => [party.id, party.proportionalSeats]));
            assert.equal(seats.d, 0);
            assert.equal(result.totalSeats, 10);
            assert.equal(result.protocolEntries[0].type, 'threshold-summary');
            assert.equal(result.protocolEntries[0].excludedParties[0].id, 'd');
        }
    },
    {
        name: 'NrwBezirksvertretungAllocator increases seats when a 5% list would receive no seat',
        run() {
            const allocator = new NrwBezirksvertretungAllocator();
            const parties = [
                { id: 'a', abbreviation: 'A', color: '#111111', votes: 40, tempSortKey: 'A' },
                { id: 'b', abbreviation: 'B', color: '#222222', votes: 20, tempSortKey: 'B' },
                { id: 'c', abbreviation: 'C', color: '#333333', votes: 14, tempSortKey: 'C' },
                { id: 'd', abbreviation: 'D', color: '#444444', votes: 8, tempSortKey: 'D' },
                { id: 'e', abbreviation: 'E', color: '#555555', votes: 7, tempSortKey: 'E' },
                { id: 'f', abbreviation: 'F', color: '#666666', votes: 6, tempSortKey: 'F' } // > 5%
            ];

            const result = allocator.calculate(parties, 3);
            const seats = Object.fromEntries(result.partyResults.map((party) => [party.id, party.proportionalSeats]));

            assert.ok(result.totalSeats > 3);
            assert.equal(seats.f, 1);
            assert.ok(result.protocolEntries.some((entry) => entry.type === 'seat-increase'));
        }
    }
];
