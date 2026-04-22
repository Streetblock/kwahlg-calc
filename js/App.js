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
        this.DOM.csvModalTitle.innerText = title;
        this.DOM.csvModalBody.innerHTML = htmlContent;
        if (this.DOM.csvImportModal) {
            this.DOM.csvImportModal.style.display = 'flex';
        }
    }

    // NEU: Versteckt das Modal
    _hideModal() {
        if (this.DOM.csvImportModal) {
            this.DOM.csvImportModal.style.display = 'none';
        }
    }

    // NEU: Zeigt ein Modal mit "BestÃ¤tigen" und "Abbrechen" an
    // Gibt ein Promise zurÃ¼ck, das mit true (bestÃ¤tigt) oder false (abgebrochen) auflÃ¶st
    _showConfirmationModal(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            // HTML fÃ¼r den Modal-Body mit den Buttons
            const modalBodyHTML = `
                <p>${message}</p>
                <div class="modal-actions" style="text-align: right; margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="modal-btn-cancel" class="btn-secondary">Abbrechen</button>
                    <button id="modal-btn-confirm" class="${confirmButtonClass}">${confirmButtonText}</button>
                </div>
            `;

            // Modal mit dem neuen Inhalt anzeigen
            this._showModal(title, modalBodyHTML);

            // Referenzen zu den Elementen im Modal holen
            const btnConfirm = document.getElementById('modal-btn-confirm');
            const btnCancel = document.getElementById('modal-btn-cancel');
            const btnCloseX = this.DOM.csvModalClose; // Der 'X'-SchlieÃŸ-Button oben rechts

            // --- AKTUALISIERT: Handler fÃ¼r Tastatur-Events ---
            const keydownHandler = (e) => {
                // PrÃ¼fen, ob die Enter-Taste gedrÃ¼ckt wurde
                if (e.key === 'Enter') {
                    e.preventDefault(); // Verhindert Standard-Aktionen
                    confirmHandler(); // LÃ¶st die BestÃ¤tigungs-Aktion aus
                }
                // NEU: PrÃ¼fen, ob die Escape-Taste gedrÃ¼ckt wurde
                else if (e.key === 'Escape' || e.key === 'Esc') { // 'Esc' fÃ¼r Ã¤ltere Browser
                    e.preventDefault();
                    cancelHandler(); // LÃ¶st die Abbrechen-Aktion aus
                }
            };
            // --- ENDE AKTUALISIERT ---

            // AufrÃ¤umfunktion, um Event-Listener zu entfernen und das Modal zu schlieÃŸen
            const cleanupAndResolve = (result) => {
                btnConfirm.removeEventListener('click', confirmHandler);
                btnCancel.removeEventListener('click', cancelHandler);
                btnCloseX.removeEventListener('click', cancelHandler);
                document.removeEventListener('keydown', keydownHandler); // Entfernt Tastatur-Listener

                this._hideModal();
                resolve(result);
            };

            // Handler fÃ¼r "BestÃ¤tigen"
            const confirmHandler = () => {
                cleanupAndResolve(true); // Promise mit "true" auflÃ¶sen
            };

            // Handler fÃ¼r "Abbrechen" (gilt fÃ¼r "Abbrechen"-Button UND 'X'-Button)
            const cancelHandler = () => {
                cleanupAndResolve(false); // Promise mit "false" auflÃ¶sen
            };

            // TemporÃ¤re Event-Listener an die Buttons hÃ¤ngen
            btnConfirm.addEventListener('click', confirmHandler);
            btnCancel.addEventListener('click', cancelHandler);
            btnCloseX.addEventListener('click', cancelHandler);

            // Tastatur-Listener zum Dokument hinzufÃ¼gen
            document.addEventListener('keydown', keydownHandler);
        });
    }

    /*_showConfirmationModal(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            // HTML fÃ¼r den Modal-Body mit den Buttons
            const modalBodyHTML = `
                <p>${message}</p>
                <div class="modal-actions" style="text-align: right; margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <!-- Verwendet die neue .btn-secondary Klasse -->
                    <button id="modal-btn-cancel" class="btn-secondary">Abbrechen</button>
                    <button id="modal-btn-confirm" class="${confirmButtonClass}">${confirmButtonText}</button>
                </div>
            `;

            // Modal mit dem neuen Inhalt anzeigen
            this._showModal(title, modalBodyHTML);

            // Referenzen zu den Elementen im Modal holen
            const btnConfirm = document.getElementById('modal-btn-confirm');
            const btnCancel = document.getElementById('modal-btn-cancel');
            const btnCloseX = this.DOM.csvModalClose; // Der 'X'-SchlieÃŸ-Button oben rechts

            // AufrÃ¤umfunktion, um Event-Listener zu entfernen und das Modal zu schlieÃŸen
            // WICHTIG: Eigene Listener, um Konflikte mit dem Standard-Listener zu vermeiden
            const cleanupAndResolve = (result) => {
                btnConfirm.removeEventListener('click', confirmHandler);
                btnCancel.removeEventListener('click', cancelHandler);
                // Wichtig: Wir mÃ¼ssen den *temporÃ¤ren* 'X'-Listener entfernen
                btnCloseX.removeEventListener('click', cancelHandler);
                this._hideModal();
                resolve(result);
            };

            // Handler fÃ¼r "BestÃ¤tigen"
            const confirmHandler = () => {
                cleanupAndResolve(true); // Promise mit "true" auflÃ¶sen
            };

            // Handler fÃ¼r "Abbrechen" (gilt fÃ¼r "Abbrechen"-Button UND 'X'-Button)
            const cancelHandler = () => {
                cleanupAndResolve(false); // Promise mit "false" auflÃ¶sen
            };

            // TemporÃ¤re Event-Listener an die Buttons hÃ¤ngen
            btnConfirm.addEventListener('click', confirmHandler);
            btnCancel.addEventListener('click', cancelHandler);
            // Wir fÃ¼gen einen *eigenen* Listener zum 'X' hinzu, der "Abbrechen" auslÃ¶st
            // Dieser Ã¼berschreibt nicht den Standard-Listener, wird aber zuerst ausgefÃ¼hrt
            btnCloseX.addEventListener('click', cancelHandler);
        });
    }//*/

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
        const upperName = name.toUpperCase().trim();

        // 1. PrÃ¼fe Custom Mappings (hÃ¶chste PrioritÃ¤t)
        const customMapping = this.state.customColorMappings.find(m => m.name.toUpperCase() === upperName);
        if (customMapping) {
            colorPreviewEl.style.background = customMapping.color;
            colorInputEl.value = customMapping.color;
            return;
        }

        // 2. PrÃ¼fe Standard-Mappings (partyColorMap)
        let singleColor = this.partyColorMap[upperName];
        if (singleColor) {
            colorPreviewEl.style.background = singleColor;
            colorInputEl.value = singleColor;
            return;
        }

        // 3. PrÃ¼fe kombinierte Namen (z.B. "CDU/CSU")
        const splitNames = upperName.split(/[\/&+,]/);
        if (splitNames.length > 1) {
            const colors = splitNames
                .map(n => {
                    const trimmedUpper = n.trim();
                    // PrÃ¼fe Custom ODER Default Map
                    const custom = this.state.customColorMappings.find(m => m.name.toUpperCase() === trimmedUpper);
                    return custom ? custom.color : this.partyColorMap[trimmedUpper];
                })
                .filter(Boolean);

            if (colors.length > 0) {
                const gradient = this._createGradient(colors);
                colorPreviewEl.style.background = gradient;
                colorInputEl.value = colors[0]; // Nimm die erste gefundene Farbe fÃ¼r den Picker
                return;
            }
        }
    }

    /**
     * NEU: LÃ¤dt ein vordefiniertes Szenario aus der PRESET_DATABASE.
     * Setzt die RatsgrÃ¶ÃŸe und fÃ¼llt die Parteiliste.
     */
     loadPreset(presetId) {
        console.log(`Lade Preset: ${presetId}`);
        // Finde das Preset in der globalen Datenbank
        let preset = PRESET_DATABASE.presets.find(p => p.id === presetId);

        if (!preset) {
            console.warn(`Preset-ID "${presetId}" nicht gefunden. Lade Standard-Preset.`);
            const defaultId = PRESET_DATABASE.defaultPresetId;
            preset = PRESET_DATABASE.presets.find(p => p.id === defaultId);
            if (!preset) {
                console.error("KRITISCHER FEHLER: Kein Default-Preset gefunden!");
                return; // Abbruch
            }
        }

        // 1. UI-Elemente fÃ¼r NRW-Modus zurÃ¼cksetzen
        this.clearAllParties(true);

        // 2. RatsgrÃ¶ÃŸe aus dem Preset setzen
        this.DOM.councilSize.value = preset.councilSize;

        // 3. Parteien aus dem Preset hinzufÃ¼gen
        if (preset.parties && Array.isArray(preset.parties)) {
            preset.parties.forEach(party => {
                this.addParty(
                    party.name,
                    party.votes,
                    party.directMandates,
                    party.color || ''
                );
            });
        }

        // 4. NEU: Status und Dropdown-UI aktualisieren
        this.state.currentPresetId = preset.id;
        if (this.DOM.presetSelect) { // Sicherstellen, dass es existiert
            this.DOM.presetSelect.value = preset.id;
        }
    }

    /**
     * NEU: FÃ¼llt das Dropdown-MenÃ¼ fÃ¼r die Voreinstellungen
     * basierend auf der PRESET_DATABASE.
     */
     _populatePresetDropdown() {
        if (!this.DOM.presetSelect) return;
        this.DOM.presetSelect.innerHTML = ''; // Vorherige Optionen leeren

        // NEU: Option fÃ¼r den gespeicherten Zustand
        // Diese Option dient als Indikator.
        const savedOption = document.createElement('option');
        savedOption.value = 'user_saved_state'; // Eine eindeutige ID
        savedOption.textContent = 'Mein gespeicherter Stand';
        this.DOM.presetSelect.appendChild(savedOption);

        // NEU: Trennlinie
        const separator = document.createElement('option');
        separator.textContent = '--- Voreinstellungen laden ---';
        separator.disabled = true;
        this.DOM.presetSelect.appendChild(separator);


        // EintrÃ¤ge aus der Datenbank erstellen
        PRESET_DATABASE.presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            this.DOM.presetSelect.appendChild(option);
        });
    }

    // ==========================================================
    // MODUS 2 (Einfach) METHODEN
    // ==========================================================

    addInitialProposals() {
        this.addProposal('Liste A', 45, '#005ea8');
        this.addProposal('Liste B', 32, '#EB001F');
        this.addProposal('Liste C', 18, '#64A12D');
    }

    addProposal(name = '', votes = 0, color = '', id = null) {
        const proposalId = id || `proposal-${this.proposalIdCounter++}`;

        // NEU: Sicherstellen, dass der Counter bei geladenen IDs nicht kollidiert
        if (id) {
            const numericId = parseInt(id.split('-')[1]);
            if (!isNaN(numericId) && numericId >= this.proposalIdCounter) {
                this.proposalIdCounter = numericId + 1;
            }
        }

        const proposalColor = color || this.defaultColors[this.proposalIdCounter % this.defaultColors.length];
        this.appState.addSimpleProposal({
            id: proposalId,
            color: proposalColor,
            abbreviation: name,
            votes
        });
        this.renderSimpleProposalList();
    }

    // GEÃ„NDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllProposals(skipConfirm = false) {
        if (!skipConfirm) {
            // Ruft das neue Modal auf und wartet auf die Antwort (true/false)
            const confirmed = await this._showConfirmationModal(
                'Best\u00e4tigung erforderlich',
                'M\u00f6chten Sie wirklich <strong>alle Vorschl\u00e4ge</strong> l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
                'Alle l\u00f6schen',
                'btn-danger'
            );
            if (!confirmed) return; // Wenn "false" (Abbrechen), Funktion beenden
        }
        this.appState.clearSimpleProposals();
        this.renderSimpleProposalList();
    }

    // NEU: Setzt alle Stimmen im "Einfach"-Modus auf 0
    resetAllProposalVotes() {
        this.appState.resetSimpleProposalVotes();
        this.renderSimpleProposalList();
    }

    // NEU: FÃ¼gt ein weiteres Eingabefeld fÃ¼r die SitzgrÃ¶ÃŸe hinzu
    addSimpleSizeInput() {
        this.appState.addSimpleSeatSize('');
        this.renderSimpleSizeInputs();
    }

    _getProposalsFromUI() {
        return this.appState.getSimpleProposals();
    }

    renderSimpleProposalList() {
        const proposals = this.appState.getSimpleProposals();
        const proposalInputs = renderSimpleProposalList(this.DOM.simpleProposalsContainer, proposals, {
            getColorPickerValue: (color) => this._getColorPickerValue(color)
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
                this.appState.updateSimpleProposal(proposal.id, { color: colorInput.value });
            });

            nameInput.addEventListener('input', () => {
                this.appState.updateSimpleProposal(proposal.id, { abbreviation: nameInput.value || 'Unbenannt' });
                this._updateColorFromName(nameInput.value, colorPreview, colorInput);
                this.appState.updateSimpleProposal(proposal.id, { color: colorPreview.style.background });
            });

            votesInput.addEventListener('input', () => {
                this.appState.updateSimpleProposal(proposal.id, { votes: parseInt(votesInput.value, 10) || 0 });
            });

            removeButton.addEventListener('click', () => {
                this.appState.removeSimpleProposal(proposal.id);
                this.renderSimpleProposalList();
            });
        });
    }

    renderSimpleSizeInputs() {
        const seatSizes = this.appState.getSimpleSeatSizes();
        const sizeInputs = renderSimpleSizeInputList(
            this.DOM.simpleSizesContainer,
            seatSizes,
            this.appState.getSimpleProcedure(),
            { procedureSelect: this.DOM.simpleProcedure }
        );

        sizeInputs.forEach(({ index, input, removeButton }) => {
            input.addEventListener('input', () => {
                this.appState.updateSimpleSeatSize(index, input.value);
            });

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.appState.removeSimpleSeatSize(index);
                    this.renderSimpleSizeInputs();
                });
            }
        });
    }

    // ÃœBERARBEITET: FÃ¼hrt Berechnung fÃ¼r mehrere SitzgrÃ¶ÃŸen durch
    runSimpleCalculation() {
        // Liest alle SitzgrÃ¶ÃŸen aus
        const simpleSizes = this.appState.getSimpleSeatSizes()
            .map(value => parseInt(value, 10))
            .filter(val => !isNaN(val) && val > 0);

        const procedure = this.appState.getSimpleProcedure();
        const proposalsData = this._getProposalsFromUI();
        const totalVotes = proposalsData.reduce((sum, p) => sum + p.votes, 0);

        if (proposalsData.length === 0 || simpleSizes.length === 0 || totalVotes === 0) {
            this._showModal("Eingabefehler", "<p>Bitte VorschlÃ¤ge mit Stimmen und mindestens eine Sitzanzahl > 0 eingeben.</p>");
            return;
        }

        let allocator;
        switch (procedure) {
            case 'hare':
                allocator = new HareNiemeyerAllocator();
                break;
            case 'sainte':
                allocator = new SainteLagueAllocator();
                break;
            case 'dhondt':
                allocator = new DHondtAllocator();
                break;
            default:
                return;
        }

        const results = {};
        const protocolEntries = [];

        // FÃ¼hrt Berechnung fÃ¼r jede GrÃ¶ÃŸe durch
        simpleSizes.forEach(size => {
            const result = allocator.calculate(proposalsData, size, totalVotes);
            results[size] = result;
            protocolEntries.push(...(result.protocolEntries || []));
            protocolEntries.push({ type: 'separator' });
        });

        renderProtocolEntries(this.DOM.simpleAllocationSteps, protocolEntries);
        this.renderSimpleResults(results, proposalsData, totalVotes, simpleSizes);

        try {
            if (simpleSizes.length > 0) {
                const firstSize = simpleSizes[0]; // Nimm die erste SitzgrÃ¶ÃŸe fÃ¼r die Charts
                const resultsForFirstSize = results[firstSize];

                // FÃ¼ge die Sitze zu den Eingabedaten hinzu
                const simpleDataForCharts = proposalsData.map(proposal => {
                    const partyResult = resultsForFirstSize.partyResults.find(p => p.id === proposal.id);
                    return {
                        ...proposal, // enthÃ¤lt id, abbreviation, votes, color
                        seats: partyResult ? partyResult.proportionalSeats : 0
                    };
                });

                const totalSeatsForChart = simpleDataForCharts.reduce((sum, p) => sum + p.seats, 0);

                // Charts rendern
                this.simpleVoteBarChartRenderer.render(simpleDataForCharts, totalVotes);
                this.simpleHemicycleRenderer.render(simpleDataForCharts, totalSeatsForChart);
                this.DOM.simpleChartsContainer.style.display = 'flex'; // Container sichtbar machen
            } else {
                this.DOM.simpleChartsContainer.style.display = 'none';
            }
        } catch (e) {
            console.error("Fehler beim Rendern der Simple-Diagramme:", e);
            this.DOM.simpleChartsContainer.style.display = 'none';
        }

    }

    // ÃœBERARBEITET: Zeigt Ergebnisse fÃ¼r mehrere SitzgrÃ¶ÃŸen in Spalten an
    renderSimpleResults(results, proposalsData, totalVotes, simpleSizes) {
        renderSimpleResultsTable({
            table: this.DOM.simpleResultsTable,
            tieNoteContainer: this.DOM.simpleTieNoteContainer,
            results,
            proposalsData,
            totalVotes,
            simpleSizes
        });
        this.DOM.simpleResultsSection.style.display = 'block';
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
        const partyId = id || `party-${this.partyIdCounter++}`;

        // NEU: Sicherstellen, dass der Counter bei geladenen IDs nicht kollidiert
        if (id) {
            const numericId = parseInt(id.split('-')[1]);
            if (!isNaN(numericId) && numericId >= this.partyIdCounter) {
                this.partyIdCounter = numericId + 1;
            }
        }

        const partyColor = color || this.defaultColors[this.partyIdCounter % this.defaultColors.length];
        this.appState.addNrwParty({
            id: partyId,
            color: partyColor,
            abbreviation: name,
            votes,
            directMandates,
            seats,
            isListApproved: true
        });
        this.renderNrwCouncilElectionPartyList();
    }

    // GEÃ„NDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllParties(skipConfirm = false) {
        if (!skipConfirm) {
            // Ruft das neue Modal auf und wartet auf die Antwort (true/false)
            const confirmed = await this._showConfirmationModal(
                'Best\u00e4tigung erforderlich',
                'M\u00f6chten Sie wirklich <strong>alle Parteien</strong> l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
                'Alle l\u00f6schen',
                'btn-danger'
            );
            if (!confirmed) return; // Wenn "false" (Abbrechen), Funktion beenden
        }
        this.appState.clearNrwParties();
        this.renderNrwCouncilElectionPartyList();
    }

    // NEU: Setzt alle Stimmen im NRW-Modus auf 0
    resetAllVotes() {
        // FÃ¼r diese Aktion ist keine BestÃ¤tigung nÃ¶tig, da sie nicht-destruktiv ist
        this.appState.resetNrwPartyVotes();
        this.renderNrwCouncilElectionPartyList();
    }

    _getPartiesFromUI() {
        return this.appState.getNrwParties();
    }

    _getColorPickerValue(color) {
        const hexMatch = typeof color === 'string' ? color.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/) : null;
        return hexMatch ? hexMatch[0] : this.defaultColors[0];
    }

    renderNrwCouncilElectionPartyList() {
        const parties = this.appState.getNrwParties();
        const isDirectMode = this._getNrwInputMode() === 'direct';

        const partyBindings = renderNrwCouncilElectionPartyList(this.DOM.partyListElement, parties, {
            isDirectMode,
            getColorPickerValue: (color) => this._getColorPickerValue(color)
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
                this.appState.updateNrwParty(party.id, { color: colorInput.value });
            });

            nameInput.addEventListener('input', () => {
                this.appState.updateNrwParty(party.id, { abbreviation: nameInput.value });
                this._updateColorFromName(nameInput.value, colorPreview, colorInput);
                this.appState.updateNrwParty(party.id, { color: colorPreview.style.background });
            });

            votesInput.addEventListener('input', () => {
                this.appState.updateNrwParty(party.id, { votes: parseInt(votesInput.value, 10) || 0 });
            });

            directMandatesInput.addEventListener('input', () => {
                this.appState.updateNrwParty(party.id, { directMandates: parseInt(directMandatesInput.value, 10) || 0 });
            });

            seatsInput.addEventListener('input', () => {
                this.appState.updateNrwParty(party.id, { seats: parseInt(seatsInput.value, 10) || 0 });
            });

            removeButton.addEventListener('click', () => {
                this.appState.removeNrwParty(party.id);
                this.renderNrwCouncilElectionPartyList();
            });
        });

        this.toggleInputMode(this._getNrwInputMode());
    }

    /**
     * NEU: Hilfsfunktion, um den aktiven NRW-Eingabemodus (election/direct) auszulesen.
     */
    _getNrwInputMode() {
        const activeModeTab = this.DOM.nrwInputModeTabs.querySelector('.tab.active');
        // 'election' als sicherer Fallback, falls kein Tab aktiv sein sollte
        return activeModeTab ? activeModeTab.dataset.mode : 'election';
    }

    toggleInputMode(mode) {
        const isDirectMode = mode === 'direct';

        this.DOM.partyItemHeader.querySelector('[data-header="votes"]').style.display = isDirectMode ? 'none' : 'block';
        this.DOM.partyItemHeader.querySelector('[data-header="directMandates"]').style.display = isDirectMode ? 'none' : 'block';
        this.DOM.partyItemHeader.querySelector('[data-header="seats"]').style.display = isDirectMode ? 'block' : 'none';

        this.DOM.partyListElement.querySelectorAll('.party-item').forEach(item => {
            item.querySelector('[data-role="votes"]').style.display = isDirectMode ? 'none' : 'block';
            item.querySelector('[data-role="directMandates"]').style.display = isDirectMode ? 'none' : 'block';
            item.querySelector('[data-role="seats"]').style.display = isDirectMode ? 'block' : 'none';
        });

        this.DOM.councilSizeGroup.style.display = isDirectMode ? 'none' : 'block';
        this.DOM.calculateCouncilButton.textContent = isDirectMode ? 'Ratssitze \u00fcbernehmen & weiter' : 'Ratssitze berechnen';
    }

    /**
     * NEU: Schaltet die Tabs fÃ¼r den NRW-Eingabemodus (Berechnen vs. Direkt)
     */
    switchNrwInputMode(clickedTab) {
        if (clickedTab.classList.contains('active')) {
            return; // Nichts tun, wenn der Tab schon aktiv ist
        }

        const newMode = clickedTab.dataset.mode;

        // Alten aktiven Tab finden und deaktivieren
        const oldTab = this.DOM.nrwInputModeTabs.querySelector('.tab.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }

        // Neuen Tab aktivieren
        clickedTab.classList.add('active');

        // Die *existierende* Funktion aufrufen, die die UI-Felder umschaltet
        this.toggleInputMode(newMode);
    }

    /**
     * NEU: Schaltet die Tabs fÃ¼r den Ausschuss-Berechnungsmodus (Hare vs D'Hondt)
     */
    _switchCommitteeCalcMode(clickedTab) {
        if (clickedTab.classList.contains('active')) {
            return; // Nichts tun, wenn der Tab schon aktiv ist
        }

        // Alten aktiven Tab finden und deaktivieren
        const oldTab = this.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }

        // Neuen Tab aktivieren
        clickedTab.classList.add('active');

        // Optional: Button-Text Ã¤ndern
        const newMode = clickedTab.dataset.mode;
        if (newMode === 'dhondt') {
            this.DOM.calculateCommitteesButton.textContent = "Zugriffsreihenfolge berechnen";
        } else {
            this.DOM.calculateCommitteesButton.textContent = "Ausschusssitze berechnen";
        }
    }

    calculateCouncilSeats() {
        // KORREKTUR: Liest den Modus von der neuen Hilfsfunktion
        const mode = this._getNrwInputMode();
        if (mode === 'direct') {
            this.calculateDirectCouncilSeats();
        } else {
            this.runCouncilCalculation();
        }
    }

    calculateDirectCouncilSeats() {
        const partiesData = this._getPartiesFromUI();
        this.state.councilResults = partiesData.map(p => ({
            id: p.id,
            abbreviation: p.abbreviation,
            color: p.color,
            votes: p.votes, // Behalten wir, falls der Benutzer zurÃ¼ckschaltet
            seats: p.seats,
            directMandatesAwarded: 0, // Nicht zutreffend im Direktmodus
            listSeatsAwarded: p.seats // Alle sind "ListenplÃ¤tze"
        }));

        this.renderCouncilResults(this.state.councilResults, partiesData, true);
        renderProtocolEntries(this.DOM.councilAllocationSteps, [
            { type: 'paragraph', text: 'Die Ratssitze wurden direkt eingegeben. Es fand keine Berechnung statt.' }
        ]);

        this.DOM.councilResultsSection.style.display = 'block';
        this.DOM.votingSimulationSection.style.display = 'block';
        this.DOM.committeeSection.style.display = 'block';

        this.prepareVotingSimulation();
        this.prepareCommitteeStep();

        // --- HIER DEN CODE ZUM ZEICHNEN DER NRW-CHARTS EINFÃœGEN ---
        try {
            // Daten fÃ¼r Charts vorbereiten
            const totalSeatsForChart = this.state.councilResults.reduce((sum, p) => sum + p.seats, 0);

            // Charts rendern (Stimmen-Balken wird leer sein, da keine Stimmen relevant)
            this.nrwVoteBarChartRenderer.render(this.state.councilResults, 0); // Keine Gesamtstimmen im Direktmodus
            this.nrwHemicycleRenderer.render(this.state.councilResults, totalSeatsForChart);
            if (this.DOM.nrwSeatHemicycleTotal) {
                this.DOM.nrwSeatHemicycleTotal.textContent = `Gesamtsitzzahl: ${totalSeatsForChart.toLocaleString('de-DE')}`;
            }
            this.DOM.nrwChartsContainer.style.display = 'flex'; // Den Container sichtbar machen
        } catch (e) {
            console.error("Fehler beim Rendern der NRW-Diagramme (Direktmodus):", e);
            this.DOM.nrwChartsContainer.style.display = 'none';
        }
    }

    runCouncilCalculation() {
        const partiesData = this._getPartiesFromUI();
        const initialTotalSeats = parseInt(this.DOM.councilSize.value) || 0;

        if (partiesData.length === 0 || initialTotalSeats === 0) {
            this._showModal("Eingabefehler", "<p>Bitte f\u00fcgen Sie Parteien hinzu und legen Sie die Ratsgr\u00f6\u00dfe fest.</p>");
            return;
        }

        const totalVotesForProportionality = partiesData.reduce((sum, p) => sum + p.votes, 0);

        const allocator = new NrwKWahlGCalculator(new SainteLagueAllocator());
        const result = allocator.calculate(partiesData, initialTotalSeats, totalVotesForProportionality, {});

        this.state.councilResults = result.allocatedParties;
        this.renderCouncilResults(result, partiesData, false);
        renderProtocolEntries(this.DOM.councilAllocationSteps, result.protocolEntries);

        this.DOM.councilResultsSection.style.display = 'block';
        this.DOM.votingSimulationSection.style.display = 'block';
        this.DOM.committeeSection.style.display = 'block';

        this.prepareVotingSimulation();
        this.prepareCommitteeStep();

        // --- HIER DEN CODE ZUM ZEICHNEN DER NRW-CHARTS EINFÃœGEN ---
        try {
            // Daten fÃ¼r Charts vorbereiten
            const partiesDataForCharts = this._getPartiesFromUI(); // Holt Namen, Farben, Stimmen etc.
            let totalVotesForChart = 0;

            // FÃ¼ge die Stimmen zu den Ratsergebnissen hinzu
            const councilResultsWithVotes = this.state.councilResults.map(resultParty => {
                const inputData = partiesDataForCharts.find(p => p.id === resultParty.id);
                const votes = inputData ? inputData.votes : 0;
                totalVotesForChart += votes;
                return {
                    ...resultParty, // enthÃ¤lt schon id, abbreviation, seats, color
                    votes: votes
                };
            });

            const totalSeatsForChart = this.state.councilResults.reduce((sum, p) => sum + p.seats, 0);

            // Charts rendern
            this.nrwVoteBarChartRenderer.render(councilResultsWithVotes, totalVotesForChart);
            this.nrwHemicycleRenderer.render(councilResultsWithVotes, totalSeatsForChart);
            if (this.DOM.nrwSeatHemicycleTotal) {
                this.DOM.nrwSeatHemicycleTotal.textContent = `Gesamtsitzzahl: ${totalSeatsForChart.toLocaleString('de-DE')}`;
            }
            this.DOM.nrwChartsContainer.style.display = 'flex'; // Den Container sichtbar machen
        } catch (e) {
            console.error("Fehler beim Rendern der NRW-Diagramme:", e);
            this.DOM.nrwChartsContainer.style.display = 'none';
        }

    }

    renderCouncilResults(result, partyInputs, isDirectMode = false) {
        const allocatedParties = result.allocatedParties || result;
        const totalSeats = allocatedParties.reduce((sum, party) => sum + (party.seats || 0), 0);

        this.currentResultsData = { totalSeats };

        renderCouncilResultsTable({
            tableBody: this.DOM.councilResultsTableBody,
            resultsSection: this.DOM.councilResultsSection,
            detailsContainer: document.getElementById('council-protocol-details'),
            result,
            partyInputs,
            isDirectMode,
            totalSeatsSummaryElement: this.DOM.councilTotalSeatsSummary,
            totalSeatsValueElement: this.DOM.councilTotalSeatsValue,
            totalSeats
        });
    }

    prepareVotingSimulation() {
        const existingPresentVotes = this.appState.getCommitteePresentVotes();
        const defaultPresentVotes = this.state.councilResults
            .filter((party) => party.seats > 0)
            .map((party) => {
                const existingVote = existingPresentVotes.find((entry) => entry.partyId === party.id);
                return {
                    partyId: party.id,
                    present: existingVote ? existingVote.present : party.seats
                };
            });
        this.appState.setCommitteePresentVotes(defaultPresentVotes);
        this.renderCommitteeVotingInputs();
        this.updateTotalPresentVotes();
    }

    renderCommitteeVotingInputs() {
        const votingInputs = renderCommitteeVotingInputs(
            this.DOM.votingStrengthContainer,
            this.state.councilResults,
            this.appState.getCommitteePresentVotes()
        );

        votingInputs.forEach(({ party, input }) => {
            input.addEventListener('input', () => {
                this.appState.updateCommitteePresentVote(party.id, parseInt(input.value, 10) || 0);
                this.updateTotalPresentVotes();
            });
        });
    }

    updateTotalPresentVotes() {
        const totalVotes = this.appState.getCommitteePresentVotes()
            .reduce((sum, entry) => sum + (parseInt(entry.present, 10) || 0), 0);
        this.DOM.totalPresentVotes.textContent = totalVotes;
    }

    addCommitteeSizeInput() {
        this.appState.addCommitteeSeatSize('');
        this.renderCommitteeSizeInputs();
    }

    renderCommitteeSizeInputs() {
        const sizeInputs = renderCommitteeSizeInputList(
            this.DOM.committeeSizesContainer,
            this.appState.getCommitteeSeatSizes()
        );

        sizeInputs.forEach(({ index, input, removeButton }) => {
            input.addEventListener('input', () => {
                this.appState.updateCommitteeSeatSize(index, input.value);
            });

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.appState.removeCommitteeSeatSize(index);
                    this.renderCommitteeSizeInputs();
                });
            }
        });
    }

    prepareCommitteeStep() {
        this.appState.clearCommitteeFactionAlliances();
        this.renderFraktionenForGemeinschaft();
    }

    createFraktionsgemeinschaft() {
        const selectedCheckboxes = this.DOM.factionAllianceListElement.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 2) {
            this._showModal("Hinweis", "<p>Bitte mindestens zwei Fraktionen/Mitglieder fÃ¼r eine Fraktionsgemeinschaft auswÃ¤hlen.</p>");
            return;
        }
        const memberIds = Array.from(selectedCheckboxes).map(chk => chk.closest('.fraktion-item').dataset.fraktionId);
        const memberFraktionen = this.state.councilResults.filter(f => memberIds.includes(f.id));
        const totalSitze = memberFraktionen.reduce((sum, f) => sum + f.seats, 0);
        const name = memberFraktionen.map(f => f.abbreviation).join(' + ');

        // --- NEU: Farben sammeln und Gradient erzeugen ---
        const memberColors = memberFraktionen.map(f => f.color);
        const gradientColor = this._createGradient(memberColors);
        // --- ENDE NEU ---

        const factionAlliance = {
            name,
            totalSitze,
            memberIds,
            color: gradientColor // Farbe im State speichern
        };
        this.appState.addCommitteeFactionAlliance(factionAlliance);
        this.renderFraktionenForGemeinschaft();
    }

    dissolveFraktionsgemeinschaften() {
        this.appState.clearCommitteeFactionAlliances();
        this.renderFraktionenForGemeinschaft();
    }

    renderFraktionenForGemeinschaft() {
        renderCommitteeFactionAllianceList(
            this.DOM.factionAllianceListElement,
            this.state.councilResults,
            this.appState.getCommitteeFactionAlliances()
        );
    }

    calculateCommitteeSeats() {
        const committeeSizes = this.appState.getCommitteeSeatSizes()
            .map(value => parseInt(value, 10))
            .filter(val => !isNaN(val) && val > 0);

        if (committeeSizes.length === 0) {
            this._showModal("Eingabefehler", "<p>Bitte geben Sie mindestens eine g\u00fcltige Ausschussgr\u00f6\u00dfe an.</p>");
            return;
        }

        // --- Basisdaten sammeln (bleibt gleich) ---
        const manualVotes = {};
        this.appState.getCommitteePresentVotes().forEach((entry) => { manualVotes[entry.partyId] = parseInt(entry.present, 10) || 0; });

        // PrÃ¼fen, welcher Modus (Tab) aktiv ist
        const activeCommitteeTab = this.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        const mode = activeCommitteeTab ? activeCommitteeTab.dataset.mode : 'hare';
        const committeeCalculation = this.committeeCalculator.calculate({
            committeeSizes,
            councilResults: this.state.councilResults,
            factionAlliances: this.appState.getCommitteeFactionAlliances(),
            manualVotes,
            mode
        });
        let finalNoteHTML = ''; // FÃ¼r die Einzelmitglieder-Warnung

        this.DOM.committeeResultsSection.querySelector('h3').textContent = committeeCalculation.title;

        if (committeeCalculation.displayMode === 'protocol') {
            // --- NEUER D'HONDT-PFAD (PROTOKOLL-ANZEIGE) ---
            // UI umschalten: Protokoll AN, Tabelle AUS
            this.DOM.committeeTableWrapper.style.display = 'none';
            this.DOM.committeeProtocolContainer.style.display = 'block';
            renderCommitteeProtocol(this.DOM.committeeProtocolContainer, committeeCalculation.protocolEntries);

            // Die Warnung fÃ¼r fraktionslose Mitglieder muss hier separat hinzugefÃ¼gt werden
            if (committeeCalculation.individualMembers.length > 0) {
                 const memberNames = committeeCalculation.individualMembers.map(m => `<strong>${m.abbreviation}</strong>`).join(', ');
                 finalNoteHTML += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gem\u00e4\u00df \u00a7 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehÃ¶ren.</p>`;
            }

        } else {
            // --- ALTER HARE-NIEMEYER-PFAD (TABELLEN-ANZEIGE) ---
            // UI umschalten: Tabelle AN, Protokoll AUS
            this.DOM.committeeTableWrapper.style.display = 'block';
            this.DOM.committeeProtocolContainer.style.display = 'none';

            // Rufe die Standard-Tabellen-Render-Funktion auf
            // Diese Funktion erstellt die 'finalNoteHTML' selbst (inkl. Los-Warnungen fÃ¼r Hare)
            // (Wir mÃ¼ssen 'einzelmitglieder' Ã¼bergeben, damit 'renderCommitteeResults' es hat)
            finalNoteHTML = this.renderCommitteeResults(
                committeeCalculation.results,
                committeeCalculation.calculationBasis,
                committeeSizes,
                committeeCalculation.individualMembers
            );
        }

        // --- Notiz-Box (fÃ¼r beide Modi) aktualisieren ---
        if(finalNoteHTML) {
            this.DOM.individualMembersNote.innerHTML = finalNoteHTML;
            this.DOM.individualMembersNote.style.display = 'block';
        } else {
            this.DOM.individualMembersNote.style.display = 'none';
        }

        // In beiden FÃ¤llen: Ergebnisse anzeigen
        this.DOM.committeeResultsSection.style.display = 'block';
    }

    renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder) {
        return renderCommitteeResultsTable({
            table: this.DOM.committeeResultsTable,
            results,
            calculationBasis,
            committeeSizes,
            individualMembers: einzelmitglieder
        });
    }

    exportScenario() {
        const partiesData = this._getPartiesFromUI();
        const scenario = partiesData.map(p => ({ name: p.abbreviation, votes: p.votes, directMandates: p.directMandates, color: p.color }));
        const dataStr = JSON.stringify(scenario, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'rat-szenario.json';
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    importScenario(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const scenario = JSON.parse(e.target.result);
                if (!Array.isArray(scenario)) throw new Error("JSON must be an array.");
                this.clearAllParties(true);

                scenario.forEach(p => { this.addParty(p.name, p.votes, p.directMandates, p.color, p.seats || 0); });
            } catch (err) {
                this._showModal("Import-Fehler", `<p>Fehler beim Laden der Szenario-Datei:</p><p><strong>${err.message}</strong></p>`);
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }

    // ÃœBERARBEITET: Import-Funktion fÃ¼r VoteManager (nutzt jetzt Modal)
    importVoteManagerCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                // Leere Zeilen am Ende entfernen
                const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    // Wir brauchen mindestens eine Header-Zeile und eine Daten-Zeile
                    throw new Error("CSV-Datei ist zu kurz. Erwarte mind. 1 Header-Zeile und 1 Daten-Zeile.");
                }

                // Annahme: Zeile 0 = Technischer Header, Zeile 1+ = Daten (Wahlbezirke)
                const headerTech = lines[0].split(';');
                const dataLines = lines.slice(1);

                // Speichert { index: i, id: 'D1', votes: 0, directMandates: 0 }
                const partyColumns = [];
                // Speichert { districtName: '...', tiedParties: ['D1', 'D2'], votes: 123 }
                let districtTies = [];
                let gebietNameIndex = 4; // Standard-Index fÃ¼r 'gebiet-name'

                // --- 1. Finde alle Parteien-Spalten (D1, D2...) ---
                headerTech.forEach((col, index) => {
                    const colTrimmed = col.trim();
                    const colNumPart = colTrimmed.substring(1);

                    // KORRIGIERTE PRÃœFUNG: Muss 'D' + Zahl sein (ignoriert 'D' selbst)
                    if (colTrimmed.startsWith('D') && colNumPart.length > 0 && !isNaN(colNumPart)) {
                        partyColumns.push({
                            index: index,
                            id: colTrimmed, // z.B. 'D1'
                            votes: 0,
                            directMandates: 0
                        });
                    }

                    // Finde die Spalte 'gebiet-name' fÃ¼r die Tie-Breaker-Meldung
                    if (colTrimmed.toLowerCase() === 'gebiet-name') {
                        gebietNameIndex = index;
                    }
                });

                if (partyColumns.length === 0) {
                    throw new Error("Keine gÃ¼ltigen Parteien-Spalten (D1, D2, ...) in der Header-Zeile gefunden.");
                }

                // --- 2. Iteriere durch Wahlbezirke (Datenzeilen) ---
                dataLines.forEach(line => {
                    const values = line.split(';');
                    if (values.length < headerTech.length) return; // UnvollstÃ¤ndige Zeilen Ã¼berspringen

                    let maxVotes = -1;
                    let districtWinners = []; // Kann mehrere EintrÃ¤ge bei Gleichstand haben

                    const districtName = values[gebietNameIndex] ? values[gebietNameIndex].trim() : 'Unbekannter Bezirk';

                    partyColumns.forEach(party => {
                        const voteValueStr = values[party.index];
                        if (!voteValueStr) return; // Zelle ist leer

                        const voteValue = parseInt(voteValueStr, 10);
                        if (isNaN(voteValue) || voteValue < 0) return; // Kein gÃ¼ltiger Wert

                        // A) Gesamtstimmen summieren
                        party.votes += voteValue;

                        // B) Direktmandat fÃ¼r diesen Bezirk ermitteln
                        if (voteValue > maxVotes) {
                            maxVotes = voteValue;
                            districtWinners = [party.id]; // Neuer alleiniger Gewinner
                        } else if (voteValue === maxVotes && maxVotes > 0) {
                            districtWinners.push(party.id); // Gleichstand
                        }
                    });

                    // C) Direktmandate zuweisen ODER Losentscheid-Fall speichern
                    if (districtWinners.length === 1 && maxVotes > 0) {
                        // Eindeutiger Gewinner
                        const winnerParty = partyColumns.find(p => p.id === districtWinners[0]);
                        if (winnerParty) {
                            winnerParty.directMandates++;
                        }
                    } else if (districtWinners.length > 1) {
                        // Gleichstand (Losentscheid)
                        districtTies.push({
                            districtName: districtName,
                            tiedParties: districtWinners,
                            votes: maxVotes
                        });
                    }
                    // (Wenn maxVotes = 0, gewinnt niemand)
                });

                // --- 3. UI aktualisieren ---
                this.clearAllParties(true); // Bestehende Parteien lÃ¶schen

                const anzahlWahlbezirke = dataLines.length;
                if (anzahlWahlbezirke > 0) {
                    this.DOM.councilSize.value = anzahlWahlbezirke * 2;
                }

                // FÃ¼ge nur Parteien hinzu, die auch Stimmen bekommen haben
                partyColumns.filter(p => p.votes > 0).forEach(party => {
                    this.addParty(
                        `Partei ${party.id}`, // Platzhaltername!
                        party.votes,
                        party.directMandates,
                        '' // Farbe automatisch zuweisen lassen
                    );
                });

                // --- 4. User Ã¼ber Ergebnis UND Losentscheide im MODAL informieren ---
                let totalMandatesFound = partyColumns.reduce((sum, p) => sum + p.directMandates, 0);

                // Build HTML for modal
                let modalHTML = `<p>Der CSV-Import war erfolgreich.</p><ul>`;
                modalHTML += `<li><strong>Parteien gefunden:</strong> ${partyColumns.filter(p => p.votes > 0).length}</li>`;
                modalHTML += `<li><strong>Eindeutige Mandate:</strong> ${totalMandatesFound}</li>`;
                modalHTML += `</ul>`;

                modalHTML += `<h4>Wichtige Hinweise</h4>`;
                modalHTML += `<p><strong>1. Platzhalter-Namen:</strong> Die Parteinamen (z.B. 'Partei D1') sind Platzhalter. Bitte benennen Sie diese in der Liste manuell um (z.B. in 'CDU').</p>`;

                if (districtTies.length > 0) {
                    modalHTML += `<div class="tie-warning">`; // Spezielle CSS-Klasse
                    modalHTML += `<p><strong>2. WARNUNG: ${districtTies.length} LOSENTSCHEIDE SIND OFFEN!</strong></p>`;
                    modalHTML += "<p>In folgenden Wahlbezirken gab es einen Gleichstand. Diese Mandate wurden <strong>NOCH NICHT</strong> zugeteilt. Bitte addieren Sie die Gewinner-Mandate nach dem (realen) Losentscheid manuell in der UI:</p>";

                    modalHTML += `<ul>`; // Innere Liste fÃ¼r die Bezirke
                    districtTies.forEach(tie => {
                        modalHTML += `<li><strong>Bezirk '${tie.districtName}'</strong>: Gleichstand (${tie.votes} Stimmen) zwischen <strong>${tie.tiedParties.join(', ')}</strong></li>`;
                    });
                    modalHTML += `</ul></div>`;
                } else {
                    modalHTML += `<p><strong>2. Losentscheide:</strong> Es wurden keine unentschiedenen Direktmandate (Losentscheide) gefunden. Alle ${totalMandatesFound} Mandate wurden zugeteilt.</p>`;
                }

                // Zeige das Modal
                this._showModal("Import-Ergebnis", modalHTML);

            } catch (err) {
                // Fehlerfall: Zeige Fehler im Modal
                this._showModal("Import-Fehler", `<p style="color:var(--danger-color);">Ein Fehler ist aufgetreten:</p><p><strong>${err.message}</strong></p><p>Bitte prÃ¼fen Sie die Datei und das Format.</p>`);
            } finally {
                // File-Input zurÃ¼cksetzen
                event.target.value = null;
            }
        };

        reader.onerror = () => {
             // Fehlerfall: Zeige Fehler im Modal
            this._showModal("Lese-Fehler", `<p style="color:var(--danger-color);">Die Datei konnte nicht gelesen werden.</p>`);
            event.target.value = null;
        };

        // VoteManager-Exporte sind UTF-8 kodiert nicht 'ISO-8859-1' (ANSI)
        reader.readAsText(file, 'UTF-8');
    }


    // --- NEUE METHODEN FÃœR LOCALSTORAGE ---

    /**
     * Speichert den gesamten UI-Zustand im localStorage.
     * Wird aufgerufen, wenn die Seite verlassen wird.
     */

    _saveStateToStorage() {
        // Nicht speichern, wenn ein Reset ausgelÃ¶st wurde
        if (this.isResetting) {
              return;
        }

        // Das State-Objekt, das alles enthÃ¤lt, was wir speichern wollen
        const state = {
            // KORREKTUR 1: Den Query auf den Haupt-Tab-Container beschrÃ¤nkt
            appMode: this.DOM.appModeSelection.querySelector('.tab.active').dataset.mode,
            nrwState: {
                // KORREKTUR 2: Die Hilfsfunktion verwenden
                inputMode: this._getNrwInputMode(),
                councilSize: this.DOM.councilSize.value,
                parties: this._getPartiesFromUI() // Diese Methode gibt bereits saubere Daten zurÃ¼ck
            },
            simpleState: {
                procedure: this.appState.getSimpleProcedure(),
                seatSizes: this.appState.getSimpleSeatSizes().filter(val => val.trim() !== ''),
                proposals: this._getProposalsFromUI() // Gibt saubere Daten zurÃ¼ck
            },
            committeeState: {
                seatSizes: this.appState.getCommitteeSeatSizes().filter(val => val.trim() !== ''),
                presentVotes: this.appState.getCommitteePresentVotes(),
                factionAlliances: this.appState.getCommitteeFactionAlliances()
            },
            customColorMappings: this.state.customColorMappings // NEU
        };

        try {
            // Speichern des gesamten Zustands als JSON-String
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            console.log("Anwendungs-Status gespeichert.");
        } catch (e) {
            console.error("Fehler beim Speichern des Anwendungs-Status:", e);
        }
    }

    /**
     * NEU: LÃ¤dt den Zustand aus dem localStorage und stellt die UI wieder her.
     * Wird beim Initialisieren des Controllers aufgerufen.
     */
    _loadStateFromStorage() {
        const savedState = localStorage.getItem(this.storageKey);
        if (!savedState) {
            console.log("Kein gespeicherter Status gefunden.");
            return;
        }

        let state;
        try {
            state = JSON.parse(savedState);
        } catch (e) {
            console.error("Gespeicherter Status konnte nicht geladen werden:", e);
            localStorage.removeItem(this.storageKey); // BeschÃ¤digten Status entfernen
            return;
        }

        if (!state) return;

        // --- 1. NRW-Status wiederherstellen ---
        if (state.nrwState) {
            this.clearAllParties(true); // UI und State leeren
            if (state.nrwState.parties && Array.isArray(state.nrwState.parties)) {
                // Gespeicherte Parteien mit ihren IDs (!) wieder hinzufÃ¼gen
                state.nrwState.parties.forEach(p => {
                    this.addParty(p.abbreviation, p.votes, p.directMandates, p.color, p.seats, p.id);
                });
            }
            this.DOM.councilSize.value = state.nrwState.councilSize || '66';

            // Radio-Button fÃ¼r den Eingabemodus setzen
            /*const nrwMode = state.nrwState.inputMode || 'election';
            const radioEl = document.getElementById(`mode-${nrwMode}`);
            if (radioEl) {
                radioEl.checked = true;
            }
            this.toggleInputMode(nrwMode); // UI fÃ¼r den Modus anpassen
            //*/

            // Tab fÃ¼r den Eingabemodus setzen
            const nrwMode = state.nrwState.inputMode || 'election';
            const tabEl = this.DOM.nrwInputModeTabs.querySelector(`.tab[data-mode="${nrwMode}"]`);

            // Sicherstellen, dass die Standard-UI (election) aktiv ist, bevor wir umschalten
            this.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="election"]').classList.add('active');
            this.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="direct"]').classList.remove('active');

            if (tabEl) {
                // Unsere neue Funktion kÃ¼mmert sich um das Highlighting UND das Umschalten der UI
                this.switchNrwInputMode(tabEl);
            } else {
                // Fallback, falls der Tab nicht gefunden wird
                this.toggleInputMode(nrwMode);
            }

        }

        // --- 2. "Einfach"-Status wiederherstellen ---
        if (state.simpleState) {
            this.clearAllProposals(true); // UI und State leeren
            if (state.simpleState.proposals && Array.isArray(state.simpleState.proposals)) {
                // Gespeicherte VorschlÃ¤ge mit ihren IDs (!) wieder hinzufÃ¼gen
                state.simpleState.proposals.forEach(p => {
                    this.addProposal(p.abbreviation, p.votes, p.color, p.id);
                });
            }
            this.appState.setSimpleProcedure(state.simpleState.procedure || 'hare');
            this.appState.setSimpleSeatSizes(state.simpleState.seatSizes);
            this.renderSimpleSizeInputs();
        }

        const committeeState = state.committeeState || {
            seatSizes: ['19'],
            presentVotes: state.nrwState?.presentVotes || [],
            factionAlliances: []
        };

        if (committeeState) {
            this.appState.setCommitteeSeatSizes(committeeState.seatSizes);
            this.appState.setCommitteePresentVotes(committeeState.presentVotes);
            this.appState.setCommitteeFactionAlliances(committeeState.factionAlliances);
            this.renderCommitteeSizeInputs();
        }

        // --- 3. App-Modus (Tab) wiederherstellen ---
        const appMode = state.appMode || 'simple';
        this.switchAppMode(appMode);

        // --- 4. Ausschussdaten wiederherstellen ---
        // Ausschussdaten bleiben fachlich getrennt gespeichert, brauchen aber vorhandene Ratssitze als Grundlage.
        if (state.nrwState && state.nrwState.parties && state.nrwState.parties.length > 0) {
            this.calculateCouncilSeats();

            this.appState.setCommitteePresentVotes(committeeState.presentVotes);
            this.appState.setCommitteeFactionAlliances(committeeState.factionAlliances);
            this.renderCommitteeVotingInputs();
            this.renderFraktionenForGemeinschaft();
            this.updateTotalPresentVotes();
        }

        // --- 5. Custom Color Mappings wiederherstellen ---
        if (state.customColorMappings && Array.isArray(state.customColorMappings)) {
            this.state.customColorMappings = state.customColorMappings;
        }

        // --- 6. NEU: Preset-Dropdown auf "Gespeichert" setzen ---
        this.DOM.presetSelect.value = 'user_saved_state';
        this.state.currentPresetId = 'user_saved_state';

        console.log("Anwendungs-Status wiederhergestellt.");
    }

    // ==========================================================
    // NEU: METHODEN FÃœR CUSTOM COLOR MAPPING
    // ==========================================================

    /**
     * Zeigt das Modal zur Verwaltung der eigenen Farb-Mappings an.
     */
    showColorMappingModal() {
        // Container fÃ¼r den Modal-Inhalt erstellen
        const container = document.createElement('div');
        container.id = 'custom-mappings-container';
        container.innerHTML = `
            <p>Hier kÃ¶nnen Sie eigene Parteinamen (z.B. lokale WÃ¤hlergruppen) und Farben definieren. Diese werden automatisch erkannt, wenn Sie den Namen in der Liste eintragen.</p>
            <p>Die Mappings werden in Ihrem Browser gespeichert.</p>
            <div id="custom-mappings-list">
                <!-- Liste wird dynamisch befÃ¼llt -->
            </div>
            <button id="modal-add-mapping" class="btn-add" style="margin-top: 10px;">+ Neues Mapping hinzufÃ¼gen</button>
            <div style="text-align: right; margin-top: 20px;">
                <button id="modal-btn-close" class="btn-secondary">SchlieÃŸen</button>
            </div>
        `;

        // Modal anzeigen (verwenden das existierende System)
        this._showModal('Eigene Farben verwalten', container.innerHTML);

        // WICHTIG: Die Event-Listener erst *nach* dem Anzeigen des Modals hinzufÃ¼gen,
        // da _showModal den innerHTML neu setzt.
        document.getElementById('modal-add-mapping').addEventListener('click', () => {
            this.addCustomMapping();
            this.renderCustomMappingList(); // Liste im Modal neu zeichnen
        });

        document.getElementById('modal-btn-close').addEventListener('click', () => {
            this._hideModal();
        });

        // Wir mÃ¼ssen den 'X'-Button (csv-modal-close) neu binden,
        // da _showModal keinen Promise-basierten SchlieÃŸ-Mechanismus hat.
        // Wir entfernen den alten Listener und fÃ¼gen einen neuen hinzu, der nur schlieÃŸt.
        const oldCloseBtn = this.DOM.csvModalClose;
        const newCloseBtn = oldCloseBtn.cloneNode(true);
        oldCloseBtn.parentNode.replaceChild(newCloseBtn, oldCloseBtn);
        this.DOM.csvModalClose = newCloseBtn; // Referenz im DOM-Objekt aktualisieren

        newCloseBtn.addEventListener('click', () => {
             this._hideModal();
        });

        // Liste im Modal initial rendern
        this.renderCustomMappingList();
    }

    /**
     * (Hilfsfunktion) Zeichnet die Liste der Mappings *innerhalb* des Modals.
     */
    renderCustomMappingList() {
        const listContainer = document.getElementById('custom-mappings-list');
        if (!listContainer) return; // Modal ist nicht offen

        listContainer.innerHTML = ''; // Liste leeren

        if (this.state.customColorMappings.length === 0) {
            listContainer.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--text-muted);">Keine eigenen Mappings. Klicken Sie auf "HinzufÃ¼gen".</p>';
        }

        this.state.customColorMappings.forEach((mapping, index) => {
            const mappingDiv = document.createElement('div');
            mappingDiv.className = 'mapping-item';
            mappingDiv.dataset.index = index;

            mappingDiv.innerHTML = `
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${mapping.color};" tabindex="0"></div>
                    <input type="color" class="color-picker-hidden" value="${mapping.color}">
                </div>
                <input type="text" placeholder="Name (z.B. 'UWG')" value="${mapping.name}" class="mapping-name">
                <input type="text" placeholder="#FF0000" value="${mapping.color}" class="mapping-color-text" style="font-size: 0.9em;">
                <button class="btn-remove">X</button>
            `;

            listContainer.appendChild(mappingDiv);

            // Event-Listener fÃ¼r dieses Item
            const colorPreview = mappingDiv.querySelector('.color-preview');
            const colorInput = mappingDiv.querySelector('.color-picker-hidden');
            const nameInput = mappingDiv.querySelector('.mapping-name');
            const colorText = mappingDiv.querySelector('.mapping-color-text');
            const removeBtn = mappingDiv.querySelector('.btn-remove');

            // Farbe Ã¤ndern (Picker)
            colorInput.addEventListener('change', () => {
                const newColor = colorInput.value;
                colorPreview.style.background = newColor;
                colorText.value = newColor;
                this.updateCustomMapping(index, { color: newColor });
            });
            // Farbe Ã¤ndern (Textfeld)
            colorText.addEventListener('input', () => {
                const newColor = colorText.value;
                // Einfache Validierung
                if (/^#[0-9a-fA-F]{6}$/.test(newColor) || /^[a-zA-Z]+$/.test(newColor)) {
                    colorPreview.style.background = newColor;
                    colorInput.value = newColor;
                    this.updateCustomMapping(index, { color: newColor });
                }
            });
            // Name Ã¤ndern
            nameInput.addEventListener('change', () => { // 'change' (beim Verlassen) statt 'input'
                this.updateCustomMapping(index, { name: nameInput.value });
            });
            // LÃ¶schen
            removeBtn.addEventListener('click', () => {
                this.removeCustomMapping(index);
                this.renderCustomMappingList(); // Liste neu zeichnen
            });
            // A11y (Tastatur-Steuerung)
            colorPreview.addEventListener('click', () => colorInput.click());
            colorPreview.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    colorInput.click();
                }
            });
        });
    }

    /**
     * FÃ¼gt ein leeres Mapping zum State hinzu.
     */
    addCustomMapping() {
        this.state.customColorMappings.push({
            name: '',
            color: '#cccccc'
        });
    }

    /**
     * Aktualisiert ein Mapping im State.
     */
    updateCustomMapping(index, updates) {
        if (this.state.customColorMappings[index]) {
            Object.assign(this.state.customColorMappings[index], updates);
            // Sofortiges Speichern im LocalStorage bei Ã„nderung
            this._saveStateToStorage();
        }
    }

    /**
     * Entfernt ein Mapping aus dem State.
     */
    removeCustomMapping(index) {
        this.state.customColorMappings.splice(index, 1);
        // Sofortiges Speichern im LocalStorage bei Ã„nderung
        this._saveStateToStorage();
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









