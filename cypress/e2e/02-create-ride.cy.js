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
    
    // Matches text in RideList.js
    cy.contains('Create your own ride').click()
    cy.url().should('include', '/create-ride')
  })

  it('Should display all form fields', () => {
    cy.visit('http://localhost:3000/create-ride')
    
    // UPDATED: Uses IDs instead of names to match CreatePost.js
    cy.get('#rideTitle').should('be.visible')
    cy.get('#pickupLocation').should('be.visible')
    cy.get('#dropoffLocation').should('be.visible')
    cy.get('#availableSeats').should('be.visible')
    cy.get('#rideDate').should('be.visible')
    cy.get('#description').should('be.visible')
  })

  it('Should show validation errors for empty form', () => {
    cy.visit('http://localhost:3000/create-ride')
    
    cy.get('button[type="submit"]').click()
    
    // HTML5 validation check
    cy.get('input:invalid').should('have.length.greaterThan', 0)
  })

  it('Should fill and submit the form', () => {
    cy.visit('http://localhost:3000/create-ride')
    
    // UPDATED: Uses IDs
    cy.get('#rideTitle').type('Trip to Airport')
    cy.get('#pickupLocation').type('IIITG Campus')
    cy.get('#dropoffLocation').type('Guwahati Airport')
    cy.get('#availableSeats').type('3')
    cy.get('#rideDate').type('2025-12-25T10:00')
    cy.get('#description').type('Comfortable ride with AC')
    
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
    // CreatePost.js alerts and redirects to /Home on success
    cy.on('window:alert', (str) => {
      expect(str).to.contains('successfully')
    })
    cy.url().should('include', '/Home')
  })
})