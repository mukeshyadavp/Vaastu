import "./dashboard.css";
import { useState,  } from "react";

import AdminTopBar from "./AdminTopBar";
import AIUpload from "./AIUpload";
import GISMonitoring from "./GISMonitoring";
import GovernanceDashboard from "./GovernanceDashboard";
const AdminDashboard = () => {
  const [open, setOpen] = useState(false);

const [activePage, setActivePage] = useState("dashboard");

const [applications, setApplications] = useState([
  { id: 101, name: "Ramesh", status: "Pending", lat: 17.385, lng: 78.4867 },
  { id: 102, name: "Suresh", status: "Approved", lat: 17.39, lng: 78.48 },
  { id: 103, name: "Mahesh", status: "Violation", lat: 17.38, lng: 78.49 },
]);
const handleAddApplication = (newApp: any) => {
  setApplications((prev) => [...prev, newApp]);
};
const stats = {
  approved: applications.filter((a) => a.status === "Approved").length,
  pending: applications.filter((a) => a.status === "Pending").length,
  violations: applications.filter((a) => a.status === "Violation").length,
};
const handleApprove = (id: number) => {
  setApplications((prev) =>
    prev.map((app) =>
      app.id === id ? { ...app, status: "Approved" } : app
    )
  );
};

const handleReject = (id: number) => {
  setApplications((prev) =>
    prev.map((app) =>
      app.id === id ? { ...app, status: "Violation" } : app
    )
  );
};




  return (
    <div>
        <AdminTopBar />
   <div className="admin-dashboard">
      
  <div className={`sidebar ${open ? "active" : ""}`}>
  <h2>Admin</h2>

  <ul>
    <li onClick={() => {setActivePage("dashboard"); setOpen(false);}  }  className="menu-item">
  <span>🏠</span> Dashboard
</li>

<li onClick={() => {setActivePage("ai"); setOpen(false);}} className="menu-item">
  <span>🤖</span> AI-Assisted Automated Scrutiny
</li>
<li onClick={() => {setActivePage("gis"); setOpen(false);}  } className="menu-item">
  <span>🛰</span> GIS & Satellite Monitoring
</li>
<li onClick={() => {setActivePage("governance"); setOpen(false);}} className="menu-item">
  <span>🏛</span> Governance Dashboard
</li>
  </ul>
</div>
{open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* Main Content */}
   <main className="main">

  <header className="header">
    <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
  </header>

  {/* DASHBOARD VIEW */}
  {activePage === "dashboard" && (
    <>
      <div className="cards">
        <div className="card green">
          <h3>Approved</h3>
          <p>{stats.approved}</p>
        </div>

        <div className="card yellow">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>

        <div className="card red">
          <h3>Violations</h3>
          <p>{stats.violations}</p>
        </div>
      </div>

     

  
    </>
  )}

  {/* AI PAGE */}
  {activePage === "ai" && <AIUpload />}

  {activePage === "gis" && (
  <GISMonitoring
    applications={applications}
    onApprove={handleApprove}
    onReject={handleReject}
  />
  
)}
{activePage === "governance" && (
  <GovernanceDashboard
    applications={applications}
    onAdd={handleAddApplication}
  />
)}

</main>
    </div>
    </div>
  );
};

export default AdminDashboard;