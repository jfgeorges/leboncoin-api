const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const userFound = await User.findOne({ token: req.headers.authorization.replace("Bearer ", "") });
      if (userFound) {
        req.user = userFound;
        return next();
      } else {
        res.status(401).json({ error: "User not found" }); // Utilisateur non trouvé
      }
    } catch (error) {
      res.status(400).json({ error: error.message }); // Autres erreurs
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
