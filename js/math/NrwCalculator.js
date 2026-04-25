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
