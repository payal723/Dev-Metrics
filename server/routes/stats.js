import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        const userResponse = await axios.get(
            `https://api.github.com/users/${user.username}/events?per_page=100`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pushEvents = userResponse.data.filter(e => e.type === 'PushEvent');

        const dayCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const timeSlots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
        const dateSet = new Set();

        pushEvents.forEach(event => {
            const date = new Date(event.created_at);
            dayCount[dayNames[date.getDay()]]++;
            const hour = date.getHours();
            if (hour >= 5 && hour < 12) timeSlots.Morning++;
            else if (hour >= 12 && hour < 17) timeSlots.Afternoon++;
            else if (hour >= 17 && hour < 21) timeSlots.Evening++;
            else timeSlots.Night++;
            dateSet.add(date.toISOString().split('T')[0]);
        });

        const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0];
        const mostActiveTime = Object.entries(timeSlots).sort((a, b) => b[1] - a[1])[0][0];

        const sortedDates = [...dateSet].sort((a, b) => new Date(b) - new Date(a));
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;

        const today = new Date().toISOString().split('T')[0];
        if (sortedDates[0] === today || sortedDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const diff = (new Date(sortedDates[i-1]) - new Date(sortedDates[i])) / 86400000;
                if (diff === 1) currentStreak++;
                else break;
            }
        }

        for (let i = 1; i < sortedDates.length; i++) {
            const diff = (new Date(sortedDates[i-1]) - new Date(sortedDates[i])) / 86400000;
            if (diff === 1) tempStreak++;
            else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        const streakScore = Math.min(currentStreak * 10, 40);
        const consistencyScore = Math.min(dateSet.size * 3, 40);
        const volumeScore = Math.min(pushEvents.length, 20);
        const productivityScore = streakScore + consistencyScore + volumeScore;

        res.json({
            success: true,
            data: {
                currentStreak,
                longestStreak,
                mostActiveDay,
                mostActiveTime,
                productivityScore,
                dayDistribution: dayCount,
                timeDistribution: timeSlots,
                totalActiveDays: dateSet.size
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;