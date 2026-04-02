import { useState } from "react";
import "./MonitorPopup.css";
import img1 from "../assets/empty land.webp";
import img2 from "../assets/feb.jfif";
import img3 from "../assets/march.png";
import img4 from "../assets/april.webp"

// 🔥 BUILDINGS
const buildings = [
  { id: 1, name: "Building 1", percent: "100%" },
  { id: 2, name: "Building 2", percent: "75%" },
  { id: 3, name: "Building 3", percent: "50%" },
  { id: 4, name: "Building 4", percent: "25%" },
];

// 🔥 MONTHLY DATA (SAME FOR ALL BUILDINGS DEMO)
const monthsData = [
  {
    month: "January",
    img: img1,
    status: "clear",
  },
  {
    month: "February",
     img: img2,
    status: "clear",
  },
  {
    month: "March",
    img: img3,
    status: "violation", // 🔴 only here alert
  },
  {
    month: "April",
    img: img4,
    status: "clear",
  },
];

const MonitorPopup = ({ setBpOpen }: any) => {
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  return (
    <div className="popup">
      <div className="popup-content">

        {/* CLOSE */}
        <span className="close" onClick={() => setBpOpen(false)}>✖</span>

        {/* ================= BUILDINGS ================= */}
        {!selectedBuilding && (
          <>
            <h2>Buildings Progress</h2>

            <div className="grid">
              {buildings.map((b) => (
                <div
                  key={b.id}
                  className="card-box"
                  onClick={() => setSelectedBuilding(b)}
                >
                  <h3>{b.name}</h3>
                  <p>{b.percent}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= MONTHLY VIEW ================= */}
       {selectedBuilding && selectedBuilding.id === 1 && (
          <>
            <h2>
              {selectedBuilding.name} - {selectedBuilding.percent}
            </h2>

            <div className="timeline-months">
              {monthsData.map((m, index) => (
                <div key={index} className="month-card">

                  <h4>{m.month}</h4>

                  <div className="image-box">
                    <img src={m.img} alt="" />

                    {/* 🔴 SHOW ONLY IF VIOLATION */}
                    {m.status === "violation" && (
                      <>
                        <div className="highlight-box"></div>
                        <div className="alert-box">
                          🚨 Construction outside boundary
                        </div>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>

            <button
              className="back-btn"
              onClick={() => setSelectedBuilding(null)}
            >
              ⬅ Back
            </button>
          </>
        )}
        {selectedBuilding && selectedBuilding.id !== 1 && (
  <>
    <h2>
      {selectedBuilding.name} - {selectedBuilding.percent}
    </h2>

    <p style={{ marginTop: "20px" }}>
      🚧 Progress data not available for this building
    </p>

    <button
      className="back-btn"
      onClick={() => setSelectedBuilding(null)}
    >
      ⬅ Back
    </button>
  </>
)}

      </div>
    </div>
  );
};

export default MonitorPopup;