import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/search - Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { query, page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const [users, total] = await Promise.all([
      User.find({
        $and: [
          { _id: { $ne: req.user.id } },
          {
            $or: [
              { name: searchRegex },
              { email: searchRegex }
            ]
          }
        ]
      })
      .select('-password -__v')
      .skip(skip)
      .limit(parseInt(limit)),
      User.countDocuments({
        $and: [
          { _id: { $ne: req.user.id } },
          {
            $or: [
              { name: searchRegex },
              { email: searchRegex }
            ]
          }
        ]
      })
    ]);

    res.json({
      users,
      total,
      hasMore: total > skip + users.length,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// GET /api/users/initial - Get initial users
router.get('/initial', auth, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ _id: { $ne: req.user.id } })
        .select('-password -__v')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments({ _id: { $ne: req.user.id } })
    ]);

    res.json({
      users,
      total,
      hasMore: total > skip + users.length,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getting initial users:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

export default router; 