class AppPersistence {
    constructor(app) {
        this.app = app;
    }

    saveState() {
        if (this.app.isResetting) {
            return;
        }

        const state = {
            appMode: this.app.DOM.appModeSelection.querySelector('.tab.active').dataset.mode,
            nrwState: {
                inputMode: this.app._getNrwInputMode(),
                councilSize: this.app.DOM.councilSize.value,
                parties: this.app._getPartiesFromUI()
            },
            simpleState: {
                procedure: this.app.appState.getSimpleProcedure(),
                seatSizes: this.app.appState.getSimpleSeatSizes().filter((value) => value.trim() !== ''),
                proposals: this.app._getProposalsFromUI()
            },
            committeeState: {
                seatSizes: this.app.appState.getCommitteeSeatSizes().filter((value) => value.trim() !== ''),
                presentVotes: this.app.appState.getCommitteePresentVotes(),
                factionAlliances: this.app.appState.getCommitteeFactionAlliances()
            },
            customColorMappings: this.app.state.customColorMappings
        };

        try {
            localStorage.setItem(this.app.storageKey, JSON.stringify(state));
            console.log('Anwendungs-Status gespeichert.');
        } catch (error) {
            console.error('Fehler beim Speichern des Anwendungs-Status:', error);
        }
    }

    loadState() {
        const savedState = localStorage.getItem(this.app.storageKey);
        if (!savedState) {
            console.log('Kein gespeicherter Status gefunden.');
            return;
        }

        let state;
        try {
            state = JSON.parse(savedState);
        } catch (error) {
            console.error('Gespeicherter Status konnte nicht geladen werden:', error);
            localStorage.removeItem(this.app.storageKey);
            return;
        }

        if (!state) {
            return;
        }

        if (state.nrwState) {
            this.app.clearAllParties(true);
            if (state.nrwState.parties && Array.isArray(state.nrwState.parties)) {
                state.nrwState.parties.forEach((party) => {
                    this.app.addParty(party.abbreviation, party.votes, party.directMandates, party.color, party.seats, party.id);
                });
            }
            this.app.DOM.councilSize.value = state.nrwState.councilSize || '66';

            const nrwMode = state.nrwState.inputMode || 'election';
            const tabElement = this.app.DOM.nrwInputModeTabs.querySelector(`.tab[data-mode="${nrwMode}"]`);

            this.app.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="election"]').classList.add('active');
            this.app.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="direct"]').classList.remove('active');

            if (tabElement) {
                this.app.switchNrwInputMode(tabElement);
            } else {
                this.app.toggleInputMode(nrwMode);
            }
        }

        if (state.simpleState) {
            this.app.clearAllProposals(true);
            if (state.simpleState.proposals && Array.isArray(state.simpleState.proposals)) {
                state.simpleState.proposals.forEach((proposal) => {
                    this.app.addProposal(proposal.abbreviation, proposal.votes, proposal.color, proposal.id);
                });
            }
            this.app.appState.setSimpleProcedure(state.simpleState.procedure || 'hare');
            this.app.appState.setSimpleSeatSizes(state.simpleState.seatSizes);
            this.app.renderSimpleSizeInputs();
        }

        const committeeState = state.committeeState || {
            seatSizes: ['19'],
            presentVotes: state.nrwState?.presentVotes || [],
            factionAlliances: []
        };

        this.app.appState.setCommitteeSeatSizes(committeeState.seatSizes);
        this.app.appState.setCommitteePresentVotes(committeeState.presentVotes);
        this.app.appState.setCommitteeFactionAlliances(committeeState.factionAlliances);
        this.app.renderCommitteeSizeInputs();

        const appMode = state.appMode || 'simple';
        this.app.switchAppMode(appMode);

        if (state.nrwState && state.nrwState.parties && state.nrwState.parties.length > 0) {
            this.app.calculateCouncilSeats();
            this.app.appState.setCommitteePresentVotes(committeeState.presentVotes);
            this.app.appState.setCommitteeFactionAlliances(committeeState.factionAlliances);
            this.app.renderCommitteeVotingInputs();
            this.app.renderFraktionenForGemeinschaft();
            this.app.updateTotalPresentVotes();
        }

        if (state.customColorMappings && Array.isArray(state.customColorMappings)) {
            this.app.state.customColorMappings = state.customColorMappings;
        }

        this.app.DOM.presetSelect.value = 'user_saved_state';
        this.app.state.currentPresetId = 'user_saved_state';

        console.log('Anwendungs-Status wiederhergestellt.');
    }
}
