const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRouter");
const userRoutes = require('./routes/userRouter')
app.use('/api/user',userRoutes)
app.use('/api/auth',authRoutes);

const DB_PATH = "mongodb+srv://NodeCode:NodeCode@nodecode.jn2g3ju.mongodb.net/cpTracker?retryWrites=true&w=majority";

const PORT=3000;
mongoose.connect(DB_PATH)
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`server running on http://localhost:${PORT}`);
    })
})
.catch((err)=>{
    console.log("Error while connecting",err);
})