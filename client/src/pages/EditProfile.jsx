import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './EditProfile.module.css';
import { API_BASE_URL } from '../config';

export default function EditProfile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    profilePicture: '',
    location: '',
    socialLinks: {
      website: '',
      instagram: '',
      twitter: '',
      facebook: ''
    },
    preferences: {
      dietaryRestrictions: [],
      favoriteCategories: []
    }
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if we have a token
        if (!token) {
          console.error('No authentication token found');
          setError('Please log in to access your profile');
          navigate('/login');
          return;
        }

        console.log('Fetching profile from API');
        console.log('Token available:', !!token);
        
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response status:', response.status);
        
        if (response.status === 401) {
          console.error('Authentication token expired or invalid');
          setError('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Received profile data:', data);
        setFormData(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        if (err.message.includes('expired')) {
          navigate('/login');
        }
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Saving profile to API');
      console.log('Profile data being sent:', formData);
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('API Response status:', response.status);
      
      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      console.log('Received updated profile:', updatedProfile);
      setFormData(prev => ({ ...prev, ...updatedProfile }));
      setSaved(true);
      
      // Update the user state in auth context
      const updatedUser = {
        ...user,
        name: updatedProfile.name,
        profilePicture: updatedProfile.profilePicture
      };
      login(updatedUser, token);
      
      // Show success message briefly before redirecting
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error('Error in handleSave:', err);
      if (err.message.includes('token') || err.message.includes('expired')) {
        navigate('/login');
      }
      setError(`Failed to save profile: ${err.message}`);
      setSaved(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileBox}>
        <h1>Edit Your Profile</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself!"
              rows={3}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where are you based?"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="profilePicture">Profile Picture URL</label>
            <input
              type="text"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="Paste an image URL (optional)"
            />
          </div>

          <div className={styles.section}>
            <h3>Social Links</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="socialLinks.website"
                value={formData.socialLinks.website}
                onChange={handleChange}
                placeholder="Your website URL"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="instagram">Instagram</label>
              <input
                type="text"
                id="instagram"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                placeholder="Your Instagram handle"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="twitter">Twitter</label>
              <input
                type="text"
                id="twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="Your Twitter handle"
              />
            </div>
          </div>

          <button className={styles.saveButton} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <div className={styles.savedMsg}>Profile saved! Redirecting...</div>}
        </form>
        <div className={styles.preview}>
          <h2>Preview</h2>
          <img
            src={formData.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
            alt="profile preview"
            className={styles.avatar}
          />
          <div className={styles.previewName}>{formData.name}</div>
          <div className={styles.previewLocation}>{formData.location}</div>
          <div className={styles.previewBio}>{formData.bio}</div>
          {Object.entries(formData.socialLinks).some(([_, value]) => value) && (
            <div className={styles.previewSocial}>
              {formData.socialLinks.website && (
                <a href={formData.socialLinks.website} target="_blank" rel="noopener noreferrer">Website</a>
              )}
              {formData.socialLinks.instagram && (
                <a href={`https://instagram.com/${formData.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
              {formData.socialLinks.twitter && (
                <a href={`https://twitter.com/${formData.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">Twitter</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}