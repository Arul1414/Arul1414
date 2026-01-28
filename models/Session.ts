
import mongoose from 'mongoose';

// Session Schema: Represents the locked learning environment
const SessionSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedPasskey: { type: String, required: true }, // e.g., SKX-4RT2Y
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  verifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who entered correct passkey
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Session', SessionSchema);
