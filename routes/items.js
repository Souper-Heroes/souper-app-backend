import express from 'express';
import expressValidator from 'express-validator';
import auth from '../middleware/auth.js';
import Item from '../models/item.js';
const router = express.Router();
const { body, validationResult } = expressValidator;

// @route   GET api/items
// @desc    Get all items
// @access  Private
router.get('/', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    const items = await Item.find().sort({
      date: -1
    });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items
// @desc    Get logged in user items
// @access  Private
router.get('/:user_id', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    // because we are using auth middleware we have access to that request - req.user.id
    const items = await Item.find({ user_uid: req.user.uid }).sort({
      date: -1
    });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/items
// @desc    Add new item
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('expiry', 'Expiry is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, expiry } = req.body;

    try {
      const newItem = new Item({
        user_uid: req.user.uid,
        description,
        expiry
      });

      const item = await newItem.save();

      res.json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { description, expiry } = req.body;

  // build contact object
  const itemFields = {};
  if (description) itemFields.description = description;
  if (expiry) itemFields.expiry = expiry;

  try {
    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    //Make sure user owns item
    if (item.user_uid !== req.user.uid) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Make sure user owns item
    if (item.user_uid !== req.user.uid) {
      return res.status(401).json({ msg: 'Not authorised' });
    }

    await Item.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
