import React from "react";

function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#e6f7ff",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#007bff", fontSize: "36px", marginBottom: "20px" }}>
        Welcome to Online Medical Services
      </h1>

      <p style={{ fontSize: "18px", color: "#333", maxWidth: "600px" }}>
        Book doctor appointments, view services, and manage medical records easily.
      </p>
    </div>
  );
}

export default Home;
