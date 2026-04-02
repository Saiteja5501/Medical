import React, { useState, useEffect } from "react";

function PatientReports({ patientId: propPatientId }) {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("");

  // ✅ Use prop or fallback to localStorage
  const patientId = propPatientId || localStorage.getItem("patientId");

  useEffect(() => {
    if (propPatientId) {
      localStorage.setItem("patientId", propPatientId);
    }

    const fetchReports = async () => {
      if (!patientId) return;
      try {
        const res = await fetch(`http://localhost:5000/reports/patient/${patientId}`);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setStatus("Error fetching reports");
      }
    };

    fetchReports();
  }, [propPatientId, patientId]);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>My Reports</h2>
      {status && <p style={{ color: "red" }}>{status}</p>}
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#3498db", color: "#fff" }}>
              <th style={thTd}>Report Title</th>
              <th style={thTd}>Description</th>
              <th style={thTd}>Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((rep, index) => (
              <tr key={rep.id} style={{ background: index % 2 === 0 ? "#ecf0f1" : "#fff" }}>
                <td style={thTd}>{rep.reportTitle}</td>
                <td style={thTd}>{rep.description}</td>
                <td style={thTd}>{new Date(rep.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thTd = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

export default PatientReports;
