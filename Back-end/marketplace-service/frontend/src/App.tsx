import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listingService, authService } from './services/api';
import { Listing, CreateListingData } from './types/listing.types';

// Use _id to match MongoDB
interface User {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the *create* form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateListingData>({
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

  // --- State for the *edit* modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Listing>>({});

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Effect to fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        authService.logout();
      }
    };

    const token = searchParams.get('token');
    if (token) {
      console.log('Found token in URL. Saving to localStorage.');
      authService.setToken(token);
      navigate('/', { replace: true });
      fetchUser();
    } else if (localStorage.getItem('authToken')) {
      fetchUser();
    }
  }, [searchParams, navigate]);
  
  // Effect to fetch listings on load
  useEffect(() => {
    fetchListings();
  }, []);

  
  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await listingService.getAllListings();
      setListings(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE FORM HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  const handleDelete = async (listingId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    try {
      await listingService.deleteListing(listingId);
      setListings(prev => prev.filter(l => l._id !== listingId));
      alert("Listing deleted!");
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (listing: Listing) => {
    setEditFormData(listing);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev!.contactInfo,
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editFormData._id) return;

    try {
      const { _id, createdBy, ...updateData } = editFormData;
      const updatedListing = await listingService.updateListing(_id, updateData as CreateListingData);
      
      setListings(prev => 
        prev.map(l => (l._id === updatedListing._id ? updatedListing : l))
      );
      
      setIsEditModalOpen(false);
      alert("Listing updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update listing');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Campus Marketplace</h1>
          {currentUser ? (
             <p className="text-blue-100 mt-1">Logged in as: {currentUser.email}</p>
          ) : (
            <p className="text-blue-100 mt-1">Buy and sell items on campus</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Available Items ({listings.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {showForm ? 'Cancel' : '+ Create Listing'}
          </button>
        </div>

        {/* --- CREATE LISTING FORM (RESTORED) --- */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Create New Listing</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    name="contact.room"
                    value={formData.contactInfo.room}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                  <input
                    type="text"
                    name="contact.hostel"
                    value={formData.contactInfo.hostel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
              >
                Create Listing
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No listings found. Create the first one!</p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
              >
                {/* Top part of the card */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      listing.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {listing.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {listing.condition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{listing.price}
                    </span>
                  </div>
                  {listing.contactInfo.hostel && (
                    <p className="text-xs text-gray-500 mt-2">
                      🏢 {listing.contactInfo.hostel} {listing.contactInfo.room && `- Room ${listing.contactInfo.room}`}
                    </p>
                  )}
                <p className="text-xs text-gray-400 mt-2">
                    Posted by: 
                    {listing.createdBy && listing.createdBy.email ? (
                      // --- If seller email exists, render the clickable link ---
                      <a 
                        href={`mailto:${listing.createdBy.email}?subject=Inquiry about your listing: ${listing.title}`}
                        className="text-blue-500 hover:text-blue-600 hover:underline ml-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {listing.createdBy.name || listing.createdBy.email}
                      </a>
                    ) : (
                      // --- Otherwise, just display the name as plain text ---
                      <span className="ml-1">
                        {listing.createdBy?.name || 'Seller'}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* --- CONDITIONAL EDIT/DELETE BUTTONS --- */}
                {currentUser && listing.createdBy && currentUser.id === listing.createdBy._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(listing)}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                  >
                  Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing._id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 mb-8 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Listing</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price || 0}
                    onChange={handleEditInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={editFormData.category || 'other'}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={editFormData.condition || 'good'}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={editFormData.contactInfo?.phone || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    name="contact.room"
                    value={editFormData.contactInfo?.room || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                  <input
                    type="text"
                    name="contact.hostel"
                    value={editFormData.contactInfo?.hostel || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
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

export default App;