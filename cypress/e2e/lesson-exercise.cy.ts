describe('Lesson and Exercise Flow', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/lesson/*', { statusCode: 404 }); // Force fast fallback
        cy.intercept('GET', '**/api/progress/*', { statusCode: 200, body: [] });
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
        cy.get('.nav-button').contains('Lessons').click();
    });

    it('shows lesson cards', () => {
        // Note: Depends on mock auth or real app state, this assumes the basic UI renders
        cy.get('[data-testid="lesson-card"]').should('exist');
    });

    it('can start a lesson', () => {
        cy.get('[data-testid="lesson-start-button"]').first().click();
        // Assuming it navigates to /learning or shows exercise content
        cy.get('.learning-container').should('exist');
    });
});
