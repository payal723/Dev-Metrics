import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.userId);
    res.json(user);
});

export default router;