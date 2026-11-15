
import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function DoctorReport() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [status, setStatus] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [newReport, setNewReport] = useState({
    patientId: "",
    reportTitle: "",
    description: ""
  });

  /* ================= FETCH REPORTS ================= */

  const fetchReports = useCallback(async () => {
    const doctorId = sessionStorage.getItem("doctorId");

    if (!doctorId) return;

    try {
      const response = await API.get(`/reports/doctor/${doctorId}`);

      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Doctor Reports Error:", error);

      setStatus(
        error.response?.data?.message || "Unable to load reports"
      );

      setReports([]);
    }
  }, []);

  /* ================= FETCH ACCEPTED PATIENTS ================= */

  const fetchAcceptedPatients = useCallback(async () => {
    const doctorId = sessionStorage.getItem("doctorId");

    if (!doctorId) return;

    try {
      const response = await API.get(
        `/prescriptions/doctor/${doctorId}/accepted-patients`
      );

      if (response.data.success) {
        setPatients(response.data.patients || []);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Accepted Patients Error:", error);

      setStatus(
        error.response?.data?.message ||
        "Unable to load accepted patients"
      );

      setPatients([]);
    }
  }, []);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchReports();
    fetchAcceptedPatients();
  }, [fetchReports, fetchAcceptedPatients]);

  /* ================= STATUS MESSAGE ================= */

  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => {
      setStatus("");
    }, 8000);

    return () => clearTimeout(timer);
  }, [status]);

  /* ================= ADD REPORT ================= */

  const handleAddReport = async () => {
    setStatus("");

    const selectedPatient = patients.find(
      (p) => p.id === Number(newReport.patientId)
    );

    if (!selectedPatient) {
      setStatus("Error: Please select a valid patient");
      return;
    }

    if (!newReport.reportTitle.trim()) {
      setStatus("Error: Report title is required");
      return;
    }

    if (!newReport.description.trim()) {
      setStatus("Error: Description is required");
      return;
    }

    if (newReport.reportTitle.trim().length > 255) {
      setStatus("Error: Report title cannot exceed 255 characters");
      return;
    }

    if (pdfFile) {
      if (
        pdfFile.type !== "application/pdf" ||
        !pdfFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setStatus("Error: Only PDF files are allowed");
        return;
      }

      if (pdfFile.size > 5 * 1024 * 1024) {
        setStatus("Error: PDF file must be smaller than 5 MB");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("patientId", selectedPatient.id);
      formData.append("reportTitle", newReport.reportTitle.trim());
      formData.append("description", newReport.description.trim());

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const response = await API.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        setStatus("Report added successfully!");

        setNewReport({
          patientId: "",
          reportTitle: "",
          description: ""
        });

        setPdfFile(null);

        const fileInput = document.getElementById("doctor-report-pdf");

        if (fileInput) {
          fileInput.value = "";
        }

        await fetchReports();
      } else {
        setStatus(
          response.data.message || "Error adding report"
        );
      }
    } catch (error) {
      console.error("Add Report Error:", error);

      setStatus(
        error.response?.data?.message || "Unable to add report"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= SECURE PDF DOWNLOAD ================= */

  const handleDownload = async (reportId) => {
    setDownloadingId(reportId);
    setStatus("");

    try {
      const response = await API.get(
        `/reports/download/${reportId}`,
        {
          responseType: "blob"
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `medical-report-${reportId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF Download Error:", error);

      setStatus("Unable to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= STYLES ================= */

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "35px 24px",
      background: "#0B0D0E",
      color: "#E8EEEE",
      fontFamily: "Inter, system-ui, sans-serif"
    },

    container: {
      maxWidth: "1200px",
      margin: "0 auto"
    },

    header: {
      marginBottom: "28px"
    },

    title: {
      fontSize: "27px",
      fontWeight: "700",
      color: "#E8EEEE",
      margin: "0 0 8px"
    },

    subtitle: {
      fontSize: "14px",
      color: "#899497",
      margin: 0,
      lineHeight: "1.6"
    },

    formBox: {
      background: "#181C1D",
      padding: "25px",
      borderRadius: "16px",
      marginBottom: "30px",
      border: "1px solid #293333"
    },

    sectionTitle: {
      fontSize: "17px",
      fontWeight: "600",
      color: "#E8EEEE",
      margin: "0 0 20px"
    },

    formRow: {
      display: "flex",
      gap: "14px",
      marginBottom: "16px",
      alignItems: "center",
      flexWrap: "wrap"
    },

    input: {
      flex: "1 1 240px",
      minWidth: 0,
      boxSizing: "border-box",
      padding: "13px 14px",
      borderRadius: "9px",
      border: "1px solid #303B3B",
      background: "#101515",
      color: "#E8EEEE",
      fontSize: "14px",
      outline: "none",
      colorScheme: "dark"
    },

    textarea: {
      width: "100%",
      minHeight: "110px",
      boxSizing: "border-box",
      padding: "13px 14px",
      borderRadius: "9px",
      border: "1px solid #303B3B",
      background: "#101515",
      color: "#E8EEEE",
      marginBottom: "16px",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit"
    },

    fileInput: {
      flex: "1 1 240px",
      minWidth: 0,
      padding: "10px",
      border: "1px solid #303B3B",
      borderRadius: "9px",
      background: "#101515",
      color: "#AAB5B5",
      fontSize: "13px",
      boxSizing: "border-box"
    },

    fileHint: {
      fontSize: "12px",
      color: "#899497",
      margin: "-5px 0 16px"
    },

    primaryBtn: {
      background: "#20DCC0",
      color: "#071411",
      border: "none",
      padding: "13px 23px",
      borderRadius: "9px",
      fontWeight: "700",
      fontSize: "14px",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.6 : 1,
      whiteSpace: "nowrap"
    },

    tableSection: {
      background: "#181C1D",
      border: "1px solid #293333",
      borderRadius: "16px",
      padding: "23px",
      overflow: "hidden"
    },

    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      borderRadius: "10px",
      border: "1px solid #293333"
    },

    table: {
      width: "100%",
      minWidth: "800px",
      borderCollapse: "collapse"
    },

    th: {
      background: "#202727",
      color: "#AAB5B5",
      padding: "15px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.4px",
      whiteSpace: "nowrap",
      borderBottom: "1px solid #303B3B"
    },

    td: {
      padding: "15px",
      fontSize: "13px",
      color: "#D5DEDE",
      borderBottom: "1px solid #293333",
      lineHeight: "1.6",
      verticalAlign: "top"
    },

    tdStrong: {
      padding: "15px",
      fontSize: "13px",
      color: "#E8EEEE",
      fontWeight: "600",
      borderBottom: "1px solid #293333",
      verticalAlign: "top"
    },

    tdMuted: {
      padding: "15px",
      fontSize: "13px",
      color: "#899497",
      borderBottom: "1px solid #293333",
      lineHeight: "1.6",
      maxWidth: "300px",
      verticalAlign: "top"
    },

    downloadBtn: {
      color: "#20DCC0",
      background: "#203A34",
      border: "1px solid #31554C",
      padding: "8px 13px",
      borderRadius: "7px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap"
    },

    emptyText: {
      textAlign: "center",
      padding: "35px",
      color: "#899497",
      fontSize: "14px"
    },

    successText: {
      background: "#142B23",
      color: "#64DDA6",
      padding: "13px 15px",
      borderRadius: "9px",
      border: "1px solid #28533F",
      marginBottom: "20px",
      fontSize: "13px",
      fontWeight: "600"
    },

    errorText: {
      background: "#301C1C",
      color: "#FF8585",
      padding: "13px 15px",
      borderRadius: "9px",
      border: "1px solid #633333",
      marginBottom: "20px",
      fontSize: "13px",
      fontWeight: "600"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <h1 style={styles.title}>Doctor Reports</h1>

          <p style={styles.subtitle}>
            Create, manage and review medical reports for your patients.
          </p>
        </div>

        {/* STATUS MESSAGE */}

        {status && (
          <div
            style={
              status.includes("Error") ||
              status.includes("Unable") ||
              status.includes("required")
                ? styles.errorText
                : styles.successText
            }
          >
            {status}
          </div>
        )}

        {/* ADD REPORT */}

        <div style={styles.formBox}>
          <h3 style={styles.sectionTitle}>Add New Report</h3>

          <div style={styles.formRow}>
            <select
              value={newReport.patientId}
              onChange={(e) =>
                setNewReport({
                  ...newReport,
                  patientId: e.target.value
                })
              }
              style={styles.input}
            >
              <option value="">Select Accepted Patient</option>

              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Report Title"
              maxLength={255}
              value={newReport.reportTitle}
              onChange={(e) =>
                setNewReport({
                  ...newReport,
                  reportTitle: e.target.value
                })
              }
              style={styles.input}
            />
          </div>

          <textarea
            placeholder="Enter report description..."
            value={newReport.description}
            onChange={(e) =>
              setNewReport({
                ...newReport,
                description: e.target.value
              })
            }
            style={styles.textarea}
          />

          <div style={styles.formRow}>
            <input
              id="doctor-report-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) =>
                setPdfFile(e.target.files?.[0] || null)
              }
              style={styles.fileInput}
            />

            <button
              type="button"
              style={styles.primaryBtn}
              onClick={handleAddReport}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Add Report"}
            </button>
          </div>

          <p style={styles.fileHint}>
            PDF attachment is optional. Maximum file size: 5 MB.
          </p>
        </div>

        {/* REPORTS TABLE */}

        <div style={styles.tableSection}>
          <h3 style={styles.sectionTitle}>Patient Reports</h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>PATIENT</th>
                  <th style={styles.th}>REPORT TITLE</th>
                  <th style={styles.th}>DESCRIPTION</th>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>PDF</th>
                </tr>
              </thead>

              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyText}>
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.tdStrong}>
                        {r.patient_name}
                      </td>

                      <td style={styles.td}>
                        {r.reportTitle}
                      </td>

                      <td style={styles.tdMuted}>
                        {r.description}
                      </td>

                      <td style={styles.td}>
                        {r.date
                          ? new Date(r.date).toLocaleString("en-IN")
                          : "—"}
                      </td>

                      <td style={styles.td}>
                        {r.has_pdf ? (
                          <button
                            type="button"
                            style={{
                              ...styles.downloadBtn,
                              opacity:
                                downloadingId === r.id ? 0.6 : 1
                            }}
                            disabled={downloadingId === r.id}
                            onClick={() => handleDownload(r.id)}
                          >
                            {downloadingId === r.id
                              ? "Downloading..."
                              : "↓ Download"}
                          </button>
                        ) : (
                          <span style={{ color: "#899497" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DoctorReport;
