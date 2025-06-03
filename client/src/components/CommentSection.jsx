import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './CommentSection.module.css';

const LOCAL_COMMENTS_KEY = 'dev_comments';

export default function CommentSection({ recipeId }) {
  const { user, isDevMode } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Load comments from localStorage in dev mode
  React.useEffect(() => {
    if (isDevMode) {
      const storedComments = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const allComments = storedComments ? JSON.parse(storedComments) : {};
      setComments(allComments[recipeId] || []);
    } else {
      // In production, fetch comments from API
      fetchComments();
    }
  }, [recipeId, isDevMode]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError('Failed to load comments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      text: newComment,
      author: user.name,
      authorAvatar: user.avatar,
      createdAt: new Date().toISOString()
    };

    try {
      if (isDevMode) {
        // Save to localStorage in dev mode
        const storedComments = localStorage.getItem(LOCAL_COMMENTS_KEY);
        const allComments = storedComments ? JSON.parse(storedComments) : {};
        const recipeComments = allComments[recipeId] || [];
        allComments[recipeId] = [...recipeComments, comment];
        localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(allComments));
        setComments(allComments[recipeId]);
      } else {
        // Save to API in production
        const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ text: newComment })
        });
        if (!response.ok) throw new Error('Failed to post comment');
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
      }
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.title}>Comments</h3>
      
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className={styles.commentInput}
          rows="3"
        />
        <button type="submit" className={styles.submitButton}>
          Post Comment
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img
                  src={comment.authorAvatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
                  alt="author avatar"
                  className={styles.authorAvatar}
                />
                <div className={styles.commentInfo}>
                  <span className={styles.authorName}>{comment.author}</span>
                  <span className={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className={styles.commentText}>{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 