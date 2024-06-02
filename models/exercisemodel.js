const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  plantype: {
    type: String,
    enum: ["lose-weight", "gain-weight", "fitness"], // Improved enum values
    required: [true, "Please select a Plan Type!"],
  },
  stepcovered: {
    type: Number,
    required: [true, "Please enter the steps covered!"],
  },
  caloriesburned: {
    type: Number,
    required: [true, "Please enter the calories burned!"],
  },
  activeexercise: {
    type: Number,
    required: [true, "Please enter the active exercise duration in minutes!"],
  },
});

module.exports = mongoose.model("Exercise", userProfileSchema);
