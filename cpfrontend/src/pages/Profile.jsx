import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Profile = () => {
    const [handles, setHandles] = useState({ codeforces: "", leetcode: "" });
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setHandles({ ...handles, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/api/user/handles", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(handles),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Handles saved!");
                navigate("/dashboard");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)" }}>
            <Navbar />
            <div style={{ display: "flex", justifyContent: "center", marginTop: "60px" }}>
                <div style={{
                    background: "white", padding: "40px", borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(100,120,200,0.15)", width: "100%", maxWidth: "400px"
                }}>
                    <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "28px" }}>Update Handles</h2>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input name="codeforces" placeholder="Codeforces Handle" onChange={handleChange}
                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none" }} />
                        <input name="leetcode" placeholder="LeetCode Handle" onChange={handleChange}
                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none" }} />
                        <button type="submit" style={{
                            padding: "12px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
                            color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer"
                        }}>
                            Save Handles
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;