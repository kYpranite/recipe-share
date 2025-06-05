import express from "express";
import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create a comment
router.post("/:recipeId", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const recipeId = req.params.recipeId;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      recipe: recipeId,
    });

    await comment.save();
    
    // Add comment to recipe's comments array
    await recipe.addComment(comment._id);
    
    await comment.populate("author", "name profilePicture _id");
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error: error.message });
  }
});

// Get comments
router.get("/recipe/:recipeId", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate("author", "name profilePicture _id")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
});

// Delete a comment
router.delete("/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove comment from recipe's comments array
    await Recipe.findByIdAndUpdate(
      comment.recipe,
      { $pull: { comments: comment._id } }
    );

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
});

// Toggle like on a comment
router.post("/:commentId/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.toggleLike(req.user.id);

    await comment.populate("author", "name profilePicture _id");

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
});

export default router;
