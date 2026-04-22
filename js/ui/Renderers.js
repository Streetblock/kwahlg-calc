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
        // Filtere Parteien, die tatsÃ¤chlich Sitze haben und nicht eliminiert sind
        this.partiesForCoalition = parties.filter(p => p.seats > 0 && !p.isEliminated);
        if (!this.listContainer) return; // Sicherstellen, dass Container existiert
        this.listContainer.innerHTML = ''; // Leere vorherige Liste

        // KORREKTUR: PrÃ¼fen, ob this.totalSeatsInput existiert, bevor .value gelesen wird
        const actualParliamentSize = (app && app.currentResultsData && app.currentResultsData.totalSeats !== undefined)
                                     ? app.currentResultsData.totalSeats
                                     : (this.totalSeatsInput ? parseInt(this.totalSeatsInput.value) : NaN); // Fallback auf NaN

        if (isNaN(actualParliamentSize) || actualParliamentSize <= 0) {
            this.listContainer.innerHTML = '<p>Keine gÃ¼ltige ParlamentsgrÃ¶ÃŸe fÃ¼r Koalitionsanalyse.</p>';
            return;
        }
        const majorityThreshold = Math.floor(actualParliamentSize / 2) + 1;

        const header = document.createElement('p');
        header.innerHTML = `WÃ¤hlen Sie Parteien aus. BenÃ¶tigte Mehrheit: <strong>${majorityThreshold}</strong> Sitze (bei ${actualParliamentSize} Gesamtsitzen).`;
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

        // KORREKTUR: PrÃ¼fen, ob this.totalSeatsInput existiert
        const actualParliamentSize = (app && app.currentResultsData && app.currentResultsData.totalSeats !== undefined)
                                     ? app.currentResultsData.totalSeats
                                     : (this.totalSeatsInput ? parseInt(this.totalSeatsInput.value) : NaN); // Fallback auf NaN

        if (isNaN(actualParliamentSize) || actualParliamentSize <= 0) {
            this.resultContainer.innerHTML = `<span class="no-majority">Gesamtzahl der Sitze ist ungÃ¼ltig.</span>`;
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
            this.resultContainer.innerHTML = "Bitte wÃ¤hlen Sie mindestens eine Partei fÃ¼r die KoalitionsprÃ¼fung aus.";
            return;
        }

        const partyNames = selectedPartiesInCoalition.map(p => `<span style="color:${p.color}; font-weight:bold;">${p.abbreviation}</span>`).join(" + ");
        let resultHTML = `MÃ¶gliche Koalition: ${partyNames}<br>`;
        resultHTML += `Sitze gesamt: <strong>${coalitionSeats}</strong> von ${actualParliamentSize}<br>`;

        if (coalitionSeats >= majorityThreshold) {
            resultHTML += `<span class="majority">Diese Koalition hÃ¤tte eine Mehrheit von ${coalitionSeats - majorityThreshold + 1} Stimme(n).</span>`;
        } else {
            resultHTML += `<span class="no-majority">Diese Koalition hÃ¤tte keine Mehrheit (fehlen ${majorityThreshold - coalitionSeats} Stimme(n)).</span>`;
        }

        if (this.lotteryWasIndicated) {
            if (this.isPivotalLottery) {
                resultHTML += `<br><p style="color:var(--danger-color); font-size:0.9em;"><strong>ACHTUNG:</strong> Ein Losverfahren KÃ–NNTE die tatsÃ¤chlichen MehrheitsverhÃ¤ltnisse maÃŸgeblich beeinflussen!</p>`;
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
                warningP.innerHTML = `<strong style="color:var(--danger-color);">ACHTUNG:</strong> Die Koalitionsmehrheiten basieren auf einer deterministischen Zuteilung von Los-Sitzen. Der Ausgang eines echten Losverfahrens KÃ–NNTE die MehrheitsverhÃ¤ltnisse maÃŸgeblich verÃ¤ndern!`;
            } else {
                warningP.innerHTML = `<strong style="color:var(--warning-color);">Hinweis:</strong> Die Koalitionsmehrheiten basieren auf einer deterministischen Zuteilung von Los-Sitzen. Dies beeinflusst die Mehrheiten hier aber voraussichtlich nicht wesentlich.`;
            }
            this.autoResultsContainer.insertBefore(warningP, this.autoResultsContainer.firstChild);
        }

        if (partiesWithSeats.length === 0) {
            this.autoResultsContainer.innerHTML = '<p class="no-coalitions-found">Keine Parteien mit Sitzen fÃ¼r Koalitionsbildung (nach Sperrklausel).</p>';
            return;
        }

        const singlePartyMajority = partiesWithSeats.find(p => p.seats >= majorityThreshold);
        if (singlePartyMajority) {
            if (h3Automated) h3Automated.innerHTML = `Absolute Mehrheit fÃ¼r eine Partei <small>(Mehrheit: ${majorityThreshold} von ${displayParliamentSize} Sitzen)</small>:`;
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

function renderNrwCouncilElectionPartyList(container, parties, options = {}) {
    const {
        isDirectMode = false,
        getColorPickerValue = (color) => color
    } = options;

    if (!container) return [];

    container.innerHTML = '';

    return parties.map((party) => {
        const partyElement = document.createElement('div');
        partyElement.className = 'party-item';
        partyElement.dataset.partyId = party.id;

        partyElement.innerHTML = `
            <div class="color-input-wrapper">
                <div class="color-preview" style="background: ${party.color};"></div>
                <input type="color" class="color-picker-hidden" value="${getColorPickerValue(party.color)}">
            </div>
            <input type="text" placeholder="Parteiname" value="${party.abbreviation}" class="party-name">
            <input type="number" placeholder="Stimmen" value="${party.votes}" min="0" style="text-align:right; display:${isDirectMode ? 'none' : 'block'};" data-role="votes">
            <input type="number" placeholder="Direktmandate" value="${party.directMandates}" min="0" style="text-align:right; display:${isDirectMode ? 'none' : 'block'};" data-role="directMandates">
            <input type="number" placeholder="Sitze" value="${party.seats}" min="0" style="text-align:right; display:${isDirectMode ? 'block' : 'none'}; grid-column: 3 / span 2;" data-role="seats">
            <button class="btn-remove">X</button>
        `;

        container.appendChild(partyElement);

        return {
            party,
            partyElement,
            colorPreview: partyElement.querySelector('.color-preview'),
            colorInput: partyElement.querySelector('.color-picker-hidden'),
            nameInput: partyElement.querySelector('.party-name'),
            votesInput: partyElement.querySelector('[data-role="votes"]'),
            directMandatesInput: partyElement.querySelector('[data-role="directMandates"]'),
            seatsInput: partyElement.querySelector('[data-role="seats"]'),
            removeButton: partyElement.querySelector('.btn-remove')
        };
    });
}

function renderCouncilResultsTable(options) {
    const {
        tableBody,
        resultsSection,
        detailsContainer,
        result,
        partyInputs,
        isDirectMode = false,
        totalSeatsSummaryElement,
        totalSeatsValueElement,
        totalSeats = 0
    } = options;

    if (!tableBody || !resultsSection) return;

    const allocatedParties = result.allocatedParties || result;
    const tieInfo = result.tieInfo;

    tableBody.innerHTML = '';

    if (totalSeatsSummaryElement && totalSeatsValueElement) {
        totalSeatsValueElement.textContent = totalSeats.toLocaleString('de-DE');
        totalSeatsSummaryElement.style.display = '';
    }

    resultsSection.querySelector('[data-col="votes"]').style.display = isDirectMode ? 'none' : '';
    resultsSection.querySelector('[data-col="directMandatesAwarded"]').style.display = isDirectMode ? 'none' : '';
    resultsSection.querySelector('[data-col="listSeatsAwarded"]').style.display = isDirectMode ? 'none' : '';

    allocatedParties.forEach((party) => {
        const inputData = partyInputs.find((inputParty) => inputParty.id === party.id);
        let totalSeatsCell = `<strong>${party.seats}</strong>`;

        if (tieInfo && tieInfo.partiesInvolved.includes(party.id)) {
            totalSeatsCell = `<strong>${party.seats} + ${tieInfo.claimFraction}</strong> 🎲`;
        }

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><div class="color-preview" style="background: ${party.color};"></div></td>
            <td>${party.abbreviation}</td>
            <td data-col="votes" style="display: ${isDirectMode ? 'none' : ''}">${(inputData?.votes || 0).toLocaleString('de-DE')}</td>
            <td data-col="directMandatesAwarded" style="display: ${isDirectMode ? 'none' : ''}">${party.directMandatesAwarded}</td>
            <td data-col="listSeatsAwarded" style="display: ${isDirectMode ? 'none' : ''}">${party.listSeatsAwarded}</td>
            <td>${totalSeatsCell}</td>
        `;
    });

    let tieNote = document.getElementById('council-tie-note');
    if (tieNote) tieNote.remove();

    if (!tieInfo || !detailsContainer) return;

    const tiedPartyNames = tieInfo.partiesInvolved
        .map((id) => {
            const party = partyInputs.find((inputParty) => inputParty.id === id);
            return party ? party.abbreviation : '';
        })
        .join(', ');

    tieNote = document.createElement('div');
    tieNote.id = 'council-tie-note';
    tieNote.style.padding = '15px';
    tieNote.style.backgroundColor = 'var(--light-blue)';
    tieNote.style.border = '1px solid var(--info-color)';
    tieNote.style.borderRadius = '8px';
    tieNote.style.marginTop = '15px';
    tieNote.innerHTML = `<strong>Hinweis zum Losverfahren:</strong> Für den nächsten Sitz besteht ein gleicher Anspruch zwischen <strong>${tiedPartyNames}</strong>. Das Endergebnis hängt von einem realen Losentscheid ab.`;

    detailsContainer.parentNode.insertBefore(tieNote, detailsContainer);
}



function renderSimpleProposalList(container, proposals, options = {}) {
    const {
        getColorPickerValue = (color) => color
    } = options;

    if (!container) return [];

    container.innerHTML = '';

    return proposals.map((proposal) => {
        const proposalElement = document.createElement('div');
        proposalElement.className = 'proposal-item';
        proposalElement.dataset.proposalId = proposal.id;

        proposalElement.innerHTML = `
            <div class="color-input-wrapper">
                <div class="color-preview" style="background: ${proposal.color};"></div>
                <input type="color" class="color-picker-hidden" value="${getColorPickerValue(proposal.color)}">
            </div>
            <input type="text" placeholder="Name" value="${proposal.abbreviation}" class="proposal-name">
            <input type="number" placeholder="Stimmen" value="${proposal.votes}" min="0" style="text-align:right;">
            <button class="btn-remove">X</button>
        `;

        container.appendChild(proposalElement);

        return {
            proposal,
            proposalElement,
            colorPreview: proposalElement.querySelector('.color-preview'),
            colorInput: proposalElement.querySelector('.color-picker-hidden'),
            nameInput: proposalElement.querySelector('.proposal-name'),
            votesInput: proposalElement.querySelector('input[type="number"]'),
            removeButton: proposalElement.querySelector('.btn-remove')
        };
    });
}

function renderSimpleSizeInputList(container, seatSizes, procedure, options = {}) {
    const {
        procedureSelect = null
    } = options;

    if (!container) return [];

    container.innerHTML = '';
    if (procedureSelect) {
        procedureSelect.value = procedure;
    }

    return seatSizes.map((size, index) => {
        const sizeElement = document.createElement('div');
        sizeElement.className = 'simple-size-input';

        const removeButtonHtml = index === 0 && seatSizes.length === 1
            ? ''
            : '<button class="btn-remove">X</button>';

        sizeElement.innerHTML = `<input type="number" placeholder="${index === 0 ? 'z.B. 10' : 'Weitere Größe'}" value="${size}" min="1" class="simple-size">${removeButtonHtml}`;
        container.appendChild(sizeElement);

        return {
            index,
            sizeElement,
            input: sizeElement.querySelector('input'),
            removeButton: sizeElement.querySelector('.btn-remove')
        };
    });
}

function renderSimpleResultsTable(options) {
    const {
        table,
        tieNoteContainer,
        results,
        proposalsData,
        totalVotes,
        simpleSizes
    } = options;

    if (!table) return;

    table.innerHTML = '';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.innerHTML = `<th>Farbe</th><th>Vorschlag / Liste</th><th>Stimmen</th><th>Anteil</th>`;
    simpleSizes.forEach((size) => {
        headerRow.innerHTML += `<th style="text-align: center;">Sitze (${size})</th>`;
    });

    const tbody = table.createTBody();
    const tieMessages = new Set();

    proposalsData.filter((proposal) => proposal.votes > 0).forEach((proposal) => {
        const row = tbody.insertRow();
        const voteShare = totalVotes > 0 ? (proposal.votes / totalVotes * 100) : 0;

        row.innerHTML = `
            <td><div class="color-preview" style="background: ${proposal.color};"></div></td>
            <td>${proposal.abbreviation}</td>
            <td style="text-align: right;">${proposal.votes.toLocaleString('de-DE')}</td>
            <td style="text-align: right;">${voteShare.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} %</td>
        `;

        simpleSizes.forEach((size) => {
            const resultForSize = results[size];
            const tie = resultForSize.tieInfo;
            const partyResult = resultForSize.partyResults.find((party) => party.id === proposal.id);
            const baseSeats = partyResult ? partyResult.proportionalSeats : 0;

            let cellContent = `${baseSeats}`;

            if (tie && tie.partiesInvolved.includes(proposal.id)) {
                cellContent = `<strong>${baseSeats} + ${tie.claimFraction}</strong> 🎲`;

                const tiedPartyNames = tie.partiesInvolved
                    .map((id) => proposalsData.find((proposalItem) => proposalItem.id === id)?.abbreviation || '')
                    .join(', ');

                tieMessages.add(`Für die Verteilung von <strong>${size} Sitzen</strong> besteht ein Losentscheid um <strong>${tie.seatsInContention}</strong> Sitz(e) zwischen: <strong>${tiedPartyNames}</strong> (Anspruch: ${tie.claimFraction}).`);
            }

            row.innerHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.1em;">${cellContent}</td>`;
        });
    });

    if (!tieNoteContainer) return;

    if (tieMessages.size > 0) {
        let finalNoteHTML = `<p><strong>Hinweis(e) zum Losverfahren:</strong></p><ul>`;
        tieMessages.forEach((message) => {
            finalNoteHTML += `<li>${message}</li>`;
        });
        finalNoteHTML += '</ul>';
        tieNoteContainer.innerHTML = finalNoteHTML;
        tieNoteContainer.style.display = 'block';
    } else {
        tieNoteContainer.style.display = 'none';
    }
}

function renderCommitteeResultsTable(options) {
    const {
        table,
        results,
        calculationBasis,
        committeeSizes,
        individualMembers
    } = options;

    if (!table) {
        return '';
    }

    table.innerHTML = '';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headerRow.innerHTML = `<th>Fraktion / Fraktionsgem.</th><th>Sitze im Rat</th><th>Stimmen bei Wahl</th>`;
    committeeSizes.forEach((size) => {
        headerRow.innerHTML += `<th style="text-align: center;">Ausschuss (${size} Sitze)</th>`;
    });

    const tbody = table.createTBody();
    const tieMessages = new Set();

    calculationBasis.forEach((basis) => {
        const row = tbody.insertRow();

        row.innerHTML = `
            <td style="background: ${basis.color}; color: #FFFFFF; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">
                ${basis.abbreviation}
            </td>
            <td style="text-align: right;">${basis.seatsInCouncil}</td>
            <td style="text-align: right;">${basis.votes}</td>
        `;

        committeeSizes.forEach((size) => {
            const resultForSize = results[size];
            const tie = resultForSize.tieInfo;
            const partyResult = resultForSize.partyResults.find((party) => party.id === basis.id);
            const baseSeats = partyResult ? partyResult.proportionalSeats : 0;

            let cellContent = `${baseSeats}`;

            if (tie && tie.partiesInvolved.includes(basis.id)) {
                cellContent = `<strong>${baseSeats} + ${tie.claimFraction}</strong> 🎲`;

                const tiedPartyNames = tie.partiesInvolved
                    .map((id) => {
                        const party = calculationBasis.find((basisParty) => basisParty.id === id);
                        return party ? party.abbreviation : '';
                    })
                    .join(', ');

                tieMessages.add(`Für den Ausschuss mit <strong>${size} Sitzen</strong> besteht ein Losentscheid um <strong>${tie.seatsInContention}</strong> Sitz(e) zwischen: <strong>${tiedPartyNames}</strong> (Anspruch: ${tie.claimFraction}).`);
            }

            row.innerHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.1em;">${cellContent}</td>`;
        });
    });

    let finalNoteHTML = '';
    if (individualMembers.length > 0) {
        const memberNames = individualMembers.map((member) => `<strong>${member.abbreviation}</strong>`).join(', ');
        finalNoteHTML += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gemäß § 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehören.</p>`;
    }

    if (tieMessages.size > 0) {
        finalNoteHTML += `<hr><p><strong>Hinweis(e) zum Losverfahren (Hare-Niemeyer):</strong></p><ul>`;
        tieMessages.forEach((message) => {
            finalNoteHTML += `<li>${message}</li>`;
        });
        finalNoteHTML += '</ul>';
    }

    return finalNoteHTML;
}

function renderCommitteeVotingInputs(container, councilResults, presentVotes) {
    if (!container) return [];

    container.innerHTML = '';

    return councilResults
        .filter((party) => party.seats > 0)
        .map((party) => {
            const voteEntry = presentVotes.find((entry) => entry.partyId === party.id);
            const currentVotes = voteEntry ? voteEntry.present : party.seats;

            const item = document.createElement('div');
            item.className = 'voting-item';
            item.dataset.partyId = party.id;
            item.innerHTML = `
                <label for="vote-input-${party.id}">${party.abbreviation} (max. ${party.seats} Sitze)</label>
                <input type="number" id="vote-input-${party.id}" value="${currentVotes}" min="0" max="${party.seats}">
            `;

            container.appendChild(item);

            return {
                party,
                item,
                input: item.querySelector('input')
            };
        });
}

function renderCommitteeFactionAllianceList(container, councilResults, factionAlliances) {
    if (!container) return [];

    container.innerHTML = '';
    const allMembers = councilResults.filter((party) => party.seats > 0);
    const assignedFactionIds = new Set(factionAlliances.flatMap((alliance) => alliance.memberIds));

    factionAlliances.forEach((alliance) => {
        const allianceElement = document.createElement('div');
        allianceElement.className = 'fraktionsgemeinschaft';
        allianceElement.style.background = alliance.color;

        const headerElement = document.createElement('div');
        headerElement.className = 'fraktionsgemeinschaft-header';
        headerElement.textContent = `${alliance.name} (${alliance.totalSitze} Sitze)`;
        headerElement.style.color = '#FFFFFF';
        headerElement.style.textShadow = '1px 1px 3px rgba(0,0,0,0.7)';

        allianceElement.appendChild(headerElement);
        container.appendChild(allianceElement);
    });

    const remainingMembers = allMembers.filter((member) => !assignedFactionIds.has(member.id));
    const memberItems = [];

    if (remainingMembers.length > 0) {
        const heading = document.createElement('h5');
        heading.textContent = 'Verbleibende Fraktionen / Mitglieder';
        container.appendChild(heading);

        remainingMembers.forEach((member) => {
            const item = document.createElement('li');
            item.className = 'fraktion-item';
            item.dataset.fraktionId = member.id;
            item.innerHTML = `<input type="checkbox" id="chk-${member.id}"><label for="chk-${member.id}">${member.abbreviation} (${member.seats} Sitze)</label>`;
            container.appendChild(item);
            memberItems.push({
                member,
                item,
                checkbox: item.querySelector('input')
            });
        });
    }

    return memberItems;
}

function renderCommitteeSizeInputList(container, seatSizes) {
    if (!container) return [];

    container.innerHTML = '<h4>Ausschussgrößen</h4>';

    return seatSizes.map((size, index) => {
        const sizeElement = document.createElement('div');
        sizeElement.className = 'committee-size-input';

        const removeButtonHtml = index === 0 && seatSizes.length === 1
            ? ''
            : '<button class="btn-remove">X</button>';

        sizeElement.innerHTML = `<input type="number" placeholder="${index === 0 ? 'z.B. 19' : 'Weitere Größe'}" value="${size}" min="1" class="committee-size">${removeButtonHtml}`;
        container.appendChild(sizeElement);

        return {
            index,
            sizeElement,
            input: sizeElement.querySelector('input'),
            removeButton: sizeElement.querySelector('.btn-remove')
        };
    });
}

function escapeProtocolText(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderProtocolEntry(entry) {
    if (!entry) return '';

    switch (entry.type) {
        case 'separator':
            return '<hr>';
        case 'heading':
            return `<h${entry.level || 6}>${escapeProtocolText(entry.text || '')}</h${entry.level || 6}>`;
        case 'paragraph':
            return `<p>${escapeProtocolText(entry.text || '')}</p>`;
        case 'list-item':
            return `<p>- ${escapeProtocolText(entry.text || '')}</p>`;
        case 'allocation-table': {
            const rows = (entry.rows || []).map((row) => `
                <tr>
                    <td>${row.seat}</td>
                    <td style="background:${row.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${escapeProtocolText(row.party)}</td>
                    <td>${Number(row.votes || 0).toLocaleString('de-DE')}</td>
                    <td>${escapeProtocolText(row.divisor)}</td>
                    <td>${Number(row.quotient || 0).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td>
                </tr>
            `).join('');
            return `<h6>${escapeProtocolText(entry.title || '')}</h6><table class="protocol-table"><thead><tr><th>Sitz Nr.</th><th>Partei</th><th>Stimmen</th><th>Divisor</th><th>Quotient</th></tr></thead><tbody>${rows}</tbody></table>`;
        }
        case 'hare-summary':
            return `<h6>${escapeProtocolText(entry.title || '')}</h6><p>Gesamtstimmen: ${Number(entry.totalVotes || 0).toLocaleString('de-DE')}, Sitze: ${entry.totalSeats}, Quote (Stimmen/Sitz): ${Number(entry.quota || 0).toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</p><p>Vergabe der <strong>${entry.seatsAllocatedSoFar}</strong> Sitze nach vollem Anspruch.</p>`;
        case 'hare-table': {
            const rows = (entry.rows || []).map((row) => `
                <tr>
                    <td style="background:${row.color}; color: var(--text-color); font-weight:bold; padding: 6px 8px;">${escapeProtocolText(row.abbreviation)}</td>
                    <td>${Number(row.votes || 0).toLocaleString('de-DE')}</td>
                    <td>${(Number(row.seats || 0) + Number(row.remainder || 0)).toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                    <td>${row.seats}</td>
                    <td>${Number(row.remainder || 0).toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                </tr>
            `).join('');
            return `<table class="protocol-table"><thead><tr><th>Partei</th><th>Stimmen</th><th>Anspruch (Stimmen/Quote)</th><th>Ganze Sitze</th><th>Rest</th></tr></thead><tbody>${rows}</tbody></table>`;
        }
        case 'lottery-info-list': {
            const items = (entry.items || []).map((item) => `<li><strong>Sitz Nr. ${item.firstSeatNumber}</strong>: ${escapeProtocolText(item.message || '')}</li>`).join('');
            return `<h6 style="color:var(--danger-color); margin-top:10px;">${escapeProtocolText(entry.title || '')}</h6><ul class="protocol-note" style="color:var(--danger-color); padding-left: 20px;">${items}</ul>`;
        }
        case 'tie-note':
            return `<p class="protocol-note" style="color:var(--danger-color); font-weight:bold;">${escapeProtocolText(entry.text || '')}</p>`;
        default:
            return '';
    }
}

function renderProtocolEntries(container, protocolEntries) {
    if (!container) return;
    container.innerHTML = (protocolEntries || []).map((entry) => renderProtocolEntry(entry)).join('');
}

function renderCommitteeProtocol(container, protocolEntries) {
    if (!container) return;

    const html = (protocolEntries || []).map((group) => {
        if (group.type !== 'committee-size-protocol') {
            return renderProtocolEntry(group);
        }

        return `${(group.entries || []).map((entry) => renderProtocolEntry(entry)).join('')}<hr>`;
    }).join('');

    container.innerHTML = html;
}
