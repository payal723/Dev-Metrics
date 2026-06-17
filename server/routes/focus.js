import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/focus - Context switching and focus analysis
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get last 100 push events
        const eventsRes = await axios.get(
            `https://api.github.com/users/${user.username}/events/public?per_page=100`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');

        // ---- Context Switching Analysis ----
        // Track repo switches within sessions (events within 2 hours of each other = same session)
        let contextSwitches = 0;
        let currentRepo = null;
        let sessionStart = null;
        let sessions = [];
        let currentSession = { repos: new Set(), start: null, end: null, commits: 0 };
        const SESSION_GAP_MS = 2 * 60 * 60 * 1000; // 2 hours

        const sortedEvents = [...pushEvents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        for (const event of sortedEvents) {
            const eventTime = new Date(event.created_at);
            const repoName = event.repo.name;
            const commitCount = event.payload.distinct_size || event.payload.size || 1;

            if (!currentSession.start || (eventTime - currentSession.end) > SESSION_GAP_MS) {
                // New session
                if (currentSession.start) sessions.push({ ...currentSession, repos: currentSession.repos.size });
                currentSession = { repos: new Set([repoName]), start: eventTime, end: eventTime, commits: commitCount };
                currentRepo = repoName;
            } else {
                // Same session
                currentSession.end = eventTime;
                currentSession.commits += commitCount;
                if (!currentSession.repos.has(repoName)) {
                    currentSession.repos.add(repoName);
                    if (currentRepo && currentRepo !== repoName) {
                        contextSwitches++;
                    }
                }
                currentRepo = repoName;
            }
        }
        if (currentSession.start) sessions.push({ ...currentSession, repos: currentSession.repos.size });

        // ---- Repo focus distribution ----
        const repoStats = {};
        pushEvents.forEach(e => {
            const name = e.repo.name.split('/')[1] || e.repo.name;
            if (!repoStats[name]) repoStats[name] = { commits: 0, pushes: 0 };
            repoStats[name].commits += e.payload.distinct_size || e.payload.size || 1;
            repoStats[name].pushes += 1;
        });

        const totalPushes = pushEvents.length;
        const repoFocus = Object.entries(repoStats)
            .map(([name, stats]) => ({
                name,
                ...stats,
                percentage: Math.round((stats.pushes / totalPushes) * 100)
            }))
            .sort((a, b) => b.pushes - a.pushes)
            .slice(0, 6);

        const reposTouched = Object.keys(repoStats).length;
        const avgFocusDuration = sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + ((s.end - s.start) / (1000 * 60 * 60)), 0) / sessions.length * 10) / 10
            : 0;

        // ---- Calculate Focus Score (0-100) ----
        // Higher score = more focused (fewer context switches, deeper focus on fewer repos)
        let focusScore = 50;

        // Deduct for context switching (each switch above 3 per 100 pushes = -5)
        const switchRate = totalPushes > 0 ? (contextSwitches / totalPushes) * 100 : 0;
        if (switchRate > 10) focusScore -= 20;
        else if (switchRate > 5) focusScore -= 10;
        else focusScore += 10;

        // Deduct for too many repos (more than 5 = scattered attention)
        if (reposTouched > 8) focusScore -= 15;
        else if (reposTouched > 5) focusScore -= 5;
        else focusScore += 10;

        // Bonus for long sessions (deep work)
        const longSessions = sessions.filter(s => (s.end - s.start) > 60 * 60 * 1000).length;
        if (longSessions > sessions.length * 0.3) focusScore += 10;

        // Bonus for commits per session (density)
        const avgCommitsPerSession = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.commits, 0) / sessions.length
            : 0;
        if (avgCommitsPerSession > 3) focusScore += 5;

        focusScore = Math.max(0, Math.min(100, focusScore));

        // ---- Generate Insights ----
        let primaryInsight = '';
        let recommendation = '';

        if (focusScore >= 80) {
            primaryInsight = 'Deep focus mode detected';
            recommendation = 'You maintain excellent focus with minimal context switching. Your long coding sessions show strong deep work habits.';
        } else if (focusScore >= 50) {
            primaryInsight = `Context switching ${switchRate > 5 ? 'frequent' : 'moderate'}`;
            recommendation = switchRate > 5
                ? `You switched repos ${contextSwitches} times across ${sessions.length} sessions. Try time-blocking to stay on one project longer.`
                : 'Good balance of focus and variety. Consider batching similar tasks to improve flow state.';
        } else {
            primaryInsight = 'Highly fragmented work pattern';
            recommendation = `You touched ${reposTouched} repos with ${contextSwitches} context switches. Pick 2-3 priority repos and dedicate focused blocks to each.`;
        }

        res.json({
            success: true,
            data: {
                focusScore,
                contextSwitches,
                reposTouched,
                totalSessions: sessions.length,
                avgFocusDuration,
                primaryInsight,
                recommendation,
                repoFocus,
                switchRate: Math.round(switchRate * 10) / 10
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;