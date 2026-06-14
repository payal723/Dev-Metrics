import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const accessToken = user.accessToken;

        // Get user's repos with language data
        const reposRes = await axios.get(
            `https://api.github.com/user/repos?sort=pushed&per_page=100&affiliation=owner,collaborator`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const repos = reposRes.data.filter(r => !r.fork);
        
        // Aggregate language data from GitHub API
        const languageStats = {};
        const totalCommitsByLang = {};
        
        await Promise.all(repos.slice(0, 15).map(async (repo) => {
            try {
                // Get language breakdown
                const langRes = await axios.get(
                    `https://api.github.com/repos/${repo.full_name}/languages`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                
                Object.entries(langRes.data).forEach(([lang, bytes]) => {
                    languageStats[lang] = (languageStats[lang] || 0) + bytes;
                });

                // Get recent commits to attribute to languages
                const commitsRes = await axios.get(
                    `https://api.github.com/repos/${repo.full_name}/commits?author=${user.username}&per_page=10`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                
                const repoLang = repo.language || 'Other';
                totalCommitsByLang[repoLang] = (totalCommitsByLang[repoLang] || 0) + commitsRes.data.length;
                
            } catch (e) {}
        }));

        // Calculate percentages
        const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0);
        const languageBreakdown = Object.entries(languageStats)
            .map(([name, bytes]) => ({
                name,
                bytes,
                percentage: Math.round((bytes / totalBytes) * 100)
            }))
            .sort((a, b) => b.bytes - a.bytes)
            .slice(0, 8);

        // Calculate skill dimensions for radar chart
        const dimensions = {
            'Frontend': ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'React'],
            'Backend': ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'Node', 'Express'],
            'Systems': ['C', 'C++', 'Rust', 'Go', 'Assembly'],
            'Data': ['Python', 'SQL', 'R', 'Julia', 'Scala'],
            'Mobile': ['Swift', 'Kotlin', 'Java', 'Dart', 'React'],
            'DevOps': ['Shell', 'Dockerfile', 'YAML', 'HCL', 'Nix']
        };

        const skillScores = {};
        Object.entries(dimensions).forEach(([dim, langs]) => {
            const relevantBytes = languageBreakdown
                .filter(l => langs.some(lang => l.name.toLowerCase().includes(lang.toLowerCase())))
                .reduce((sum, l) => sum + l.bytes, 0);
            skillScores[dim] = Math.min(Math.round((relevantBytes / (totalBytes || 1)) * 100), 100);
        });

        // Monthly commit activity by language
        const monthlyActivity = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthlyActivity.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear()
            });
        }

        res.json({
            success: true,
            data: {
                languages: languageBreakdown,
                skillRadar: Object.entries(skillScores).map(([subject, score]) => ({ subject, score })),
                totalReposAnalyzed: repos.length,
                primaryLanguage: languageBreakdown[0]?.name || 'Unknown',
                commitDistribution: totalCommitsByLang
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;