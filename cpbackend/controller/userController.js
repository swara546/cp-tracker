const User = require('../model/user');

exports.saveHandles = async (req, res) => {
    try {
        const { codeforces, leetcode } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { handles: { codeforces, leetcode } },
            { new: true }
        );
        res.status(200).json({ message: "Handles saved successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCFstatus = async (req,res)=>{
    try{
        const user = await User.findById(req.userId);
        const handle = user.handles.codeforces;

        if(!handle){
            return res.status(400).json({message:"Codeforces handle not saved"})
        }

        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
        const data = await response.json();

        if(data.status!="OK"){
            return res.status(400).json({message:"Invalid condeforces handles"});
        }
        const cfUser = data.result[0];
        res.status(200).json({
            handle:cfUser.handle,
            rating:cfUser.rating,
            maxRating:cfUser.maxRating,
            rank:cfUser.rank,
            maxRank:cfUser.maxRank
        })
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
}

exports.getLCStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const handle = user.handles.leetcode;

        if (!handle) {
            return res.status(400).json({ message: "LeetCode handle not saved" });
        }

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `
                    query {
                        matchedUser(username: "${handle}") {
                            username
                            submitStatsGlobal {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        const lcUser = data.data.matchedUser;

        if (!lcUser) {
            return res.status(400).json({ message: "Invalid LeetCode handle" });
        }

        const stats = lcUser.submitStatsGlobal.acSubmissionNum;

        res.status(200).json({
            handle: lcUser.username,
            totalSolved: stats.find(s => s.difficulty === "All")?.count || 0,
            easySolved: stats.find(s => s.difficulty === "Easy")?.count || 0,
            mediumSolved: stats.find(s => s.difficulty === "Medium")?.count || 0,
            hardSolved: stats.find(s => s.difficulty === "Hard")?.count || 0,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCFRatingHistory = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const handle = user.handles.codeforces;

        if (!handle) {
            return res.status(400).json({ message: "Codeforces handle not saved" });
        }

        const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const data = await response.json();

        if (data.status !== "OK") {
            return res.status(400).json({ message: "Invalid Codeforces handle" });
        }

        const history = data.result.map(contest => ({
            contestName: contest.contestName,
            rating: contest.newRating,
            date: new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()
        }));

        res.status(200).json({ history });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.compareUsers = async (req, res) => {
    try {
        const { handle1 } = req.query;
        const user = await User.findById(req.userId);
        const handle2 = user.handles.codeforces;

        if (!handle1 || !handle2) {
            return res.status(400).json({ message: "Handle required" });
        }

        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle1};${handle2}`);
        const data = await response.json();

        if (data.status !== "OK") {
            return res.status(400).json({ message: "Invalid handle" });
        }

        const user1 = {
            handle: data.result[0].handle,
            rating: data.result[0].rating,
            maxRating: data.result[0].maxRating,
            rank: data.result[0].rank,
            maxRank: data.result[0].maxRank
        };

        const user2 = {
            handle: data.result[1].handle,
            rating: data.result[1].rating,
            maxRating: data.result[1].maxRating,
            rank: data.result[1].rank,
            maxRank: data.result[1].maxRank
        };

        res.status(200).json({ user1, user2 });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWeakArea = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const handle = user.handles.leetcode;

        if (!handle) {
            return res.status(400).json({ message: "LeetCode handle not saved" });
        }

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `
                    query {
                        matchedUser(username: "${handle}") {
                            submitStatsGlobal {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;

        const easy = stats.find(s => s.difficulty === "Easy")?.count || 0;
        const medium = stats.find(s => s.difficulty === "Medium")?.count || 0;
        const hard = stats.find(s => s.difficulty === "Hard")?.count || 0;

        let suggestion = "";

        if (easy > medium && easy > hard) {
            suggestion = "You solve mostly Easy problems. Challenge yourself with more Medium problems!";
        } else if (medium > hard) {
            suggestion = "Good progress on Medium! Try tackling some Hard problems now.";
        } else {
            suggestion = "Great job! You are solving Hard problems. Keep it up!";
        }

        res.status(200).json({ easy, medium, hard, suggestion });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addFriend = async (req, res) => {
    try {
        const { friendHandle } = req.body;

        if (!friendHandle) {
            return res.status(400).json({ message: "Friend handle required" });
        }

        const response = await fetch(`https://codeforces.com/api/user.info?handles=${friendHandle}`);
        const data = await response.json();

        if (data.status !== "OK") {
            return res.status(400).json({ message: "Invalid Codeforces handle" });
        }

        const user = await User.findById(req.userId);

        if (user.friends.includes(friendHandle)) {
            return res.status(400).json({ message: "Friend already added" });
        }

        user.friends.push(friendHandle);
        await user.save();

        res.status(200).json({ message: "Friend added successfully", friends: user.friends });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({ friends: user.friends });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const { friendHandle } = req.body;
        const user = await User.findById(req.userId);
        user.friends = user.friends.filter(f => f !== friendHandle);
        await user.save();
        res.status(200).json({ message: "Friend removed", friends: user.friends });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLCTopics = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const handle = user.handles.leetcode;

        if (!handle) {
            return res.status(400).json({ message: "LeetCode handle not saved" });
        }

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `
                    query {
                        matchedUser(username: "${handle}") {
                            tagProblemCounts {
                                advanced {
                                    tagName
                                    problemsSolved
                                }
                                intermediate {
                                    tagName
                                    problemsSolved
                                }
                                fundamental {
                                    tagName
                                    problemsSolved
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        const tags = data.data.matchedUser.tagProblemCounts;

        const allTopics = [
            ...tags.fundamental,
            ...tags.intermediate,
            ...tags.advanced
        ]
        .filter(t => t.problemsSolved > 0)
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 10);

        res.status(200).json({ topics: allTopics });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
