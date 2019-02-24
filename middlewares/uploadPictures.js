const User = require("../models/User");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const uploadAsync = async (user, picturesArray, req, res, next) => {
  const uploadedPictures = []; // contient les liens vers les photos uploadées
  let nbPicturesOnCloudinary = 0;
  await asyncForEach(picturesArray, async pictureEnc64 => {
    const pictureName = uid2(16);
    try {
      // Appel API Cloudinary
      const result = await cloudinary.uploader.upload(pictureEnc64, {
        // Création d'un dossier spécifique pour chaque utilisateur
        public_id: `leboncoin/${user._id}/${pictureName}`
      });
      uploadedPictures.push(result);
      nbPicturesOnCloudinary++;
      if (nbPicturesOnCloudinary === picturesArray.length) {
        req.pictures = uploadedPictures;
        next();
      }
    } catch (error) {
      return res.status(500).json({ error });
    }
  });
};

const uploadPictures = async (req, res, next) => {
  if (req.body.pictures && req.body.pictures.length > 0) {
    await uploadAsync(req.user, req.body.pictures, req, res, next);
  } else {
    next();
  }
};

module.exports = uploadPictures;
