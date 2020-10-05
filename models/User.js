import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  user_uid: {
    type: String,
    retquired: true
  },
  postcode: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('user', UserSchema);
