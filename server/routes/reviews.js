import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/reviews - Pending PR reviews assigned to user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get repos the user has access to
        const reposRes = await axios.get(
            `https://api.github.com/user/repos?affiliation=collaborator,owner&per_page=30&sort=pushed`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const repos = reposRes.data.filter(r => !r.fork).slice(0, 15);

        // Fetch open PRs where user is requested as reviewer
        let pendingReviews = [];

        await Promise.all(repos.map(async (repo) => {
            try {
                const prsRes = await axios.get(
                    `https://api.github.com/repos/${repo.full_name}/pulls?state=open&per_page=20`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                for (const pr of prsRes.data) {
                    // Check if current user is a requested reviewer
                    const isRequestedReviewer = pr.requested_reviewers?.some(
                        reviewer => reviewer.login === user.username
                    );

                    // Also check review requests by team
                    const isTeamRequested = pr.requested_teams?.length > 0;

                    if (isRequestedReviewer || isTeamRequested) {
                        const daysOpen = Math.floor((Date.now() - new Date(pr.created_at)) / (1000 * 60 * 60 * 24));

                        pendingReviews.push({
                            title: pr.title,
                            url: pr.html_url,
                            repo: repo.name,
                            author: pr.user.login,
                            daysOpen,
                            comments: pr.comments + pr.review_comments,
                            draft: pr.draft,
                            requestedBy: isRequestedReviewer ? 'direct' : 'team'
                        });
                    }
                }
            } catch (e) {
                // Silently skip repos we can't access
            }
        }));

        // Sort by oldest first (most urgent)
        pendingReviews.sort((a, b) => b.daysOpen - a.daysOpen);

        res.json({
            success: true,
            data: {
                pendingCount: pendingReviews.length,
                urgentCount: pendingReviews.filter(r => r.daysOpen > 7).length,
                pendingReviews: pendingReviews.slice(0, 10)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;