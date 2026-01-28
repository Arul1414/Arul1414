
import mongoose from 'mongoose';

// Resource Schema: Files or links shared during a session
const ResourceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  title: { type: String, required: true },
  link: { type: String, required: true }, // Path to file or external URL
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Resource', ResourceSchema);
