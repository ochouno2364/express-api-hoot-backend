const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// add routes here


/// CREATE ROUTE POST
router.post("/", verifyToken, async (req, res) => {
    try {
      req.body.author = req.user._id;
      const hoot = await Hoot.create(req.body);
      hoot._doc.author = req.user;
      res.status(201).json(hoot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  /// INDEX ROUTE GET
  router.get("/", verifyToken, async (req, res) => {
    try {
      const hoots = await Hoot.find({})
        .populate("author")
        .sort({ createdAt: "desc" });
      res.status(200).json(hoots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  /// SHOW ROUTE GET
  router.get("/:hootId", verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate([
            'author',
            'comments.author',
        ]);
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });



// UPDATE ROUTE PUT

  router.put("/:hootId", verifyToken, async (req, res) => {
    try {
      // Find the hoot:
      const hoot = await Hoot.findById(req.params.hootId);
  
      // Check permissions:
      if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      // Update hoot:
      const updatedHoot = await Hoot.findByIdAndUpdate(
        req.params.hootId,
        req.body,
        { new: true }
      );
  
      // Append req.user to the author property:
      updatedHoot._doc.author = req.user;
  
      // Issue JSON response:
      res.status(200).json(updatedHoot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // DELETE ROUTE 

  router.delete('/:hootId', verifyToken, async (req, res) => {
    try {
    const hoot = await Hoot.findById(req.params.hootId);
   
   
    // check for permission
    if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");  
    }

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  })



  // COMMENTS ROUTE POST 

  router.post('/:hootId/comments', verifyToken, async (req, res) => {
    try {
    req.body.author = req.user._id
    const hoot = await Hoot.findById(req.params.hootId);
    hoots.comments.push(req.body);
    await hoot.save();

    //FIND THE NEW COMMENT 
    const newComment = hoot.comments[hoot.comments.length - 1];
    newComment._doc.author = req.user;

    // RESPOND WITH THE COMMENT
    res.status(200).json(newComment);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

  // Update comment route

  router.put("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
      const comment = hoot.comments.id(req.params.commentId);
  
      // ensures the current user is the author of the comment
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }
  
      comment.text = req.body.text;
      await hoot.save();
      res.status(200).json({ message: "Comment updated successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


  // DELETE COMMENT ROUTE

 
router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
      const comment = hoot.comments.id(req.params.commentId);
  
      // ensures the current user is the author of the comment
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }
  
      hoot.comments.remove({ _id: req.params.commentId });
      await hoot.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });








module.exports = router;
