const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  token: String, // Le token permet d'authentifier l'utilisateur, il est transmis dans l'entête http/https
  hash: String,
  salt: String,

  // Création d'un objet `account` pour stocker les informations non sensibles
  account: {
    username: { type: String, required: true }
  }
});

module.exports = mongoose.model("User", UserSchema);
