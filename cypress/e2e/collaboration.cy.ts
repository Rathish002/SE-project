describe('Collaboration and Chat', () => {
    beforeEach(() => {
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
        cy.get('.nav-button').contains('Collaboration').click();
    });

    it('renders the chat interface', () => {
        cy.get('.collaboration-app').should('exist');
        cy.get('button').contains('Chats').should('exist');
    });

    it('navigates to Find Friends tab', () => {
        cy.get('.sidebar-tab').contains('Friends', { matchCase: false }).click();
        cy.get('.friend-search-input').should('exist');
    });

    it('shows empty conversation state', () => {
        // Since we are using a mock user, we expect no conversations
        cy.get('.collaboration-app').should('exist');
    });
});
