import mongoose from 'mongoose';

const ItemSchema = mongoose.Schema({
  user_uid: {
    type: String,
    ref: 'users',
    required: true
  },
  c_user_uid: {
    type: String,
    ref: 'users'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: [String],
    required: true
  },
  photo: {
    type: String,
    required: false
  },
  expiry: {
    type: Date,
    required: true
  },
  location: {
    type: { type: String },
    coordinates: []
  },
  availability: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

ItemSchema.index({ location: '2dsphere' });

export default mongoose.model('item', ItemSchema);
