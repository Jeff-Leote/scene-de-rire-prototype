const express = require("express");
const router = express.Router();

const { router: authRoutes } = require("./auth");
const spectaclesRoutes = require("./spectacles");
const artistesRoutes = require("./artistes");
const adminRoutes = require("./admin");
const lieuRoutes = require("./lieu");
const contactRoutes = require("./contact");
const photosRoutes = require("./photos");
const publicSettingsRoutes = require("./publicSettings");

router.use("/auth", authRoutes);
router.use("/spectacles", spectaclesRoutes);  // <-- ajout
router.use("/artistes", artistesRoutes);
router.use("/admin", adminRoutes);
router.use("/lieu", lieuRoutes);
router.use("/photos", photosRoutes);
router.use("/settings", publicSettingsRoutes);
router.use("/contact", contactRoutes);

module.exports = router;
