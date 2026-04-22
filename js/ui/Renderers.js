class CoalitionAnalyzer {
    constructor(listContainerId, resultContainerId, autoResultsContainerId, totalSeatsInputId) {
        this.listContainer = document.getElementById(listContainerId);
        this.resultContainer = document.getElementById(resultContainerId);
        this.autoResultsContainer = document.getElementById(autoResultsContainerId);
        this.totalSeatsInput = document.getElementById(totalSeatsInputId); // Diese Zeile ist das potenzielle Problem
        this.partiesForCoalition = [];
        this.lotteryWasIndicated = false;
        this.isPivotalLottery = false;

        // KORREKTUR: Abfangen, falls das totalSeatsInput-Element nicht existiert
        if (!this.totalSeatsInput) {
            console.warn(`CoalitionAnalyzer: Das Element mit der ID '${totalSeatsInputId}' wurde nicht gefunden.`);
        }
    }

    updateChecklist(parties) {
        // Filtere Parteien, die tatsächlich Sitze haben und nicht eliminiert sind
        this.partiesForCoalition = parties.filter(p => p.seats > 0 && !p.isEliminated);
        if (!this.listContainer) return; // Sicherstellen, dass Container existiert
        this.listContainer.innerHTML = ''; // Leere vorherige Liste

        // KORREKTUR: Prüfen, ob this.totalSeatsInput existiert, bevor .value gelesen wird
        const actualParliamentSize = (app && app.currentResultsData && app.currentResultsData.totalSeats !== undefined)
                                     ? app.currentResultsData.totalSeats
                                     : (this.totalSeatsInput ? parseInt(this.totalSeatsInput.value) : NaN); // Fallback auf NaN

        if (isNaN(actualParliamentSize) || actualParliamentSize <= 0) {
            this.listContainer.innerHTML = '<p>Keine gültige Parlamentsgröße für Koalitionsanalyse.</p>';
            return;
        }
        const majorityThreshold = Math.floor(actualParliamentSize / 2) + 1;

        const header = document.createElement('p');
        header.innerHTML = `Wählen Sie Parteien aus. Benötigte Mehrheit: <strong>${majorityThreshold}</strong> Sitze (bei ${actualParliamentSize} Gesamtsitzen).`;
        this.listContainer.appendChild(header);

        this.partiesForCoalition.forEach(party => {
            const item = document.createElement('div');
            item.classList.add('coalition-party-item');
            item.innerHTML = `
                <input type="checkbox" id="coalition-${party.id}" name="coalitionParty" value="${party.id}">
                <label for="coalition-${party.id}" style="display:flex; align-items:center; cursor:pointer;">
                    <span class="party-color-indicator" style="background-color:${party.color};"></span>
                    ${party.abbreviation} (${party.seats} Sitze)
                </label>
            `;
            this.listContainer.appendChild(item);
        });
    }

    check() {
        if (!this.listContainer || !this.resultContainer) return; // Sicherstellen, dass Container existieren

        const checkboxes = this.listContainer.querySelectorAll('input[type="checkbox"]:checked');

        // KORREKTUR: Prüfen, ob this.totalSeatsInput existiert
        const actualParliamentSize = (app && app.currentResultsData && app.currentResultsData.totalSeats !== undefined)
                                     ? app.currentResultsData.totalSeats
                                     : (this.totalSeatsInput ? parseInt(this.totalSeatsInput.value) : NaN); // Fallback auf NaN

        if (isNaN(actualParliamentSize) || actualParliamentSize <= 0) {
            this.resultContainer.innerHTML = `<span class="no-majority">Gesamtzahl der Sitze ist ungültig.</span>`;
            return;
        }
        const majorityThreshold = Math.floor(actualParliamentSize / 2) + 1;

        let selectedPartiesInCoalition = [];
        let coalitionSeats = 0;
        checkboxes.forEach(cb => {
            const partyId = cb.value;
            const party = this.partiesForCoalition.find(p => String(p.id) === partyId);
            if (party) {
                selectedPartiesInCoalition.push(party);
                coalitionSeats += party.seats;
            }
        });

        if (selectedPartiesInCoalition.length === 0) {
            this.resultContainer.innerHTML = "Bitte wählen Sie mindestens eine Partei für die Koalitionsprüfung aus.";
            return;
        }

        const partyNames = selectedPartiesInCoalition.map(p => `<span style="color:${p.color}; font-weight:bold;">${p.abbreviation}</span>`).join(" + ");
        let resultHTML = `Mögliche Koalition: ${partyNames}<br>`;
        resultHTML += `Sitze gesamt: <strong>${coalitionSeats}</strong> von ${actualParliamentSize}<br>`;

        if (coalitionSeats >= majorityThreshold) {
            resultHTML += `<span class="majority">Diese Koalition hätte eine Mehrheit von ${coalitionSeats - majorityThreshold + 1} Stimme(n).</span>`;
        } else {
            resultHTML += `<span class="no-majority">Diese Koalition hätte keine Mehrheit (fehlen ${majorityThreshold - coalitionSeats} Stimme(n)).</span>`;
        }

        if (this.lotteryWasIndicated) {
            if (this.isPivotalLottery) {
                resultHTML += `<br><p style="color:var(--danger-color); font-size:0.9em;"><strong>ACHTUNG:</strong> Ein Losverfahren KÖNNTE die tatsächlichen Mehrheitsverhältnisse maßgeblich beeinflussen!</p>`;
            } else {
                resultHTML += `<br><p style="color:var(--warning-color); font-size:0.9em;">Hinweis: Ein Losverfahren trat auf, beeinflusst die Mehrheiten hier aber voraussichtlich nicht wesentlich.</p>`;
            }
        }
        this.resultContainer.innerHTML = resultHTML;
    }

    findAndDisplayAutomatedCoaltions(partiesWithSeatsInput, majorityThreshold, lotteryHappened = false, isPivotalLotteryParam = false, actualParliamentSize = null) {
        if (!this.autoResultsContainer) return;
        this.autoResultsContainer.innerHTML = '';
        const partiesWithSeats = [...partiesWithSeatsInput].sort((a, b) => b.seats - a.seats);

        const displayParliamentSize = actualParliamentSize !== null ? actualParliamentSize : partiesWithSeats.reduce((s,p)=>s+p.seats,0);
        const h3Automated = this.autoResultsContainer.closest('.automated-coalitions')?.querySelector('h3');

        if (h3Automated) {
            h3Automated.innerHTML = `Automatisch gefundene Mehrheitskoalitionen <small>(Mehrheit: ${majorityThreshold} von ${displayParliamentSize} Sitzen)</small>`;
        }

        if (lotteryHappened) {
            const warningP = document.createElement('p');
            if (isPivotalLotteryParam) {
                warningP.innerHTML = `<strong style="color:var(--danger-color);">ACHTUNG:</strong> Die Koalitionsmehrheiten basieren auf einer deterministischen Zuteilung von Los-Sitzen. Der Ausgang eines echten Losverfahrens KÖNNTE die Mehrheitsverhältnisse maßgeblich verändern!`;
            } else {
                warningP.innerHTML = `<strong style="color:var(--warning-color);">Hinweis:</strong> Die Koalitionsmehrheiten basieren auf einer deterministischen Zuteilung von Los-Sitzen. Dies beeinflusst die Mehrheiten hier aber voraussichtlich nicht wesentlich.`;
            }
            this.autoResultsContainer.insertBefore(warningP, this.autoResultsContainer.firstChild);
        }

        if (partiesWithSeats.length === 0) {
            this.autoResultsContainer.innerHTML = '<p class="no-coalitions-found">Keine Parteien mit Sitzen für Koalitionsbildung (nach Sperrklausel).</p>';
            return;
        }

        const singlePartyMajority = partiesWithSeats.find(p => p.seats >= majorityThreshold);
        if (singlePartyMajority) {
            if (h3Automated) h3Automated.innerHTML = `Absolute Mehrheit für eine Partei <small>(Mehrheit: ${majorityThreshold} von ${displayParliamentSize} Sitzen)</small>:`;
            const p = document.createElement('p');
            p.innerHTML = `<span style="color:${singlePartyMajority.color}; font-weight:bold;">${singlePartyMajority.abbreviation}</span> (Sitze: ${singlePartyMajority.seats}, Mehrheit von ${singlePartyMajority.seats - majorityThreshold + 1} Stimme(n))`;
            this.autoResultsContainer.appendChild(p);
            return;
        }

        const maxPartners = Math.min(4, partiesWithSeats.length);
        let foundMinimalMajorityCoalitions = [];
        let foundMinimalPartnerCount = Infinity;

        for (let numPartners = 2; numPartners <= maxPartners; numPartners++) {
            if (foundMinimalPartnerCount !== Infinity && numPartners > foundMinimalPartnerCount) {
                break;
            }
            const generateNPartnerCombinations = (startIndex, currentCombo) => {
                if (currentCombo.length === numPartners) {
                    const currentSeats = currentCombo.reduce((sum, p) => sum + p.seats, 0);
                    if (currentSeats >= majorityThreshold) {
                        if (currentCombo.length < foundMinimalPartnerCount) {
                            foundMinimalPartnerCount = currentCombo.length;
                            foundMinimalMajorityCoalitions = [{ parties: [...currentCombo].sort((a,b) => b.seats - a.seats), seats: currentSeats }];
                        } else if (currentCombo.length === foundMinimalPartnerCount) {
                            const combinationExists = foundMinimalMajorityCoalitions.some(existingCoal =>
                                existingCoal.parties.length === currentCombo.length &&
                                existingCoal.parties.every(p1 => currentCombo.some(p2 => p1.id === p2.id))
                            );
                            if (!combinationExists) {
                                foundMinimalMajorityCoalitions.push({ parties: [...currentCombo].sort((a,b) => b.seats - a.seats), seats: currentSeats });
                            }
                        }
                    }
                    return;
                }
                if (startIndex >= partiesWithSeats.length) return;

                currentCombo.push(partiesWithSeats[startIndex]);
                generateNPartnerCombinations(startIndex + 1, currentCombo);
                currentCombo.pop();
                if (partiesWithSeats.length - (startIndex + 1) >= numPartners - currentCombo.length) {
                    generateNPartnerCombinations(startIndex + 1, currentCombo);
                }
            };
            generateNPartnerCombinations(0, []);
        }

        if (foundMinimalMajorityCoalitions.length > 0) {
            if (h3Automated) {
                h3Automated.innerHTML = `Kleinste ${foundMinimalPartnerCount > 1 ? foundMinimalPartnerCount + 'er-' : ''}Mehrheitskoalitionen <small>(Mehrheit: ${majorityThreshold} von ${displayParliamentSize} Sitzen)</small>`;
            }
            foundMinimalMajorityCoalitions.sort((a, b) => b.seats - a.seats);
            const uniqueCoalitions = [];
            const displayedCombinations = new Set();
            foundMinimalMajorityCoalitions.forEach(coal => {
                const partyIds = coal.parties.map(p => p.id).sort().join('-');
                if (!displayedCombinations.has(partyIds)) {
                    uniqueCoalitions.push(coal);
                    displayedCombinations.add(partyIds);
                }
            });

            uniqueCoalitions.forEach(coal => {
                const pElement = document.createElement('p');
                const partyNames = coal.parties.map(party => `<span style="color:${party.color}; font-weight:bold;">${party.abbreviation}</span>`).join(" + ");
                pElement.innerHTML = `${partyNames} (Sitze: ${coal.seats}, Mehrheit von ${coal.seats - majorityThreshold + 1} Stimme(n))`;
                this.autoResultsContainer.appendChild(pElement);
            });
        } else {
            if (h3Automated) h3Automated.innerHTML = `Automatisch gefundene Mehrheitskoalitionen <small>(Mehrheit: ${majorityThreshold} von ${displayParliamentSize} Sitzen)</small>`;
            this.autoResultsContainer.innerHTML = `<p class="no-coalitions-found">Keine Mehrheitskoalitionen mit bis zu ${maxPartners} Partnern gefunden.</p>`;
        }
    }

    clearAutomatedResults() {
        if (this.autoResultsContainer) {
            this.autoResultsContainer.innerHTML = '';
            const h3Automated = this.autoResultsContainer.closest('.automated-coalitions')?.querySelector('h3');
            if (h3Automated) {
                h3Automated.textContent = 'Automatisch gefundene Mehrheitskoalitionen';
            }
        }
    }
}

