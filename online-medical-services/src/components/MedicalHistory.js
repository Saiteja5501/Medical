import React, { useState, useEffect } from "react";

function MedicalHistory({ patientId }) {
  const [history, setHistory] = useState([]);

  // ✅ Use patientId prop or fallback to localStorage
  const id = patientId || localStorage.getItem("userId");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:5000/medical-history/patient/${id}`);
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch medical history:", err);
      }
    };

    fetchHistory();
  }, [id]);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>Medical History</h2>
      {history.length === 0 ? (
        <p>No medical history found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#3498db", color: "#fff" }}>
              <th style={thTd}>Date</th>
              <th style={thTd}>Diagnosis</th>
              <th style={thTd}>Report</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={item.id} style={{ background: index % 2 === 0 ? "#ecf0f1" : "#fff" }}>
                <td style={thTd}>{item.date}</td>
                <td style={thTd}>{item.diagnosis}</td>
                <td style={thTd}>{item.details}</td>
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
  textAlign: "left"
};

export default MedicalHistory;
