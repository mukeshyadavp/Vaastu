import { useState , useEffect } from "react";
import "./MonitorPopup.css";

import img1 from "../assets/empty land.webp";
import img2 from "../assets/feb.jfif";
import img3 from "../assets/march.png";
import img4 from "../assets/april.webp";
import mainImg from "../assets/modern-district-aerial-panorama-urban-style (1).jpg";

import img21 from "../assets/building2-1.webp";
import img23 from "../assets/Image2-3.jfif";

import img31 from "../assets/building3-1.webp";
import img41 from "../assets/building4-1.jfif";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
});


const buildingLocations: Record<number, [number, number]> = {
  1: [17.385, 78.4867],   // Hyderabad
  2: [17.4500, 78.3800],  // Location 2
  3: [17.3000, 78.5500],  // Location 3
  4: [17.4200, 78.6000],  // Location 4
};
const MapPreview = ({ id }: { id: number }) => {
  const position = buildingLocations[id];

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{
        height: "150px",
        width: "60%",
        borderRadius: "10px"
      }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={blinkingIcon} />
    </MapContainer>
  );
};
// 🔥 TYPES
type Building = {
  id: number;
  name: string;
    img: string; // 🔥 add this
};

type BuildingItem = {
  label: string;
  img: string;
  status: "clear" | "violation";
};

// 🔥 BUILDINGS
// const buildings: Building[] = [
//   { id: 1, name: "Building 1" },
//   { id: 2, name: "Building 2" },
//   { id: 3, name: "Building 3" },
//   { id: 4, name: "Building 4" },
// ];

const buildings: Building[] = [
  { id: 1, name: "Building 1", img: mainImg },
  { id: 2, name: "Building 2", img: img23 },
  { id: 3, name: "Building 3", img: img2 },
  { id: 4, name: "Building 4", img: img41 },
];

// 🔥 ALL BUILDING DATA
const buildingDataMap: Record<number, BuildingItem[]> = {
  1: [
    { label: "Stage 1", img: img1, status: "clear" },
    { label: "Stage 2", img: img2, status: "clear" },
    { label: "Stage 3", img: img3, status: "violation" },
    { label: "Stage 4", img: img4, status: "clear" },
  ],
  2: [
    { label: "Stage 1", img: img21, status: "clear" },
    { label: "Stage 2", img: img2, status: "clear" },
    { label: "Stage 3", img: img23, status: "violation" },
  ],
  3: [
    { label: "Phase 1", img: img31, status: "clear" },
    { label: "Phase 2", img: img2, status: "violation" },
  ],
  4: [
    { label: "Only Stage", img: img41, status: "clear" },
  ],
};

const MonitorPopup = ({ setBpOpen }: { setBpOpen: (val: boolean) => void }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  useEffect(() => {
  // 🚫 disable background scroll
  document.body.style.overflow = "hidden";

  return () => {
    // ✅ enable back when popup closes
    document.body.style.overflow = "auto";
  };
}, []);

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

  <div
    className="card-box b1"
    onClick={() => setSelectedBuilding(buildings[0])}
  >
    <div className="card-text">Building 1</div>
  </div>

  <div
    className="card-box b2"
    onClick={() => setSelectedBuilding(buildings[1])}
  >
    <div className="card-text">Building 2</div>
  </div>

  <div
    className="card-box b3"
    onClick={() => setSelectedBuilding(buildings[2])}
  >
    <div className="card-text">Building 3</div>
  </div>

  <div
    className="card-box b4"
    onClick={() => setSelectedBuilding(buildings[3])}
  >
    <div className="card-text">Building 4</div>
  </div>

</div>
          </>
        )}

        {/* ================= DYNAMIC BUILDING VIEW ================= */}
        {selectedBuilding && (
          <>
            <h2>{selectedBuilding.name}</h2>

            {/* 🔥 Small left image */}
<div className="building-top-section">
  <MapPreview id={selectedBuilding.id} />
</div>
            {/* 🔥 Dynamic Cards */}
            <div className="timeline-months">
              {buildingDataMap[selectedBuilding.id]?.map(
                (item: BuildingItem, index: number) => (
                  <div key={index} className="month-card">
                    <h4>{item.label}</h4>

                    <div className="image-box">
                      <img src={item.img} alt="" />

                  {item.status === "violation" && selectedBuilding.id === 1 && (
  <div className="alert-box">
    🚨 Construction outside boundary
  </div>
)}
                    </div>
                  </div>
                )
              )}
            </div>

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