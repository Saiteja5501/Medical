import React, { useEffect, useState } from "react";

function PatientAvailableSlots({ doctorId }) {
  const patientId = Number(sessionStorage.getItem("patientId"));
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/availability/doctor/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSlots(data.slots);
      });
  }, [doctorId]);

  const bookSlot = async (slotId) => {
    const res = await fetch("http://localhost:5000/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, patientId })
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h3>Available Time Slots</h3>

      {slots.map(s => (
        <button key={s.id} onClick={() => bookSlot(s.id)}>
          {s.date} {s.time}
        </button>
      ))}

      {message && <p>{message}</p>}
    </div>
  );
}

export default PatientAvailableSlots;
