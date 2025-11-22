import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { marketplaceApi } from '../api/config';
import axios from 'axios';

import { authApi } from '../api/config';

import '../styles/marketplace.css'; 


const listingService = {
  getAllListings: async () => {
    const res = await marketplaceApi.get('/listings');
    return res.data.listings;
  },
  createListing: async (data) => {
    const res = await marketplaceApi.post('/listings', data);
    return res.data;
  },
  updateListing: async (id, data) => {
    const res = await marketplaceApi.put(`/listings/${id}`, data);
    return res.data;
  },
  deleteListing: async (id) => {
    const res = await marketplaceApi.delete(`/listings/${id}`);
    return res.data;
  },
};

const authService = {
  getProfile: async () => {
    const res = await authApi.get('/user/me');
    return res.data.user;
  },
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};



function Marketplace() {
  const [listings, setListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'electronics',
    condition: 'good',
    images: [],
    contactInfo: {
      phone: '',
      room: '',
      hostel: ''
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null); 

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    const token = searchParams.get('token');
    if (token) {
      authService.setToken(token);
      navigate('/marketplace', { replace: true }); 
      fetchUser();
    } else if (localStorage.getItem('authToken')) {
      fetchUser();
    }
  }, [searchParams, navigate]);
  
  useEffect(() => {
    fetchListings();
  }, []);

  
  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await listingService.getAllListings();
      setListings(data);
      setError('');
    } catch (err) { 
      setError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE FORM HANDLERS ---
  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!currentUser) {
        alert("Please log in to create a listing.");
        return;
    }
    try {
      await listingService.createListing(formData);
      alert('Listing created successfully!');
      setShowForm(false);
      fetchListings(); // Refresh listings
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: 'electronics',
        condition: 'good',
        images: [],
        contactInfo: { phone: '', room: '', hostel: '' }
      });
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const handleInputChange = (e) => { 
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' ? parseFloat(value) || 0 : value
      }));
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (listingId) => { 
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    try {
      await listingService.deleteListing(listingId);
      setListings(prev => prev.filter(l => l._id !== listingId));
      alert("Listing deleted!");
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (listing) => { 
    setEditFormData(listing);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => { 
    const { name, value } = e.target;
    
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: name === 'price' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleEditSubmit = async (e) => { 
    e.preventDefault();
    if (!editFormData || !editFormData._id) return;

    try {
      const { _id, createdBy, ...updateData } = editFormData;
      const response = await listingService.updateListing(_id, updateData);
      
      setListings(prev => 
        prev.map(l => (l._id === response.listing._id ? response.listing : l))
      );
      
      setIsEditModalOpen(false);
      alert("Listing updated successfully!");
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to update listing');
    }
  };


  return (
    <div className="mp-container">
      {/* Header */}
      <header className="mp-header">
        <div className="mp-header-content">
          <div>
            <h1 className="mp-header-title">Marketplace</h1>
            <p className="mp-header-subtitle">Buy and sell with the campus community</p>
          </div>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                Hi, {currentUser.fullName || currentUser.email.split('@')[0]}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mp-main-content">
        {/* Action Bar */}
        <div className="mp-action-bar">
          <h2 className="mp-section-title">
            Discover Items ({listings.length})
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentUser && (
              <>
                <button
                  onClick={() => navigate('/marketplace/profile')}
                  className="mp-button mp-button-edit"
                >
                  <span>👤</span> My Profile
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="mp-button mp-button-create"
                >
                  {showForm ? 'Close Form' : '+ Sell Item'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- CREATE LISTING FORM --- */}
        {showForm && (
          <div className="mp-form-container">
            <h3 className="mp-form-title">Create New Listing</h3>
            <form onSubmit={handleSubmit} className="mp-form">
              <div>
                <label className="mp-label">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Engineering Mechanics Textbook"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mp-input"
                />
              </div>

              <div>
                <label className="mp-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the condition, age, and details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mp-textarea"
                />
              </div>

              <div className="mp-grid-3">
                <div>
                  <label className="mp-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="mp-input"
                  />
                </div>

                <div>
                  <label className="mp-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mp-select"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="furniture">Furniture</option>
                    <option value="clothing">Clothing</option>
                    <option value="sports">Sports</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mp-label">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="mp-select"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="mp-grid-3">
                <div>
                  <label className="mp-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="mp-input"
                  />
                </div>

                <div>
                  <label className="mp-label">Room (Optional)</label>
                  <input
                    type="text"
                    name="contact.room"
                    value={formData.contactInfo.room}
                    onChange={handleInputChange}
                    className="mp-input"
                  />
                </div>

                <div>
                  <label className="mp-label">Hostel (Optional)</label>
                  <input
                    type="text"
                    name="contact.hostel"
                    value={formData.contactInfo.hostel}
                    onChange={handleInputChange}
                    className="mp-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mp-button mp-button-submit"
                style={{ marginTop: '1rem' }}
              >
                Publish Listing
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mp-error-message">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mp-loading-state">
            <div className="mp-spinner"></div>
            <p>Loading listings...</p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length === 0 && (
          <div className="mp-no-listings">
            <p>No listings found. Be the first to sell something!</p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="mp-grid-3">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="mp-card"
              >
                <div>
                  <div className="mp-card-header">
                    <h3 className="mp-card-title">{listing.title}</h3>
                    <span className={`mp-card-status ${
                      listing.status === 'available' 
                        ? 'mp-status-available' 
                        : 'mp-status-sold'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div className="mp-card-tags">
                    <span className="mp-card-tag-category">
                      {listing.category}
                    </span>
                    <span className="mp-card-tag-condition">
                      {listing.condition}
                    </span>
                  </div>

                  <p className="mp-card-description">
                    {listing.description}
                  </p>
                  
                  <div className="mp-card-price-row">
                    <span className="mp-card-price">
                      ₹{listing.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="mp-card-posted-by">
                    Seller: {listing.createdBy?.name || 'Unknown'}
                  </p>
                </div>
                
                {/* Contact Seller Button - Only for logged-in users who aren't the owner */}
                {currentUser && listing.createdBy && currentUser._id !== listing.createdBy._id && listing.status === 'available' && (
                  <div className="mp-card-actions" style={{ display: 'flex' }}>
                    <a
                      href={`mailto:${listing.createdBy.email}?subject=Inquiry: ${listing.title}&body=Hi,%0D%0A%0D%0AI'm interested in your listing "${listing.title}" priced at ₹${listing.price}. Is it still available?`}
                      className="mp-button mp-button-contact"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Email Seller
                    </a>
                  </div>
                )}
                
                {/* Edit/Delete Buttons - Only for the owner */}
                {currentUser && listing.createdBy && currentUser._id === listing.createdBy._id && (
                  <div className="mp-card-actions">
                    <button
                      onClick={() => handleEditClick(listing)}
                      className="mp-button mp-button-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="mp-button mp-button-delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- EDIT LISTING MODAL --- */}
      {isEditModalOpen && editFormData && (
        <div 
          className="mp-modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="mp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-header">
              <h3 className="mp-form-title" style={{marginBottom: 0}}>Edit Listing</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="mp-modal-close-btn"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="mp-form">
              <div>
                <label className="mp-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditInputChange}
                  required
                  className="mp-input"
                />
              </div>

              <div>
                <label className="mp-label">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditInputChange}
                  required
                  rows={3}
                  className="mp-textarea"
                />
              </div>

              <div className="mp-grid-3">
                <div>
                  <label className="mp-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price || 0}
                    onChange={handleEditInputChange}
                    required
                    min="0"
                    className="mp-input"
                  />
                </div>
                <div>
                  <label className="mp-label">Category</label>
                  <select
                    name="category"
                    value={editFormData.category || 'other'}
                    onChange={handleEditInputChange}
                    className="mp-select"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="furniture">Furniture</option>
                    <option value="clothing">Clothing</option>
                    <option value="sports">Sports</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mp-label">Condition</label>
                  <select
                    name="condition"
                    value={editFormData.condition || 'good'}
                    onChange={handleEditInputChange}
                    className="mp-select"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mp-label">Status</label>
                <select
                  name="status"
                  value={editFormData.status || 'available'}
                  onChange={handleEditInputChange}
                  className="mp-select"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="mp-grid-3">
                <div>
                  <label className="mp-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={editFormData.contactInfo?.phone || ''}
                    onChange={handleEditInputChange}
                    className="mp-input"
                  />
                </div>
                <div>
                  <label className="mp-label">Room (Optional)</label>
                  <input
                    type="text"
                    name="contact.room"
                    value={editFormData.contactInfo?.room || ''}
                    onChange={handleEditInputChange}
                    className="mp-input"
                  />
                </div>
                <div>
                  <label className="mp-label">Hostel (Optional)</label>
                  <input
                    type="text"
                    name="contact.hostel"
                    value={editFormData.contactInfo?.hostel || ''}
                    onChange={handleEditInputChange}
                    className="mp-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mp-button mp-button-submit"
                style={{marginTop: '1rem'}}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Marketplace;