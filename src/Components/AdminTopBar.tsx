import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./AdminTopBar.css";
import { useState } from "react";
import { useLocation } from "react-router-dom";

// 🔥 Add MonitorPopup import
import MonitorPopup from "./MonitorPopup"; // Adjust path as needed

const AdminTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  // 🔥 Add monitor popup state
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);

  return (
    <div className="admin-navbar">
      {/* TOP HEADER */}
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

      {/* MENU BAR */}
      <div className="admin-menu-bar">
        <div className="admin-menu-left">
             <div className="homeWrapper">
          <span className="admin-home-icon" onClick={() => navigate("/Home")}>🏠</span>
          </div>
          <div className="icons1">
            <button className="admin-menu-item">Dashboard ▼</button>
            <button className="admin-menu-item">Applications ▼</button>
            <button className="admin-menu-item">Search ▼</button>
            {/* 🔥 MONITOR BUTTON */}
            <button 
              className="admin-menu-item" 
              // onClick={() => setIsMonitorOpen(true)}
            >
              Monitor ▼
            </button>
            <button className="admin-menu-item">Violations ▼</button>
            <button className="admin-menu-item">Map View ▼</button>
            <button className="admin-menu-item">Login ▼</button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="dropdownWrapper">
          <button
            className="admin-back-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            Admin ▼
          </button>

          {showMenu && (
            <div className="dropdownMenu">
              {/* 🔥 ADMIN PAGE lo unte only USER chupinchu */}
              {location.pathname === "/admin" && (
                <p
                  onClick={() => {
                    navigate("/Home");
                    setShowMenu(false);
                  }}
                >
                  User
                </p>
              )}

              {/* 🔥 HOME lo unte only ADMIN chupinchu */}
              {location.pathname === "/Home" && (
                <p
                  onClick={() => {
                    navigate("/admin");
                    setShowMenu(false);
                  }}
                >
                  Admin
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 MONITOR POPUP */}
      {isMonitorOpen && (
        <MonitorPopup setBpOpen={setIsMonitorOpen} />
      )}
    </div>
  );
};

export default AdminTopBar;