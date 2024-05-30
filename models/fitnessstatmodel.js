const mongoose = require("mongoose");

const fitnessstat = new mongoose.Schema({
  userid: {
    type: mongoose.ObjectId,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Please enter name"],
  },
  stat: {
    type: [
      {
        date: { type: Date },
        progress: {
          stepcovered: Number,
          caloriesburned: Number,
          activeexercise: Number,
          achievement: Number,
        },
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FitnessStat", fitnessstat);
