import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InstancesPage from "./pages/Instances";
import Settings from "./pages/Settings";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instances" element={<InstancesPage />} />
          <Route path="/admin/settings" element={<Settings />} />
          {/* Fallback for admin routes during migration */}
          <Route path="/admin/*" element={<div className="glass p-10 text-center">Admin Module Migration in Progress</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
