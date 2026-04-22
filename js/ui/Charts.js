class VoteBarChartRenderer {
    constructor(chartContainerId) {
        this.chartContainer = document.getElementById(chartContainerId);
    }

    render(parties, totalVotes) {
        if (!this.chartContainer) {
            console.error("VoteBarChartRenderer: Chart Container nicht gefunden.");
            return;
        }
        this.chartContainer.innerHTML = ''; // Vorherigen Chart leeren

        // Nur Parteien berücksichtigen, die für die Anzeige relevant sind
        // (z.B. nicht eliminiert oder haben Stimmen/Sitze)
        const partiesToDisplay = (Array.isArray(parties) ? parties : [])
            .filter(p => p && ((p.votes || 0) > 0 || (p.seats || 0) > 0) && !p.isEliminated);


        if (partiesToDisplay.length === 0) {
            // Optional: Nachricht anzeigen, wenn keine Daten vorhanden sind
            // this.chartContainer.textContent = "Keine Daten für Stimmenanteile vorhanden.";
            return;
        }

        // Ermittle den höchsten Prozentwert für die Skalierung der Balken
        let maxVotePercentage = 0;
        if (totalVotes > 0) {
            maxVotePercentage = Math.max(...partiesToDisplay.map(p => ((p.votes || 0) / totalVotes) * 100), 0);
        }
        // Fallback, falls maxVotePercentage 0 ist, aber es Stimmen gibt (verhindert Division durch 0)
        if (maxVotePercentage === 0 && partiesToDisplay.some(p => (p.votes || 0) > 0)) {
            maxVotePercentage = 1; // Setze auf einen kleinen Wert, damit Balken zumindest minimal sichtbar sind
        }
        if (maxVotePercentage === 0) return; // Wenn immer noch 0, gibt es nichts zu zeichnen


        const targetMaxBarHeightPercentOfContainer = 70; // Maximale Balkenhöhe in % des Containers

        partiesToDisplay.forEach(party => {
            const currentPartyVotePercentage = totalVotes > 0 ? ((party.votes || 0) / totalVotes) * 100 : 0;
            let barDisplayHeightPercent = maxVotePercentage > 0 ? (currentPartyVotePercentage / maxVotePercentage) * targetMaxBarHeightPercentOfContainer : 0;

            // Mindesthöhe für sichtbare Balken, wenn Stimmen vorhanden sind
            if (barDisplayHeightPercent < 1 && currentPartyVotePercentage > 0) barDisplayHeightPercent = 1;
            // Explizit 0 Höhe, wenn keine Stimmen
            if (party.votes === 0 && currentPartyVotePercentage === 0) barDisplayHeightPercent = 0;


            const bar = document.createElement('div');
            bar.classList.add('bar-chart-bar');
            bar.dataset.partyId = party.id; // Annahme: Partei-Objekte haben eine eindeutige ID
            bar.style.height = `${barDisplayHeightPercent}%`;
            bar.style.background = party.color || '#cccccc'; // Fallback-Farbe
            bar.title = `${party.abbreviation}: ${currentPartyVotePercentage.toFixed(2)}% (${(party.votes || 0).toLocaleString('de-DE')} Stimmen)`;
            bar.setAttribute('tabindex', '0');
            bar.setAttribute('role', 'button');
            bar.setAttribute('aria-label', `${party.abbreviation}: ${currentPartyVotePercentage.toFixed(2)}% der Stimmen`);

            const label = document.createElement('div');
            label.classList.add('label');
            // KORREKTUR: .substring(0, 10) entfernt, um den vollen Text anzuzeigen
            label.textContent = party.abbreviation;
            bar.appendChild(label);

            // Prozentsatz im Balken nur anzeigen, wenn der Balken hoch genug ist und Stimmen vorhanden sind
            if (currentPartyVotePercentage >= 0.1 && barDisplayHeightPercent > 10) {
                const percText = document.createElement('div');
                percText.classList.add('percentage');
                percText.textContent = `${currentPartyVotePercentage.toFixed(1)}%`;
                bar.appendChild(percText);
            }
            this.chartContainer.appendChild(bar);
        });
    }
}

class HemicycleRenderer {
    constructor(svgId, legendId) {
        this.svg = document.getElementById(svgId);
        this.legendContainer = document.getElementById(legendId);
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    // Innerhalb der Klasse HemicycleRenderer:

    render(parties, totalSeatsInParliament, additionalSeatsInfo = null, customSortOrder = null, sonstigeColor = '#cccccc') {
        if (!this.svg || !this.legendContainer) {
            console.error("HemicycleRenderer: SVG oder Legend Container nicht gefunden.");
            return;
        }
        this.svg.innerHTML = '';
        this.legendContainer.innerHTML = '';

        // NEU: <defs> Sektion für SVG-Patterns erstellen
        const defs = document.createElementNS(this.svgNS, "defs");
        this.svg.appendChild(defs);
        let patternIdCounter = 0; // Um einzigartige IDs zu sichern

        if (totalSeatsInParliament === 0) {
            this.legendContainer.innerHTML = '<p style="text-align:center; font-style:italic;">Keine Sitze im Gremium.</p>';
            return;
        }

        let partiesWithSeats = (Array.isArray(parties) ? parties : [])
            .filter(p => p && (p.seats || 0) > 0 && !p.isEliminated);

        if (customSortOrder && Array.isArray(customSortOrder)) {
            // Sortiere nach der customSortOrder, dann unbekannte Parteien, dann nach Größe
            partiesWithSeats.sort((a, b) => {
                const indexA = customSortOrder.indexOf(a.abbreviation);
                const indexB = customSortOrder.indexOf(b.abbreviation);

                if (indexA !== -1 && indexB !== -1) { // Beide in der Liste
                    return indexA - indexB;
                } else if (indexA !== -1) { // Nur A in der Liste
                    return -1;
                } else if (indexB !== -1) { // Nur B in der Liste
                    return 1;
                } else { // Beide nicht in der Liste, sortiere nach Sitzen
                    return (b.seats || 0) - (a.seats || 0);
                }
            });
            console.log("[Hemicycle] Sortiert nach Custom Order:", partiesWithSeats.map(p=>p.abbreviation));
        } else {
            // Standard-Sortierung nach Sitzanzahl (absteigend)
            partiesWithSeats.sort((a, b) => (b.seats || 0) - (a.seats || 0));
            console.log("[Hemicycle] Sortiert nach Sitzanzahl:", partiesWithSeats.map(p=>p.abbreviation));
        }

        let seatsRepresentedBySortedParties = partiesWithSeats.reduce((sum, p) => sum + p.seats, 0);
        let otherSeatsCount = 0;
        let otherSeatsLegendTextArray = [];

        if (additionalSeatsInfo) {
            if (additionalSeatsInfo.individualCandidates > 0) {
                otherSeatsCount += additionalSeatsInfo.individualCandidates;
                otherSeatsLegendTextArray.push(`Unabhängige (${additionalSeatsInfo.individualCandidates})`);
            }
            // "PartiesWithoutList" ist im Bundestagskontext eher unüblich, hier ggf. anders behandeln
            if (additionalSeatsInfo.partiesWithoutList > 0) {
                otherSeatsCount += additionalSeatsInfo.partiesWithoutList;
                otherSeatsLegendTextArray.push(`P. o. Liste (${additionalSeatsInfo.partiesWithoutList})`);
            }
        }

        // Sitze von Parteien, die zwar Sitze haben, aber nicht in customSortOrder waren (falls Logik so gewünscht)
        // Alternativ: Alle Parteien, die nicht in customSortOrder sind, werden zu einer "Sonstige"-Gruppe zusammengefasst.
        // Für die Bundestagsanordnung ist es üblicher, dass alle Fraktionen einzeln erscheinen.
        // Wenn eine Partei Sitze hat, aber nicht in customSortOrder ist, wird sie nach der aktuellen Sortierung am Ende erscheinen.

        const totalSeatsForDiagram = seatsRepresentedBySortedParties + otherSeatsCount;
        if (totalSeatsForDiagram === 0) {
             this.legendContainer.innerHTML = '<p style="text-align:center; font-style:italic;">Keine darstellbaren Sitze.</p>';
             return;
        }


        const viewBoxParts = this.svg.getAttribute("viewBox") ? this.svg.getAttribute("viewBox").split(" ") : ["0", "0", "350", "185"];
        const viewBoxWidth = parseFloat(viewBoxParts[2]);
        const viewBoxHeight = parseFloat(viewBoxParts[3]);
        const cx = viewBoxWidth / 2;
        const cy_baseline = viewBoxHeight - 5; // Etwas Platz unten lassen
        const outerRadius = viewBoxHeight - 10; // Etwas kleiner als die halbe Höhe
        let currentAngleRad = Math.PI; // Start links (180 Grad)

        // Parteien zeichnen
        partiesWithSeats.forEach(party => {
            if (party.seats === 0) return;
            const angleSweepRad = (party.seats / totalSeatsForDiagram) * Math.PI; // Winkelanteil im Halbkreis
            const endAngleRad = currentAngleRad - angleSweepRad;

            const startX_outer = cx + outerRadius * Math.cos(currentAngleRad);
            const startY_outer = cy_baseline - outerRadius * Math.sin(currentAngleRad);
            const endX_outer = cx + outerRadius * Math.cos(endAngleRad);
            const endY_outer = cy_baseline - outerRadius * Math.sin(endAngleRad);
            const largeArcFlag = angleSweepRad > Math.PI ? 1 : 0; // Für Segmente <180 Grad immer 0
            const sweepFlag = 1; // Für Zeichnen von "großem Winkel zu kleinem Winkel" (CW in SVG-Koordinaten)

            // --- NEUER BLOCK FÜR PATTERN-ERSTELLUNG UND PATH ---
            let fillValue = party.color || sonstigeColor; // Standard-Füllung
            const isGradient = party.color && party.color.startsWith('linear-gradient');

            if (isGradient) {
                // 1. Farben aus dem Gradient-String extrahieren (findet alle Hex-Codes)
                // KORREKTUR: Regex, um Hex (#...) ODER rgb(r, g, b) zu finden
                const colorsFromGradient = party.color.match(/(?:rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|#(?:[0-9a-fA-F]{3,6}))/g);
                //const colorsFromGradient = party.color.match(/#(?:[0-9a-fA-F]{3,6})/g);

                // 2. Duplikate entfernen (z.B. [c1, c1, c2, c2] -> [c1, c2])
                const uniqueColors = colorsFromGradient ? [...new Set(colorsFromGradient)] : [];

                if (uniqueColors.length > 0) {
                    // 3. Einzigartige ID für das Pattern erstellen
                    const patternId = `stripePattern-${party.id || patternIdCounter++}`;
                    fillValue = `url(#${patternId})`; // Füllung ist jetzt die URL zum Pattern

                    // KORREKTUR: Basisgröße für die Streifen (größer = gröber)
                    const patternSize = 20;

                    // 4. SVG <pattern> Element erstellen
                    const pattern = document.createElementNS(this.svgNS, 'pattern');
                    pattern.setAttribute('id', patternId);
                    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                    pattern.setAttribute('width', patternSize.toString()); // GEÄNDERT
                    pattern.setAttribute('height', patternSize.toString()); // GEÄNDERT
                    pattern.setAttribute('patternTransform', 'rotate(45)'); // 45 Grad Winkel

                    // 5. <rect> Elemente für jede Farbe erstellen
                    const stripeWidth = patternSize / uniqueColors.length; // GEÄNDERT
                    uniqueColors.forEach((color, index) => {
                        const rect = document.createElementNS(this.svgNS, 'rect');
                        rect.setAttribute('x', (index * stripeWidth).toString());
                        rect.setAttribute('y', '0');
                        rect.setAttribute('width', stripeWidth.toString());
                        rect.setAttribute('height', patternSize.toString()); // GEÄNDERT
                        rect.setAttribute('fill', color);
                        pattern.appendChild(rect);
                    });

                    // 6. Fertiges Pattern zu den <defs> hinzufügen
                    defs.appendChild(pattern);
                } else {
                    // Fallback, wenn Gradient-Parsing fehlschlägt
                    fillValue = sonstigeColor;
                }
            }

            // Path-Erstellung (wie zuvor, aber mit 'fillValue')
            const d = `M ${cx} ${cy_baseline} L ${startX_outer} ${startY_outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX_outer} ${endY_outer} Z`;
            const path = document.createElementNS(this.svgNS, "path");

            path.dataset.partyId = party.id;
            path.setAttribute("d", d);
            path.setAttribute("fill", fillValue); // Hier wird die URL(#id) oder die Farbe gesetzt
            path.setAttribute("stroke", "#FFFFFF");
            path.setAttribute("stroke-width", "0.5");
            path.setAttribute('tabindex', '0');
            path.setAttribute('role', 'graphics-symbol button');
            path.setAttribute('aria-label', `${party.abbreviation}: ${party.seats} Sitz(e)`);
            const title = document.createElementNS(this.svgNS, "title");
            title.textContent = `${party.abbreviation}: ${party.seats} Sitz(e)`;
            path.appendChild(title);
            this.svg.appendChild(path);
            // --- ENDE NEUER BLOCK ---

            /* const d = `M ${cx} ${cy_baseline} L ${startX_outer} ${startY_outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX_outer} ${endY_outer} Z`;
            const path = document.createElementNS(this.svgNS, "path");
            // ... (Attribute für path setzen wie zuvor: dataset.partyId, fill, stroke, title etc.)
            path.dataset.partyId = party.id;
            path.setAttribute("d", d);

            //path.setAttribute("fill", party.color || sonstigeColor); // Fallback auf sonstigeColor

            // KORREKTUR: SVG 'fill' kann keine 'linear-gradient' CSS-Strings verarbeiten.
            // Wir prüfen, ob es ein Gradient ist, und nutzen dann die 'sonstigeColor' (z.B. Grau) als Fallback.
            const fillColor = (party.color && party.color.startsWith('linear-gradient'))
                                ? sonstigeColor
                                : (party.color || sonstigeColor);
            path.setAttribute("fill", fillColor);

            path.setAttribute("stroke", "#FFFFFF");
            path.setAttribute("stroke-width", "0.5"); // Dünnere Linien zwischen Segmenten
            path.setAttribute('tabindex', '0');
            path.setAttribute('role', 'graphics-symbol button');
            path.setAttribute('aria-label', `${party.abbreviation}: ${party.seats} Sitz(e)`);
            const title = document.createElementNS(this.svgNS, "title");
            title.textContent = `${party.abbreviation}: ${party.seats} Sitz(e)`;
            path.appendChild(title);
            this.svg.appendChild(path); //*/

            currentAngleRad = endAngleRad;

            // Legende
            const legendItem = document.createElement('span');
            legendItem.classList.add('legend-item');
            legendItem.innerHTML = `<span class="legend-color-box" style="background:${party.color || sonstigeColor};"></span> <span class="math-inline">${party.abbreviation} (${party.seats})&nbsp;</span>`;
            this.legendContainer.appendChild(legendItem);
        });

        // "Sonstige" oder unabhängige Sitze zeichnen
        if (otherSeatsCount > 0) {
            // ... (Logik zum Zeichnen des "otherSeatsCount"-Segments wie zuvor) ...
            const angleSweepRad = (otherSeatsCount / totalSeatsForDiagram) * Math.PI;
            const endAngleRad = currentAngleRad - angleSweepRad;
            // ... (d-Pfad erstellen) ...
            const d = `M ${cx} ${cy_baseline} L ${startX_outer} ${startY_outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX_outer} ${endY_outer} Z`; // KORREKTUR: d-Pfad muss hier berechnet werden
            const path = document.createElementNS(this.svgNS, "path");
            // ... (Attribute setzen, fill: sonstigeColor) ...
            path.setAttribute("d", d);
            path.setAttribute("fill", sonstigeColor);
            path.setAttribute("stroke", "#FFFFFF");
            path.setAttribute("stroke-width", "0.5");
            this.svg.appendChild(path);

            const legendItem = document.createElement('span');
            legendItem.classList.add('legend-item');
            legendItem.innerHTML = `<span class="legend-color-box" style="background-color:${sonstigeColor};"></span> ${otherSeatsLegendTextArray.join(' + ')}&nbsp;`;
            this.legendContainer.appendChild(legendItem);
        }
    }
}

// KORREKTUR: Die Klasse CoalitionAnalyzer bleibt erhalten, wird aber im Constructor
// des AppControllers nur noch sicher initialisiert.

