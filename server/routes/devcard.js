import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get user profile
        const profileRes = await axios.get(
            `https://api.github.com/users/${user.username}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Get events for stats
        const eventsRes = await axios.get(
            `https://api.github.com/users/${user.username}/events/public?per_page=100`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');
        
        // Calculate stats
        const dateSet = new Set();
        const repoSet = new Set();
        let totalCommits = 0;
        
        pushEvents.forEach(e => {
            dateSet.add(e.created_at.split('T')[0]);
            repoSet.add(e.repo.name);
            totalCommits += e.payload.distinct_size || e.payload.size || 1;
        });

        // Get top languages from repos
        const reposRes = await axios.get(
            `https://api.github.com/user/repos?sort=pushed&per_page=20`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        const langCount = {};
        reposRes.data.forEach(r => {
            if (r.language) {
                langCount[r.language] = (langCount[r.language] || 0) + 1;
            }
        });
        const topLangs = Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name]) => name);

        // Calculate streak
        const sortedDates = [...dateSet].sort((a, b) => new Date(b) - new Date(a));
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const diff = (new Date(sortedDates[i-1]) - new Date(sortedDates[i])) / 86400000;
                if (diff === 1) currentStreak++;
                else break;
            }
        }

        const profile = profileRes.data;

        res.json({
            success: true,
            data: {
                username: user.username,
                displayName: profile.name || user.username,
                avatarUrl: profile.avatar_url,
                bio: profile.bio || '',
                totalCommits,
                activeDays: dateSet.size,
                reposContributed: repoSet.size,
                currentStreak,
                topLangs,
                followers: profile.followers,
                publicRepos: profile.public_repos,
                joinDate: profile.created_at.split('T')[0]
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;