import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BASE_URL from "../config";

const Profile = () => {
    const [handles, setHandles] = useState({ codeforces: "", leetcode: "" });
    const [goals, setGoals] = useState({ cfRatingGoal: "", lcSolvedGoal: "" });
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setHandles({ ...handles, [e.target.name]: e.target.value });
    };

    const handleGoalChange = (e) => {
        setGoals({ ...goals, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/user/handles`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(handles),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Handles saved!");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/user/goals`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    cfRatingGoal: Number(goals.cfRatingGoal),
                    lcSolvedGoal: Number(goals.lcSolvedGoal)
                }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Goals saved!");
                navigate("/dashboard");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    const inputStyle = {
        padding: "12px 16px", borderRadius: "8px",
        border: "1px solid #c5cae9", fontSize: "14px", outline: "none"
    };

    const buttonStyle = {
        padding: "12px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
        color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer"
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)" }}>
            <Navbar />
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px", gap: "20px", flexWrap: "wrap", padding: "0 20px" }}>

                {/* Handles Form */}
                <div style={{
                    background: "white", padding: "40px", borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)", width: "100%", maxWidth: "400px"
                }}>
                    <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "28px" }}>Update Handles</h2>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input name="codeforces" placeholder="Codeforces Handle" onChange={handleChange} style={inputStyle} />
                        <input name="leetcode" placeholder="LeetCode Handle" onChange={handleChange} style={inputStyle} />
                        <button type="submit" style={buttonStyle}>Save Handles</button>
                    </form>
                </div>

                {/* Goals Form */}
                <div style={{
                    background: "white", padding: "40px", borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)", width: "100%", maxWidth: "400px"
                }}>
                    <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "28px" }}>Set Your Goals</h2>
                    <form onSubmit={handleGoalSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input name="cfRatingGoal" type="number" placeholder="CF Rating Goal (e.g. 1200)" onChange={handleGoalChange} style={inputStyle} />
                        <input name="lcSolvedGoal" type="number" placeholder="LC Problems Goal (e.g. 500)" onChange={handleGoalChange} style={inputStyle} />
                        <button type="submit" style={buttonStyle}>Save Goals</button>
                    </form>
                    <button type="button" onClick={async () => {
                    try {
                        await fetch(`${BASE_URL}/api/user/goals`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                            body: JSON.stringify({ cfRatingGoal: 0, lcSolvedGoal: 0 }),
                        });
                        alert("Goals cleared!");
                    } catch(err) {
                        alert("Something went wrong");
                    }
                }} style={{
                    padding: "12px", background: "#e57373",
                    color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer"
                }}>
                    Clear Goals
                </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;