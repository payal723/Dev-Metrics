import mongoose from 'mongoose' ; 

const connectDb = async() => {
    try{
            await mongoose.connect(process.env.MONGODB_URI)
            console.log("DB CONNECTED");

    }catch(e){
        console.log("something went wrong" , e.message);
        process.exit(1);
    }
    
}

export default connectDb;