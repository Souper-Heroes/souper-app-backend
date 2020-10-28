import express from 'express';
import expressValidator from 'express-validator';
import auth from '../middleware/auth.js';
import Item from '../models/item.js';
import moment from 'moment';

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

// @route   GET api/items/search
// @desc    Get all items filtered by search params
// @access  Private

router.get('/search', auth, async (req, res) => {
  const {
    lat,
    long,
    maxDistance,
    category,
    expiry,
    sortBy,
    limit,
    page
  } = req.query;

  try {
    const query = { c_user_uid: null };
    category && category.length ? (query.category = { $in: category }) : '';
    expiry && expiry.length ? (query.expiry = { $gte: new Date(expiry) }) : '';
    const skipDocuments = (page - 1) * limit;
    const geoSpatialQuery = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(long), Number(lat)]
        },
        distanceField: 'distance',
        maxDistance: Number(maxDistance),
        query,
        spherical: true
      }
    };

    const items = await Item.aggregate([
      geoSpatialQuery,
      { $sort: sortBy.length ? JSON.parse(sortBy) : { distance: 1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: Number(skipDocuments) },
            { $limit: Number(limit) }
          ],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ]).exec();

    res.json(items);
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
      $or: [{ user_uid: req.user.uid }, { c_user_uid: req.user.uid }]
    }).sort({
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
router.get('/provider/:user_uid', auth, async (req, res) => {
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

router.get('/collector/:c_user_uid', auth, async (req, res) => {
  // res.send('Get all items');
  try {
    // because we are using auth middleware we have access to that request - req.user.id
    const items = await Item.find({ c_user_uid: req.user.uid }).sort({
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
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('category'),
      body('expiry', 'Expiry is required').not().isEmpty(),
      body('postcode', 'Postcode is required').not().isEmpty(),
      body('address', 'Address is required').not().isEmpty(),
      body('location', 'Location is required').not().isEmpty(),
      body('availability', 'Availability is required').not().isEmpty()
    ]
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
      address,
      location,
      availability
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
        address,
        location,
        availability
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
  const {
    description,
    expiry,
    c_user_uid,
    postcode,
    address,
    category,
    availability,
    title
  } = req.body;

  // build contact object
  const itemFields = {};
  if (description) itemFields.description = description;
  if (expiry) itemFields.expiry = expiry;
  if (c_user_uid) itemFields.c_user_uid = c_user_uid;
  if (postcode) itemFields.postcode = postcode;
  if (address) itemFields.address = address;
  if (category) itemFields.category = category;
  if (availability) itemFields.availability = availability;
  if (title) itemFields.title = title;

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
  try {
    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Make sure item not already reserved by someone else
    // req.user.uid
    if (item.c_user_uid !== null) {
      return res.status(401).json({ msg: 'Item aleady reserved' });
    }

    item.c_user_uid = req.user.uid;
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: item },
      { new: true }
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
    let item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Make sure item not already unreserved by someone else
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

// @route   DELETE api/items/expired
// @desc    Delete expired items for user
// @access  Private
router.delete('/expired/:id', auth, async (req, res) => {
  try {
    var today = moment(new Date()).format('YYYY-MM-DD[T00:00:00.000Z]');
    // console.log("Deleting items less than today:", today, "userId:", req.user.uid);

    await Item.deleteMany({
      c_user_uid: req.user.uid,
      expiry: {
        $lt: new Date(today)
      }
    });

    res.json({ msg: 'Expired items removed for user' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
