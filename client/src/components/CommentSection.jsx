import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './CommentSection.module.css';

const LOCAL_COMMENTS_KEY = 'dev_comments';

export default function CommentSection({ recipeId }) {
  const { user, token, isDevMode } = useAuth();
  const navigate = useNavigate();
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
      const response = await fetch(`http://localhost:3000/api/comments/recipe/${recipeId}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      if (isDevMode) {
        console.log("HERE");
        // Save to localStorage in dev mode
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
        const response = await fetch(`http://localhost:3000/api/comments/${recipeId}`, {
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

  const handleLike = async (commentId) => {
    if (isDevMode) {
      // Handle likes in dev mode
      const storedComments = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const allComments = storedComments ? JSON.parse(storedComments) : {};
      const recipeComments = allComments[recipeId] || [];
      
      const updatedComments = recipeComments.map(comment => {
        if (comment.id === commentId) {
          const hasLiked = comment.likes.includes(user.id);
          return {
            ...comment,
            likes: hasLiked 
              ? comment.likes.filter(id => id !== user.id)
              : [...comment.likes, user.id],
            likeCount: hasLiked ? comment.likeCount - 1 : comment.likeCount + 1
          };
        }
        return comment;
      });
      
      allComments[recipeId] = updatedComments;
      localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(allComments));
      setComments(updatedComments);
    } else {
      try {
        const response = await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
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
    }
  };

  const isLiked = (comment) => {
    if (isDevMode) {
      return comment.likes?.includes(user.id);
    }
    return comment.likes?.includes(user._id);
  };

  const handleAuthorClick = (authorName) => {
    navigate(`/profile/${authorName}`);
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
            <div key={comment._id || comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img
                  src={comment.author.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
                  alt="author avatar"
                  className={styles.authorAvatar}
                />
                <div className={styles.commentInfo}>
                  <span 
                    className={styles.authorName}
                    onClick={() => handleAuthorClick(comment.author.name)}
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
                <button 
                  onClick={() => handleLike(comment._id || comment.id)}
                  className={`${styles.likeButton} ${isLiked(comment) ? styles.liked : ''}`}
                >
                  <span className={styles.likeIcon}>❤️</span>
                  <span className={styles.likeCount}>{comment.likeCount || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 