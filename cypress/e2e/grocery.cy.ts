describe('Grocery list flow', () => {
  const apiUrl = Cypress.env('API_URL') ?? 'http://localhost:3001'
  let token: string
  let householdId: string
  let listId: string

  before(() => {
    const email = `test-${Date.now()}@example.com`
    cy.request('POST', `${apiUrl}/auth/register`, {
      email,
      password: 'password123',
      displayName: 'Test User',
      householdName: 'Test Household',
    }).then((res) => {
      token = res.body.token
      householdId = res.body.household.id
    })
  })

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', token)
    })
  })

  it('creates a list and checks off items in order', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/households/${householdId}/lists`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Weekly Shop' },
    }).then((res) => {
      listId = res.body.id
    })

    cy.request({
      method: 'POST',
      url: `${apiUrl}/lists/${listId}/items`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Carrots' },
    })

    cy.request({
      method: 'POST',
      url: `${apiUrl}/lists/${listId}/items`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Milk' },
    })

    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/lists/${listId}/items`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    })

    cy.request({
      method: 'GET',
      url: `${apiUrl}/lists/${listId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const items = res.body.items
      expect(items).to.have.length(2)
      const carrot = items.find((i: { catalogItem: { displayName: string } }) =>
        i.catalogItem.displayName.includes('Carrot'),
      )
      expect(carrot).to.exist
      expect(carrot.checked).to.be.false

      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/lists/${listId}/items/${carrot.id}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { checked: true },
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/lists/${listId}`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((listRes) => {
          const checked = listRes.body.items.filter(
            (i: { checked: boolean }) => i.checked,
          )
          expect(checked).to.have.length(1)
          expect(checked[0].catalogItem.displayName).to.include('Carrot')
        })
      })
    })
  })

  it('deduplicates re-adding the same item', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/lists/${listId}/items`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'carrots' },
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/lists/${listId}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const carrotItems = res.body.items.filter(
          (i: { catalogItem: { normalizedName: string } }) =>
            i.catalogItem.normalizedName === 'carrot',
        )
        expect(carrotItems).to.have.length(1)
        expect(carrotItems[0].checked).to.be.false
      })
    })
  })
})
