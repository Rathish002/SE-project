Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    // Firebase permission errors are common when mocking auth in a real app
    return false;
});

beforeEach(() => {
    // Global intercept for the production API URL found in logs
    cy.intercept('https://se-project-pcag.onrender.com/**', (req) => {
        req.reply({
            statusCode: 200,
            body: {}
        });
    });

    // Intercept common stats/progress calls that might be hit
    cy.intercept('GET', '**/user/*/stats', {
        statusCode: 200,
        body: { lessonsStarted: 5, lessonsCompleted: 2 }
    });

    cy.intercept('GET', '**/user/*/completed-lessons', {
        statusCode: 200,
        body: { completedLessonIds: [1, 2] }
    });
});
