// services/marketplace-service/backend/controllers/listingController.js
const Listing = require('../models/listingModel');

// Create a new listing
exports.createListing = async (req, res) => {
    try {
        const { title, description, price, category, condition, images, contactInfo } = req.body;
        
        const listing = new Listing({
            title,
            description,
            price,
            category,
            condition,
            images,
            contactInfo,
            createdBy: req.user.id,  // User ID from JWT
            createdByEmail: req.user.email,  // Store email directly
            createdByName: req.user.name  // Store name directly
        });

        await listing.save();
        res.status(201).json({ message: 'Listing created successfully', listing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all listings
exports.getListings = async (req, res) => {
    try {
        const { category, status, minPrice, maxPrice, search } = req.query;
        
        let filter = {};
        
        if (category) filter.category = category;
        if (status) filter.status = status;
        else filter.status = 'available';
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        // NO POPULATE - data is stored directly
        const listings = await Listing.find(filter).sort({ createdAt: -1 });

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

        res.status(200).json({ listings: transformedListings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Transform to match frontend expectations
        const transformedListing = {
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
        };

        res.status(200).json({ listing: transformedListing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update listing
exports.updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Check ownership - compare as strings
        if (listing.createdBy !== req.user.id) {
            return res.status(403).json({ message: "User not authorized to update this listing" });
        }

        // Update the listing
        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Transform response
        const transformedListing = {
            _id: updatedListing._id,
            title: updatedListing.title,
            description: updatedListing.description,
            price: updatedListing.price,
            category: updatedListing.category,
            condition: updatedListing.condition,
            images: updatedListing.images,
            status: updatedListing.status,
            contactInfo: updatedListing.contactInfo,
            createdAt: updatedListing.createdAt,
            updatedAt: updatedListing.updatedAt,
            createdBy: {
                _id: updatedListing.createdBy,
                email: updatedListing.createdByEmail,
                name: updatedListing.createdByName
            }
        };

        res.status(200).json({
            message: "Listing updated successfully",
            listing: transformedListing
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete listing
exports.deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Check ownership - compare as strings
        if (listing.createdBy !== req.user.id) {
            return res.status(403).json({ message: "User not authorized to delete this listing" });
        }

        await Listing.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Listing deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's own listings
exports.getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

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

        res.status(200).json({ listings: transformedListings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark listing as sold
exports.markAsSold = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check ownership
        if (listing.createdBy !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        listing.status = 'sold';
        await listing.save();
        
        res.status(200).json({ message: 'Listing marked as sold', listing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};