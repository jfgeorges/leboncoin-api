require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // L'upload est fixée à 50mb maximum (pour l'envoi de fichiers)
app.use(compression());
app.use(helmet());

mongoose.connect(process.env.LOCAL_DB, { useNewUrlParser: true });

const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
app.use(homeRoutes);
app.use(userRoutes);
app.use(offerRoutes);

// Toutes les méthodes HTTP (GET, POST, etc.) des pages non trouvées afficheront une erreur 404
app.all("*", (req, res) => {
  res.status(404).json({ error: "Page Not Found" });
});

app.listen(process.env.LOCAL_SERVER, () => {
  console.log(`Server LeBonCoin started on port ${process.env.LOCAL_SERVER}.`);
});
