import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import axios from 'axios';

const router = express.Router();

router.get('/heatmap', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const accessToken = user.accessToken;

        const userResponse = await axios.get(
            `https://api.github.com/users/${user.username}/events/public?per_page=100`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const pushEvents = userResponse.data.filter(
            event => event.type === 'PushEvent'
        );

        const heatmapData = {};

        pushEvents.forEach(event => {
            const date = event.created_at.split('T')[0];

const commitCount = event.payload.distinct_size || event.payload.size || 1;
            console.log(JSON.stringify(pushEvents[0]?.payload, null, 2));


            heatmapData[date] =
                (heatmapData[date] || 0) + commitCount;
        });

        res.json({
            success: true,
            data: heatmapData
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;