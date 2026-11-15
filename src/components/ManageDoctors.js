
import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    specialization: ""
  });

  /* ================= FETCH DOCTORS ================= */

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await API.get("/users/doctors");
      const data = response.data;

      let doctorsList = [];

      if (Array.isArray(data)) {
        doctorsList = data;
      } else if (Array.isArray(data.doctors)) {
        doctorsList = data.doctors;
      }

      const formattedDoctors = doctorsList.map((doc) => ({
        id: doc.id,
        name: doc.name || "N/A",
        email: doc.email || "N/A",
        specialization: doc.specialization || "N/A"
      }));

      setDoctors(formattedDoctors);
    } catch (error) {
      console.error(
        "Fetch doctors error:",
        error.response?.data || error.message
      );

      setDoctors([]);

      setStatus({
        message:
          error.response?.data?.message ||
          "Failed to load doctors",
        type: "error"
      });
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /* ================= START EDIT ================= */

  const startEdit = (doctor) => {
    setEditingId(doctor.id);

    setEditValues({
      name: doctor.name === "N/A" ? "" : doctor.name,
      email: doctor.email === "N/A" ? "" : doctor.email,
      specialization:
        doctor.specialization === "N/A"
          ? ""
          : doctor.specialization
    });
  };

  /* ================= CANCEL EDIT ================= */

  const cancelEdit = () => {
    setEditingId(null);

    setEditValues({
      name: "",
      email: "",
      specialization: ""
    });
  };

  /* ================= SAVE EDIT ================= */

  const saveEdit = async (id) => {
    if (
      !editValues.name.trim() ||
      !editValues.email.trim() ||
      !editValues.specialization.trim()
    ) {
      setStatus({
        message: "All fields required",
        type: "error"
      });
      return;
    }

    try {
      const response = await API.put(`/users/${id}`, {
        name: editValues.name.trim(),
        email: editValues.email.trim(),
        specialization: editValues.specialization.trim()
      });

      const data = response.data;

      if (data.success) {
        setStatus({
          message: "Doctor updated successfully",
          type: "success"
        });

        setEditingId(null);
        await fetchDoctors();
      } else {
        setStatus({
          message: data.message || "Unable to update doctor",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Update doctor error:",
        error.response?.data || error.message
      );

      setStatus({
        message:
          error.response?.data?.message ||
          "Error updating doctor",
        type: "error"
      });
    }
  };

  /* ================= DELETE DOCTOR ================= */

  const deleteDoctor = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) return;

    try {
      const response = await API.delete(`/users/${id}`);
      const data = response.data;

      if (data.success) {
        setStatus({
          message: "Doctor deleted successfully",
          type: "success"
        });

        await fetchDoctors();
      } else {
        setStatus({
          message: data.message || "Unable to delete doctor",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Delete doctor error:",
        error.response?.data || error.message
      );

      setStatus({
        message:
          error.response?.data?.message ||
          "Error deleting doctor",
        type: "error"
      });
    }
  };

  return (
    <div style={container}>

      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h2 style={title}>Manage Doctors</h2>
          <p style={subtitle}>
            View, update and manage registered doctor accounts.
          </p>
        </div>

        <div style={countBadge}>
          <span style={countNumber}>{doctors.length}</span>
          <span style={countLabel}>Total Doctors</span>
        </div>
      </div>

      {/* ================= STATUS MESSAGE ================= */}

      {status.message && (
        <div
          style={{
            ...alert,
            backgroundColor:
              status.type === "success" ? "#142B23" : "#301C1C",
            color:
              status.type === "success" ? "#64DDA6" : "#FF8585",
            borderColor:
              status.type === "success" ? "#285A46" : "#653333"
          }}
        >
          {status.type === "success" ? "✓ " : "⚠ "}
          {status.message}
        </div>
      )}

      {/* ================= DOCTORS TABLE ================= */}

      <div style={tableCard}>
        <div style={sectionHeader}>
          <div>
            <h3 style={sectionTitle}>Registered Doctors</h3>
            <p style={sectionSubtitle}>
              Manage doctor details and specializations.
            </p>
          </div>

          <span style={doctorIcon}>🩺</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Doctor</th>
                <th style={th}>Email</th>
                <th style={th}>Specialization</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={noData}>
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                      🩺
                    </div>
                    No doctors found
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id}>

                    {/* DOCTOR NAME */}

                    <td style={td}>
                      {editingId === doc.id ? (
                        <input
                          style={input}
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value
                            })
                          }
                        />
                      ) : (
                        <div style={doctorName}>
                          <span style={avatar}>
                            {doc.name !== "N/A"
                              ? doc.name.charAt(0).toUpperCase()
                              : "D"}
                          </span>

                          <span>{doc.name}</span>
                        </div>
                      )}
                    </td>

                    {/* EMAIL */}

                    <td style={td}>
                      {editingId === doc.id ? (
                        <input
                          type="email"
                          style={input}
                          value={editValues.email}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              email: e.target.value
                            })
                          }
                        />
                      ) : (
                        doc.email
                      )}
                    </td>

                    {/* SPECIALIZATION */}

                    <td style={td}>
                      {editingId === doc.id ? (
                        <input
                          style={input}
                          value={editValues.specialization}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              specialization: e.target.value
                            })
                          }
                        />
                      ) : (
                        <span style={specializationBadge}>
                          {doc.specialization}
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td style={td}>
                      <div style={actionGroup}>
                        {editingId === doc.id ? (
                          <>
                            <button
                              style={saveBtn}
                              onClick={() => saveEdit(doc.id)}
                            >
                              Save
                            </button>

                            <button
                              style={cancelBtn}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={editBtn}
                              onClick={() => startEdit(doc)}
                            >
                              Edit
                            </button>

                            <button
                              style={deleteBtn}
                              onClick={() => deleteDoctor(doc.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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

/* ================= FULL-PAGE DARK HEALTHWAVE STYLES ================= */

const container = {
  width: "100%",
  minHeight: "100vh",
  margin: "0",
  padding: "30px",
  background: "#0B0D0E",
  color: "#E8EEEE",
  borderRadius: "0",
  fontFamily: "Inter, Segoe UI, sans-serif",
  boxSizing: "border-box"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "25px"
};

const title = {
  margin: "0 0 8px",
  color: "#F1F5F5",
  fontSize: "25px",
  fontWeight: "700"
};

const subtitle = {
  margin: 0,
  color: "#899497",
  fontSize: "13px"
};

const countBadge = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "110px",
  padding: "12px 18px",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "10px"
};

const countNumber = {
  color: "#20DCC0",
  fontSize: "23px",
  fontWeight: "700"
};

const countLabel = {
  color: "#899497",
  fontSize: "11px",
  marginTop: "3px"
};

const alert = {
  padding: "13px 16px",
  border: "1px solid",
  borderRadius: "8px",
  marginBottom: "20px",
  fontSize: "13px",
  fontWeight: "600"
};

const tableCard = {
  padding: "22px",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "13px"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px"
};

const sectionTitle = {
  margin: "0 0 6px",
  color: "#F1F5F5",
  fontSize: "17px",
  fontWeight: "650"
};

const sectionSubtitle = {
  margin: 0,
  color: "#899497",
  fontSize: "12px"
};

const doctorIcon = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "42px",
  height: "42px",
  background: "#203A34",
  borderRadius: "10px",
  fontSize: "21px"
};

const table = {
  width: "100%",
  minWidth: "650px",
  borderCollapse: "collapse",
  color: "#E8EEEE"
};

const th = {
  textAlign: "left",
  padding: "14px 12px",
  background: "#202727",
  color: "#AAB5B5",
  borderBottom: "1px solid #303B3B",
  fontWeight: "600",
  fontSize: "12px",
  whiteSpace: "nowrap"
};

const td = {
  padding: "14px 12px",
  borderBottom: "1px solid #293333",
  color: "#C5CECE",
  fontSize: "12px",
  verticalAlign: "middle"
};

const doctorName = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#F1F5F5",
  fontWeight: "600"
};

const avatar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  flexShrink: 0,
  borderRadius: "50%",
  background: "#203A34",
  color: "#20DCC0",
  fontSize: "14px",
  fontWeight: "700"
};

const specializationBadge = {
  display: "inline-block",
  padding: "6px 10px",
  background: "#203A34",
  color: "#20DCC0",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "600"
};

const input = {
  width: "100%",
  minWidth: "120px",
  padding: "9px",
  color: "#E8EEEE",
  background: "#101515",
  border: "1px solid #20DCC0",
  borderRadius: "6px",
  outline: "none",
  fontSize: "12px",
  boxSizing: "border-box"
};

const actionGroup = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  flexWrap: "wrap"
};

const editBtn = {
  background: "#382F1A",
  color: "#F5C76A",
  border: "1px solid #665126",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const deleteBtn = {
  background: "#3B2424",
  color: "#FF8585",
  border: "1px solid #653333",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const saveBtn = {
  background: "#203A34",
  color: "#64DDA6",
  border: "1px solid #285A46",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const cancelBtn = {
  background: "#202727",
  color: "#AAB5B5",
  border: "1px solid #3A4646",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const noData = {
  textAlign: "center",
  padding: "35px 15px",
  color: "#899497",
  fontSize: "13px"
};

export default ManageDoctors;
