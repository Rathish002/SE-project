describe('Evaluating System', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/lesson/*', { statusCode: 200, body: { id: 1, title: 'Test Lesson', content: 'test content' } });
        cy.intercept('GET', '**/api/progress/*', { statusCode: 200, body: [] });
        cy.intercept('GET', '**/user/*/stats', { statusCode: 200, body: { lessonsStarted: 0, lessonsCompleted: 0 } });
        cy.on('window:before:load', (win) => {
            (win as any).mockUser = { uid: 'testuser', email: 'test@example.com', displayName: 'Test User' };
        });
        cy.visit('/');
        cy.get('.nav-button').contains('Lessons').click();
    });

    it('checks if learning content loads', () => {
        // Evaluate that lesson content is correctly loaded and ready
        cy.get('[data-testid="lesson-start-button"]').first().click();

        // Should display learning region
        cy.get('.learning-container').should('exist');
    });
});
