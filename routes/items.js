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
      date: -1,
    });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items/search
// @desc    Get all items filtered by search params
// @access  Private
router.get('/search', auth, async (req, res) => {
  // const { long, latt, maxDistance } = req.body;

  try {
    Item.find({
      location: {
        $near: {
          $maxDistance: 4000,
          $geometry: {
            type: 'Point',
            coordinates: [51.57415, 0.18387],
          },
        },
      },
    }).find((error, results) => {
      if (error) console.log(error);
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items
// @desc    Get all items
// @access  Private
router.get('/:user_id', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    const items = await Item.find({
      $or: [{ user_uid: req.user.uid }, { c_user_uid: req.user.uid }],
    }).sort({
      date: -1,
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
router.get('/provider/:user_uid', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    // because we are using auth middleware we have access to that request - req.user.id
    const items = await Item.find({ user_uid: req.user.uid }).sort({
      date: -1,
    });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/collector/:c_user_uid', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    // because we are using auth middleware we have access to that request - req.user.id
    const items = await Item.find({ c_user_uid: req.user.uid }).sort({
      date: -1,
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
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('category', 'Category is required').not().isEmpty(),
      body('expiry', 'Expiry is required').not().isEmpty(),
      body('postcode', 'Postcode is required').not().isEmpty(),
      body('location', 'Location is required').not().isEmpty(),
      body('availability', 'Availability is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      c_user_uid,
      title,
      description,
      category,
      expiry,
      postcode,
      location,
      availability,
    } = req.body;

    try {
      const newItem = new Item({
        user_uid: req.user.uid,
        c_user_uid,
        title,
        description,
        category,
        expiry,
        postcode,
        location,
        availability,
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
  const { description, expiry, c_user_uid, postcode } = req.body;

  // build contact object
  const itemFields = {};
  if (description) itemFields.description = description;
  if (expiry) itemFields.expiry = expiry;
  if (c_user_uid) itemFields.c_user_uid = c_user_uid;
  if (postcode) itemFields.postcode = postcode;
  // if (user_uid) itemFields.c_user_uid = user_uid;

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

// @route   PUT api/reserve/:id
// @desc    Reserve item
// @access  Private
router.put('/reserve/:id', auth, async (req, res) => {
  //const { description, expiry, c_user_uid } = req.body;

  // build contact object
  //const itemFields = {};
  //if (description) itemFields.description = description;
  //if (expiry) itemFields.expiry = expiry;
  //if (req.user.uid) itemFields.c_user_uid = req.user.uid;

  try {
    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    //Make sure item not already reserved by someone else
    //req.user.uid
    if (item.c_user_uid !== null) {
      return res.status(401).json({ msg: 'Item aleady reserved' });
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true } // TODO what should this be set to ?
    );

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/unreserve/:id
// @desc    Unreserve item
// @access  Private
router.put('/unreserve/:id', auth, async (req, res) => {
  try {
    //const itemFields = {};
    //if (req.user.uid) itemFields.c_user_uid = null;

    //console.log('UNRESERVE params:');
    //console.log('UNRESERVE params:', req.params);

    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    //console.log('MY ITEM:', item);

    //Make sure item not already reserved by someone else
    //req.user.uid
    if (item.c_user_uid === null) {
      return res.status(401).json({ msg: 'Item already unreserved' });
    }

    if (item.c_user_uid !== req.user.uid) {
      return res.status(402).json({ msg: 'Not Authorized' });
    }

    item.c_user_uid = null;
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: item },
      { new: true } // TODO what should this be set to ?
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
