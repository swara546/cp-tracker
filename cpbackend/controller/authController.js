const UserDetails = require('../model/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

exports.register = async(req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Password requirements
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(.{6,})$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters with one uppercase, one number and one special character (!@#$%^&*)" 
            });
        }

        const existingUser = await UserDetails.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new UserDetails({ username, email, password: hashPassword });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

exports.login = async(req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserDetails.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: "Login successfully", token });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}
