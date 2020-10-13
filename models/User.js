import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  user_uid: {
    type: String,
    required: true
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
