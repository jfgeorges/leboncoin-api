const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json("Welcome to leBonCoin !");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
