import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './CommentSection.module.css';
import LikeButton from './LikeButton';
import { API_BASE_URL } from '../config';

const LOCAL_COMMENTS_KEY = 'dev_comments';

export default function CommentSection({ recipeId }) {
  const { user, token, isDevMode } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Load comments from localStorage in dev mode or fetch from API
  React.useEffect(() => {
    if (isDevMode) {
      const storedComments = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const allComments = storedComments ? JSON.parse(storedComments) : {};
      setComments(allComments[recipeId] || []);
    } else {
      fetchComments();
    }
  }, [recipeId, isDevMode]);

  // Fetch comments from the API
  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/recipe/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError('Failed to load comments');
    }
  };

  // Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      if (isDevMode) {
        // Store comment in localStorage for development
        const storedComments = localStorage.getItem(LOCAL_COMMENTS_KEY);
        const allComments = storedComments ? JSON.parse(storedComments) : {};
        const recipeComments = allComments[recipeId] || [];
        
        const comment = {
          id: Date.now().toString(),
          content: newComment,
          author: {
            name: user.name,
            profilePicture: user.avatar
          },
          createdAt: new Date().toISOString(),
          likes: [],
          likeCount: 0
        };
        
        allComments[recipeId] = [...recipeComments, comment];
        localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(allComments));
        setComments(allComments[recipeId]);
      } else {
        // Post comment to API in production
        const response = await fetch(`${API_BASE_URL}/api/comments/${recipeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newComment })
        });
        if (!response.ok) throw new Error('Failed to post comment');
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
      }
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  // Handle like/unlike on comments
  const handleLikeToggle = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      const updatedComment = await response.json();
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      setError('Failed to update like');
    }
  };

  // Navigate to user profile on click
  const handleAuthorClick = (authorId) => {
    navigate(`/profile/${authorId}`);
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
            <div key={comment._id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img
                  src={comment.author.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
                  alt="author avatar"
                  className={styles.authorAvatar}
                />
                <div className={styles.commentInfo}>
                  <span 
                    className={styles.authorName}
                    onClick={() => handleAuthorClick(comment.author._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {comment.author.name}
                  </span>
                  <span className={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className={styles.commentText}>{comment.content}</p>
              <div className={styles.commentActions}>
                {user && (
                  <LikeButton
                    isLiked={comment.likes.includes(user.id)}
                    likeCount={comment.likes.length}
                    onLikeToggle={() => handleLikeToggle(comment._id)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 