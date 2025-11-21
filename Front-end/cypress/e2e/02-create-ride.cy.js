describe('Ride Creation Flow', () => {
  
    beforeEach(() => {
      // Login first
      const mockToken = 'mock-jwt-token'
      const mockUser = {
        _id: 'test-user-123',
        email: 'test@iiitg.ac.in',
        fullName: 'Test User',
        role: 'student'
      }
  
      cy.visit('http://localhost:3000')
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', mockToken)
        win.localStorage.setItem('user', JSON.stringify(mockUser))
      })
    })
  
    it('Should navigate to create ride page', () => {
      cy.visit('http://localhost:3000/Home')
      cy.contains('Find a Ride').click()
      cy.url().should('include', '/rides')
      
      cy.contains('Create your own ride').click()
      cy.url().should('include', '/create-ride')
    })
  
    it('Should display all form fields', () => {
      cy.visit('http://localhost:3000/create-ride')
      
      cy.get('input[name="rideTitle"]').should('be.visible')
      cy.get('input[name="pickupLocation"]').should('be.visible')
      cy.get('input[name="dropoffLocation"]').should('be.visible')
      cy.get('input[name="availableSeats"]').should('be.visible')
      cy.get('input[type="datetime-local"]').should('be.visible')
      cy.get('textarea[name="description"]').should('be.visible')
    })
  
    it('Should show validation errors for empty form', () => {
      cy.visit('http://localhost:3000/create-ride')
      
      cy.get('button[type="submit"]').click()
      
      // HTML5 validation will prevent submission
      cy.get('input:invalid').should('have.length.greaterThan', 0)
    })
  
    it('Should fill and submit the form', () => {
      cy.visit('http://localhost:3000/create-ride')
      
      cy.get('input[name="rideTitle"]').type('Trip to Airport')
      cy.get('input[name="pickupLocation"]').type('IIITG Campus')
      cy.get('input[name="dropoffLocation"]').type('Guwahati Airport')
      cy.get('input[name="availableSeats"]').type('3')
      cy.get('input[type="datetime-local"]').type('2025-12-25T10:00')
      cy.get('textarea[name="description"]').type('Comfortable ride with AC')
      
      // Intercept API call
      cy.intercept('POST', '**/api/rides', {
        statusCode: 201,
        body: {
          _id: 'ride-123',
          rideTitle: 'Trip to Airport'
        }
      }).as('createRide')
      
      cy.get('button[type="submit"]').click()
      
      cy.wait('@createRide')
      // Should show success message or redirect
    })
  })