import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import AttendanceScanner from "./components/AttendanceScanner";
import ManualAttendance from "./components/ManualAttendance";
import Activity from "./components/Activity";
import Curriculum from "./components/Curriculum";

import AdminDashboard from "./components/AdminDashboard";
import BulkImport from "./components/BulkImport";
import NotFound from "./components/NotFound";
import AttendanceHistory from "./components/AttendanceHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingActionButton from "./components/FloatingActionButton";
import ThemeToggle from "./components/ThemeToggle";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendanceScanner /></ProtectedRoute>} />
          <Route path="/manual-attendance" element={<ProtectedRoute><ManualAttendance /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
          <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/bulk-import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
          <Route path="/attendance-history" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingActionButton />
        <ThemeToggle />
      </div>
    </Router>
  );
}

export default App;