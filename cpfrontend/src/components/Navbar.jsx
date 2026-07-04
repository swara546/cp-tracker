import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav style={{
            background: "linear-gradient(135deg, #2d3561, #4a5568)",
            padding: "14px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
            <h1 style={{ color: "#c3d4f7", fontSize: "22px", fontWeight: "bold", margin: 0 }}>
                ⚡ CP Tracker
            </h1>
            <div style={{ display: "flex", gap: "12px" }}>
                {["Dashboard", "Profile", "Compare"].map((page) => (
                    <button key={page} onClick={() => navigate(`/${page.toLowerCase()}`)}
                        style={{
                            background: "transparent",
                            border: "1px solid #c3d4f7",
                            color: "#c3d4f7",
                            padding: "8px 18px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}>
                        {page}
                    </button>
                ))}
                <button onClick={handleLogout}
                    style={{
                        background: "#e57373",
                        border: "none",
                        color: "white",
                        padding: "8px 18px",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;