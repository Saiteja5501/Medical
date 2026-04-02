import React, { useState, useEffect } from "react";

function Prescriptions({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);

  // ✅ FIX: Use sessionStorage (same as rest of app)
  const id = patientId || sessionStorage.getItem("patientId");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        if (!id) return;

        const res = await fetch(
          `http://localhost:5000/prescriptions/patient/${id}`
        );
        const data = await res.json();

        // ✅ SAFETY CHECK
        if (Array.isArray(data)) {
          setPrescriptions(data);
        } else {
          setPrescriptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      }
    };

    fetchPrescriptions();
  }, [id]);

  const parseStoredMedicines = (medicineText) => {
    if (!medicineText) return [];

    return medicineText.split("; ").map((med) => {
      const parts = med.split(" | ");
      return {
        name: parts[0] || "",
        dosage: parts[1] || "",
        frequency: parts[2] || "",
        duration: parts[3] || ""
      };
    });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        My Prescriptions
      </h2>

      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        prescriptions.map((item) => {
          const medicineList = parseStoredMedicines(item.medicine);

          return (
            <div key={item.id} style={prescriptionCardStyle}>
              <div style={prescriptionHeaderStyle}>
                <h3 style={{ margin: 0, color: "#2c3e50" }}>
                  Prescription from Dr. {item.doctor_name}
                </h3>
                <span style={dateStyle}>
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>

              <div style={medicinesSectionStyle}>
                <h4 style={sectionTitleStyle}>Medicines</h4>
                {medicineList.map((med, idx) => (
                  <div key={idx} style={medicineItemStyle}>
                    <div style={medicineNameStyle}>{med.name}</div>
                    <div style={medicineDetailsStyle}>
                      <span>
                        <strong>Dosage:</strong>{" "}
                        {med.dosage || "Not specified"}
                      </span>
                      <span>
                        <strong>Frequency:</strong>{" "}
                        {med.frequency || "Not specified"}
                      </span>
                      <span>
                        <strong>Duration:</strong>{" "}
                        {med.duration || "Not specified"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {item.instructions && (
                <div style={instructionsSectionStyle}>
                  <h4 style={sectionTitleStyle}>Instructions</h4>
                  <p style={instructionsTextStyle}>
                    {item.instructions}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const prescriptionCardStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const prescriptionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  paddingBottom: "15px",
  borderBottom: "1px solid #eee"
};

const dateStyle = {
  color: "#666",
  fontSize: "14px"
};

const medicinesSectionStyle = {
  marginBottom: "15px"
};

const sectionTitleStyle = {
  color: "#34495e",
  marginBottom: "10px",
  fontSize: "16px"
};

const medicineItemStyle = {
  background: "#f8f9fa",
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "8px",
  borderLeft: "4px solid #3498db"
};

const medicineNameStyle = {
  fontWeight: "bold",
  color: "#2c3e50",
  fontSize: "15px",
  marginBottom: "5px"
};

const medicineDetailsStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  fontSize: "14px",
  color: "#555"
};

const instructionsSectionStyle = {
  background: "#fff8e1",
  padding: "12px",
  borderRadius: "6px",
  borderLeft: "4px solid #ffc107"
};

const instructionsTextStyle = {
  margin: 0,
  color: "#555",
  lineHeight: "1.5"
};

export default Prescriptions;
