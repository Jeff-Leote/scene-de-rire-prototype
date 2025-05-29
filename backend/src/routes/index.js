const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const spectaclesRoutes = require("./spectacles");

router.use("/auth", authRoutes);
router.use("/spectacles", spectaclesRoutes);  // <-- ajout

module.exports = router;
