import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './EditProfile.module.css';

const LOCAL_PROFILE_KEY = 'dev_profile';

export default function EditProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    avatar: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (stored) {
      setFormData(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(formData));
    setSaved(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileBox}>
        <h1>Edit Your Profile</h1>
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
            <label htmlFor="avatar">Avatar URL</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Paste an image URL (optional)"
            />
          </div>
          <button className={styles.saveButton} type="submit">Save</button>
          {saved && <div className={styles.savedMsg}>Profile saved!</div>}
        </form>
        <div className={styles.preview}>
          <h2>Preview</h2>
          <img
            src={formData.avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
            alt="avatar preview"
            className={styles.avatar}
          />
          <div className={styles.previewName}>{formData.name}</div>
          <div className={styles.previewBio}>{formData.bio}</div>
        </div>
      </div>
    </div>
  );
} 