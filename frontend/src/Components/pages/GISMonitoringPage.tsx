import { useState } from "react";
import "./GISMonitoringPage.css";

import { useEffect } from "react";
import { apiGet } from "../../Services/api"

import mainImg from "../../assets/modern-district-aerial-panorama-urban-style.jpg"
import img2 from "../../assets/feb.jfif";
// import img1 from "../../assets/empty land.webp";
// import img3 from "../../assets/march.png";
// import img4 from "../../assets/april.webp";
// import img21 from "../../assets/building2-1.webp";
import img23 from "../../assets/Image2-3.jfif";
// import img31 from "../../assets/building3-1.webp";
import img41 from "../../assets/building4-1.jfif";
// import monitor1 from "../../assets/monitor1.jpg";
// import monitor2 from "../../assets/monitor2.jpg";
// import monitor3 from "../../assets/monitor3.png";
// import monitor4 from "../../assets/monitor4.png";
// import monitor5 from "../../assets/monitor5.png";
// import monitor6 from "../../assets/monitor6.png";  
import house from "../../assets/house.jpg";       


import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// import { img } from "framer-motion/m";
// import { i } from "framer-motion/client";

type Building = {
  id: number;
  name: string;
  img: string;
};

type BuildingItem = {
  label: string;
  img: string;
  status: "clear" | "violation";
  location?: [number, number];
  date?: string;
};


const GISMonitoringPage = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // const [apiLocation, setApiLocation] = useState<[number, number] | null>(null);

  const [apiLocations, setApiLocations] = useState<
  Record<number, [number, number]>
>({});

 useEffect(() => {
  const fetchLocation = async () => {
    try {
      const response: any = await apiGet("/api/applications");

      console.log("API Response:", response);

      if (response?.data?.length > 0) {
        const locations: Record<number, [number, number]> = {};

        response.data.forEach((item: any) => {
          locations[item.id] = [
            Number(item.latitude),
            Number(item.longitude),
          ];
        });

        setApiLocations(locations);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  fetchLocation();
}, []);

const buildings: Building[] = [
  { id: 1, name: "Building 1", img: mainImg },
  { id: 2, name: "Building 2", img: img23 },
  { id: 3, name: "Building 3", img: img2 },
  { id: 4, name: "Building 4", img: img41 },
  { id: 5, name: "Building 5", img: house },
  
];


const buildingDataMap: Record<number, BuildingItem[]> = {
 1: apiLocations[1]
  ? [
      {
        label: "Stage 1 - 1 year ago",
        img: "",
        status: "clear",
        location: apiLocations[1],
        date: "2025-04-27",
      },
      {
        label: "Stage 2 - 6 months ago",
        img: "",
        status: "clear",
        location: apiLocations[1],
        date: "2025-10-27",
      },
      {
        label: "Stage 3 - 3 months ago",
        img: "",
        status: "clear",
        location: apiLocations[1],
        date: "2026-01-27",
      },
    ]
  : [],
2: apiLocations[2]
  ? [
      {
        label: "Stage 1 - 1 year ago",
        img: "",
        status: "clear",
        location: apiLocations[2],
        date: "2025-04-27",
      },
      {
        label: "Stage 2 - 6 months ago",
        img: "",
        status: "clear",
        location: apiLocations[2],
        date: "2025-10-27",
      },
      {
        label: "Stage 3 - 3 months ago",
        img: "",
        status: "violation",
        location: apiLocations[2],
        date: "2026-01-27",
      },
    ]
  : [],
3: apiLocations[3]
  ? [
      {
        label: "Stage 1 - 1 year ago",
        img: "",
        status: "clear",
        location: apiLocations[3],
        date: "2025-04-27",
      },
      {
        label: "Stage 2 - 6 months ago",
        img: "",
        status: "clear",
        location: apiLocations[3],
        date: "2025-10-27",
      },
      {
        label: "Stage 3 - 3 months ago",
        img: "",
        status: "violation",
        location: apiLocations[3],      
        date: "2026-01-27",
      },
    ]
  : [],

4: apiLocations[4]
  ? [
      {
        label: "Stage 1 - 1 year ago",
        img: "",
        status: "clear",
        location: apiLocations[4],
        date: "2025-04-27",
      },
      {
        label: "Stage 2 - 6 months ago",
        img: "",
        status: "clear",
        location: apiLocations[4],
        date: "2025-10-27",
      },
      {
        label: "Stage 3 - 3 months ago",
        img: "",
        status: "violation",
        location: apiLocations[4] ,
        date: "2026-01-27",
      },
    ]
  : [],

5: apiLocations[5]
  ? [
      {
        label: "Stage 1 - 1 year ago",
        img: "",
        status: "clear",
        location: apiLocations[5],
        date: "2025-04-27",
      },
      {
        label: "Stage 2 - 6 months ago",
        img: "",
        status: "clear",
        location: apiLocations[5],
        date: "2025-10-27",
      },
      {
        label: "Stage 3 - 3 months ago",
        img: "",
        status: "clear",
        location: apiLocations[5],
        date: "2026-04-27",
      },
    ]
  : [],
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            


               


const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
});

const buildingLocations: Record<number, [number, number]> = {
  1: apiLocations[1] || [17.3850, 78.4867], // Hyderabad
  2: apiLocations[2] || [16.5062, 80.6480], // Vijayawada
  3: apiLocations[3] || [17.6868, 83.2185], // Visakhapatnam
  4: apiLocations[4] || [15.8281, 78.0373], // Kurnool
  5: apiLocations[5] || [18.3110, 78.3409], // Sangareddy
};


const getHistoricalTileUrl = (
  date: string,
  lat: number,
  lng: number
) => {
  const delta = 0.01; // area size around marker

  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;

  return `https://services.sentinel-hub.com/ogc/wms/9c60b570-aba2-4843-9dc7-bed252179483
?SERVICE=WMS
&REQUEST=GetMap
&VERSION=1.3.0
&LAYERS=1_TRUE_COLOR
&FORMAT=image/jpeg
&CRS=EPSG:4326
&WIDTH=512
&HEIGHT=512
&BBOX=${minLat},${minLng},${maxLat},${maxLng}
&TIME=${date}
&MAXCC=20`;
};

const StageMapPreview = ({
  position,
  date,
}: {
  position: [number, number];
  date: string;
}) => {
  return (
    <MapContainer
      center={position}
      zoom={17}
      style={{
        height: "180px",
        width: "100%",
        borderRadius: "10px",
      }}
      scrollWheelZoom={true}
      dragging={true}
      zoomControl={true}
      doubleClickZoom={true}
    >
<TileLayer
  url={getHistoricalTileUrl(
    date,
    position[0],
    position[1]
  )}
  attribution="Satellite imagery © Sentinel Hub"
/>

      {/* Blinking Marker */}
      <Marker position={position} icon={blinkingIcon} />
    </MapContainer>
  );
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
     {id === 1 || id === 2 || id === 3 || id === 4 || id === 5 ? (
        <>
          {/* Earth View for Building 5 */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {/* Blinking Marker for Building 5 */}
          <Marker position={position} icon={blinkingIcon} />
        </>
      ) : (
        <>
          {/* Normal Map for Other Buildings */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Blinking Marker */}
          <Marker position={position} icon={blinkingIcon} />
        </>
      )}
    </MapContainer>
  );
};

// const GISMonitoringPage = () => {
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

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


                

{(selectedBuilding.id === 1 ||
  selectedBuilding.id === 2 ||
  selectedBuilding.id === 3 ||

    selectedBuilding.id === 4 ||
  selectedBuilding.id === 5) && item.location ? (
  <StageMapPreview
    position={item.location}
    date={item.date || "2026-04-27"}
  />
) : (
  <img src={item.img} />
)}
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