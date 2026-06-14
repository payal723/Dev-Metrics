import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get user's repos
        const reposRes = await axios.get(
            `https://api.github.com/user/repos?sort=pushed&per_page=10&affiliation=owner`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const repos = reposRes.data.filter(r => !r.fork).slice(0, 5);

        const healthData = await Promise.all(repos.map(async (repo) => {
            try {
                // Get PRs
                const prsRes = await axios.get(
                    `https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=50`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const prs = prsRes.data;
                const mergedPRs = prs.filter(p => p.merged_at);
                const openPRs = prs.filter(p => p.state === 'open');
                const mergeRate = prs.length > 0 ? Math.round((mergedPRs.length / prs.length) * 100) : 0;

                // Get issues
                const issuesRes = await axios.get(
                    `https://api.github.com/repos/${repo.full_name}/issues?state=all&per_page=50`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const issues = issuesRes.data.filter(i => !i.pull_request);
                const openIssues = issues.filter(i => i.state === 'open');
                const closedIssues = issues.filter(i => i.state === 'closed');

                // Calculate issue resolution time
                let avgResolutionDays = 0;
                const resolvedIssues = issues.filter(i => i.closed_at);
                if (resolvedIssues.length > 0) {
                    const totalDays = resolvedIssues.reduce((sum, issue) => {
                        const created = new Date(issue.created_at);
                        const closed = new Date(issue.closed_at);
                        return sum + (closed - created) / (1000 * 60 * 60 * 24);
                    }, 0);
                    avgResolutionDays = Math.round(totalDays / resolvedIssues.length);
                }

                // Calculate health score
                let healthScore = 50;
                if (mergeRate > 70) healthScore += 15;
                if (mergeRate > 50) healthScore += 10;
                if (avgResolutionDays < 7) healthScore += 15;
                if (avgResolutionDays < 14) healthScore += 5;
                if (openIssues.length < 10) healthScore += 5;
                healthScore = Math.min(healthScore, 100);

                let status = 'healthy';
                if (healthScore >= 75) status = 'healthy';
                else if (healthScore >= 50) status = 'needs_attention';
                else status = 'at_risk';

                return {
                    name: repo.name,
                    fullName: repo.full_name,
                    url: repo.html_url,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    language: repo.language,
                    healthScore,
                    status,
                    prStats: {
                        total: prs.length,
                        merged: mergedPRs.length,
                        open: openPRs.length,
                        mergeRate
                    },
                    issueStats: {
                        total: issues.length,
                        open: openIssues.length,
                        closed: closedIssues.length,
                        avgResolutionDays
                    },
                    lastPushed: repo.pushed_at
                };
            } catch (e) {
                return null;
            }
        }));

        const validHealthData = healthData.filter(Boolean);

        // Overall health
        const avgHealth = validHealthData.length > 0
            ? Math.round(validHealthData.reduce((sum, r) => sum + r.healthScore, 0) / validHealthData.length)
            : 0;

        res.json({
            success: true,
            data: {
                repos: validHealthData,
                overallHealth: avgHealth,
                totalRepos: validHealthData.length,
                healthyRepos: validHealthData.filter(r => r.status === 'healthy').length,
                atRiskRepos: validHealthData.filter(r => r.status === 'at_risk').length
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;