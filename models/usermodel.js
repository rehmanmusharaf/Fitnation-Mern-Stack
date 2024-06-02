const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, "Please enter your Full Name!"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your Email!"],
    validate: {
      validator: function (v) {
        return emailRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: {
    type: String, // Changed from Number to String
    required: [true, "Please enter your Phone Number!"],
  },
  plantype: {
    type: String,
    enum: ["lose-weight", "gain-weight", "fitness"], // Improved enum values
    required: [true, "Please select a Plan Type!"],
  },
  currentweight: {
    type: Number,
    required: [true, "Please enter your Weight!"],
  },
  gainupto: {
    type: Number,
    required: [true, "Please Enter The gain Weight"],
  },
  looseupto: {
    type: Number,
    required: [true, "Please Enter The gain Weight"],
  },
  height: {
    type: Number,
    required: [true, "Please enter your Height!"],
  },
  dob: {
    type: Date,
    required: [true, "Please enter your Date of Birth!"],
  },
  description: {
    type: String,
    required: [true, "Please enter a Description!"],
  },
  password: {
    type: String,
    required: [true, "Please enter a Password!"],
    select: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "user",
  },
  startdate: {
    type: Date,
  },
  enddate: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT token
userSchema.methods.getJwtToken = async function () {
  try {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY);
    return token;
  } catch (error) {
    console.error("Error during token generation", error);
    throw error;
  }
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
