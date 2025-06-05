import React from 'react';
import styles from './VersionHistoryModal.module.css';

const VersionHistoryModal = ({ 
  isOpen, 
  onClose, 
  ancestry, // array of recipes from root to current
  currentRecipeId,
  onViewRecipe
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

  const handleView = (recipeId) => {
    onClose();
    onViewRecipe(recipeId);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Version History</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          {ancestry.map((recipe) => (
            <div 
              key={recipe._id} 
              className={`${styles.versionItem} ${currentRecipeId === recipe._id ? styles.active : ''}`}
            >
              <div className={styles.versionHeader}>
                <span className={styles.versionNumber}>{recipe.name}</span>
                <span className={styles.versionDate}>{formatDate(recipe.createdAt)}</span>
              </div>
              <div className={styles.versionActions}>
                <button 
                  onClick={() => handleView(recipe._id)}
                  className={styles.viewButton}
                >
                  View
                </button>
              </div>
              <div className={styles.authorInfo}>
                <img 
                  src={recipe.author.profilePicture || '/default-avatar.png'} 
                  alt={recipe.author.name}
                  className={styles.authorAvatar}
                />
                <span className={styles.authorName}>{recipe.author.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal; 