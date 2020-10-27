import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  _id: {
    type: String
  },
  display_name: {
    type: String,
    required: false
  },
  profile_pic: {
    type: String,
    required: false
  },
  postcode: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  location: {
    type: { type: String },
    coordinates: []
  },
  preferred_distance_unit: {
    type: String,
    required: false
  },
  preferred_distance: {
    type: Number,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ location: '2dsphere' });

export default mongoose.model('user', UserSchema);
