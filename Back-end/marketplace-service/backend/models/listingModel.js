// services/marketplace-service/backend/models/listingModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['furniture', 'books', 'electronics', 'utilities', 'clothing', 'sports', 'other']
    },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'like-new', 'good', 'fair', 'poor']
    },
    images: [{
        type: String
    }],
    // CHANGED: Store user ID as String instead of ObjectId reference
    createdBy: {
        type: String,  // Store as String, not ObjectId
        required: true
    },
    // ADDED: Store user info directly to avoid cross-service references
    createdByEmail: {
        type: String,
        required: true
    },
    createdByName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    contactInfo: {
        phone: String,
        room: String,
        hostel: String
    }
}, { timestamps: true });

// Index for faster queries
listingSchema.index({ createdBy: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ category: 1 });

module.exports = mongoose.model('Listing', listingSchema);