import React from 'react';
import '../styles/profileView.css';

export const ProfileView = ({ userData, onEditProfile, onBack }) => {
  const getInitials = () => {
    if (!userData.fullName) return '?';
    return userData.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-view-container">
      <div className="profile-view-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h1>My Profile</h1>
        <button className="edit-profile-btn" onClick={onEditProfile}>
          ✏️ Edit Profile
        </button>
      </div>

      <div className="profile-view-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-section-view">
            <div className="profile-avatar-large-view">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt={userData.fullName} />
              ) : (
                <div className="avatar-initials-view">{getInitials()}</div>
              )}
            </div>
            <div className="profile-name-section">
              <h2>{userData.fullName}</h2>
              <p className="roll-number-view">{userData.rollNumber}</p>
            </div>
          </div>

          {userData.bio && (
            <div className="bio-section">
              <h3>About Me</h3>
              <p className="bio-text-view">{userData.bio}</p>
            </div>
          )}
        </div>

        {/* Information Sections */}
        <div className="info-sections">
          {/* Academic Information */}
          <div className="info-section">
            <h3 className="section-title">📚 Academic Information</h3>
            <div className="info-grid">
              <div className="info-item-view">
                <span className="info-label-view">Program & Year</span>
                <span className="info-value-view">{userData.year || 'Not specified'}</span>
              </div>
              <div className="info-item-view">
                <span className="info-label-view">Department</span>
                <span className="info-value-view">{userData.department || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="info-section">
            <h3 className="section-title">👤 Personal Information</h3>
            <div className="info-grid">
              <div className="info-item-view">
                <span className="info-label-view">Gender</span>
                <span className="info-value-view">{userData.gender || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="info-section">
            <h3 className="section-title">📞 Contact Information</h3>
            <div className="info-grid">
              <div className="info-item-view">
                <span className="info-label-view">Email</span>
                <span className="info-value-view">{userData.email}</span>
              </div>
              <div className="info-item-view">
                <span className="info-label-view">Phone</span>
                <span className="info-value-view">{userData.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;