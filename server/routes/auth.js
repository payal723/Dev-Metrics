import express from 'express';
import axios from 'axios';
import User from '../models/User.js'
import jwt from 'jsonwebtoken';
const router = express.Router();


//1st router
router.get("/github", (req, res) => {
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user`;
    res.redirect(githubUrl);
});

router.get("/github/callback", async (req, res) => {
    const code = req.query.code;

    const response = await axios.post('https://github.com/login/oauth/access_token'
        , {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, { headers: { Accept: 'application/json' } });
    const accessToken = response.data.access_token;
    console.log("Full response:", response.data);

    console.log("Access Token:", accessToken);


    const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });


    console.log(userResponse.data);
    const githubUser = userResponse.data;

    const user = await User.findOneAndUpdate(
        { githubId: githubUser.id },       
        {
            githubId: githubUser.id,
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            accessToken: accessToken,
            lastFetched: Date.now()
        },
        { upsert: true, returnDocument: 'after' }
    );

    console.log("User saved:", user);

    const token = jwt.sign(
        {userId : user._id},
        process.env.JWT_SECRET,
        {expiresIn : '7d'}
    );
    res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000  

});
res.redirect('https://dev-metrics-delta.vercel.app/dashboard');
})

export default router; 