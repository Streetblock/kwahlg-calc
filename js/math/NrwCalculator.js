class NrwKWahlgCalculator {
    constructor(baseAllocatorInstance) {
        this.baseAllocator = baseAllocatorInstance;
        if (!this.baseAllocator || typeof this.baseAllocator.calculate !== 'function') {
            throw new Error("NrwKWahlgCalculator requires a valid baseAllocatorInstance.");
        }
    }
    calculate(partiesData, initialTotalSeatsInConstituency, totalListVotesRelevantForBase, additionalData = {}) {
        const stepsLog = [`<h4>Protokoll der Sitzverteilung nach §33 KWahlG NRW</h4>`];
        let collectedLotteryInfos = [];
        let allPartiesInternal = JSON.parse(JSON.stringify(partiesData.map(p => ({...p, isListApproved: p.isListApproved === undefined ? true : p.isListApproved, directMandatesWon: p.directMandates || 0, seats: 0, idealAnspruch: 0, idealAnspruchAbs2Initial: 0, seatsFromAbs2Initial: 0, prozentualerRestWertAbs2Initial: 0, allocatedByLottery: false, potentiallyAffectedByLottery: false, tempSortKey: Math.random()}))));
        let { votesIndividualCandidates = 0, seatsWonByIndividualCandidates = 0, votesPartiesWithoutListPauschal = 0, seatsWonByPartiesWithoutListPauschal = 0 } = additionalData;
        stepsLog.push(`<h5>§ 33 Abs. 1: Ermittlung der Stimmenzahlen</h5>`);
        let gesamtstimmenzahlAllerBewerber = votesIndividualCandidates + votesPartiesWithoutListPauschal;
        allPartiesInternal.forEach(p => gesamtstimmenzahlAllerBewerber += p.votes);
        stepsLog.push(`<p>Summe aller gültigen Stimmen: ${gesamtstimmenzahlAllerBewerber.toLocaleString('de-DE')}</p>`);
        let stimmenParteienOhneListeAusHauptliste = 0;
        allPartiesInternal.filter(p => !p.isListApproved).forEach(p => stimmenParteienOhneListeAusHauptliste += p.votes);
        const bereinigteGesamtstimmenzahl_KWahlG = gesamtstimmenzahlAllerBewerber - stimmenParteienOhneListeAusHauptliste - votesPartiesWithoutListPauschal - votesIndividualCandidates;
        stepsLog.push(`<p>Bereinigte Gesamtstimmenzahl (für Verhältnisausgleich): <strong>${bereinigteGesamtstimmenzahl_KWahlG.toLocaleString('de-DE')}</strong></p>`);
        let participatingParties = allPartiesInternal.filter(p => p.isListApproved && p.votes > 0);
        if (bereinigteGesamtstimmenzahl_KWahlG <= 0 || participatingParties.length === 0) {
            stepsLog.push("<p>Keine Parteien/Stimmen für Verhältnisausgleich. Nur Direktmandate werden vergeben.</p>");
            allPartiesInternal.forEach(p => { p.seats = p.directMandatesWon; });
            return { allocatedParties: allPartiesInternal.map(this._mapToStandardOutput), stepsLog, lotteryInfos: [] };
        }
        stepsLog.push(`<h5>§ 33 Abs. 2 Satz 1: Ermittlung der bereinigten Gremiengröße</h5>`);
        let direktmandateNichtImVerhaeltnisausgleich = seatsWonByIndividualCandidates + seatsWonByPartiesWithoutListPauschal;
        allPartiesInternal.filter(p => !p.isListApproved).forEach(p => direktmandateNichtImVerhaeltnisausgleich += p.directMandatesWon);
        let bereinigteGremiengroesse = initialTotalSeatsInConstituency - direktmandateNichtImVerhaeltnisausgleich;
        stepsLog.push(`<p>Reguläre Gesamtzahl Vertreter: ${initialTotalSeatsInConstituency}</p>`);
        stepsLog.push(`<p>Direktmandate nicht im Verhältnisausgleich: ${direktmandateNichtImVerhaeltnisausgleich}</p>`);
        stepsLog.push(`<p>=> Bereinigte Gremiengröße (für proportionale Verteilung): <strong>${bereinigteGremiengroesse}</strong></p>`);
        if (bereinigteGremiengroesse <= 0) {
            stepsLog.push("<p>Bereinigte Gremiengröße <= 0. Nur Direktmandate werden berücksichtigt.</p>");
            allPartiesInternal.forEach(p => { p.seats = p.directMandatesWon; });
            return { allocatedParties: allPartiesInternal.map(this._mapToStandardOutput), stepsLog, lotteryInfos: [] };
        }
        const _calculateProportionalSeatsInternal = (partiesToAllocateInput, currentTotalSeatsToDistribute, divisorVotes, logTitle = "", isInitialAbs2Run = false) => {
            stepsLog.push(`<h4>${logTitle}</h4>`);
            const baseAllocationResult = this.baseAllocator.calculate(partiesToAllocateInput, currentTotalSeatsToDistribute, divisorVotes);
            if(baseAllocationResult.stepsLog) { stepsLog.push(...baseAllocationResult.stepsLog); }
            baseAllocationResult.partyResults.forEach(allocatedParty => {
                const targetParty = partiesToAllocateInput.find(p => p.id === allocatedParty.id);
                if (targetParty) {
                    targetParty.seats = allocatedParty.proportionalSeats;
                    if (isInitialAbs2Run) {
                        targetParty.seatsFromAbs2Initial = allocatedParty.proportionalSeats;
                        targetParty.idealAnspruchAbs2Initial = divisorVotes > 0 ? (targetParty.votes / divisorVotes) * currentTotalSeatsToDistribute : 0;
                    }
                }
            });
            return { parties: partiesToAllocateInput, lotteryInfos: baseAllocationResult.lotteryInfos || [], tieInfo: baseAllocationResult.tieInfo || null };
        };
        let calculationResult = _calculateProportionalSeatsInternal(participatingParties, bereinigteGremiengroesse, bereinigteGesamtstimmenzahl_KWahlG, "Initiale Sitzverteilung (§ 33 Abs. 2)", true);
        participatingParties = calculationResult.parties;
        collectedLotteryInfos.push(...calculationResult.lotteryInfos);
        participatingParties.forEach(pp => { const mainParty = allPartiesInternal.find(ap => ap.id === pp.id); if (mainParty) Object.assign(mainParty, { ...pp }); });
        const partiesWithOverhang = allPartiesInternal.filter(p => p.isListApproved && p.votes > 0 && p.directMandatesWon > p.seatsFromAbs2Initial);
        let currentProportionalSeatTotal = bereinigteGremiengroesse;
        if (partiesWithOverhang.length > 0) {
            stepsLog.push(`<h4>§ 33 Abs. 3: Überhangmandate und erster Ausgleich</h4>`);
            partiesWithOverhang.forEach(p => stepsLog.push(`<p>- ${p.abbreviation} hat ${p.directMandatesWon - p.seatsFromAbs2Initial} Überhangmandat(e).</p>`));
            let maxVerhaeltnisDMzuIdeal = 0;
            participatingParties.forEach(p => { if (p.idealAnspruchAbs2Initial > 1e-9) { const verhaeltnis = p.directMandatesWon / p.idealAnspruchAbs2Initial; if (verhaeltnis > maxVerhaeltnisDMzuIdeal) maxVerhaeltnisDMzuIdeal = verhaeltnis; } else if (p.directMandatesWon > 0) { maxVerhaeltnisDMzuIdeal = Infinity; } });
            let neueGesamtsitzzahl_Abs3 = Math.floor(maxVerhaeltnisDMzuIdeal * bereinigteGremiengroesse);
            if (neueGesamtsitzzahl_Abs3 % 2 !== 0) neueGesamtsitzzahl_Abs3++;
            let minRequiredSeatsAbs3 = bereinigteGremiengroesse;
            partiesWithOverhang.forEach(p_ov => { minRequiredSeatsAbs3 += (p_ov.directMandatesWon - p_ov.seatsFromAbs2Initial); });
            if (neueGesamtsitzzahl_Abs3 < minRequiredSeatsAbs3) { neueGesamtsitzzahl_Abs3 = minRequiredSeatsAbs3; if (neueGesamtsitzzahl_Abs3 % 2 !== 0) neueGesamtsitzzahl_Abs3++; }
            stepsLog.push(`<p>Die Gesamtzahl der Sitze wird für den Ausgleich auf <strong>${neueGesamtsitzzahl_Abs3}</strong> erhöht.</p>`);
            calculationResult = _calculateProportionalSeatsInternal(participatingParties, neueGesamtsitzzahl_Abs3, bereinigteGesamtstimmenzahl_KWahlG, "Erste Ausgleichsrunde");
            participatingParties = calculationResult.parties;
            collectedLotteryInfos.push(...calculationResult.lotteryInfos);
            currentProportionalSeatTotal = neueGesamtsitzzahl_Abs3;
        } else { stepsLog.push("<h4>§ 33 Abs. 3: Überhangmandate und Ausgleich</h4><p>Keine Überhangmandate nach initialer Verteilung.</p>"); }
        participatingParties.forEach(pp => { const mainParty = allPartiesInternal.find(ap => ap.id === pp.id); if (mainParty) mainParty.seats = pp.seats; });
        let iterationCounterAbs3a = 0;
        const needsFurtherAdjustment = () => allPartiesInternal.some(p => p.isListApproved && p.votes > 0 && p.seats < p.directMandatesWon);
        if (needsFurtherAdjustment()) { stepsLog.push(`<h4>Iterativer Ausgleich (§ 33 Abs. 3 S. 5)</h4>`); }
        while (needsFurtherAdjustment() && iterationCounterAbs3a < 50) {
            const partyNeedingMore = allPartiesInternal.find(p => p.isListApproved && p.votes > 0 && p.seats < p.directMandatesWon);
            iterationCounterAbs3a++;
            currentProportionalSeatTotal += 2;
            stepsLog.push(`<p><strong>Runde ${iterationCounterAbs3a}:</strong> ${partyNeedingMore.abbreviation} benötigt mehr Sitze. Erhöhe Gesamtsitze um 2 auf <strong>${currentProportionalSeatTotal}</strong>.</p>`);
            calculationResult = _calculateProportionalSeatsInternal(participatingParties, currentProportionalSeatTotal, bereinigteGesamtstimmenzahl_KWahlG, `Ausgleichsrunde ${iterationCounterAbs3a}`);
            participatingParties = calculationResult.parties;
            collectedLotteryInfos.push(...calculationResult.lotteryInfos);
            participatingParties.forEach(pp => { const mainParty = allPartiesInternal.find(ap => ap.id === pp.id); if (mainParty) mainParty.seats = pp.seats; });
        }
        stepsLog.push(`<h4>Finale Zuweisung</h4><p>Jede Partei erhält mindestens die Anzahl ihrer gewonnenen Direktmandate.</p>`);
        allPartiesInternal.forEach(p => { if (p.isListApproved) { if (p.seats < p.directMandatesWon) { p.seats = p.directMandatesWon; } } else { p.seats = p.directMandatesWon; } });
        const finalAllocatedParties = allPartiesInternal.map(this._mapToStandardOutput);
        return { allocatedParties: finalAllocatedParties, stepsLog, lotteryInfos: collectedLotteryInfos, tieInfo: calculationResult.tieInfo };
    }
    _mapToStandardOutput(p) {
        return { id: p.id, abbreviation: p.abbreviation, color: p.color, votes: p.votes || 0, seats: p.seats || 0, directMandatesWon: p.directMandatesWon, directMandatesAwarded: Math.min(p.seats, p.directMandatesWon), listSeatsAwarded: Math.max(0, p.seats - p.directMandatesWon), };
    }
}

/////////////////////
// Klassen der Grafischen aufbereitung
////////////////////7




