const express = require("express");
const path = require("path");
const dietplanmodel = require("../models/dietplanmodel");
const { isAdminAuthenticated } = require("../middleware/auth");
const router = express.Router();
// isAdminAuthenticated,
router.post("/api/dietregister", isAdminAuthenticated, async (req, res) => {
  try {
    const { name, dietplan } = req.body;
    if (!name || !dietplan) {
      return res
        .status(400)
        .json({ success: false, message: "PLease Fill All required Fields" });
    }
    await dietplanmodel.create({ name, dietplan });
    return res
      .status(200)
      .json({ success: true, message: "Diet Plan Registered Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
});

router.delete(
  "/api/deletediet/:name",
  isAdminAuthenticated,
  async (req, res) => {
    try {
      const { name } = req.params;
      console.log(name);
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "No Diet Plan Found" });
      }
      await dietplanmodel.findOneAndDelete({ name: name });
      return res
        .status(200)
        .json({ success: true, message: "Diet Plan Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({
        success: true,
        message: "Something Went Wrong",
        error: error.message,
      });
    }
  }
);
router.get("/api/dietplans", async (req, res) => {
  try {
    const dietPlans = await dietplanmodel.find();
    if (!dietPlans || dietPlans.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Diet Plans Found" });
    }
    return res.status(200).json({
      success: true,
      message: "Diet Plans Retrieved Successfully",
      dietplans: dietPlans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
});

module.exports = router;
