const assert = require('node:assert/strict');

const { loadCommitteeCalculator } = require('./helpers/loadMathClasses');

const { CommitteeCalculator } = loadCommitteeCalculator();

function normalize(value) {
    return JSON.parse(JSON.stringify(value));
}

module.exports = [
    {
        name: 'CommitteeCalculator excludes individual members below the 2-vote threshold from the calculation basis',
        run() {
            const calculator = new CommitteeCalculator();
            const councilResults = [
                { id: 'cdu', abbreviation: 'CDU', seats: 20, color: '#000000' },
                { id: 'spd', abbreviation: 'SPD', seats: 15, color: '#eb001f' },
                { id: 'einzel', abbreviation: 'Einzel', seats: 1, color: '#666666' }
            ];
            const manualVotes = { cdu: 20, spd: 15, einzel: 1 };

            const result = calculator.buildCalculationContext(councilResults, [], manualVotes);

            assert.deepEqual(
                normalize(result.calculationBasis.map((entry) => entry.id)),
                ['cdu', 'spd']
            );
            assert.deepEqual(
                normalize(result.individualMembers.map((member) => member.id)),
                ['einzel']
            );
            assert.equal(result.totalVotes, 35);
        }
    },
    {
        name: 'CommitteeCalculator aggregates faction alliances into a single calculation entry',
        run() {
            const calculator = new CommitteeCalculator();
            const councilResults = [
                { id: 'cdu', abbreviation: 'CDU', seats: 20, color: '#000000' },
                { id: 'gruene', abbreviation: 'GRUENE', seats: 8, color: '#64A12D' },
                { id: 'spd', abbreviation: 'SPD', seats: 15, color: '#eb001f' }
            ];
            const factionAlliances = [
                { name: 'CDU + GRUENE', totalSitze: 28, memberIds: ['cdu', 'gruene'], color: 'linear-gradient(#000,#64A12D)' }
            ];
            const manualVotes = { cdu: 20, gruene: 8, spd: 15 };

            const result = calculator.buildCalculationContext(councilResults, factionAlliances, manualVotes);

            assert.deepEqual(
                normalize(result.calculationBasis.map((entry) => [entry.id, entry.abbreviation, entry.votes, entry.seatsInCouncil])),
                [['zg-0', 'CDU + GRUENE', 28, 28], ['spd', 'SPD', 15, 15]]
            );
            assert.equal(result.totalVotes, 43);
        }
    },
    {
        name: "CommitteeCalculator returns protocol rendering data for D'Hondt committee access order",
        run() {
            const calculator = new CommitteeCalculator();
            const councilResults = [
                { id: 'cdu', abbreviation: 'CDU', seats: 20, color: '#000000' },
                { id: 'spd', abbreviation: 'SPD', seats: 15, color: '#eb001f' }
            ];
            const manualVotes = { cdu: 20, spd: 15 };

            const result = calculator.calculate({
                committeeSizes: [5, 7],
                councilResults,
                factionAlliances: [],
                manualVotes,
                mode: 'dhondt'
            });

            assert.equal(result.displayMode, 'protocol');
            assert.equal(result.title, "Ergebnis der Zugriffs-Reihenfolge (D'Hondt)");
            assert.ok(result.protocolHtml.includes("D'Hondt"));
            assert.ok(result.results[5]);
            assert.ok(result.results[7]);
        }
    }
];
