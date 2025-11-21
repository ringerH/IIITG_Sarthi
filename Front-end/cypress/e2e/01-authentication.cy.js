describe('Authentication Flow', () => {
  
    beforeEach(() => {
      // Visit the landing page
      cy.visit('http://localhost:3000')
    })
  
    it('Should display landing page with role selection', () => {
      cy.contains('Welcome to Sarthi').should('be.visible')
      cy.contains('Student').should('be.visible')
      cy.contains('Faculty').should('be.visible')
      cy.contains('Staff').should('be.visible')
    })
  
    it('Should navigate to login page when clicking Student', () => {
      cy.contains('Student').click()
      cy.url().should('include', '/auth')
      cy.contains('Sign in as Student').should('be.visible')
    })
  
    it('Should show Google Sign-In button', () => {
      cy.visit('http://localhost:3000/auth?role=student')
      cy.get('[id*="google"]').should('exist')
    })
  
    it('Should redirect to home after successful login', () => {
      // Mock successful login
      const mockToken = 'mock-jwt-token'
      const mockUser = {
        _id: 'test-user-123',
        email: 'test@iiitg.ac.in',
        fullName: 'Test User',
        role: 'student'
      }
  
      // Set items in localStorage
      cy.visit('http://localhost:3000/auth')
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', mockToken)
        win.localStorage.setItem('user', JSON.stringify(mockUser))
      })
  
      cy.visit('http://localhost:3000/Home')
      cy.contains('Welcome, Test User').should('be.visible')
    })
  })