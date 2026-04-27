import "./AdminDashboard.css";
import { useState, useEffect } from "react";

import AIUpload from "./AIUpload";
import GISMonitoringPage from "./pages/GISMonitoringPage";
import GovernanceDashboard from "./GovernanceDashboard";
import Dashboard from "./pages/Dashboard";
import Navbar from "./Navbar";

type Application = {
  id: number;
  name: string;
  status: string;
};

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");
  const [bpOpen, setBpOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  // ✅ KEEP existing state but empty it (no delete)
const [applications, setApplications] = useState<Application[]>([]);

  // ✅ GET FUNCTION
  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications");
      const data = await res.json();
    setApplications(
data.data.map((app: any) => ({    id: app.id,
    name: app.applicantName, // 🔥 fix
    status: app.status,
  }))
);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // ✅ LOAD DATA ON PAGE LOAD
  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ APPROVE FUNCTION
const onApprove = async (id: number) => {    try {
      await fetch(
        `http://localhost:5000/api/applications/${id}/approve`,
        {
          method: "PUT",
        }
      );
      fetchApplications(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ REJECT FUNCTION
const onReject = async (id: number) => {    try {
      await fetch(
        `http://localhost:5000/api/applications/${id}/reject`,
        {
          method: "PUT",
        }
      );
      fetchApplications(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ KEEP EXISTING (not removing)
const handleAddApplication = (newApp: Application) => {    setApplications((prev) => [...prev, newApp]);
  };

  return (
    <div>
      <Navbar
        open={open}
        setOpen={setOpen}
        bpOpen={bpOpen}
        setBpOpen={setBpOpen}
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        applyOpen={applyOpen}
        setApplyOpen={setApplyOpen}
          fetchApplications={fetchApplications} // ✅ ADD
      />

      <div className="admin-dashboard">
        <div className={`sidebar ${open ? "active" : ""}`}>
          <ul className="menu-cards">
            <li
              onClick={() => {
                setActivePage("dashboard");
                setOpen(false);
              }}
              className="menu-item"
            >
              <span>🏠</span> Dashboard
            </li>

            <li
              onClick={() => {
                setActivePage("ai");
                setOpen(false);
              }}
              className="menu-item"
            >
              <span>🤖</span> AI-Assisted Automated Scrutiny
            </li>

            <li
              onClick={() => {
                setActivePage("gis");
                setOpen(false);
              }}
              className="menu-item"
            >
              <span>🛰</span> GIS & Satellite Monitoring
            </li>

            <li
              onClick={() => {
                setActivePage("governance");
                setOpen(false);
              }}
              className="menu-item"
            >
              <span>🏛</span> Governance Dashboard
            </li>
          </ul>
        </div>

        {open && (
          <div className="overlay" onClick={() => setOpen(false)}></div>
        )}

        {/* MAIN CONTENT */}
        <main className="main">
          <header className="header">
            <button
              className="menu-btn"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          </header>

        {activePage === "dashboard" && (
  <Dashboard applications={applications} />
)}
          {activePage === "ai" && <AIUpload />}
          {activePage === "gis" && <GISMonitoringPage />}

          {/* ✅ GOVERNANCE DASHBOARD */}
          {activePage === "governance" && (
            <GovernanceDashboard
              applications={applications}
              onApprove={onApprove}
              onReject={onReject}
              onAdd={handleAddApplication} // kept (not removed)
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;