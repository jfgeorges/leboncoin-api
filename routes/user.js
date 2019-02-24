const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
// MODEL User
const User = require("../models/User.js");

// checkUserInput
const checkUserInput = userInput => {
  // Vérifier l'existence de l'email !!!
  if (userInput.email.indexOf("@") < 0 || userInput.email.indexOf(".") < 0 || userInput.username === "" || userInput.password.length < 5) {
    return "Saisir un email valide, un username et un mot de passe de 5 caractères minimum";
  }
  return true;
};

// ROUTES
// GET ALL USERS
router.get("/user", async (req, res) => {
  try {
    res.json({ message: "Listes des Users" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE USER
router.post("/user/sign_up", async (req, res) => {
  try {
    const checkUser = checkUserInput(req.body);
    if (checkUser === true) {
      const token = uid2(16); // Création du token de 16 caractères
      const salt = uid2(16); // Création du salt de 16 caractères
      const hash = SHA256(req.body.password + salt).toString(encBase64);

      const newUser = new User({
        email: req.body.email,
        token: token,
        hash: hash,
        salt: salt,
        account: { username: req.body.username }
      });

      try {
        const savedUser = await newUser.save();
        res.json({ token: savedUser.token, account: { username: savedUser.account.username } });
      } catch (saveError) {
        res.status(500).json({ error: saveError.message }); // Erreur de sauvegarde Mongoose
      }
    } else {
      res.status(422).json({ error: checkUser }); // Saisie incorrecte de l'utilisateur
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // Autres erreurs
  }
});

// LOG_IN USER
router.post("/user/log_in", async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (userFound) {
      const hashInput = SHA256(req.body.password + userFound.salt).toString(encBase64);
      // Vérification de l'authentification
      if (hashInput === userFound.hash) {
        res.json({ token: userFound.token, account: { username: userFound.account.username } });
      } else {
        res.status(401).json({ error: "Wrong authentication" }); // Saisie incorrecte de l'utilisateur
      }
    } else {
      res.status(401).json({ error: "User not found" }); // Utilisateur non trouvé
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // Autres erreurs
  }
});

module.exports = router;
