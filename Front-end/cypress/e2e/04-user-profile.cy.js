describe('User Profile Flow', () => {
  
    beforeEach(() => {
      const mockToken = 'mock-jwt-token'
      const mockUser = {
        _id: 'test-user-123',
        email: 'test@iiitg.ac.in',
        fullName: 'Test User',
        role: 'student',
        rollNumber: '2021001',
        department: 'CSE'
      }
  
      cy.visit('http://localhost:3000')
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', mockToken)
        win.localStorage.setItem('user', JSON.stringify(mockUser))
      })
    })
  
    it('Should display profile page', () => {
      cy.visit('http://localhost:3000/profile')
      cy.contains('Your Profile').should('be.visible')
    })
  
    it('Should show user information', () => {
      // Mock API response
      cy.intercept('GET', '**/api/user/me', {
        statusCode: 200,
        body: {
          user: {
            _id: 'test-user-123',
            email: 'test@iiitg.ac.in',
            fullName: 'Test User',
            rollNumber: '2021001',
            department: 'CSE'
          }
        }
      }).as('getProfile')
  
      cy.visit('http://localhost:3000/profile')
      cy.wait('@getProfile')
      
      cy.contains('test@iiitg.ac.in').should('be.visible')
      cy.get('input[name="fullName"]').should('have.value', 'Test User')
    })
  
    it('Should update profile', () => {
      cy.intercept('GET', '**/api/user/me', {
        statusCode: 200,
        body: {
          user: {
            _id: 'test-user-123',
            email: 'test@iiitg.ac.in',
            fullName: 'Test User',
            rollNumber: '2021001'
          }
        }
      })
  
      cy.visit('http://localhost:3000/profile')
      
      cy.get('input[name="fullName"]').clear().type('Updated User Name')
      cy.get('input[name="department"]').type('Computer Science')
      
      cy.intercept('PUT', '**/api/user/me', {
        statusCode: 200,
        body: {
          user: {
            _id: 'test-user-123',
            fullName: 'Updated User Name',
            department: 'Computer Science'
          }
        }
      }).as('updateProfile')
      
      cy.contains('Save Profile').click()
      cy.wait('@updateProfile')
      
      // Should show success message
      cy.contains('successfully', { matchCase: false }).should('be.visible')
    })
  })