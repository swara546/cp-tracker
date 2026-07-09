const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  handles: {
    codeforces: { type: String, default: '' },
    leetcode: { type: String, default: '' },
  },
  friends: [{
    cfHandle: { type: String },
    lcHandle: { type: String }
  }],
  goals: {
    cfRatingGoal: { type: Number, default: 0 },
    lcSolvedGoal: { type: Number, default: 0 }
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)