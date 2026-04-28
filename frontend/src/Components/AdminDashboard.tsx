import "./AdminDashboard.css";
import { useState, useEffect } from "react";

import AIUpload from "./AIUpload";
import GISMonitoringPage from "./pages/GISMonitoringPage";
import GovernanceDashboard from "./GovernanceDashboard";
import Dashboard from "./pages/Dashboard";
import Navbar from "./Navbar";

import {
  getApplications,
  approveApplication,
  rejectApplication,
  updateApplicationWithFile,
} from "../Services/applicationService";

type Application = {
  id: number;
  name: string;
  applicantName?: string;
  status: string;
  location?: string;
  plotSize?: string;
  plotArea?: string;
  surveyNo?: string;
  landType?: string;
  buildingType?: string;
  floors?: string | number;
  builtupArea?: string;
  height?: string | number;
  roadWidth?: string;
  frontSetback?: string;
  sideSetback?: string;
  rearSetback?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  fileName?: string;
  fileUrl?: string;
  uploadedFile?: string;
  [key: string]: any;
};

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");
  const [bpOpen, setBpOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);

  const fetchApplications = async () => {
    try {
      const data = await getApplications();

      console.log("API RESPONSE:", data);

      const apps = Array.isArray(data) ? data : data.data || [];

      // IMPORTANT: keep all backend fields using ...app
      setApplications(
        apps.map((app: any) => ({
          ...app,
          id: app.id,
          name: app.applicantName || app.name || `Application ${app.id}`,
          applicantName: app.applicantName || app.name || `Application ${app.id}`,
          status: app.status || "Pending",
        }))
      );
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onApprove = async (id: number) => {
    try {
      await approveApplication(id);
      await fetchApplications();
    } catch (err) {
      console.error("Error approving application:", err);
    }
  };

  const onReject = async (id: number) => {
    try {
      await rejectApplication(id);
      await fetchApplications();
    } catch (err) {
      console.error("Error rejecting application:", err);
    }
  };

  const onUpdate = async (id: number, payload: FormData) => {
    try {
      await updateApplicationWithFile(id, payload);
      await fetchApplications();
    } catch (err) {
      console.error("Error updating application:", err);
    }
  };

  const handleAddApplication = (newApp: Application) => {
    setApplications((prev) => [...prev, newApp]);
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
        fetchApplications={fetchApplications}
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

        {open && <div className="overlay" onClick={() => setOpen(false)} />}

        <main className="main">
          <header className="header">
            <button className="menu-btn" onClick={() => setOpen(!open)}>
              ☰
            </button>
          </header>

          {activePage === "dashboard" && (
            <Dashboard applications={applications} />
          )}

          {activePage === "ai" && <AIUpload />}

          {activePage === "gis" && <GISMonitoringPage />}

          {activePage === "governance" && (
            <GovernanceDashboard
              applications={applications}
              onApprove={onApprove}
              onReject={onReject}
              onUpdate={onUpdate}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;