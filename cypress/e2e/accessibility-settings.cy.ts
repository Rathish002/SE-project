describe('Accessibility Settings', () => {
    beforeEach(() => {
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
        cy.get('.nav-button').contains('Settings').click();
    });

    it('toggles distraction-free mode', () => {
        cy.get('.toggle-switch input[type="checkbox"]').eq(1).click({ force: true });
        cy.get('.toggle-switch input[type="checkbox"]').eq(1).should('be.checked');
    });

    it('updates font size', () => {
        cy.get('input[type="range"]').first().invoke('val', 24).trigger('change');
        cy.get('input[type="range"]').first().should('have.value', '24');
    });
});
