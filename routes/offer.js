const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const uploadPictures = require("../middlewares/uploadPictures");
// MODEL Offer
const Offer = require("../models/Offer.js");

// MAKE FILTER
const createFilter = query => {
  const filter = {};
  if ((query.priceMin !== undefined && query.priceMin !== "") || (query.priceMax !== undefined && query.priceMax !== "")) {
    filter.price = {};
    if (query.priceMin) {
      filter.price["$gte"] = query.priceMin;
    }

    if (query.priceMax) {
      filter.price["$lte"] = query.priceMax;
    }
  }

  if (query.title) {
    filter.title = {
      $regex: query.title,
      $options: "i"
    };
  }
  return filter;
};
// ROUTES

// GET
router.get("/offers", async (req, res) => {
  const query = Offer.find(createFilter(req.query)).populate({
    path: "creator",
    select: "account"
  });

  if (req.query.skip !== undefined) {
    query.skip(parseInt(req.query.skip));
  }
  if (req.query.limit !== undefined) {
    query.limit(parseInt(req.query.limit));
  } else {
    // valeur par défaut de la limite
    query.limit(100);
  }

  switch (req.query.sort) {
    case "price-desc":
      query.sort({ price: -1 });
      break;
    case "price-asc":
      query.sort({ price: 1 });
      break;
    case "date-desc":
      query.sort({ created: -1 });
      break;
    case "date-asc":
      query.sort({ created: 1 });
      break;
    default:
  }

  try {
    const offers = await query;
    res.json({ count: offers.length, offers: offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUBLISH
// Vérification préalable de l'authentification de l'utilisateur
router.post("/offer/publish", isAuthenticated, uploadPictures, async (req, res) => {
  try {
    const newOffer = new Offer({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      creator: req.user,
      pictures: req.pictures
    });
    try {
      const offerSaved = await newOffer.save();

      const confirmOffer = await offerSaved.populate({ path: "creator", options: { lean: true } });
      res.json({ title: confirmOffer.title, creator: confirmOffer.creator.account.username, created: confirmOffer.created });
    } catch (saveError) {
      res.status(500).json({ error: saveError.message }); // Erreur de sauvegarde Mongoose
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // Autres erreurs
  }
});

router.get("/offer/:id", async (req, res, next) => {
  try {
    const offerSearched = await Offer.findById(req.params.id).populate({ path: "creator", select: "account" });
    if (!offerSearched) {
      res.status(404);
      return next("Not found");
    } else {
      return res.json(offerSearched);
    }
  } catch (error) {
    return next(error.message);
  }
});

module.exports = router;
