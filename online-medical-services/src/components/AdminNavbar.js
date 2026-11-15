
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminNavbar({ onLogout }) {
  const navigate = useNavigate();

  const name = sessionStorage.getItem("userName") || "Admin";

  const navLinks = [
    { label: "Dashboard", path: "/admin-dashboard", icon: "▦" },
    { label: "Manage Users", path: "/manage-users", icon: "◎" },
    { label: "Manage Doctors", path: "/manage-doctors", icon: "✚" },
    { label: "Add Doctor", path: "/admin/add-doctor", icon: "+" },
    { label: "Appointments", path: "/admin/appointments", icon: "▣" },
    { label: "Reports", path: "/reports", icon: "▤" }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }

    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{`
        .admin-sidebar {
          width: 238px;
          min-width: 238px;
          height: 100vh;
          height: 100dvh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 28px 16px 16px;
          background: #0D1011;
          border-right: 1px solid #24292B;
          font-family: Inter, 'Segoe UI', Arial, sans-serif;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #35413F #0D1011;
        }

        .admin-sidebar::-webkit-scrollbar {
          width: 5px;
        }

        .admin-sidebar::-webkit-scrollbar-thumb {
          background: #35413F;
          border-radius: 10px;
        }

        .admin-sidebar-brand {
          flex-shrink: 0;
          margin-bottom: 35px;
        }

        .admin-sidebar-section-label {
          flex-shrink: 0;
          margin-bottom: 16px;
        }

        .admin-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex-shrink: 0;
        }

        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 14px;
          margin-bottom: 7px;
          border-radius: 8px;
          color: #939EA1;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all .2s ease;
          box-sizing: border-box;
        }

        .admin-sidebar-link:hover {
          color: #20DCC0;
          background: #172321;
        }

        .admin-sidebar-link.active {
          color: #20DCC0;
          background: #153B36;
          font-weight: 600;
        }

        .admin-sidebar-icon {
          width: 22px;
          text-align: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .admin-sidebar-bottom {
          margin-top: auto;
          padding-top: 18px;
          flex-shrink: 0;
        }

        .admin-sidebar-logout {
          width: 100%;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #301C1C;
          color: #FF8585;
          border: 1px solid #653333;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background .2s ease;
        }

        .admin-sidebar-logout:hover {
          background: #492323;
        }

        @media (max-height: 800px) {
          .admin-sidebar {
            padding-top: 18px;
            padding-bottom: 12px;
          }

          .admin-sidebar-brand {
            margin-bottom: 22px !important;
          }

          .admin-sidebar-section-label {
            margin-bottom: 12px !important;
          }

          .admin-sidebar-link {
            padding-top: 10px;
            padding-bottom: 10px;
            margin-bottom: 4px;
          }

          .admin-sidebar-bottom {
            padding-top: 12px;
          }
        }

        @media (max-width: 700px) {
          .admin-sidebar {
            width: 205px;
            min-width: 205px;
            padding-left: 12px;
            padding-right: 12px;
          }

          .admin-sidebar-link {
            gap: 10px;
            padding: 12px 10px;
          }
        }
      `}</style>

      <aside className="admin-sidebar">

        {/* BRAND */}

        <div
          className="admin-sidebar-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "0 9px"
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "9px",
              background: "#153B36",
              color: "#20DCC0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "23px",
              fontWeight: "800",
              flexShrink: 0
            }}
          >
            ✚
          </div>

          <div>
            <div
              style={{
                color: "#F1F5F5",
                fontSize: "19px",
                fontWeight: "800"
              }}
            >
              HealthWave
            </div>

            <div
              style={{
                color: "#20DCC0",
                fontSize: "9px",
                letterSpacing: "1.5px",
                fontWeight: "700",
                marginTop: "3px"
              }}
            >
              ADMIN PORTAL
            </div>
          </div>
        </div>

        {/* SECTION LABEL */}

        <div
          className="admin-sidebar-section-label"
          style={{
            padding: "0 13px",
            color: "#697579",
            fontSize: "10px",
            letterSpacing: "1.6px",
            fontWeight: "700"
          }}
        >
          ADMIN WORKSPACE
        </div>

        {/* NAVIGATION LINKS */}

        <nav className="admin-sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin-dashboard"}
              className={({ isActive }) =>
                `admin-sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="admin-sidebar-icon">
                {link.icon}
              </span>

              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM PROFILE AND LOGOUT */}

        <div className="admin-sidebar-bottom">

          {/* ADMIN SUPPORT CARD */}

          <div
            style={{
              background: "#181C1D",
              border: "1px solid #293333",
              borderRadius: "11px",
              padding: "15px 12px",
              marginBottom: "16px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px"
              }}
            >
              <span
                style={{
                  color: "#20DCC0",
                  fontSize: "20px"
                }}
              >
                ✚
              </span>

              <strong
                style={{
                  color: "#E8EEEE",
                  fontSize: "12px"
                }}
              >
                HealthWave Admin
              </strong>
            </div>

            <p
              style={{
                color: "#899497",
                fontSize: "11px",
                lineHeight: "1.6",
                margin: "0 0 0 29px"
              }}
            >
              Manage your hospital services in one place.
            </p>
          </div>

          {/* ADMIN PROFILE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 9px",
              borderTop: "1px solid #293333",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "#203A34",
                color: "#20DCC0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                flexShrink: 0
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "#F1F5F5",
                  fontSize: "12px",
                  fontWeight: "600",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {name}
              </div>

              <div
                style={{
                  color: "#899497",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  marginTop: "4px"
                }}
              >
                ADMIN
              </div>
            </div>
          </div>

          {/* LOGOUT BUTTON */}

          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-logout"
          >
            <span style={{ fontSize: "18px" }}>↪</span>
            Logout
          </button>

          <div
            style={{
              color: "#657174",
              fontSize: "10px",
              textAlign: "center",
              marginTop: "12px"
            }}
          >
            HealthWave Admin Portal
          </div>

        </div>
      </aside>
    </>
  );
}

export default AdminNavbar;
