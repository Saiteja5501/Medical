import React, { useState, useEffect, useCallback } from "react";

function DoctorReport() {
  const doctorId = Number(sessionStorage.getItem("doctorId"));
  const doctorName = sessionStorage.getItem("doctorName") || "";

  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [status, setStatus] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [newReport, setNewReport] = useState({
    patientId: "",
    reportTitle: "",
    description: ""
  });

  /* ================= FETCH REPORTS ================= */
  const fetchReports = useCallback(async () => {
    if (!doctorId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/reports/doctor/${doctorId}`
      );

      const data = await res.json();
      console.log("Doctor Reports API:", data);

      if (Array.isArray(data)) {
        setReports(data);
      } else if (Array.isArray(data.reports)) {
        setReports(data.reports);
      } else if (data.success && Array.isArray(data.reports)) {
        setReports(data.reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Doctor report fetch error:", error);
      setReports([]);
    }
  }, [doctorId]);

  /* ================= FETCH ACCEPTED PATIENTS ================= */
  const fetchAcceptedPatients = useCallback(async () => {
    if (!doctorId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/prescriptions/doctor/${doctorId}/accepted-patients`
      );

      const data = await res.json();
      console.log("Accepted Patients API:", data);

      if (Array.isArray(data)) {
        setPatients(data);
      } else if (Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else {
        setPatients([]);
      }

    } catch (error) {
      console.error("Accepted patient fetch error:", error);
      setPatients([]);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchReports();
    fetchAcceptedPatients();
  }, [fetchReports, fetchAcceptedPatients]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 8000);
    return () => clearTimeout(t);
  }, [status]);

  /* ================= ADD REPORT ================= */
  const handleAddReport = async () => {
    setStatus("");

    const selectedPatient = patients.find(
      (p) => p.id === Number(newReport.patientId)
    );

    if (!selectedPatient)
      return setStatus("Error: Please select a valid patient");

    try {
      const formData = new FormData();
      formData.append("doctorId", doctorId);
      formData.append("doctorName", doctorName);
      formData.append("patientId", selectedPatient.id);
      formData.append("patientName", selectedPatient.name);
      formData.append("reportTitle", newReport.reportTitle);
      formData.append("description", newReport.description);

      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch("http://localhost:5000/reports", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Error adding report");
        return;
      }

      setStatus("Report added successfully");
      setNewReport({ patientId: "", reportTitle: "", description: "" });
      setPdfFile(null);
      fetchReports();

    } catch {
      setStatus("Server error");
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Doctor Reports</h1>
        <p style={subtitle}>Create and review patient medical reports</p>

        {status && (
          <div style={status.includes("Error") ? errorText : successText}>
            {status}
          </div>
        )}

        {/* ADD REPORT */}
        <div style={formBox}>
          <h3 style={sectionTitle}>Add New Report</h3>

          <div style={formRow}>
            <select
              value={newReport.patientId}
              onChange={(e) =>
                setNewReport({ ...newReport, patientId: e.target.value })
              }
              style={input}
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
              value={newReport.reportTitle}
              onChange={(e) =>
                setNewReport({ ...newReport, reportTitle: e.target.value })
              }
              style={input}
            />
          </div>

          <textarea
            placeholder="Report Description"
            value={newReport.description}
            onChange={(e) =>
              setNewReport({ ...newReport, description: e.target.value })
            }
            style={textarea}
          />

          <div style={formRow}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <button style={primaryBtn} onClick={handleAddReport}>
              Add Report
            </button>
          </div>
        </div>

        {/* REPORTS TABLE */}
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Patient</th>
                <th style={th}>Title</th>
                <th style={th}>Description</th>
                <th style={th}>Date</th>
                <th style={th}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="5" style={emptyText}>
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} style={row}>
                    {/* ✅ FIXED HERE */}
                    <td style={tdStrong}>{r.patient_name}</td>
                    <td style={td}>{r.reportTitle}</td>
                    <td style={tdMuted}>{r.description}</td>
                    <td style={td}>
                      {r.date ? new Date(r.date).toLocaleString() : "—"}
                    </td>
                    <td style={td}>
                      {r.pdf_path ? (
                        <a
                          href={`http://localhost:5000${r.pdf_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={link}
                        >
                          Download
                        </a>
                      ) : (
                        "—"
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
  );
}

export default DoctorReport;

/* ================= STYLES (UNCHANGED) ================= */

const page = {
  minHeight: "100vh",
  padding: "40px",
  background: "linear-gradient(180deg, #f8fafc, #e2e8f0)",
  fontFamily: "Inter, system-ui, sans-serif"
};

const card = {
  maxWidth: "1200px",
  margin: "auto",
  background: "#ffffff",
  padding: "32px",
  borderRadius: "18px",
  boxShadow: "0 15px 35px rgba(0,0,0,0.08)"
};

const title = {
  textAlign: "center",
  fontSize: "30px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "6px"
};

const subtitle = {
  textAlign: "center",
  color: "#64748b",
  marginBottom: "30px"
};

const formBox = {
  background: "#f8f9fc",
  padding: "22px",
  borderRadius: "14px",
  marginBottom: "35px",
  border: "1px solid #e5e7eb"
};

const sectionTitle = {
  marginBottom: "14px",
  color: "#1e293b",
  fontWeight: "600"
};

const formRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "14px",
  alignItems: "center"
};

const input = {
  flex: 1,
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px"
};

const textarea = {
  width: "100%",
  minHeight: "90px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  marginBottom: "14px",
  fontSize: "14px"
};

const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

const tableWrapper = {
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid #e5e7eb"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  background: "#2563eb",
  color: "#fff",
  padding: "14px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600"
};

const row = {
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "14px",
  fontSize: "14px",
  color: "#0f172a"
};

const tdStrong = {
  ...td,
  fontWeight: "600"
};

const tdMuted = {
  ...td,
  color: "#475569"
};

const link = {
  color: "#2563eb",
  fontWeight: "600",
  textDecoration: "none"
};

const emptyText = {
  textAlign: "center",
  padding: "30px",
  color: "#94a3b8"
};

const successText = {
  background: "#dcfce7",
  color: "#166534",
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  marginBottom: "16px",
  fontWeight: "600"
};

const errorText = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  marginBottom: "16px",
  fontWeight: "600"
};