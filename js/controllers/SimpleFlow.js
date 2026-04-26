class SimpleFlow {
    constructor(app) {
        this.app = app;
    }

    addInitialProposals() {
        this.addProposal('Liste A', 45, '#005ea8');
        this.addProposal('Liste B', 32, '#EB001F');
        this.addProposal('Liste C', 18, '#64A12D');
    }

    addProposal(name = '', votes = 0, color = '', id = null) {
        const proposalId = id || `proposal-${this.app.proposalIdCounter++}`;

        if (id) {
            const numericId = parseInt(id.split('-')[1]);
            if (!isNaN(numericId) && numericId >= this.app.proposalIdCounter) {
                this.app.proposalIdCounter = numericId + 1;
            }
        }

        const proposalColor = color || this.app.defaultColors[this.app.proposalIdCounter % this.app.defaultColors.length];
        this.app.appState.addSimpleProposal({
            id: proposalId,
            color: proposalColor,
            abbreviation: name,
            votes
        });
        this.renderProposalList();
    }

    async clearAllProposals(skipConfirm = false) {
        if (!skipConfirm) {
            const confirmed = await this.app._showConfirmationModal(
                'Best\u00e4tigung erforderlich',
                'M\u00f6chten Sie wirklich <strong>alle Vorschl\u00e4ge</strong> l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
                'Alle l\u00f6schen',
                'btn-danger'
            );
            if (!confirmed) return;
        }

        this.app.appState.clearSimpleProposals();
        this.renderProposalList();
    }

    resetAllProposalVotes() {
        this.app.appState.resetSimpleProposalVotes();
        this.renderProposalList();
    }

    addSimpleSizeInput() {
        this.app.appState.addSimpleSeatSize('');
        this.renderSizeInputs();
    }

    getProposals() {
        return this.app.appState.getSimpleProposals();
    }

    renderProposalList() {
        const proposals = this.app.appState.getSimpleProposals();
        const proposalInputs = renderSimpleProposalList(this.app.DOM.simpleProposalsContainer, proposals, {
            getColorPickerValue: (color) => this.app._getColorPickerValue(color)
        });

        proposalInputs.forEach(({ proposal, colorPreview, colorInput, nameInput, votesInput, removeButton }) => {
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
                this.app.appState.updateSimpleProposal(proposal.id, { color: colorInput.value });
            });

            nameInput.addEventListener('input', () => {
                this.app.appState.updateSimpleProposal(proposal.id, { abbreviation: nameInput.value || 'Unbenannt' });
                this.app._updateColorFromName(nameInput.value, colorPreview, colorInput);
                this.app.appState.updateSimpleProposal(proposal.id, { color: colorPreview.style.background });
            });

            votesInput.addEventListener('input', () => {
                this.app.appState.updateSimpleProposal(proposal.id, { votes: parseInt(votesInput.value, 10) || 0 });
            });

            removeButton.addEventListener('click', () => {
                this.app.appState.removeSimpleProposal(proposal.id);
                this.renderProposalList();
            });
        });
    }

    renderSizeInputs() {
        const seatSizes = this.app.appState.getSimpleSeatSizes();
        const sizeInputs = renderSimpleSizeInputList(
            this.app.DOM.simpleSizesContainer,
            seatSizes,
            this.app.appState.getSimpleProcedure(),
            { procedureSelect: this.app.DOM.simpleProcedure }
        );

        sizeInputs.forEach(({ index, input, removeButton }) => {
            input.addEventListener('input', () => {
                this.app.appState.updateSimpleSeatSize(index, input.value);
            });

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.app.appState.removeSimpleSeatSize(index);
                    this.renderSizeInputs();
                });
            }
        });
    }

    runCalculation() {
        const simpleSizes = this.app.appState.getSimpleSeatSizes()
            .map((value) => parseInt(value, 10))
            .filter((value) => !isNaN(value) && value > 0);

        const procedure = this.app.appState.getSimpleProcedure();
        const proposalsData = this.getProposals();
        const totalVotes = proposalsData.reduce((sum, proposal) => sum + proposal.votes, 0);

        if (proposalsData.length === 0 || simpleSizes.length === 0 || totalVotes === 0) {
            this.app._showModal('Eingabefehler', '<p>Bitte Vorschläge mit Stimmen und mindestens eine Sitzanzahl > 0 eingeben.</p>');
            return;
        }

        let allocator;
        switch (procedure) {
            case 'hare':
                allocator = new this.app.calcLib.HareNiemeyerAllocator();
                break;
            case 'sainte':
                allocator = new this.app.calcLib.SainteLagueAllocator();
                break;
            case 'dhondt':
                allocator = new this.app.calcLib.DHondtAllocator();
                break;
            case 'nrw-bezirksvertretung':
                allocator = new this.app.calcLib.NrwBezirksvertretungAllocator();
                break;
            default:
                return;
        }

        const results = {};
        const protocolEntries = [];

        simpleSizes.forEach((size) => {
            const result = allocator.calculate(proposalsData, size, totalVotes);
            results[size] = result;
            protocolEntries.push(...(result.protocolEntries || []));
            protocolEntries.push({ type: 'separator' });
        });

        renderProtocolEntries(this.app.DOM.simpleAllocationSteps, protocolEntries);
        this.renderResults(results, proposalsData, totalVotes, simpleSizes);
        this.renderCharts(results, proposalsData, totalVotes, simpleSizes);
    }

    renderResults(results, proposalsData, totalVotes, simpleSizes) {
        renderSimpleResultsTable({
            table: this.app.DOM.simpleResultsTable,
            tieNoteContainer: this.app.DOM.simpleTieNoteContainer,
            results,
            proposalsData,
            totalVotes,
            simpleSizes
        });
        this.app.DOM.simpleResultsSection.style.display = 'block';
    }

    renderCharts(results, proposalsData, totalVotes, simpleSizes) {
        try {
            if (simpleSizes.length > 0) {
                const firstSize = simpleSizes[0];
                const resultsForFirstSize = results[firstSize];
                const simpleDataForCharts = proposalsData.map((proposal) => {
                    const partyResult = resultsForFirstSize.partyResults.find((party) => party.id === proposal.id);
                    return {
                        ...proposal,
                        seats: partyResult ? partyResult.proportionalSeats : 0
                    };
                });

                const totalSeatsForChart = simpleDataForCharts.reduce((sum, proposal) => sum + proposal.seats, 0);
                this.app.simpleVoteBarChartRenderer.render(simpleDataForCharts, totalVotes);
                this.app.simpleHemicycleRenderer.render(simpleDataForCharts, totalSeatsForChart);
                this.app.DOM.simpleChartsContainer.style.display = 'flex';
            } else {
                this.app.DOM.simpleChartsContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Fehler beim Rendern der Simple-Diagramme:', error);
            this.app.DOM.simpleChartsContainer.style.display = 'none';
        }
    }
}
