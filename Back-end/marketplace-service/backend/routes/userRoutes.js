const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const Listing = require('../models/listingModel');

// Get current user's profile from auth-service
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const token = req.header('Authorization');
        
        console.log('[Marketplace User Routes] Fetching profile...');
        console.log('[Marketplace User Routes] Token:', token ? 'present' : 'missing');
        console.log('[Marketplace User Routes] User from JWT:', req.user);
        
        // Determine the correct URL based on environment
        const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
        const apiUrl = `${AUTH_SERVICE_URL}/api/user/me`;
        
        console.log('[Marketplace User Routes] Calling:', apiUrl);
        
        // Call auth-service to get basic user info
        const response = await axios.get(apiUrl, {
            headers: { 
                Authorization: token,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 second timeout
        });
        
        console.log('[Marketplace User Routes] Auth service response:', response.data);
        
        res.json({ success: true, user: response.data.user });
    } catch (error) {
        console.error('[Marketplace User Routes] Error fetching user profile:');
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error config:', error.config?.url);
        
        // Send more detailed error info
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.message || error.message || 'Failed to fetch profile',
            details: error.response?.data || 'No additional details'
        });
    }
});

// Get user's listing history (items they've posted)
router.get('/history/sold', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('[Marketplace User Routes] Fetching history for user:', userId);
        
        // Find all listings created by this user
        const listings = await Listing.find({ createdBy: userId })
            .sort({ createdAt: -1 });
        
        console.log('[Marketplace User Routes] Found', listings.length, 'listings');
        
        // Transform to match frontend expectations
        const transformedListings = listings.map(listing => ({
            _id: listing._id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
            images: listing.images,
            status: listing.status,
            contactInfo: listing.contactInfo,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            createdBy: {
                _id: listing.createdBy,
                email: listing.createdByEmail,
                name: listing.createdByName
            }
        }));
        
        res.json({ success: true, listings: transformedListings });
    } catch (error) {
        console.error('[Marketplace User Routes] Error fetching sold items:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch history',
            details: error.toString()
        });
    }
});

module.exports = router;