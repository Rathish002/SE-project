describe('Accessibility Settings', () => {
    beforeEach(() => {
        cy.visit('/settings');
    });

    it('toggles distraction-free mode', () => {
        cy.get('button').contains('Distraction-Free Mode').click();
        cy.get('body').should(($body) => {
            const cls = $body.attr('class') || '';
            expect(cls).to.include('focus-mode');
        });
    });

    it('updates font size', () => {
        cy.get('input[type="range"]').invoke('val', 24).trigger('change');
        // We expect the html/body font size to reflect
        // In our app it sets a data attribute
        cy.get('html').should('have.attr', 'data-font-size');
    });
});
