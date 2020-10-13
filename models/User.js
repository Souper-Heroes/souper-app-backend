import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  _id: {
    type: String
  },
  postcode: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('user', UserSchema);
