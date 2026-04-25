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
        HareNiemeyerAllocator
    };
}
