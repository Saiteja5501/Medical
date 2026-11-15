import React, { useState } from "react";

function Doctors() {
  const [doctors] = useState([
    { id: 1, name: "Dr. John Smith", specialty: "Cardiologist", availability: "Mon-Fri 9AM-5PM" },
    { id: 2, name: "Dr. Emily Davis", specialty: "Dermatologist", availability: "Tue-Thu 10AM-4PM" },
    { id: 3, name: "Dr. Raj Kumar", specialty: "Neurologist", availability: "Mon-Sat 11AM-6PM" }
  ]);

  return (
    <div>
      <h2>Our Doctors</h2>
      <ul className="doctor-list">
        {doctors.map((doc) => (
          <li key={doc.id} className="doctor-card">
            <h3>{doc.name}</h3>
            <p><strong>Specialty:</strong> {doc.specialty}</p>
            <p><strong>Availability:</strong> {doc.availability}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Doctors;
