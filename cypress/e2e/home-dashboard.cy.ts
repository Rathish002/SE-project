describe('Home Dashboard', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/user/*/stats', { statusCode: 200, body: { lessonsStarted: 10, lessonsCompleted: 5 } });
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
    });

    it('renders the sidebar navigation', () => {
        cy.get('nav.sidebar').should('exist');
        cy.get('button').contains('Home').should('exist');
        cy.get('button').contains('Lessons').should('exist');
    });
});
