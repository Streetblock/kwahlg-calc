class CommitteeFlow {
    constructor(app) {
        this.app = app;
    }

    getCalculationMode() {
        const activeCommitteeTab = this.app.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        return activeCommitteeTab ? activeCommitteeTab.dataset.mode : 'hare';
    }

    switchCalculationMode(clickedTab) {
        if (clickedTab.classList.contains('active')) {
            return;
        }

        const oldTab = this.app.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }

        clickedTab.classList.add('active');

        const newMode = clickedTab.dataset.mode;
        this.app.DOM.calculateCommitteesButton.textContent = newMode === 'dhondt'
            ? 'Zugriffsreihenfolge berechnen'
            : 'Ausschusssitze berechnen';
    }

    prepareVotingSimulation() {
        const existingPresentVotes = this.app.appState.getCommitteePresentVotes();
        const defaultPresentVotes = this.app.state.councilResults
            .filter((party) => party.seats > 0)
            .map((party) => {
                const existingVote = existingPresentVotes.find((entry) => entry.partyId === party.id);
                return {
                    partyId: party.id,
                    present: existingVote ? existingVote.present : party.seats
                };
            });

        this.app.appState.setCommitteePresentVotes(defaultPresentVotes);
        this.renderVotingInputs();
        this.updateTotalPresentVotes();
    }

    renderVotingInputs() {
        const votingInputs = renderCommitteeVotingInputs(
            this.app.DOM.votingStrengthContainer,
            this.app.state.councilResults,
            this.app.appState.getCommitteePresentVotes()
        );

        votingInputs.forEach(({ party, input }) => {
            input.addEventListener('input', () => {
                this.app.appState.updateCommitteePresentVote(party.id, parseInt(input.value, 10) || 0);
                this.updateTotalPresentVotes();
            });
        });
    }

    updateTotalPresentVotes() {
        const totalVotes = this.app.appState.getCommitteePresentVotes()
            .reduce((sum, entry) => sum + (parseInt(entry.present, 10) || 0), 0);
        this.app.DOM.totalPresentVotes.textContent = totalVotes;
    }

    addCommitteeSizeInput() {
        this.app.appState.addCommitteeSeatSize('');
        this.renderCommitteeSizeInputs();
    }

    renderCommitteeSizeInputs() {
        const sizeInputs = renderCommitteeSizeInputList(
            this.app.DOM.committeeSizesContainer,
            this.app.appState.getCommitteeSeatSizes()
        );

        sizeInputs.forEach(({ index, input, removeButton }) => {
            input.addEventListener('input', () => {
                this.app.appState.updateCommitteeSeatSize(index, input.value);
            });

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.app.appState.removeCommitteeSeatSize(index);
                    this.renderCommitteeSizeInputs();
                });
            }
        });
    }

    prepareCommitteeStep() {
        this.app.appState.clearCommitteeFactionAlliances();
        this.renderFactionAllianceList();
    }

    createFactionAlliance() {
        const selectedCheckboxes = this.app.DOM.factionAllianceListElement.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 2) {
            this.app._showModal('Hinweis', '<p>Bitte mindestens zwei Fraktionen/Mitglieder für eine Fraktionsgemeinschaft auswählen.</p>');
            return;
        }

        const memberIds = Array.from(selectedCheckboxes).map((checkbox) => checkbox.closest('.fraktion-item').dataset.fraktionId);
        const memberFactions = this.app.state.councilResults.filter((faction) => memberIds.includes(faction.id));
        const totalSeats = memberFactions.reduce((sum, faction) => sum + faction.seats, 0);
        const name = memberFactions.map((faction) => faction.abbreviation).join(' + ');
        const memberColors = memberFactions.map((faction) => faction.color);

        this.app.appState.addCommitteeFactionAlliance({
            name,
            totalSitze: totalSeats,
            memberIds,
            color: this.app._createGradient(memberColors)
        });

        this.renderFactionAllianceList();
    }

    dissolveFactionAlliances() {
        this.app.appState.clearCommitteeFactionAlliances();
        this.renderFactionAllianceList();
    }

    renderFactionAllianceList() {
        renderCommitteeFactionAllianceList(
            this.app.DOM.factionAllianceListElement,
            this.app.state.councilResults,
            this.app.appState.getCommitteeFactionAlliances()
        );
    }

    calculateCommitteeSeats() {
        const committeeSizes = this.app.appState.getCommitteeSeatSizes()
            .map((value) => parseInt(value, 10))
            .filter((value) => !isNaN(value) && value > 0);

        if (committeeSizes.length === 0) {
            this.app._showModal('Eingabefehler', '<p>Bitte geben Sie mindestens eine gültige Ausschussgröße an.</p>');
            return;
        }

        const manualVotes = {};
        this.app.appState.getCommitteePresentVotes().forEach((entry) => {
            manualVotes[entry.partyId] = parseInt(entry.present, 10) || 0;
        });

        const committeeCalculation = this.app.committeeCalculator.calculate({
            committeeSizes,
            councilResults: this.app.state.councilResults,
            factionAlliances: this.app.appState.getCommitteeFactionAlliances(),
            manualVotes,
            mode: this.getCalculationMode()
        });

        this.app.DOM.committeeResultsSection.querySelector('h3').textContent = committeeCalculation.title;

        let finalNoteHtml = '';
        if (committeeCalculation.displayMode === 'protocol') {
            this.app.DOM.committeeTableWrapper.style.display = 'none';
            this.app.DOM.committeeProtocolContainer.style.display = 'block';
            renderCommitteeProtocol(this.app.DOM.committeeProtocolContainer, committeeCalculation.protocolEntries);

            if (committeeCalculation.individualMembers.length > 0) {
                const memberNames = committeeCalculation.individualMembers.map((member) => `<strong>${member.abbreviation}</strong>`).join(', ');
                finalNoteHtml += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gemäß § 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehören.</p>`;
            }
        } else {
            this.app.DOM.committeeTableWrapper.style.display = 'block';
            this.app.DOM.committeeProtocolContainer.style.display = 'none';
            finalNoteHtml = this.renderCommitteeResults(
                committeeCalculation.results,
                committeeCalculation.calculationBasis,
                committeeSizes,
                committeeCalculation.individualMembers
            );
        }

        if (finalNoteHtml) {
            this.app.DOM.individualMembersNote.innerHTML = finalNoteHtml;
            this.app.DOM.individualMembersNote.style.display = 'block';
        } else {
            this.app.DOM.individualMembersNote.style.display = 'none';
        }

        this.app.DOM.committeeResultsSection.style.display = 'block';
    }

    renderCommitteeResults(results, calculationBasis, committeeSizes, individualMembers) {
        return renderCommitteeResultsTable({
            table: this.app.DOM.committeeResultsTable,
            results,
            calculationBasis,
            committeeSizes,
            individualMembers
        });
    }
}
