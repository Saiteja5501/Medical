import React, { useState, useEffect, useCallback, useRef } from "react";

function DoctorPrescriptions() {
  const doctorId = Number(sessionStorage.getItem("doctorId"));

  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [instructions, setInstructions] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const wrapperRef = useRef(null);

  const fetchAcceptedPatients = useCallback(async () => {
    if (!doctorId) return;
    const res = await fetch(
      `http://localhost:5000/prescriptions/doctor/${doctorId}/accepted-patients`
    );
    const data = await res.json();
    if (data.success) setAcceptedPatients(data.patients);
  }, [doctorId]);

  useEffect(() => {
    fetchAcceptedPatients();
  }, [fetchAcceptedPatients]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setSearchText("");
    setDropdownOpen(false);
  };

  const addMedicineField = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "" }
    ]);
  };

  const removeMedicineField = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicineField = (index, field, value) => {
    setMedicines(
      medicines.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    );
  };

  const formatMedicinesForStorage = () =>
    medicines
      .map(
        (m) =>
          `${m.name} | ${m.dosage} | ${m.frequency} | ${m.duration}`
      )
      .join("; ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return alert("Please select a patient");
    if (medicines.some((m) => !m.name.trim()))
      return alert("Medicine name required");

    await fetch("http://localhost:5000/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        patientId: selectedPatientId,
        medicine: formatMedicinesForStorage(),
        instructions
      })
    });

    alert("Prescription added successfully!");
    setSelectedPatientId("");
    setSelectedPatientName("");
    setMedicines([{ name: "", dosage: "", frequency: "", duration: "" }]);
    setInstructions("");
  };

  const filteredPatients = acceptedPatients.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={page}>
      <div style={container}>
        <h1 style={title}>Doctor Prescription</h1>
        <p style={subtitle}>
          Create and manage prescriptions for accepted patients
        </p>

        <form onSubmit={handleSubmit} style={card} ref={wrapperRef}>
          {/* Patient Selection */}
          <label style={label}>Patient</label>
          <div
            style={dropdown}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedPatientName || "Select Patient"}
            <span style={arrow}>▾</span>
          </div>

          {dropdownOpen && (
            <div style={dropdownBox}>
              <input
                placeholder="Search patient..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={search}
              />
              <ul style={list}>
                {filteredPatients.length ? (
                  filteredPatients.map((p) => (
                    <li
                      key={p.id}
                      style={item}
                      onClick={() => handleSelectPatient(p)}
                    >
                      <strong>{p.name}</strong>
                      <div style={email}>{p.email}</div>
                    </li>
                  ))
                ) : (
                  <li style={empty}>No patients found</li>
                )}
              </ul>
            </div>
          )}

          {/* Medicines */}
          <label style={label}>Medicines</label>
          {medicines.map((m, i) => (
            <div key={i} style={medicineRow}>
              <input
                style={input}
                placeholder="Medicine"
                value={m.name}
                onChange={(e) =>
                  updateMedicineField(i, "name", e.target.value)
                }
              />
              <input
                style={input}
                placeholder="Dosage"
                value={m.dosage}
                onChange={(e) =>
                  updateMedicineField(i, "dosage", e.target.value)
                }
              />
              <input
                style={input}
                placeholder="Frequency"
                value={m.frequency}
                onChange={(e) =>
                  updateMedicineField(i, "frequency", e.target.value)
                }
              />
              <input
                style={input}
                placeholder="Duration"
                value={m.duration}
                onChange={(e) =>
                  updateMedicineField(i, "duration", e.target.value)
                }
              />

              {medicines.length > 1 && (
                <button
                  type="button"
                  style={remove}
                  onClick={() => removeMedicineField(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" style={add} onClick={addMedicineField}>
            + Add Medicine
          </button>

          {/* Instructions */}
          <label style={label}>Doctor Instructions</label>
          <textarea
            style={textarea}
            placeholder="Additional instructions for the patient"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <button type="submit" style={submit}>
            Save Prescription
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorPrescriptions;

/* ================= PROFESSIONAL STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "40px",
  fontFamily: "Inter, system-ui, sans-serif"
};

const container = {
  maxWidth: "1050px",
  margin: "auto"
};

const title = {
  textAlign: "center",
  fontSize: "30px",
  fontWeight: "700",
  color: "#0f172a"
};

const subtitle = {
  textAlign: "center",
  color: "#64748b",
  marginBottom: "35px"
};

const card = {
  background: "#ffffff",
  padding: "32px",
  borderRadius: "18px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
};

const label = {
  display: "block",
  marginTop: "20px",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#1e293b"
};

const dropdown = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  cursor: "pointer"
};

const arrow = {
  fontSize: "14px",
  color: "#475569"
};

const dropdownBox = {
  marginTop: "6px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "#ffffff",
  overflow: "hidden"
};

const search = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderBottom: "1px solid #e5e7eb"
};

const list = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  maxHeight: "200px",
  overflowY: "auto"
};

const item = {
  padding: "12px",
  cursor: "pointer",
  borderBottom: "1px solid #f1f5f9"
};

const email = {
  fontSize: "12px",
  color: "#64748b"
};

const empty = {
  padding: "14px",
  color: "#94a3b8"
};

const medicineRow = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr) auto",
  gap: "12px",
  marginBottom: "12px"
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1"
};

const textarea = {
  width: "100%",
  minHeight: "100px",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1"
};

const remove = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  cursor: "pointer"
};

const add = {
  marginTop: "12px",
  background: "#e0f2fe",
  color: "#0369a1",
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: "600",
  cursor: "pointer"
};

const submit = {
  marginTop: "30px",
  width: "100%",
  background: "#2563eb",
  color: "#ffffff",
  padding: "16px",
  borderRadius: "12px",
  border: "none",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer"
};
