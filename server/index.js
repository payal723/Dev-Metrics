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
    origin: 'http://localhost:3000',
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



app.listen(5000 , () => {
    console.log("Server is responding");
})