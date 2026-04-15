import "./dashboard.css";
// import { useNavigate } from "react-router-dom";
import { useState,  } from "react";
import MapView from "../Components/MapView";
import ApplicationsTable from "../Components/ApplicationsTable";
import AdminTopBar from "./AdminTopBar";
// import MonitorPopup from "./MonitorPopup";
import Dashboard from "./pages/Dashboard";
const AdminDashboard = () => {
  const [page, setPage] = useState("admin");
  // const navigate = useNavigate();
  const [open, setOpen] = useState(false);
const [file, setFile] = useState<File | null>(null);
const [result, setResult] = useState<"success" | "failure" | "">("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);


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

const handleUpload = () => {
  if (!file) {
    setResult("failure");
    setMessage("Please select a file");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setResult("failure");
    setMessage("File too large (max 2MB)");
    return;
  }

  setLoading(true); // 🔥 START LOADER

  setTimeout(() => {
    const fileName = file.name.toLowerCase();

    if (fileName.includes("2006") || fileName.includes("plan")) {
      setResult("success");
      setMessage("Plan Approved");
    } else {
      setResult("failure");
      setMessage("Plan Rejected");
    }

    setLoading(false); // 🔥 STOP LOADER
  }, 1000); // 2 sec delay
};


  return (
    <div>
<AdminTopBar setPage={setPage} />
   <div className="admin-dashboard">
      
  

      {/* Main Content */}
      <main className="main">

  {page === "admin" && (
    <>
      <header className="header">
        <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        <h1>Admin Dashboard</h1>
      </header>

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

      <div className="map">
        <h3>Map View</h3>
        <MapView data={applications} onAdd={handleAddApplication} />
      </div>

<div className="upload-section">
<div style={{ marginTop: "20px" }}>
  <h3>Upload Building Plan</h3>

<div className="upload-row">
  <input
    type="file"
    accept=".pdf"
    onChange={(e) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    }}
  />

  <button className="upload-btn" onClick={handleUpload}>
    Upload
  </button>
</div>

{/* 👇 IDHI IMPORTANT – upload row kinda */}
{loading && (
  <div className="loader-container">
    <div className="spinner"></div>
    <p>Uploading...</p>
  </div>
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
    </div>
    </div>
  );
};

export default AdminDashboard;