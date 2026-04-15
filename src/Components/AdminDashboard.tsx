import "./dashboard.css";
import { useState,  } from "react";

import AdminTopBar from "./AdminTopBar";
// import MonitorPopup from "./MonitorPopup";
import Dashboard from "./pages/Dashboard";
const AdminDashboard = () => {
  const [page, setPage] = useState("admin");
  // const navigate = useNavigate();
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
<AdminTopBar setPage={setPage} />
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

  {page === "admin" && (
    <>
      <header className="header">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h1>Admin Dashboard</h1>
      </header>

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

        <div className="card yellow">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
      </div>

      <div className="map">
        <h3>Map View</h3>
        <MapView data={applications} onAdd={handleAddApplication} />
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

  {/* 🔥 STEP 3 CODE EXACT IKKADE */}
 {!loading && result !== "" && (
    <div
      style={{
        marginTop: "10px",
        padding: "10px",
        background: "#f1f5f9",
        borderRadius: "8px",
        fontWeight: "bold",
      }}
    >
      <span style={{ color: result === "success" ? "green" : "red" }}>
        {result === "success" ? "✅" : "❌"} {message}
      </span>

   <button
  style={{
    marginLeft: "10px",
    padding: "6px 12px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
  onClick={() => {
    const link = document.createElement("a");

    if (result === "success") {
      link.href = "/AP-VAASTU-20260327062006 - VAASTU.pdf";
      link.download = "approved.pdf";
    } else {
      link.href = "/AP-VAASTU-20260327062016 - VAASTU.pdf";
      link.download = "rejected.pdf";
    }

    link.click();
  }}
>
  ⬇ Download
</button>
    </div>
  )}
</div>
</div>

        {/* Table */}
  <ApplicationsTable
        data={applications}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  )}

  {page === "dashboard" && <Dashboard />}

 

      </main>
</main>
    </div>
    </div>
  );
};

export default AdminDashboard;