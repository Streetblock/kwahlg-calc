// NEU: Zentrale Datenbank für Voreinstellungen
// (z.B. in Zeile 1081, direkt vor 'class AppController')

const PRESET_DATABASE = {
    // ID des Presets, das standardmäßig geladen wird,
    // wenn kein Speicherstand im LocalStorage existiert.
    defaultPresetId: 'rkn_2025_beispiel',

    presets: [
        {
            id: 'korschenbroich_2025_bsp',
            name: 'Stadtrat Korschenbroich (2025)',
            councilSize: 38, // 19 Wahlbezirke * 2
            parties: [
                { name: 'CDU', votes: 8643, directMandates: 19, color: '#000000' },
                { name: 'GRÜNE', votes: 3153, directMandates: 0, color: '#64A12D' },
                { name: 'SPD', votes: 3021, directMandates: 0, color: '#EB001F' },
                { name: 'FWG Korschenbroich', votes: 1523, directMandates: 0, color: '#366351' },
                { name: 'FDP', votes: 1079, directMandates: 0, color: '#ffe209' },
                { name: 'DIE LINKE', votes: 600, directMandates: 0, color: '#BE3075' }
            ]
        },
        {
            id: 'rkn_2025_beispiel',
            name: 'Kreistag RKN (2025)',
            councilSize: 66, // 33 Wahlbezirke * 2
            parties: [
                { name: 'CDU', votes: 79057, directMandates: 30, color: '#000000' },
                { name: 'SPD', votes: 44847, directMandates: 3, color: '#EB001F' },
                { name: 'GRÜNE', votes: 24417, directMandates: 0, color: '#64A12D' },
                { name: 'AfD', votes: 25946, directMandates: 0, color: '#009EE0' },
                { name: 'FDP', votes: 10109, directMandates: 0, color: '#ffe209' },
                { name: 'DIE LINKE', votes: 7786, directMandates: 0, color: '#BE3075' },
                { name: 'Die PARTEI', votes: 3158, directMandates: 0, color: '#888888' },
                { name: 'UWG / Freie Wähler', votes: 3095, directMandates: 0, color: '#F9A825' },
                { name: 'BSW', votes: 1641, directMandates: 0, color: '#BA1264' },
                { name: 'ZENTRUM', votes: 1613, directMandates: 0, color: '#004D8F' },
                { name: 'Volt', votes: 1246, directMandates: 0, color: '#502379' },
                { name: 'FWG BUZ', votes: 851, directMandates: 0, color: '' },
                { name: 'dieBasis', votes: 51, directMandates: 0, color: '' }
            ]
        },
        {
            id: 'mg_2025_beispiel',
            name: 'Mönchengladbach (Rat 2025)',
            councilSize: 66, // 33 Wahlbezirke * 2
            // Die Daten aus der alten 'addInitialParties'-Funktion
            parties: [
                { name: 'CDU', votes: 31834, directMandates: 23, color: '#000000' },
                { name: 'SPD', votes: 27229, directMandates: 10, color: '#EB001F' },
                { name: 'AfD', votes: 15079, directMandates: 0, color: '#009EE0' },
                { name: 'GRÜNE', votes: 8242, directMandates: 0, color: '#64A12D' },
                { name: 'Die Linke', votes: 5382, directMandates: 0, color: '#BE3075' },
                { name: 'FDP', votes: 2666, directMandates: 0, color: '#ffe209' },
                { name: 'BSW', votes: 2031, directMandates: 0, color: '#BA1264' },
                { name: 'Die PARTEI', votes: 1865, directMandates: 0, color: '#888888' },
                { name: 'Volt', votes: 1267, directMandates: 0, color: '#502379' },
                { name: 'FREIE WÄHLER', votes: 175, directMandates: 0, color: '#F9A825' },
                { name: 'dieBasis', votes: 102, directMandates: 0, color: '' }, // Farbe wird automatisch zugewiesen
                { name: 'WerteUnion', votes: 81, directMandates: 0, color: '' }
            ]
        },
        {
            id: 'leeres_szenario',
            name: 'Leeres Szenario (40 Sitze)',
            councilSize: 40,
            parties: [] // Startet mit einer leeren Liste
        },
        // Hier könnten weitere Presets (z.B. 'köln_2020', 'düsseldorf_2020') hinzugefügt werden.

    ]
};


// --- Haupt-Controller der Anwendung ---

