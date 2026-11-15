
import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function PatientReports() {
  const patientId = sessionStorage.getItem("patientId");

  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  /* ================= FETCH REPORTS ================= */
  const fetchReports = useCallback(async () => {
    if (!patientId) return;

    try {
      const response = await API.get(
        `/reports/patient/${patientId}`
      );

      setReports(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Reports Error:", error);
      setStatus(
        error.response?.data?.message || "Unable to load reports"
      );
    }
  }, [patientId]);

  /* ================= FETCH DOCTORS ================= */
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await API.get("/users/doctors");

      setDoctors(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Doctors Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchDoctors();
  }, [fetchReports, fetchDoctors]);

  /* ================= STATUS MESSAGE ================= */
  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => setStatus(""), 6000);
    return () => clearTimeout(timer);
  }, [status]);

  /* ================= UPLOAD REPORT ================= */
  const uploadReport = async () => {
    setStatus("");

    if (!patientId) {
      setStatus("Patient login information not found");
      return;
    }

    if (!doctorId) {
      setStatus("Please select a doctor");
      return;
    }

    if (!reportTitle.trim() || !description.trim()) {
      setStatus("Please enter the report title and description");
      return;
    }

    if (reportTitle.trim().length > 255) {
      setStatus("Report title cannot exceed 255 characters");
      return;
    }

    if (!pdfFile) {
      setStatus("Please select a PDF file");
      return;
    }

    if (
      pdfFile.type !== "application/pdf" ||
      !pdfFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setStatus("Only PDF files are allowed");
      return;
    }

    if (pdfFile.size > 5 * 1024 * 1024) {
      setStatus("PDF file must be smaller than 5 MB");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("doctorId", doctorId);
      formData.append("patientId", patientId);
      formData.append("reportTitle", reportTitle.trim());
      formData.append("description", description.trim());
      formData.append("pdf", pdfFile);

      const response = await API.post(
        "/reports",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        setStatus("Medical report uploaded successfully!");

        setDoctorId("");
        setReportTitle("");
        setDescription("");
        setPdfFile(null);

        const fileInput = document.getElementById("report-file");
        if (fileInput) fileInput.value = "";

        await fetchReports();
      } else {
        setStatus(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);

      setStatus(
        error.response?.data?.message || "Unable to upload report"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= SECURE PDF DOWNLOAD ================= */
  const handleDownload = async (reportId) => {
    setDownloadingId(reportId);

    try {
      const response = await API.get(
        `/reports/download/${reportId}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf"
      });

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
      setStatus("Unable to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= SEARCH ================= */
  const filteredReports = reports.filter((report) => {
    const search = searchText.toLowerCase();

    return (
      (report.reportTitle || "").toLowerCase().includes(search) ||
      (report.description || "").toLowerCase().includes(search) ||
      (report.doctor_name || "").toLowerCase().includes(search)
    );
  });

  return (
    <div style={page}>
      <div style={mainContent}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <div style={eyebrow}>PATIENT PORTAL / DOCUMENTS</div>
            <h1 style={title}>My Medical Documents</h1>
            <p style={subtitle}>
              Manage, upload and access your medical records securely.
            </p>
          </div>

          <div style={recordCount}>
            <span style={countNumber}>{reports.length}</span>
            <span style={countLabel}>Total Documents</span>
          </div>
        </div>

        {/* STATUS */}
        {status && (
          <div style={statusBox}>
            {status}
          </div>
        )}

        {/* UPLOAD SECTION */}
        <div style={uploadCard}>
          <div style={uploadIcon}>☁</div>

          <h3 style={uploadTitle}>Upload New Medical Record</h3>

          <p style={uploadDescription}>
            Upload your medical reports in PDF format.
            Maximum file size: 5 MB.
          </p>

          <div style={formGrid}>
            <select
              style={formInput}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">Select Doctor</option>

              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>

            <input
              style={formInput}
              type="text"
              placeholder="Enter Report Title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />

            <textarea
              style={descriptionInput}
              placeholder="Enter Report Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={uploadActions}>
            <label htmlFor="report-file" style={fileButton}>
              <span>＋</span> Browse PDF
            </label>

            <input
              id="report-file"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: "none" }}
              onChange={(e) =>
                setPdfFile(e.target.files?.[0] || null)
              }
            />

            <span style={fileName}>
              {pdfFile ? pdfFile.name : "No file selected"}
            </span>

            <button
              style={{
                ...uploadButton,
                opacity: loading ? 0.6 : 1
              }}
              onClick={uploadReport}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>

        {/* DOCUMENT TOOLBAR */}
        <div style={toolbar}>
          <div>
            <h3 style={documentsTitle}>Your Documents</h3>
            <p style={documentsSubtitle}>
              All your uploaded and doctor-generated reports
            </p>
          </div>

          <div style={searchBox}>
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={searchInput}
            />
          </div>
        </div>

        {/* DOCUMENT TABLE */}
        <div style={tableContainer}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>DOCUMENT NAME</th>
                <th style={th}>DOCTOR</th>
                <th style={th}>DATE</th>
                <th style={th}>STATUS</th>
                <th style={th}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" style={emptyCell}>
                    <div style={{ fontSize: "28px" }}>📁</div>
                    No medical documents found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td style={td}>
                      <div style={documentName}>
                        <div style={pdfIcon}>PDF</div>
                        <div>
                          <div style={documentTitle}>
                            {report.reportTitle}
                          </div>
                          <div style={documentDescription}>
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      {report.doctor_name || "—"}
                    </td>

                    <td style={td}>
                      {report.date
                        ? new Date(report.date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td style={td}>
                      <span style={report.has_pdf ? availableBadge : missingBadge}>
                        {report.has_pdf ? "● Available" : "● No PDF"}
                      </span>
                    </td>

                    <td style={td}>
                      {report.has_pdf ? (
                        <button
                          style={downloadButton}
                          disabled={downloadingId === report.id}
                          onClick={() => handleDownload(report.id)}
                        >
                          {downloadingId === report.id
                            ? "Downloading..."
                            : "↓ Download"}
                        </button>
                      ) : (
                        <span style={{ color: "#64748b" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={footer}>
          <span>🔒</span>
          Your medical documents are protected by authenticated access.
        </div>
      </div>
    </div>
  );
}

export default PatientReports;


/* ================= HEALTHWAVE DARK THEME STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#0B0D0E",
  padding: "32px",
  color: "#F3F4F6",
  boxSizing: "border-box",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
};

const mainContent = {
  maxWidth: "1250px",
  margin: "auto"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "30px"
};

const eyebrow = {
  color: "#20DCC0",
  fontSize: "10px",
  letterSpacing: "1.8px",
  fontWeight: "700",
  marginBottom: "10px"
};

const title = {
  fontSize: "29px",
  fontWeight: "700",
  margin: "0 0 9px",
  color: "#F3F4F6"
};

const subtitle = {
  color: "#899497",
  fontSize: "13px",
  margin: 0,
  lineHeight: "1.7"
};

const recordCount = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "#131C1A",
  border: "1px solid #293432",
  padding: "14px 25px",
  borderRadius: "10px"
};

const countNumber = {
  fontSize: "25px",
  color: "#20DCC0",
  fontWeight: "700"
};

const countLabel = {
  fontSize: "11px",
  color: "#899497"
};

const uploadCard = {
  background: "#15191A",
  border: "1px solid #2A3031",
  borderRadius: "11px",
  padding: "30px",
  textAlign: "center",
  marginBottom: "30px"
};

const uploadIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "9px",
  background: "#203A34",
  color: "#20DCC0",
  fontSize: "27px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 14px"
};

const uploadTitle = {
  color: "#F3F4F6",
  fontSize: "18px",
  margin: "0 0 8px"
};

const uploadDescription = {
  color: "#899497",
  fontSize: "13px",
  marginBottom: "22px",
  lineHeight: "1.7"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  textAlign: "left"
};

const formInput = {
  width: "100%",
  boxSizing: "border-box",
  background: "#1B2021",
  border: "1px solid #303738",
  borderRadius: "7px",
  padding: "13px",
  color: "#F3F4F6",
  fontSize: "12px",
  outline: "none"
};

const descriptionInput = {
  gridColumn: "1 / -1",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "85px",
  resize: "vertical",
  background: "#1B2021",
  border: "1px solid #303738",
  borderRadius: "7px",
  padding: "13px",
  color: "#F3F4F6",
  fontSize: "12px",
  outline: "none",
  fontFamily: "inherit"
};

const uploadActions = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginTop: "20px"
};

const fileButton = {
  background: "#203A34",
  color: "#20DCC0",
  border: "1px solid #344D45",
  borderRadius: "7px",
  padding: "11px 17px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};

const fileName = {
  color: "#899497",
  fontSize: "12px",
  maxWidth: "220px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const uploadButton = {
  background: "#20DCC0",
  color: "#0B0D0E",
  border: "none",
  borderRadius: "7px",
  padding: "12px 22px",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const toolbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "18px"
};

const documentsTitle = {
  fontSize: "16px",
  color: "#F3F4F6",
  margin: 0
};

const documentsSubtitle = {
  color: "#899497",
  fontSize: "11px",
  margin: "6px 0 0"
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#1B2021",
  border: "1px solid #303738",
  borderRadius: "7px",
  padding: "0 12px",
  color: "#899497"
};

const searchInput = {
  background: "transparent",
  border: "none",
  outline: "none",
  padding: "12px 0",
  color: "#F3F4F6",
  fontSize: "12px",
  width: "210px"
};

const tableContainer = {
  overflowX: "auto",
  border: "1px solid #2A3031",
  borderRadius: "11px",
  background: "#15191A"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "750px"
};

const th = {
  background: "#181F20",
  color: "#899497",
  padding: "17px 15px",
  textAlign: "left",
  fontSize: "10px",
  letterSpacing: "1px",
  fontWeight: "700",
  borderBottom: "1px solid #2A3031"
};

const td = {
  padding: "15px",
  fontSize: "12px",
  color: "#B3BFBA",
  borderBottom: "1px solid #2A3031"
};

const documentName = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: "200px"
};

const pdfIcon = {
  background: "#203A34",
  color: "#20DCC0",
  padding: "10px 8px",
  borderRadius: "7px",
  fontSize: "10px",
  fontWeight: "700"
};

const documentTitle = {
  color: "#F3F4F6",
  fontWeight: "600",
  marginBottom: "5px"
};

const documentDescription = {
  color: "#899497",
  fontSize: "11px",
  maxWidth: "280px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const availableBadge = {
  background: "#203A34",
  color: "#20DCC0",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "10px",
  whiteSpace: "nowrap"
};

const missingBadge = {
  background: "#302820",
  color: "#E6B65C",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "10px",
  whiteSpace: "nowrap"
};

const downloadButton = {
  background: "#203A34",
  color: "#20DCC0",
  border: "1px solid #344D45",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "11px",
  fontWeight: "600",
  cursor: "pointer",
  whiteSpace: "nowrap"
};

const emptyCell = {
  textAlign: "center",
  padding: "45px",
  color: "#899497",
  fontSize: "13px"
};

const footer = {
  textAlign: "center",
  color: "#899497",
  fontSize: "11px",
  marginTop: "25px"
};

const statusBox = {
  background: "#1D2927",
  color: "#20DCC0",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
  fontSize: "13px",
  border: "1px solid #34433E"
};
