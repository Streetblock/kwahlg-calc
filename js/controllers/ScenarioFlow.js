class ScenarioFlow {
    constructor(app) {
        this.app = app;
    }

    loadPreset(presetId) {
        console.log(`Lade Preset: ${presetId}`);
        let preset = PRESET_DATABASE.presets.find((entry) => entry.id === presetId);

        if (!preset) {
            console.warn(`Preset-ID "${presetId}" nicht gefunden. Lade Standard-Preset.`);
            const defaultId = PRESET_DATABASE.defaultPresetId;
            preset = PRESET_DATABASE.presets.find((entry) => entry.id === defaultId);
            if (!preset) {
                console.error('KRITISCHER FEHLER: Kein Default-Preset gefunden!');
                return;
            }
        }

        this.app.clearAllParties(true);
        this.app.DOM.councilSize.value = preset.councilSize;

        if (preset.parties && Array.isArray(preset.parties)) {
            preset.parties.forEach((party) => {
                this.app.addParty(
                    party.name,
                    party.votes,
                    party.directMandates,
                    party.color || ''
                );
            });
        }

        this.app.state.currentPresetId = preset.id;
        if (this.app.DOM.presetSelect) {
            this.app.DOM.presetSelect.value = preset.id;
        }
    }

    populatePresetDropdown() {
        if (!this.app.DOM.presetSelect) return;

        this.app.DOM.presetSelect.innerHTML = '';

        const savedOption = document.createElement('option');
        savedOption.value = 'user_saved_state';
        savedOption.textContent = 'Mein gespeicherter Stand';
        this.app.DOM.presetSelect.appendChild(savedOption);

        const separator = document.createElement('option');
        separator.textContent = '--- Voreinstellungen laden ---';
        separator.disabled = true;
        this.app.DOM.presetSelect.appendChild(separator);

        PRESET_DATABASE.presets.forEach((preset) => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            this.app.DOM.presetSelect.appendChild(option);
        });
    }

    exportScenario() {
        const partiesData = this.app._getPartiesFromUI();
        const scenario = partiesData.map((party) => ({
            name: party.abbreviation,
            votes: party.votes,
            directMandates: party.directMandates,
            color: party.color
        }));
        const dataStr = JSON.stringify(scenario, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'rat-szenario.json');
        linkElement.click();
    }

    importScenario(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            try {
                const scenario = JSON.parse(readerEvent.target.result);
                if (!Array.isArray(scenario)) {
                    throw new Error('JSON must be an array.');
                }

                this.app.clearAllParties(true);
                scenario.forEach((party) => {
                    this.app.addParty(party.name, party.votes, party.directMandates, party.color, party.seats || 0);
                });
            } catch (error) {
                this.app._showModal('Import-Fehler', `<p>Fehler beim Laden der Szenario-Datei:</p><p><strong>${error.message}</strong></p>`);
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }

    importVoteManagerCSV(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            try {
                const content = readerEvent.target.result;
                const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');

                if (lines.length < 2) {
                    throw new Error('CSV-Datei ist zu kurz. Erwarte mind. 1 Header-Zeile und 1 Daten-Zeile.');
                }

                const headerTech = lines[0].split(';');
                const dataLines = lines.slice(1);
                const partyColumns = [];
                const districtTies = [];
                let gebietNameIndex = 4;

                headerTech.forEach((column, index) => {
                    const colTrimmed = column.trim();
                    const colNumPart = colTrimmed.substring(1);

                    if (colTrimmed.startsWith('D') && colNumPart.length > 0 && !isNaN(colNumPart)) {
                        partyColumns.push({
                            index,
                            id: colTrimmed,
                            votes: 0,
                            directMandates: 0
                        });
                    }

                    if (colTrimmed.toLowerCase() === 'gebiet-name') {
                        gebietNameIndex = index;
                    }
                });

                if (partyColumns.length === 0) {
                    throw new Error('Keine g\u00fcltigen Parteien-Spalten (D1, D2, ...) in der Header-Zeile gefunden.');
                }

                dataLines.forEach((line) => {
                    const values = line.split(';');
                    if (values.length < headerTech.length) return;

                    let maxVotes = -1;
                    let districtWinners = [];
                    const districtName = values[gebietNameIndex] ? values[gebietNameIndex].trim() : 'Unbekannter Bezirk';

                    partyColumns.forEach((party) => {
                        const voteValueStr = values[party.index];
                        if (!voteValueStr) return;

                        const voteValue = parseInt(voteValueStr, 10);
                        if (isNaN(voteValue) || voteValue < 0) return;

                        party.votes += voteValue;

                        if (voteValue > maxVotes) {
                            maxVotes = voteValue;
                            districtWinners = [party.id];
                        } else if (voteValue === maxVotes && maxVotes > 0) {
                            districtWinners.push(party.id);
                        }
                    });

                    if (districtWinners.length === 1 && maxVotes > 0) {
                        const winnerParty = partyColumns.find((party) => party.id === districtWinners[0]);
                        if (winnerParty) {
                            winnerParty.directMandates++;
                        }
                    } else if (districtWinners.length > 1) {
                        districtTies.push({
                            districtName,
                            tiedParties: districtWinners,
                            votes: maxVotes
                        });
                    }
                });

                this.app.clearAllParties(true);

                const districtCount = dataLines.length;
                if (districtCount > 0) {
                    this.app.DOM.councilSize.value = districtCount * 2;
                }

                partyColumns.filter((party) => party.votes > 0).forEach((party) => {
                    this.app.addParty(
                        `Partei ${party.id}`,
                        party.votes,
                        party.directMandates,
                        ''
                    );
                });

                this.app._showModal('Import-Ergebnis', this.buildVoteManagerImportSummary(partyColumns, districtTies));
            } catch (error) {
                this.app._showModal(
                    'Import-Fehler',
                    `<p style="color:var(--danger-color);">Ein Fehler ist aufgetreten:</p><p><strong>${error.message}</strong></p><p>Bitte pr\u00fcfen Sie die Datei und das Format.</p>`
                );
            } finally {
                event.target.value = null;
            }
        };

        reader.onerror = () => {
            this.app._showModal('Lese-Fehler', '<p style="color:var(--danger-color);">Die Datei konnte nicht gelesen werden.</p>');
            event.target.value = null;
        };

        reader.readAsText(file, 'UTF-8');
    }

    buildVoteManagerImportSummary(partyColumns, districtTies) {
        const partiesWithVotes = partyColumns.filter((party) => party.votes > 0);
        const totalMandatesFound = partyColumns.reduce((sum, party) => sum + party.directMandates, 0);

        let modalHtml = '<p>Der CSV-Import war erfolgreich.</p><ul>';
        modalHtml += `<li><strong>Parteien gefunden:</strong> ${partiesWithVotes.length}</li>`;
        modalHtml += `<li><strong>Eindeutige Mandate:</strong> ${totalMandatesFound}</li>`;
        modalHtml += '</ul>';
        modalHtml += '<h4>Wichtige Hinweise</h4>';
        modalHtml += '<p><strong>1. Platzhalter-Namen:</strong> Die Parteinamen (z.B. \'Partei D1\') sind Platzhalter. Bitte benennen Sie diese in der Liste manuell um (z.B. in \'CDU\').</p>';

        if (districtTies.length > 0) {
            modalHtml += '<div class="tie-warning">';
            modalHtml += `<p><strong>2. WARNUNG: ${districtTies.length} LOSENTSCHEIDE SIND OFFEN!</strong></p>`;
            modalHtml += '<p>In folgenden Wahlbezirken gab es einen Gleichstand. Diese Mandate wurden <strong>NOCH NICHT</strong> zugeteilt. Bitte addieren Sie die Gewinner-Mandate nach dem (realen) Losentscheid manuell in der UI:</p>';
            modalHtml += '<ul>';
            districtTies.forEach((tie) => {
                modalHtml += `<li><strong>Bezirk '${tie.districtName}'</strong>: Gleichstand (${tie.votes} Stimmen) zwischen <strong>${tie.tiedParties.join(', ')}</strong></li>`;
            });
            modalHtml += '</ul></div>';
        } else {
            modalHtml += `<p><strong>2. Losentscheide:</strong> Es wurden keine unentschiedenen Direktmandate (Losentscheide) gefunden. Alle ${totalMandatesFound} Mandate wurden zugeteilt.</p>`;
        }

        return modalHtml;
    }
}
