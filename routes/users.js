import express from 'express';
import expressValidator from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
const router = express.Router();
const { body, validationResult } = expressValidator;

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ user_uid: req.user.uid }).select(
      '-password'
    );
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
  [body('postcode', 'postcode is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postcode } = req.body;

    try {
      let user = await User.findOne({ user_uid: req.user.uid });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        user_uid: req.user.uid,
        postcode
      });

      await user.save();

      res.json({ msg: 'user extended details created' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

export default router;
