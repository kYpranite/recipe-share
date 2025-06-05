import React from 'react';
import styles from './VersionHistoryModal.module.css';

const VersionHistoryModal = ({ 
  isOpen, 
  onClose, 
  versions,
  currentVersionId,
  onVersionSelect
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVersionSelect = (version) => {
    onClose();
    onVersionSelect(version);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Version History</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          {versions.map((version) => (
            <div 
              key={version._id} 
              className={`${styles.versionItem} ${currentVersionId === version._id ? styles.active : ''}`}
            >
              <div className={styles.versionHeader}>
                <span className={styles.versionNumber}>v{version.versionNumber}</span>
                <span className={styles.versionDate}>{formatDate(version.createdAt)}</span>
              </div>
              <div className={styles.versionInfo}>
                <span className={styles.changelog}>{version.changelog}</span>
              </div>
              <div className={styles.versionActions}>
                <button 
                  onClick={() => handleVersionSelect(version)}
                  className={styles.viewButton}
                >
                  View
                </button>
              </div>
              <div className={styles.authorInfo}>
                <img 
                  src={version.author.profilePicture || '/default-avatar.png'} 
                  alt={version.author.name}
                  className={styles.authorAvatar}
                />
                <span className={styles.authorName}>{version.author.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal; 