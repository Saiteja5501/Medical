
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api";

function FindDoctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const doctorsPerPage = 8;

  const menuItems = [
    { name: "Dashboard", icon: "▦", path: "/patient-dashboard" },
    { name: "My Profile", icon: "◉", path: "/patient/profile" },
    { name: "All Doctors", icon: "⚕", path: "/patient/doctors" },
    { name: "Appointments", icon: "▣", path: "/patient/appointments" },
    { name: "Medical History", icon: "◷", path: "/patient/medical-history" },
    { name: "Prescriptions", icon: "✚", path: "/patient/prescriptions" },
    { name: "Reports", icon: "▤", path: "/patient/reports" }
  ];

  // FETCH REGISTERED DOCTORS
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/users/doctors");
        const data = response.data;

        const doctorsList = Array.isArray(data)
          ? data
          : Array.isArray(data?.doctors)
            ? data.doctors
            : [];

        const formattedDoctors = doctorsList.map((doc) => ({
          id: doc.id ?? doc.userId,
          name: doc.name || "Doctor",
          email: doc.email || "Email not available",
          specialization:
            doc.specialization || "General Physician",
          availability:
            doc.availability ||
            doc.availableDays ||
            doc.available_hours ||
            "",
          image:
            doc.image ||
            doc.profileImage ||
            doc.profile_image ||
            doc.imageUrl ||
            doc.image_url ||
            doc.photo ||
            doc.avatar ||
            ""
        }));

        setDoctors(formattedDoctors);
      } catch (err) {
        console.error(
          "Find doctors error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          "Unable to load doctors. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // SPECIALIZATION OPTIONS
  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [doctors]);

  // SEARCH AND FILTER
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        doctor.name.toLowerCase().includes(searchValue) ||
        doctor.email.toLowerCase().includes(searchValue) ||
        doctor.specialization.toLowerCase().includes(searchValue);

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);

  // PAGINATION
  const totalPages = Math.ceil(
    filteredDoctors.length / doctorsPerPage
  );

  const currentDoctors = filteredDoctors.slice(
    (page - 1) * doctorsPerPage,
    page * doctorsPerPage
  );

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSpecialization = (value) => {
    setSpecialization(value);
    setPage(1);
  };

  // BOOK APPOINTMENT
  const handleBookAppointment = (doctorId) => {
    if (!doctorId) {
      setChatMessage(
        "Doctor information is incomplete. Please try again later."
      );
      return;
    }

    navigate(`/patient/available-slots/${doctorId}`);
  };

  // CHAT PLACEHOLDER
  const handleChat = (doctorName) => {
    setChatMessage(
      `Chat with ${doctorName} is not connected yet.`
    );
  };

  // DOCTOR INITIALS
  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <>
      <style>{`
        .fd-layout {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 68px);
          background: #0B0D0E;
          color: #F3F4F6;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }

        /* SIDEBAR - MATCHES PATIENT DASHBOARD */

        .fd-sidebar {
          width: 238px;
          min-width: 238px;
          flex-shrink: 0;
          background: #0D1011;
          border-right: 1px solid #24292B;
          padding: 35px 16px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .fd-sidebar-heading {
          padding: 0 13px;
          font-size: 10px;
          letter-spacing: 1.6px;
          font-weight: 700;
          color: #697579;
          margin-bottom: 22px;
        }

        .fd-menu {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .fd-menu-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 14px;
          color: #939EA1;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .fd-menu-link:hover {
          color: #20DCC0;
          background: #142824;
        }

        .fd-menu-link.active {
          color: #20DCC0;
          background: #142824;
          font-weight: 600;
        }

        .fd-menu-icon {
          font-size: 19px;
          width: 22px;
          text-align: center;
        }

        .fd-sidebar-bottom {
          margin-top: auto;
          padding-top: 35px;
        }

        .fd-support-card {
          background: #171C1D;
          border: 1px solid #252D2F;
          border-radius: 11px;
          padding: 16px;
          display: flex;
          gap: 12px;
        }

        .fd-support-icon {
          color: #20DCC0;
          font-size: 22px;
        }

        .fd-support-title {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .fd-support-text {
          color: #818C90;
          font-size: 11px;
          line-height: 1.6;
        }

        .fd-sidebar-footer {
          padding: 22px 8px 0;
          color: #657174;
          font-size: 11px;
        }

        /* MAIN AREA */

        .fd-main {
          flex: 1;
          min-width: 0;
          width: 0;
        }

        .fd-topbar {
          min-height: 76px;
          background: #0D1011;
          border-bottom: 1px solid #24292B;
          display: flex;
          align-items: center;
          padding: 14px 32px;
          box-sizing: border-box;
        }

        .fd-topbar-search {
          display: flex;
          align-items: center;
          background: #1B1F20;
          border: 1px solid #292F30;
          border-radius: 7px;
          padding: 0 14px;
          width: 320px;
          max-width: 100%;
        }

        .fd-search-icon {
          font-size: 24px;
          color: #778285;
        }

        .fd-search {
          background: transparent;
          border: none;
          outline: none;
          padding: 12px;
          color: #F3F4F6;
          font-size: 12px;
          width: 100%;
          min-width: 0;
        }

        .fd-search::placeholder {
          color: #778285;
        }

        .fd-content {
          width: 100%;
          max-width: 1450px;
          padding: 32px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* PAGE HEADING */

        .fd-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 28px;
        }

        .fd-eyebrow {
          color: #20DCC0;
          font-size: 10px;
          letter-spacing: 1.8px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .fd-title {
          color: #F3F4F6;
          font-size: 29px;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .fd-subtitle {
          color: #899497;
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
        }

        .fd-count {
          color: #A4B5B0;
          background: #131C1A;
          border: 1px solid #293432;
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 11px;
        }

        /* FILTER BAR */

        .fd-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 17px;
          background: #181C1D;
          border: 1px solid #2A3031;
          border-radius: 11px;
          margin-bottom: 27px;
        }

        .fd-filter {
          min-width: 200px;
          height: 42px;
          padding: 0 12px;
          color: #C5CECE;
          background: #0D1112;
          border: 1px solid #303B3B;
          border-radius: 7px;
          outline: none;
          font-size: 12px;
        }

        .fd-filter:focus,
        .fd-search:focus {
          border-color: #20DCC0;
        }

        .fd-filter option {
          background: #141919;
          color: #E8EEEE;
        }

        .fd-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
          flex-wrap: wrap;
        }

        .fd-section-title {
          color: #F3F4F6;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .fd-section-subtitle {
          color: #899497;
          font-size: 12px;
          margin: 7px 0 0;
        }

        /* DOCTOR CARDS */

        .fd-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .fd-card {
          min-width: 0;
          padding: 23px;
          text-align: center;
          background: #181C1D;
          border: 1px solid #2A3031;
          border-radius: 11px;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .fd-card:hover {
          border-color: #20DCC0;
          background: #1B2523;
          transform: translateY(-3px);
        }

        .fd-photo-wrap {
          width: 88px;
          height: 88px;
          margin: 0 auto 17px;
        }

        .fd-photo,
        .fd-initials {
          width: 88px;
          height: 88px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #20DCC0;
          background: #203A34;
        }

        .fd-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20DCC0;
          font-size: 25px;
          font-weight: 700;
        }

        .fd-name {
          color: #F1F5F5;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 11px;
          overflow-wrap: anywhere;
        }

        .fd-specialization {
          display: inline-block;
          color: #20DCC0;
          background: #203A34;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 10px;
          margin: 0 0 14px;
        }

        .fd-detail {
          color: #899497;
          font-size: 11px;
          line-height: 1.6;
          overflow-wrap: anywhere;
          min-height: 32px;
          margin: 0 0 9px;
        }

        .fd-availability {
          color: #AAB5B5;
          font-size: 11px;
          line-height: 1.6;
          min-height: 34px;
          margin: 0 0 15px;
        }

        .fd-divider {
          height: 1px;
          background: #293333;
          margin-bottom: 16px;
        }

        .fd-actions {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .fd-chat,
        .fd-book {
          width: 100%;
          min-height: 38px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .fd-chat {
          background: transparent;
          color: #C5CECE;
          border: 1px solid #697579;
        }

        .fd-chat:hover {
          color: #20DCC0;
          border-color: #20DCC0;
        }

        .fd-book {
          background: #153B36;
          color: #20DCC0;
          border: 1px solid #20A995;
        }

        .fd-book:hover {
          background: #20DCC0;
          color: #071411;
        }

        /* MESSAGES */

        .fd-message {
          padding: 13px 16px;
          margin-bottom: 20px;
          color: #20DCC0;
          background: #153B36;
          border: 1px solid #285A50;
          border-radius: 8px;
          font-size: 12px;
        }

        .fd-message-close {
          float: right;
          color: inherit;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .fd-state {
          padding: 55px 15px;
          text-align: center;
          color: #899497;
          background: #181C1D;
          border: 1px solid #2A3031;
          border-radius: 11px;
          font-size: 13px;
        }

        /* PAGINATION */

        .fd-pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 7px;
          margin-top: 25px;
        }

        .fd-page-button {
          min-width: 35px;
          height: 34px;
          padding: 0 10px;
          color: #AAB5B5;
          background: #181C1D;
          border: 1px solid #303B3B;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
        }

        .fd-page-button.active {
          color: #071411;
          background: #20DCC0;
          border-color: #20DCC0;
          font-weight: 700;
        }

        .fd-page-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .fd-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 950px) {
          .fd-sidebar {
            width: 205px;
            min-width: 205px;
          }

          .fd-content {
            padding: 25px 22px;
          }

          .fd-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .fd-layout {
            flex-direction: column;
          }

          .fd-sidebar {
            width: 100%;
            min-width: 0;
            padding: 18px 13px;
            border-right: none;
            border-bottom: 1px solid #24292B;
          }

          .fd-sidebar-heading {
            margin-bottom: 13px;
          }

          .fd-menu {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
          }

          .fd-menu-link {
            padding: 9px;
            font-size: 10px;
            gap: 6px;
          }

          .fd-menu-icon {
            width: auto;
            font-size: 14px;
          }

          .fd-sidebar-bottom {
            display: none;
          }

          .fd-topbar {
            min-height: 65px;
            padding: 12px 18px;
          }

          .fd-content {
            padding: 22px 18px;
          }
        }

        @media (max-width: 480px) {
          .fd-grid {
            grid-template-columns: 1fr;
          }

          .fd-title {
            font-size: 24px;
          }

          .fd-toolbar {
            padding: 12px;
          }

          .fd-filter {
            width: 100%;
          }
        }
      `}</style>

      <div className="fd-layout">

        {/* LEFT SIDEBAR */}

        <aside className="fd-sidebar">
          <div className="fd-sidebar-heading">
            PATIENT WORKSPACE
          </div>

          <nav className="fd-menu">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/patient-dashboard"}
                className={({ isActive }) =>
                  `fd-menu-link ${isActive ? "active" : ""}`
                }
              >
                <span className="fd-menu-icon">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="fd-sidebar-bottom">
            <div className="fd-support-card">
              <span className="fd-support-icon">✚</span>
              <div>
                <div className="fd-support-title">
                  Your health, organized
                </div>
                <div className="fd-support-text">
                  Your medical services in one place.
                </div>
              </div>
            </div>

            <div className="fd-sidebar-footer">
              HealthWave Patient Portal
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <div className="fd-main">

          {/* TOPBAR */}

          <header className="fd-topbar">
            <div className="fd-topbar-search">
              <span className="fd-search-icon">⌕</span>
              <input
                className="fd-search"
                type="search"
                placeholder="Search doctors by name or specialization..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search doctors"
              />
            </div>
          </header>

          {/* PAGE CONTENT */}

          <main className="fd-content">

            {/* HEADING */}

            <div className="fd-heading">
              <div>
                <div className="fd-eyebrow">
                  PATIENT PORTAL
                </div>

                <h1 className="fd-title">
                  Find Doctors
                </h1>

                <p className="fd-subtitle">
                  Find the right specialist and book your appointment.
                </p>
              </div>

              <div className="fd-count">
                {filteredDoctors.length} Doctors Available
              </div>
            </div>

            {/* FILTER */}

            <div className="fd-toolbar">
              <select
                className="fd-filter"
                value={specialization}
                onChange={(e) =>
                  handleSpecialization(e.target.value)
                }
                aria-label="Filter by specialization"
              >
                {specializations.map((item) => (
                  <option key={item} value={item}>
                    {item === "All"
                      ? "All Specializations"
                      : item}
                  </option>
                ))}
              </select>
            </div>

            {/* CHAT MESSAGE */}

            {chatMessage && (
              <div className="fd-message">
                {chatMessage}
                <button
                  type="button"
                  className="fd-message-close"
                  onClick={() => setChatMessage("")}
                  aria-label="Close message"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SECTION HEADING */}

            <div className="fd-section-header">
              <div>
                <h2 className="fd-section-title">
                  Our Medical Specialists
                </h2>
                <p className="fd-section-subtitle">
                  Browse registered doctors and choose your specialist.
                </p>
              </div>
            </div>

            {/* DOCTOR LIST */}

            {loading ? (
              <div className="fd-state">
                Loading doctors...
              </div>
            ) : error ? (
              <div className="fd-state">
                {error}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="fd-state">
                No doctors found. Try another search or specialization.
              </div>
            ) : (
              <>
                <div className="fd-grid">
                  {currentDoctors.map((doctor, index) => (
                    <div
                      className="fd-card"
                      key={doctor.id ?? `${doctor.name}-${index}`}
                    >
                      <div className="fd-photo-wrap">
                        {doctor.image && (
                          <img
                            className="fd-photo"
                            src={doctor.image}
                            alt={doctor.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";

                              const fallback =
                                e.currentTarget.nextElementSibling;

                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        )}

                        <div
                          className="fd-initials"
                          style={{
                            display: doctor.image ? "none" : "flex"
                          }}
                        >
                          {getInitials(doctor.name)}
                        </div>
                      </div>

                      <h3 className="fd-name">
                        {doctor.name}
                      </h3>

                      <p className="fd-specialization">
                        {doctor.specialization}
                      </p>

                      <p className="fd-detail">
                        {doctor.email}
                      </p>

                      <p className="fd-availability">
                        {doctor.availability
                          ? `Availability: ${doctor.availability}`
                          : "Availability: Check appointment slots"}
                      </p>

                      <div className="fd-divider" />

                      <div className="fd-actions">
                        <button
                          type="button"
                          className="fd-chat"
                          onClick={() => handleChat(doctor.name)}
                        >
                          Chat
                        </button>

                        <button
                          type="button"
                          className="fd-book"
                          onClick={() =>
                            handleBookAppointment(doctor.id)
                          }
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}

                {totalPages > 1 && (
                  <div className="fd-pagination">
                    <button
                      type="button"
                      className="fd-page-button"
                      disabled={page === 1}
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                    >
                      ‹
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((pageNumber) => (
                      <button
                        type="button"
                        key={pageNumber}
                        className={
                          `fd-page-button ${
                            page === pageNumber ? "active" : ""
                          }`
                        }
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="fd-page-button"
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default FindDoctors;
