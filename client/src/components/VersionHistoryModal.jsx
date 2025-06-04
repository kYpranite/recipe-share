import React from 'react';
import styles from './VersionHistoryModal.module.css';

const VersionHistoryModal = ({ 
  isOpen, 
  onClose, 
  versions, 
  currentVersion, 
  onVersionSelect, 
  onFork, 
  onRevert,
  isAuthor 
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Version History</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div 
                key={version.id} 
                className={`${styles.versionItem} ${currentVersion?.id === version.id ? styles.active : ''}`}
              >
                <div className={styles.versionInfo}>
                  <span className={styles.versionDate}>{formatDate(version.createdAt)}</span>
                  <div className={styles.badges}>
                    {version.revertedFrom && (
                      <span className={styles.revertedBadge}>Reverted</span>
                    )}
                    {version.isFork && (
                      <span className={styles.forkBadge}>Forked</span>
                    )}
                  </div>
                </div>
                <div className={styles.versionActions}>
                  <button 
                    onClick={() => onVersionSelect(version)}
                    className={styles.viewButton}
                  >
                    View
                  </button>
                  <button 
                    onClick={() => onFork(version)}
                    className={styles.forkButton}
                  >
                    Fork
                  </button>
                  {isAuthor && (
                    <button 
                      onClick={() => onRevert(version)}
                      className={styles.revertButton}
                      disabled={currentVersion?.id === version.id}
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal; 