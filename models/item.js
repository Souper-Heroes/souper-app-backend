import mongoose from 'mongoose';

const ItemSchema = mongoose.Schema({
  user_uid: {
    type: String,
    ref: 'users'
  },
  description: {
    type: String,
    required: true
  },
  expiry: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('item', ItemSchema);
