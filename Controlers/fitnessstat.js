const express = require("express");
const router = express.Router();
const FitnessStat = require("../models/fitnessstatmodel.js");
const { isAuthenticated } = require("../middleware/auth.js");

router.post("/api/registerProgress", async (req, res) => {
  try {
    const { userid, username, stats } = req.body;

    // Check if the user already exists in the database
    let existingUser = await FitnessStat.findOne({ userid: userid });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create a new fitness stat entry for the user
    const newFitnessStat = new FitnessStat({
      userid: userid,
      username: username,
      stat: [
        {
          date: new Date(),
          progress: stats.progress,
        },
      ],
    });

    // Save the new fitness stat entry to the database
    await newFitnessStat.save();

    return res.status(201).json({
      success: true,
      message: "First day progress registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});
router.post("/api/updateprogress", async (req, res) => {
  try {
    const { userid } = req.user;
    let recieveddate = new Date(stats.date);
    recieveddate = recieveddate.getDate();
    let newdate = new Date();
    newdate = newdate.getDate();
    // console.log(recieveddate + "==" + newdate);
    if (recieveddate != newdte) {
      return res
        .status(400)
        .json({ success: false, message: "You can't modify Anyother day" });
    }
    let existingUser = await FitnessStat.findOne({ userid: userid });
    const today = new Date().setHours(0, 0, 0, 0);
    const existingProgress = existingUser.stat.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
    );
    if (existingProgress) {
      // If an entry exists for today, update its progress
      existingProgress.progress = stats.progress;
    } else {
      // If no entry exists for today, create a new progress entry
      existingUser.stat.push({
        date: new Date(),
        progress: stats.progress,
      });
    }
    // Save the updated fitness stat entry to the database
    await existingUser.save();
    return res.status(201).json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});
router.get("/api/getprogress", isAuthenticated, async (req, res) => {
  try {
    const userid = req.user._id;
    console.log(userid);
    // Fetch the user's fitness stats from the database
    let existingUser = await FitnessStat.findOne({ userid: userid });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Normalize today's date to midnight for comparison
    const today = new Date().setHours(0, 0, 0, 0);

    // Check if there is already a progress entry for today
    let existingProgress = existingUser.stat.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
    );

    if (!existingProgress) {
      // If no entry exists for today, initialize progress with zero and save
      existingUser.stat.push({
        date: new Date(),
        progress: {
          stepcovered: 0,
          caloriesburned: 0,
          activeexercise: 0,
          achievement: 0,
        },
      });
      await existingUser.save();

      existingProgress = existingUser.stat.find(
        (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today
      );
    }

    return res.status(200).json({
      success: true,
      progress: existingProgress.progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});

module.exports = router;
