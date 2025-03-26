const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middleware/auth");
const { convertSketch } = require("../controllers/convertController");

// API endpoint for sketch to art conversion
router.post("/", auth, upload.single("sketch"), convertSketch);

module.exports = router;
