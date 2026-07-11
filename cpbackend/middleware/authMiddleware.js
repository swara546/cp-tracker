const jwt = require('jsonwebtoken')
const decoded = jwt.verify(token, process.env.JWT_SECRET)

const authMiddleware = (req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if(!token){
            res.status(401).json({message:"No Toekn Provided"})
        }
        const decoded = jwt.verify(token,"SecretKey")
        req.userId = decoded.id;
        next();
    }
    catch(err){
        res.status(401).json({message:"Invalid token"})
    }
}

module.exports = authMiddleware;