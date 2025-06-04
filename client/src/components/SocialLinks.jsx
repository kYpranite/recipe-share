import React from 'react';
import styles from './SocialLinks.module.css';

export default function SocialLinks({ socialLinks }) {
  if (!socialLinks) return null;

  const { instagram, facebook, twitter, website } = socialLinks;

  // Only render if at least one social link exists
  if (!instagram && !facebook && !twitter && !website) return null;

  return (
    <div className={styles.socialLinks}>
      {website && (
        <a 
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.socialLink}
          title="Website"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </a>
      )}
      {instagram && (
        <a 
          href={`https://instagram.com/${instagram}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.socialLink}
          title="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
      )}
      {facebook && (
        <a 
          href={`https://facebook.com/${facebook}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.socialLink}
          title="Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      )}
      {twitter && (
        <a 
          href={`https://twitter.com/${twitter}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.socialLink}
          title="Twitter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
          </svg>
        </a>
      )}
    </div>
  );
} 