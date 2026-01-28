
import express from 'express';
import { register, login } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { handleAcceptRequest, verifyPasskey, addResource } from '../controllers/sessionController';
import User from '../models/User';
import SkillRequest from '../models/Request';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);

// --- Profile & Discovery ---
// Fix: Using any for req and res to ensure compatibility with fixed authMiddleware
router.get('/profile', authMiddleware, async (req: any, res: any) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.get('/users/search', authMiddleware, async (req: any, res: any) => {
  const { skill } = req.query;
  const users = await User.find({ 
    skillsOffered: { $regex: skill as string, $options: 'i' },
    _id: { $ne: req.user.id } 
  });
  res.json(users);
});

// --- Request Handshake ---
router.post('/request/send', authMiddleware, async (req: any, res: any) => {
  const { receiverId, skill } = req.body;
  const newReq = new SkillRequest({
    sender: req.user.id,
    receiver: receiverId,
    requestedSkill: skill
  });
  await newReq.save();
  res.json(newReq);
});

router.post('/request/accept', authMiddleware, handleAcceptRequest as any);

// --- Session Control ---
router.post('/session/verify', authMiddleware, verifyPasskey as any);
router.post('/session/resource', authMiddleware, addResource as any);

export default router;
