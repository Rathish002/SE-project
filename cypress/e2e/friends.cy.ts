describe('Friends Management', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/users/search*', { statusCode: 200, body: [] });
        cy.intercept('GET', '**/api/friends*', { statusCode: 200, body: [] });
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
        cy.get('.nav-button').contains('Collaboration').click();
        cy.get('.sidebar-tab').contains('Friends', { matchCase: false }).click();
    });

    it('searches for a new friend', () => {
        cy.get('.friend-search-input').type('Test User');
        cy.get('.friend-search-button').click();
        cy.get('.friend-search').should('exist');
    });

    it('shows empty friend list correctly', () => {
        cy.get('.friend-list-empty').should('exist');
    });
});
