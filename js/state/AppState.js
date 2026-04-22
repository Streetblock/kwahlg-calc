class AppState {
    constructor() {
        this.nrw = {
            parties: []
        };
    }

    getNrwParties() {
        return this.nrw.parties.map((party) => ({ ...party }));
    }

    setNrwParties(parties) {
        this.nrw.parties = (Array.isArray(parties) ? parties : []).map((party) => ({ ...party }));
    }

    addNrwParty(party) {
        this.nrw.parties.push({ ...party });
    }

    updateNrwParty(partyId, updates) {
        const party = this.nrw.parties.find((entry) => entry.id === partyId);
        if (!party) return;
        Object.assign(party, updates);
    }

    removeNrwParty(partyId) {
        this.nrw.parties = this.nrw.parties.filter((party) => party.id !== partyId);
    }

    clearNrwParties() {
        this.nrw.parties = [];
    }

    resetNrwPartyVotes() {
        this.nrw.parties = this.nrw.parties.map((party) => ({
            ...party,
            votes: 0,
            directMandates: 0
        }));
    }
}
