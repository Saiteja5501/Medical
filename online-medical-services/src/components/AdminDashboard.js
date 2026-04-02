import React, { useState } from "react";

function AdminDashboard() {
  // Dummy data for now
  const [doctors] = useState([
    { id: 1, name: "Dr. John Smith", specialization: "Cardiologist" },
    { id: 2, name: "Dr. Emily Davis", specialization: "Dermatologist" }
  ]);

  const [users] = useState([
    { id: 1, name: "Alice", email: "alice@mail.com" },
    { id: 2, name: "Bob", email: "bob@mail.com" }
  ]);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Doctors Section */}
      <section>
        <h3>Manage Doctors</h3>
        <ul>
          {doctors.map((doc) => (
            <li key={doc.id}>
              {doc.name} - {doc.specialization}
            </li>
          ))}
        </ul>
      </section>

      {/* Users Section */}
      <section>
        <h3>Manage Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
