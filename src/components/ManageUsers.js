
import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const [status, setStatus] = useState({
    message: "",
    type: ""
  });

  const [editingId, setEditingId] = useState(null);

  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await API.get("/users");
      const data = response.data;

      if (data.success && Array.isArray(data.patients)) {
        setUsers(data.patients);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(
        "Fetch patients error:",
        error.response?.data || error.message
      );

      setUsers([]);

      setStatus({
        message: error.response?.data?.message || "Failed to load patients",
        type: "error"
      });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ================= ADD PATIENT ================= */

  const addUser = async () => {
    if (
      !newUser.name.trim() ||
      !newUser.email.trim() ||
      !newUser.password ||
      !newUser.phone.trim()
    ) {
      setStatus({
        message: "All fields required",
        type: "error"
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(newUser.phone)) {
      setStatus({
        message: "Phone must be 10 digits",
        type: "error"
      });
      return;
    }

    try {
      const response = await API.post("/users", {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        phone: newUser.phone
      });

      if (response.data.success) {
        setStatus({
          message: "Patient added successfully",
          type: "success"
        });

        setNewUser({
          name: "",
          email: "",
          password: "",
          phone: ""
        });

        await fetchUsers();
      } else {
        setStatus({
          message: response.data.message || "Unable to add patient",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Add patient error:",
        error.response?.data || error.message
      );

      setStatus({
        message: error.response?.data?.message || "Error adding patient",
        type: "error"
      });
    }
  };

  /* ================= EDIT PATIENT ================= */

  const startEdit = (user) => {
    setEditingId(user.id);

    setEditValues({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setEditValues({
      name: "",
      email: "",
      phone: ""
    });
  };

  const saveEdit = async (id) => {
    if (
      !editValues.name.trim() ||
      !editValues.email.trim() ||
      !editValues.phone.trim()
    ) {
      setStatus({
        message: "All fields required",
        type: "error"
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(editValues.phone)) {
      setStatus({
        message: "Phone must be 10 digits",
        type: "error"
      });
      return;
    }

    try {
      const response = await API.put(`/users/${id}`, {
        name: editValues.name.trim(),
        email: editValues.email.trim(),
        phone: editValues.phone
      });

      if (response.data.success) {
        setStatus({
          message: "Patient updated successfully",
          type: "success"
        });

        setEditingId(null);
        await fetchUsers();
      } else {
        setStatus({
          message: response.data.message || "Unable to update patient",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Update patient error:",
        error.response?.data || error.message
      );

      setStatus({
        message: error.response?.data?.message || "Error updating patient",
        type: "error"
      });
    }
  };

  /* ================= DELETE PATIENT ================= */

  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      const response = await API.delete(`/users/${id}`);

      if (response.data.success) {
        setStatus({
          message: "Patient deleted successfully",
          type: "success"
        });

        await fetchUsers();
      } else {
        setStatus({
          message: response.data.message || "Unable to delete patient",
          type: "error"
        });
      }
    } catch (error) {
      console.error(
        "Delete patient error:",
        error.response?.data || error.message
      );

      setStatus({
        message: error.response?.data?.message || "Error deleting patient",
        type: "error"
      });
    }
  };

  return (
    <div style={container}>

      {/* ================= HEADER ================= */}

      <div style={header}>
        <div>
          <h2 style={title}>Manage Patients</h2>
          <p style={subtitle}>
            Add, update and manage registered patient accounts.
          </p>
        </div>

        <div style={countBadge}>
          <span style={countNumber}>{users.length}</span>
          <span style={countLabel}>Total Patients</span>
        </div>
      </div>

      {/* ================= STATUS MESSAGE ================= */}

      {status.message && (
        <div
          style={{
            ...statusBox,
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

      {/* ================= ADD PATIENT FORM ================= */}

      <div style={formCard}>
        <div style={sectionHeader}>
          <div>
            <h3 style={sectionTitle}>Add New Patient</h3>
            <p style={sectionSubtitle}>
              Enter the patient's details below.
            </p>
          </div>

          <span style={formIcon}>＋</span>
        </div>

        <div style={formBox}>
          <input
            placeholder="Patient Name"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
            style={input}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            style={input}
          />

          <input
            type="tel"
            placeholder="10-digit Phone Number"
            value={newUser.phone}
            onChange={(e) =>
              setNewUser({ ...newUser, phone: e.target.value })
            }
            style={input}
          />

          <button style={primaryBtn} onClick={addUser}>
            + Add Patient
          </button>
        </div>
      </div>

      {/* ================= PATIENT TABLE ================= */}

      <div style={tableCard}>
        <div style={sectionHeader}>
          <div>
            <h3 style={sectionTitle}>Registered Patients</h3>
            <p style={sectionSubtitle}>
              View and manage patient information.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Phone</th>
                <th style={th}>Registered</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={emptyRow}>
                    <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                      👥
                    </div>
                    No patients found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={td}>
                      <span style={idBadge}>#{u.id}</span>
                    </td>

                    <td style={td}>
                      {editingId === u.id ? (
                        <input
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value
                            })
                          }
                          style={inputSmall}
                        />
                      ) : (
                        <span style={patientName}>{u.name}</span>
                      )}
                    </td>

                    <td style={td}>
                      {editingId === u.id ? (
                        <input
                          type="email"
                          value={editValues.email}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              email: e.target.value
                            })
                          }
                          style={inputSmall}
                        />
                      ) : (
                        u.email
                      )}
                    </td>

                    <td style={td}>
                      {editingId === u.id ? (
                        <input
                          type="tel"
                          value={editValues.phone}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              phone: e.target.value
                            })
                          }
                          style={inputSmall}
                        />
                      ) : (
                        u.phone || "—"
                      )}
                    </td>

                    <td style={td}>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td style={td}>
                      <div style={actionGroup}>
                        {editingId === u.id ? (
                          <>
                            <button
                              style={successBtn}
                              onClick={() => saveEdit(u.id)}
                            >
                              Save
                            </button>

                            <button
                              style={dangerBtn}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={warningBtn}
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>

                            <button
                              style={dangerBtn}
                              onClick={() => deleteUser(u.id)}
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

const statusBox = {
  padding: "13px 16px",
  marginBottom: "20px",
  border: "1px solid",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600"
};

const formCard = {
  padding: "22px",
  marginBottom: "25px",
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

const formIcon = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  background: "#203A34",
  borderRadius: "9px",
  color: "#20DCC0",
  fontSize: "24px"
};

const formBox = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap"
};

const input = {
  flex: "1 1 180px",
  minWidth: "130px",
  padding: "12px",
  color: "#E8EEEE",
  background: "#101515",
  border: "1px solid #303B3B",
  borderRadius: "7px",
  outline: "none",
  fontSize: "13px",
  boxSizing: "border-box"
};

const inputSmall = {
  width: "140px",
  maxWidth: "100%",
  padding: "8px",
  color: "#E8EEEE",
  background: "#101515",
  border: "1px solid #20DCC0",
  borderRadius: "6px",
  outline: "none",
  fontSize: "12px",
  boxSizing: "border-box"
};

const primaryBtn = {
  padding: "11px 18px",
  background: "#20DCC0",
  color: "#0B0D0E",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "700",
  whiteSpace: "nowrap"
};

const tableCard = {
  padding: "22px",
  background: "#181C1D",
  border: "1px solid #293333",
  borderRadius: "13px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#E8EEEE",
  minWidth: "750px"
};

const th = {
  padding: "14px 12px",
  borderBottom: "1px solid #303B3B",
  textAlign: "left",
  color: "#AAB5B5",
  fontWeight: "600",
  fontSize: "12px",
  background: "#202727",
  whiteSpace: "nowrap"
};

const td = {
  padding: "14px 12px",
  borderBottom: "1px solid #293333",
  color: "#C5CECE",
  fontSize: "12px",
  verticalAlign: "middle"
};

const patientName = {
  color: "#F1F5F5",
  fontWeight: "600"
};

const idBadge = {
  padding: "5px 8px",
  background: "#202727",
  color: "#20DCC0",
  borderRadius: "5px",
  fontSize: "11px",
  fontWeight: "600"
};

const actionGroup = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  flexWrap: "wrap"
};

const successBtn = {
  background: "#203A34",
  color: "#64DDA6",
  padding: "7px 11px",
  border: "1px solid #285A46",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const warningBtn = {
  background: "#382F1A",
  color: "#F5C76A",
  padding: "7px 11px",
  border: "1px solid #665126",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const dangerBtn = {
  background: "#3B2424",
  color: "#FF8585",
  padding: "7px 11px",
  border: "1px solid #653333",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "600"
};

const emptyRow = {
  textAlign: "center",
  padding: "35px 15px",
  color: "#899497",
  fontSize: "13px"
};

export default ManageUsers;
