import React from "react";

function UsersList({
  users = [],
  showRole = true,
  onDelete,
  onToggleStatus,
  onEdit
}) {
  return (
    <div style={container}>
      <table style={table}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            {showRole && <th style={th}>Role</th>}
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" style={empty}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} style={tr}>
                <td style={td}>{user.name}</td>
                <td style={td}>{user.email}</td>

                {showRole && <td style={td}>{user.role}</td>}

                <td style={td}>
                  <span
                    style={{
                      ...statusBadge,
                      backgroundColor:
                        user.active ? "#dcfce7" : "#fee2e2",
                      color: user.active ? "#166534" : "#991b1b"
                    }}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td style={td}>
                  <div style={btnGroup}>
                    {onEdit && (
                      <button
                        style={editBtn}
                        onClick={() => onEdit(user)}
                      >
                        Edit
                      </button>
                    )}

                    {onToggleStatus && (
                      <button
                        style={toggleBtn}
                        onClick={() => onToggleStatus(user)}
                      >
                        {user.active ? "Disable" : "Enable"}
                      </button>
                    )}

                    {onDelete && (
                      <button
                        style={deleteBtn}
                        onClick={() => onDelete(user.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  background: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid #e5e7eb"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const theadRow = {
  backgroundColor: "#f1f5f9"
};

const th = {
  padding: "14px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155"
};

const tr = {
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: "14px",
  fontSize: "14px",
  color: "#0f172a"
};

const empty = {
  padding: "20px",
  textAlign: "center",
  fontSize: "14px",
  color: "#64748b"
};

const btnGroup = {
  display: "flex",
  gap: "8px"
};

const editBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#dbeafe",
  color: "#1e40af",
  fontSize: "12px"
};

const toggleBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#fef3c7",
  color: "#92400e",
  fontSize: "12px"
};

const deleteBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#fee2e2",
  color: "#991b1b",
  fontSize: "12px"
};

const statusBadge = {
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600"
};

export default UsersList;
