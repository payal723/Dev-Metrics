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


const app = express();
connectDb();

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-vercel-url.vercel.app'],
    credentials: true
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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is responding on port ${PORT}`);
})