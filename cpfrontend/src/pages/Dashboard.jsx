import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement } from "chart.js";
import Navbar from "../components/Navbar";

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

    useEffect(() => {
        if (!token) return;
        const fetchStats = async () => {
            try {
                const cfRes = await fetch("http://localhost:3000/api/user/cf-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const cfData = await cfRes.json();
                setCfStats(cfData);

                const lcRes = await fetch("http://localhost:3000/api/user/lc-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const lcData = await lcRes.json();
                setLcStats(lcData);

                const histRes = await fetch("http://localhost:3000/api/user/cf-history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const histData = await histRes.json();
                setCfHistory(histData.history);

                const weakRes = await fetch("http://localhost:3000/api/user/weak-area", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const weakData = await weakRes.json();
                setSuggestion(weakData.suggestion);

                const topicsRes = await fetch("http://localhost:3000/api/user/lc-topics", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const topicsData = await topicsRes.json();
                console.log("Topics:", topicsData);
                setLcTopics(topicsData.topics || []);

                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        };
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