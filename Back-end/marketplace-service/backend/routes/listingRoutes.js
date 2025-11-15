const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.put('/:id', authMiddleware, listingController.updateListing);
// Create a new listing
router.post('/', listingController.createListing);

// Get all listings (with optional filters)
router.get('/', listingController.getListings);

// Get user's own listings
router.get('/my-listings', listingController.getMyListings);

// Get specific listing by ID
router.get('/:id', listingController.getListingById);

// Update a listing
router.put('/:id', listingController.updateListing);

// Delete a listing
router.delete('/:id', listingController.deleteListing);
router.delete('/:id', authMiddleware, listingController.deleteListing);
// Mark listing as sold
router.patch('/:id/sold', listingController.markAsSold);

module.exports = router;