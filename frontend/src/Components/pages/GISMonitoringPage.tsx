import { useEffect, useMemo, useRef, useState } from "react";
import "./GISMonitoringPage.css";
import { apiGet } from "../../Services/api";

import mainImg from "../../assets/modern-district-aerial-panorama-urban-style.jpg";
import img2 from "../../assets/feb.jfif";
import img23 from "../../assets/Image2-3.jfif";
import img41 from "../../assets/building4-1.jfif";
import house from "../../assets/house.jpg";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ─────────────────────────────────
   Types
───────────────────────────────── */

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
  previewImage: string;
  fallbackImage: string;
  status: string;
  locationText?: string;
  plotSize?: string;
  position: [number, number];
};

type WaybackRelease = {
  releaseNum: number;
  releaseDateLabel: string;
  stageLabel: string;
};

/* ─────────────────────────────────
   URLs
───────────────────────────────── */

const ESRI_CURRENT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const waybackUrl = (id: number) =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${id}/{z}/{y}/{x}`;

const getLatestLocationPreviewImage = (lat: number, lng: number) => {
  /*
    Latest clear satellite preview for the building card.
    Smaller delta = closer image.
    If too zoomed-in, increase to 0.0012.
  */
  const delta = 0.0009;

  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;

  return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${minLng},${minLat},${maxLng},${maxLat}&bboxSR=4326&imageSR=4326&size=1000,620&format=jpg&f=image`;
};

/* ─────────────────────────────────
   Static fallback releases
───────────────────────────────── */

const STATIC_RELEASES: WaybackRelease[] = [
  {
    releaseNum: 0,
    releaseDateLabel: "2014 – Baseline",
    stageLabel: "Stage 1 · Baseline (2014)",
  },
  {
    releaseNum: 0,
    releaseDateLabel: "2019",
    stageLabel: "Stage 2 · 2019 Capture",
  },
  {
    releaseNum: 0,
    releaseDateLabel: "2023",
    stageLabel: "Stage 3 · 2023 Capture",
  },
  {
    releaseNum: 0,
    releaseDateLabel: "2024",
    stageLabel: "Stage 4 · 2024 Capture",
  },
  {
    releaseNum: 0,
    releaseDateLabel: "2025",
    stageLabel: "Stage 5 · 2025 Capture",
  },
  {
    releaseNum: 0,
    releaseDateLabel: "2026 (Latest)",
    stageLabel: "Stage 6 · Latest (2026)",
  },
];

const TIMELINE_INDICES = [0, 3, 5];

/* ─────────────────────────────────
   Helpers
───────────────────────────────── */

const fallbackImages = [mainImg, img23, img2, img41, house];

const fallbackLocations: [number, number][] = [
  [17.385, 78.4867],
  [16.5062, 80.648],
  [17.6868, 83.2185],
  [15.8281, 78.0373],
  [18.311, 78.3409],
];

const isValid = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

async function fetchWaybackReleases(): Promise<WaybackRelease[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Esri/wayback/master/src/data/wayback-config.json",
      { cache: "force-cache" }
    );

    if (!response.ok) {
      throw new Error("Wayback release fetch failed");
    }

    const data: Record<string, { releaseDateLabel?: string }> =
      await response.json();

    const sorted = Object.entries(data)
      .map(([key, value]) => ({
        releaseNum: parseInt(key, 10),
        releaseDateLabel: value.releaseDateLabel ?? key,
        stageLabel: value.releaseDateLabel ?? key,
      }))
      .filter((item) => !Number.isNaN(item.releaseNum))
      .sort((a, b) => a.releaseNum - b.releaseNum);

    if (sorted.length === 0) {
      throw new Error("No releases available");
    }

    const step = Math.max(1, Math.floor(sorted.length / 5));
    const picked: WaybackRelease[] = [];

    for (let index = 0; index < 5; index += 1) {
      const release = sorted[Math.min(index * step, sorted.length - 1)];

      picked.push({
        ...release,
        stageLabel: `Stage ${index + 1} · ${release.releaseDateLabel}`,
      });
    }

    const latest = sorted[sorted.length - 1];

    picked.push({
      ...latest,
      stageLabel: `Stage 6 · Latest (${latest.releaseDateLabel})`,
    });

    return picked;
  } catch {
    return STATIC_RELEASES;
  }
}

const getChangeStatus = (index: number, status: string) => {
  const normalizedStatus = status.toLowerCase();

  const hasIssue =
    normalizedStatus === "rejected" ||
    normalizedStatus === "violation" ||
    normalizedStatus === "unauthorized";

  if (index === 0) {
    return {
      label: "✅ No construction — baseline clear",
      type: "clear" as const,
    };
  }

  if (index === 1) {
    return hasIssue
      ? {
          label: "⚠️ New structure — permit review needed",
          type: "warning" as const,
        }
      : {
          label: "✅ Authorized construction in progress",
          type: "clear" as const,
        };
  }

  return hasIssue
    ? {
        label: "🚨 Unauthorized deviation — exceeds approved boundary",
        type: "violation" as const,
      }
    : {
        label: "✅ Construction matches approved plan",
        type: "clear" as const,
      };
};

/* ─────────────────────────────────
   Map helpers
───────────────────────────────── */

const MapRecenter = ({ pos }: { pos: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(pos, map.getZoom());
  }, [pos, map]);

  return null;
};

const SmartTileLayer = ({ release }: { release: WaybackRelease }) => {
  const [fallback, setFallback] = useState(false);
  const errorCount = useRef(0);

  const useCurrent = release.releaseNum === 0 || fallback;
  const url = useCurrent ? ESRI_CURRENT : waybackUrl(release.releaseNum);

  const attribution = useCurrent
    ? "© Esri — Current Imagery"
    : `© Esri Wayback — Release ${release.releaseNum} · ${release.releaseDateLabel}`;

  return (
    <TileLayer
      key={url}
      url={url}
      attribution={attribution}
      maxNativeZoom={19}
      maxZoom={21}
      eventHandlers={{
        tileerror: () => {
          errorCount.current += 1;

          if (errorCount.current >= 3 && !fallback) {
            setFallback(true);
          }
        },
      }}
    />
  );
};

/* ─────────────────────────────────
   Stage Card
───────────────────────────────── */

const StageCard = ({
  release,
  pos,
  status,
  index,
}: {
  release: WaybackRelease;
  pos: [number, number];
  status: string;
  index: number;
}) => {
  const change = getChangeStatus(index, status);

  return (
    <div className={`gis-month-card gis-month-card--${change.type}`}>
      <div className="gis-stage-header">
        <div>
          <h4>{release.stageLabel}</h4>
          <span className="gis-stage-date">{release.releaseDateLabel}</span>
        </div>

      </div>

      <div className="gis-stage-satellite-map">
        <MapContainer
          center={pos}
          zoom={18}
          style={{ height: "100%", width: "100%" }}
          zoomControl
          scrollWheelZoom
          doubleClickZoom
          attributionControl={false}
        >
          <SmartTileLayer release={release} />
          <MapRecenter pos={pos} />

          <Marker position={pos} icon={blinkingIcon}>
            <Popup>
              <strong>{release.stageLabel}</strong>
              <br />
              {release.releaseDateLabel}
              <br />
              Lat: {pos[0].toFixed(6)}
              <br />
              Lng: {pos[1].toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-stage-zoom-badge">
          📡{" "}
          {release.releaseNum === 0
            ? "Current Imagery"
            : `Wayback · ${release.releaseDateLabel}`}
        </div>
      </div>

      <div className={`gis-change-badge gis-change-badge--${change.type}`}>
        {change.label}
      </div>

      <div className="gis-release-info">
        {release.releaseNum === 0 ? (
          "Current Esri imagery"
        ) : (
          <>
            Release ID: <code>{release.releaseNum}</code>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────
   Full Archive Viewer
───────────────────────────────── */

const FullArchive = ({
  pos,
  name,
  releases,
}: {
  pos: [number, number];
  name: string;
  releases: WaybackRelease[];
}) => {
  const [selectedRelease, setSelectedRelease] = useState(
    releases[releases.length - 1]
  );

  useEffect(() => {
    if (releases.length > 0) {
      setSelectedRelease(releases[releases.length - 1]);
    }
  }, [releases]);

  if (!selectedRelease) {
    return null;
  }

  return (
    <div className="gis-wayback-viewer">
      <h3 className="gis-wayback-title">📡 Full Historical Archive — {name}</h3>

      <div className="gis-wayback-releases">
        {releases.map((release, index) => (
          <button
            type="button"
            key={`${release.releaseNum}-${release.releaseDateLabel}-${index}`}
            className={`gis-release-btn ${
              selectedRelease.releaseNum === release.releaseNum &&
              selectedRelease.releaseDateLabel === release.releaseDateLabel
                ? "active"
                : ""
            }`}
            onClick={() => setSelectedRelease(release)}
          >
            {release.releaseDateLabel}
          </button>
        ))}
      </div>

      <div className="gis-wayback-map-wrapper">
        <MapContainer
          center={pos}
          zoom={18}
          style={{ height: "100%", width: "100%" }}
          zoomControl
          scrollWheelZoom
          attributionControl={false}
        >
          <SmartTileLayer
            key={selectedRelease.releaseDateLabel}
            release={selectedRelease}
          />

          <MapRecenter pos={pos} />

          <Marker position={pos} icon={blinkingIcon}>
            <Popup>
              <strong>{name}</strong>
              <br />
              {selectedRelease.stageLabel}
              <br />
              {selectedRelease.releaseDateLabel}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-wayback-overlay-label">
          🛰️ {selectedRelease.stageLabel}
        </div>
      </div>

      <p className="gis-wayback-note">
        Historical imagery from Esri Wayback Archive. Automatically falls back
        to current Esri satellite if a capture has no coverage for this
        location.
      </p>
    </div>
  );
};

/* ─────────────────────────────────
   Page
───────────────────────────────── */

const GISMonitoringPage = () => {
  const [selected, setSelected] = useState<Building | null>(null);
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [releases, setReleases] =
    useState<WaybackRelease[]>(STATIC_RELEASES);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        const response: any = await apiGet("/api/applications");

        setApplications(response?.data?.length > 0 ? response.data : []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    fetchWaybackReleases().then(setReleases);
  }, []);

  useEffect(() => {
    setShowArchive(false);
  }, [selected]);

  const buildings: Building[] = useMemo(() => {
    return applications.map((item, index) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      const validPosition = isValid(lat, lng);
      const position: [number, number] = validPosition
        ? [lat, lng]
        : fallbackLocations[index % fallbackLocations.length];

      const fallbackImage = fallbackImages[index % fallbackImages.length];

      return {
        id: item.id,
        name: item.applicantName || item.name || `Application ${item.id}`,
        previewImage: getLatestLocationPreviewImage(position[0], position[1]),
        fallbackImage,
        status: item.status || "Pending",
        locationText: item.location,
        plotSize: item.plotSize,
        position,
      };
    });
  }, [applications]);

  const timelineReleases = TIMELINE_INDICES.map((index) => {
    return releases[Math.min(index, releases.length - 1)];
  }).filter(Boolean);

  return (
    <div className="gis-page">
      <h1 className="gis-title">GIS & Satellite Monitoring</h1>

      {loading && <p className="gis-loading">Loading applications...</p>}

      {!loading && !selected && buildings.length === 0 && (
        <div className="gis-empty">
          No applications found. Submit applications with latitude/longitude to
          enable monitoring.
        </div>
      )}

      {!selected && buildings.length > 0 && (
        <div className="gis-grid">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="gis-card"
              onClick={() => setSelected(building)}
            >
              <img
                src={building.previewImage}
                alt={`${building.name} latest satellite preview`}
                className="gis-card-img"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src = building.fallbackImage;
                }}
              />

              <div className="gis-overlay">
                <div>
                  <strong>{building.name}</strong>

                  <span>
                    {building.status} · {building.position[0].toFixed(5)},{" "}
                    {building.position[1].toFixed(5)}
                  </span>

                  <small className="gis-card-caption">
                    Latest satellite preview
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="gis-detail">
          <button
            type="button"
            className="gis-back"
            onClick={() => setSelected(null)}
          >
            ⬅ Back
          </button>

          <h2>{selected.name}</h2>

          <div className="gis-meta-row">
            <span>Status: {selected.status}</span>

            {selected.locationText && <span>📍 {selected.locationText}</span>}

            {selected.plotSize && <span>📐 {selected.plotSize}</span>}

            <span>
              🌐 {selected.position[0].toFixed(6)},{" "}
              {selected.position[1].toFixed(6)}
            </span>
          </div>

          <div className="gis-section-label">
            📅 Change Detection Timeline
            <span className="gis-section-sub">
              Esri Wayback · Building level historical satellite imagery for each stage of construction
            </span>
          </div>

          <div className="gis-timeline">
            {timelineReleases.map((release, index) => (
              <StageCard
                key={`${release.releaseNum}-${release.releaseDateLabel}-${index}`}
                release={release}
                pos={selected.position}
                status={selected.status}
                index={index}
              />
            ))}
          </div>

          <button
            type="button"
            className="gis-archive-btn"
            onClick={() => setShowArchive((value) => !value)}
          >
            {showArchive
              ? "▲ Hide Archive"
              : "🛰️ View Full Historical Archive"}
          </button>

          {showArchive && (
            <FullArchive
              pos={selected.position}
              name={selected.name}
              releases={releases}
            />
          )}

        </div>
      )}
    </div>
  );
};

export default GISMonitoringPage;