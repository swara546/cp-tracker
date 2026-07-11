import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Something went wrong");
    }
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8eaf6, #e3f2fd)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(100,120,200,0.15)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", color: "#2d3561", marginBottom: "24px", fontSize: "26px" }}>
          ⚡ CP Tracker
        </h2>
        <p style={{ textAlign: "center", color: "#7986cb", marginBottom: "28px" }}>
          Create your account
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input name="username" placeholder="Username" onChange={handleChange}
            style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none" }} />
          <input name="email" placeholder="Email" onChange={handleChange}
            style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none" }} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #c5cae9", fontSize: "14px", outline: "none" }} />
          <button type="submit" style={{
            padding: "12px",
            background: "linear-gradient(135deg, #2d3561, #7986cb)",
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