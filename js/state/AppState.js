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
        this.committee = {
            seatSizes: ['19'],
            presentVotes: [],
            factionAlliances: []
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
        const supportedProcedures = new Set(['hare', 'sainte', 'dhondt', 'nrw-bezirksvertretung']);
        this.simple.procedure = supportedProcedures.has(procedure) ? procedure : 'hare';
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

    getCommitteeSeatSizes() {
        return [...this.committee.seatSizes];
    }

    setCommitteeSeatSizes(seatSizes) {
        this.committee.seatSizes = (Array.isArray(seatSizes) && seatSizes.length > 0)
            ? seatSizes.map((size) => `${size}`)
            : ['19'];
    }

    addCommitteeSeatSize(seatSize = '') {
        this.committee.seatSizes.push(`${seatSize}`);
    }

    updateCommitteeSeatSize(index, seatSize) {
        if (index < 0 || index >= this.committee.seatSizes.length) return;
        this.committee.seatSizes[index] = `${seatSize}`;
    }

    removeCommitteeSeatSize(index) {
        if (this.committee.seatSizes.length <= 1) {
            this.committee.seatSizes = ['19'];
            return;
        }
        this.committee.seatSizes = this.committee.seatSizes.filter((_, seatIndex) => seatIndex !== index);
    }

    getCommitteePresentVotes() {
        return this.committee.presentVotes.map((entry) => ({ ...entry }));
    }

    setCommitteePresentVotes(presentVotes) {
        this.committee.presentVotes = (Array.isArray(presentVotes) ? presentVotes : []).map((entry) => ({ ...entry }));
    }

    updateCommitteePresentVote(partyId, presentVotes) {
        const existing = this.committee.presentVotes.find((entry) => entry.partyId === partyId);
        if (existing) {
            existing.present = presentVotes;
            return;
        }

        this.committee.presentVotes.push({
            partyId,
            present: presentVotes
        });
    }

    getCommitteeFactionAlliances() {
        return this.committee.factionAlliances.map((entry) => ({
            ...entry,
            memberIds: [...entry.memberIds]
        }));
    }

    setCommitteeFactionAlliances(factionAlliances) {
        this.committee.factionAlliances = (Array.isArray(factionAlliances) ? factionAlliances : []).map((entry) => ({
            ...entry,
            memberIds: [...entry.memberIds]
        }));
    }

    addCommitteeFactionAlliance(factionAlliance) {
        this.committee.factionAlliances.push({
            ...factionAlliance,
            memberIds: [...factionAlliance.memberIds]
        });
    }

    clearCommitteeFactionAlliances() {
        this.committee.factionAlliances = [];
    }
}
