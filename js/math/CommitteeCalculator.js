class CommitteeCalculator {
    constructor(options = {}) {
        this.hareAllocator = options.hareAllocator || new HareNiemeyerAllocator();
        this.dhondtAllocator = options.dhondtAllocator || new DHondtAllocator();
    }

    buildCalculationContext(councilResults, factionAlliances, manualVotes) {
        const assignedFactionIds = new Set((factionAlliances || []).flatMap((alliance) => alliance.memberIds));
        const unassignedMembers = (councilResults || []).filter((member) => member.seats > 0 && !assignedFactionIds.has(member.id));
        const individualMembers = unassignedMembers.filter((member) => (manualVotes[member.id] || 0) < 2);

        const calculationBasis = [];

        (factionAlliances || []).forEach((alliance, index) => {
            const totalVotesForAlliance = alliance.memberIds.reduce((sum, id) => sum + (manualVotes[id] || 0), 0);
            if (totalVotesForAlliance <= 0) {
                return;
            }

            calculationBasis.push({
                id: `zg-${index}`,
                abbreviation: alliance.name,
                votes: totalVotesForAlliance,
                seatsInCouncil: alliance.totalSitze,
                color: alliance.color || '#6c757d',
                sourceMemberIds: [...alliance.memberIds]
            });
        });

        unassignedMembers.forEach((member) => {
            const memberVotes = manualVotes[member.id] || 0;
            if (memberVotes < 2) {
                return;
            }

            calculationBasis.push({
                id: member.id,
                abbreviation: member.abbreviation,
                votes: memberVotes,
                seatsInCouncil: member.seats,
                color: member.color
            });
        });

        const totalVotes = calculationBasis.reduce((sum, basis) => sum + basis.votes, 0);

        return {
            calculationBasis,
            individualMembers,
            totalVotes
        };
    }

    calculate(options) {
        const {
            committeeSizes,
            councilResults,
            factionAlliances,
            manualVotes,
            mode = 'hare'
        } = options;

        const context = this.buildCalculationContext(councilResults, factionAlliances, manualVotes);
        const allocator = mode === 'dhondt' ? this.dhondtAllocator : this.hareAllocator;
        const results = {};
        const protocolEntries = [];

        committeeSizes.forEach((size) => {
            if (context.totalVotes > 0) {
                const result = allocator.calculate(context.calculationBasis, size, context.totalVotes);
                results[size] = result;

                if (mode === 'dhondt') {
                    protocolEntries.push({
                        type: 'committee-size-protocol',
                        committeeSize: size,
                        entries: result.protocolEntries || []
                    });
                }
            } else {
                results[size] = { partyResults: [], tieInfo: null, lotteryInfos: [], protocolEntries: [] };

                if (mode === 'dhondt') {
                    protocolEntries.push({
                        type: 'committee-size-protocol',
                        committeeSize: size,
                        entries: [
                            {
                                type: 'heading',
                                level: 6,
                                text: `Protokoll für ${size} Sitze`
                            },
                            {
                                type: 'paragraph',
                                text: 'Keine Stimmen für die Berechnung vorhanden.'
                            }
                        ]
                    });
                }
            }
        });

        return {
            ...context,
            mode,
            results,
            displayMode: mode === 'dhondt' ? 'protocol' : 'table',
            title: mode === 'dhondt' ? "Ergebnis der Zugriffs-Reihenfolge (D'Hondt)" : 'Ergebnis der Ausschuss-Sitzverteilung',
            protocolEntries
        };
    }
}
