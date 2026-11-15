
import React, { useState, useEffect } from "react";

function MedicalHistory({ patientId }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const id =
    patientId ||
    sessionStorage.getItem("userId") ||
    localStorage.getItem("userId");

  /* ================= FETCH MEDICAL HISTORY ================= */

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!id) {
          setError("Patient information not found. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:5000/medical-history/patient/${id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`
            }
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Unable to load medical history."
          );
        }

        const data = await res.json();

        setHistory(
          data.success && Array.isArray(data.history)
            ? data.history
            : []
        );
      } catch (err) {
        console.error("Failed to fetch medical history:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  /* ================= FORMAT DATE ================= */

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  /* ================= SEARCH RECORDS ================= */

  const filteredHistory = history.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      String(item.diagnosis || "").toLowerCase().includes(searchText) ||
      String(item.treatment || "").toLowerCase().includes(searchText) ||
      String(item.notes || "").toLowerCase().includes(searchText) ||
      String(item.doctor_name || "").toLowerCase().includes(searchText) ||
      String(item.date || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div style={styles.page}>

      {/* PAGE HEADER */}

      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>PATIENT RECORDS</div>

          <h1 style={styles.title}>Medical History</h1>

          <p style={styles.subtitle}>
            View and track your previous diagnoses and medical records.
          </p>
        </div>

        <div style={styles.recordBadge}>
          <span style={styles.dot}></span>
          Personal health records
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>▤</div>

          <div>
            <div style={styles.summaryLabel}>Total Records</div>
            <div style={styles.summaryValue}>{history.length}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>◷</div>

          <div>
            <div style={styles.summaryLabel}>Latest Record</div>

            <div style={styles.summarySmall}>
              {history.length > 0
                ? formatDate(history[0].date)
                : "No records"}
            </div>
          </div>
        </div>
      </div>

      {/* MEDICAL RECORDS */}

      <section style={styles.card}>

        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Your Medical Records</h2>

            <p style={styles.cardSubtitle}>
              Your diagnosis, treatment and consultation history
            </p>
          </div>

          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div style={styles.message}>
            <div style={styles.loader}></div>
            Loading medical records...
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && !error && history.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>▤</div>

            <h3 style={styles.emptyTitle}>
              No medical history found
            </h3>

            <p style={styles.emptyText}>
              Your medical records will appear here when they are added.
            </p>
          </div>
        )}

        {/* NO SEARCH RESULTS */}

        {!loading &&
          !error &&
          history.length > 0 &&
          filteredHistory.length === 0 && (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No matching records</h3>

              <p style={styles.emptyText}>
                Try searching with a different diagnosis, treatment or doctor name.
              </p>
            </div>
          )}

        {/* MEDICAL HISTORY TABLE */}

        {!loading && !error && filteredHistory.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>DOCTOR</th>
                  <th style={styles.th}>DIAGNOSIS</th>
                  <th style={styles.th}>TREATMENT</th>
                  <th style={styles.th}>ADDITIONAL NOTES</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr key={item.id || index}>

                    <td style={styles.td}>
                      <span style={styles.dateBadge}>
                        {formatDate(item.date)}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.doctorName}>
                        {item.doctor_name || "Not available"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.diagnosis}>
                        {item.diagnosis || "Not specified"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.details}>
                        {item.treatment || "Not specified"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.details}>
                        {item.notes || "No additional notes"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div style={styles.tableFooter}>
            Showing {filteredHistory.length} of {history.length} records
          </div>
        )}
      </section>

      {/* INFORMATION PANEL */}

      <div style={styles.infoPanel}>
        <div style={styles.infoIcon}>✚</div>

        <div>
          <h3 style={styles.infoTitle}>Your health records matter</h3>

          <p style={styles.infoText}>
            Keep your medical history available when consulting your doctor.
            Contact your healthcare provider if you notice incorrect information.
          </p>
        </div>
      </div>

    </div>
  );
}

/* =========================================
   INLINE STYLES - MEDUX INSPIRED
========================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0B0D0E",
    color: "#F3F4F6",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "30px"
  },

  eyebrow: {
    color: "#20DCC0",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.8px",
    marginBottom: "10px"
  },

  title: {
    fontSize: "29px",
    fontWeight: "700",
    margin: "0 0 9px"
  },

  subtitle: {
    fontSize: "13px",
    color: "#899497",
    margin: 0,
    lineHeight: "1.7"
  },

  recordBadge: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#131C1A",
    border: "1px solid #293432",
    borderRadius: "7px",
    padding: "11px 15px",
    color: "#A4B5B0",
    fontSize: "11px"
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#20DCC0"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px"
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "10px"
  },

  summaryIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "9px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  },

  summaryLabel: {
    color: "#899497",
    fontSize: "11px",
    marginBottom: "7px"
  },

  summaryValue: {
    color: "#F3F4F6",
    fontSize: "23px",
    fontWeight: "700"
  },

  summarySmall: {
    color: "#F3F4F6",
    fontSize: "13px",
    fontWeight: "600"
  },

  card: {
    background: "#15191A",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    overflow: "hidden"
  },

  cardHeader: {
    padding: "23px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    borderBottom: "1px solid #292F30"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 7px"
  },

  cardSubtitle: {
    color: "#899497",
    fontSize: "11px",
    margin: 0
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#1B2021",
    border: "1px solid #303738",
    borderRadius: "7px",
    padding: "0 12px",
    width: "250px",
    maxWidth: "100%"
  },

  searchIcon: {
    color: "#899497",
    fontSize: "22px"
  },

  searchInput: {
    width: "100%",
    padding: "11px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#F3F4F6",
    fontSize: "12px"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    minWidth: "950px"
  },

  th: {
    padding: "17px 22px",
    background: "#1A2021",
    color: "#899497",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    borderBottom: "1px solid #303738",
    whiteSpace: "nowrap"
  },

  td: {
    padding: "20px 22px",
    borderBottom: "1px solid #292F30",
    fontSize: "12px",
    verticalAlign: "top",
    lineHeight: "1.7",
    minWidth: "140px"
  },

  dateBadge: {
    color: "#AAB6B4",
    background: "#202727",
    border: "1px solid #303B39",
    borderRadius: "6px",
    padding: "7px 10px",
    display: "inline-block",
    fontSize: "11px",
    whiteSpace: "nowrap"
  },

  doctorName: {
    color: "#D1D9DC",
    fontWeight: "600"
  },

  diagnosis: {
    color: "#20DCC0",
    fontWeight: "600"
  },

  details: {
    color: "#A4ADAF",
    lineHeight: "1.7"
  },

  message: {
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#899497",
    fontSize: "13px"
  },

  loader: {
    width: "18px",
    height: "18px",
    border: "2px solid #35413F",
    borderTop: "2px solid #20DCC0",
    borderRadius: "50%"
  },

  errorMessage: {
    padding: "35px",
    color: "#FF9292",
    textAlign: "center",
    fontSize: "13px"
  },

  emptyState: {
    padding: "55px 20px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "38px",
    color: "#20DCC0",
    marginBottom: "15px"
  },

  emptyTitle: {
    color: "#F3F4F6",
    fontSize: "16px",
    margin: "0 0 9px"
  },

  emptyText: {
    color: "#899497",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: 0
  },

  tableFooter: {
    padding: "16px 22px",
    color: "#899497",
    fontSize: "11px",
    borderTop: "1px solid #292F30"
  },

  infoPanel: {
    marginTop: "25px",
    padding: "22px",
    background: "#161B1C",
    border: "1px solid #293031",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "17px"
  },

  infoIcon: {
    width: "45px",
    height: "45px",
    background: "#203A34",
    color: "#20DCC0",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0
  },

  infoTitle: {
    fontSize: "13px",
    margin: "0 0 7px"
  },

  infoText: {
    color: "#899497",
    fontSize: "11px",
    lineHeight: "1.7",
    margin: 0
  }
};

export default MedicalHistory;
