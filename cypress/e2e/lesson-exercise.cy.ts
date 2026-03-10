describe('Lesson and Exercise Flow', () => {
    beforeEach(() => {
        cy.visit('/lessons');
    });

    it('shows lesson cards', () => {
        // Note: Depends on mock auth or real app state, this assumes the basic UI renders
        cy.get('[data-testid="lesson-card"]').should('exist');
    });

    it('can start a lesson', () => {
        cy.get('[data-testid="lesson-start-button"]').first().click();
        // Assuming it navigates to /learning or shows exercise content
        cy.get('.lesson-container').should('exist');
    });
});
