
import Session from '../models/Session';
import SkillRequest from '../models/Request';
import Resource from '../models/Resource';
import Feedback from '../models/Feedback';
import User from '../models/User';
import { Request, Response } from 'express';

// Generate a random 8-character alphanumeric passkey
const generatePasskey = () => `SKX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const handleAcceptRequest = async (req: any, res: any) => {
  const { requestId } = req.body;

  try {
    const request = await SkillRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    request.status = 'ACCEPTED';
    await request.save();

    // Create a new secure session upon acceptance
    const newSession = new Session({
      userA: request.sender,
      userB: request.receiver,
      sharedPasskey: generatePasskey()
    });

    await newSession.save();
    res.json({ msg: 'Handshake complete. Session created.', session: newSession });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const verifyPasskey = async (req: any, res: any) => {
  const { sessionId, passkey } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.sharedPasskey === passkey) {
      // Add user to verified list if they aren't already there
      if (!session.verifiedUsers.includes(req.user.id)) {
        session.verifiedUsers.push(req.user.id);
        await session.save();
      }
      return res.json({ msg: 'Access Granted', verified: true });
    } else {
      return res.status(401).json({ msg: 'Invalid Passkey', verified: false });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const addResource = async (req: any, res: any) => {
  const { sessionId, title, link } = req.body;
  try {
    const session = await Session.findById(sessionId);
    // Security check: only verified users can share resources
    if (!session || !session.verifiedUsers.includes(req.user.id)) {
       return res.status(403).json({ msg: 'Unauthorized resource access' });
    }

    const newResource = new Resource({
      sessionId,
      title,
      link,
      sharedBy: req.user.id
    });
    await newResource.save();
    res.json(newResource);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
