// import { useState } from "react";
// import "./Monitor.css";
// import AdminTopBar from "../AdminTopBar";

// import img1 from "../assets/emptyland.webp";
// import img2 from "../assets/feb.jfif";
// import img3 from "../assets/march.png";
// import img4 from "../assets/april.webp";
// import mainImg from "../assets/modern-district-aerial-panorama-urban-style (1).jpg";

// import img21 from "../assets/building2-1.webp";
// import img23 from "../assets/Image2-3.jfif";

// import img31 from "../assets/building3-1.webp";
// import img41 from "../assets/building4-1.jfif";

// import { MapContainer, TileLayer, Marker } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// /* 🔥 BLINKING MARKER */
// const blinkingIcon = L.divIcon({
//   className: "",
//   html: `<div class="blink-marker"></div>`,
//   iconSize: [20, 20],
// });

// /* 🔥 MAP LOCATIONS */
// const buildingLocations: Record<number, [number, number]> = {
//   1: [17.385, 78.4867],
//   2: [17.45, 78.38],
//   3: [17.3, 78.55],
//   4: [17.42, 78.6],
// };

// /* 🔥 MAP PREVIEW */
// const MapPreview = ({ id }: { id: number }) => {
//   const position = buildingLocations[id];

//   return (
//     <MapContainer
//       center={position}
//       zoom={16}
//       style={{
//         height: "150px",
//         width: "60%",
//         borderRadius: "10px",
//       }}
//       scrollWheelZoom={false}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <Marker position={position} icon={blinkingIcon} />
//     </MapContainer>
//   );
// };

// /* 🔥 TYPES */
// type Building = {
//   id: number;
//   name: string;
//   img: string;
// };

// type BuildingItem = {
//   label: string;
//   img: string;
//   status: "clear" | "violation";
// };

// /* 🔥 BUILDINGS */
// const buildings: Building[] = [
//   { id: 1, name: "Building 1", img: mainImg },
//   { id: 2, name: "Building 2", img: img23 },
//   { id: 3, name: "Building 3", img: img2 },
//   { id: 4, name: "Building 4", img: img41 },
// ];

// /* 🔥 DATA */
// const buildingDataMap: Record<number, BuildingItem[]> = {
//   1: [
//     { label: "Stage 1", img: img1, status: "clear" },
//     { label: "Stage 2", img: img2, status: "clear" },
//     { label: "Stage 3", img: img3, status: "violation" },
//     { label: "Stage 4", img: img4, status: "clear" },
//   ],
//   2: [
//     { label: "Stage 1", img: img21, status: "clear" },
//     { label: "Stage 2", img: img2, status: "clear" },
//     { label: "Stage 3", img: img23, status: "violation" },
//   ],
//   3: [
//     { label: "Phase 1", img: img31, status: "clear" },
//     { label: "Phase 2", img: img2, status: "violation" },
//   ],
//   4: [{ label: "Only Stage", img: img41, status: "clear" }],
// };

// const Monitor = () => {
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

//   return (
//     <>
//       {/* 🔥 TOPBAR */}
//       <AdminTopBar setPage={() => {}} />

//       <div className="monitor-page">
//         <div className="monitor-content">

//           {/* ================= BUILDINGS ================= */}
//           {!selectedBuilding && (
//             <>
//               <h2>Buildings Progress</h2>

//               <div className="grid">
//                 {buildings.map((b) => (
//                   <div
//                     key={b.id}
//                     className={`card-box b${b.id}`}
//                     onClick={() => setSelectedBuilding(b)}
//                   >
//                     <div className="card-text">{b.name}</div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {/* ================= BUILDING DETAILS ================= */}
//           {selectedBuilding && (
//             <>
//               <h2>{selectedBuilding.name}</h2>

//               <div className="building-top-section">
//                 <MapPreview id={selectedBuilding.id} />
//               </div>

//               <div className="timeline-months">
//                 {buildingDataMap[selectedBuilding.id]?.map((item, index) => (
//                   <div key={index} className="month-card">
//                     <h4>{item.label}</h4>

//                     <div className="image-box">
//                       <img src={item.img} alt="" />

//                       {item.status === "violation" &&
//                         selectedBuilding.id === 1 && (
//                           <div className="alert-box">
//                             🚨 Construction outside boundary
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 className="back-btn"
//                 onClick={() => setSelectedBuilding(null)}
//               >
//                 ⬅ Back
//               </button>
//             </>
//           )}

//         </div>
//       </div>
//     </>
//   );
// };

// export default Monitor;