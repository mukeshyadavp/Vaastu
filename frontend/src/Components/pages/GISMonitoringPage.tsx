import { useEffect, useMemo, useState } from "react";
import "./GISMonitoringPage.css";

import { apiGet } from "../../Services/api";

import mainImg from "../../assets/modern-district-aerial-panorama-urban-style.jpg";
import img2 from "../../assets/feb.jfif";
import img23 from "../../assets/Image2-3.jfif";
import img41 from "../../assets/building4-1.jfif";
import house from "../../assets/house.jpg";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type ApiApplication = {
  id: number;
  applicantName?: string;
  name?: string;
  status?: string;
  location?: string;
  plotSize?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type Building = {
  id: number;
  name: string;
  img: string;
  status: string;
  locationText?: string;
  plotSize?: string;
  position: [number, number];
};

type BuildingItem = {
  label: string;
  status: "clear" | "violation";
  location: [number, number];
  date: string;
};

const fallbackImages = [mainImg, img23, img2, img41, house];

const fallbackLocations: [number, number][] = [
  [17.385, 78.4867],
  [16.5062, 80.648],
  [17.6868, 83.2185],
  [15.8281, 78.0373],
  [18.311, 78.3409],
];

const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const isValidCoordinate = (lat: number, lng: number) => {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
};

const StageSatellitePreview = ({
  position,
  date,
  label,
}: {
  position: [number, number];
  date: string;
  label: string;
}) => {
  return (
    <div className="gis-stage-image-wrapper">
      <div className="gis-stage-satellite-map">
        <MapContainer
          center={position}
          zoom={18}
          style={{
            height: "100%",
            width: "100%",
          }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          <Marker position={position} icon={blinkingIcon}>
            <Popup>
              <strong>{label}</strong>
              <br />
              Date: {date}
              <br />
              Lat: {position[0]}
              <br />
              Lng: {position[1]}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-stage-zoom-badge">Clear Satellite View</div>
      </div>

      <div className="gis-stage-image-meta">
        <span>{label}</span>
        <span>{date}</span>
      </div>
    </div>
  );
};

const MapPreview = ({ building }: { building: Building }) => {
  return (
    <MapContainer
      center={building.position}
      zoom={17}
      style={{
        height: "460px",
        width: "100%",
        borderRadius: "18px",
        marginBottom: "22px",
      }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles © Esri"
      />

      <Marker position={building.position} icon={blinkingIcon}>
        <Popup>
          <strong>{building.name}</strong>
          <br />
          Status: {building.status}
          <br />
          Lat: {building.position[0]}
          <br />
          Lng: {building.position[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

const buildStageTimeline = (building: Building): BuildingItem[] => {
  const normalizedStatus = building.status.toLowerCase();

  const hasViolation =
    normalizedStatus === "rejected" ||
    normalizedStatus === "violation" ||
    normalizedStatus === "unauthorized";

  return [
    {
      label: "Stage 1 - 1 year ago",
      status: "clear",
      location: building.position,
      date: "2025-04-27",
    },
    {
      label: "Stage 2 - 6 months ago",
      status: "clear",
      location: building.position,
      date: "2025-10-27",
    },
    {
      label: "Stage 3 - 3 months ago",
      status: hasViolation ? "violation" : "clear",
      location: building.position,
      date: "2026-01-27",
    },
  ];
};

const GISMonitoringPage = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        const response: any = await apiGet("/api/applications");

        if (response?.data?.length > 0) {
          setApplications(response.data);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("API Error:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const buildings: Building[] = useMemo(() => {
    return applications.map((item, index) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      const position: [number, number] = isValidCoordinate(lat, lng)
        ? [lat, lng]
        : fallbackLocations[index % fallbackLocations.length];

      return {
        id: item.id,
        name: item.applicantName || item.name || `Application ${item.id}`,
        img: fallbackImages[index % fallbackImages.length],
        status: item.status || "Pending",
        locationText: item.location,
        plotSize: item.plotSize,
        position,
      };
    });
  }, [applications]);

  const timeline = selectedBuilding ? buildStageTimeline(selectedBuilding) : [];

  return (
    <div className="gis-page">
      <h1 className="gis-title">GIS & Satellite Monitoring</h1>

      {loading && <p className="gis-loading">Loading applications...</p>}

      {!loading && !selectedBuilding && buildings.length === 0 && (
        <div className="gis-empty">
          No applications found. Submit applications with latitude and longitude
          to view GIS monitoring.
        </div>
      )}

      {!selectedBuilding && buildings.length > 0 && (
        <div className="gis-grid">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="gis-card"
              onClick={() => setSelectedBuilding(building)}
              style={{ backgroundImage: `url(${building.img})` }}
            >
              <div className="gis-overlay">
                <div>
                  <strong>{building.name}</strong>

                  <span>
                    {building.status} · Lat {building.position[0].toFixed(5)},
                    Lng {building.position[1].toFixed(5)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBuilding && (
        <div className="gis-detail">
          <button
            className="gis-back"
            onClick={() => setSelectedBuilding(null)}
          >
            ⬅ Back
          </button>

          <div className="gis-map-section">
            <MapPreview building={selectedBuilding} />
          </div>

          <h2>{selectedBuilding.name}</h2>

          <div className="gis-meta-row">
            <span>Status: {selectedBuilding.status}</span>

            {selectedBuilding.locationText && (
              <span>Location: {selectedBuilding.locationText}</span>
            )}

            {selectedBuilding.plotSize && (
              <span>Plot Size: {selectedBuilding.plotSize}</span>
            )}

            <span>
              Coordinates: {selectedBuilding.position[0]},{" "}
              {selectedBuilding.position[1]}
            </span>
          </div>

          <div className="gis-timeline">
            {timeline.map((item, index) => (
              <div key={`${item.label}-${index}`} className="gis-month-card">
                <h4>{item.label}</h4>

                <StageSatellitePreview
                  position={item.location}
                  date={item.date}
                  label={item.label}
                />

                <div
                  className={
                    item.status === "violation" ? "gis-alert" : "gis-clear"
                  }
                >
                  {item.status === "violation"
                    ? "🚨 Construction outside boundary"
                    : "✅ No violation detected"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GISMonitoringPage;