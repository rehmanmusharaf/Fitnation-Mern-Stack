const mongoose = require("mongoose");

const dietSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please enter Plan Type"],
    enum: {
      values: ["loose-weight", "gain-weight", "fitness"],
      message: "Plan type must be either loose-weight, gain-weight, or fitness",
    },
  },
  dietplan: {
    type: {
      morning: {
        name: { type: String, required: true },
        description: { type: String, required: true },
      },
      afternoon: {
        name: { type: String, required: true },
        description: { type: String, required: true },
      },
      evening: {
        name: { type: String, required: true },
        description: { type: String, required: true },
      },
    },
    required: [true, "Please enter your Plan"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DietPlan", dietSchema);
