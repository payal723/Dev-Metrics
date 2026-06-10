import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // All repos fetch karo
        const reposRes = await axios.get(
            `https://api.github.com/user/repos?sort=pushed&per_page=10`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const repos = reposRes.data.filter(r => !r.fork);
        
        // Har repo ke commits fetch karo
        let allMessages = [];
        
        await Promise.all(repos.slice(0, 5).map(async (repo) => {
            try {
                const commitsRes = await axios.get(
                    `https://api.github.com/repos/${user.username}/${repo.name}/commits?per_page=20`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const messages = commitsRes.data.map(c => c.commit.message);
                allMessages = [...allMessages, ...messages];
            } catch (e) {}
        }));

        // Analyze commit messages
        const vague = ['fix', 'update', 'wip', 'test', 'misc', 'changes', 'edit', 'minor', 'temp', 'quick'];
        const good = ['feat', 'feature', 'add', 'implement', 'refactor', 'improve', 'optimize', 'docs', 'chore'];

        let vagueCount = 0;
        let goodCount = 0;
        let totalLen = 0;

        const analyzed = allMessages.map(msg => {
            const lower = msg.toLowerCase();
            const isVague = vague.some(v => lower.startsWith(v));
            const isGood = good.some(g => lower.startsWith(g));
            if (isVague) vagueCount++;
            if (isGood) goodCount++;
            totalLen += msg.length;
            return {
                message: msg.slice(0, 60),
                type: isGood ? 'good' : isVague ? 'vague' : 'neutral'
            };
        });

        const total = allMessages.length || 1;
        const avgLength = Math.round(totalLen / total);
        const qualityScore = Math.min(Math.round((goodCount / total) * 100), 100);
        const vaguePercent = Math.round((vagueCount / total) * 100);

        res.json({
            success: true,
            data: {
                qualityScore,
                vaguePercent,
                avgMessageLength: avgLength,
                totalAnalyzed: total,
                goodCount,
                vagueCount,
                recentMessages: analyzed.slice(0, 10)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;