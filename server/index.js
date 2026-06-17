import dotenv from 'dotenv';
dotenv.config();
import express from 'express' ; 
import cors from 'cors';
import connectDb from './config/db.js'; 
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js';
import repoRouter from './routes/repos.js'
import commitRouter from './routes/commits.js'
import statsRouter from './routes/stats.js'
import qualityRouter from './routes/quality.js';
import sprintRoutes from './routes/sprints.js';
import insightsRoutes from './routes/insights.js';
import devcardRoutes from './routes/devcard.js';
import languageRoutes from './routes/languages.js';
import repohealthRoutes from './routes/repohealth.js';
import reviewsRoutes from './routes/reviews.js';
import focusRoutes from './routes/focus.js';



const app = express();
connectDb();

app.use(cors({
    origin: ['http://localhost:3000', 'https://dev-metrics-delta.vercel.app', 'https://dev-metrics-delta.vercel.app/dashboard'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());



app.get("/" , (req , res) => {
    res.send("Server is running");
})

app.use("/api/auth" , authRouter);
app.use('/api/user', userRouter);
app.use('/api/repos' , repoRouter )
app.use('/api/commits' , commitRouter )
app.use('/api/stats', statsRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/sprints', sprintRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/devcard', devcardRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/repohealth', repohealthRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/focus', focusRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is responding on port ${PORT}`);
})