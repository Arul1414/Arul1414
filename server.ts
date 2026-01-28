
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();

// Middleware
// Fix: Using (app as any).use to bypass type mismatches with Express middleware in this environment
(app as any).use(express.json()); // Body parser for JSON
(app as any).use(cors()); // Enable Cross-Origin Resource Sharing

// Database Connection (Mock URL for documentation)
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillx';
mongoose.connect(dbURI)
  .then(() => console.log('SkillX: MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
(app as any).use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 SKILLX SERVER RUNNING
  -----------------------
  Port: ${PORT}
  Status: Operational
  Architecture: RESTful / MERN
  -----------------------
  `);
});
