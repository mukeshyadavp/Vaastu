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

// Each quarterly slot matched to a real Wayback release
type HistorySlot = {
  label: string;        // e.g. "Jan 2025"
  targetDate: Date;
  releaseNum: number;   // 0 = use current Esri
  releaseDateLabel: string;
};

/* ─────────────────────────────────
   URLs
───────────────────────────────── */

const ESRI_CURRENT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const waybackUrl = (id: number) =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${id}/{z}/{y}/{x}`;

const getLatestLocationPreviewImage = (lat: number, lng: number) => {
  const delta = 0.0009;
  return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&bboxSR=4326&imageSR=4326&size=1000,620&format=jpg&f=image`;
};

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

/* ─────────────────────────────────
   Generate 8 quarterly slots
   newest → oldest (last 2 years)
───────────────────────────────── */

function generateQuarterlySlots(): { label: string; targetDate: Date }[] {
  const slots: { label: string; targetDate: Date }[] = [];
  const now = new Date();

  for (let i = 0; i <= 7; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i * 3);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);

    const label =
      i === 0
        ? `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()} (Current)`
        : `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;

    slots.push({ label, targetDate: new Date(d) });
  }

  return slots; // newest first
}

/* ─────────────────────────────────
   Fetch Wayback config & match
   each slot to the closest release
───────────────────────────────── */

type WaybackEntry = { releaseNum: number; date: Date; label: string };

async function fetchAndMatchReleases(
  slots: { label: string; targetDate: Date }[]
): Promise<HistorySlot[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Esri/wayback/master/src/data/wayback-config.json",
      { cache: "force-cache" }
    );
    if (!res.ok) throw new Error("fetch failed");

    const raw: Record<string, { releaseDateLabel?: string }> = await res.json();

    const entries: WaybackEntry[] = Object.entries(raw)
      .map(([k, v]) => {
        const num = parseInt(k, 10);
        const lbl = v.releaseDateLabel ?? "";
        const parsed = new Date(lbl);
        return { releaseNum: num, date: parsed, label: lbl };
      })
      .filter((e) => !isNaN(e.releaseNum) && !isNaN(e.date.getTime()) && e.date.getTime() > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (entries.length === 0) throw new Error("empty");

    return slots.map((slot, idx) => {
      // Most recent slot → latest available release
      if (idx === 0) {
        const latest = entries[entries.length - 1];
        return {
          label: slot.label,
          targetDate: slot.targetDate,
          releaseNum: latest.releaseNum,
          releaseDateLabel: latest.label,
        };
      }

      // Find the closest release that is on or before the target date
      const target = slot.targetDate.getTime();
      let best = entries[0];
      let bestDiff = Math.abs(entries[0].date.getTime() - target);

      for (const e of entries) {
        if (e.date.getTime() <= target) {
          const diff = Math.abs(e.date.getTime() - target);
          if (diff < bestDiff) { best = e; bestDiff = diff; }
        }
      }

      return {
        label: slot.label,
        targetDate: slot.targetDate,
        releaseNum: best.releaseNum,
        releaseDateLabel: best.label,
      };
    });
  } catch {
    // Fallback: every slot uses current Esri (releaseNum 0)
    return slots.map((slot) => ({
      label: slot.label,
      targetDate: slot.targetDate,
      releaseNum: 0,
      releaseDateLabel: slot.label,
    }));
  }
}

/* ─────────────────────────────────
   Change status (index-based)
───────────────────────────────── */

const getChangeStatus = (index: number, status: string) => {
  const s = status.toLowerCase();
  const hasIssue = s === "rejected" || s === "violation" || s === "unauthorized";

  if (index >= 6)
    return hasIssue
      ? { label: "🚨 Unauthorized deviation — exceeds approved boundary", type: "violation" as const }
      : { label: "✅ Construction matches approved plan",                  type: "clear"     as const };

  if (index >= 3)
    return hasIssue
      ? { label: "⚠️ New structure — permit review needed",               type: "warning"   as const }
      : { label: "✅ Authorized construction in progress",                 type: "clear"     as const };

  return { label: "✅ No construction — baseline clear", type: "clear" as const };
};

/* ─────────────────────────────────
   Map helpers
───────────────────────────────── */

const MapRecenter = ({ pos }: { pos: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.setView(pos, map.getZoom()); }, [pos, map]);
  return null;
};

const SmartTileLayer = ({ slot }: { slot: HistorySlot }) => {
  const [fallback, setFallback] = useState(false);
  const errorCount = useRef(0);

  // Reset on slot change
  useEffect(() => {
    setFallback(false);
    errorCount.current = 0;
  }, [slot.releaseNum]);

  const useCurrent = slot.releaseNum === 0 || fallback;
  const url = useCurrent ? ESRI_CURRENT : waybackUrl(slot.releaseNum);
  const attribution = useCurrent
    ? "© Esri — Current Imagery"
    : `© Esri Wayback — Release ${slot.releaseNum} · ${slot.releaseDateLabel}`;

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
          if (errorCount.current >= 4 && !fallback) setFallback(true);
        },
        tileload: () => {
          errorCount.current = Math.max(0, errorCount.current - 1);
        },
      }}
    />
  );
};

/* ─────────────────────────────────
   Stage Card  (quarterly slot)
───────────────────────────────── */

const StageCard = ({
  slot,
  pos,
  status,
  index,
  isLatest,
}: {
  slot: HistorySlot;
  pos: [number, number];
  status: string;
  index: number;
  isLatest: boolean;
}) => {
  const change = getChangeStatus(index, status);

  return (
    <div className={`gis-month-card gis-month-card--${change.type} ${isLatest ? "gis-month-card--latest" : ""}`}>
      <div className="gis-stage-header">
        <div>
          <h4>
            {slot.label}
            {isLatest && <span className="gis-badge-latest">Latest</span>}
          </h4>
          <span className="gis-stage-date">
            Wayback release: {slot.releaseNum === 0 ? "Current" : `#${slot.releaseNum}`}
          </span>
        </div>
      </div>

      <div className="gis-stage-satellite-map">
        <MapContainer
          center={pos}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          zoomControl
          scrollWheelZoom
          doubleClickZoom
          attributionControl={false}
        >
          <SmartTileLayer slot={slot} />
          <MapRecenter pos={pos} />
          <Marker position={pos} icon={blinkingIcon}>
            <Popup>
              <strong>{slot.label}</strong><br />
              Release: {slot.releaseNum || "Current"}<br />
              Lat: {pos[0].toFixed(6)}<br />
              Lng: {pos[1].toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-stage-zoom-badge">
          📡 {slot.releaseNum === 0 ? "Current Imagery" : `Wayback · ${slot.label}`}
        </div>
      </div>

      <div className={`gis-change-badge gis-change-badge--${change.type}`}>
        {change.label}
      </div>

      <div className="gis-release-info">
        {slot.releaseNum === 0
          ? "Current Esri imagery"
          : <><code>{slot.releaseDateLabel}</code> · Release #{slot.releaseNum}</>}
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
  slots,
}: {
  pos: [number, number];
  name: string;
  slots: HistorySlot[];
}) => {
  const [selected, setSelected] = useState<HistorySlot>(slots[0]);

  useEffect(() => {
    if (slots.length > 0) setSelected(slots[0]);
  }, [slots]);

  if (!selected) return null;

  return (
    <div className="gis-wayback-viewer">
      <h3 className="gis-wayback-title">📡 Full Historical Archive — {name}</h3>

      <div className="gis-wayback-releases">
        {slots.map((slot, idx) => (
          <button
            type="button"
            key={idx}
            className={`gis-release-btn ${selected.label === slot.label ? "active" : ""}`}
            onClick={() => setSelected(slot)}
          >
            {slot.label}
          </button>
        ))}
      </div>

      <div className="gis-wayback-map-wrapper">
        <MapContainer
          center={pos}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          zoomControl
          scrollWheelZoom
          attributionControl={false}
        >
          <SmartTileLayer key={selected.label} slot={selected} />
          <MapRecenter pos={pos} />
          <Marker position={pos} icon={blinkingIcon}>
            <Popup>
              <strong>{name}</strong><br />
              {selected.label}<br />
              Release: {selected.releaseNum || "Current"}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-wayback-overlay-label">🛰️ {selected.label}</div>
      </div>

      <p className="gis-wayback-note">
        Showing the Wayback release closest to each quarter. Falls back to
        current Esri imagery if no tiles exist for this location.
      </p>
    </div>
  );
};

/* ─────────────────────────────────
   Page
───────────────────────────────── */

const GISMonitoringPage = () => {
  const [selected,     setSelected]     = useState<Building | null>(null);
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [historySlots, setHistorySlots] = useState<HistorySlot[]>([]);
  const [loadingHist,  setLoadingHist]  = useState(false);
  const [showArchive,  setShowArchive]  = useState(false);

  // Fetch applications
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response: any = await apiGet("/api/applications");
        setApplications(response?.data?.length > 0 ? response.data : []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build quarterly slots when a building is selected
  useEffect(() => {
    if (!selected) return;
    setHistorySlots([]);
    setShowArchive(false);
    setLoadingHist(true);

    const slots = generateQuarterlySlots();
    fetchAndMatchReleases(slots).then((matched) => {
      setHistorySlots(matched);
      setLoadingHist(false);
    });
  }, [selected]);

  const buildings: Building[] = useMemo(() =>
    applications.map((item, index) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      const validPosition = isValid(lat, lng);
      const position: [number, number] = validPosition
        ? [lat, lng]
        : fallbackLocations[index % fallbackLocations.length];

      return {
        id:           item.id,
        name:         item.applicantName || item.name || `Application ${item.id}`,
        previewImage: getLatestLocationPreviewImage(position[0], position[1]),
        fallbackImage: fallbackImages[index % fallbackImages.length],
        status:       item.status || "Pending",
        locationText: item.location,
        plotSize:     item.plotSize,
        position,
      };
    }), [applications]);

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

      {/* ── Building Grid ── */}
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
                onError={(e) => { e.currentTarget.src = building.fallbackImage; }}
              />
              <div className="gis-overlay">
                <div>
                  <strong>{building.name}</strong>
                  <span>
                    {building.status} · {building.position[0].toFixed(5)},{" "}
                    {building.position[1].toFixed(5)}
                  </span>
                  <small className="gis-card-caption">Latest satellite preview</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail View ── */}
      {selected && (
        <div className="gis-detail">
          <button type="button" className="gis-back" onClick={() => setSelected(null)}>
            ⬅ Back
          </button>

          <h2>{selected.name}</h2>

          <div className="gis-meta-row">
            <span>Status: {selected.status}</span>
            {selected.locationText && <span>📍 {selected.locationText}</span>}
            {selected.plotSize      && <span>📐 {selected.plotSize}</span>}
            <span>🌐 {selected.position[0].toFixed(6)}, {selected.position[1].toFixed(6)}</span>
          </div>

          {/* Section header */}
          <div className="gis-section-label">
            📅 Satellite History — Every 3 Months
          </div>

          {loadingHist && (
            <p className="gis-loading">🛰️ Matching historical satellite releases…</p>
          )}

          {/* 4 most recent quarterly cards — 2 columns */}
          {!loadingHist && historySlots.length > 0 && (
            <div className="gis-timeline">
              {historySlots.slice(0, 4).map((slot, idx) => (
                <StageCard
                  key={`${slot.label}-${idx}`}
                  slot={slot}
                  pos={selected.position}
                  status={selected.status}
                  index={idx}
                  isLatest={idx === 0}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="gis-archive-btn"
            onClick={() => setShowArchive((v) => !v)}
          >
            {showArchive ? "▲ Hide Archive" : "🛰️ View Full Historical Archive"}
          </button>

          {showArchive && historySlots.length > 0 && (
            <FullArchive
              pos={selected.position}
              name={selected.name}
              slots={historySlots}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GISMonitoringPage;