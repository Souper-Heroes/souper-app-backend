import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  _id: {
    type: String
  },
  display_name: {
    type: String,
    required: true
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
    type: { type: String },
    coordinates: []
  },
  preferred_distance: {
    type: { type: Number },
    coordinates: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ location: '2dsphere' });

export default mongoose.model('user', UserSchema);
