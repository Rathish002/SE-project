describe('Authentication Flow', () => {
    beforeEach(() => {
        // Navigate to local app
        cy.visit('/');
    });

    it('navigates to signup from login', () => {
        cy.get('button').contains('Sign Up').click();
        cy.contains('h1', 'Create Account').should('exist');
    });

    it('shows error on invalid login', () => {
        cy.get('[data-testid="email-input"]').type('invalid@test.com');
        cy.get('[data-testid="password-input"]').type('wrongpass');
        cy.get('[data-testid="login-button"]').click();

        // Check for error element (Role alert or specific text in UI)
        cy.get('.error-message').should('be.visible');
    });

    it('shows error on mismatched passwords during signup', () => {
        cy.get('button').contains('Sign Up').click();
        cy.get('[data-testid="signup-email-input"]').type('newuser@test.com');
        cy.get('[data-testid="signup-password-input"]').type('password123');
        cy.get('input[id="signup-confirm-password"]').type('password456');
        cy.get('[data-testid="signup-button"]').click();

        cy.get('.error-message').should('contain', 'Passwords do not match');
    });
});
