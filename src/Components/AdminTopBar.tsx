import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./AdminTopBar.css";
import { useState } from "react";
import { useLocation } from "react-router-dom";
// import MonitorPopup from "./MonitorPopup";
// import Dashboard from "./pages/Dashboard";

const AdminTopBar = ({ setPage }: { setPage: (page: string) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);


  return (
    <>
      {/* 🔥 ALWAYS SHOW NAVBAR */}
      <div className="admin-navbar">
        <div className="admin-header">
          <img src={logo} className="admin-logo" />
          <div>
            <h2 className="admin-main-title">
              Andhra Pradesh Building Permission Approval & Self Certification System
            </h2>
            <h3 className="admin-sub-title">
              (AP-bPASS) GOVERNMENT OF ANDHRA PRADESH
            </h3>
          </div>
        </div>

        <div className="admin-menu-bar">
          <div className="admin-menu-left">
            <div className="homeWrapper">
              <span className="admin-home-icon" onClick={() => navigate("/Home")}>🏠</span>
            </div>
       <div className="icons1">
<button className="admin-menu-item" onClick={() => setPage("dashboard")}>
  Dashboard ▼
</button>




  <button className="admin-menu-item">Applications ▼</button>
  <button className="admin-menu-item">Search ▼</button>
  {/* ✅ Only OPENS monitor */}
{/* <button className="admin-menu-item" onClick={() => navigate("/monitor")}>
  Monitor ▼
</button> */}
  <button className="admin-menu-item">Violations ▼</button>
  <button className="admin-menu-item">Map View ▼</button>
  <button className="admin-menu-item">Login ▼</button>
</div>
          </div>

          <div className="dropdownWrapper">
            <button
              className="admin-back-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              Admin ▼
            </button>
            {showMenu && (
              <div className="dropdownMenu">
                {location.pathname === "/admin" && (
                  <p onClick={() => { navigate("/Home"); setShowMenu(false); }}>
                    User
                  </p>
                )}
                {location.pathname === "/Home" && (
                  <p onClick={() => { navigate("/admin"); setShowMenu(false); }}>
                    Admin
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 MONITOR CONTENT BELOW NAVBAR (Toggle) */}


      
    </>
  );
};

export default AdminTopBar;