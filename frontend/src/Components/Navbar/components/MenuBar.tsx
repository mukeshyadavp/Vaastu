import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);

  const switchLabel = location.pathname === "/admin" ? "Admin" : "User";

  const switchOption =
    location.pathname === "/admin"
      ? { label: "User", path: "/Home" }
      : { label: "Admin", path: "/admin" };

  return (
    <div className="menuBar">
      <div className="menuItems">
        <button className="navBtn homeIcon" onClick={() => navigate("/")}>
          🏠
        </button>

        <button className="navBtn">ABOUT AP-bPASS</button>
        <button className="navBtn">INFORMATION ▼</button>
        <button className="navBtn">RESOURCES ▼</button>
        <button className="navBtn">DCR PORTAL</button>
        <button className="navBtn">SEARCH ▼</button>
        <button className="navBtn">COMPLAINTS ▼</button>
        <button className="navBtn">LOGIN ▼</button>
      </div>

      <div className="dropdownWrapper">
        <button
          className="admin-back-btn"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {switchLabel} ▼
        </button>

        {showMenu && (
          <div className="dropdownMenu">
            <p
              onClick={() => {
                navigate(switchOption.path);
                setShowMenu(false);
              }}
            >
              {switchOption.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;