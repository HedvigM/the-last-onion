describe('Invite deep link (cold visit)', () => {
  const invitePath = '/invite/test-token-abc'

  function visitWithoutServiceWorker(path: string) {
    cy.visit(path, {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'serviceWorker', {
          configurable: true,
          value: {
            register: () => Promise.reject(new Error('disabled for test')),
            getRegistration: () => Promise.resolve(undefined),
            getRegistrations: () => Promise.resolve([]),
          },
        })
      },
    })
  }

  it('returns the SPA shell over HTTP for direct invite URLs', () => {
    cy.request(invitePath).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.include('<!DOCTYPE html>')
      expect(res.body).to.include('id="app"')
      expect(res.body).not.to.eq('Not found')
    })
  })

  it('loads the Vue invite page without visiting the landing page first', () => {
    cy.clearLocalStorage()
    visitWithoutServiceWorker(invitePath)

    cy.get('#app').should('not.be.empty')
    cy.get('.accept-page').should('exist')
    cy.contains('h1', /Invite not found|You're invited!/).should('be.visible')
    cy.get('body').invoke('text').should('not.eq', 'Not found')
  })

  it('still serves static JS assets for the app shell', () => {
    cy.request(invitePath).then((res) => {
      const match = res.body.match(/src="(\/assets\/index-[^"]+\.js)"/)
      expect(match, 'main bundle script tag').to.not.be.null

      cy.request(match![1]).then((assetRes) => {
        expect(assetRes.status).to.eq(200)
        expect(assetRes.headers['content-type']).to.include('javascript')
      })
    })
  })
})
