
import mongoose from 'mongoose';

// User Schema: Stores profile, authentication, and reputation data
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed via bcrypt
  skillsOffered: [{ type: String }],
  skillsRequired: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
