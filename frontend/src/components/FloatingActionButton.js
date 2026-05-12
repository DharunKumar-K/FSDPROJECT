import React from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingActionButton() {
  const navigate = useNavigate();

  return (
    <button
      className="fab"
      onClick={() => navigate("/dashboard")}
      title="Quick Dashboard"
    >
      <span style={{ fontSize: 28, fontWeight: 700 }}>+</span>
    </button>
  );
}
