import React, { useState, useEffect, useCallback } from "react";

function PatientReports() {
  const patientId = sessionStorage.getItem("patientId");
  const patientName = sessionStorage.getItem("patientName");

  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");

  const [reportTitle, setReportTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [status, setStatus] = useState("");

  /* ================= FETCH REPORTS ================= */
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/reports/patient/${patientId}`
      );
      const data = await res.json();

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
      console.error("Report fetch error:", error);
      setReports([]);
    }
  }, [patientId]);

  /* ================= FETCH DOCTORS ================= */
  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/doctors");
      const data = await res.json();

      if (Array.isArray(data)) setDoctors(data);
      else if (Array.isArray(data.doctors)) setDoctors(data.doctors);
      else if (data.success && Array.isArray(data.doctors))
        setDoctors(data.doctors);
      else setDoctors([]);
    } catch (err) {
      console.error("Doctor fetch error:", err);
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchDoctors();
  }, [fetchReports]);

  /* ================= UPLOAD ================= */
  const uploadReport = async () => {
    if (!doctorId) return setStatus("Please select a doctor");
    if (!reportTitle.trim()) return setStatus("Report title is required");
    if (!description.trim()) return setStatus("Description is required");
    if (!pdfFile) return setStatus("Please select a PDF file");

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("doctorName", doctorName);
    formData.append("patientId", patientId);
    formData.append("patientName", patientName);
    formData.append("reportTitle", reportTitle);
    formData.append("description", description);
    formData.append("pdf", pdfFile);

    const res = await fetch("http://localhost:5000/reports", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Upload failed");

    setStatus("Report uploaded successfully");
    setReportTitle("");
    setDescription("");
    setPdfFile(null);
    fetchReports();
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>🩺 Patient Medical Reports</h1>

        <div style={uploadBox}>
          <h3 style={sectionTitle}>Upload Medical Report</h3>

          <label style={label}>Select Doctor</label>
          <select
            style={input}
            value={doctorId}
            onChange={(e) => {
              const doc = doctors.find(
                (d) => d.id === Number(e.target.value)
              );
              setDoctorId(e.target.value);
              setDoctorName(doc?.name || "");
            }}
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>

          <label style={label}>Report Title</label>
          <input
            style={input}
            placeholder="e.g. Brain Scan"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
          />

          <label style={label}>Report Description</label>
          <textarea
            style={textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label style={label}>Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />

          <button style={btn} onClick={uploadReport}>
            Upload Report
          </button>

          {status && <p style={statusText}>{status}</p>}
        </div>

        <h3 style={{ marginTop: "30px" }}>My Reports</h3>

        {!Array.isArray(reports) || reports.length === 0 ? (
          <p>No reports found</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Doctor</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.reportTitle}</td>
                  <td>{r.description}</td>
                  <td>{r.doctor_name}</td>
                  <td>
                    <a
                      href={`http://localhost:5000${r.pdf_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PatientReports;

/* ================= STYLES ================= */

const page = {
  background: "#eef2f7",
  minHeight: "100vh",
  padding: "40px"
};

const card = {
  background: "#fff",
  maxWidth: "1000px",
  margin: "auto",
  padding: "30px",
  borderRadius: "14px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const title = {
  textAlign: "center",
  marginBottom: "20px"
};

const uploadBox = {
  background: "#f8f9fc",
  padding: "20px",
  borderRadius: "10px"
};

const sectionTitle = {
  marginBottom: "15px"
};

const label = {
  display: "block",
  fontWeight: "600",
  marginTop: "12px"
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "5px"
};

const textarea = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "5px",
  minHeight: "80px"
};

const btn = {
  marginTop: "15px",
  padding: "10px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const statusText = {
  marginTop: "10px",
  fontWeight: "500"
};

const table = {
  width: "100%",
  marginTop: "15px",
  borderCollapse: "collapse"
};