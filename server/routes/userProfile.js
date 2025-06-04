import express from 'express';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  console.log('GET /me - Fetching current user profile');
  console.log('User ID from token:', req.user.id);
  
  try {
    const user = await User.findById(req.user.id).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  console.log('GET /profile - Fetching user profile');
  console.log('User ID from token:', req.user.id);
  
  try {
    const user = await User.findById(req.user.id).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user profile by ID
router.get('/profile/:userId', auth, async (req, res) => {
  console.log('GET /profile/:userId - Fetching specific user profile');
  console.log('Requested user ID:', req.params.userId);
  
  try {
    const user = await User.findById(req.params.userId).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  console.log('PUT /profile - Updating user profile');
  console.log('User ID from token:', req.user.id);
  console.log('Update data:', req.body);
  
  try {
    const {
      name,
      profilePicture,
      bio,
      location,
      socialLinks,
      preferences
    } = req.body;

    const updateFields = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (name) updateFields.name = name;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;
    if (socialLinks) updateFields.socialLinks = socialLinks;
    if (preferences) updateFields.preferences = preferences;

    console.log('Update fields being applied:', updateFields);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Update specific preferences
router.patch('/profile/preferences', auth, async (req, res) => {
  console.log('PATCH /profile/preferences - Updating user preferences');
  console.log('User ID from token:', req.user.id);
  console.log('Update data:', req.body);
  
  try {
    const { dietaryRestrictions, favoriteCategories } = req.body;
    const updateFields = {
      updatedAt: new Date()
    };

    if (dietaryRestrictions) {
      updateFields['preferences.dietaryRestrictions'] = dietaryRestrictions;
    }
    if (favoriteCategories) {
      updateFields['preferences.favoriteCategories'] = favoriteCategories;
    }

    console.log('Update fields being applied:', updateFields);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
});

// Update social links
router.patch('/profile/social', auth, async (req, res) => {
  try {
    const { socialLinks } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          socialLinks,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating social links', error: error.message });
  }
});

// Get user's recipes
router.get('/:userId/recipes', auth, async (req, res) => {
  console.log('GET /:userId/recipes - Fetching user recipes');
  console.log('User ID:', req.params.userId);
  
  try {
    const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;
    // This endpoint will be implemented when we add the Recipe model
    // For now, return an empty array
    res.json({ recipes: [] });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// Get user's followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({ followers: followers.map(f => f.follower) });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Error fetching followers', error: error.message });
  }
});

// Get user's following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const following = await Follow.find({ follower: userId })
      .populate('following', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({ following: following.map(f => f.following) });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Error fetching following', error: error.message });
  }
});

// Check if current user is following another user
router.get('/:userId/is-following', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    const follow = await Follow.findOne({ follower: followerId, following: followingId });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Error checking follow status', error: error.message });
  }
});

// Get user's liked recipes
router.get('/:userId/liked-recipes', auth, async (req, res) => {
  console.log('GET /:userId/liked-recipes - Fetching liked recipes');
  console.log('User ID:', req.params.userId);
  
  try {
    const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;
    // This endpoint will be implemented when we add the Recipe model
    // For now, return an empty array
    res.json({ recipes: [] });
  } catch (error) {
    console.error('Error fetching liked recipes:', error);
    res.status(500).json({ message: 'Error fetching liked recipes', error: error.message });
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    // Prevent self-following
    if (followerId === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: followingId
    });
    await follow.save();

    // Update follower and following counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followerCount: 1 } });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});

// Unfollow a user
router.post('/:userId/unfollow', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    // Delete follow relationship
    const result = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    
    if (!result) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Update follower and following counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followerCount: -1 } });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
});

export default router; 