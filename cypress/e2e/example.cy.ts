describe('Landing page', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Shared grocery lists').should('be.visible')
  })
})
