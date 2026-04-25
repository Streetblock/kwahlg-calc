class AppController {
    constructor() {
        this.DOM = {
            appModeSelection: document.getElementById('app-mode-selection'),
            nrwModePanel: document.getElementById('nrw-mode-panel'),
            simpleModePanel: document.getElementById('simple-mode-panel'),
            presetSelect: document.getElementById('preset-select'),
            councilSize: document.getElementById('councilSize'),
            partyListElement: document.getElementById('party-list'),
            addPartyButton: document.getElementById('addPartyButton'),
            clearPartiesButton: document.getElementById('clearPartiesButton'),
            calculateCouncilButton: document.getElementById('calculateCouncilButton'),
            councilResultsSection: document.getElementById('council-results-section'),
            councilResultsTableBody: document.querySelector('#councilResultsTable tbody'),
            councilTotalSeatsSummary: document.getElementById('council-total-seats-summary'),
            councilTotalSeatsValue: document.getElementById('council-total-seats-value'),
            councilAllocationSteps: document.getElementById('councilAllocationSteps'),
            votingSimulationSection: document.getElementById('voting-simulation-section'),
            votingStrengthContainer: document.getElementById('voting-strength-container'),
            totalPresentVotes: document.getElementById('total-present-votes'),
            committeeSection: document.getElementById('committee-section'),
            committeeSizesContainer: document.getElementById('committee-sizes-container'),
            addCommitteeSizeBtn: document.getElementById('addCommitteeSizeBtn'),
            factionAllianceListElement: document.getElementById('faction-alliance-list'),
            createFactionAllianceButton: document.getElementById('createFraktionsgemeinschaftBtn'),
            dissolveFactionAlliancesButton: document.getElementById('dissolveFraktionsgemeinschaftenBtn'),
            calculateCommitteesButton: document.getElementById('calculateCommitteesButton'),
            committeeResultsSection: document.getElementById('committee-results-section'),
            committeeResultsTable: document.getElementById('committeeResultsTable'),

            committeeTableWrapper: document.getElementById('committee-table-wrapper'),
            committeeProtocolContainer: document.getElementById('committee-protocol-container'),

            importScenarioBtn: document.getElementById('importScenarioBtn'),
            importScenarioFile: document.getElementById('importScenarioFile'),
            exportScenarioBtn: document.getElementById('exportScenarioBtn'),
            importVoteManagerBtn: document.getElementById('importVoteManagerBtn'),
            importVoteManagerFile: document.getElementById('importVoteManagerFile'),

            committeeCalcModeTabs: document.getElementById('committee-calc-mode-tabs'),
            // NEU: IDs fÃ¼r Reset-Buttons
            resetVotesButton: document.getElementById('resetVotesButton'),
            resetProposalVotesButton: document.getElementById('resetProposalVotesButton'),

            individualMembersNote: document.getElementById('individual-members-note'),
            nrwInputModeTabs: document.getElementById('nrw-input-mode-tabs'), //modeSelection: document.getElementById('mode-selection'),
            partyItemHeader: document.querySelector('.party-item-header'),
            councilSizeGroup: document.getElementById('councilSize-group'),

            // simple-seats entfernt, simple-sizes-container hinzugefÃ¼gt
            simpleProcedure: document.getElementById('simple-procedure'),
            simpleSizesContainer: document.getElementById('simple-sizes-container'), // NEU
            addSimpleSizeBtn: document.getElementById('addSimpleSizeBtn'), // NEU
            simpleProposalsContainer: document.getElementById('simple-proposals-container'),
            addProposalButton: document.getElementById('addProposalButton'),
            clearProposalsButton: document.getElementById('clearProposalsButton'),
            manageCustomColorsBtn: document.getElementById('manageCustomColorsBtn'), // NEU
            calculateSimpleButton: document.getElementById('calculateSimpleButton'),
            simpleResultsSection: document.getElementById('simple-results-section'),
            simpleResultsTable: document.getElementById('simple-results-table'), // NEU (Referenz zur ganzen Tabelle)
            simpleAllocationSteps: document.getElementById('simpleAllocationSteps'),
            simpleProtocolDetails: document.getElementById('simple-protocol-details'),
            simpleTieNoteContainer: document.getElementById('simple-tie-note-container'), // NEU

            // NEU: Modal-Elemente (KORRIGIERT)
            csvImportModal: document.getElementById('csv-import-modal'),
            csvModalClose: document.getElementById('csv-modal-close'),
            csvModalTitle: document.getElementById('csv-modal-title'),
            csvModalBody: document.getElementById('csv-modal-body'),

            // NEU: Tabs fÃ¼r Modus-Wahl
            tabNrW: document.getElementById('tab-nrw'),
            tabSimple: document.getElementById('tab-simple'),

            // NEU: Chart-Container
            nrwChartsContainer: document.getElementById('nrw-charts-container'),
            nrwSeatHemicycleTotal: document.getElementById('nrw-seat-hemicycle-total'),
            simpleChartsContainer: document.getElementById('simple-charts-container'),

            // NEU: Globaler Reset Button
            resetApplicationButton: document.getElementById('resetApplicationButton')
        };

        this.appState = new AppState();
        this.state = {
            councilResults: [],
            customColorMappings: [],
            currentPresetId: null // NEU
        };

        // NEU: storageKey definieren
        this.storageKey = 'AusschussRechnerPro_State_v1'; // v1, falls wir die Struktur spÃ¤ter Ã¤ndern
        this.isResetting = false; // NEU: Flag fÃ¼r Reset-Vorgang

        this.partyIdCounter = 0;
        this.proposalIdCounter = 0;
        this.defaultColors = ["#000000", "#EB001F", "#64A12D", "#009EE0", "#FFED00", "#BE3075", "#AA0000", "#9A7D4E", "#D81B60", "#0078C7", "#502379", "#003366"];

        this.partyColorMap = {
            'CDU': '#000000',
            'CSU': '#000000',
            'SPD': '#EB001F',
            'GRÃœNE': '#64A12D',
            'DIE GRÃœNEN': '#64A12D',
            'FDP': '#ffe209',// #FFED00',
            'DIE LINKE': '#BE3075',
            'LINKE': '#BE3075',
            'AFD': '#009EE0',
            'BSW': '#BA1264',
            'VOLT': '#502379',
            'DIE PARTEI': '#888888',
            'PARTEI': '#888888',
            'FREIE WÃ„HLER': '#F9A825',
            'FW': '#F9A825',
            // NEU: Weitere Parteien hinzugefÃ¼gt
            'PIRATEN': '#FF8800', // Orange
            'Ã–DP': '#FF6600', // Dunkleres Orange
            'TIERSCHUTZPARTEI': '#00545f' // BlaugrÃ¼n/Teal #00AACC
        };

        // --- HIER DIE RENDERER INITIALISIEREN ---
        this.nrwVoteBarChartRenderer = new VoteBarChartRenderer('nrwVoteBarChart');
        this.nrwHemicycleRenderer = new HemicycleRenderer('nrwSeatHemicycleDiagram', 'nrwSeatHemicycleLegend');

        this.simpleVoteBarChartRenderer = new VoteBarChartRenderer('simpleVoteBarChart');
        this.simpleHemicycleRenderer = new HemicycleRenderer('simpleSeatHemicycleDiagram', 'simpleSeatHemicycleLegend');
        // --- Ende HinzufÃ¼gung ---

        this.committeeCalculator = new CommitteeCalculator();
        this.nrwCouncilFlow = new NrwCouncilFlow(this);
        this.committeeFlow = new CommitteeFlow(this);
        this.simpleFlow = new SimpleFlow(this);
        this.appPersistence = new AppPersistence(this);
        this.scenarioFlow = new ScenarioFlow(this);
        this.modalController = new ModalController(this.DOM);
        this.customColorFlow = new CustomColorFlow(this);

        // KORREKTUR: CoalitionAnalyzers initialisieren
        // Der 'councilSize' Input existiert, dieser Analyzer funktioniert.
        this.nrwCoalitionAnalyzer = new CoalitionAnalyzer(
            'nrw-coalition-checklist', // Diese ID existiert (noch) nicht im HTML, fÃ¼gt aber keinen Fehler hinzu
            'nrw-coalition-result',
            'nrw-auto-coalitions',
            'councilSize'
        );

        // KORREKTUR: Der 'simple-seats' Input existiert NICHT mehr.
        // Das wÃ¼rde einen Fehler werfen und das Skript stoppen.
        // Wir kommentieren es aus, behalten aber die Klasse (wie gewÃ¼nscht).
        /*
        this.simpleCoalitionAnalyzer = new CoalitionAnalyzer(
            'simple-coalition-checklist',
            'simple-coalition-result',
            'simple-auto-coalitions',
            'simple-seats' // <-- Diese ID existiert nicht und verursacht den Fehler
        );
        */


        this._bindEvents();
        this._populatePresetDropdown();

        // NEU: Status laden, *bevor* wir die initialen Parteien hinzufÃ¼gen
        // _loadStateFromStorage wird die "clearAll" Methoden aufrufen.
        // Wenn kein Status geladen wurde, fÃ¼gen wir die Standard-Beispiele hinzu.
        const savedState = localStorage.getItem(this.storageKey);
        if (savedState) {
            this._loadStateFromStorage();
        } else {
            // Nur wenn kein Status geladen wurde, das Standard-Preset laden
            this.loadPreset(PRESET_DATABASE.defaultPresetId);
            //this.addInitialParties();

            // Die Initialisierung fÃ¼r den "Einfach"-Modus bleibt bestehen
            this.addInitialProposals();

        }

        this.renderSimpleSizeInputs();
        this.renderCommitteeSizeInputs();
    }

    _bindEvents() {
        // this.DOM.appModeSelection.addEventListener('change', (e) => this.switchAppMode(e)); // ALT
        // NEU:
        this.DOM.tabNrW.addEventListener('click', () => this.switchAppMode('nrw'));
        this.DOM.tabSimple.addEventListener('click', () => this.switchAppMode('simple'));

        // NEU: Event-Listener fÃ¼r das Preset-Dropdown
        this.DOM.presetSelect.addEventListener('change', async (e) => { // async!
            const selectedPresetId = e.target.value;

            // Warnung anzeigen, da dies die aktuellen Eingaben Ã¼berschreibt
            const confirmed = await this._showConfirmationModal(
                'Voreinstellung laden',
                'M\u00f6chten Sie wirklich die Voreinstellung laden? Alle aktuell eingegebenen Parteien werden \u00fcberschrieben.',
                'Laden',
                'btn-danger' // Roter Lade-Button
            );

            if (confirmed) {
                // Wenn bestÃ¤tigt, das Preset laden
                this.loadPreset(selectedPresetId);
            } else {
                // Wenn abgebrochen, das Dropdown auf das zuletzt geladene Preset zurÃ¼cksetzen
                if (this.state.currentPresetId) {
                    this.DOM.presetSelect.value = this.state.currentPresetId;
                }
            }
        });

        // --- Modus 1 (NRW) Events ---
        this.DOM.addPartyButton.addEventListener('click', () => this.addParty());
        // GEÃ„NDERT: Event-Listener muss nun 'async' sein
        this.DOM.clearPartiesButton.addEventListener('click', async () => await this.clearAllParties());
        // NEU: Event-Listener fÃ¼r Reset-Button
        this.DOM.resetVotesButton.addEventListener('click', () => this.resetAllVotes());

        this.DOM.calculateCouncilButton.addEventListener('click', () => this.calculateCouncilSeats());
        this.DOM.addCommitteeSizeBtn.addEventListener('click', () => this.addCommitteeSizeInput());
        this.DOM.createFactionAllianceButton.addEventListener('click', () => this.createFraktionsgemeinschaft());
        this.DOM.dissolveFactionAlliancesButton.addEventListener('click', () => this.dissolveFraktionsgemeinschaften());
        this.DOM.calculateCommitteesButton.addEventListener('click', () => this.calculateCommitteeSeats());


        // NEU: Event-Listener fÃ¼r die NRW-Eingabemodus-Tabs
        this.DOM.nrwInputModeTabs.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab');
            if (clickedTab) {
                this.switchNrwInputMode(clickedTab);
            }
        });
        // Per Tastatur (Enter/Space) bedienen
        this.DOM.nrwInputModeTabs.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const clickedTab = e.target.closest('.tab');
                if (clickedTab) {
                    e.preventDefault(); // Verhindert Scrollen bei Leertaste
                    this.switchNrwInputMode(clickedTab);
                }
            }
        });

        //this.DOM.modeSelection.addEventListener('change', (e) => this.toggleInputMode(e.target.value));

        this.DOM.importScenarioBtn.addEventListener('click', () => this.DOM.importScenarioFile.click());
        this.DOM.importScenarioFile.addEventListener('change', (e) => this.importScenario(e));
        this.DOM.exportScenarioBtn.addEventListener('click', () => this.exportScenario());
        // NEU
        this.DOM.importVoteManagerBtn.addEventListener('click', () => this.DOM.importVoteManagerFile.click());
        this.DOM.importVoteManagerFile.addEventListener('change', (e) => this.importVoteManagerCSV(e));

        // HINZUGEFÃœGT: Event Listener fÃ¼r votingStrengthContainer
        this.DOM.votingStrengthContainer.addEventListener('input', () => this.updateTotalPresentVotes());

        // NEU: Event-Listener fÃ¼r Ausschuss-Modus-Tabs
        if (this.DOM.committeeCalcModeTabs) {
            this.DOM.committeeCalcModeTabs.addEventListener('click', (e) => {
                const clickedTab = e.target.closest('.tab');
                if (clickedTab) {
                    this._switchCommitteeCalcMode(clickedTab);
                }
            });
            this.DOM.committeeCalcModeTabs.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const clickedTab = e.target.closest('.tab');
                    if (clickedTab) {
                        e.preventDefault();
                        this._switchCommitteeCalcMode(clickedTab);
                    }
                }
            });
        }

        // --- Modus 2 (Einfach) Events ---
        this.DOM.addProposalButton.addEventListener('click', () => this.addProposal());
        this.DOM.addSimpleSizeBtn.addEventListener('click', () => this.addSimpleSizeInput()); // NEU
        this.DOM.simpleProcedure.addEventListener('change', (e) => {
            this.appState.setSimpleProcedure(e.target.value);
        });
        // GEÃ„NDERT: Event-Listener muss nun 'async' sein
        this.DOM.clearProposalsButton.addEventListener('click', async () => await this.clearAllProposals());
        // NEU: Event-Listener fÃ¼r Reset-Button
        this.DOM.resetProposalVotesButton.addEventListener('click', () => this.resetAllProposalVotes());

        this.DOM.calculateSimpleButton.addEventListener('click', () => this.runSimpleCalculation());
        // NEU: Event fÃ¼r Farb-Mapping-Modal
        this.DOM.manageCustomColorsBtn.addEventListener('click', () => this.showColorMappingModal());

        // NEU: Event-Listener fÃ¼r den globalen Reset
        if (this.DOM.resetApplicationButton) {
            this.DOM.resetApplicationButton.addEventListener('click', () => this.resetApplication());
        }

        // NEU: Modal-SchlieÃŸen-Event (KORRIGIERT)
        if (this.DOM.csvModalClose) { // Sicherstellen, dass das Element existiert
            // KORREKTUR: Dieser Listener wird jetzt vom Confirmation Modal verwaltet
            // Wir binden hier nur den Standard-SchlieÃŸ-Mechanismus
            this.DOM.csvModalClose.addEventListener('click', () => this._hideModal());
        }

        // NEU: Event-Listener zum Speichern des Status beim Verlassen der Seite
        window.addEventListener('beforeunload', this._saveStateToStorage.bind(this));

        // NEU: HinzufÃ¼gen-Shortcut mit der '+' Taste
        document.addEventListener('keydown', (e) => {
            // Nur auslÃ¶sen, wenn '+' gedrÃ¼ckt wurde
            if (e.key !== '+') return;

            // Verhindern, wenn der Fokus auf einem Eingabefeld liegt
            const activeTag = document.activeElement.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
                return;
            }

            // Verhindern, dass das '+' in ein Feld geschrieben wird
            e.preventDefault();

            // PrÃ¼fen, welcher Modus (Tab) aktiv ist
            if (this.DOM.nrwModePanel.style.display !== 'none') {
                this.addParty();
            } else if (this.DOM.simpleModePanel.style.display !== 'none') {
                this.addProposal();
            }
        });
    }

    // NEU: Zeigt das Modal mit Inhalt an
    _showModal(title, htmlContent) {
        this.modalController.show(title, htmlContent);
    }

    // NEU: Versteckt das Modal
    _hideModal() {
        this.modalController.hide();
    }

    // NEU: Zeigt ein Modal mit "BestÃ¤tigen" und "Abbrechen" an
    // Gibt ein Promise zurÃ¼ck, das mit true (bestÃ¤tigt) oder false (abgebrochen) auflÃ¶st
    _showConfirmationModal(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return this.modalController.confirm(title, message, confirmButtonText, confirmButtonClass);
    }

    // ==========================================================
    // NEUE / ÃœBERARBEITETE METHODEN
    // ==========================================================

    switchAppMode(selectedMode) {
        // const selectedMode = event.target.value; // ALT
        if (selectedMode === 'nrw') {
            this.DOM.nrwModePanel.style.display = 'block';
            this.DOM.simpleModePanel.style.display = 'none';
            // NEU: Active-Status fÃ¼r Tabs setzen
            this.DOM.tabNrW.classList.add('active');
            this.DOM.tabSimple.classList.remove('active');
        } else {
            this.DOM.nrwModePanel.style.display = 'none';
            this.DOM.simpleModePanel.style.display = 'block';
            // NEU: Active-Status fÃ¼r Tabs setzen
            this.DOM.tabNrW.classList.remove('active');
            this.DOM.tabSimple.classList.add('active');
        }
    }

    _createGradient(colors) {
        if (!colors || colors.length === 0) {
            return 'none';
        }
        if (colors.length === 1) {
            return colors[0];
        }
        const step = 100 / colors.length;
        const stops = colors.map((color, index) => {
            return `${color} ${index * step}%, ${color} ${(index + 1) * step}%`;
        }).join(', ');
        return `linear-gradient(45deg, ${stops})`;
    }

    // ERSETZT: Diese Funktion wird um die Custom Mappings erweitert
    _updateColorFromName(name, colorPreviewEl, colorInputEl) {
        this.customColorFlow.updateColorFromName(name, colorPreviewEl, colorInputEl);
    }

    /**
     * NEU: LÃ¤dt ein vordefiniertes Szenario aus der PRESET_DATABASE.
     * Setzt die RatsgrÃ¶ÃŸe und fÃ¼llt die Parteiliste.
     */
     loadPreset(presetId) {
        this.scenarioFlow.loadPreset(presetId);
    }

    /**
     * NEU: FÃ¼llt das Dropdown-MenÃ¼ fÃ¼r die Voreinstellungen
     * basierend auf der PRESET_DATABASE.
     */
     _populatePresetDropdown() {
        this.scenarioFlow.populatePresetDropdown();
    }

    // ==========================================================
    // MODUS 2 (Einfach) METHODEN
    // ==========================================================

    addInitialProposals() {
        this.simpleFlow.addInitialProposals();
    }

    addProposal(name = '', votes = 0, color = '', id = null) {
        this.simpleFlow.addProposal(name, votes, color, id);
    }

    // GEÃ„NDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllProposals(skipConfirm = false) {
        await this.simpleFlow.clearAllProposals(skipConfirm);
    }

    // NEU: Setzt alle Stimmen im "Einfach"-Modus auf 0
    resetAllProposalVotes() {
        this.simpleFlow.resetAllProposalVotes();
    }

    // NEU: FÃ¼gt ein weiteres Eingabefeld fÃ¼r die SitzgrÃ¶ÃŸe hinzu
    addSimpleSizeInput() {
        this.simpleFlow.addSimpleSizeInput();
    }

    _getProposalsFromUI() {
        return this.simpleFlow.getProposals();
    }

    renderSimpleProposalList() {
        this.simpleFlow.renderProposalList();
    }

    renderSimpleSizeInputs() {
        this.simpleFlow.renderSizeInputs();
    }

    // ÃœBERARBEITET: FÃ¼hrt Berechnung fÃ¼r mehrere SitzgrÃ¶ÃŸen durch
    runSimpleCalculation() {
        this.simpleFlow.runCalculation();
    }

    // ÃœBERARBEITET: Zeigt Ergebnisse fÃ¼r mehrere SitzgrÃ¶ÃŸen in Spalten an
    renderSimpleResults(results, proposalsData, totalVotes, simpleSizes) {
        this.simpleFlow.renderResults(results, proposalsData, totalVotes, simpleSizes);
    }

    // ==========================================================
    // METHODEN FÃœR MODUS 1 (NRW)
    // ==========================================================

    /*addInitialParties() {
        // Daten basierend auf deiner vollstÃ¤ndigen Liste:
        this.addParty('CDU', 31834, 23, '#000000', 0);
        this.addParty('SPD', 27229, 10, '#EB001F', 0);
        this.addParty('AfD', 15079, 0, '#009EE0', 0);
        this.addParty('GRÃœNE', 8242, 0, '#64A12D', 0);
        this.addParty('Die Linke', 5382, 0, '#BE3075', 0);
        this.addParty('FDP', 2666, 0, '#ffe209', 0); // Verwendet FDP-Farbe aus der Map
        this.addParty('BSW', 2031, 0, '#BA1264', 0);
        this.addParty('Die PARTEI', 1865, 0, '#888888', 0);
        this.addParty('Volt', 1267, 0, '#502379', 0);
        this.addParty('FREIE WÃ„HLER', 175, 0, '#F9A825', 0);
        this.addParty('dieBasis', 102, 0, '', 0); // Keine Standardfarbe, wird automatisch zugewiesen
        this.addParty('WerteUnion', 81, 0, '', 0); // Keine Standardfarbe, wird automatisch zugewiesen

        // Erik Jansen (46 Stimmen) wird hier bewusst NICHT hinzugefÃ¼gt,
        // da er als Einzelbewerber nicht in den VerhÃ¤ltnisausgleich
        // der Listen einflieÃŸt (Â§ 33 KWahlG NRW).
    } //*/

    addParty(name = '', votes = 0, directMandates = 0, color = '', seats = 0, id = null) {
        this.nrwCouncilFlow.addParty(name, votes, directMandates, color, seats, id);
    }

    // GEÃ„NDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllParties(skipConfirm = false) {
        await this.nrwCouncilFlow.clearAllParties(skipConfirm);
    }

    // NEU: Setzt alle Stimmen im NRW-Modus auf 0
    resetAllVotes() {
        this.nrwCouncilFlow.resetAllVotes();
    }

    _getPartiesFromUI() {
        return this.nrwCouncilFlow.getParties();
    }

    _getColorPickerValue(color) {
        const hexMatch = typeof color === 'string' ? color.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/) : null;
        return hexMatch ? hexMatch[0] : this.defaultColors[0];
    }

    renderNrwCouncilElectionPartyList() {
        this.nrwCouncilFlow.renderPartyList();
    }

    /**
     * NEU: Hilfsfunktion, um den aktiven NRW-Eingabemodus (election/direct) auszulesen.
     */
    _getNrwInputMode() {
        return this.nrwCouncilFlow.getInputMode();
    }

    toggleInputMode(mode) {
        this.nrwCouncilFlow.toggleInputMode(mode);
    }

    /**
     * NEU: Schaltet die Tabs fÃ¼r den NRW-Eingabemodus (Berechnen vs. Direkt)
     */
    switchNrwInputMode(clickedTab) {
        this.nrwCouncilFlow.switchInputMode(clickedTab);
    }

    /**
     * NEU: Schaltet die Tabs fÃ¼r den Ausschuss-Berechnungsmodus (Hare vs D'Hondt)
     */
    _switchCommitteeCalcMode(clickedTab) {
        this.committeeFlow.switchCalculationMode(clickedTab);
    }

    calculateCouncilSeats() {
        this.nrwCouncilFlow.calculateCouncilSeats();
    }

    calculateDirectCouncilSeats() {
        this.nrwCouncilFlow.calculateDirectCouncilSeats();
    }

    runCouncilCalculation() {
        this.nrwCouncilFlow.runCouncilCalculation();
    }

    renderCouncilResults(result, partyInputs, isDirectMode = false) {
        this.nrwCouncilFlow.renderCouncilResults(result, partyInputs, isDirectMode);
    }

    prepareVotingSimulation() {
        this.committeeFlow.prepareVotingSimulation();
    }

    renderCommitteeVotingInputs() {
        this.committeeFlow.renderVotingInputs();
    }

    updateTotalPresentVotes() {
        this.committeeFlow.updateTotalPresentVotes();
    }

    addCommitteeSizeInput() {
        this.committeeFlow.addCommitteeSizeInput();
    }

    renderCommitteeSizeInputs() {
        this.committeeFlow.renderCommitteeSizeInputs();
    }

    prepareCommitteeStep() {
        this.committeeFlow.prepareCommitteeStep();
    }

    createFraktionsgemeinschaft() {
        this.committeeFlow.createFactionAlliance();
    }

    dissolveFraktionsgemeinschaften() {
        this.committeeFlow.dissolveFactionAlliances();
    }

    renderFraktionenForGemeinschaft() {
        this.committeeFlow.renderFactionAllianceList();
    }

    calculateCommitteeSeats() {
        this.committeeFlow.calculateCommitteeSeats();
    }

    renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder) {
        return this.committeeFlow.renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder);
    }

    exportScenario() {
        this.scenarioFlow.exportScenario();
    }

    importScenario(event) {
        this.scenarioFlow.importScenario(event);
    }

    // ÃœBERARBEITET: Import-Funktion fÃ¼r VoteManager (nutzt jetzt Modal)
    importVoteManagerCSV(event) {
        this.scenarioFlow.importVoteManagerCSV(event);
    }


    // --- NEUE METHODEN FÃœR LOCALSTORAGE ---

    /**
     * Speichert den gesamten UI-Zustand im localStorage.
     * Wird aufgerufen, wenn die Seite verlassen wird.
     */

    _saveStateToStorage() {
        this.appPersistence.saveState();
    }

    /**
     * NEU: LÃ¤dt den Zustand aus dem localStorage und stellt die UI wieder her.
     * Wird beim Initialisieren des Controllers aufgerufen.
     */
    _loadStateFromStorage() {
        this.appPersistence.loadState();
    }

    // ==========================================================
    // NEU: METHODEN FÃœR CUSTOM COLOR MAPPING
    // ==========================================================

    /**
     * Zeigt das Modal zur Verwaltung der eigenen Farb-Mappings an.
     */
    showColorMappingModal() {
        this.customColorFlow.showColorMappingModal();
    }

    /**
     * (Hilfsfunktion) Zeichnet die Liste der Mappings *innerhalb* des Modals.
     */
    renderCustomMappingList() {
        this.customColorFlow.renderCustomMappingList();
    }

    /**
     * FÃ¼gt ein leeres Mapping zum State hinzu.
     */
    addCustomMapping() {
        this.customColorFlow.addCustomMapping();
    }

    /**
     * Aktualisiert ein Mapping im State.
     */
    updateCustomMapping(index, updates) {
        this.customColorFlow.updateCustomMapping(index, updates);
    }

    /**
     * Entfernt ein Mapping aus dem State.
     */
    removeCustomMapping(index) {
        this.customColorFlow.removeCustomMapping(index);
    }

    /**
     * NEU: Zeigt ein Modal und setzt die Anwendung zurÃ¼ck (lÃ¶scht localStorage).
     */
    async resetApplication() {
        // 1. Zeige das BestÃ¤tigungs-Modal (wie gewÃ¼nscht)
        const confirmed = await this._showConfirmationModal(
            'Anwendung zur\u00fccksetzen',
            'M\u00f6chten Sie wirklich die gesamte Anwendung zur\u00fccksetzen? Alle gespeicherten Parteien, Vorschl\u00e4ge und Einstellungen werden gel\u00f6scht. Die Seite wird neu geladen und die Standard-Beispiele werden angezeigt.',
            'Ja, jetzt zur\u00fccksetzen',
            'btn-danger'
        );

        // 2. Wenn der Benutzer bestÃ¤tigt hat
        if (confirmed) {
            try {
                // Flag setzen, um 'beforeunload' zu blockieren
                this.isResetting = true;

                // 3. Den SchlÃ¼ssel aus dem LocalStorage entfernen
                localStorage.removeItem(this.storageKey);

                // 4. Seite neu laden.
                // (Dadurch wird der Konstruktor neu ausgefÃ¼hrt,
                // findet keinen 'savedState' und lÃ¤dt 'addInitialParties()')
                location.reload();

            } catch (e) {
                console.error("Fehler beim ZurÃ¼cksetzen der Anwendung:", e);
                this._showModal("Fehler", "Das Zur\u00fccksetzen ist fehlgeschlagen.");
            }
        }
    }

    //
}
  document.addEventListener('DOMContentLoaded', () => {

    // --- NEU: Theme Switcher Logic (ANGEPASST FÃœR DROPDOWN) ---
    const themeSelect = document.getElementById('theme-select');
    const htmlElement = document.documentElement;
    const storageKey = 'theme-mode';

    // 1. Funktion zum Anwenden des Themes
    function applyTheme(theme) {
        htmlElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');

        // KORRIGIERT: Saubere Template-Literale (Backticks) verwenden
        htmlElement.classList.add(`theme-${theme}`);

        localStorage.setItem(storageKey, theme);
    }

    // 2. Event Listener fÃ¼r das Dropdown
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    // 3. Beim Laden der Seite das gespeicherte Theme anwenden
    function loadTheme() {
        const savedTheme = localStorage.getItem(storageKey) || 'auto';
        applyTheme(savedTheme);

        // Den korrekten Wert im Dropdown auswÃ¤hlen
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    loadTheme();
    // --- Ende Theme Switcher Logic ---

    // KORREKTUR: Globale "app"  Variable fÃ¼r Koalitions-Checker (falls benÃ¶tigt)
    // Wir deklarieren 'app' noch nicht im globalen Scope, damit die 'app.currentResultsData'
    // PrÃ¼fungen im CoalitionAnalyzer (falls er spÃ¤ter verwendet wird) funktionieren.
    //window

    window.app = new AppController();
});









