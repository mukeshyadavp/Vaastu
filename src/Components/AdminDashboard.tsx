import "./dashboard.css";
import { useState,  } from "react";

import AdminTopBar from "./AdminTopBar";
import AIUpload from "./AIUpload";
import GISMonitoringPage from "./pages/GISMonitoringPage";
import GovernanceDashboard from "./GovernanceDashboard";
import Dashboard from "./pages/Dashboard";
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

  return (
    <div>
        <AdminTopBar />
   <div className="admin-dashboard">
      
  <div className={`sidebar ${open ? "active" : ""}`}>

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
  {activePage === "dashboard" && <Dashboard />}



  {/* AI PAGE */}
  {activePage === "ai" && <AIUpload />}

{activePage === "gis" && <GISMonitoringPage />}
  

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