
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const register = async (req: any, res: any) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, avatar: `https://picsum.photos/seed/${name}/200` });

    // Hashing the password for security
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'skillx_secret_key', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user?.id, name, email } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'skillx_secret_key', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
