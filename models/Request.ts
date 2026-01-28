
import mongoose from 'mongoose';

// Request Schema: Tracks the "Handshake" between two users
const RequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedSkill: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'], 
    default: 'PENDING' 
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('SkillRequest', RequestSchema);
