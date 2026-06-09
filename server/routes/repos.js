
import express from 'express';
import axios from 'axios'
import authMiddleware from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router();


router.get("/top" , authMiddleware, async(req,res) => {
    const user = await User.findById(req.userId);
 
    const accessToken = user.accessToken;
      const userResponse = await axios.get("https://api.github.com/user/repos?sort=pushed&per_page=100", {
        headers: { Authorization: `Bearer ${accessToken}` }
         
    })
    const top5 = userResponse.data.slice(0, 5).map(repo => ({
    name: repo.name,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at
}));

res.json(top5);

})


export default router ; 