// @group:suite
// @retry=2

describe('Passphrase', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true, version: Cypress.env('emuVersionT2') });
        cy.task('setupEmu', { passphrase_protection: true });
        cy.task('startBridge');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cy.task('applySettings', { passphrase_always_on_device: false });

        cy.viewport(1024, 768).resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    it('tooltip', () => {
        cy.getTestElement('@tooltip/passphrase-tooltip')
            .children()
            .children()
            .trigger('mouseenter');
        cy.hoverTestElement('@tooltip/openGuide').click();
    });
});
