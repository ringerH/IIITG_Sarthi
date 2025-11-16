import React, { useState } from 'react';
import '../styles/dashboard.css';

export const Dashboard = ({ userData, onLogout, onViewProfile }) => {
  const [activeModule, setActiveModule] = useState('home');

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">🚗 Sarthi</h1>
            <p className="app-tagline">IIITG Campus Connect</p>
          </div>

          <nav className="main-nav">
            <button
              className={`nav-btn ${activeModule === 'home' ? 'active' : ''}`}
              onClick={() => setActiveModule('home')}
            >
              Home
            </button>
            <button
              className={`nav-btn ${activeModule === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveModule('marketplace')}
            >
              🛒 Marketplace
            </button>
            <button
              className={`nav-btn ${activeModule === 'rideshare' ? 'active' : ''}`}
              onClick={() => setActiveModule('rideshare')}
            >
              🚗 Ride Share
            </button>
            <button
              className={`nav-btn ${activeModule === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveModule('profile')}
            >
              👤 My Profile
            </button>
          </nav>

          <div className="user-section">
            <div className="user-info" onClick={() => setActiveModule('profile')} style={{ cursor: 'pointer' }}>
              <div className="user-avatar-small">
                {userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt={userData.fullName} />
                ) : (
                  userData.fullName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="user-name">{userData.fullName}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        
        {/* HOME */}
        {activeModule === 'home' && (
          <div className="welcome-section">
            <h2>Welcome back, {userData.fullName?.split(' ')[0]}! 👋</h2>
            <p>Your campus marketplace and ride-sharing companion</p>
          </div>
        )}

        {/* MARKETPLACE */}
        {activeModule === 'marketplace' && (
          <div className="module-section">
            <h2>🛒 Campus Marketplace</h2>
            <p>Browse and sell items. Feature coming soon.</p>
          </div>
        )}

        {/* RIDESHARE */}
        {activeModule === 'rideshare' && (
          <div className="module-section">
            <h2>🚗 Ride Sharing</h2>
            <p>Find or offer rides. Feature coming soon.</p>
          </div>
        )}

        {/* PROFILE */}
        {activeModule === 'profile' && (
          <div className="module-section">
            <h2>👤 My Profile</h2>
            <button className="create-btn" onClick={onViewProfile}>
              View Full Profile
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
