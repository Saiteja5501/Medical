
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import API from "../api";

function PatientDashboard() {
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const patientName =
    sessionStorage.getItem("userName") || "Patient";

  const patientId =
    sessionStorage.getItem("patientId") ||
    sessionStorage.getItem("userId");

  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    prescriptions: 0,
    reports: 0
  });

  const [statsLoading, setStatsLoading] = useState(true);

  // FETCH PATIENT DASHBOARD STATISTICS
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!patientId) {
        setStatsLoading(false);
        return;
      }

      try {
        const results = await Promise.allSettled([
          API.get(`/appointments/patient/${patientId}`),
          API.get(`/prescriptions/patient/${patientId}`),
          API.get(`/reports/patient/${patientId}`)
        ]);

        const appointmentsData =
          results[0].status === "fulfilled"
            ? results[0].value.data
            : [];

        const prescriptionsData =
          results[1].status === "fulfilled"
            ? results[1].value.data
            : [];

        const reportsData =
          results[2].status === "fulfilled"
            ? results[2].value.data
            : [];

        const appointments = Array.isArray(appointmentsData)
          ? appointmentsData
          : appointmentsData?.appointments || [];

        const prescriptions = Array.isArray(prescriptionsData)
          ? prescriptionsData
          : prescriptionsData?.prescriptions || [];

        const reports = Array.isArray(reportsData)
          ? reportsData
          : reportsData?.reports || [];

        setStatistics({
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(
            (appointment) =>
              appointment.status?.toLowerCase() === "completed"
          ).length,
          prescriptions: prescriptions.length,
          reports: reports.length
        });
      } catch (error) {
        console.error("Dashboard statistics error:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStatistics();
  }, [patientId]);

  // SIDEBAR MENU ITEMS
  const menuItems = [
    { name: "Dashboard", icon: "▦", path: "/patient-dashboard" },
    { name: "All Doctors", icon: "⚕", path: "/patient/doctors" },
    { name: "My Profile", icon: "◉", path: "/patient/profile" },
    { name: "Appointments", icon: "▣", path: "/patient/appointments" },
    { name: "Medical History", icon: "◷", path: "/patient/medical-history" },
    { name: "Prescriptions", icon: "✚", path: "/patient/prescriptions" },
    { name: "Reports", icon: "▤", path: "/patient/reports" }
  ];

  // MEDICAL SERVICES
  const services = [
    {
      title: "All Doctors",
      description:
        "Explore available doctors and find the right specialist for your healthcare needs.",
      icon: "⚕",
      path: "/patient/doctors",
      label: "Find a doctor"
    },
    {
      title: "Appointments",
      description:
        "Book consultations and manage your upcoming doctor visits.",
      icon: "📅",
      path: "/patient/appointments",
      label: "Manage appointments"
    },
    {
      title: "Medical History",
      description:
        "Access your medical history and previous health records.",
      icon: "📁",
      path: "/patient/medical-history",
      label: "View history"
    },
    {
      title: "Prescriptions",
      description:
        "Review medicines and instructions prescribed by doctors.",
      icon: "💊",
      path: "/patient/prescriptions",
      label: "View prescriptions"
    },
    {
      title: "Medical Reports",
      description:
        "Upload, manage and download your medical documents.",
      icon: "📄",
      path: "/patient/reports",
      label: "Manage reports"
    },
    {
      title: "My Profile",
      description:
        "View and update your personal account information.",
      icon: "👤",
      path: "/patient/profile",
      label: "Manage profile"
    }
  ];

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    {
      title: "Total Appointments",
      value: statistics.totalAppointments,
      icon: "📅",
      description: "Appointments booked"
    },
    {
      title: "Completed Visits",
      value: statistics.completedAppointments,
      icon: "✓",
      description: "Successfully completed"
    },
    {
      title: "Prescriptions",
      value: statistics.prescriptions,
      icon: "💊",
      description: "Prescriptions received"
    },
    {
      title: "Medical Reports",
      value: statistics.reports,
      icon: "📄",
      description: "Available medical reports"
    }
  ];

  return (
    <div style={styles.layout}>
      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarSectionLabel}>
          PATIENT WORKSPACE
        </div>

        <div style={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/patient-dashboard"}
              style={({ isActive }) => ({
                ...styles.sidebarLink,
                ...(isActive ? styles.activeSidebarLink : {})
              })}
            >
              <span style={styles.sidebarIcon}>
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.supportCard}>
            <span style={styles.supportIcon}>✚</span>

            <div>
              <div style={styles.supportTitle}>
                Your health, organized
              </div>

              <div style={styles.supportText}>
                Your medical services in one place.
              </div>
            </div>
          </div>

          <div style={styles.sidebarFooter}>
            HealthWave Patient Portal
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={styles.mainArea}>
        {/* TOP BAR */}
        <header style={styles.topbar}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              placeholder="Search medical services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              aria-label="Search medical services"
            />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={styles.content}>
          {/* PAGE HEADING */}
          <div style={styles.pageHeading}>
            <div>
              <div style={styles.eyebrow}>
                PATIENT PORTAL
              </div>

              <h1 style={styles.pageTitle}>
                Dashboard
              </h1>

              <p style={styles.pageSubtitle}>
                Welcome back, {patientName}. Manage your healthcare
                services from one place.
              </p>
            </div>

            <div style={styles.portalTag}>
              <span style={styles.statusDot}></span>
              Patient workspace
            </div>
          </div>

          {/* WELCOME BANNER */}
          <section style={styles.welcomeBanner}>
            <div style={styles.bannerContent}>
              <div style={styles.bannerLabel}>
                HEALTHWAVE CARE
              </div>

              <h2 style={styles.bannerTitle}>
                Your health journey,
                <br />
                made simpler.
              </h2>

              <p style={styles.bannerText}>
                Book doctor appointments, review prescriptions
                and keep your medical records organized.
              </p>

              <Link
                to="/patient/appointments"
                style={styles.primaryButton}
              >
                Book an Appointment
                <span>↗</span>
              </Link>
            </div>

            <div style={styles.bannerGraphic}>
              <div style={styles.graphicOuter}>
                <div style={styles.graphicInner}>
                  ✚
                </div>
              </div>
            </div>
          </section>

          {/* PATIENT STATISTICS */}
          <div style={styles.statsGrid}>
            {statCards.map((item, index) => (
              <div key={index} style={styles.statCard}>
                <div style={styles.statTop}>
                  <span style={styles.statTitle}>
                    {item.title}
                  </span>

                  <span style={styles.statIcon}>
                    {item.icon}
                  </span>
                </div>

                <div style={styles.statNumber}>
                  {statsLoading ? "..." : item.value}
                </div>

                <div style={styles.statDescription}>
                  {item.description}
                </div>
              </div>
            ))}
          </div>

          {/* MEDICAL SERVICES */}
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Medical Services
              </h2>

              <p style={styles.sectionSubtitle}>
                Quick access to your healthcare tools
              </p>
            </div>

            <span style={styles.serviceCount}>
              {filteredServices.length} services
            </span>
          </div>

          <div style={styles.serviceGrid}>
            {filteredServices.map((service, index) => (
              <Link
                key={service.path}
                to={service.path}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...styles.serviceCard,
                  ...(hoveredCard === index
                    ? styles.serviceCardHover
                    : {})
                }}
              >
                <div style={styles.cardTop}>
                  <div style={styles.serviceIcon}>
                    {service.icon}
                  </div>

                  <span style={styles.cardArrow}>
                    ↗
                  </span>
                </div>

                <h3 style={styles.cardTitle}>
                  {service.title}
                </h3>

                <p style={styles.cardDescription}>
                  {service.description}
                </p>

                <div style={styles.cardFooter}>
                  {service.label}
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div style={styles.emptyState}>
              No medical services match your search.
            </div>
          )}

          {/* BOTTOM INFORMATION PANEL */}
          <section style={styles.bottomPanel}>
            <div style={styles.bottomPanelIcon}>
              ✚
            </div>

            <div>
              <h3 style={styles.bottomPanelTitle}>
                Everything in one place
              </h3>

              <p style={styles.bottomPanelText}>
                Use your dashboard to navigate between doctors,
                appointments, medical history, prescriptions and reports.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* =========================================
   INLINE STYLES - MEDUX INSPIRED
========================================= */

const styles = {
  layout: {
    display: "flex",
    minHeight: "calc(100vh - 68px)",
    width: "100%",
    background: "#0B0D0E",
    color: "#F3F4F6",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  },

  sidebar: {
    width: "238px",
    minWidth: "238px",
    background: "#0D1011",
    borderRight: "1px solid #24292B",
    padding: "35px 16px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },

  sidebarSectionLabel: {
    padding: "0 13px",
    fontSize: "10px",
    letterSpacing: "1.6px",
    fontWeight: "700",
    color: "#697579",
    marginBottom: "22px"
  },

  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "7px"
  },

  sidebarLink: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 14px",
    color: "#939EA1",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
    borderRadius: "8px"
  },

  activeSidebarLink: {
    color: "#20DCC0",
    background: "#142824",
    fontWeight: "600"
  },

  sidebarIcon: {
    fontSize: "19px",
    width: "22px",
    textAlign: "center"
  },

  sidebarBottom: {
    marginTop: "auto",
    paddingTop: "35px"
  },

  supportCard: {
    background: "#171C1D",
    border: "1px solid #252D2F",
    borderRadius: "11px",
    padding: "16px",
    display: "flex",
    gap: "12px"
  },

  supportIcon: {
    color: "#20DCC0",
    fontSize: "22px"
  },

  supportTitle: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "6px"
  },

  supportText: {
    color: "#818C90",
    fontSize: "11px",
    lineHeight: "1.6"
  },

  sidebarFooter: {
    padding: "22px 8px 0",
    color: "#657174",
    fontSize: "11px"
  },

  mainArea: {
    flex: 1,
    minWidth: 0
  },

  topbar: {
    minHeight: "76px",
    background: "#0D1011",
    borderBottom: "1px solid #24292B",
    display: "flex",
    alignItems: "center",
    padding: "14px 32px",
    boxSizing: "border-box"
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#1B1F20",
    border: "1px solid #292F30",
    borderRadius: "7px",
    padding: "0 14px",
    width: "320px",
    maxWidth: "100%"
  },

  searchIcon: {
    fontSize: "24px",
    color: "#778285"
  },

  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "12px",
    color: "#F3F4F6",
    fontSize: "12px",
    width: "100%"
  },

  content: {
    padding: "32px",
    maxWidth: "1450px",
    margin: "0 auto"
  },

  pageHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px"
  },

  eyebrow: {
    color: "#20DCC0",
    fontSize: "10px",
    letterSpacing: "1.8px",
    fontWeight: "700",
    marginBottom: "10px"
  },

  pageTitle: {
    fontSize: "29px",
    fontWeight: "700",
    margin: "0 0 10px"
  },

  pageSubtitle: {
    color: "#899497",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0
  },

  portalTag: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 14px",
    border: "1px solid #293432",
    background: "#131C1A",
    borderRadius: "7px",
    fontSize: "11px",
    color: "#A4B5B0"
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#20DCC0"
  },

  welcomeBanner: {
    background: "linear-gradient(110deg, #182B28 0%, #11201E 55%, #101718 100%)",
    border: "1px solid #29423C",
    borderRadius: "12px",
    padding: "34px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "34px",
    overflow: "hidden"
  },

  bannerContent: {
    maxWidth: "510px",
    position: "relative",
    zIndex: 1
  },

  bannerLabel: {
    color: "#20DCC0",
    fontSize: "10px",
    letterSpacing: "2px",
    fontWeight: "700",
    marginBottom: "14px"
  },

  bannerTitle: {
    fontSize: "clamp(24px, 3vw, 34px)",
    fontWeight: "750",
    lineHeight: "1.25",
    margin: "0 0 15px"
  },

  bannerText: {
    color: "#A3B4AF",
    fontSize: "13px",
    lineHeight: "1.8",
    marginBottom: "24px"
  },

  primaryButton: {
    background: "#20DCC0",
    color: "#071411",
    padding: "12px 17px",
    display: "inline-flex",
    alignItems: "center",
    gap: "18px",
    borderRadius: "7px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "12px"
  },

  bannerGraphic: {
    width: "220px",
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1
  },

  graphicOuter: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    border: "1px solid #286C60",
    background: "radial-gradient(circle, #205C50 0%, #15342E 50%, transparent 72%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  graphicInner: {
    width: "105px",
    height: "105px",
    borderRadius: "50%",
    background: "#20DCC0",
    color: "#0B211C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "65px",
    boxShadow: "0 0 55px rgba(32,220,192,0.2)"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
    gap: "16px",
    marginBottom: "35px"
  },

  statCard: {
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    padding: "21px",
    minHeight: "125px",
    boxSizing: "border-box"
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },

  statTitle: {
    color: "#899497",
    fontSize: "12px",
    fontWeight: "600"
  },

  statIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },

  statNumber: {
    color: "#20DCC0",
    fontSize: "27px",
    fontWeight: "700",
    marginBottom: "6px"
  },

  statDescription: {
    color: "#899497",
    fontSize: "11px"
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px"
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 7px"
  },

  sectionSubtitle: {
    color: "#899497",
    fontSize: "12px",
    margin: 0
  },

  serviceCount: {
    color: "#899497",
    fontSize: "11px"
  },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
    gap: "18px"
  },

  serviceCard: {
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    padding: "23px",
    textDecoration: "none",
    color: "#F3F4F6",
    display: "flex",
    flexDirection: "column",
    minHeight: "220px",
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  },

  serviceCardHover: {
    borderColor: "#20DCC0",
    background: "#1B2523",
    transform: "translateY(-3px)"
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },

  serviceIcon: {
    width: "44px",
    height: "44px",
    background: "#243330",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px"
  },

  cardArrow: {
    color: "#768381",
    fontSize: "20px"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 10px"
  },

  cardDescription: {
    fontSize: "12px",
    color: "#899497",
    lineHeight: "1.8",
    margin: "0 0 24px"
  },

  cardFooter: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#20DCC0",
    fontSize: "11px",
    fontWeight: "600"
  },

  emptyState: {
    padding: "32px",
    color: "#899497",
    background: "#181C1D",
    borderRadius: "10px",
    textAlign: "center",
    marginTop: "16px"
  },

  bottomPanel: {
    marginTop: "28px",
    background: "#161B1C",
    border: "1px solid #293031",
    borderRadius: "10px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  bottomPanelIcon: {
    width: "46px",
    height: "46px",
    background: "#203A34",
    color: "#20DCC0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexShrink: 0
  },

  bottomPanelTitle: {
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 8px"
  },

  bottomPanelText: {
    fontSize: "12px",
    lineHeight: "1.7",
    color: "#899497",
    margin: 0
  }
};

export default PatientDashboard;
