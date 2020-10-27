import express from 'express';
import expressValidator from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
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

    const { postcode, displayName, photoURL } = req.body;

    try {
      let user = await User.findById(req.user.uid);

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        _id: req.user.uid,
        postcode,
        display_name: displayName,
        profile_pic: photoURL
      });

      await user.save();

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/users
// @desc    Update a user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  const {
    display_name,
    profile_pic,
    postcode,
    address,
    location,
    preferred_distance_unit,
    preferred_distance
  } = req.body;

  try {
    let user = await User.findById(req.user.uid);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (display_name) user.display_name = display_name;
    if (profile_pic) user.profile_pic = profile_pic;
    if (postcode) user.postcode = postcode;
    if (address) user.address = address;
    if (location && location.lat && location.lng)
      user.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    if (preferred_distance_unit)
      user.preferred_distance_unit = preferred_distance_unit;
    if (preferred_distance) user.preferred_distance = preferred_distance;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
