describe('Evaluating System', () => {
    beforeEach(() => {
        // Needs authentication in real flow
        cy.visit('/lessons');
    });

    it('checks if an answer feedback appears', () => {
        // Assuming exercises are accessible via lessons 
        cy.get('[data-testid="lesson-start-button"]').first().click();

        // Choose an option or fill input
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="exercise-option"]').length > 0) {
                cy.get('[data-testid="exercise-option"]').first().click();
                cy.contains('Check Answer', { matchCase: false }).click();

                // Success or encouraging message
                cy.get('.feedback-region').should('be.visible');
            } else if ($body.find('[data-testid="exercise-input"]').length > 0) {
                cy.get('[data-testid="exercise-input"]').type('test answer');
                cy.contains('Check Answer', { matchCase: false }).click();

                // Success or encouraging message
                cy.get('.feedback-region').should('be.visible');
            }
        });
    });
});
