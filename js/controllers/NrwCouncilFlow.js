class NrwCouncilFlow {
    constructor(app) {
        this.app = app;
    }

    addParty(name = '', votes = 0, directMandates = 0, color = '', seats = 0, id = null) {
        const partyId = id || `party-${this.app.partyIdCounter++}`;

        if (id) {
            const numericId = parseInt(id.split('-')[1]);
            if (!isNaN(numericId) && numericId >= this.app.partyIdCounter) {
                this.app.partyIdCounter = numericId + 1;
            }
        }

        const partyColor = color || this.app.defaultColors[this.app.partyIdCounter % this.app.defaultColors.length];
        this.app.appState.addNrwParty({
            id: partyId,
            color: partyColor,
            abbreviation: name,
            votes,
            directMandates,
            seats,
            isListApproved: true
        });
        this.renderPartyList();
    }

    async clearAllParties(skipConfirm = false) {
        if (!skipConfirm) {
            const confirmed = await this.app._showConfirmationModal(
                'Best\u00e4tigung erforderlich',
                'M\u00f6chten Sie wirklich <strong>alle Parteien</strong> l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
                'Alle l\u00f6schen',
                'btn-danger'
            );
            if (!confirmed) return;
        }

        this.app.appState.clearNrwParties();
        this.renderPartyList();
    }

    resetAllVotes() {
        this.app.appState.resetNrwPartyVotes();
        this.renderPartyList();
    }

    getParties() {
        return this.app.appState.getNrwParties();
    }

    getInputMode() {
        const activeModeTab = this.app.DOM.nrwInputModeTabs.querySelector('.tab.active');
        return activeModeTab ? activeModeTab.dataset.mode : 'election';
    }

    renderPartyList() {
        const parties = this.app.appState.getNrwParties();
        const isDirectMode = this.getInputMode() === 'direct';

        const partyBindings = renderNrwCouncilElectionPartyList(this.app.DOM.partyListElement, parties, {
            isDirectMode,
            getColorPickerValue: (color) => this.app._getColorPickerValue(color)
        });

        partyBindings.forEach(({ party, colorPreview, colorInput, nameInput, votesInput, directMandatesInput, seatsInput, removeButton }) => {
            colorPreview.addEventListener('click', () => colorInput.click());
            colorPreview.tabIndex = 0;
            colorPreview.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    colorInput.click();
                }
            });

            colorInput.addEventListener('change', () => {
                colorPreview.style.background = colorInput.value;
                this.app.appState.updateNrwParty(party.id, { color: colorInput.value });
            });

            nameInput.addEventListener('input', () => {
                this.app.appState.updateNrwParty(party.id, { abbreviation: nameInput.value });
                this.app._updateColorFromName(nameInput.value, colorPreview, colorInput);
                this.app.appState.updateNrwParty(party.id, { color: colorPreview.style.background });
            });

            votesInput.addEventListener('input', () => {
                this.app.appState.updateNrwParty(party.id, { votes: parseInt(votesInput.value, 10) || 0 });
            });

            directMandatesInput.addEventListener('input', () => {
                this.app.appState.updateNrwParty(party.id, { directMandates: parseInt(directMandatesInput.value, 10) || 0 });
            });

            seatsInput.addEventListener('input', () => {
                this.app.appState.updateNrwParty(party.id, { seats: parseInt(seatsInput.value, 10) || 0 });
            });

            removeButton.addEventListener('click', () => {
                this.app.appState.removeNrwParty(party.id);
                this.renderPartyList();
            });
        });

        this.toggleInputMode(this.getInputMode());
    }

    toggleInputMode(mode) {
        const isDirectMode = mode === 'direct';

        this.app.DOM.partyItemHeader.querySelector('[data-header="votes"]').style.display = isDirectMode ? 'none' : 'block';
        this.app.DOM.partyItemHeader.querySelector('[data-header="directMandates"]').style.display = isDirectMode ? 'none' : 'block';
        this.app.DOM.partyItemHeader.querySelector('[data-header="seats"]').style.display = isDirectMode ? 'block' : 'none';

        this.app.DOM.partyListElement.querySelectorAll('.party-item').forEach((item) => {
            item.querySelector('[data-role="votes"]').style.display = isDirectMode ? 'none' : 'block';
            item.querySelector('[data-role="directMandates"]').style.display = isDirectMode ? 'none' : 'block';
            item.querySelector('[data-role="seats"]').style.display = isDirectMode ? 'block' : 'none';
        });

        this.app.DOM.councilSizeGroup.style.display = isDirectMode ? 'none' : 'block';
        this.app.DOM.calculateCouncilButton.textContent = isDirectMode ? 'Ratssitze \u00fcbernehmen & weiter' : 'Ratssitze berechnen';
    }

    switchInputMode(clickedTab) {
        if (clickedTab.classList.contains('active')) {
            return;
        }

        const newMode = clickedTab.dataset.mode;
        const oldTab = this.app.DOM.nrwInputModeTabs.querySelector('.tab.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }

        clickedTab.classList.add('active');
        this.toggleInputMode(newMode);
    }

    calculateCouncilSeats() {
        const mode = this.getInputMode();
        if (mode === 'direct') {
            this.calculateDirectCouncilSeats();
            return;
        }

        this.runCouncilCalculation();
    }

    calculateDirectCouncilSeats() {
        const partiesData = this.getParties();
        this.app.state.councilResults = partiesData.map((party) => ({
            id: party.id,
            abbreviation: party.abbreviation,
            color: party.color,
            votes: party.votes,
            seats: party.seats,
            directMandatesAwarded: 0,
            listSeatsAwarded: party.seats
        }));

        this.renderCouncilResults(this.app.state.councilResults, partiesData, true);
        renderProtocolEntries(this.app.DOM.councilAllocationSteps, [
            { type: 'paragraph', text: 'Die Ratssitze wurden direkt eingegeben. Es fand keine Berechnung statt.' }
        ]);

        this.app.DOM.councilResultsSection.style.display = 'block';
        this.app.DOM.votingSimulationSection.style.display = 'block';
        this.app.DOM.committeeSection.style.display = 'block';

        this.app.prepareVotingSimulation();
        this.app.prepareCommitteeStep();
        this.renderCharts(this.app.state.councilResults, 0);
    }

    runCouncilCalculation() {
        const partiesData = this.getParties();
        const initialTotalSeats = parseInt(this.app.DOM.councilSize.value) || 0;

        if (partiesData.length === 0 || initialTotalSeats === 0) {
            this.app._showModal('Eingabefehler', '<p>Bitte f\u00fcgen Sie Parteien hinzu und legen Sie die Ratsgr\u00f6\u00dfe fest.</p>');
            return;
        }

        const totalVotesForProportionality = partiesData.reduce((sum, party) => sum + party.votes, 0);
        const allocator = new this.app.calcLib.NrwKWahlGCalculator(
            new this.app.calcLib.SainteLagueAllocator()
        );
        const result = allocator.calculate(partiesData, initialTotalSeats, totalVotesForProportionality, {});

        this.app.state.councilResults = result.allocatedParties;
        this.renderCouncilResults(result, partiesData, false);
        renderProtocolEntries(this.app.DOM.councilAllocationSteps, result.protocolEntries);

        this.app.DOM.councilResultsSection.style.display = 'block';
        this.app.DOM.votingSimulationSection.style.display = 'block';
        this.app.DOM.committeeSection.style.display = 'block';

        this.app.prepareVotingSimulation();
        this.app.prepareCommitteeStep();

        const councilResultsWithVotes = this.app.state.councilResults.map((resultParty) => {
            const inputData = partiesData.find((party) => party.id === resultParty.id);
            return {
                ...resultParty,
                votes: inputData ? inputData.votes : 0
            };
        });
        this.renderCharts(councilResultsWithVotes, totalVotesForProportionality);
    }

    renderCouncilResults(result, partyInputs, isDirectMode = false) {
        const allocatedParties = result.allocatedParties || result;
        const totalSeats = allocatedParties.reduce((sum, party) => sum + (party.seats || 0), 0);

        this.app.currentResultsData = { totalSeats };

        renderCouncilResultsTable({
            tableBody: this.app.DOM.councilResultsTableBody,
            resultsSection: this.app.DOM.councilResultsSection,
            detailsContainer: document.getElementById('council-protocol-details'),
            result,
            partyInputs,
            isDirectMode,
            totalSeatsSummaryElement: this.app.DOM.councilTotalSeatsSummary,
            totalSeatsValueElement: this.app.DOM.councilTotalSeatsValue,
            totalSeats
        });
    }

    renderCharts(councilResults, totalVotes) {
        try {
            const totalSeatsForChart = councilResults.reduce((sum, party) => sum + party.seats, 0);
            this.app.nrwVoteBarChartRenderer.render(councilResults, totalVotes);
            this.app.nrwHemicycleRenderer.render(councilResults, totalSeatsForChart);

            if (this.app.DOM.nrwSeatHemicycleTotal) {
                this.app.DOM.nrwSeatHemicycleTotal.textContent = `Gesamtsitzzahl: ${totalSeatsForChart.toLocaleString('de-DE')}`;
            }

            this.app.DOM.nrwChartsContainer.style.display = 'flex';
        } catch (error) {
            console.error('Fehler beim Rendern der NRW-Diagramme:', error);
            this.app.DOM.nrwChartsContainer.style.display = 'none';
        }
    }
}
