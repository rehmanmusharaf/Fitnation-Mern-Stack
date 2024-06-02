const express = require("express");
const router = express.Router();
const Exercise = require("../models/exercisemodel");
const { isAuthenticated, isAdminAuthenticated } = require("../middleware/auth");

// Store Exercise Route
router.post("/registerexercise", isAdminAuthenticated, async (req, res) => {
  try {
    // console.log("APi End POINT Hit!");
    const { plantype, stepcovered, caloriesburned, activeexercise } = req.body;

    const exercise = new Exercise({
      plantype,
      stepcovered,
      caloriesburned,
      activeexercise,
    });

    await exercise.save();

    res.status(201).json({
      success: true,
      message: "Exercise data stored successfully!",
      exercise,
    });
  } catch (error) {
    console.error("Error storing exercise data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/getexercise", isAuthenticated, async (req, res) => {
  try {
    const exercises = await Exercise.findOne({ plantype: req.user.plantype });
    res.json({ success: true, exercises });
  } catch (error) {
    console.error("Error fetching exercise data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update Exercise Route
router.put("/updateexercise/:id", isAdminAuthenticated, async (req, res) => {
  try {
    const { plantype, stepcovered, caloriesburned, activeexercise } = req.body;
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        plantype,
        stepcovered,
        caloriesburned,
        activeexercise,
      },
      { new: true }
    );

    if (!exercise) {
      return res
        .status(404)
        .json({ success: false, message: "Exercise not found" });
    }

    res.json({
      success: true,
      message: "Exercise data updated successfully!",
      exercise,
    });
  } catch (error) {
    console.error("Error updating exercise data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Delete Exercise Route
router.delete("/deleteexercise/:id", isAdminAuthenticated, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return res
        .status(404)
        .json({ success: false, message: "Exercise not found" });
    }

    res.json({ success: true, message: "Exercise deleted successfully!" });
  } catch (error) {
    console.error("Error deleting exercise data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
