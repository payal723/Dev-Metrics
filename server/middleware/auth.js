
import jwt from 'jsonwebtoken';


const authMiddleware = (req , res , next) => {
    const token = req.cookies.token ;

    if(!token){
        return res.status(404).json({message : "Not Authenticated"});
    }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
} catch(e) {
    return res.status(401).json({ message: "Invalid token" });
}

}

export default authMiddleware ; 