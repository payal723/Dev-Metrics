import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get last 300 events for deep analysis
        const eventsRes = await axios.get(
            `https://api.github.com/users/${user.username}/events/public?per_page=100`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');
        const allEvents = eventsRes.data;

        const insights = [];

        // ---- INSIGHT 1: Peak Productivity Day ----
        const dayCount = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        pushEvents.forEach(e => {
            const date = new Date(e.created_at);
            dayCount[dayNames[date.getDay()]]++;
        });
        
        const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
        const worstDay = Object.entries(dayCount).sort((a, b) => a[1] - b[1])[0];
        
        if (bestDay[1] > 0) {
            const total = Object.values(dayCount).reduce((a, b) => a + b, 0);
            const bestDayPercent = Math.round((bestDay[1] / total) * 100);
            insights.push({
                type: 'productivity',
                icon: 'zap',
                title: `Peak Performance Day`,
                message: `You push ${bestDayPercent}% of your code on ${bestDay[0]}s. ${bestDay[0]} is your superpower day.`,
                severity: 'positive',
                metric: `${bestDay[1]} pushes`
            });
        }

        // ---- INSIGHT 2: Coding Hour Pattern ----
        const hourBuckets = new Array(24).fill(0);
        pushEvents.forEach(e => {
            const hour = new Date(e.created_at).getHours();
            hourBuckets[hour]++;
        });
        
        const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
        const lateNightCommits = hourBuckets.slice(0, 6).reduce((a, b) => a + b, 0);
        const totalCommits = pushEvents.length;
        
        const peakTimeLabel = peakHour < 12 ? `${peakHour} AM` : `${peakHour - 12} PM`;
        
        insights.push({
            type: 'pattern',
            icon: 'clock',
            title: `Prime Coding Hour`,
            message: `Your brain fires best at ${peakTimeLabel}. That's when you push the most code.`,
            severity: 'positive',
            metric: `${hourBuckets[peakHour]} pushes`
        });

        if (lateNightCommits > totalCommits * 0.3) {
            insights.push({
                type: 'health',
                icon: 'moon',
                title: `Late Night Coder`,
                message: `${Math.round((lateNightCommits/totalCommits)*100)}% of your commits are between midnight and 6 AM. Consider better sleep habits.`,
                severity: 'warning',
                metric: `${lateNightCommits} late commits`
            });
        }

        // ---- INSIGHT 3: Consistency Score ----
        const dateSet = new Set();
        pushEvents.forEach(e => dateSet.add(e.created_at.split('T')[0]));
        const uniqueDays = dateSet.size;
        const last30Days = 30;
        const consistencyRate = Math.round((uniqueDays / last30Days) * 100);
        
        if (consistencyRate > 70) {
            insights.push({
                type: 'consistency',
                icon: 'flame',
                title: `Consistency Champion`,
                message: `You coded on ${uniqueDays} of the last 30 days. That's elite-level consistency.`,
                severity: 'positive',
                metric: `${consistencyRate}% consistency`
            });
        } else if (consistencyRate < 30) {
            insights.push({
                type: 'consistency',
                icon: 'alert',
                title: `Consistency Gap`,
                message: `Only ${uniqueDays} active coding days in the last 30. Try sprint goals to build a habit.`,
                severity: 'negative',
                metric: `${consistencyRate}% consistency`
            });
        }

        // ---- INSIGHT 4: Repository Concentration ----
        const repoCount = {};
        pushEvents.forEach(e => {
            const repoName = e.repo.name.split('/')[1];
            repoCount[repoName] = (repoCount[repoName] || 0) + 1;
        });
        
        const repoEntries = Object.entries(repoCount).sort((a, b) => b[1] - a[1]);
        if (repoEntries.length >= 2) {
            const topRepoShare = Math.round((repoEntries[0][1] / totalCommits) * 100);
            if (topRepoShare > 60) {
                insights.push({
                    type: 'focus',
                    icon: 'target',
                    title: `Deep Focus Mode`,
                    message: `${topRepoShare}% of your work is in ${repoEntries[0][0]}. Deep focus is good, but diversify to grow.`,
                    severity: 'warning',
                    metric: `${repoEntries.length} repos`
                });
            } else {
                insights.push({
                    type: 'focus',
                    icon: 'git-branch',
                    title: `Well Balanced`,
                    message: `Your work is spread across ${repoEntries.length} repositories. Great for learning.`,
                    severity: 'positive',
                    metric: `${repoEntries.length} active repos`
                });
            }
        }

        // ---- INSIGHT 5: Weekend Warrior Check ----
        const weekendPushes = pushEvents.filter(e => {
            const day = new Date(e.created_at).getDay();
            return day === 0 || day === 6;
        }).length;
        
        if (weekendPushes === 0 && totalCommits > 10) {
            insights.push({
                type: 'health',
                icon: 'coffee',
                title: `Healthy Boundaries`,
                message: `No weekend commits detected. You maintain a healthy work-life balance. Respect.`,
                severity: 'positive',
                metric: '0 weekend pushes'
            });
        } else if (weekendPushes > 10) {
            insights.push({
                type: 'health',
                icon: 'alert',
                title: `Weekend Grind`,
                message: `${weekendPushes} commits on weekends. Consider taking breaks to avoid burnout.`,
                severity: 'warning',
                metric: `${weekendPushes} weekend pushes`
            });
        }

        // ---- INSIGHT 6: Velocity Trend ----
        if (pushEvents.length >= 10) {
            const recent = pushEvents.slice(0, 30);
            const older = pushEvents.slice(30, 60);
            const recentRate = recent.length / 30;
            const olderRate = older.length / 30 || 0.1;
            const trend = ((recentRate - olderRate) / olderRate) * 100;
            
            if (trend > 20) {
                insights.push({
                    type: 'velocity',
                    icon: 'trending-up',
                    title: `Velocity Surge`,
                    message: `Your coding velocity is up ${Math.round(trend)}% recently. Momentum is building.`,
                    severity: 'positive',
                    metric: `+${Math.round(trend)}%`
                });
            } else if (trend < -30) {
                insights.push({
                    type: 'velocity',
                    icon: 'trending-down',
                    title: `Velocity Dip`,
                    message: `Your activity dropped ${Math.round(Math.abs(trend))}% recently. Time to get back in the flow.`,
                    severity: 'negative',
                    metric: `${Math.round(trend)}%`
                });
            }
        }

        // Sort: positive first, then warning, then negative
        const severityOrder = { positive: 0, warning: 1, negative: 2 };
        insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        res.json({
            success: true,
            data: {
                insights: insights.slice(0, 6),
                totalInsights: insights.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;