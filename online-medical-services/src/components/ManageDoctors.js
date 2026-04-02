import React, { useState, useEffect } from "react";

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    password: "",
    specialization: ""
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/doctors");
      const data = await res.json();

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
        password: doc.password || "",
        specialization: doc.specialization || "N/A"
      }));

      setDoctors(formattedDoctors);

    } catch (err) {
      console.error(err);
      setDoctors([]);
    }
  };

  const startEdit = (doctor) => {
    setEditingId(doctor.id);
    setEditValues({ ...doctor });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", email: "", password: "", specialization: "" });
  };

  const saveEdit = async (id) => {
    await fetch(`http://localhost:5000/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });

    setStatus({ message: "Doctor updated successfully", type: "success" });
    setEditingId(null);
    fetchDoctors();
  };

  const deleteDoctor = async (id) => {
    await fetch(`http://localhost:5000/users/${id}`, {
      method: "DELETE"
    });

    setStatus({ message: "Doctor deleted successfully", type: "success" });
    fetchDoctors();
  };

  return (
    <div style={container}>
      <h2 style={title}>👨‍⚕️ Manage Doctors</h2>

      {status.message && (
        <div style={{
          ...alert,
          backgroundColor: status.type === "success" ? "#e6ffed" : "#ffe6e6",
          color: status.type === "success" ? "#2e7d32" : "#c62828"
        }}>
          {status.message}
        </div>
      )}

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Password</th>
            <th style={th}>Specialization</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {doctors.length === 0 ? (
            <tr>
              <td colSpan="5" style={noData}>
                No doctors found
              </td>
            </tr>
          ) : (
            doctors.map((doc) => (
              <tr key={doc.id} style={row}>
                <td style={td}>
                  {editingId === doc.id ? (
                    <input
                      style={input}
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                    />
                  ) : doc.name}
                </td>

                <td style={td}>
                  {editingId === doc.id ? (
                    <input
                      style={input}
                      value={editValues.email}
                      onChange={(e) =>
                        setEditValues({ ...editValues, email: e.target.value })
                      }
                    />
                  ) : doc.email}
                </td>

                <td style={td}>
                  {editingId === doc.id ? (
                    <input
                      style={input}
                      value={editValues.password}
                      onChange={(e) =>
                        setEditValues({ ...editValues, password: e.target.value })
                      }
                    />
                  ) : "********"}
                </td>

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
                  ) : doc.specialization}
                </td>

                <td style={td}>
                  {editingId === doc.id ? (
                    <>
                      <button style={saveBtn} onClick={() => saveEdit(doc.id)}>Save</button>
                      <button style={cancelBtn} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button style={editBtn} onClick={() => startEdit(doc)}>Edit</button>
                      <button style={deleteBtn} onClick={() => deleteDoctor(doc.id)}>Delete</button>
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

/* 🎨 STYLES */

const container = {
  padding: "40px",
  maxWidth: "1100px",
  margin: "40px auto",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const title = {
  textAlign: "center",
  marginBottom: "25px",
  color: "#1e293b",
  fontWeight: "600"
};

const alert = {
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "20px",
  textAlign: "center",
  fontWeight: "500"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  textAlign: "left",
  padding: "12px",
  background: "#f1f5f9",
  color: "#334155",
  fontWeight: "600"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #e2e8f0"
};

const row = {
  transition: "0.2s",
};

const noData = {
  textAlign: "center",
  padding: "20px",
  color: "#64748b"
};

const input = {
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "100%"
};

const editBtn = {
  background: "#facc15",
  border: "none",
  padding: "6px 12px",
  marginRight: "5px",
  borderRadius: "6px",
  cursor: "pointer"
};

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

const saveBtn = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  marginRight: "5px",
  borderRadius: "6px",
  cursor: "pointer"
};

const cancelBtn = {
  background: "#64748b",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default ManageDoctors;