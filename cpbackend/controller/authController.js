const UserDetails = require('../model/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

exports.register = async(req,res,next)=>{
    try{
        const{username,email,password}=req.body;

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await UserDetails.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User alredy exists"})
        }

        const hashPassword = await bcrypt.hash(password,10)

        const user = new UserDetails({ 
            username,
            email,
            password:hashPassword
        })
        await user.save()
        res.status(201).json({ message: "User registered successfully" })
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

exports.login = async(req,res)=>{
    try{
        const{email,password}=req.body;
        const user = await UserDetails.findOne({email})
        if (!user) {
        return res.status(400).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid password"})
        }
        
        const token = jwt.sign({id:user._id},"SecretKey",{expiresIn:'7d'})
        res.status(200).json({message:"Login successfully",token})
    }
    catch(err){
        res.status(500).json({ message: err.message })   
    }
}


