class ModalController {
    constructor(dom) {
        this.DOM = dom;
    }

    show(title, htmlContent) {
        this.DOM.csvModalTitle.innerText = title;
        this.DOM.csvModalBody.innerHTML = htmlContent;
        if (this.DOM.csvImportModal) {
            this.DOM.csvImportModal.style.display = 'flex';
        }
    }

    hide() {
        if (this.DOM.csvImportModal) {
            this.DOM.csvImportModal.style.display = 'none';
        }
    }

    confirm(title, message, confirmButtonText = 'OK', confirmButtonClass = 'btn-danger') {
        return new Promise((resolve) => {
            const modalBodyHTML = `
                <p>${message}</p>
                <div class="modal-actions" style="text-align: right; margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="modal-btn-cancel" class="btn-secondary">Abbrechen</button>
                    <button id="modal-btn-confirm" class="${confirmButtonClass}">${confirmButtonText}</button>
                </div>
            `;

            this.show(title, modalBodyHTML);

            const btnConfirm = document.getElementById('modal-btn-confirm');
            const btnCancel = document.getElementById('modal-btn-cancel');
            const btnCloseX = this.DOM.csvModalClose;

            const keydownHandler = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    confirmHandler();
                } else if (event.key === 'Escape' || event.key === 'Esc') {
                    event.preventDefault();
                    cancelHandler();
                }
            };

            const cleanupAndResolve = (result) => {
                btnConfirm.removeEventListener('click', confirmHandler);
                btnCancel.removeEventListener('click', cancelHandler);
                btnCloseX.removeEventListener('click', cancelHandler);
                document.removeEventListener('keydown', keydownHandler);

                this.hide();
                resolve(result);
            };

            const confirmHandler = () => {
                cleanupAndResolve(true);
            };

            const cancelHandler = () => {
                cleanupAndResolve(false);
            };

            btnConfirm.addEventListener('click', confirmHandler);
            btnCancel.addEventListener('click', cancelHandler);
            btnCloseX.addEventListener('click', cancelHandler);
            document.addEventListener('keydown', keydownHandler);
        });
    }
}
