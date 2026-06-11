import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import Sprint from '../models/Sprint.js';

const router = express.Router();

// Get current week's sprint + computed progress
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        let sprint = await Sprint.findOne({
            user: req.userId,
            weekStart: { $gte: weekStart },
            weekEnd: { $lte: weekEnd }
        });

        // Auto-create sprint if none exists
        if (!sprint) {
            sprint = await Sprint.create({
                user: req.userId,
                weekStart,
                weekEnd,
                goals: { targetActiveDays: 5, targetCommits: 15, targetRepos: 2 }
            });
        }

        // Fetch real GitHub data for progress calculation
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        const eventsRes = await axios.get(
            `https://api.github.com/users/${user.username}/events/public?per_page=100`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');
        
        // Filter to current week only
        const weekPushEvents = pushEvents.filter(e => {
            const eventDate = new Date(e.created_at);
            return eventDate >= weekStart && eventDate <= weekEnd;
        });

        // Calculate actual progress
        const activeDaysSet = new Set();
        const reposSet = new Set();
        let totalCommits = 0;

        weekPushEvents.forEach(e => {
            const date = e.created_at.split('T')[0];
            activeDaysSet.add(date);
            reposSet.add(e.repo.name);
            totalCommits += e.payload.distinct_size || e.payload.size || 1;
        });

        const progress = {
            actualActiveDays: activeDaysSet.size,
            actualCommits: totalCommits,
            actualRepos: reposSet.size,
            targetActiveDays: sprint.goals.targetActiveDays,
            targetCommits: sprint.goals.targetCommits,
            targetRepos: sprint.goals.targetRepos,
            activeDaysPercent: Math.min(Math.round((activeDaysSet.size / sprint.goals.targetActiveDays) * 100), 100),
            commitsPercent: Math.min(Math.round((totalCommits / sprint.goals.targetCommits) * 100), 100),
            reposPercent: Math.min(Math.round((reposSet.size / sprint.goals.targetRepos) * 100), 100),
            reposContributed: Array.from(reposSet),
            daysLeft: Math.max(0, Math.ceil((weekEnd - now) / 86400000))
        };

        // Overall health score
        const avgProgress = (progress.activeDaysPercent + progress.commitsPercent + progress.reposPercent) / 3;
        let healthStatus = 'on_track';
        if (avgProgress >= 80) healthStatus = 'on_track';
        else if (avgProgress >= 50) healthStatus = 'at_risk';
        else healthStatus = 'behind';

        const daysElapsed = 7 - progress.daysLeft;
        const expectedProgress = daysElapsed > 0 ? Math.min((daysElapsed / 7) * 100, 100) : 0;
        const paceStatus = avgProgress >= expectedProgress ? 'ahead' : 'behind_schedule';

        res.json({
            success: true,
            data: {
                sprint,
                progress,
                healthStatus,
                paceStatus,
                overallPercent: Math.round(avgProgress)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update sprint goals
router.put('/goals', authMiddleware, async (req, res) => {
    try {
        const { targetActiveDays, targetCommits, targetRepos } = req.body;
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const sprint = await Sprint.findOneAndUpdate(
            { user: req.userId, weekStart: { $gte: weekStart }, weekEnd: { $lte: weekEnd } },
            { 
                goals: { 
                    targetActiveDays: Math.min(Math.max(targetActiveDays, 1), 7), 
                    targetCommits: Math.max(targetCommits, 1), 
                    targetRepos: Math.max(targetRepos, 1) 
                } 
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: sprint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;