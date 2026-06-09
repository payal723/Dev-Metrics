import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repoName: String,
    commits: [{ date: Date, message: String, sha: String }],
    contributors: [
        {
            username: String,
            profileUrl: String,
            avatarUrl: String,
            contributions: Number
        }
    ],
    lastFetched: Date

})

const Repo = mongoose.model("Repo", repoSchema);
export default Repo;