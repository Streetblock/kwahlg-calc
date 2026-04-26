/*!
 * kwahlg-calc browser bundle
 * Generated file. Do not edit directly.
 */

class SainteLagueAllocator {
    /**
     * Returns:
     * - `partyResults`: normalized seat results per party
     * - `protocolEntries`: structured calculation protocol
     * - `lotteryInfos`: resolved lottery metadata
     * - `tieInfo`: unresolved tie information, if present
     */
    calculate(partiesData, totalSeats) {
        const protocolEntries = [];
        const lotteryInfos = [];
        let tieInfo = null;

        const parties = JSON.parse(JSON.stringify(partiesData.map((party) => ({
            ...party,
            seats: 0,
            allocatedByLottery: false,
            potentiallyAffectedByLottery: false,
            nextDivisorOrdinal: 1,
            tempSortKey: party.tempSortKey || party.id
        }))));

        let allocatedSeatsCount = 0;
        if (totalSeats === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo };
        }

        const relevantParties = parties.filter((party) => party.votes > 0);
        if (relevantParties.length === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo };
        }

        const allocationTableData = [];
        let loopGuard = 0;
        const maxLoops = totalSeats * relevantParties.length + 100;

        while (allocatedSeatsCount < totalSeats && loopGuard < maxLoops) {
            loopGuard++;
            let maxQuotient = -1;
            let tiedPartiesForSeat = [];

            relevantParties.forEach((party) => {
                const partyVotes = Number(party.votes) || 0;
                if (partyVotes === 0) return;

                const divisor = (party.nextDivisorOrdinal - 1) + 0.5;
                if (divisor === 0) return;

                const quotient = partyVotes / divisor;
                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    tiedPartiesForSeat = [party];
                } else if (quotient === maxQuotient && maxQuotient >= 0) {
                    tiedPartiesForSeat.push(party);
                }
            });

            if (maxQuotient < 0 || tiedPartiesForSeat.length === 0) {
                break;
            }

            const remainingSeats = totalSeats - allocatedSeatsCount;
            if (tiedPartiesForSeat.length > remainingSeats) {
                tieInfo = {
                    partiesInvolved: tiedPartiesForSeat.map((party) => party.id),
                    seatsInContention: remainingSeats,
                    claimFraction: `${remainingSeats}/${tiedPartiesForSeat.length}`
                };
                break;
            }

            tiedPartiesForSeat.sort((a, b) => String(a.tempSortKey).localeCompare(String(b.tempSortKey)));

            for (const partyToGetSeat of tiedPartiesForSeat) {
                if (allocatedSeatsCount >= totalSeats) break;

                const mainListPartyToUpdate = parties.find((party) => party.id === partyToGetSeat.id);
                if (!mainListPartyToUpdate) continue;

                const divisorForLog = (partyToGetSeat.nextDivisorOrdinal - 1) + 0.5;
                allocationTableData.push({
                    seat: allocatedSeatsCount + 1,
                    party: mainListPartyToUpdate.abbreviation,
                    color: mainListPartyToUpdate.color,
                    votes: mainListPartyToUpdate.votes,
                    divisor: divisorForLog.toFixed(1),
                    quotient: maxQuotient
                });
                mainListPartyToUpdate.seats++;
                partyToGetSeat.nextDivisorOrdinal++;
                allocatedSeatsCount++;
            }
        }

        protocolEntries.push({
            type: 'allocation-table',
            method: 'sainte-lague',
            title: `Sainte-Laguë/Schepers (für ${totalSeats} Sitze)`,
            rows: allocationTableData
        });

        if (tieInfo) {
            protocolEntries.push({
                type: 'tie-note',
                text: `Die Sitzvergabe wurde beim Stand von ${allocatedSeatsCount} Sitzen gestoppt. Für die verbleibenden ${tieInfo.seatsInContention} Sitze besteht ein unauflösbarer Gleichstand zwischen ${tieInfo.partiesInvolved.length} Parteien.`
            });
        }

        return {
            partyResults: parties.map(mapAllocatorPartyResult),
            protocolEntries,
            lotteryInfos,
            tieInfo
        };
    }
}

class DHondtAllocator {
    /**
     * Returns:
     * - `partyResults`: normalized seat results per party
     * - `allocationTable`: detailed seat-by-seat allocation rows
     * - `protocolEntries`: structured calculation protocol
     * - `lotteryInfos`: resolved lottery metadata
     * - `tieInfo`: unresolved tie information, if present
     */
    calculate(partiesData, totalSeats) {
        const protocolEntries = [];
        const parties = JSON.parse(JSON.stringify(partiesData.map((party) => ({
            ...party,
            seats: 0,
            allocatedByLottery: false,
            potentiallyAffectedByLottery: false,
            tempSortKey: party.tempSortKey || party.id
        }))));
        let allocatedSeatsCount = 0;
        const allocationTableData = [];
        const lotteryInfos = [];
        let tieInfo = null;

        if (totalSeats === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo, allocationTable: [] };
        }

        const relevantParties = parties.filter((party) => party.votes > 0);
        if (relevantParties.length === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo, allocationTable: [] };
        }

        let loopGuard = 0;
        const maxLoops = totalSeats * relevantParties.length + 100;

        while (allocatedSeatsCount < totalSeats && loopGuard < maxLoops) {
            loopGuard++;
            let maxQuotient = -1;
            let tiedPartiesForSeat = [];

            relevantParties.forEach((party) => {
                const divisor = party.seats + 1;
                const quotient = party.votes / divisor;

                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    tiedPartiesForSeat = [party];
                } else if (quotient === maxQuotient && maxQuotient > -1) {
                    tiedPartiesForSeat.push(party);
                }
            });

            if (maxQuotient <= 0) break;

            const remainingSeats = totalSeats - allocatedSeatsCount;
            if (remainingSeats <= 0) break;

            if (tiedPartiesForSeat.length > 1) {
                const seatsInContention = Math.min(remainingSeats, tiedPartiesForSeat.length);
                lotteryInfos.push({
                    type: 'auto-resolved tie',
                    partiesInvolved: tiedPartiesForSeat.map((party) => party.id),
                    seatsInContention,
                    firstSeatNumber: allocatedSeatsCount + 1,
                    message: `Gleichstand (Losentscheid) für ${seatsInContention} Sitze (ab Sitz Nr. ${allocatedSeatsCount + 1}) zwischen ${tiedPartiesForSeat.length} Parteien. Automatisch per 'tempSortKey' (z.B. Name) aufgelöst.`
                });
            }

            tiedPartiesForSeat.sort((a, b) => String(a.tempSortKey).localeCompare(String(b.tempSortKey)));

            for (const partyToGetSeat of tiedPartiesForSeat) {
                if (allocatedSeatsCount >= totalSeats) break;

                const mainListPartyToUpdate = parties.find((party) => party.id === partyToGetSeat.id);
                if (!mainListPartyToUpdate) continue;

                allocationTableData.push({
                    seat: allocatedSeatsCount + 1,
                    party: mainListPartyToUpdate.abbreviation,
                    color: mainListPartyToUpdate.color,
                    votes: mainListPartyToUpdate.votes,
                    divisor: mainListPartyToUpdate.seats + 1,
                    quotient: maxQuotient,
                    partyId: mainListPartyToUpdate.id
                });
                mainListPartyToUpdate.seats++;
                allocatedSeatsCount++;
            }
        }

        protocolEntries.push({
            type: 'allocation-table',
            method: 'dhondt',
            title: `D'Hondt (für ${totalSeats} Sitze)`,
            rows: allocationTableData
        });

        if (lotteryInfos.length > 0) {
            protocolEntries.push({
                type: 'lottery-info-list',
                title: 'Protokoll der automatisch aufgelösten Losentscheide',
                items: lotteryInfos.map((info) => ({
                    firstSeatNumber: info.firstSeatNumber,
                    message: info.message,
                    partiesInvolved: info.partiesInvolved
                }))
            });
        }

        return {
            partyResults: parties.map(mapAllocatorPartyResult),
            allocationTable: allocationTableData,
            lotteryInfos,
            tieInfo,
            protocolEntries
        };
    }
}

class HareNiemeyerAllocator {
    /**
     * Returns:
     * - `partyResults`: normalized seat results per party
     * - `protocolEntries`: structured calculation protocol
     * - `lotteryInfos`: resolved lottery metadata
     * - `tieInfo`: unresolved tie information, if present
     */
    calculate(partiesData, totalSeats, totalVotes) {
        const parties = JSON.parse(JSON.stringify(partiesData.map((party) => ({
            ...party,
            seats: 0,
            remainder: 0,
            allocatedByLottery: false,
            potentiallyAffectedByLottery: false,
            tempSortKey: party.tempSortKey || Math.random()
        }))));
        const protocolEntries = [];
        const lotteryInfos = [];
        let tieInfo = null;

        if (totalSeats === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo };
        }

        const relevantParties = parties.filter((party) => party.votes > 0);
        if (totalVotes === 0 || relevantParties.length === 0) {
            return { partyResults: parties.map(mapAllocatorPartyResult), protocolEntries, lotteryInfos, tieInfo };
        }

        const quota = totalVotes / totalSeats;
        let seatsAllocatedSoFar = 0;

        relevantParties.forEach((party) => {
            const idealSeats = party.votes / quota;
            party.seats = Math.floor(idealSeats);
            party.remainder = idealSeats - party.seats;
            seatsAllocatedSoFar += party.seats;
        });

        let remainingSeatsToAllocate = totalSeats - seatsAllocatedSoFar;

        if (remainingSeatsToAllocate > 0) {
            const sortedPartiesForRemainder = [...relevantParties].sort((a, b) => {
                if (b.remainder !== a.remainder) return b.remainder - a.remainder;
                return String(a.tempSortKey).localeCompare(String(b.tempSortKey));
            });

            if (sortedPartiesForRemainder.length > remainingSeatsToAllocate) {
                const cutoffRemainder = sortedPartiesForRemainder[remainingSeatsToAllocate - 1].remainder;
                const nextPartyRemainder = sortedPartiesForRemainder[remainingSeatsToAllocate].remainder;

                if (cutoffRemainder > 0 && cutoffRemainder === nextPartyRemainder) {
                    const partiesInTie = sortedPartiesForRemainder.filter((party) => party.remainder === cutoffRemainder);
                    const partiesWithHigherRemainder = sortedPartiesForRemainder.filter((party) => party.remainder > cutoffRemainder);

                    partiesWithHigherRemainder.forEach((party) => {
                        party.seats++;
                        remainingSeatsToAllocate--;
                    });

                    tieInfo = {
                        partiesInvolved: partiesInTie.map((party) => party.id),
                        seatsInContention: remainingSeatsToAllocate,
                        claimFraction: `${remainingSeatsToAllocate}/${partiesInTie.length}`
                    };

                    remainingSeatsToAllocate = 0;
                }
            }

            let index = 0;
            while (remainingSeatsToAllocate > 0 && sortedPartiesForRemainder.length > 0) {
                const topPartyForRemainder = sortedPartiesForRemainder[index++];
                if (!topPartyForRemainder) break;
                topPartyForRemainder.seats++;
                remainingSeatsToAllocate--;
            }
        }

        relevantParties.forEach((party) => {
            const mainParty = parties.find((entry) => entry.id === party.id);
            if (mainParty) {
                mainParty.seats = party.seats;
            }
        });

        protocolEntries.push({
            type: 'hare-summary',
            title: `Hare-Niemeyer (für ${totalSeats} Sitze)`,
            totalVotes,
            totalSeats,
            quota,
            seatsAllocatedSoFar
        });
        protocolEntries.push({
            type: 'hare-table',
            rows: relevantParties.map((party) => ({
                id: party.id,
                abbreviation: party.abbreviation,
                color: party.color,
                votes: party.votes,
                seats: party.seats,
                remainder: party.remainder
            }))
        });

        if (tieInfo) {
            protocolEntries.push({
                type: 'tie-note',
                text: `Gleichstand für ${tieInfo.seatsInContention} Sitz(e) zwischen ${tieInfo.partiesInvolved.length} Parteien. Vergabe gestoppt.`
            });
        }

        return {
            partyResults: parties.map(mapAllocatorPartyResult),
            protocolEntries,
            lotteryInfos,
            tieInfo
        };
    }
}

class NrwBezirksvertretungAllocator {
    constructor(options = {}) {
        this.baseAllocator = options.baseAllocator || new SainteLagueAllocator();
    }

    /**
     * Applies NRW Bezirksvertretung rules:
     * - 2.5% threshold
     * - Sainte-Lague/Schepers seat allocation
     * - seat increase if a 5% list would otherwise receive no seat
     */
    calculate(partiesData, initialTotalSeats) {
        const parties = JSON.parse(JSON.stringify(partiesData.map((party) => ({
            ...party,
            votes: Number(party.votes) || 0,
            seats: 0
        }))));
        const protocolEntries = [];
        const lotteryInfos = [];
        let tieInfo = null;

        if (initialTotalSeats <= 0) {
            return {
                partyResults: parties.map(mapAllocatorPartyResult),
                protocolEntries,
                lotteryInfos,
                tieInfo,
                totalSeats: 0
            };
        }

        const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);
        if (totalVotes <= 0) {
            protocolEntries.push({
                type: 'paragraph',
                text: 'Keine gueltigen Stimmen vorhanden.'
            });
            return {
                partyResults: parties.map(mapAllocatorPartyResult),
                protocolEntries,
                lotteryInfos,
                tieInfo,
                totalSeats: initialTotalSeats
            };
        }

        parties.forEach((party) => {
            party.voteSharePercent = (party.votes / totalVotes) * 100;
        });

        const eligibleParties = parties
            .filter((party) => party.votes > 0 && party.voteSharePercent >= 2.5)
            .map((party) => ({
                id: party.id,
                abbreviation: party.abbreviation,
                color: party.color,
                votes: party.votes,
                tempSortKey: party.tempSortKey || party.id
            }));

        const excludedParties = parties
            .filter((party) => party.votes > 0 && party.voteSharePercent < 2.5)
            .map((party) => ({
                id: party.id,
                abbreviation: party.abbreviation,
                voteSharePercent: party.voteSharePercent
            }));

        protocolEntries.push({
            type: 'threshold-summary',
            thresholdPercent: 2.5,
            totalVotes,
            excludedParties
        });

        if (eligibleParties.length === 0) {
            protocolEntries.push({
                type: 'paragraph',
                text: 'Keine Listen oberhalb der 2.5%-Sperrklausel.'
            });
            return {
                partyResults: parties.map(mapAllocatorPartyResult),
                protocolEntries,
                lotteryInfos,
                tieInfo,
                totalSeats: initialTotalSeats
            };
        }

        const partiesAtFivePercent = eligibleParties.filter((party) => {
            const originalParty = parties.find((p) => p.id === party.id);
            return originalParty && originalParty.voteSharePercent >= 5;
        });

        let currentSeats = initialTotalSeats;
        let allocationResult = this.baseAllocator.calculate(eligibleParties, currentSeats);
        const maxSeatIncreaseLoops = 200;
        let loopGuard = 0;

        const getSeatCountForParty = (partyId) => {
            const found = allocationResult.partyResults.find((party) => party.id === partyId);
            return found ? found.proportionalSeats : 0;
        };

        while (
            partiesAtFivePercent.some((party) => getSeatCountForParty(party.id) === 0) &&
            loopGuard < maxSeatIncreaseLoops
        ) {
            loopGuard++;
            currentSeats += 1;
            allocationResult = this.baseAllocator.calculate(eligibleParties, currentSeats);
        }

        if (currentSeats > initialTotalSeats) {
            protocolEntries.push({
                type: 'seat-increase',
                from: initialTotalSeats,
                to: currentSeats,
                reason: 'Eine Liste ab 5% haette andernfalls keinen Sitz erhalten.'
            });
        }

        allocationResult.partyResults.forEach((resultParty) => {
            const target = parties.find((party) => party.id === resultParty.id);
            if (target) {
                target.seats = resultParty.proportionalSeats;
            }
        });

        if (allocationResult.protocolEntries) {
            protocolEntries.push(...allocationResult.protocolEntries);
        }
        if (allocationResult.lotteryInfos) {
            lotteryInfos.push(...allocationResult.lotteryInfos);
        }
        tieInfo = allocationResult.tieInfo || null;

        return {
            partyResults: parties.map(mapAllocatorPartyResult),
            protocolEntries,
            lotteryInfos,
            tieInfo,
            totalSeats: currentSeats
        };
    }
}

function mapAllocatorPartyResult(party) {
    return {
        id: party.id,
        abbreviation: party.abbreviation,
        color: party.color,
        proportionalSeats: party.seats
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SainteLagueAllocator,
        DHondtAllocator,
        HareNiemeyerAllocator,
        NrwBezirksvertretungAllocator
    };
}


class NrwKWahlGCalculator {
    constructor(baseAllocatorInstance) {
        this.baseAllocator = baseAllocatorInstance;
        if (!this.baseAllocator || typeof this.baseAllocator.calculate !== 'function') {
            throw new Error('NrwKWahlGCalculator requires a valid baseAllocatorInstance.');
        }
    }

    /**
     * Calculates council seat allocation under § 33 KWahlG NRW.
     *
     * Returns:
     * - `allocatedParties`: normalized party result records
     * - `protocolEntries`: structured calculation protocol
     * - `lotteryInfos`: lottery metadata from the base allocator
     * - `tieInfo`: unresolved tie information, if present
     */
    calculate(partiesData, initialTotalSeatsInConstituency, totalListVotesRelevantForBase, additionalData = {}) {
        const protocolEntries = [
            { type: 'heading', level: 4, text: 'Protokoll der Sitzverteilung nach §33 KWahlG NRW' }
        ];
        const collectedLotteryInfos = [];
        const allPartiesInternal = JSON.parse(JSON.stringify(partiesData.map((party) => ({
            ...party,
            isListApproved: party.isListApproved === undefined ? true : party.isListApproved,
            directMandatesWon: party.directMandates || 0,
            seats: 0,
            idealAnspruchAbs2Initial: 0,
            seatsFromAbs2Initial: 0,
            tempSortKey: Math.random()
        }))));

        const {
            votesIndividualCandidates = 0,
            seatsWonByIndividualCandidates = 0,
            votesPartiesWithoutListPauschal = 0,
            seatsWonByPartiesWithoutListPauschal = 0
        } = additionalData;

        protocolEntries.push({ type: 'heading', level: 5, text: '§ 33 Abs. 1: Ermittlung der Stimmenzahlen' });

        let totalValidVotes = votesIndividualCandidates + votesPartiesWithoutListPauschal;
        allPartiesInternal.forEach((party) => {
            totalValidVotes += party.votes;
        });
        protocolEntries.push({ type: 'paragraph', text: `Summe aller gültigen Stimmen: ${totalValidVotes.toLocaleString('de-DE')}` });

        let votesOfPartiesWithoutList = 0;
        allPartiesInternal.filter((party) => !party.isListApproved).forEach((party) => {
            votesOfPartiesWithoutList += party.votes;
        });

        const adjustedTotalVotes = totalValidVotes - votesOfPartiesWithoutList - votesPartiesWithoutListPauschal - votesIndividualCandidates;
        protocolEntries.push({ type: 'paragraph', text: `Bereinigte Gesamtstimmenzahl (für Verhältnisausgleich): ${adjustedTotalVotes.toLocaleString('de-DE')}` });

        let participatingParties = allPartiesInternal.filter((party) => party.isListApproved && party.votes > 0);
        if (adjustedTotalVotes <= 0 || participatingParties.length === 0) {
            protocolEntries.push({ type: 'paragraph', text: 'Keine Parteien/Stimmen für Verhältnisausgleich. Nur Direktmandate werden vergeben.' });
            allPartiesInternal.forEach((party) => {
                party.seats = party.directMandatesWon;
            });
            return { allocatedParties: allPartiesInternal.map(this._mapToStandardOutput), protocolEntries, lotteryInfos: [] };
        }

        protocolEntries.push({ type: 'heading', level: 5, text: '§ 33 Abs. 2 Satz 1: Ermittlung der bereinigten Gremiengröße' });

        let directMandatesOutsideAdjustment = seatsWonByIndividualCandidates + seatsWonByPartiesWithoutListPauschal;
        allPartiesInternal.filter((party) => !party.isListApproved).forEach((party) => {
            directMandatesOutsideAdjustment += party.directMandatesWon;
        });

        let adjustedCommitteeSize = initialTotalSeatsInConstituency - directMandatesOutsideAdjustment;
        protocolEntries.push({ type: 'paragraph', text: `Reguläre Gesamtzahl Vertreter: ${initialTotalSeatsInConstituency}` });
        protocolEntries.push({ type: 'paragraph', text: `Direktmandate nicht im Verhältnisausgleich: ${directMandatesOutsideAdjustment}` });
        protocolEntries.push({ type: 'paragraph', text: `Bereinigte Gremiengröße (für proportionale Verteilung): ${adjustedCommitteeSize}` });

        if (adjustedCommitteeSize <= 0) {
            protocolEntries.push({ type: 'paragraph', text: 'Bereinigte Gremiengröße <= 0. Nur Direktmandate werden berücksichtigt.' });
            allPartiesInternal.forEach((party) => {
                party.seats = party.directMandatesWon;
            });
            return { allocatedParties: allPartiesInternal.map(this._mapToStandardOutput), protocolEntries, lotteryInfos: [] };
        }

        const calculateProportionalSeatsInternal = (partiesToAllocateInput, currentTotalSeatsToDistribute, divisorVotes, title, isInitialAbs2Run = false) => {
            protocolEntries.push({ type: 'heading', level: 4, text: title });

            const baseAllocationResult = this.baseAllocator.calculate(partiesToAllocateInput, currentTotalSeatsToDistribute, divisorVotes);
            if (baseAllocationResult.protocolEntries) {
                protocolEntries.push(...baseAllocationResult.protocolEntries);
            }

            baseAllocationResult.partyResults.forEach((allocatedParty) => {
                const targetParty = partiesToAllocateInput.find((party) => party.id === allocatedParty.id);
                if (!targetParty) return;

                targetParty.seats = allocatedParty.proportionalSeats;
                if (isInitialAbs2Run) {
                    targetParty.seatsFromAbs2Initial = allocatedParty.proportionalSeats;
                    targetParty.idealAnspruchAbs2Initial = divisorVotes > 0 ? (targetParty.votes / divisorVotes) * currentTotalSeatsToDistribute : 0;
                }
            });

            return {
                parties: partiesToAllocateInput,
                lotteryInfos: baseAllocationResult.lotteryInfos || [],
                tieInfo: baseAllocationResult.tieInfo || null
            };
        };

        let calculationResult = calculateProportionalSeatsInternal(
            participatingParties,
            adjustedCommitteeSize,
            adjustedTotalVotes,
            'Initiale Sitzverteilung (§ 33 Abs. 2)',
            true
        );
        participatingParties = calculationResult.parties;
        collectedLotteryInfos.push(...calculationResult.lotteryInfos);
        participatingParties.forEach((party) => {
            const mainParty = allPartiesInternal.find((entry) => entry.id === party.id);
            if (mainParty) Object.assign(mainParty, { ...party });
        });

        const partiesWithOverhang = allPartiesInternal.filter((party) => party.isListApproved && party.votes > 0 && party.directMandatesWon > party.seatsFromAbs2Initial);
        let currentProportionalSeatTotal = adjustedCommitteeSize;

        if (partiesWithOverhang.length > 0) {
            protocolEntries.push({ type: 'heading', level: 4, text: '§ 33 Abs. 3: Überhangmandate und erster Ausgleich' });
            partiesWithOverhang.forEach((party) => {
                protocolEntries.push({ type: 'list-item', text: `${party.abbreviation} hat ${party.directMandatesWon - party.seatsFromAbs2Initial} Überhangmandat(e).` });
            });

            let maxRatioDirectToIdeal = 0;
            participatingParties.forEach((party) => {
                if (party.idealAnspruchAbs2Initial > 1e-9) {
                    const ratio = party.directMandatesWon / party.idealAnspruchAbs2Initial;
                    if (ratio > maxRatioDirectToIdeal) maxRatioDirectToIdeal = ratio;
                } else if (party.directMandatesWon > 0) {
                    maxRatioDirectToIdeal = Infinity;
                }
            });

            let newTotalSeatsAbs3 = Math.floor(maxRatioDirectToIdeal * adjustedCommitteeSize);
            if (newTotalSeatsAbs3 % 2 !== 0) newTotalSeatsAbs3++;

            let minRequiredSeatsAbs3 = adjustedCommitteeSize;
            partiesWithOverhang.forEach((party) => {
                minRequiredSeatsAbs3 += (party.directMandatesWon - party.seatsFromAbs2Initial);
            });
            if (newTotalSeatsAbs3 < minRequiredSeatsAbs3) {
                newTotalSeatsAbs3 = minRequiredSeatsAbs3;
                if (newTotalSeatsAbs3 % 2 !== 0) newTotalSeatsAbs3++;
            }

            protocolEntries.push({ type: 'paragraph', text: `Die Gesamtzahl der Sitze wird für den Ausgleich auf ${newTotalSeatsAbs3} erhöht.` });

            calculationResult = calculateProportionalSeatsInternal(
                participatingParties,
                newTotalSeatsAbs3,
                adjustedTotalVotes,
                'Erste Ausgleichsrunde'
            );
            participatingParties = calculationResult.parties;
            collectedLotteryInfos.push(...calculationResult.lotteryInfos);
            currentProportionalSeatTotal = newTotalSeatsAbs3;
        } else {
            protocolEntries.push({ type: 'heading', level: 4, text: '§ 33 Abs. 3: Überhangmandate und Ausgleich' });
            protocolEntries.push({ type: 'paragraph', text: 'Keine Überhangmandate nach initialer Verteilung.' });
        }

        participatingParties.forEach((party) => {
            const mainParty = allPartiesInternal.find((entry) => entry.id === party.id);
            if (mainParty) {
                mainParty.seats = party.seats;
            }
        });

        let iterationCounterAbs3a = 0;
        const needsFurtherAdjustment = () => allPartiesInternal.some((party) => party.isListApproved && party.votes > 0 && party.seats < party.directMandatesWon);

        if (needsFurtherAdjustment()) {
            protocolEntries.push({ type: 'heading', level: 4, text: 'Iterativer Ausgleich (§ 33 Abs. 3 S. 5)' });
        }

        while (needsFurtherAdjustment() && iterationCounterAbs3a < 50) {
            const partyNeedingMore = allPartiesInternal.find((party) => party.isListApproved && party.votes > 0 && party.seats < party.directMandatesWon);
            iterationCounterAbs3a++;
            currentProportionalSeatTotal += 2;
            protocolEntries.push({ type: 'paragraph', text: `Runde ${iterationCounterAbs3a}: ${partyNeedingMore.abbreviation} benötigt mehr Sitze. Erhöhe Gesamtsitze um 2 auf ${currentProportionalSeatTotal}.` });

            calculationResult = calculateProportionalSeatsInternal(
                participatingParties,
                currentProportionalSeatTotal,
                adjustedTotalVotes,
                `Ausgleichsrunde ${iterationCounterAbs3a}`
            );
            participatingParties = calculationResult.parties;
            collectedLotteryInfos.push(...calculationResult.lotteryInfos);
            participatingParties.forEach((party) => {
                const mainParty = allPartiesInternal.find((entry) => entry.id === party.id);
                if (mainParty) {
                    mainParty.seats = party.seats;
                }
            });
        }

        protocolEntries.push({ type: 'heading', level: 4, text: 'Finale Zuweisung' });
        protocolEntries.push({ type: 'paragraph', text: 'Jede Partei erhält mindestens die Anzahl ihrer gewonnenen Direktmandate.' });
        allPartiesInternal.forEach((party) => {
            if (party.isListApproved) {
                if (party.seats < party.directMandatesWon) {
                    party.seats = party.directMandatesWon;
                }
            } else {
                party.seats = party.directMandatesWon;
            }
        });

        return {
            allocatedParties: allPartiesInternal.map(this._mapToStandardOutput),
            protocolEntries,
            lotteryInfos: collectedLotteryInfos,
            tieInfo: calculationResult.tieInfo
        };
    }

    _mapToStandardOutput(party) {
        return {
            id: party.id,
            abbreviation: party.abbreviation,
            color: party.color,
            votes: party.votes || 0,
            seats: party.seats || 0,
            directMandatesWon: party.directMandatesWon,
            directMandatesAwarded: Math.min(party.seats, party.directMandatesWon),
            listSeatsAwarded: Math.max(0, party.seats - party.directMandatesWon)
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NrwKWahlGCalculator
    };
}


let CommitteeHareNiemeyerAllocator;
let CommitteeDHondtAllocator;

if (typeof module !== 'undefined' && module.exports) {
    const allocators = require('./Allocators');
    CommitteeHareNiemeyerAllocator = allocators.HareNiemeyerAllocator;
    CommitteeDHondtAllocator = allocators.DHondtAllocator;
} else {
    CommitteeHareNiemeyerAllocator = HareNiemeyerAllocator;
    CommitteeDHondtAllocator = DHondtAllocator;
}

class CommitteeCalculator {
    constructor(options = {}) {
        this.hareAllocator = options.hareAllocator || new CommitteeHareNiemeyerAllocator();
        this.dhondtAllocator = options.dhondtAllocator || new CommitteeDHondtAllocator();
    }

    /**
     * Builds the normalized calculation basis for committee allocation.
     *
     * Returns:
     * - `calculationBasis`: factions / alliances participating in allocation
     * - `individualMembers`: council members below the 2-vote threshold
     * - `totalVotes`: sum of votes across the calculation basis
     */
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

    /**
     * Calculates committee allocation or access order.
     *
     * Returns:
     * - `calculationBasis`, `individualMembers`, `totalVotes`
     * - `mode`, `displayMode`, `title`
     * - `results`: keyed by committee size
     * - `protocolEntries`: structured protocol data for renderer consumption
     */
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CommitteeCalculator
    };
}


(function exposeKwahlgCalcLibrary(globalScope) {
    const REQUIRED_EXPORTS = [
        'SainteLagueAllocator',
        'DHondtAllocator',
        'HareNiemeyerAllocator',
        'NrwBezirksvertretungAllocator',
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
                'KWahlGCalcLib could not initialize in ' + environmentLabel + '. ' +
                'Missing exports: ' + missingExports.join(', ') + '.'
            );
        }

        return api;
    }

    const api = createPublicApi({
        SainteLagueAllocator: typeof SainteLagueAllocator === 'function' ? SainteLagueAllocator : globalScope.SainteLagueAllocator,
        DHondtAllocator: typeof DHondtAllocator === 'function' ? DHondtAllocator : globalScope.DHondtAllocator,
        HareNiemeyerAllocator: typeof HareNiemeyerAllocator === 'function' ? HareNiemeyerAllocator : globalScope.HareNiemeyerAllocator,
        NrwBezirksvertretungAllocator: typeof NrwBezirksvertretungAllocator === 'function' ? NrwBezirksvertretungAllocator : globalScope.NrwBezirksvertretungAllocator,
        NrwKWahlGCalculator: typeof NrwKWahlGCalculator === 'function' ? NrwKWahlGCalculator : globalScope.NrwKWahlGCalculator,
        CommitteeCalculator: typeof CommitteeCalculator === 'function' ? CommitteeCalculator : globalScope.CommitteeCalculator
    }, 'browser bundle');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    globalScope.KWahlGCalcLib = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
