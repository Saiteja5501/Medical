import React, { useState, useEffect } from "react";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FETCH PATIENTS ================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();

      if (data.success && Array.isArray(data.patients)) {
        setUsers(data.patients);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  /* ================= ADD PATIENT ================= */
  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.phone) {
      setStatus({ message: "All fields required", type: "error" });
      return;
    }

    if (!/^[0-9]{10}$/.test(newUser.phone)) {
      setStatus({ message: "Phone must be 10 digits", type: "error" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ message: "Patient added successfully", type: "success" });
        setNewUser({ name: "", email: "", password: "", phone: "" });
        fetchUsers();
      } else {
        setStatus({ message: data.message, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ message: "Error adding patient", type: "error" });
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (user) => {
    setEditingId(user.id);
    setEditValues({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!editValues.phone || !/^[0-9]{10}$/.test(editValues.phone)) {
      setStatus({ message: "Phone must be 10 digits", type: "error" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ message: "Patient updated successfully", type: "success" });
        setEditingId(null);
        fetchUsers();
      } else {
        setStatus({ message: data.message, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ message: "Error updating patient", type: "error" });
    }
  };

  /* ================= DELETE ================= */
  const deleteUser = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ message: "Patient deleted successfully", type: "success" });
        fetchUsers();
      } else {
        setStatus({ message: data.message, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ message: "Error deleting patient", type: "error" });
    }
  };

  return (
    <div style={container}>
      <h2 style={title}>👤 Manage Patients</h2>

      {status.message && (
        <div
          style={{
            ...statusBox,
            backgroundColor: status.type === "success" ? "#e6fffa" : "#ffe6e6",
            color: status.type === "success" ? "#065f46" : "#991b1b",
          }}
        >
          {status.message}
        </div>
      )}

      {/* ===== ADD PATIENT FORM ===== */}
      <div style={formBox}>
        <input
          placeholder="Name"
          value={newUser.name}
          onChange={(e) =>
            setNewUser({ ...newUser, name: e.target.value })
          }
          style={input}
        />
        <input
          placeholder="Email"
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
          placeholder="Phone"
          value={newUser.phone}
          onChange={(e) =>
            setNewUser({ ...newUser, phone: e.target.value })
          }
          style={input}
        />
        <button style={primaryBtn} onClick={addUser}>
          Add Patient
        </button>
      </div>

      {/* ===== TABLE ===== */}
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
                No patients found
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td style={td}>{u.id}</td>
                <td style={td}>
                  {editingId === u.id ? (
                    <input
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      style={inputSmall}
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td style={td}>
                  {editingId === u.id ? (
                    <input
                      value={editValues.email}
                      onChange={(e) =>
                        setEditValues({ ...editValues, email: e.target.value })
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
                      value={editValues.phone}
                      onChange={(e) =>
                        setEditValues({ ...editValues, phone: e.target.value })
                      }
                      style={inputSmall}
                    />
                  ) : (
                    u.phone
                  )}
                </td>
                <td style={td}>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td style={td}>
                  {editingId === u.id ? (
                    <>
                      <button style={successBtn} onClick={() => saveEdit(u.id)}>
                        Save
                      </button>
                      <button style={dangerBtn} onClick={cancelEdit}>
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  maxWidth: "1100px",
  margin: "40px auto",
  padding: "30px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  fontFamily: "Segoe UI",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
};

const statusBox = {
  padding: "10px",
  marginBottom: "20px",
  borderRadius: "6px",
  textAlign: "center",
  fontWeight: "600",
};

const formBox = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "25px",
};

const input = {
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "6px",
};

const inputSmall = {
  padding: "5px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "8px 15px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const successBtn = {
  background: "#16a34a",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  borderRadius: "6px",
  marginRight: "5px",
  cursor: "pointer",
};

const warningBtn = {
  background: "#f59e0b",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  borderRadius: "6px",
  marginRight: "5px",
  cursor: "pointer",
};

const dangerBtn = {
  background: "#dc2626",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "10px",
  borderBottom: "2px solid #eee",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #f1f1f1",
};

const emptyRow = {
  textAlign: "center",
  padding: "20px",
  color: "#64748b",
};

export default ManageUsers;