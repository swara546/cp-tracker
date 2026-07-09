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

exports.addFriend = async (req, res) => {
    try {
        const { cfHandle, lcHandle } = req.body;

        if (!cfHandle) {
            return res.status(400).json({ message: "CF handle required" });
        }

        const response = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
        const data = await response.json();

        if (data.status !== "OK") {
            return res.status(400).json({ message: "Invalid Codeforces handle" });
        }

        const user = await User.findById(req.userId);

        const alreadyExists = user.friends.find(f => f.cfHandle === cfHandle);
        if (alreadyExists) {
            return res.status(400).json({ message: "Friend already added" });
        }

        user.friends.push({ cfHandle, lcHandle: lcHandle || "" });
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
        const { cfHandle } = req.body;
        const user = await User.findById(req.userId);
        user.friends = user.friends.filter(f => f.cfHandle !== cfHandle);
        await user.save();
        res.status(200).json({ message: "Friend removed", friends: user.friends });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.compareUsers = async (req, res) => {
    try {
        const { cfHandle1, lcHandle1 } = req.query;
        const user = await User.findById(req.userId);
        const cfHandle2 = user.handles.codeforces;
        const lcHandle2 = user.handles.leetcode;

        if (!cfHandle1 || !cfHandle2) {
            return res.status(400).json({ message: "Handle required" });
        }

        const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle1};${cfHandle2}`);
        const cfData = await cfResponse.json();

        if (cfData.status !== "OK") {
            return res.status(400).json({ message: "Invalid CF handle" });
        }

        const getLCStats = async (handle) => {
            if (!handle) return { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
            try {
                const res = await fetch('https://leetcode.com/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
                    body: JSON.stringify({
                        query: `query { matchedUser(username: "${handle}") { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`
                    })
                });
                const data = await res.json();
                const stats = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
                return {
                    totalSolved: stats.find(s => s.difficulty === "All")?.count || 0,
                    easySolved: stats.find(s => s.difficulty === "Easy")?.count || 0,
                    mediumSolved: stats.find(s => s.difficulty === "Medium")?.count || 0,
                    hardSolved: stats.find(s => s.difficulty === "Hard")?.count || 0,
                };
            } catch {
                return { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
            }
        };

        const [lc1, lc2] = await Promise.all([getLCStats(lcHandle1), getLCStats(lcHandle2)]);

        const user1 = {
            handle: cfData.result[0].handle,
            rating: cfData.result[0].rating,
            maxRating: cfData.result[0].maxRating,
            rank: cfData.result[0].rank,
            maxRank: cfData.result[0].maxRank,
            lc: lc1
        };

        const user2 = {
            handle: cfData.result[1].handle,
            rating: cfData.result[1].rating,
            maxRating: cfData.result[1].maxRating,
            rank: cfData.result[1].rank,
            maxRank: cfData.result[1].maxRank,
            lc: lc2
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

exports.getUpcomingContests = async (req, res) => {
    try {
        const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
        const data = await response.json();

        if (data.status !== "OK") {
            return res.status(400).json({ message: "Could not fetch contests" });
        }

        const upcoming = data.result
            .filter(contest => contest.phase === "BEFORE")
            .slice(0, 5)
            .map(contest => ({
                id: contest.id,
                name: contest.name,
                startTime: new Date(contest.startTimeSeconds * 1000).toLocaleString(),
                duration: Math.floor(contest.durationSeconds / 3600) + " hrs " + Math.floor((contest.durationSeconds % 3600) / 60) + " mins",
                type: contest.type
            }));

        res.status(200).json({ contests: upcoming });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveGoals = async (req, res) => {
    try {
        const { cfRatingGoal, lcSolvedGoal } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { goals: { cfRatingGoal, lcSolvedGoal } },
            { new: true }
        );
        res.status(200).json({ message: "Goals saved successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({ goals: user.goals });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDailyChallenge = async (req, res) => {
    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `
                    query {
                        activeDailyCodingChallengeQuestion {
                            date
                            link
                            question {
                                title
                                difficulty
                                topicTags {
                                    name
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        const challenge = data.data.activeDailyCodingChallengeQuestion;

        if (!challenge) {
            return res.status(400).json({ message: "Could not fetch daily challenge" });
        }

        res.status(200).json({
            date: challenge.date,
            title: challenge.question.title,
            difficulty: challenge.question.difficulty,
            link: `https://leetcode.com${challenge.link}`,
            topics: challenge.question.topicTags.map(t => t.name)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};