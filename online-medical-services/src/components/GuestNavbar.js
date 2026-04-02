import React from "react";
import { Link } from "react-router-dom";

function GuestNavbar() {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>🏥 Online Medical Services</div>

      <div style={menuStyle}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/services">Services</NavLink>
        <Link to="/login" style={loginBtn}>Login</Link>
      </div>
    </nav>
  );
}

const navStyle = {
  background: "linear-gradient(90deg, #0097a7, #006064)",
  padding: "14px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
};

const logoStyle = {
  color: "#fff",
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "0.5px"
};

const menuStyle = {
  display: "flex",
  gap: "24px",
  alignItems: "center"
};

const linkStyle = {
  color: "#e0f7fa",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "500"
};

const loginBtn = {
  background: "#ffffff",
  color: "#006064",
  padding: "8px 18px",
  borderRadius: "20px",
  fontWeight: "600",
  textDecoration: "none"
};

function NavLink({ to, children }) {
  return <Link to={to} style={linkStyle}>{children}</Link>;
}

export default GuestNavbar;
