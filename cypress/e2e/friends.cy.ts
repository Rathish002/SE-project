describe('Friends Management', () => {
    beforeEach(() => {
        cy.visit('/collaboration');
        cy.get('button').contains(/^Friends|Find Friends$/).click();
    });

    it('searches for a new friend', () => {
        cy.get('input[placeholder*="Search"]').type('Test User');
        cy.get('button').contains('Search').click();
        cy.get('.search-results').should('exist');
    });

    it('shows empty friend list correctly', () => {
        cy.get('.friend-list').should('exist');
        cy.contains('No friends yet').should('exist');
    });
});
