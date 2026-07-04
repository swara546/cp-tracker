import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Compare = () => {
    const [newFriend, setNewFriend] = useState("");
    const [friends, setFriends] = useState([]);
    const [user1, setUser1] = useState(null);
    const [user2, setUser2] = useState(null);
    const [error, setError] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/user/friends", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setFriends(data.friends || []);
        } catch (err) {
            console.log(err);
        }
    };

    const handleAddFriend = async () => {
        if (!newFriend) return;
        try {
            const res = await fetch("http://localhost:3000/api/user/friends/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ friendHandle: newFriend }),
            });
            const data = await res.json();
            if (res.ok) {
                setFriends(data.friends);
                setNewFriend("");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    const handleRemoveFriend = async (handle) => {
        try {
            const res = await fetch("http://localhost:3000/api/user/friends/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ friendHandle: handle }),
            });
            const data = await res.json();
            setFriends(data.friends);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCompare = async (handle) => {
        try {
            const res = await fetch(`http://localhost:3000/api/user/compare?handle1=${handle}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUser1(data.user1);
                setUser2(data.user2);
                setError("");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    const cardStyle = {
        background: "white", padding: "28px", borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(100,120,200,0.15)", flex: 1, textAlign: "center"
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)" }}>
            <Navbar />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
                <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "28px" }}>
                    Compare with Friends
                </h2>

                {/* Add Friend */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "28px", justifyContent: "center" }}>
                    <input placeholder="Add friend's CF handle" value={newFriend}
                        onChange={e => setNewFriend(e.target.value)}
                        style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none", width: "260px" }} />
                    <button onClick={handleAddFriend} style={{
                        padding: "12px 24px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
                        color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
                    }}>
                        Add Friend
                    </button>
                </div>

                {/* Friends List */}
                {friends.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                        <h3 style={{ color: "#2d3561", marginBottom: "12px" }}>Your Friends</h3>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {friends.map((f) => (
                                <div key={f} style={{
                                    background: "white", padding: "10px 16px", borderRadius: "20px",
                                    boxShadow: "0 4px 12px rgba(100,120,200,0.1)",
                                    display: "flex", alignItems: "center", gap: "10px"
                                }}>
                                    <span onClick={() => handleCompare(f)} style={{ cursor: "pointer", color: "#2d3561", fontWeight: "500" }}>
                                        {f}
                                    </span>
                                    <span onClick={() => handleRemoveFriend(f)} style={{ cursor: "pointer", color: "#e57373", fontWeight: "bold" }}>
                                        ✕
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

                {user1 && user2 && (
                    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                        {[user1, user2].map((user, i) => (
                            <div key={i} style={{
                                ...cardStyle,
                                border: i === 1 ? "2px solid #7986cb" : "none"
                            }}>
                                {i === 1 && <p style={{ color: "#7986cb", fontSize: "12px", marginBottom: "8px" }}>YOU</p>}
                                <h3 style={{ color: "#2d3561", fontSize: "20px" }}>{user.handle}</h3>
                                <p style={{ color: "#7986cb" }}>Rating: <strong>{user.rating}</strong></p>
                                <p style={{ color: "#7986cb" }}>Rank: <strong>{user.rank}</strong></p>
                                <p style={{ color: "#7986cb" }}>Max Rating: <strong>{user.maxRating}</strong></p>
                                <p style={{ color: "#7986cb" }}>Max Rank: <strong>{user.maxRank}</strong></p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compare;