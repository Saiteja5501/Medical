
import React, { useState, useEffect, useCallback } from "react";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch all reports for admin
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setStatus("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/reports/admin/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session expired or authentication token is missing."
            : response.status === 403
            ? "You are not authorized to view admin reports."
            : "Failed to fetch reports."
        );
      }

      const data = await response.json();

      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Admin Reports Error:", error);
      setStatus(error.message || "Error fetching reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Download report PDF
  const downloadReport = async (reportId) => {
    try {
      setDownloadingId(reportId);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/reports/download/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to download this report.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `medical-report-${reportId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error);
      setStatus(error.message || "Unable to download this report.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Search reports
  const filteredReports = reports.filter((report) => {
    const searchValue = search.toLowerCase();

    return (
      (report.patient_name || "").toLowerCase().includes(searchValue) ||
      (report.doctor_name || "").toLowerCase().includes(searchValue) ||
      (report.reportTitle || "").toLowerCase().includes(searchValue) ||
      (report.description || "").toLowerCase().includes(searchValue)
    );
  });

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Patient Medical Reports</h2>
          <p style={subtitleStyle}>
            View and manage medical reports uploaded for all patients.
          </p>
        </div>

        <div style={countBadge}>
          <span>📄</span>
          <span>{reports.length} Reports</span>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={summaryGrid}>
        <div style={summaryCard}>
          <span style={summaryLabel}>Total Reports</span>
          <h2 style={summaryValue}>{reports.length}</h2>
        </div>

        <div style={summaryCard}>
          <span style={summaryLabel}>Reports with PDF</span>
          <h2 style={summaryValue}>
            {reports.filter((r) => Number(r.has_pdf) === 1).length}
          </h2>
        </div>

        <div style={summaryCard}>
          <span style={summaryLabel}>Reports without PDF</span>
          <h2 style={summaryValue}>
            {reports.filter((r) => Number(r.has_pdf) !== 1).length}
          </h2>
        </div>
      </div>

      {/* ERROR */}
      {status && (
        <div style={errorStyle}>
          ⚠ {status}
        </div>
      )}

      {/* REPORTS CARD */}
      <div style={cardStyle}>
        <div style={cardHeader}>
          <div>
            <h3 style={cardTitle}>All Patient Reports</h3>
            <p style={cardSubtitle}>
              Medical documents uploaded by doctors and patients.
            </p>
          </div>

          <button
            style={refreshButton}
            onClick={fetchReports}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* SEARCH */}
        <div style={searchWrapper}>
          <input
            type="text"
            placeholder="Search patient, doctor or report..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        {loading ? (
          <div style={emptyState}>
            <div style={loadingIcon}>⟳</div>
            <p>Loading patient reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>📁</div>
            <h3 style={emptyTitle}>
              {reports.length === 0
                ? "No Reports Found"
                : "No Matching Reports"}
            </h3>
            <p style={emptyText}>
              {reports.length === 0
                ? "Patient medical reports will appear here when they are uploaded."
                : "Try searching with another patient or report name."}
            </p>
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th style={th}>Patient</th>
                  <th style={th}>Doctor</th>
                  <th style={th}>Report Title</th>
                  <th style={th}>Description</th>
                  <th style={th}>Date</th>
                  <th style={th}>PDF</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report, index) => (
                  <tr
                    key={report.id}
                    style={{
                      ...tr,
                      background:
                        index % 2 === 0 ? "#181C1D" : "#1C2122"
                    }}
                  >
                    <td style={td}>
                      <div style={personName}>
                        <span style={personIcon}>👤</span>
                        <div>
                          <div style={personTitle}>
                            {report.patient_name || "Unknown Patient"}
                          </div>
                          <div style={personId}>
                            ID: {report.patient_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      {report.doctor_name || "—"}
                    </td>

                    <td style={td}>
                      <span style={reportTitle}>
                        {report.reportTitle || "Untitled Report"}
                      </span>
                    </td>

                    <td style={descriptionCell}>
                      {report.description || "No description"}
                    </td>

                    <td style={td}>
                      <span style={dateText}>
                        {report.date
                          ? new Date(report.date).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>

                    <td style={td}>
                      {Number(report.has_pdf) === 1 ? (
                        <button
                          style={downloadButton}
                          onClick={() => downloadReport(report.id)}
                          disabled={downloadingId === report.id}
                        >
                          {downloadingId === report.id
                            ? "Downloading..."
                            : "↓ Download"}
                        </button>
                      ) : (
                        <span style={noPdfBadge}>No PDF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= DARK HEALTHWAVE STYLES ================= */

const pageStyle = {
  width: "100%",
  minWidth: 0,
  minHeight: "100vh",
  margin: 0,
  padding: "30px",
  background: "#0B0D0E",
  fontFamily: "Segoe UI, system-ui, sans-serif",
  color: "#E8EEEE",
  boxSizing: "border-box"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "25px"
};

const titleStyle = {
  fontSize: "27px",
  fontWeight: "700",
  margin: "0 0 7px",
  color: "#E8EEEE"
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#899497",
  margin: 0
};

const countBadge = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "11px 16px",
  borderRadius: "9px",
  background: "#153B36",
  border: "1px solid #245B52",
  color: "#20DCC0",
  fontSize: "13px",
  fontWeight: "600"
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "25px"
};

const summaryCard = {
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "11px",
  padding: "20px"
};

const summaryLabel = {
  color: "#899497",
  fontSize: "13px"
};

const summaryValue = {
  color: "#20DCC0",
  fontSize: "27px",
  margin: "12px 0 0"
};

const errorStyle = {
  padding: "13px 16px",
  marginBottom: "20px",
  borderRadius: "8px",
  background: "#301C1C",
  border: "1px solid #653333",
  color: "#FF8585",
  fontSize: "14px"
};

const cardStyle = {
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "13px",
  overflow: "hidden"
};

const cardHeader = {
  padding: "21px 23px",
  borderBottom: "1px solid #293333",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px"
};

const cardTitle = {
  fontSize: "17px",
  fontWeight: "650",
  color: "#E8EEEE",
  margin: "0 0 5px"
};

const cardSubtitle = {
  fontSize: "12px",
  color: "#899497",
  margin: 0
};

const refreshButton = {
  padding: "9px 15px",
  borderRadius: "7px",
  border: "1px solid #245B52",
  background: "#153B36",
  color: "#20DCC0",
  cursor: "pointer",
  fontWeight: "600"
};

const searchWrapper = {
  padding: "18px 22px",
  borderBottom: "1px solid #293333"
};

const searchInput = {
  width: "100%",
  maxWidth: "450px",
  padding: "12px 14px",
  background: "#101515",
  border: "1px solid #303B3B",
  borderRadius: "8px",
  color: "#E8EEEE",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "13px"
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  width: "100%",
  minWidth: "1050px",
  borderCollapse: "collapse"
};

const theadRow = {
  background: "#202627"
};

const th = {
  padding: "15px 17px",
  textAlign: "left",
  color: "#AAB5B5",
  fontSize: "12px",
  fontWeight: "600",
  whiteSpace: "nowrap"
};

const tr = {
  borderBottom: "1px solid #293333"
};

const td = {
  padding: "16px 17px",
  color: "#E8EEEE",
  fontSize: "13px"
};

const personName = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: "140px"
};

const personIcon = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#153B36",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const personTitle = {
  fontWeight: "600",
  color: "#E8EEEE",
  whiteSpace: "nowrap"
};

const personId = {
  fontSize: "11px",
  color: "#899497",
  marginTop: "4px"
};

const reportTitle = {
  color: "#20DCC0",
  fontWeight: "600"
};

const descriptionCell = {
  padding: "16px 17px",
  color: "#AAB5B5",
  fontSize: "12px",
  maxWidth: "230px",
  lineHeight: "1.5",
  overflowWrap: "anywhere"
};

const dateText = {
  color: "#AAB5B5",
  fontSize: "12px",
  whiteSpace: "nowrap"
};

const downloadButton = {
  padding: "8px 11px",
  background: "#153B36",
  border: "1px solid #245B52",
  color: "#20DCC0",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600",
  whiteSpace: "nowrap"
};

const noPdfBadge = {
  color: "#899497",
  fontSize: "11px",
  background: "#252B2C",
  padding: "6px 9px",
  borderRadius: "5px"
};

const emptyState = {
  padding: "55px 20px",
  textAlign: "center",
  color: "#899497"
};

const loadingIcon = {
  fontSize: "32px",
  color: "#20DCC0",
  marginBottom: "10px"
};

const emptyIcon = {
  fontSize: "38px",
  marginBottom: "12px"
};

const emptyTitle = {
  color: "#E8EEEE",
  fontSize: "17px",
  margin: "0 0 8px"
};

const emptyText = {
  color: "#899497",
  fontSize: "13px",
  maxWidth: "380px",
  margin: "0 auto",
  lineHeight: "1.6"
};

export default Reports;
