const express = require("express");
const path = require("path");
const usermodel = require("../models/usermodel");
const router = express.Router();
// const ErrorHandler = require("../utils/Errorhandler.js");
// const catchasyncerr = require("../middleware/catchAsyncError.js");
var jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail.js");
const multer = require("multer");
const sendToken = require("../utils/sendToken.js");
const {
  isAuthenticated,
  isAdminAuthenticated,
} = require("../middleware/auth.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destination = cb(null, "./uploads");
    console.log("destination is : ", destination);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// User Registration
router.post("/api/create-user", async (req, res, next) => {
  try {
    // console.log("API End Point Hit!");
    console.log("req.body is: ", req.body);

    const {
      full_name,
      email,
      phone,
      plantype,
      currentweight,
      height,
      dob,
      description,
      password,
    } = req.body;

    if (
      !full_name ||
      !email ||
      !phone ||
      !plantype ||
      !currentweight ||
      !height ||
      !dob ||
      !description ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill out the complete form" });
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const newUser = {
      full_name,
      email,
      phone,
      plantype,
      currentweight,
      height,
      dob,
      description,
      password,
    };
    // Save the user
    //   await newUser.save();

    // Create activation token
    const activation_token = await createActivationToken(newUser);
    if (!activation_token) {
      return res
        .status(500)
        .json({ success: false, message: "Server is experiencing problems" });
    }
    const activationUrl = `${process.env.REACT_APP_URL}/activation/${activation_token}`;
    try {
      await sendMail({
        email: newUser.email,
        subject: "Activate Your Account",
        message: `Hello ${newUser.full_name}, please click the link below to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: "Please check your email to activate your account",
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: error.message, error });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, error });
  }
});

async function createActivationToken(user) {
  try {
    const key = await jwt.sign(user, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m",
    });
    return key;
  } catch (error) {
    return false;
  }
}

// Account Activation
router.post("/api/activation", async (req, res, next) => {
  try {
    console.log("activation end point hit");
    const { activation_token } = req.body;
    // console.log(activation_token);
    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);
    if (!newUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid activation token" });
    }
    // console.log(newUser);
    const {
      full_name,
      email,
      phone,
      plantype,
      currentweight,
      height,
      dob,
      description,
      password,
    } = newUser;
    // console.log(
    //   full_name,
    //   email,
    //   phone,
    //   plantype,
    //   currentweight,
    //   height,
    //   dob,
    //   description,
    //   password
    // );
    const result = new usermodel({
      full_name,
      email,
      phone,
      plantype,
      currentweight,
      height,
      dob,
      description,
      password,
    });

    await result.save();
    const token = await result.getJwtToken();
    res.status(201).json({
      success: true,
      token,
      user: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    // console.log("api end point hit");
    const { email, password } = req.body;
    // console.log("Api End pOOint hit ", email, password);
    // console.log(req.body);
    if (!email && !password) {
      return res.status(401).json({
        success: false,
        message: "Please Enter Your Credentials Before Login",
      });
    }
    let user = await usermodel.findOne({ email: email }).select("+password");
    // console.log("user is :", user);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credenetials" });
    }
    // console.log("user is ", user);
    const validate = await user.comparePassword(password);
    console.log("bcrypt comparison result : ", validate);

    if (!validate) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }
    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong ",
      error: error.message,
    });
  }
});

router.get("/getuser", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.user);
    const user = await usermodel.findById(req.user.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }
    if (user.active === false) {
      return res
        .status(400)
        .json({ success: false, message: "User Acount Not Activate" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message, error: error });
  }
});

router.get("/user/logout", (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(0),
      httpOnly: true,
    });
    res
      .status(200)
      .json({ success: true, messaage: "User Logout Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Somethinng Went Wrong ", error });
  }
});

// isAdminAuthenticated,
// router.get("/getallusers", async (req, res, next) => {
//   try {
//     const allusers = await usermodel.find();
//     const { page } = req.query || 0;
//     let totalusers = 0;
//     // if (page == 0) {
//     totalusers = await usermodel.find({ role: "user" }).countDocuments();
//     // }
//     const userperpage = 5;
//     const users = await usermodel
//       .find({ role: "user" })
//       .skip(page * userperpage)
//       .limit(userperpage);
//     res.status(200).json({
//       success: true,
//       message: `user for page ${page}`,
//       totalusers,
//       users,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Srever Error!" });
//   }
// });
// isAdminAuthenticated,
router.put("/activateuseracount", async (req, res, next) => {
  try {
    const { userid } = req.body;
    // Fetch the user's details from the database
    let user = await usermodel.findById(userid);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the active status of the user
    user.active = true;

    // Save the updated user details to the database
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User account activated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
});
router.put("/deactivateuseracount", async (req, res, next) => {
  try {
    const { userid } = req.body;
    // Fetch the user's details from the database
    let user = await usermodel.findById(userid);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the active status of the user
    user.active = false;

    // Save the updated user details to the database
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error.message,
    });
  }
});
// Route to get all users with pagination and separate active and inactive users

router.get("/getallusers", isAdminAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = 5; // Number of users per page
    // Get active users
    const activeUsers = await usermodel
      .find({ active: true })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get inactive users
    const inactiveUsers = await usermodel
      .find({ active: false })
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total active users
    const totalActiveUsers = await usermodel.countDocuments({ active: true });
    // Count total inactive users
    const totalInactiveUsers = await usermodel.countDocuments({
      active: false,
    });
    return res.status(200).json({
      success: true,
      activeUsers,
      inactiveUsers,
      totalActiveUsers,
      totalInactiveUsers,
    });
  } catch (error) {
    console.error("Error while fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
module.exports = router;
