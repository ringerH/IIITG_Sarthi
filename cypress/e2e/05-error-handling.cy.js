describe('Error Handling', () => {
  
    beforeEach(() => {
      const mockToken = 'mock-jwt-token'
      const mockUser = {
        _id: 'test-user-123',
        email: 'test@iiitg.ac.in',
        fullName: 'Test User'
      }
  
      cy.visit('http://localhost:3000')
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', mockToken)
        win.localStorage.setItem('user', JSON.stringify(mockUser))
      })
    })
  
    it('Should handle API errors gracefully', () => {
      cy.intercept('GET', '**/api/rides', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getRidesError')
  
      cy.visit('http://localhost:3000/rides')
      cy.wait('@getRidesError')
      
      // RideList.js displays the error message text
      cy.contains(/error|failed/i).should('be.visible')
    })
  
    it('Should handle network errors', () => {
      cy.intercept('GET', '**/api/listings', {
        forceNetworkError: true
      }).as('networkError')
  
      cy.visit('http://localhost:3000/marketplace')
      // Marketplace.js catches the error and sets error state
      cy.contains(/failed|error/i).should('be.visible')
    })
  
    it('Should handle 401 unauthorized', () => {
      cy.intercept('GET', '**/api/user/me', {
        statusCode: 401,
        body: { message: 'Unauthorized' }
      }).as('unauthorized')
  
      cy.visit('http://localhost:3000/profile')
      cy.wait('@unauthorized')
      
      // FIX: UserProfile.js displays "Authentication failed" rather than redirecting
      cy.contains('Authentication failed').should('be.visible')
    })
  
    it('Should handle empty responses', () => {
      cy.intercept('GET', '**/api/rides', {
        statusCode: 200,
        body: []
      }).as('emptyRides')
  
      cy.visit('http://localhost:3000/rides')
      cy.wait('@emptyRides')
      
      cy.contains(/no rides|empty/i).should('be.visible')
    })
  })