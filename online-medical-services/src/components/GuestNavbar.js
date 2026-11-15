
import React from "react";
import { Link, NavLink } from "react-router-dom";

function GuestNavbar() {
  return (
    <nav className="guest-navbar">
      <Link to="/" className="guest-navbar-logo">
        <span className="guest-logo-icon">✚</span>
        <span>
          Health<span className="guest-logo-highlight">Wave</span>
        </span>
      </Link>

      <div className="guest-navbar-menu">
        <NavLink to="/" end className="guest-nav-link">
          Home
        </NavLink>

        <NavLink to="/about" className="guest-nav-link">
          About
        </NavLink>

        <NavLink to="/services" className="guest-nav-link">
          Services
        </NavLink>

        <NavLink to="/doctors" className="guest-nav-link">
          Doctors
        </NavLink>

        <Link to="/login" className="guest-login-btn">
          Login <span>→</span>
        </Link>
      </div>
    </nav>
  );
}

export default GuestNavbar;
