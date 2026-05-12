import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../ThemeContext";

export default function ProfileAvatar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <div
        className="profile-avatar"
        onClick={() => setOpen((v) => !v)}
        title={user.name}
      >
        {user.name ? user.name[0].toUpperCase() : "U"}
      </div>
      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-item" style={{ fontWeight: 700 }}>
            {user.name}
          </div>
          <div className="profile-dropdown-item" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </div>
          <div style={{ borderTop: '1px solid var(--border-glass)', margin: '0.25rem 0' }} />
          <div className="profile-dropdown-item" onClick={onLogout} style={{ color: 'var(--accent)' }}>
            🚪 Sign Out
          </div>
        </div>
      )}
    </div>
  );
}
