
import React, { useState, useEffect, useCallback, useRef } from "react";
import API from "../api";

function DoctorPrescriptions() {
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [instructions, setInstructions] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);

  /* ================= FETCH ACCEPTED PATIENTS ================= */
  const fetchAcceptedPatients = useCallback(async () => {
    try {
      const doctorId = sessionStorage.getItem("doctorId");

      if (!doctorId) {
        setStatus("Error: Doctor login information not found");
        return;
      }

      const res = await API.get(
        `/prescriptions/doctor/${doctorId}/accepted-patients`
      );

      if (res.data.success) {
        setAcceptedPatients(res.data.patients || []);
      } else {
        setAcceptedPatients([]);
      }
    } catch (error) {
      console.error("Accepted Patients Error:", error);
      setStatus(
        error.response?.data?.message || "Unable to load accepted patients"
      );
    }
  }, []);

  useEffect(() => {
    fetchAcceptedPatients();
  }, [fetchAcceptedPatients]);

  /* ================= CLICK OUTSIDE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setSearchText("");
    setDropdownOpen(false);
  };

  /* ================= MEDICINE FIELDS ================= */
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

  /* ================= FORMAT MEDICINES ================= */
  const formatMedicinesForStorage = () =>
    medicines
      .map(
        (m) =>
          `${m.name.trim()} | ${m.dosage.trim()} | ${m.frequency.trim()} | ${m.duration.trim()}`
      )
      .join("; ");

  /* ================= SUBMIT PRESCRIPTION ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!selectedPatientId) {
      setStatus("Error: Please select a patient");
      return;
    }

    if (medicines.some((m) => !m.name.trim())) {
      setStatus("Error: Medicine name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/prescriptions", {
        patientId: selectedPatientId,
        medicine: formatMedicinesForStorage(),
        instructions
      });

      if (response.data.success) {
        setStatus("Prescription added successfully!");

        setSelectedPatientId("");
        setSelectedPatientName("");
        setMedicines([
          { name: "", dosage: "", frequency: "", duration: "" }
        ]);
        setInstructions("");
      } else {
        setStatus(response.data.message || "Error adding prescription");
      }
    } catch (error) {
      console.error("Prescription Error:", error);

      setStatus(
        error.response?.data?.message || "Unable to save prescription"
      );
    } finally {
      setLoading(false);
    }
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

          <button
            type="button"
            style={add}
            onClick={addMedicineField}
          >
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

          <button
            type="submit"
            style={submit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Prescription"}
          </button>

          {status && (
            <p style={{
              ...statusStyle,
              color: status.startsWith("Error") ||
                status.includes("Unable") ? "#dc2626" : "#15803d"
            }}>
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default DoctorPrescriptions;


/* ================= DARK HEALTHWAVE STYLES ================= */

const page = {
  minHeight: "100vh",
  boxSizing: "border-box",
  background: "#0B0D0E",
  padding: "35px 32px",
  fontFamily: "Arial, sans-serif",
  color: "#E8EEEE"
};

const container = {
  maxWidth: "1050px",
  margin: "0 auto"
};

const title = {
  textAlign: "left",
  fontSize: "28px",
  fontWeight: "700",
  color: "#F1F5F5",
  margin: "0 0 9px"
};

const subtitle = {
  textAlign: "left",
  color: "#899497",
  fontSize: "14px",
  marginBottom: "30px",
  lineHeight: 1.6
};

const card = {
  background: "#181C1D",
  padding: "30px",
  borderRadius: "15px",
  border: "1px solid #293333",
  boxShadow: "0 12px 35px rgba(0,0,0,0.2)"
};

const label = {
  display: "block",
  marginTop: "22px",
  marginBottom: "9px",
  fontWeight: "600",
  fontSize: "13px",
  color: "#DCE5E5"
};

const dropdown = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px",
  borderRadius: "9px",
  border: "1px solid #354242",
  background: "#101515",
  color: "#E8EEEE",
  cursor: "pointer",
  fontSize: "14px"
};

const arrow = {
  fontSize: "14px",
  color: "#20DCC0"
};

const dropdownBox = {
  marginTop: "7px",
  border: "1px solid #354242",
  borderRadius: "9px",
  background: "#181C1D",
  overflow: "hidden"
};

const search = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  background: "#101515",
  color: "#E8EEEE",
  border: "none",
  borderBottom: "1px solid #354242",
  outline: "none",
  fontSize: "13px"
};

const list = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  maxHeight: "220px",
  overflowY: "auto"
};

const item = {
  padding: "13px",
  cursor: "pointer",
  borderBottom: "1px solid #293333",
  color: "#E8EEEE",
  fontSize: "13px"
};

const email = {
  fontSize: "12px",
  color: "#899497",
  marginTop: "5px"
};

const empty = {
  padding: "14px",
  color: "#899497",
  fontSize: "13px"
};

const medicineRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: "12px",
  marginBottom: "13px",
  padding: "15px",
  background: "#101515",
  border: "1px solid #293333",
  borderRadius: "10px"
};

const input = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #354242",
  background: "#181C1D",
  color: "#E8EEEE",
  fontSize: "13px",
  outline: "none"
};

const textarea = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "110px",
  padding: "14px",
  borderRadius: "9px",
  border: "1px solid #354242",
  background: "#101515",
  color: "#E8EEEE",
  fontSize: "13px",
  fontFamily: "Arial, sans-serif",
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none"
};

const remove = {
  background: "#40252C",
  color: "#FB7185",
  border: "1px solid #814052",
  borderRadius: "8px",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: "600"
};

const add = {
  marginTop: "10px",
  background: "#153A35",
  color: "#20DCC0",
  border: "1px solid #216B60",
  borderRadius: "8px",
  padding: "11px 16px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "13px"
};

const submit = {
  marginTop: "28px",
  width: "100%",
  background: "#20DCC0",
  color: "#071A18",
  padding: "15px",
  borderRadius: "9px",
  border: "none",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
};

const statusStyle = {
  marginTop: "18px",
  textAlign: "center",
  fontSize: "13px",
  fontWeight: "600"
};
