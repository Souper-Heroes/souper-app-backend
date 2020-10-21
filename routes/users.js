import express from 'express';
import expressValidator from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import Geocode from 'react-geocode';
const router = express.Router();
const { body, validationResult } = expressValidator;

// @route   GET api/users
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   POST api/users
// @desc    Add a user ( extended details )
// @access  Private
router.post(
  '/',
  auth,
  // [body('postcode', 'postcode is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postcode } = req.body;

    try {
      let user = await User.findById(req.user.uid);

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        _id: req.user.uid,
        postcode
      });

      await user.save();

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/users/address
// @desc    Get the lng, lat and address for the postcode
// @access  Private
router.get('/address/:postcode', auth, async (req, res) => {

  // const Geocode = require('react-geocode');
  try {

    const geo = Geocode;
    geo.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
    geo.setLanguage('en');
    geo.enableDebug();

    // Get latitude & longitude and address from postcode
    geo.fromAddress(req.params.postcode).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        // console.log(lat, lng);
        const address = response.results[0].formatted_address;
        // console.log(address);
        res.json({ lat: { lat }, lng: { lng }, address: { address }, msg: 'Address found' });
      },
      error => {
        console.error(error);
        res.json({ msg: 'Address not found' });
        // res.status(500).send('Server Error');
      }

    );
  } catch (err) {
    console.error("Found Error: ", err.message);
    res.json({ msg: 'Address not found' });
  }
});

export default router;
