describe('Marketplace Flow', () => {
  
  beforeEach(() => {
    const mockToken = 'mock-jwt-token'
    const mockUser = {
      _id: 'test-user-123',
      email: 'test@iiitg.ac.in',
      fullName: 'Test User',
      role: 'student'
    }

    // Mock the user profile fetch
    cy.intercept('GET', '**/api/user/me', {
      statusCode: 200,
      body: {
        user: mockUser
      }
    }).as('checkAuth');

    // Mock listings API to prevent 401 errors
    cy.intercept('GET', '**/api/listings', {
      statusCode: 200,
      body: {
        listings: []
      }
    }).as('getListings');

    // Set auth data BEFORE visiting
    cy.visit('http://localhost:3000', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('authToken', mockToken)
        win.localStorage.setItem('user', JSON.stringify(mockUser))
      }
    })
  })

  it('Should display marketplace page', () => {
    cy.visit('http://localhost:3000/marketplace')
    cy.contains('Marketplace').should('be.visible')
  })

  it('Should show create listing button when logged in', () => {
    cy.visit('http://localhost:3000/marketplace')
    cy.wait('@checkAuth')
    cy.contains('+ Sell Item').should('be.visible')
  })

  it('Should open create listing form', () => {
    cy.visit('http://localhost:3000/marketplace')
    cy.wait('@checkAuth')
    cy.contains('+ Sell Item').click()
    
    cy.get('input[name="title"]').should('be.visible')
    cy.get('textarea[name="description"]').should('be.visible')
    cy.get('input[name="price"]').should('be.visible')
  })

  it('Should create a new listing', () => {
    // Mock the listings GET first
    cy.intercept('GET', '**/api/listings', {
      statusCode: 200,
      body: {
        listings: []
      }
    }).as('getListings')

    cy.visit('http://localhost:3000/marketplace')
    cy.wait('@checkAuth')
    cy.wait('@getListings')
    
    cy.contains('+ Sell Item').should('be.visible').click()
    
    // Wait for form to appear with timeout
    cy.get('input[name="title"]', { timeout: 10000 }).should('be.visible')

    // Fill form
    cy.get('input[name="title"]')
      .type('Data Structures Textbook', { delay: 0 })
      .should('have.value', 'Data Structures Textbook')

    cy.get('textarea[name="description"]')
      .type('Good condition, minimal highlights', { delay: 0 })
      .should('have.value', 'Good condition, minimal highlights')

    // FIXED: Handle price input formatting
    cy.get('input[name="price"]')
      .should('be.visible')
      .clear() // Clear any existing value first
      .type('500', { delay: 0 })
      // Use a more flexible assertion that handles formatting
      .should(($input) => {
        const value = $input.val()
        expect(value).to.include('500') // Check if it contains '500'
      })

    // Select Dropdowns
    cy.get('select[name="category"]').select('books')
    cy.get('select[name="condition"]').select('good')
    
    // Intercept POST API
    cy.intercept('POST', '**/api/listings', {
      statusCode: 201,
      body: {
        listing: {
          _id: 'listing-123',
          title: 'Data Structures Textbook'
        }
      }
    }).as('createListing')
    
    // Submit
    cy.get('button[type="submit"]').contains('Publish Listing').click()
    
    cy.wait('@createListing')
  })

  it('Should display listings', () => {
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