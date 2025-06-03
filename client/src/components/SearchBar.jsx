import React, { useState } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name', 'cuisine', or 'ingredient'

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm, searchType);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchType}...`}
          className={styles.searchInput}
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className={styles.searchType}
        >
          <option value="name">Recipe Name</option>
          <option value="cuisine">Cuisine</option>
          <option value="ingredient">Ingredient</option>
        </select>
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </div>
    </form>
  );
} 