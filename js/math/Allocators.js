// --- ALLOCATOR CLASSES ---
// (Unverändert - SainteLagueAllocator, DHondtAllocator, HareNiemeyerAllocator, KWahlGNRWAllocator)
class SainteLagueAllocator {
    calculate(partiesData, totalSeats, totalVotesIgnored) {
        const stepsLog = [];
        const lotteryInfos = [];
        let tieInfo = null;

        const parties = JSON.parse(JSON.stringify(partiesData.map(p => ({
            ...p,
            seats: 0,
            allocatedByLottery: false,
            potentiallyAffectedByLottery: false,
            nextDivisorOrdinal: 1,
            tempSortKey: p.tempSortKey || p.id
        }))));

        let allocatedSeatsCount = 0;
        if (totalSeats === 0) return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats })), stepsLog, lotteryInfos, tieInfo };
        const relevantParties = parties.filter(p => p.votes > 0);
        if (relevantParties.length === 0) return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats })), stepsLog, lotteryInfos, tieInfo };

        const allocationTableData = [];
        let loopGuard = 0;
        const maxLoops = totalSeats * relevantParties.length + 100;

        while (allocatedSeatsCount < totalSeats && loopGuard < maxLoops) {
            loopGuard++;
            let maxQuotient = -1;
            let tiedPartiesForSeat = [];

            relevantParties.forEach(party => {
                const partyVotes = Number(party.votes) || 0;
                if (partyVotes === 0) return;
                const divisor = (party.nextDivisorOrdinal - 1) + 0.5;
                if (divisor === 0) { console.error("Divisor is 0 for party:", party.abbreviation); return; }
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
                    partiesInvolved: tiedPartiesForSeat.map(p => p.id),
                    seatsInContention: remainingSeats,
                    claimFraction: `${remainingSeats}/${tiedPartiesForSeat.length}`
                };
                break;
            }

            tiedPartiesForSeat.sort((a,b) => String(a.tempSortKey).localeCompare(String(b.tempSortKey)));

            for (const partyToGetSeat of tiedPartiesForSeat) {
                if (allocatedSeatsCount >= totalSeats) break;

                const mainListPartyToUpdate = parties.find(p => p.id === partyToGetSeat.id);
                if (mainListPartyToUpdate) {
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
        }

        let tableHTML = `<h6>Sainte-Laguë/Schepers (für ${totalSeats} Sitze)</h6><table class="protocol-table"><thead><tr><th>Sitz Nr.</th><th>Partei</th><th>Stimmen</th><th>Divisor</th><th>Quotient</th></tr></thead><tbody>`;
        allocationTableData.forEach(row => {
            tableHTML += `<tr><td>${row.seat}</td><td style="background:${row.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${row.party}</td><td>${row.votes.toLocaleString('de-DE')}</td><td>${row.divisor}</td><td>${row.quotient.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td></tr>`;
        });
        tableHTML += `</tbody></table>`;
        if (tieInfo) {
            tableHTML += `<p class="protocol-note" style="color:var(--danger-color); font-weight:bold;">Die Sitzvergabe wurde beim Stand von ${allocatedSeatsCount} Sitzen gestoppt. Für die verbleibenden ${tieInfo.seatsInContention} Sitze besteht ein unauflösbarer Gleichstand zwischen ${tieInfo.partiesInvolved.length} Parteien.</p>`;
        }

        const partyResults = parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats }));
        return { partyResults, stepsLog: [tableHTML], lotteryInfos, tieInfo };
    }
}

class DHondtAllocator {
    calculate(partiesData, totalSeats, totalVotesIgnored, options = {}) {
        // Der Allocator protokolliert jetzt standardmäßig alle auto-aufgelösten Lose.

        const parties = JSON.parse(JSON.stringify(partiesData.map(p => ({...p, seats: 0, allocatedByLottery: false, potentiallyAffectedByLottery: false, tempSortKey: p.tempSortKey || p.id}))));
        let allocatedSeatsCount = 0;
        const allocationTableData = []; // HIER sammeln wir die Rohdaten
        const lotteryInfos = []; // HIER sammeln wir alle automatisch aufgelösten Lose
        let tieInfo = null;

        if (totalSeats === 0) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog: [], lotteryInfos, tieInfo, allocationTable: [] }; }
        const relevantParties = parties.filter(p => p.votes > 0);
        if (relevantParties.length === 0) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog: [], lotteryInfos, tieInfo, allocationTable: [] }; }

        let loopGuard = 0;
        const maxLoops = totalSeats * relevantParties.length + 100;

        while (allocatedSeatsCount < totalSeats && loopGuard < maxLoops) {
            loopGuard++;
            let maxQuotient = -1;
            let tiedPartiesForSeat = [];
            relevantParties.forEach(party => {
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

            if (remainingSeats <= 0) {
                break;
            }

            if (tiedPartiesForSeat.length > 1) {
                const seatsInContention = Math.min(remainingSeats, tiedPartiesForSeat.length);
                lotteryInfos.push({
                    type: 'auto-resolved tie',
                    partiesInvolved: tiedPartiesForSeat.map(p => p.id),
                    seatsInContention: seatsInContention,
                    firstSeatNumber: allocatedSeatsCount + 1,
                    message: `Gleichstand (Losentscheid) für ${seatsInContention} Sitze (ab Sitz Nr. ${allocatedSeatsCount + 1}) zwischen ${tiedPartiesForSeat.length} Parteien. Automatisch per 'tempSortKey' (z.B. Name) aufgelöst.`
                });
            }

            tiedPartiesForSeat.sort((a,b) => String(a.tempSortKey).localeCompare(String(b.tempSortKey)));

            for (const partyToGetSeat of tiedPartiesForSeat) {
                if (allocatedSeatsCount >= totalSeats) break;

                const mainListPartyToUpdate = parties.find(p => p.id === partyToGetSeat.id);
                if (mainListPartyToUpdate) {
                     // 1. Rohdaten sammeln
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
        } // Ende while-Schleife

        // --- 2. HTML-PROTOKOLL AUFBAUEN (Wie bei den anderen Allocators) ---
        let tableHTML = `<h6>D'Hondt (für ${totalSeats} Sitze)</h6><table class="protocol-table"><thead><tr><th>Sitz Nr.</th><th>Partei</th><th>Stimmen</th><th>Divisor</th><th>Quotient</th></tr></thead><tbody>`;

        // Iteriere über die Rohdaten, die wir gerade gesammelt haben
        allocationTableData.forEach(row => {
            tableHTML += `<tr><td>${row.seat}</td><td style="background:${row.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${row.party}</td><td>${row.votes.toLocaleString('de-DE')}</td><td>${row.divisor}</td><td>${row.quotient.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td></tr>`;
        });
        tableHTML += `</tbody></table>`;

        // Füge die Los-Warnungen an das HTML-Protokoll an
        if (lotteryInfos.length > 0) {
             tableHTML += `<h6 style="color:var(--danger-color); margin-top:10px;">Protokoll der automatisch aufgelösten Losentscheide</h6>`;
             tableHTML += `<ul class="protocol-note" style="color:var(--danger-color); padding-left: 20px;">`;
             lotteryInfos.forEach(info => {
                 // Finde die Namen der Parteien für die Meldung
                 const partyNames = info.partiesInvolved.map(id => {
                     const party = parties.find(p => p.id === id);
                     return party ? party.abbreviation : 'Unbekannt';
                 }).join(', ');

                 tableHTML += `<li><strong>Sitz Nr. ${info.firstSeatNumber}</strong>: ${info.message} (Beteiligte: ${partyNames})</li>`;
             });
             tableHTML += `</ul>`;
        }
        // --- ENDE HTML-PROTOKOLL ---

        const partyResults = parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats}));

        // --- FINALES RETURN-STATEMENT ---
        return {
            partyResults,      // Die Summe (z.B. CDU: 10)
            allocationTable: allocationTableData, // Die Roh-Reihenfolge (Sitz 1: CDU...)
            lotteryInfos,      // Die Los-Warnungen
            tieInfo: null,       // Kein Hard-Stop
            stepsLog: [tableHTML] // Das fertige HTML-Protokoll
        };
    }
}

/*Original
class DHondtAllocator {
    calculate(partiesData, totalSeats, totalVotesIgnored) {
        const parties = JSON.parse(JSON.stringify(partiesData.map(p => ({...p, seats: 0, allocatedByLottery: false, potentiallyAffectedByLottery: false, tempSortKey: p.tempSortKey || p.id}))));
        let allocatedSeatsCount = 0;
        const allocationTableData = [];
        const lotteryInfos = [];
        let tieInfo = null;
        if (totalSeats === 0) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog: [], lotteryInfos, tieInfo }; }
        const relevantParties = parties.filter(p => p.votes > 0);
        if (relevantParties.length === 0) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog: [], lotteryInfos, tieInfo }; }

        let loopGuard = 0;
        const maxLoops = totalSeats * relevantParties.length + 100;

        while (allocatedSeatsCount < totalSeats && loopGuard < maxLoops) {
            loopGuard++;
            let maxQuotient = -1;
            let tiedPartiesForSeat = [];
            relevantParties.forEach(party => {
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
            if (tiedPartiesForSeat.length > remainingSeats) {
                 tieInfo = {
                    partiesInvolved: tiedPartiesForSeat.map(p => p.id),
                    seatsInContention: remainingSeats,
                    claimFraction: `${remainingSeats}/${tiedPartiesForSeat.length}`
                };
                break;
            }

            tiedPartiesForSeat.sort((a,b) => String(a.tempSortKey).localeCompare(String(b.tempSortKey)));

            for (const partyToGetSeat of tiedPartiesForSeat) {
                if (allocatedSeatsCount >= totalSeats) break;

                const mainListPartyToUpdate = parties.find(p => p.id === partyToGetSeat.id);
                if (mainListPartyToUpdate) {
                     allocationTableData.push({
                        seat: allocatedSeatsCount + 1,
                        party: mainListPartyToUpdate.abbreviation,
                        color: mainListPartyToUpdate.color,
                        votes: mainListPartyToUpdate.votes,
                        divisor: mainListPartyToUpdate.seats + 1,
                        quotient: maxQuotient
                    });
                    mainListPartyToUpdate.seats++;
                    allocatedSeatsCount++;
                }
            }
        }

        let tableHTML = `<h6>D'Hondt (für ${totalSeats} Sitze)</h6><table class="protocol-table"><thead><tr><th>Sitz Nr.</th><th>Partei</th><th>Stimmen</th><th>Divisor</th><th>Quotient</th></tr></thead><tbody>`;
        allocationTableData.forEach(row => {
            tableHTML += `<tr><td>${row.seat}</td><td style="background:${row.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${row.party}</td><td>${row.votes.toLocaleString('de-DE')}</td><td>${row.divisor}</td><td>${row.quotient.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td></tr>`;
        });
        tableHTML += `</tbody></table>`;
        if (tieInfo) {
             tableHTML += `<p class="protocol-note" style="color:var(--danger-color); font-weight:bold;">Die Sitzvergabe wurde beim Stand von ${allocatedSeatsCount} Sitzen gestoppt. Für die verbleibenden ${tieInfo.seatsInContention} Sitze besteht ein unauflösbarer Gleichstand zwischen ${tieInfo.partiesInvolved.length} Parteien.</p>`;
        }

        const partyResults = parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats}));
        return { partyResults, stepsLog: [tableHTML], lotteryInfos, tieInfo };
    }
}//*/

class HareNiemeyerAllocator {
    calculate(partiesData, totalSeats, totalVotes) {
        const parties = JSON.parse(JSON.stringify(partiesData.map(p => ({...p, seats: 0, remainder: 0, allocatedByLottery: false, potentiallyAffectedByLottery: false, tempSortKey: p.tempSortKey || Math.random()}))));
        const stepsLog = [];
        const lotteryInfos = [];
        let tieInfo = null;

        if (totalSeats === 0) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog, lotteryInfos, tieInfo }; }
        const relevantParties = parties.filter(p => p.votes > 0);
        if (totalVotes === 0 || relevantParties.length === 0 ) { return { partyResults: parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats})), stepsLog, lotteryInfos, tieInfo }; }

        const quota = totalVotes / totalSeats;
        let seatsAllocatedSoFar = 0;

        let tableHTML = `<h6>Hare-Niemeyer (für ${totalSeats} Sitze)</h6>`;
        tableHTML += `<p>Gesamtstimmen: ${totalVotes.toLocaleString('de-DE')}, Sitze: ${totalSeats}, Quote (Stimmen/Sitz): ${(quota).toLocaleString('de-DE', {minimumFractionDigits: 4})}</p>`;
        tableHTML += `<table class="protocol-table"><thead><tr><th>Partei</th><th>Stimmen</th><th>Anspruch (Stimmen/Quote)</th><th>Ganze Sitze</th><th>Rest</th></tr></thead><tbody>`;

        relevantParties.forEach(party => {
            const idealSeats = party.votes / quota;
            party.seats = Math.floor(idealSeats);
            party.remainder = idealSeats - party.seats;
            seatsAllocatedSoFar += party.seats;

             tableHTML += `<tr>
                <td style="background:${party.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${party.abbreviation}</td>
                <td>${party.votes.toLocaleString('de-DE')}</td>
                <td>${idealSeats.toLocaleString('de-DE', {minimumFractionDigits: 4})}</td>
                <td>${party.seats}</td>
                <td>${party.remainder.toLocaleString('de-DE', {minimumFractionDigits: 4})}</td>
             </tr>`;
        });
        tableHTML += `</tbody></table>`;
        tableHTML += `<p>Vergabe der <strong>${seatsAllocatedSoFar}</strong> Sitze nach vollem Anspruch.</p>`;

        let remainingSeatsToAllocate = totalSeats - seatsAllocatedSoFar;

        if (remainingSeatsToAllocate > 0) {
            tableHTML += `<p>Vergabe der verbleibenden <strong>${remainingSeatsToAllocate}</strong> Sitze nach höchsten Resten:</p>`;
            let sortedPartiesForRemainder = [...relevantParties].sort((a, b) => {
                if (b.remainder !== a.remainder) return b.remainder - a.remainder;
                return String(a.tempSortKey).localeCompare(String(b.tempSortKey));
            });

            if (sortedPartiesForRemainder.length > remainingSeatsToAllocate) {
                const cutoffRemainder = sortedPartiesForRemainder[remainingSeatsToAllocate - 1].remainder;
                const nextPartyRemainder = sortedPartiesForRemainder[remainingSeatsToAllocate].remainder;

                if (cutoffRemainder > 0 && cutoffRemainder === nextPartyRemainder) {
                    const partiesInTie = sortedPartiesForRemainder.filter(p => p.remainder === cutoffRemainder);
                    const partiesWithHigherRemainder = sortedPartiesForRemainder.filter(p => p.remainder > cutoffRemainder);

                    partiesWithHigherRemainder.forEach(p => {
                        p.seats++;
                        remainingSeatsToAllocate--;
                        tableHTML += `<p>- Sitz an ${p.abbreviation} (Rest ${p.remainder.toLocaleString('de-DE', {minimumFractionDigits: 4})})</p>`;
                    });

                    tieInfo = {
                        partiesInvolved: partiesInTie.map(p => p.id),
                        seatsInContention: remainingSeatsToAllocate,
                        claimFraction: `${remainingSeatsToAllocate}/${partiesInTie.length}`
                    };

                    tableHTML += `<p class="protocol-note" style="color:var(--danger-color); font-weight:bold;">Gleichstand (Rest ${cutoffRemainder.toLocaleString('de-DE', {minimumFractionDigits: 4})}) für ${remainingSeatsToAllocate} Sitz(e) zwischen ${partiesInTie.length} Parteien. Vergabe gestoppt.</p>`;
                    remainingSeatsToAllocate = 0;
                }
            }

            let i = 0;
            while (remainingSeatsToAllocate > 0 && sortedPartiesForRemainder.length > 0) {
                const topPartyForRemainder = sortedPartiesForRemainder[i++];
                if (!topPartyForRemainder) break;
                topPartyForRemainder.seats++;
                remainingSeatsToAllocate--;
                tableHTML += `<p>- Sitz ${i} an ${topPartyForRemainder.abbreviation} (Rest ${topPartyForRemainder.remainder.toLocaleString('de-DE', {minimumFractionDigits: 4})})</p>`;
            }
        }

        stepsLog.push(tableHTML);

        relevantParties.forEach(rp => {
            const mainParty = parties.find(p => p.id === rp.id);
            if(mainParty) mainParty.seats = rp.seats;
        });

        const partyResults = parties.map(p => ({ id: p.id, abbreviation: p.abbreviation, color: p.color, proportionalSeats: p.seats }));

        return { partyResults, stepsLog, lotteryInfos, tieInfo };
    }
}


