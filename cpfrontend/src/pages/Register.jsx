import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      alert("Registered successfully! Please login.");
      navigate("/");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const inputStyle = {
    padding: "12px 16px", borderRadius: "8px",
    border: "1px solid #c5cae9", fontSize: "14px", outline: "none"
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "white", padding: "40px", borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(100,120,200,0.15)", width: "100%", maxWidth: "420px"
      }}>
        <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "24px", fontSize: "26px" }}>
          ⚡ CP Tracker
        </h2>
        <p style={{ textAlign: "center", color: "#7986cb", marginBottom: "28px" }}>
          Create your account
        </p>

        {error && (
          <p style={{ color: "#e57373", background: "#fff0f0", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input name="username" placeholder="Username" onChange={handleChange} style={inputStyle} autoComplete="username" />
          <input name="email" placeholder="Email" onChange={handleChange} style={inputStyle} autoComplete="email" />
          <div style={{ position: "relative" }}>
            <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                onChange={handleChange}
                style={{
                    padding: "12px 16px", borderRadius: "8px",
                    border: "1px solid #c5cae9", fontSize: "14px",
                    outline: "none", width: "100%", boxSizing: "border-box"
                }}
            />
            <span onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", cursor: "pointer", fontSize: "18px"
                }}>
                {showPassword ? "🙈" : "👁️"}
            </span>
        </div>
          <p style={{ color: "#7986cb", fontSize: "12px", margin: "-8px 0" }}>
            Min 6 chars, one uppercase, one number, one special character
          </p>
          <button type="submit" style={{
            padding: "12px", background: "linear-gradient(135deg, #2d3561, #7986cb)",
            color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "8px"
          }}>
            Register
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#7986cb", cursor: "pointer" }}
          onClick={() => navigate("/")}>
          Already have an account? <span style={{ color: "#2d3561", fontWeight: "bold" }}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;