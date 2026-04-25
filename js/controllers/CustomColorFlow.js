class CustomColorFlow {
    constructor(app) {
        this.app = app;
    }

    updateColorFromName(name, colorPreviewElement, colorInputElement) {
        const upperName = name.toUpperCase().trim();
        const customMapping = this.findCustomMapping(upperName);

        if (customMapping) {
            colorPreviewElement.style.background = customMapping.color;
            colorInputElement.value = customMapping.color;
            return;
        }

        const singleColor = this.app.partyColorMap[upperName];
        if (singleColor) {
            colorPreviewElement.style.background = singleColor;
            colorInputElement.value = singleColor;
            return;
        }

        const splitNames = upperName.split(/[\/&+,]/);
        if (splitNames.length <= 1) {
            return;
        }

        const colors = splitNames
            .map((namePart) => {
                const trimmedUpper = namePart.trim();
                const custom = this.findCustomMapping(trimmedUpper);
                return custom ? custom.color : this.app.partyColorMap[trimmedUpper];
            })
            .filter(Boolean);

        if (colors.length > 0) {
            const gradient = this.app._createGradient(colors);
            colorPreviewElement.style.background = gradient;
            colorInputElement.value = colors[0];
        }
    }

    findCustomMapping(upperName) {
        return this.app.state.customColorMappings.find((mapping) => mapping.name.toUpperCase() === upperName);
    }

    showColorMappingModal() {
        const container = document.createElement('div');
        container.id = 'custom-mappings-container';
        container.innerHTML = `
            <p>Hier k\u00f6nnen Sie eigene Parteinamen (z.B. lokale W\u00e4hlergruppen) und Farben definieren. Diese werden automatisch erkannt, wenn Sie den Namen in der Liste eintragen.</p>
            <p>Die Mappings werden in Ihrem Browser gespeichert.</p>
            <div id="custom-mappings-list">
                <!-- Liste wird dynamisch bef\u00fcllt -->
            </div>
            <button id="modal-add-mapping" class="btn-add" style="margin-top: 10px;">+ Neues Mapping hinzuf\u00fcgen</button>
            <div style="text-align: right; margin-top: 20px;">
                <button id="modal-btn-close" class="btn-secondary">Schlie\u00dfen</button>
            </div>
        `;

        this.app._showModal('Eigene Farben verwalten', container.innerHTML);

        document.getElementById('modal-add-mapping').addEventListener('click', () => {
            this.addCustomMapping();
            this.renderCustomMappingList();
        });

        document.getElementById('modal-btn-close').addEventListener('click', () => {
            this.app._hideModal();
        });

        const oldCloseButton = this.app.DOM.csvModalClose;
        const newCloseButton = oldCloseButton.cloneNode(true);
        oldCloseButton.parentNode.replaceChild(newCloseButton, oldCloseButton);
        this.app.DOM.csvModalClose = newCloseButton;
        this.app.modalController.DOM.csvModalClose = newCloseButton;

        newCloseButton.addEventListener('click', () => {
            this.app._hideModal();
        });

        this.renderCustomMappingList();
    }

    renderCustomMappingList() {
        const listContainer = document.getElementById('custom-mappings-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (this.app.state.customColorMappings.length === 0) {
            listContainer.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--text-muted);">Keine eigenen Mappings. Klicken Sie auf "Hinzuf\u00fcgen".</p>';
        }

        this.app.state.customColorMappings.forEach((mapping, index) => {
            const mappingElement = document.createElement('div');
            mappingElement.className = 'mapping-item';
            mappingElement.dataset.index = index;

            mappingElement.innerHTML = `
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${mapping.color};" tabindex="0"></div>
                    <input type="color" class="color-picker-hidden" value="${mapping.color}">
                </div>
                <input type="text" placeholder="Name (z.B. 'UWG')" value="${mapping.name}" class="mapping-name">
                <input type="text" placeholder="#FF0000" value="${mapping.color}" class="mapping-color-text" style="font-size: 0.9em;">
                <button class="btn-remove">X</button>
            `;

            listContainer.appendChild(mappingElement);
            this.bindMappingItemEvents(mappingElement, index);
        });
    }

    bindMappingItemEvents(mappingElement, index) {
        const colorPreview = mappingElement.querySelector('.color-preview');
        const colorInput = mappingElement.querySelector('.color-picker-hidden');
        const nameInput = mappingElement.querySelector('.mapping-name');
        const colorText = mappingElement.querySelector('.mapping-color-text');
        const removeButton = mappingElement.querySelector('.btn-remove');

        colorInput.addEventListener('change', () => {
            const newColor = colorInput.value;
            colorPreview.style.background = newColor;
            colorText.value = newColor;
            this.updateCustomMapping(index, { color: newColor });
        });

        colorText.addEventListener('input', () => {
            const newColor = colorText.value;
            if (/^#[0-9a-fA-F]{6}$/.test(newColor) || /^[a-zA-Z]+$/.test(newColor)) {
                colorPreview.style.background = newColor;
                colorInput.value = newColor;
                this.updateCustomMapping(index, { color: newColor });
            }
        });

        nameInput.addEventListener('change', () => {
            this.updateCustomMapping(index, { name: nameInput.value });
        });

        removeButton.addEventListener('click', () => {
            this.removeCustomMapping(index);
            this.renderCustomMappingList();
        });

        colorPreview.addEventListener('click', () => colorInput.click());
        colorPreview.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                colorInput.click();
            }
        });
    }

    addCustomMapping() {
        this.app.state.customColorMappings.push({
            name: '',
            color: '#cccccc'
        });
    }

    updateCustomMapping(index, updates) {
        if (this.app.state.customColorMappings[index]) {
            Object.assign(this.app.state.customColorMappings[index], updates);
            this.app._saveStateToStorage();
        }
    }

    removeCustomMapping(index) {
        this.app.state.customColorMappings.splice(index, 1);
        this.app._saveStateToStorage();
    }
}
