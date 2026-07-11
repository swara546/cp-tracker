import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement } from "chart.js";
import Navbar from "../components/Navbar";
import BASE_URL from "../config";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement);

const Dashboard = () => {
    const { token } = useAuth();
    const [cfStats, setCfStats] = useState(null);
    const [lcStats, setLcStats] = useState(null);
    const [cfHistory, setCfHistory] = useState([]);
    const [suggestion, setSuggestion] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("all");
    const [lcTopics, setLcTopics] = useState([]);
    const [contests, setContests] = useState([]);
    const [goals, setGoals] = useState(null);
    const [dailyChallenge, setDailyChallenge] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const cfRes = await fetch(`${BASE_URL}/api/user/cf-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const cfData = await cfRes.json();
            setCfStats(cfData);

            const lcRes = await fetch(`${BASE_URL}/api/user/lc-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const lcData = await lcRes.json();
            setLcStats(lcData);

            const histRes = await fetch(`${BASE_URL}/api/user/cf-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const histData = await histRes.json();
            setCfHistory(histData.history);

            const weakRes = await fetch(`${BASE_URL}/api/user/weak-area`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const weakData = await weakRes.json();
            setSuggestion(weakData.suggestion);

            const topicsRes = await fetch(`${BASE_URL}/api/user/lc-topics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const topicsData = await topicsRes.json();
            setLcTopics(topicsData.topics || []);

            const contestsRes = await fetch(`${BASE_URL}/api/user/upcoming-contests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const contestsData = await contestsRes.json();
            setContests(contestsData.contests || []);

            const goalsRes = await fetch(`${BASE_URL}/api/user/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const goalsData = await goalsRes.json();
            setGoals(goalsData.goals);

            const dailyRes = await fetch(`${BASE_URL}/api/user/daily-challenge`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dailyData = await dailyRes.json();
            setDailyChallenge(dailyData);

            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchStats();
    }, [token]);

    const lcChartData = lcStats ? {
        labels: ["Easy", "Medium", "Hard"],
        datasets: [{
            data: [lcStats.easySolved, lcStats.mediumSolved, lcStats.hardSolved],
            backgroundColor: ["#00b8a3", "#ffc01e", "#ff375f"],
        }]
    } : null;

    const cfChartData = cfHistory.length > 0 ? {
        labels: cfHistory.map(c => c.date),
        datasets: [{
            label: "CF Rating",
            data: cfHistory.map(c => c.rating),
            borderColor: "#7986cb",
            backgroundColor: "rgba(121,134,203,0.1)",
            fill: true,
            tension: 0.4
        }]
    } : null;

    const topicsChartData = lcTopics.length > 0 ? {
        labels: lcTopics.map(t => t.tagName),
        datasets: [{
            label: "Problems Solved",
            data: lcTopics.map(t => t.problemsSolved),
            backgroundColor: "rgba(121,134,203,0.7)",
            borderRadius: 6
        }]
    } : null;

    const cardStyle = {
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(100,120,200,0.15)",
        flex: 1
    };

    const labelStyle = { color: "#7986cb", marginBottom: "8px" };
    const valueStyle = { color: "#2d3561", fontWeight: "bold", fontSize: "18px" };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "16px"
            }}>
                <div style={{
                    width: "50px",
                    height: "50px",
                    border: "5px solid #c5cae9",
                    borderTop: "5px solid #2d3561",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
                <p style={{ color: "#2d3561", fontSize: "18px" }}>Fetching your stats...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)" }}>
            <Navbar />
            <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px" }}>
                <h1 style={{ color: "#2d3561", marginBottom: "28px" }}>Dashboard</h1>

                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}
                    style={{
                        padding: "10px 16px", borderRadius: "8px", border: "1px solid #c5cae9",
                        marginBottom: "20px", fontSize: "14px", color: "#2d3561", cursor: "pointer"
                    }}>
                    <option value="all">All Platforms</option>
                    <option value="cf">Codeforces Only</option>
                    <option value="lc">LeetCode Only</option>
                </select>

                {/* Stats Cards */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
                    {cfStats && (viewMode === "all" || viewMode === "cf") && (
                        <div style={cardStyle}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>⚡ Codeforces</h2>
                            <p style={labelStyle}>Handle</p>
                            <p style={valueStyle}>{cfStats.handle}</p>
                            <p style={labelStyle}>Rating</p>
                            <p style={valueStyle}>{cfStats.rating}</p>
                            <p style={labelStyle}>Rank</p>
                            <p style={valueStyle}>{cfStats.rank}</p>
                            <p style={labelStyle}>Max Rating</p>
                            <p style={valueStyle}>{cfStats.maxRating}</p>
                        </div>
                    )}

                    {lcStats && (viewMode === "all" || viewMode === "lc") && (
                        <div style={cardStyle}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>🟡 LeetCode</h2>
                            <p style={labelStyle}>Handle</p>
                            <p style={valueStyle}>{lcStats.handle}</p>
                            <p style={labelStyle}>Total Solved</p>
                            <p style={valueStyle}>{lcStats.totalSolved}</p>
                            <p style={labelStyle}>Easy</p>
                            <p style={valueStyle}>{lcStats.easySolved}</p>
                            <p style={labelStyle}>Medium</p>
                            <p style={valueStyle}>{lcStats.mediumSolved}</p>
                            <p style={labelStyle}>Hard</p>
                            <p style={valueStyle}>{lcStats.hardSolved}</p>
                        </div>
                    )}

                    {suggestion && (viewMode === "all" || viewMode === "lc") && (
                        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #e8eaf6, #c5cae9)" }}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>💡 Weak Area</h2>
                            <p style={{ color: "#2d3561", fontSize: "16px", lineHeight: "1.6" }}>{suggestion}</p>
                        </div>
                    )}
                </div>

                        {/* Daily Challenge */}
{dailyChallenge && !dailyChallenge.message && (viewMode === "all" || viewMode === "lc") && (
    <div style={{ marginBottom: "28px" }}>
        <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>📅 Today's LC Challenge</h2>
        <div style={{
            background: "white", padding: "24px", borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(100,120,200,0.15)",
            borderLeft: `4px solid ${
                dailyChallenge.difficulty === "Easy" ? "#00b8a3" :
                dailyChallenge.difficulty === "Medium" ? "#ffc01e" : "#ff375f"
            }`
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h3 style={{ color: "#2d3561", fontSize: "18px", marginBottom: "8px" }}>
                        {dailyChallenge.title}
                    </h3>
                    <span style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                        background: dailyChallenge.difficulty === "Easy" ? "#e8f8f5" :
                                   dailyChallenge.difficulty === "Medium" ? "#fff8e1" : "#fff0f0",
                        color: dailyChallenge.difficulty === "Easy" ? "#00b8a3" :
                               dailyChallenge.difficulty === "Medium" ? "#ffc01e" : "#ff375f"
                    }}>
                        {dailyChallenge.difficulty}
                    </span>
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {dailyChallenge.topics.map(t => (
                            <span key={t} style={{
                                padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
                                background: "#e8eaf6", color: "#2d3561"
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
                <a href={dailyChallenge.link} target="_blank" style={{
                    padding: "10px 24px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
                    color: "white", borderRadius: "8px", textDecoration: "none", fontSize: "14px"
                }}>
                    Solve Now →
                </a>
            </div>
        </div>
    </div>
)}

                    {/* Upcoming Contests */}
                {contests.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                        <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>🏆 Upcoming Codeforces Contests</h2>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            {contests.map((contest) => (
                                <div key={contest.id} style={{
                                    background: "white", padding: "20px", borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)",
                                    flex: "1", minWidth: "250px",
                                    borderLeft: "4px solid #7986cb"
                                }}>
                                    <h3 style={{ color: "#2d3561", fontSize: "15px", marginBottom: "10px" }}>{contest.name}</h3>
                                    <p style={{ color: "#7986cb", fontSize: "13px" }}>🕐 {contest.startTime}</p>
                                    <p style={{ color: "#7986cb", fontSize: "13px" }}>⏱ Duration: {contest.duration}</p>
                                    <p style={{ color: "#7986cb", fontSize: "13px" }}>📌 Type: {contest.type}</p>
                                    <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank"
                                        style={{
                                            display: "inline-block", marginTop: "12px",
                                            padding: "6px 14px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
                                            color: "white", borderRadius: "20px", fontSize: "12px", textDecoration: "none"
                                        }}>
                                        View Contest →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Goals */}
{goals && cfStats && lcStats && (
    <div style={{ marginBottom: "28px" }}>
        <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>🎯 Your Goals</h2>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

            {/* CF Rating Goal */}
            {goals.cfRatingGoal > 0 && (viewMode === "all" || viewMode === "cf") && (
                <div style={{
                    background: "white", padding: "24px", borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)", flex: 1
                }}>
                    <h3 style={{ color: "#2d3561", marginBottom: "12px" }}>⚡ CF Rating Goal</h3>
                    <p style={{ color: "#7986cb" }}>Current: <strong>{cfStats.rating}</strong> / Target: <strong>{goals.cfRatingGoal}</strong></p>
                    <div style={{ background: "#e8eaf6", borderRadius: "10px", height: "12px", margin: "12px 0" }}>
                        <div style={{
                            background: "linear-gradient(135deg, #2d3561, #7986cb)",
                            width: `${Math.min((cfStats.rating / goals.cfRatingGoal) * 100, 100)}%`,
                            height: "12px", borderRadius: "10px"
                        }} />
                    </div>
                    <p style={{ color: "#7986cb", fontSize: "13px" }}>
                        {cfStats.rating >= goals.cfRatingGoal
                            ? "🎉 Goal achieved!"
                            : `${goals.cfRatingGoal - cfStats.rating} more rating points to go!`}
                    </p>
                </div>
            )}

            {/* LC Solved Goal */}
            {goals.lcSolvedGoal > 0 && (viewMode === "all" || viewMode === "lc") && (
                <div style={{
                    background: "white", padding: "24px", borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)", flex: 1
                }}>
                    <h3 style={{ color: "#2d3561", marginBottom: "12px" }}>🟡 LC Solved Goal</h3>
                    <p style={{ color: "#7986cb" }}>Current: <strong>{lcStats.totalSolved}</strong> / Target: <strong>{goals.lcSolvedGoal}</strong></p>
                    <div style={{ background: "#e8eaf6", borderRadius: "10px", height: "12px", margin: "12px 0" }}>
                        <div style={{
                            background: "linear-gradient(135deg, #00b8a3, #ffc01e)",
                            width: `${Math.min((lcStats.totalSolved / goals.lcSolvedGoal) * 100, 100)}%`,
                            height: "12px", borderRadius: "10px"
                        }} />
                    </div>
                    <p style={{ color: "#7986cb", fontSize: "13px" }}>
                        {lcStats.totalSolved >= goals.lcSolvedGoal
                            ? "🎉 Goal achieved!"
                            : `${goals.lcSolvedGoal - lcStats.totalSolved} more problems to go!`}
                    </p>
                </div>
            )}
        </div>
    </div>
)}

                {/* Charts */}
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    {lcChartData && (viewMode === "all" || viewMode === "lc") && (
                        <div style={{ ...cardStyle, maxWidth: "320px" }}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>LC Problems Breakdown</h2>
                            <Doughnut data={lcChartData} options={{
                                plugins: {
                                    legend: { position: 'bottom' },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.label}: ${context.raw} problems`
                                        }
                                    }
                                }
                            }} />
                        </div>
                    )}

                    {cfChartData && (viewMode === "all" || viewMode === "cf") && (
                        <div style={{ ...cardStyle, flex: 2 }}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>CF Rating History</h2>
                            <Line data={cfChartData} />
                        </div>
                    )}

                    {topicsChartData && (viewMode === "all" || viewMode === "lc") && (
                        <div style={{ ...cardStyle, flex: 2 }}>
                            <h2 style={{ color: "#2d3561", marginBottom: "16px" }}>LC Topic Breakdown</h2>
                            <Bar data={topicsChartData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;