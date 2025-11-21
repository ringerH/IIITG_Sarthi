describe('Marketplace Flow', () => {
  
    beforeEach(() => {
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
  
    it('Should display marketplace page', () => {
      cy.visit('http://localhost:3000/marketplace')
      cy.contains('Campus Marketplace').should('be.visible')
    })
  
    it('Should show create listing button when logged in', () => {
      cy.visit('http://localhost:3000/marketplace')
      cy.contains('Create Listing').should('be.visible')
    })
  
    it('Should open create listing form', () => {
      cy.visit('http://localhost:3000/marketplace')
      cy.contains('Create Listing').click()
      
      cy.get('input[name="title"]').should('be.visible')
      cy.get('textarea[name="description"]').should('be.visible')
      cy.get('input[name="price"]').should('be.visible')
    })
  
    it('Should create a new listing', () => {
      cy.visit('http://localhost:3000/marketplace')
      cy.contains('Create Listing').click()
      
      cy.get('input[name="title"]').type('Data Structures Textbook')
      cy.get('textarea[name="description"]').type('Good condition, minimal highlights')
      cy.get('input[name="price"]').type('500')
      cy.get('select[name="category"]').select('books')
      cy.get('select[name="condition"]').select('good')
      
      // Intercept API
      cy.intercept('POST', '**/api/listings', {
        statusCode: 201,
        body: {
          listing: {
            _id: 'listing-123',
            title: 'Data Structures Textbook'
          }
        }
      }).as('createListing')
      
      cy.get('button[type="submit"]').contains('Create Listing').click()
      
      cy.wait('@createListing')
    })
  
    it('Should display listings', () => {
      // Mock API response
      cy.intercept('GET', '**/api/listings', {
        statusCode: 200,
        body: {
          listings: [
            {
              _id: '1',
              title: 'Textbook',
              price: 500,
              category: 'books',
              condition: 'good',
              status: 'available',
              createdBy: { _id: 'other-user', name: 'Seller', email: 'seller@iiitg.ac.in' }
            }
          ]
        }
      }).as('getListings')
  
      cy.visit('http://localhost:3000/marketplace')
      cy.wait('@getListings')
      
      cy.contains('Textbook').should('be.visible')
      cy.contains('₹500').should('be.visible')
    })
  })