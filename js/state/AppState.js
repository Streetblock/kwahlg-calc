class AppState {
    constructor() {
        this.nrw = {
            parties: []
        };
        this.simple = {
            procedure: 'hare',
            seatSizes: ['10'],
            proposals: []
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

    getSimpleProposals() {
        return this.simple.proposals.map((proposal) => ({ ...proposal }));
    }

    addSimpleProposal(proposal) {
        this.simple.proposals.push({ ...proposal });
    }

    updateSimpleProposal(proposalId, updates) {
        const proposal = this.simple.proposals.find((entry) => entry.id === proposalId);
        if (!proposal) return;
        Object.assign(proposal, updates);
    }

    removeSimpleProposal(proposalId) {
        this.simple.proposals = this.simple.proposals.filter((proposal) => proposal.id !== proposalId);
    }

    clearSimpleProposals() {
        this.simple.proposals = [];
    }

    resetSimpleProposalVotes() {
        this.simple.proposals = this.simple.proposals.map((proposal) => ({
            ...proposal,
            votes: 0
        }));
    }

    getSimpleProcedure() {
        return this.simple.procedure;
    }

    setSimpleProcedure(procedure) {
        this.simple.procedure = procedure || 'hare';
    }

    getSimpleSeatSizes() {
        return [...this.simple.seatSizes];
    }

    setSimpleSeatSizes(seatSizes) {
        this.simple.seatSizes = (Array.isArray(seatSizes) && seatSizes.length > 0)
            ? seatSizes.map((size) => `${size}`)
            : ['10'];
    }

    addSimpleSeatSize(seatSize = '') {
        this.simple.seatSizes.push(`${seatSize}`);
    }

    updateSimpleSeatSize(index, seatSize) {
        if (index < 0 || index >= this.simple.seatSizes.length) return;
        this.simple.seatSizes[index] = `${seatSize}`;
    }

    removeSimpleSeatSize(index) {
        if (this.simple.seatSizes.length <= 1) {
            this.simple.seatSizes = ['10'];
            return;
        }
        this.simple.seatSizes = this.simple.seatSizes.filter((_, seatIndex) => seatIndex !== index);
    }
}
