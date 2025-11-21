import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/marketplace.css';

const marketplaceApi = axios.create({
  baseURL: '/api/marketplace', // This should proxy correctly
});

marketplaceApi.interceptors.request.use(config => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Error adding token:', e);
  }
  return config;
}, error => {
  return Promise.reject(error);
});

function MarketplaceProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('[MarketplaceProfile] Fetching profile data...');
      
      // Fetch user profile
      const profileRes = await marketplaceApi.get('/user/profile');
      console.log('[MarketplaceProfile] Profile response:', profileRes.data);
      setUser(profileRes.data.user);
      
      // Fetch sold items history
      const historyRes = await marketplaceApi.get('/user/history/sold');
      console.log('[MarketplaceProfile] History response:', historyRes.data);
      setSoldItems(historyRes.data.listings);
      
    } catch (err) {
      console.error('[MarketplaceProfile] Error fetching profile:', err);
      console.error('[MarketplaceProfile] Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user?.fullName) return user?.email?.[0]?.toUpperCase() || 'U';
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mp-container">
        <div className="mp-loading-state">
          <div className="mp-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mp-container">
        <div className="mp-main-content">
          <div className="mp-error-message">
            <strong>Error:</strong> {error}
            <br />
            <button 
              onClick={() => navigate('/marketplace')}
              className="mp-button mp-button-create"
              style={{ marginTop: '1rem' }}
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mp-container">
      {/* Header */}
      <header className="mp-header">
        <div className="mp-header-content">
          <h1 className="mp-header-title">Your Profile</h1>
          <p className="mp-header-subtitle">Manage your account and listings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mp-main-content">
        {/* Profile Card */}
        <div className="mp-profile-card">
          <div className="mp-profile-avatar">
            {getInitials()}
          </div>
          <div className="mp-profile-info">
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {user?.fullName || user?.email}
            </h2>
            <p style={{ fontSize: '1rem' }}>{user?.email}</p>
          </div>
          <button 
            onClick={() => navigate('/marketplace')}
            className="mp-button mp-button-edit"
          >
            ← Back to Marketplace
          </button>
        </div>

        {/* Statistics */}
        <div className="mp-stats-grid">
          <div className="mp-stat-card">
            <div className="mp-stat-number">
              {soldItems.length}
            </div>
            <div className="mp-stat-label">Total Listings</div>
          </div>
          <div className="mp-stat-card">
            <div className="mp-stat-number">
              {soldItems.filter(item => item.status === 'available').length}
            </div>
            <div className="mp-stat-label">Active Listings</div>
          </div>
          <div className="mp-stat-card">
            <div className="mp-stat-number">
              {soldItems.filter(item => item.status === 'sold').length}
            </div>
            <div className="mp-stat-label">Sold Items</div>
          </div>
        </div>

        {/* Listing History */}
        <div className="mp-history-section">
          <div className="mp-action-bar" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem'}}>
            <h2 className="mp-section-title">Listing History</h2>
          </div>
          
          {soldItems.length === 0 ? (
            <div className="mp-no-listings">
              <p>You haven't posted any listings yet.</p>
            </div>
          ) : (
            <div className="mp-grid-3">
              {soldItems.map((listing) => (
                <div key={listing._id} className="mp-card">
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
                      Posted on: {formatDate(listing.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MarketplaceProfile;