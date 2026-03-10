describe('Collaboration and Chat', () => {
    beforeEach(() => {
        cy.visit('/collaboration');
    });

    it('renders the chat interface', () => {
        cy.get('.collaboration-app').should('exist');
        cy.get('button').contains('Chats').should('exist');
    });

    it('navigates to Find Friends tab', () => {
        cy.get('button').contains(/^Find Friends|Friends$/).click();
        cy.get('input[placeholder="Search users..."]').should('exist');
    });

    it('sends a chat message', () => {
        // Assuming there's a mocked conversation or active test user
        // We navigate to a mock chat
        cy.get('.conversation-card').first().click();

        // Using data-testid
        cy.get('[data-testid="message-input"]').type('Hello from Cypress{enter}');
        cy.get('.message-bubble').contains('Hello from Cypress').should('exist');
    });
});
