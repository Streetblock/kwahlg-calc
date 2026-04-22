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
            // NEU: IDs für Reset-Buttons
            resetVotesButton: document.getElementById('resetVotesButton'),
            resetProposalVotesButton: document.getElementById('resetProposalVotesButton'),

            individualMembersNote: document.getElementById('individual-members-note'),
            nrwInputModeTabs: document.getElementById('nrw-input-mode-tabs'), //modeSelection: document.getElementById('mode-selection'),
            partyItemHeader: document.querySelector('.party-item-header'),
            councilSizeGroup: document.getElementById('councilSize-group'),

            // simple-seats entfernt, simple-sizes-container hinzugefügt
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

            // NEU: Tabs für Modus-Wahl
            tabNrW: document.getElementById('tab-nrw'),
            tabSimple: document.getElementById('tab-simple'),

            // NEU: Chart-Container
            nrwChartsContainer: document.getElementById('nrw-charts-container'),
            simpleChartsContainer: document.getElementById('simple-charts-container'),

            // NEU: Globaler Reset Button
            resetApplicationButton: document.getElementById('resetApplicationButton')
        };

        this.appState = new AppState();
        this.state = {
            councilResults: [],
            factionAlliances: [],
            customColorMappings: [],
            currentPresetId: null // NEU
        };

        // NEU: storageKey definieren
        this.storageKey = 'AusschussRechnerPro_State_v1'; // v1, falls wir die Struktur später ändern
        this.isResetting = false; // NEU: Flag für Reset-Vorgang

        this.partyIdCounter = 0;
        this.proposalIdCounter = 0;
        this.defaultColors = ["#000000", "#EB001F", "#64A12D", "#009EE0", "#FFED00", "#BE3075", "#AA0000", "#9A7D4E", "#D81B60", "#0078C7", "#502379", "#003366"];

        this.partyColorMap = {
            'CDU': '#000000',
            'CSU': '#000000',
            'SPD': '#EB001F',
            'GRÜNE': '#64A12D',
            'DIE GRÜNEN': '#64A12D',
            'FDP': '#ffe209',// #FFED00',
            'DIE LINKE': '#BE3075',
            'LINKE': '#BE3075',
            'AFD': '#009EE0',
            'BSW': '#BA1264',
            'VOLT': '#502379',
            'DIE PARTEI': '#888888',
            'PARTEI': '#888888',
            'FREIE WÄHLER': '#F9A825',
            'FW': '#F9A825',
            // NEU: Weitere Parteien hinzugefügt
            'PIRATEN': '#FF8800', // Orange
            'ÖDP': '#FF6600', // Dunkleres Orange
            'TIERSCHUTZPARTEI': '#00545f' // Blaugrün/Teal #00AACC
        };

        // --- HIER DIE RENDERER INITIALISIEREN ---
        this.nrwVoteBarChartRenderer = new VoteBarChartRenderer('nrwVoteBarChart');
        this.nrwHemicycleRenderer = new HemicycleRenderer('nrwSeatHemicycleDiagram', 'nrwSeatHemicycleLegend');

        this.simpleVoteBarChartRenderer = new VoteBarChartRenderer('simpleVoteBarChart');
        this.simpleHemicycleRenderer = new HemicycleRenderer('simpleSeatHemicycleDiagram', 'simpleSeatHemicycleLegend');
        // --- Ende Hinzufügung ---

        // KORREKTUR: CoalitionAnalyzers initialisieren
        // Der 'councilSize' Input existiert, dieser Analyzer funktioniert.
        this.nrwCoalitionAnalyzer = new CoalitionAnalyzer(
            'nrw-coalition-checklist', // Diese ID existiert (noch) nicht im HTML, fügt aber keinen Fehler hinzu
            'nrw-coalition-result',
            'nrw-auto-coalitions',
            'councilSize'
        );

        // KORREKTUR: Der 'simple-seats' Input existiert NICHT mehr.
        // Das würde einen Fehler werfen und das Skript stoppen.
        // Wir kommentieren es aus, behalten aber die Klasse (wie gewünscht).
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

        // NEU: Status laden, *bevor* wir die initialen Parteien hinzufügen
        // _loadStateFromStorage wird die "clearAll" Methoden aufrufen.
        // Wenn kein Status geladen wurde, fügen wir die Standard-Beispiele hinzu.
        const savedState = localStorage.getItem(this.storageKey);
        if (savedState) {
            this._loadStateFromStorage();
        } else {
            // Nur wenn kein Status geladen wurde, das Standard-Preset laden
            this.loadPreset(PRESET_DATABASE.defaultPresetId);
            //this.addInitialParties();

            // Die Initialisierung für den "Einfach"-Modus bleibt bestehen
            this.addInitialProposals();

        }

        this.renderSimpleSizeInputs();
    }

    _bindEvents() {
        // this.DOM.appModeSelection.addEventListener('change', (e) => this.switchAppMode(e)); // ALT
        // NEU:
        this.DOM.tabNrW.addEventListener('click', () => this.switchAppMode('nrw'));
        this.DOM.tabSimple.addEventListener('click', () => this.switchAppMode('simple'));

        // NEU: Event-Listener für das Preset-Dropdown
        this.DOM.presetSelect.addEventListener('change', async (e) => { // async!
            const selectedPresetId = e.target.value;

            // Warnung anzeigen, da dies die aktuellen Eingaben überschreibt
            const confirmed = await this._showConfirmationModal(
                'Voreinstellung laden',
                'Möchten Sie wirklich die Voreinstellung laden? Alle aktuell eingegebenen Parteien werden überschrieben.',
                'Laden',
                'btn-danger' // Roter Lade-Button
            );

            if (confirmed) {
                // Wenn bestätigt, das Preset laden
                this.loadPreset(selectedPresetId);
            } else {
                // Wenn abgebrochen, das Dropdown auf das zuletzt geladene Preset zurücksetzen
                if (this.state.currentPresetId) {
                    this.DOM.presetSelect.value = this.state.currentPresetId;
                }
            }
        });

        // --- Modus 1 (NRW) Events ---
        this.DOM.addPartyButton.addEventListener('click', () => this.addParty());
        // GEÄNDERT: Event-Listener muss nun 'async' sein
        this.DOM.clearPartiesButton.addEventListener('click', async () => await this.clearAllParties());
        // NEU: Event-Listener für Reset-Button
        this.DOM.resetVotesButton.addEventListener('click', () => this.resetAllVotes());

        this.DOM.calculateCouncilButton.addEventListener('click', () => this.calculateCouncilSeats());
        this.DOM.addCommitteeSizeBtn.addEventListener('click', () => this.addCommitteeSizeInput());
        this.DOM.createFactionAllianceButton.addEventListener('click', () => this.createFraktionsgemeinschaft());
        this.DOM.dissolveFactionAlliancesButton.addEventListener('click', () => this.dissolveFraktionsgemeinschaften());
        this.DOM.calculateCommitteesButton.addEventListener('click', () => this.calculateCommitteeSeats());


        // NEU: Event-Listener für die NRW-Eingabemodus-Tabs
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

        // HINZUGEFÜGT: Event Listener für votingStrengthContainer
        this.DOM.votingStrengthContainer.addEventListener('input', () => this.updateTotalPresentVotes());

        // NEU: Event-Listener für Ausschuss-Modus-Tabs
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
        // GEÄNDERT: Event-Listener muss nun 'async' sein
        this.DOM.clearProposalsButton.addEventListener('click', async () => await this.clearAllProposals());
        // NEU: Event-Listener für Reset-Button
        this.DOM.resetProposalVotesButton.addEventListener('click', () => this.resetAllProposalVotes());

        this.DOM.calculateSimpleButton.addEventListener('click', () => this.runSimpleCalculation());
        // NEU: Event für Farb-Mapping-Modal
        this.DOM.manageCustomColorsBtn.addEventListener('click', () => this.showColorMappingModal());

        // NEU: Event-Listener für den globalen Reset
        if (this.DOM.resetApplicationButton) {
            this.DOM.resetApplicationButton.addEventListener('click', () => this.resetApplication());
        }

        // NEU: Modal-Schließen-Event (KORRIGIERT)
        if (this.DOM.csvModalClose) { // Sicherstellen, dass das Element existiert
            // KORREKTUR: Dieser Listener wird jetzt vom Confirmation Modal verwaltet
            // Wir binden hier nur den Standard-Schließ-Mechanismus
            this.DOM.csvModalClose.addEventListener('click', () => this._hideModal());
        }

        // NEU: Event-Listener zum Speichern des Status beim Verlassen der Seite
        window.addEventListener('beforeunload', this._saveStateToStorage.bind(this));

        // NEU: Hinzufügen-Shortcut mit der '+' Taste
        document.addEventListener('keydown', (e) => {
            // Nur auslösen, wenn '+' gedrückt wurde
            if (e.key !== '+') return;

            // Verhindern, wenn der Fokus auf einem Eingabefeld liegt
            const activeTag = document.activeElement.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
                return;
            }

            // Verhindern, dass das '+' in ein Feld geschrieben wird
            e.preventDefault();

            // Prüfen, welcher Modus (Tab) aktiv ist
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

    // NEU: Zeigt ein Modal mit "Bestätigen" und "Abbrechen" an
    // Gibt ein Promise zurück, das mit true (bestätigt) oder false (abgebrochen) auflöst
    _showConfirmationModal(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            // HTML für den Modal-Body mit den Buttons
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
            const btnCloseX = this.DOM.csvModalClose; // Der 'X'-Schließ-Button oben rechts

            // --- AKTUALISIERT: Handler für Tastatur-Events ---
            const keydownHandler = (e) => {
                // Prüfen, ob die Enter-Taste gedrückt wurde
                if (e.key === 'Enter') {
                    e.preventDefault(); // Verhindert Standard-Aktionen
                    confirmHandler(); // Löst die Bestätigungs-Aktion aus
                }
                // NEU: Prüfen, ob die Escape-Taste gedrückt wurde
                else if (e.key === 'Escape' || e.key === 'Esc') { // 'Esc' für ältere Browser
                    e.preventDefault();
                    cancelHandler(); // Löst die Abbrechen-Aktion aus
                }
            };
            // --- ENDE AKTUALISIERT ---

            // Aufräumfunktion, um Event-Listener zu entfernen und das Modal zu schließen
            const cleanupAndResolve = (result) => {
                btnConfirm.removeEventListener('click', confirmHandler);
                btnCancel.removeEventListener('click', cancelHandler);
                btnCloseX.removeEventListener('click', cancelHandler);
                document.removeEventListener('keydown', keydownHandler); // Entfernt Tastatur-Listener

                this._hideModal();
                resolve(result);
            };

            // Handler für "Bestätigen"
            const confirmHandler = () => {
                cleanupAndResolve(true); // Promise mit "true" auflösen
            };

            // Handler für "Abbrechen" (gilt für "Abbrechen"-Button UND 'X'-Button)
            const cancelHandler = () => {
                cleanupAndResolve(false); // Promise mit "false" auflösen
            };

            // Temporäre Event-Listener an die Buttons hängen
            btnConfirm.addEventListener('click', confirmHandler);
            btnCancel.addEventListener('click', cancelHandler);
            btnCloseX.addEventListener('click', cancelHandler);

            // Tastatur-Listener zum Dokument hinzufügen
            document.addEventListener('keydown', keydownHandler);
        });
    }

    /*_showConfirmationModal(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            // HTML für den Modal-Body mit den Buttons
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
            const btnCloseX = this.DOM.csvModalClose; // Der 'X'-Schließ-Button oben rechts

            // Aufräumfunktion, um Event-Listener zu entfernen und das Modal zu schließen
            // WICHTIG: Eigene Listener, um Konflikte mit dem Standard-Listener zu vermeiden
            const cleanupAndResolve = (result) => {
                btnConfirm.removeEventListener('click', confirmHandler);
                btnCancel.removeEventListener('click', cancelHandler);
                // Wichtig: Wir müssen den *temporären* 'X'-Listener entfernen
                btnCloseX.removeEventListener('click', cancelHandler);
                this._hideModal();
                resolve(result);
            };

            // Handler für "Bestätigen"
            const confirmHandler = () => {
                cleanupAndResolve(true); // Promise mit "true" auflösen
            };

            // Handler für "Abbrechen" (gilt für "Abbrechen"-Button UND 'X'-Button)
            const cancelHandler = () => {
                cleanupAndResolve(false); // Promise mit "false" auflösen
            };

            // Temporäre Event-Listener an die Buttons hängen
            btnConfirm.addEventListener('click', confirmHandler);
            btnCancel.addEventListener('click', cancelHandler);
            // Wir fügen einen *eigenen* Listener zum 'X' hinzu, der "Abbrechen" auslöst
            // Dieser überschreibt nicht den Standard-Listener, wird aber zuerst ausgeführt
            btnCloseX.addEventListener('click', cancelHandler);
        });
    }//*/

    // ==========================================================
    // NEUE / ÜBERARBEITETE METHODEN
    // ==========================================================

    switchAppMode(selectedMode) {
        // const selectedMode = event.target.value; // ALT
        if (selectedMode === 'nrw') {
            this.DOM.nrwModePanel.style.display = 'block';
            this.DOM.simpleModePanel.style.display = 'none';
            // NEU: Active-Status für Tabs setzen
            this.DOM.tabNrW.classList.add('active');
            this.DOM.tabSimple.classList.remove('active');
        } else {
            this.DOM.nrwModePanel.style.display = 'none';
            this.DOM.simpleModePanel.style.display = 'block';
            // NEU: Active-Status für Tabs setzen
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

        // 1. Prüfe Custom Mappings (höchste Priorität)
        const customMapping = this.state.customColorMappings.find(m => m.name.toUpperCase() === upperName);
        if (customMapping) {
            colorPreviewEl.style.background = customMapping.color;
            colorInputEl.value = customMapping.color;
            return;
        }

        // 2. Prüfe Standard-Mappings (partyColorMap)
        let singleColor = this.partyColorMap[upperName];
        if (singleColor) {
            colorPreviewEl.style.background = singleColor;
            colorInputEl.value = singleColor;
            return;
        }

        // 3. Prüfe kombinierte Namen (z.B. "CDU/CSU")
        const splitNames = upperName.split(/[\/&+,]/);
        if (splitNames.length > 1) {
            const colors = splitNames
                .map(n => {
                    const trimmedUpper = n.trim();
                    // Prüfe Custom ODER Default Map
                    const custom = this.state.customColorMappings.find(m => m.name.toUpperCase() === trimmedUpper);
                    return custom ? custom.color : this.partyColorMap[trimmedUpper];
                })
                .filter(Boolean);

            if (colors.length > 0) {
                const gradient = this._createGradient(colors);
                colorPreviewEl.style.background = gradient;
                colorInputEl.value = colors[0]; // Nimm die erste gefundene Farbe für den Picker
                return;
            }
        }
    }

    /**
     * NEU: Lädt ein vordefiniertes Szenario aus der PRESET_DATABASE.
     * Setzt die Ratsgröße und füllt die Parteiliste.
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

        // 1. UI-Elemente für NRW-Modus zurücksetzen
        this.clearAllParties(true);

        // 2. Ratsgröße aus dem Preset setzen
        this.DOM.councilSize.value = preset.councilSize;

        // 3. Parteien aus dem Preset hinzufügen
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
     * NEU: Füllt das Dropdown-Menü für die Voreinstellungen
     * basierend auf der PRESET_DATABASE.
     */
     _populatePresetDropdown() {
        if (!this.DOM.presetSelect) return;
        this.DOM.presetSelect.innerHTML = ''; // Vorherige Optionen leeren

        // NEU: Option für den gespeicherten Zustand
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


        // Einträge aus der Datenbank erstellen
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

    // GEÄNDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllProposals(skipConfirm = false) {
        if (!skipConfirm) {
            // Ruft das neue Modal auf und wartet auf die Antwort (true/false)
            const confirmed = await this._showConfirmationModal(
                'Bestätigung erforderlich',
                'Möchten Sie wirklich <strong>alle Vorschläge</strong> löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                'Alle löschen',
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

    // NEU: Fügt ein weiteres Eingabefeld für die Sitzgröße hinzu
    addSimpleSizeInput() {
        this.appState.addSimpleSeatSize('');
        this.renderSimpleSizeInputs();
    }

    _getProposalsFromUI() {
        return this.appState.getSimpleProposals();
    }

    renderSimpleProposalList() {
        const proposals = this.appState.getSimpleProposals();
        this.DOM.simpleProposalsContainer.innerHTML = '';

        proposals.forEach((proposal) => {
            const proposalDiv = document.createElement('div');
            proposalDiv.className = 'proposal-item';
            proposalDiv.dataset.proposalId = proposal.id;

            proposalDiv.innerHTML = `
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${proposal.color};"></div>
                    <input type="color" class="color-picker-hidden" value="${this._getColorPickerValue(proposal.color)}">
                </div>
                <input type="text" placeholder="Name" value="${proposal.abbreviation}" class="proposal-name">
                <input type="number" placeholder="Stimmen" value="${proposal.votes}" min="0" style="text-align:right;">
                <button class="btn-remove">X</button>
            `;

            const colorPreview = proposalDiv.querySelector('.color-preview');
            const colorInput = proposalDiv.querySelector('.color-picker-hidden');
            const nameInput = proposalDiv.querySelector('.proposal-name');
            const votesInput = proposalDiv.querySelector('input[type="number"]');

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

            proposalDiv.querySelector('.btn-remove').addEventListener('click', () => {
                this.appState.removeSimpleProposal(proposal.id);
                this.renderSimpleProposalList();
            });

            this.DOM.simpleProposalsContainer.appendChild(proposalDiv);
        });
    }

    renderSimpleSizeInputs() {
        const seatSizes = this.appState.getSimpleSeatSizes();
        this.DOM.simpleSizesContainer.innerHTML = '';
        this.DOM.simpleProcedure.value = this.appState.getSimpleProcedure();

        seatSizes.forEach((size, index) => {
            const div = document.createElement('div');
            div.className = 'simple-size-input';

            const removeButtonHtml = index === 0 && seatSizes.length === 1
                ? ''
                : '<button class="btn-remove">X</button>';

            div.innerHTML = `<input type="number" placeholder="${index === 0 ? 'z.B. 10' : 'Weitere Größe'}" value="${size}" min="1" class="simple-size">${removeButtonHtml}`;

            const input = div.querySelector('input');
            input.addEventListener('input', () => {
                this.appState.updateSimpleSeatSize(index, input.value);
            });

            const removeButton = div.querySelector('.btn-remove');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.appState.removeSimpleSeatSize(index);
                    this.renderSimpleSizeInputs();
                });
            }

            this.DOM.simpleSizesContainer.appendChild(div);
        });
    }

    // ÜBERARBEITET: Führt Berechnung für mehrere Sitzgrößen durch
    runSimpleCalculation() {
        // Liest alle Sitzgrößen aus
        const simpleSizes = this.appState.getSimpleSeatSizes()
            .map(value => parseInt(value, 10))
            .filter(val => !isNaN(val) && val > 0);

        const procedure = this.appState.getSimpleProcedure();
        const proposalsData = this._getProposalsFromUI();
        const totalVotes = proposalsData.reduce((sum, p) => sum + p.votes, 0);

        if (proposalsData.length === 0 || simpleSizes.length === 0 || totalVotes === 0) {
            this._showModal("Eingabefehler", "<p>Bitte Vorschläge mit Stimmen und mindestens eine Sitzanzahl > 0 eingeben.</p>");
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
        const allLogs = [];

        // Führt Berechnung für jede Größe durch
        simpleSizes.forEach(size => {
            const result = allocator.calculate(proposalsData, size, totalVotes);
            results[size] = result;
            allLogs.push(...(result.stepsLog || []));
        });

        this.DOM.simpleAllocationSteps.innerHTML = allLogs.join('<hr>');
        this.renderSimpleResults(results, proposalsData, totalVotes, simpleSizes);

        try {
            if (simpleSizes.length > 0) {
                const firstSize = simpleSizes[0]; // Nimm die erste Sitzgröße für die Charts
                const resultsForFirstSize = results[firstSize];

                // Füge die Sitze zu den Eingabedaten hinzu
                const simpleDataForCharts = proposalsData.map(proposal => {
                    const partyResult = resultsForFirstSize.partyResults.find(p => p.id === proposal.id);
                    return {
                        ...proposal, // enthält id, abbreviation, votes, color
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

    // ÜBERARBEITET: Zeigt Ergebnisse für mehrere Sitzgrößen in Spalten an
    renderSimpleResults(results, proposalsData, totalVotes, simpleSizes) {
        const table = this.DOM.simpleResultsTable;
        table.innerHTML = ''; // Löscht alte Tabelle

        // 1. Tabellenkopf (thead) erstellen
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headerRow.innerHTML = `<th>Farbe</th><th>Vorschlag / Liste</th><th>Stimmen</th><th>Anteil</th>`;
        simpleSizes.forEach(size => {
            headerRow.innerHTML += `<th style="text-align: center;">Sitze (${size})</th>`;
        });

        // 2. Tabellenkörper (tbody) erstellen
        const tbody = table.createTBody();
        const tieMessages = new Set();

        proposalsData.filter(p => p.votes > 0).forEach(proposal => {
            const row = tbody.insertRow();
            const voteShare = totalVotes > 0 ? (proposal.votes / totalVotes * 100) : 0;

            row.innerHTML = `
                <td><div class="color-preview" style="background: ${proposal.color};"></div></td>
                <td>${proposal.abbreviation}</td>
                <td style="text-align: right;">${proposal.votes.toLocaleString('de-DE')}</td>
                <td style="text-align: right;">${voteShare.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} %</td>
            `;

            // Fügt die Ergebnisse für jede Sitzgröße hinzu
            simpleSizes.forEach(size => {
                const resultForSize = results[size];
                const tie = resultForSize.tieInfo;
                const partyResult = resultForSize.partyResults.find(p => p.id === proposal.id);
                const baseSeats = partyResult ? partyResult.proportionalSeats : 0;

                let cellContent = `${baseSeats}`;

                if (tie && tie.partiesInvolved.includes(proposal.id)) {
                    cellContent = `<strong>${baseSeats} + ${tie.claimFraction}</strong> 🎲`;

                    const tiedPartyNames = tie.partiesInvolved
                        .map(id => proposalsData.find(p => p.id === id)?.abbreviation || '')
                        .join(', ');

                    const message = `Für die Verteilung von <strong>${size} Sitzen</strong> besteht ein Losentscheid um <strong>${tie.seatsInContention}</strong> Sitz(e) zwischen: <strong>${tiedPartyNames}</strong> (Anspruch: ${tie.claimFraction}).`;
                    tieMessages.add(message);
                }
                row.innerHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.1em;">${cellContent}</td>`;
            });
        });

        // 3. Los-Hinweise (tieInfo) anzeigen
        if (tieMessages.size > 0) {
            let finalNoteHTML = `<p><strong>⚠️ Hinweis(e) zum Losverfahren:</strong></p><ul>`;
            tieMessages.forEach(msg => {
                finalNoteHTML += `<li>${msg}</li>`;
            });
            finalNoteHTML += '</ul>';
            this.DOM.simpleTieNoteContainer.innerHTML = finalNoteHTML;
            this.DOM.simpleTieNoteContainer.style.display = 'block';
        } else {
            this.DOM.simpleTieNoteContainer.style.display = 'none';
        }

        this.DOM.simpleResultsSection.style.display = 'block';
    }

    // ==========================================================
    // METHODEN FÜR MODUS 1 (NRW)
    // ==========================================================

    /*addInitialParties() {
        // Daten basierend auf deiner vollständigen Liste:
        this.addParty('CDU', 31834, 23, '#000000', 0);
        this.addParty('SPD', 27229, 10, '#EB001F', 0);
        this.addParty('AfD', 15079, 0, '#009EE0', 0);
        this.addParty('GRÜNE', 8242, 0, '#64A12D', 0);
        this.addParty('Die Linke', 5382, 0, '#BE3075', 0);
        this.addParty('FDP', 2666, 0, '#ffe209', 0); // Verwendet FDP-Farbe aus der Map
        this.addParty('BSW', 2031, 0, '#BA1264', 0);
        this.addParty('Die PARTEI', 1865, 0, '#888888', 0);
        this.addParty('Volt', 1267, 0, '#502379', 0);
        this.addParty('FREIE WÄHLER', 175, 0, '#F9A825', 0);
        this.addParty('dieBasis', 102, 0, '', 0); // Keine Standardfarbe, wird automatisch zugewiesen
        this.addParty('WerteUnion', 81, 0, '', 0); // Keine Standardfarbe, wird automatisch zugewiesen

        // Erik Jansen (46 Stimmen) wird hier bewusst NICHT hinzugefügt,
        // da er als Einzelbewerber nicht in den Verhältnisausgleich
        // der Listen einfließt (§ 33 KWahlG NRW).
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
        this.renderNrwPartyList();
    }

    // GEÄNDERT: Muss 'async' sein, um auf das Modal zu warten
    async clearAllParties(skipConfirm = false) {
        if (!skipConfirm) {
            // Ruft das neue Modal auf und wartet auf die Antwort (true/false)
            const confirmed = await this._showConfirmationModal(
                'Bestätigung erforderlich',
                'Möchten Sie wirklich <strong>alle Parteien</strong> löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                'Alle löschen',
                'btn-danger'
            );
            if (!confirmed) return; // Wenn "false" (Abbrechen), Funktion beenden
        }
        this.appState.clearNrwParties();
        this.renderNrwPartyList();
    }

    // NEU: Setzt alle Stimmen im NRW-Modus auf 0
    resetAllVotes() {
        // Für diese Aktion ist keine Bestätigung nötig, da sie nicht-destruktiv ist
        this.appState.resetNrwPartyVotes();
        this.renderNrwPartyList();
    }

    _getPartiesFromUI() {
        return this.appState.getNrwParties();
    }

    _getColorPickerValue(color) {
        const hexMatch = typeof color === 'string' ? color.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/) : null;
        return hexMatch ? hexMatch[0] : this.defaultColors[0];
    }

    renderNrwPartyList() {
        const parties = this.appState.getNrwParties();
        const isDirectMode = this._getNrwInputMode() === 'direct';

        this.DOM.partyListElement.innerHTML = '';

        parties.forEach((party) => {
            const partyDiv = document.createElement('div');
            partyDiv.className = 'party-item';
            partyDiv.dataset.partyId = party.id;

            partyDiv.innerHTML = `
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${party.color};"></div>
                    <input type="color" class="color-picker-hidden" value="${this._getColorPickerValue(party.color)}">
                </div>
                <input type="text" placeholder="Parteiname" value="${party.abbreviation}" class="party-name">
                <input type="number" placeholder="Stimmen" value="${party.votes}" min="0" style="text-align:right; display:${isDirectMode ? 'none' : 'block'};" data-role="votes">
                <input type="number" placeholder="Direktmandate" value="${party.directMandates}" min="0" style="text-align:right; display:${isDirectMode ? 'none' : 'block'};" data-role="directMandates">
                <input type="number" placeholder="Sitze" value="${party.seats}" min="0" style="text-align:right; display:${isDirectMode ? 'block' : 'none'}; grid-column: 3 / span 2;" data-role="seats">
                <button class="btn-remove">X</button>
            `;

            const colorPreview = partyDiv.querySelector('.color-preview');
            const colorInput = partyDiv.querySelector('.color-picker-hidden');
            const nameInput = partyDiv.querySelector('.party-name');
            const votesInput = partyDiv.querySelector('[data-role="votes"]');
            const directMandatesInput = partyDiv.querySelector('[data-role="directMandates"]');
            const seatsInput = partyDiv.querySelector('[data-role="seats"]');

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

            partyDiv.querySelector('.btn-remove').addEventListener('click', () => {
                this.appState.removeNrwParty(party.id);
                this.renderNrwPartyList();
            });

            this.DOM.partyListElement.appendChild(partyDiv);
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
        this.DOM.calculateCouncilButton.textContent = isDirectMode ? 'Ratssitze übernehmen & weiter' : 'Ratssitze berechnen';
    }

    /**
     * NEU: Schaltet die Tabs für den NRW-Eingabemodus (Berechnen vs. Direkt)
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
     * NEU: Schaltet die Tabs für den Ausschuss-Berechnungsmodus (Hare vs D'Hondt)
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

        // Optional: Button-Text ändern
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
            votes: p.votes, // Behalten wir, falls der Benutzer zurückschaltet
            seats: p.seats,
            directMandatesAwarded: 0, // Nicht zutreffend im Direktmodus
            listSeatsAwarded: p.seats // Alle sind "Listenplätze"
        }));

        this.renderCouncilResults(this.state.councilResults, partiesData, true);
        this.DOM.councilAllocationSteps.innerHTML = '<p>Die Ratssitze wurden direkt eingegeben. Es fand keine Berechnung statt.</p>';

        this.DOM.councilResultsSection.style.display = 'block';
        this.DOM.votingSimulationSection.style.display = 'block';
        this.DOM.committeeSection.style.display = 'block';

        this.prepareVotingSimulation();
        this.prepareCommitteeStep();

        // --- HIER DEN CODE ZUM ZEICHNEN DER NRW-CHARTS EINFÜGEN ---
        try {
            // Daten für Charts vorbereiten
            const totalSeatsForChart = this.state.councilResults.reduce((sum, p) => sum + p.seats, 0);

            // Charts rendern (Stimmen-Balken wird leer sein, da keine Stimmen relevant)
            this.nrwVoteBarChartRenderer.render(this.state.councilResults, 0); // Keine Gesamtstimmen im Direktmodus
            this.nrwHemicycleRenderer.render(this.state.councilResults, totalSeatsForChart);
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
            this._showModal("Eingabefehler", "<p>Bitte fügen Sie Parteien hinzu und legen Sie die Ratsgröße fest.</p>");
            return;
        }

        const totalVotesForProportionality = partiesData.reduce((sum, p) => sum + p.votes, 0);

        const allocator = new NrwKWahlgCalculator(new SainteLagueAllocator());
        const result = allocator.calculate(partiesData, initialTotalSeats, totalVotesForProportionality, {});

        this.state.councilResults = result.allocatedParties;
        this.renderCouncilResults(result, partiesData, false);
        this.DOM.councilAllocationSteps.innerHTML = result.stepsLog.join('');

        this.DOM.councilResultsSection.style.display = 'block';
        this.DOM.votingSimulationSection.style.display = 'block';
        this.DOM.committeeSection.style.display = 'block';

        this.prepareVotingSimulation();
        this.prepareCommitteeStep();

        // --- HIER DEN CODE ZUM ZEICHNEN DER NRW-CHARTS EINFÜGEN ---
        try {
            // Daten für Charts vorbereiten
            const partiesDataForCharts = this._getPartiesFromUI(); // Holt Namen, Farben, Stimmen etc.
            let totalVotesForChart = 0;

            // Füge die Stimmen zu den Ratsergebnissen hinzu
            const councilResultsWithVotes = this.state.councilResults.map(resultParty => {
                const inputData = partiesDataForCharts.find(p => p.id === resultParty.id);
                const votes = inputData ? inputData.votes : 0;
                totalVotesForChart += votes;
                return {
                    ...resultParty, // enthält schon id, abbreviation, seats, color
                    votes: votes
                };
            });

            const totalSeatsForChart = this.state.councilResults.reduce((sum, p) => sum + p.seats, 0);

            // Charts rendern
            this.nrwVoteBarChartRenderer.render(councilResultsWithVotes, totalVotesForChart);
            this.nrwHemicycleRenderer.render(councilResultsWithVotes, totalSeatsForChart);
            this.DOM.nrwChartsContainer.style.display = 'flex'; // Den Container sichtbar machen
        } catch (e) {
            console.error("Fehler beim Rendern der NRW-Diagramme:", e);
            this.DOM.nrwChartsContainer.style.display = 'none';
        }

    }

    renderCouncilResults(result, partyInputs, isDirectMode = false) {
        const allocatedParties = result.allocatedParties || result;
        const tieInfo = result.tieInfo;

        this.DOM.councilResultsTableBody.innerHTML = '';

        this.DOM.councilResultsSection.querySelector('[data-col="votes"]').style.display = isDirectMode ? 'none' : '';
        this.DOM.councilResultsSection.querySelector('[data-col="directMandatesAwarded"]').style.display = isDirectMode ? 'none' : '';
        this.DOM.councilResultsSection.querySelector('[data-col="listSeatsAwarded"]').style.display = isDirectMode ? 'none' : '';

        allocatedParties.forEach(party => {
            const inputData = partyInputs.find(p => p.id === party.id);
            let totalSeatsCell = `<strong>${party.seats}</strong>`;

            if (tieInfo && tieInfo.partiesInvolved.includes(party.id)) {
                totalSeatsCell = `<strong>${party.seats} + ${tieInfo.claimFraction}</strong> 🎲`;
            }

            const row = this.DOM.councilResultsTableBody.insertRow();
            row.innerHTML = `
                <td><div class="color-preview" style="background: ${party.color};"></div></td>
                <td>${party.abbreviation}</td>
                <td data-col="votes" style="display: ${isDirectMode ? 'none' : ''}">${(inputData?.votes || 0).toLocaleString('de-DE')}</td>
                <td data-col="directMandatesAwarded" style="display: ${isDirectMode ? 'none' : ''}">${party.directMandatesAwarded}</td>
                <td data-col="listSeatsAwarded" style="display: ${isDirectMode ? 'none' : ''}">${party.listSeatsAwarded}</td>
                <td>${totalSeatsCell}</td>
            `; //`
        });

        const detailsContainer = document.getElementById('council-protocol-details');
        let tieNote = document.getElementById('council-tie-note');
        if (tieNote) tieNote.remove();

        if (tieInfo) {
            const tiedPartyNames = tieInfo.partiesInvolved
                .map(id => {
                    const party = partyInputs.find(p => p.id === id);
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
            tieNote.innerHTML = `<strong>⚠️ Hinweis zum Losverfahren:</strong> Für den nächsten Sitz besteht ein gleicher Anspruch zwischen <strong>${tiedPartyNames}</strong>. Das Endergebnis hängt von einem realen Losentscheid ab.`;

            detailsContainer.parentNode.insertBefore(tieNote, detailsContainer);
        }
    }

    prepareVotingSimulation() {
        this.DOM.votingStrengthContainer.innerHTML = '';
        this.state.councilResults.filter(p => p.seats > 0).forEach(party => {
            const div = document.createElement('div');
            div.className = 'voting-item';
            div.dataset.partyId = party.id;
            div.innerHTML = `
                <label for="vote-input-${party.id}">${party.abbreviation} (max. ${party.seats} Sitze)</label>
                <input type="number" id="vote-input-${party.id}" value="${party.seats}" min="0" max="${party.seats}">
            `;
            this.DOM.votingStrengthContainer.appendChild(div);
        });
        this.updateTotalPresentVotes();
    }
    updateTotalPresentVotes() {
        const totalVotes = Array.from(this.DOM.votingStrengthContainer.querySelectorAll('input'))
            .reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
        this.DOM.totalPresentVotes.textContent = totalVotes;
    }

    addCommitteeSizeInput() {
        const div = document.createElement('div');
        div.className = 'committee-size-input';
        div.innerHTML = `<input type="number" placeholder="Weitere Größe" class="committee-size"><button class="btn-remove">X</button>`;
        div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
        this.DOM.committeeSizesContainer.appendChild(div);
    }

    prepareCommitteeStep() {
        this.state.factionAlliances = [];
        this.renderFraktionenForGemeinschaft();
    }

    createFraktionsgemeinschaft() {
        const selectedCheckboxes = this.DOM.factionAllianceListElement.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 2) {
            this._showModal("Hinweis", "<p>Bitte mindestens zwei Fraktionen/Mitglieder für eine Fraktionsgemeinschaft auswählen.</p>");
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

        this.state.factionAlliances.push({
            name,
            totalSitze,
            memberIds,
            color: gradientColor // Farbe im State speichern
        });
        this.renderFraktionenForGemeinschaft();
    }

    /*createFraktionsgemeinschaft() {
        const selectedCheckboxes = this.DOM.factionAllianceListElement.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length < 2) {
            this._showModal("Hinweis", "<p>Bitte mindestens zwei Fraktionen/Mitglieder für eine Fraktionsgemeinschaft auswählen.</p>");
            return;
        }
        const memberIds = Array.from(selectedCheckboxes).map(chk => chk.closest('.fraktion-item').dataset.fraktionId);
        const memberFraktionen = this.state.councilResults.filter(f => memberIds.includes(f.id));
        const totalSitze = memberFraktionen.reduce((sum, f) => sum + f.seats, 0);
        const name = memberFraktionen.map(f => f.abbreviation).join(' + ');
        this.state.factionAlliances.push({ name, totalSitze, memberIds });
        this.renderFraktionenForGemeinschaft();
    }*/
    dissolveFraktionsgemeinschaften() {
        this.state.factionAlliances = [];
        this.renderFraktionenForGemeinschaft();
    }

    renderFraktionenForGemeinschaft() {
        this.DOM.factionAllianceListElement.innerHTML = '';
        const allMembers = this.state.councilResults.filter(p => p.seats > 0);
        const assignedFraktionIds = new Set(this.state.factionAlliances.flatMap(zg => zg.memberIds));
        this.state.factionAlliances.forEach(zg => {
            const div = document.createElement('div');
            div.className = 'fraktionsgemeinschaft';

            // --- NEU: Hintergrund auf Gradient setzen ---
            div.style.background = zg.color;
            // --- ENDE NEU ---

            // --- NEU: Header-Div für bessere Lesbarkeit (Textschatten) ---
            const headerDiv = document.createElement('div');
            headerDiv.className = 'fraktionsgemeinschaft-header';
            headerDiv.textContent = `${zg.name} (${zg.totalSitze} Sitze)`;
            headerDiv.style.color = '#FFFFFF'; // Weißer Text
            headerDiv.style.textShadow = '1px 1px 3px rgba(0,0,0,0.7)'; // Schatten

            div.innerHTML = ''; // Leeren
            div.appendChild(headerDiv); // Neuen Header einfügen
            // --- ENDE NEU ---

            this.DOM.factionAllianceListElement.appendChild(div);
        });
        const remainingMembers = allMembers.filter(m => !assignedFraktionIds.has(m.id));
        if (remainingMembers.length > 0) {
            const h5 = document.createElement('h5');
            h5.textContent = 'Verbleibende Fraktionen / Mitglieder';
            this.DOM.factionAllianceListElement.appendChild(h5);
            remainingMembers.forEach(mitglied => {
                this.DOM.factionAllianceListElement.appendChild(this._createFraktionListItem(mitglied));
            });
        }
    }

    /*renderFraktionenForGemeinschaft() {
        this.DOM.factionAllianceListElement.innerHTML = '';
        const allMembers = this.state.councilResults.filter(p => p.seats > 0);
        const assignedFraktionIds = new Set(this.state.factionAlliances.flatMap(zg => zg.memberIds));
        this.state.factionAlliances.forEach(zg => {
            const div = document.createElement('div');
            div.className = 'fraktionsgemeinschaft';
            div.innerHTML = `<div class="fraktionsgemeinschaft-header">${zg.name} (${zg.totalSitze} Sitze)</div>`;
            this.DOM.factionAllianceListElement.appendChild(div);
        });
        const remainingMembers = allMembers.filter(m => !assignedFraktionIds.has(m.id));
        if (remainingMembers.length > 0) {
            const h5 = document.createElement('h5');
            h5.textContent = 'Verbleibende Fraktionen / Mitglieder';
            this.DOM.factionAllianceListElement.appendChild(h5);
            remainingMembers.forEach(mitglied => {
                this.DOM.factionAllianceListElement.appendChild(this._createFraktionListItem(mitglied));
            });
        }
    }//*/

    _createFraktionListItem(fraktion) {
        const li = document.createElement('li');
        li.className = 'fraktion-item';
        li.dataset.fraktionId = fraktion.id;
        li.innerHTML = `<input type="checkbox" id="chk-${fraktion.id}"><label for="chk-${fraktion.id}">${fraktion.abbreviation} (${fraktion.seats} Sitze)</label>`;
        return li;
    }

    calculateCommitteeSeats() {
        const committeeSizes = Array.from(this.DOM.committeeSizesContainer.querySelectorAll('.committee-size'))
            .map(input => parseInt(input.value))
            .filter(val => !isNaN(val) && val > 0);

        if (committeeSizes.length === 0) {
            this._showModal("Eingabefehler", "<p>Bitte geben Sie mindestens eine gültige Ausschussgröße an.</p>");
            return;
        }

        // --- Basisdaten sammeln (bleibt gleich) ---
        const manualVotes = {};
        this.DOM.votingStrengthContainer.querySelectorAll('.voting-item').forEach(item => { const partyId = item.dataset.partyId; const votes = parseInt(item.querySelector('input').value) || 0; manualVotes[partyId] = votes; });
        const assignedFraktionIds = new Set(this.state.factionAlliances.flatMap(zg => zg.memberIds));
        const unassignedMembers = this.state.councilResults.filter(m => m.seats > 0 && !assignedFraktionIds.has(m.id));
        const einzelmitglieder = unassignedMembers.filter(member => (manualVotes[member.id] || 0) < 2); // 'einzelmitglieder' hier definiert

        let calculationBasis = [];
        this.state.factionAlliances.forEach((zg, index) => {
            const totalVotesForGemeinschaft = zg.memberIds.reduce((sum, id) => sum + (manualVotes[id] || 0), 0);
            if (totalVotesForGemeinschaft > 0) {
                calculationBasis.push({
                    id: `zg-${index}`,
                    abbreviation: zg.name,
                    votes: totalVotesForGemeinschaft,
                    seatsInCouncil: zg.totalSitze,
                    color: zg.color || '#6c757d'
                });
            }
        });
        unassignedMembers.forEach(member => {
            const memberVotes = manualVotes[member.id] || 0;
            if (memberVotes >= 2) { calculationBasis.push({ id: member.id, abbreviation: member.abbreviation, votes: memberVotes, seatsInCouncil: member.seats, color: member.color }); }
        });
        // --- Ende Basisdaten ---

        // Prüfen, welcher Modus (Tab) aktiv ist
        const activeCommitteeTab = this.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        const isZugriffsModus = activeCommitteeTab ? activeCommitteeTab.dataset.mode === 'dhondt' : false;

        const totalCouncilSeatsForCommittees = calculationBasis.reduce((sum, basis) => sum + basis.votes, 0);
        let finalNoteHTML = ''; // Für die Einzelmitglieder-Warnung

        if (isZugriffsModus) {
            // --- NEUER D'HONDT-PFAD (PROTOKOLL-ANZEIGE) ---
            const allocator = new DHondtAllocator();
            this.DOM.committeeResultsSection.querySelector('h3').textContent = "Ergebnis der Zugriffs-Reihenfolge (D'Hondt)";

            // UI umschalten: Protokoll AN, Tabelle AUS
            this.DOM.committeeTableWrapper.style.display = 'none';
            this.DOM.committeeProtocolContainer.style.display = 'block';
            this.DOM.committeeProtocolContainer.innerHTML = ''; // Alten Inhalt leeren

            // Berechne für JEDE Größe und hänge das Protokoll an
            committeeSizes.forEach(size => {
                if (totalCouncilSeatsForCommittees > 0) {
                    const result = allocator.calculate(calculationBasis, size, totalCouncilSeatsForCommittees);

                    // Das 'stepsLog[0]' enthält bereits die D'Hondt-Tabelle
                    // UND das automatisch generierte Los-Protokoll am Ende.
                    this.DOM.committeeProtocolContainer.innerHTML += result.stepsLog[0];
                    this.DOM.committeeProtocolContainer.innerHTML += "<hr>";

                } else {
                    this.DOM.committeeProtocolContainer.innerHTML += `<h6>Protokoll für ${size} Sitze</h6><p>Keine Stimmen für die Berechnung vorhanden.</p><hr>`;
                }
            });

            // Die Warnung für fraktionslose Mitglieder muss hier separat hinzugefügt werden
            if (einzelmitglieder.length > 0) {
                 const memberNames = einzelmitglieder.map(m => `<strong>${m.abbreviation}</strong>`).join(', ');
                 finalNoteHTML += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gemäß § 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehören.</p>`;
            }

        } else {
            // --- ALTER HARE-NIEMEYER-PFAD (TABELLEN-ANZEIGE) ---
            const allocator = new HareNiemeyerAllocator();
            this.DOM.committeeResultsSection.querySelector('h3').textContent = "Ergebnis der Ausschuss-Sitzverteilung";

            // UI umschalten: Tabelle AN, Protokoll AUS
            this.DOM.committeeTableWrapper.style.display = 'block';
            this.DOM.committeeProtocolContainer.style.display = 'none';

            const results = {};
            committeeSizes.forEach(size => {
                if (totalCouncilSeatsForCommittees > 0) {
                    const result = allocator.calculate(calculationBasis, size, totalCouncilSeatsForCommittees);
                    results[size] = result;
                } else {
                    results[size] = { partyResults: [], tieInfo: null };
                }
            });

            // Rufe die Standard-Tabellen-Render-Funktion auf
            // Diese Funktion erstellt die 'finalNoteHTML' selbst (inkl. Los-Warnungen für Hare)
            // (Wir müssen 'einzelmitglieder' übergeben, damit 'renderCommitteeResults' es hat)
            finalNoteHTML = this.renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder);
        }

        // --- Notiz-Box (für beide Modi) aktualisieren ---
        if(finalNoteHTML) {
            this.DOM.individualMembersNote.innerHTML = finalNoteHTML;
            this.DOM.individualMembersNote.style.display = 'block';
        } else {
            this.DOM.individualMembersNote.style.display = 'none';
        }

        // In beiden Fällen: Ergebnisse anzeigen
        this.DOM.committeeResultsSection.style.display = 'block';
    }

    /*calculateCommitteeSeats() {
        const committeeSizes = Array.from(this.DOM.committeeSizesContainer.querySelectorAll('.committee-size'))
            .map(input => parseInt(input.value))
            .filter(val => !isNaN(val) && val > 0);

        if (committeeSizes.length === 0) {
            this._showModal("Eingabefehler", "<p>Bitte geben Sie mindestens eine gültige Ausschussgröße an.</p>");
            return;
        }
        const manualVotes = {};
        this.DOM.votingStrengthContainer.querySelectorAll('.voting-item').forEach(item => { const partyId = item.dataset.partyId; const votes = parseInt(item.querySelector('input').value) || 0; manualVotes[partyId] = votes; });
        const assignedFraktionIds = new Set(this.state.factionAlliances.flatMap(zg => zg.memberIds));
        const unassignedMembers = this.state.councilResults.filter(m => m.seats > 0 && !assignedFraktionIds.has(m.id));
        const remainingEinzelmitglieder = unassignedMembers.filter(member => (manualVotes[member.id] || 0) < 2);
        let calculationBasis = [];
        this.state.factionAlliances.forEach((zg, index) => {
            const totalVotesForGemeinschaft = zg.memberIds.reduce((sum, id) => sum + (manualVotes[id] || 0), 0);
            if (totalVotesForGemeinschaft > 0) {
                calculationBasis.push({
                    id: `zg-${index}`,
                    abbreviation: zg.name,
                    votes: totalVotesForGemeinschaft,
                    seatsInCouncil: zg.totalSitze,
                    color: zg.color || '#6c757d' // Gespeicherte Farbe verwenden
                });
            }
        });
        unassignedMembers.forEach(member => {
            const memberVotes = manualVotes[member.id] || 0;
            if (memberVotes >= 2) { calculationBasis.push({ id: member.id, abbreviation: member.abbreviation, votes: memberVotes, seatsInCouncil: member.seats, color: member.color }); }
        });

        const results = {};

        // NEU: Prüfen, welcher Modus (Tab) aktiv ist
        const activeCommitteeTab = this.DOM.committeeCalcModeTabs.querySelector('.tab.active');
        const isZugriffsModus = activeCommitteeTab ? activeCommitteeTab.dataset.mode === 'dhondt' : false;

        let allocator;
        if (isZugriffsModus) {
            allocator = new DHondtAllocator();
            // Ändere die Überschrift im (potenziellen) Ergebnis-Abschnitt
            this.DOM.committeeResultsSection.querySelector('h3').textContent = "Ergebnis der Zugriffs-Reihenfolge (D'Hondt)";
        } else {
            allocator = new HareNiemeyerAllocator();
            // Setze Überschrift zurück
            this.DOM.committeeResultsSection.querySelector('h3').textContent = "Ergebnis der Ausschuss-Sitzverteilung";
        }
        // ENDE NEU

        const totalCouncilSeatsForCommittees = calculationBasis.reduce((sum, basis) => sum + basis.votes, 0);

        committeeSizes.forEach(size => {
            if (totalCouncilSeatsForCommittees > 0) {
                const result = allocator.calculate(calculationBasis, size, totalCouncilSeatsForCommittees);
                results[size] = result;
            } else {
                results[size] = { partyResults: [], tieInfo: null };
            }
        });
        this.renderCommitteeResults(results, calculationBasis, committeeSizes, remainingEinzelmitglieder);
    }//*/

    renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder) {
        const table = this.DOM.committeeResultsTable;
        table.innerHTML = '';
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headerRow.innerHTML = `<th>Fraktion / Fraktionsgem.</th><th>Sitze im Rat</th><th>Stimmen bei Wahl</th>`;
        committeeSizes.forEach(size => {
            headerRow.innerHTML += `<th style="text-align: center;">Ausschuss (${size} Sitze)</th>`;
        });

        const tbody = table.createTBody();
        const tieMessages = new Set(); // Nur für Hare-Niemeyer 'tieInfo'

        calculationBasis.forEach(basis => {
            const row = tbody.insertRow();

            // --- Hintergrund-Gradient für die erste Zelle ---
            row.innerHTML = `
                <td style="background: ${basis.color}; color: #FFFFFF; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">
                    ${basis.abbreviation}
                </td>
                <td style="text-align: right;">${basis.seatsInCouncil}</td>
                <td style="text-align: right;">${basis.votes}</td>
            `;
            committeeSizes.forEach(size => {
                const resultForSize = results[size];
                const tie = resultForSize.tieInfo;
                const partyResult = resultForSize.partyResults.find(p => p.id === basis.id);
                const baseSeats = partyResult ? partyResult.proportionalSeats : 0;

                let cellContent = `${baseSeats}`;

                if (tie && tie.partiesInvolved.includes(basis.id)) {
                    cellContent = `<strong>${baseSeats} + ${tie.claimFraction}</strong> 🎲`;

                    const tiedPartyNames = tie.partiesInvolved
                        .map(id => {
                            const party = calculationBasis.find(b => b.id === id);
                            return party ? party.abbreviation : '';
                        })
                        .join(', ');

                    const message = `Für den Ausschuss mit <strong>${size} Sitzen</strong> besteht ein Losentscheid um <strong>${tie.seatsInContention}</strong> Sitz(e) zwischen: <strong>${tiedPartyNames}</strong> (Anspruch: ${tie.claimFraction}).`;
                    tieMessages.add(message);
                }

                row.innerHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.1em;">${cellContent}</td>`;
            });
        });

        // --- LOGIK GEÄNDERT: HTML-String wird gebaut und zurückgegeben ---
        let finalNoteHTML = '';
        if (einzelmitglieder.length > 0) {
            const memberNames = einzelmitglieder.map(m => `<strong>${m.abbreviation}</strong>`).join(', ');
            finalNoteHTML += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gemäß § 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehören.</p>`;
        }

        if (tieMessages.size > 0) {
            finalNoteHTML += `<hr><p><strong>⚠️ Hinweis(e) zum Losverfahren (Hare-Niemeyer):</strong></p><ul>`;
            tieMessages.forEach(msg => {
                finalNoteHTML += `<li>${msg}</li>`;
            });
            finalNoteHTML += '</ul>';
        }

        // GEÄNDERT: Gib den HTML-String für die Notizen zurück
        return finalNoteHTML;
    }

    /*renderCommitteeResults(results, calculationBasis, committeeSizes, einzelmitglieder) {
        const table = this.DOM.committeeResultsTable;
        table.innerHTML = '';
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headerRow.innerHTML = `<th>Fraktion / Fraktionsgem.</th><th>Sitze im Rat</th><th>Stimmen bei Wahl</th>`;
        committeeSizes.forEach(size => {
            headerRow.innerHTML += `<th style="text-align: center;">Ausschuss (${size} Sitze)</th>`;
        });

        const tbody = table.createTBody();
        const tieMessages = new Set();

        calculationBasis.forEach(basis => {
            const row = tbody.insertRow();

            // --- NEU: Hintergrund-Gradient für die erste Zelle ---
            row.innerHTML = `
                <td style="background: ${basis.color}; color: #FFFFFF; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">
                    ${basis.abbreviation}
                </td>
                <td style="text-align: right;">${basis.seatsInCouncil}</td>
                <td style="text-align: right;">${basis.votes}</td>
            `;
            committeeSizes.forEach(size => {
                const resultForSize = results[size];
                const tie = resultForSize.tieInfo;
                const partyResult = resultForSize.partyResults.find(p => p.id === basis.id);
                const baseSeats = partyResult ? partyResult.proportionalSeats : 0;

                let cellContent = `${baseSeats}`;

                if (tie && tie.partiesInvolved.includes(basis.id)) {
                    cellContent = `<strong>${baseSeats} + ${tie.claimFraction}</strong> 🎲`;

                    const tiedPartyNames = tie.partiesInvolved
                        .map(id => {
                            const party = calculationBasis.find(b => b.id === id);
                            return party ? party.abbreviation : '';
                        })
                        .join(', ');

                    const message = `Für den Ausschuss mit <strong>${size} Sitzen</strong> besteht ein Losentscheid um <strong>${tie.seatsInContention}</strong> Sitz(e) zwischen: <strong>${tiedPartyNames}</strong> (Anspruch: ${tie.claimFraction}).`;
                    tieMessages.add(message);
                }

                row.innerHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.1em;">${cellContent}</td>`;
            });
        });

        let finalNoteHTML = '';
        if (einzelmitglieder.length > 0) {
            const memberNames = einzelmitglieder.map(m => `<strong>${m.abbreviation}</strong>`).join(', ');
            finalNoteHTML += `<p><strong>Hinweis zu fraktionslosen Mitgliedern:</strong></p><p>Die Ratsmitglieder von ${memberNames} nehmen nicht an der Verteilung der stimmberechtigter Ausschusssitze teil. Gemäß § 58 Abs. 1 GO NRW hat jedes dieser Mitglieder das Recht, mindestens einem Ausschuss als <strong>beratendes Mitglied</strong> (ohne Stimmrecht) anzugehören.</p>`;
        }

        if (tieMessages.size > 0) {
            finalNoteHTML += `<hr><p><strong>⚠️ Hinweis(e) zum Losverfahren:</strong></p><ul>`;
            tieMessages.forEach(msg => {
                finalNoteHTML += `<li>${msg}</li>`;
            });
            finalNoteHTML += '</ul>';
        }

        // --- NEUER BLOCK FÜR LOTTERYINFOS (D'Hondt) ---
        const allLotteryInfos = Object.values(results).flatMap(res => res.lotteryInfos || []);
        if (allLotteryInfos.length > 0) {
            finalNoteHTML += `<hr><p><strong>⚠️ Hinweis(e) zu automatisch aufgelösten Losentscheiden (D'Hondt):</strong></p><ul>`;

            const uniqueLotteryMessages = new Set();
            allLotteryInfos.forEach(info => {
                const partyNames = info.partiesInvolved
                    .map(id => calculationBasis.find(b => b.id === id)?.abbreviation || '')
                    .join(', ');

                const msg = `Ab **Sitz Nr. ${info.firstSeatNumber}** wurde ein Losentscheid (Gleichstand) zwischen **${partyNames}** automatisch per Sortierung (tempSortKey) aufgelöst. Bitte manuell prüfen!`;
                uniqueLotteryMessages.add(msg);
            });

            uniqueLotteryMessages.forEach(msg => {
                finalNoteHTML += `<li>${msg}</li>`;
            });
            finalNoteHTML += '</ul>';
        }

        if(finalNoteHTML) {
            this.DOM.individualMembersNote.innerHTML = finalNoteHTML;
            this.DOM.individualMembersNote.style.display = 'block';
        } else {
            this.DOM.individualMembersNote.style.display = 'none';
        }

        this.DOM.committeeResultsSection.style.display = 'block';
    }//*/

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

    // ÜBERARBEITET: Import-Funktion für VoteManager (nutzt jetzt Modal)
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
                let gebietNameIndex = 4; // Standard-Index für 'gebiet-name'

                // --- 1. Finde alle Parteien-Spalten (D1, D2...) ---
                headerTech.forEach((col, index) => {
                    const colTrimmed = col.trim();
                    const colNumPart = colTrimmed.substring(1);

                    // KORRIGIERTE PRÜFUNG: Muss 'D' + Zahl sein (ignoriert 'D' selbst)
                    if (colTrimmed.startsWith('D') && colNumPart.length > 0 && !isNaN(colNumPart)) {
                        partyColumns.push({
                            index: index,
                            id: colTrimmed, // z.B. 'D1'
                            votes: 0,
                            directMandates: 0
                        });
                    }

                    // Finde die Spalte 'gebiet-name' für die Tie-Breaker-Meldung
                    if (colTrimmed.toLowerCase() === 'gebiet-name') {
                        gebietNameIndex = index;
                    }
                });

                if (partyColumns.length === 0) {
                    throw new Error("Keine gültigen Parteien-Spalten (D1, D2, ...) in der Header-Zeile gefunden.");
                }

                // --- 2. Iteriere durch Wahlbezirke (Datenzeilen) ---
                dataLines.forEach(line => {
                    const values = line.split(';');
                    if (values.length < headerTech.length) return; // Unvollständige Zeilen überspringen

                    let maxVotes = -1;
                    let districtWinners = []; // Kann mehrere Einträge bei Gleichstand haben

                    const districtName = values[gebietNameIndex] ? values[gebietNameIndex].trim() : 'Unbekannter Bezirk';

                    partyColumns.forEach(party => {
                        const voteValueStr = values[party.index];
                        if (!voteValueStr) return; // Zelle ist leer

                        const voteValue = parseInt(voteValueStr, 10);
                        if (isNaN(voteValue) || voteValue < 0) return; // Kein gültiger Wert

                        // A) Gesamtstimmen summieren
                        party.votes += voteValue;

                        // B) Direktmandat für diesen Bezirk ermitteln
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
                this.clearAllParties(true); // Bestehende Parteien löschen

                const anzahlWahlbezirke = dataLines.length;
                if (anzahlWahlbezirke > 0) {
                    this.DOM.councilSize.value = anzahlWahlbezirke * 2;
                }

                // Füge nur Parteien hinzu, die auch Stimmen bekommen haben
                partyColumns.filter(p => p.votes > 0).forEach(party => {
                    this.addParty(
                        `Partei ${party.id}`, // Platzhaltername!
                        party.votes,
                        party.directMandates,
                        '' // Farbe automatisch zuweisen lassen
                    );
                });

                // --- 4. User über Ergebnis UND Losentscheide im MODAL informieren ---
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

                    modalHTML += `<ul>`; // Innere Liste für die Bezirke
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
                this._showModal("Import-Fehler", `<p style="color:var(--danger-color);">Ein Fehler ist aufgetreten:</p><p><strong>${err.message}</strong></p><p>Bitte prüfen Sie die Datei und das Format.</p>`);
            } finally {
                // File-Input zurücksetzen
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


    // --- NEUE METHODEN FÜR LOCALSTORAGE ---

    /**
     * Speichert den gesamten UI-Zustand im localStorage.
     * Wird aufgerufen, wenn die Seite verlassen wird.
     */

    _saveStateToStorage() {
        // Nicht speichern, wenn ein Reset ausgelöst wurde
        if (this.isResetting) {
              return;
        }

        // Helfer-Funktion, um die Anwesenheitsstimmen auszulesen
        const getPresentVotes = () => {
            return Array.from(this.DOM.votingStrengthContainer.querySelectorAll('.voting-item')).map(item => ({
                partyId: item.dataset.partyId,
                present: item.querySelector('input').value
            }));
        };

        // Das State-Objekt, das alles enthält, was wir speichern wollen
        const state = {
            // KORREKTUR 1: Den Query auf den Haupt-Tab-Container beschränkt
            appMode: this.DOM.appModeSelection.querySelector('.tab.active').dataset.mode,
            nrwState: {
                // KORREKTUR 2: Die Hilfsfunktion verwenden
                inputMode: this._getNrwInputMode(),
                councilSize: this.DOM.councilSize.value,
                parties: this._getPartiesFromUI(), // Diese Methode gibt bereits saubere Daten zurück
                presentVotes: getPresentVotes() // Speichert die Anwesenheit
            },
            simpleState: {
                procedure: this.appState.getSimpleProcedure(),
                seatSizes: this.appState.getSimpleSeatSizes().filter(val => val.trim() !== ''),
                proposals: this._getProposalsFromUI() // Gibt saubere Daten zurück
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

    /*_saveStateToStorage() {
        // Nicht speichern, wenn ein Reset ausgelöst wurde
        if (this.isResetting) {
              return;
        }

        // Helfer-Funktion, um die Anwesenheitsstimmen auszulesen
        const getPresentVotes = () => {
            return Array.from(this.DOM.votingStrengthContainer.querySelectorAll('.voting-item')).map(item => ({
                partyId: item.dataset.partyId,
                present: item.querySelector('input').value
            }));
        };

        // Helfer-Funktion, um die "einfachen" Sitzgrößen auszulesen
        const getSimpleSizes = () => {
             return Array.from(this.DOM.simpleSizesContainer.querySelectorAll('.simple-size'))
                .map(input => input.value)
                .filter(val => val.trim() !== '');
        };

        // Das State-Objekt, das alles enthält, was wir speichern wollen
        const state = {
            appMode: document.querySelector('.tab.active').dataset.mode,
            nrwState: {
                inputMode: document.querySelector('input[name="input-mode"]:checked').value,
                councilSize: this.DOM.councilSize.value,
                parties: this._getPartiesFromUI(), // Diese Methode gibt bereits saubere Daten zurück
                presentVotes: getPresentVotes() // Speichert die Anwesenheit
            },
            simpleState: {
                procedure: this.DOM.simpleProcedure.value,
                seatSizes: getSimpleSizes(),
                proposals: this._getProposalsFromUI() // Gibt saubere Daten zurück
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
    }//*/

    /**
     * NEU: Lädt den Zustand aus dem localStorage und stellt die UI wieder her.
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
            localStorage.removeItem(this.storageKey); // Beschädigten Status entfernen
            return;
        }

        if (!state) return;

        // --- 1. NRW-Status wiederherstellen ---
        if (state.nrwState) {
            this.clearAllParties(true); // UI und State leeren
            if (state.nrwState.parties && Array.isArray(state.nrwState.parties)) {
                // Gespeicherte Parteien mit ihren IDs (!) wieder hinzufügen
                state.nrwState.parties.forEach(p => {
                    this.addParty(p.abbreviation, p.votes, p.directMandates, p.color, p.seats, p.id);
                });
            }
            this.DOM.councilSize.value = state.nrwState.councilSize || '66';

            // Radio-Button für den Eingabemodus setzen
            /*const nrwMode = state.nrwState.inputMode || 'election';
            const radioEl = document.getElementById(`mode-${nrwMode}`);
            if (radioEl) {
                radioEl.checked = true;
            }
            this.toggleInputMode(nrwMode); // UI für den Modus anpassen
            //*/

            // Tab für den Eingabemodus setzen
            const nrwMode = state.nrwState.inputMode || 'election';
            const tabEl = this.DOM.nrwInputModeTabs.querySelector(`.tab[data-mode="${nrwMode}"]`);

            // Sicherstellen, dass die Standard-UI (election) aktiv ist, bevor wir umschalten
            this.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="election"]').classList.add('active');
            this.DOM.nrwInputModeTabs.querySelector('.tab[data-mode="direct"]').classList.remove('active');

            if (tabEl) {
                // Unsere neue Funktion kümmert sich um das Highlighting UND das Umschalten der UI
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
                // Gespeicherte Vorschläge mit ihren IDs (!) wieder hinzufügen
                state.simpleState.proposals.forEach(p => {
                    this.addProposal(p.abbreviation, p.votes, p.color, p.id);
                });
            }
            this.appState.setSimpleProcedure(state.simpleState.procedure || 'hare');
            this.appState.setSimpleSeatSizes(state.simpleState.seatSizes);
            this.renderSimpleSizeInputs();
        }

        // --- 3. App-Modus (Tab) wiederherstellen ---
        const appMode = state.appMode || 'simple';
        this.switchAppMode(appMode);

        // --- 4. Anwesenheit (presentVotes) wiederherstellen ---
        // Dies tun wir nur, wenn im NRW-Modus Parteien geladen wurden UND Anwesenheitsdaten gespeichert waren.
        if (state.nrwState && state.nrwState.parties && state.nrwState.parties.length > 0 &&
            state.nrwState.presentVotes && state.nrwState.presentVotes.length > 0) {

            // Schritt 1: Ratssitze (neu) berechnen. Das ist nötig, um die UI für "Anwesenheit" überhaupt erst aufzubauen.
            this.calculateCouncilSeats();

            // Schritt 2: Jetzt, wo die UI existiert, die gespeicherten Werte eintragen
            state.nrwState.presentVotes.forEach(pv => {
                // Finde das Input-Feld anhand der gespeicherten partyId
                const input = this.DOM.votingStrengthContainer.querySelector(`.voting-item[data-party-id="${pv.partyId}"] input`);
                if (input) {
                    input.value = pv.present;
                }
            });

            // Schritt 3: Die Summe der Anwesenden aktualisieren
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
    // NEU: METHODEN FÜR CUSTOM COLOR MAPPING
    // ==========================================================

    /**
     * Zeigt das Modal zur Verwaltung der eigenen Farb-Mappings an.
     */
    showColorMappingModal() {
        // Container für den Modal-Inhalt erstellen
        const container = document.createElement('div');
        container.id = 'custom-mappings-container';
        container.innerHTML = `
            <p>Hier können Sie eigene Parteinamen (z.B. lokale Wählergruppen) und Farben definieren. Diese werden automatisch erkannt, wenn Sie den Namen in der Liste eintragen.</p>
            <p>Die Mappings werden in Ihrem Browser gespeichert.</p>
            <div id="custom-mappings-list">
                <!-- Liste wird dynamisch befüllt -->
            </div>
            <button id="modal-add-mapping" class="btn-add" style="margin-top: 10px;">+ Neues Mapping hinzufügen</button>
            <div style="text-align: right; margin-top: 20px;">
                <button id="modal-btn-close" class="btn-secondary">Schließen</button>
            </div>
        `;

        // Modal anzeigen (verwenden das existierende System)
        this._showModal('Eigene Farben verwalten', container.innerHTML);

        // WICHTIG: Die Event-Listener erst *nach* dem Anzeigen des Modals hinzufügen,
        // da _showModal den innerHTML neu setzt.
        document.getElementById('modal-add-mapping').addEventListener('click', () => {
            this.addCustomMapping();
            this.renderCustomMappingList(); // Liste im Modal neu zeichnen
        });

        document.getElementById('modal-btn-close').addEventListener('click', () => {
            this._hideModal();
        });

        // Wir müssen den 'X'-Button (csv-modal-close) neu binden,
        // da _showModal keinen Promise-basierten Schließ-Mechanismus hat.
        // Wir entfernen den alten Listener und fügen einen neuen hinzu, der nur schließt.
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
            listContainer.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--text-muted);">Keine eigenen Mappings. Klicken Sie auf "Hinzufügen".</p>';
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

            // Event-Listener für dieses Item
            const colorPreview = mappingDiv.querySelector('.color-preview');
            const colorInput = mappingDiv.querySelector('.color-picker-hidden');
            const nameInput = mappingDiv.querySelector('.mapping-name');
            const colorText = mappingDiv.querySelector('.mapping-color-text');
            const removeBtn = mappingDiv.querySelector('.btn-remove');

            // Farbe ändern (Picker)
            colorInput.addEventListener('change', () => {
                const newColor = colorInput.value;
                colorPreview.style.background = newColor;
                colorText.value = newColor;
                this.updateCustomMapping(index, { color: newColor });
            });
            // Farbe ändern (Textfeld)
            colorText.addEventListener('input', () => {
                const newColor = colorText.value;
                // Einfache Validierung
                if (/^#[0-9a-fA-F]{6}$/.test(newColor) || /^[a-zA-Z]+$/.test(newColor)) {
                    colorPreview.style.background = newColor;
                    colorInput.value = newColor;
                    this.updateCustomMapping(index, { color: newColor });
                }
            });
            // Name ändern
            nameInput.addEventListener('change', () => { // 'change' (beim Verlassen) statt 'input'
                this.updateCustomMapping(index, { name: nameInput.value });
            });
            // Löschen
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
     * Fügt ein leeres Mapping zum State hinzu.
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
            // Sofortiges Speichern im LocalStorage bei Änderung
            this._saveStateToStorage();
        }
    }

    /**
     * Entfernt ein Mapping aus dem State.
     */
    removeCustomMapping(index) {
        this.state.customColorMappings.splice(index, 1);
        // Sofortiges Speichern im LocalStorage bei Änderung
        this._saveStateToStorage();
    }

    /**
     * NEU: Zeigt ein Modal und setzt die Anwendung zurück (löscht localStorage).
     */
    async resetApplication() {
        // 1. Zeige das Bestätigungs-Modal (wie gewünscht)
        const confirmed = await this._showConfirmationModal(
            'Anwendung zurücksetzen',
            'Möchten Sie wirklich die gesamte Anwendung zurücksetzen? Alle gespeicherten Parteien, Vorschläge und Einstellungen werden gelöscht. Die Seite wird neu geladen und die Standard-Beispiele werden angezeigt.',
            'Ja, jetzt zurücksetzen',
            'btn-danger'
        );

        // 2. Wenn der Benutzer bestätigt hat
        if (confirmed) {
            try {
                // Flag setzen, um 'beforeunload' zu blockieren
                this.isResetting = true;

                // 3. Den Schlüssel aus dem LocalStorage entfernen
                localStorage.removeItem(this.storageKey);

                // 4. Seite neu laden.
                // (Dadurch wird der Konstruktor neu ausgeführt,
                // findet keinen 'savedState' und lädt 'addInitialParties()')
                location.reload();

            } catch (e) {
                console.error("Fehler beim Zurücksetzen der Anwendung:", e);
                this._showModal("Fehler", "Das Zurücksetzen ist fehlgeschlagen.");
            }
        }
    }

    //
}
  document.addEventListener('DOMContentLoaded', () => {

    // --- NEU: Theme Switcher Logic (ANGEPASST FÜR DROPDOWN) ---
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

    // 2. Event Listener für das Dropdown
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    // 3. Beim Laden der Seite das gespeicherte Theme anwenden
    function loadTheme() {
        const savedTheme = localStorage.getItem(storageKey) || 'auto';
        applyTheme(savedTheme);

        // Den korrekten Wert im Dropdown auswählen
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    loadTheme();
    // --- Ende Theme Switcher Logic ---

    // KORREKTUR: Globale "app"  Variable für Koalitions-Checker (falls benötigt)
    // Wir deklarieren 'app' noch nicht im globalen Scope, damit die 'app.currentResultsData'
    // Prüfungen im CoalitionAnalyzer (falls er später verwendet wird) funktionieren.
    //window

    window.app = new AppController();
});




