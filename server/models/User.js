import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
        githubId : Number , 
        username : String ,
        avatarUrl : String , 
        accessToken : String,
        lastFetched  :Date

})

const User = mongoose.model("User" , userSchema);
export default User ;