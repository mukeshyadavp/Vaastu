import { useState } from "react";
import "./GISMonitoringPage.css";

import mainImg from "../../assets/modern-district-aerial-panorama-urban-style.jpg"
import img2 from "../../assets/feb.jfif";
import img1 from "../../assets/empty land.webp";
import img3 from "../../assets/march.png";
import img4 from "../../assets/april.webp";
import img21 from "../../assets/building2-1.webp";
import img23 from "../../assets/Image2-3.jfif";
import img31 from "../../assets/building3-1.webp";
import img41 from "../../assets/building4-1.jfif";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Building = {
  id: number;
  name: string;
  img: string;
};

type BuildingItem = {
  label: string;
  img: string;
  status: "clear" | "violation";
};

const buildings: Building[] = [
  { id: 1, name: "Building 1", img: mainImg },
  { id: 2, name: "Building 2", img: img23 },
  { id: 3, name: "Building 3", img: img2 },
  { id: 4, name: "Building 4", img: img41 },
];

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
  4: [{ label: "Only Stage", img: img41, status: "clear" }],
};

const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
});

const buildingLocations: Record<number, [number, number]> = {
  1: [17.385, 78.4867],
  2: [17.4500, 78.3800],
  3: [17.3000, 78.5500],
  4: [17.4200, 78.6000],
};

const MapPreview = ({ id }: { id: number }) => {
  const position = buildingLocations[id];

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{
        height: "250px",
        width: "100%",
        borderRadius: "12px",
        marginBottom: "15px",
      }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={blinkingIcon} />
    </MapContainer>
  );
};

const GISMonitoringPage = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  return (
    <div className="gis-page">

      {/* HEADER */}
      <h1 className="gis-title">GIS & Satellite Monitoring</h1>

      {/* BUILDING GRID */}
      {!selectedBuilding && (
        <div className="gis-grid">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="gis-card"
              onClick={() => setSelectedBuilding(b)}
              style={{ backgroundImage: `url(${b.img})` }}
            >
              <div className="gis-overlay">{b.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL VIEW */}
      {selectedBuilding && (
        <div className="gis-detail">
{/* MAP VIEW */}
<div className="gis-map-section">
  <MapPreview id={selectedBuilding.id} />
</div>
          <h2>{selectedBuilding.name}</h2>

          <div className="gis-timeline">
            {buildingDataMap[selectedBuilding.id]?.map((item, i) => (
              <div key={i} className="gis-month-card">
                <h4>{item.label}</h4>

                <img src={item.img} />

                {item.status === "violation" && selectedBuilding.id === 1 && (
                  <div className="gis-alert">
                    🚨 Construction outside boundary
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="gis-back"
            onClick={() => setSelectedBuilding(null)}
          >
            ⬅ Back
          </button>

        </div>
      )}
    </div>
  );
};

export default GISMonitoringPage;