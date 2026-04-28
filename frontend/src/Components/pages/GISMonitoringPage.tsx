import { useEffect, useMemo, useRef, useState } from "react";
import "./GISMonitoringPage.css";
import { apiGet } from "../../Services/apiClient";
import { Search } from "lucide-react";

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
  source?: "application" | "search";
};

type HistorySlot = {
  label: string;
  targetDate: Date;
  releaseNum: number;
  releaseDateLabel: string;
};

type LocationSuggestion = {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
};

type LocationSearchResponse = {
  success: boolean;
  data: LocationSuggestion[];
  message?: string;
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

  return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${
    lng - delta
  },${lat - delta},${lng + delta},${
    lat + delta
  }&bboxSR=4326&imageSR=4326&size=1000,620&format=jpg&f=image`;
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
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180 &&
  lat !== 0 &&
  lng !== 0;

const getCleanNumber = (value: string) => Number(value.trim());

const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-marker"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* ─────────────────────────────────
   Generate quarterly slots
   newest → oldest
───────────────────────────────── */

function generateQuarterlySlots(): { label: string; targetDate: Date }[] {
  const slots: { label: string; targetDate: Date }[] = [];
  const now = new Date();

  for (let i = 0; i <= 7; i++) {
    const d = new Date(now);

    d.setMonth(d.getMonth() - i * 3);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);

    const month = d.toLocaleString("default", { month: "short" });

    const label =
      i === 0
        ? `${month} ${d.getFullYear()} (Current)`
        : `${month} ${d.getFullYear()}`;

    slots.push({
      label,
      targetDate: new Date(d),
    });
  }

  return slots;
}

/* ─────────────────────────────────
   Fetch Wayback config & match
───────────────────────────────── */

type WaybackEntry = {
  releaseNum: number;
  date: Date;
  label: string;
};

async function fetchAndMatchReleases(
  slots: { label: string; targetDate: Date }[]
): Promise<HistorySlot[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Esri/wayback/master/src/data/wayback-config.json",
      { cache: "force-cache" }
    );

    if (!res.ok) {
      throw new Error("Wayback config fetch failed");
    }

    const raw: Record<string, { releaseDateLabel?: string }> =
      await res.json();

    const entries: WaybackEntry[] = Object.entries(raw)
      .map(([key, value]) => {
        const releaseNum = parseInt(key, 10);
        const label = value.releaseDateLabel ?? "";
        const date = new Date(label);

        return {
          releaseNum,
          date,
          label,
        };
      })
      .filter(
        (entry) =>
          !Number.isNaN(entry.releaseNum) &&
          !Number.isNaN(entry.date.getTime()) &&
          entry.date.getTime() > 0
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (entries.length === 0) {
      throw new Error("No Wayback entries found");
    }

    return slots.map((slot, index) => {
      if (index === 0) {
        const latest = entries[entries.length - 1];

        return {
          label: slot.label,
          targetDate: slot.targetDate,
          releaseNum: latest.releaseNum,
          releaseDateLabel: latest.label,
        };
      }

      const target = slot.targetDate.getTime();
      let best = entries[0];
      let bestDiff = Math.abs(entries[0].date.getTime() - target);

      for (const entry of entries) {
        if (entry.date.getTime() <= target) {
          const diff = Math.abs(entry.date.getTime() - target);

          if (diff < bestDiff) {
            best = entry;
            bestDiff = diff;
          }
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
    return slots.map((slot) => ({
      label: slot.label,
      targetDate: slot.targetDate,
      releaseNum: 0,
      releaseDateLabel: slot.label,
    }));
  }
}

/* ─────────────────────────────────
   Change status
───────────────────────────────── */

const getChangeStatus = (index: number, status: string) => {
  const currentStatus = status.toLowerCase();

  const hasIssue =
    currentStatus === "rejected" ||
    currentStatus === "violation" ||
    currentStatus === "unauthorized";

  if (index >= 6) {
    return hasIssue
      ? {
          label: "🚨 Unauthorized deviation — exceeds approved boundary",
          type: "violation" as const,
        }
      : {
          label: "✅ Construction matches approved plan",
          type: "clear" as const,
        };
  }

  if (index >= 3) {
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

  return {
    label: "✅ No construction — baseline clear",
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

const SmartTileLayer = ({ slot }: { slot: HistorySlot }) => {
  const [fallback, setFallback] = useState(false);
  const errorCount = useRef(0);

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

          if (errorCount.current >= 4 && !fallback) {
            setFallback(true);
          }
        },
        tileload: () => {
          errorCount.current = Math.max(0, errorCount.current - 1);
        },
      }}
    />
  );
};

/* ─────────────────────────────────
   Stage Card
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
    <div
      className={`gis-month-card gis-month-card--${change.type} ${
        isLatest ? "gis-month-card--latest" : ""
      }`}
    >
      <div className="gis-stage-header">
        <div>
          <h4>
            {slot.label}
            {isLatest && <span className="gis-badge-latest">Latest</span>}
          </h4>

          <span className="gis-stage-date">
            Wayback release:{" "}
            {slot.releaseNum === 0 ? "Current" : `#${slot.releaseNum}`}
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
              <strong>{slot.label}</strong>
              <br />
              Release: {slot.releaseNum || "Current"}
              <br />
              Lat: {pos[0].toFixed(6)}
              <br />
              Lng: {pos[1].toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-stage-zoom-badge">
          📡{" "}
          {slot.releaseNum === 0
            ? "Current Imagery"
            : `Wayback · ${slot.label}`}
        </div>
      </div>

      <div className={`gis-change-badge gis-change-badge--${change.type}`}>
        {change.label}
      </div>

      <div className="gis-release-info">
        {slot.releaseNum === 0 ? (
          "Current Esri imagery"
        ) : (
          <>
            <code>{slot.releaseDateLabel}</code> · Release #{slot.releaseNum}
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
  slots,
}: {
  pos: [number, number];
  name: string;
  slots: HistorySlot[];
}) => {
  const [selected, setSelected] = useState<HistorySlot | null>(
    slots[0] ?? null
  );

  useEffect(() => {
    if (slots.length > 0) {
      setSelected(slots[0]);
    }
  }, [slots]);

  if (!selected) {
    return null;
  }

  return (
    <div className="gis-wayback-viewer">
      <h3 className="gis-wayback-title">📡 Full Historical Archive — {name}</h3>

      <div className="gis-wayback-releases">
        {slots.map((slot, index) => (
          <button
            type="button"
            key={`${slot.label}-${index}`}
            className={`gis-release-btn ${
              selected.label === slot.label ? "active" : ""
            }`}
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
              <strong>{name}</strong>
              <br />
              {selected.label}
              <br />
              Release: {selected.releaseNum || "Current"}
              <br />
              Lat: {pos[0].toFixed(6)}
              <br />
              Lng: {pos[1].toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="gis-wayback-overlay-label">🛰️ {selected.label}</div>
      </div>

      <p className="gis-wayback-note">
        Showing the Esri Wayback imagery release closest to each 3-month
        interval. If historical tiles are not available for the selected
        location, the viewer automatically falls back to current Esri imagery.
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

  const [historySlots, setHistorySlots] = useState<HistorySlot[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchLat, setSearchLat] = useState("");
  const [searchLng, setSearchLng] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<Building[]>([]);
  const [manualSearched, setManualSearched] = useState(false);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  /* Fetch applications */
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

  /* Location name autocomplete */
  useEffect(() => {
    const query = searchName.trim();

    if (!query || query.length < 3 || searchLat.trim() || searchLng.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSuggestionLoading(true);

        const response = await apiGet<LocationSearchResponse>(
          `/api/location/search?q=${encodeURIComponent(query)}`
        );

        const data = response?.data || [];

        setSuggestions(data.slice(0, 6));
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchName, searchLat, searchLng]);

  /* Build quarterly slots when selected location changes */
  useEffect(() => {
    if (!selected) {
      return;
    }

    setHistorySlots([]);
    setShowArchive(false);
    setLoadingHist(true);

    const slots = generateQuarterlySlots();

    fetchAndMatchReleases(slots).then((matched) => {
      setHistorySlots(matched);
      setLoadingHist(false);
    });
  }, [selected]);

  const buildings: Building[] = useMemo(
    () =>
      applications.map((item, index) => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        const validPosition = isValid(lat, lng);

        const position: [number, number] = validPosition
          ? [lat, lng]
          : fallbackLocations[index % fallbackLocations.length];

        return {
          id: item.id,
          name: item.applicantName || item.name || `Application ${item.id}`,
          previewImage: getLatestLocationPreviewImage(position[0], position[1]),
          fallbackImage: fallbackImages[index % fallbackImages.length],
          status: item.status || "Pending",
          locationText: item.location,
          plotSize: item.plotSize,
          position,
          source: "application",
        };
      }),
    [applications]
  );

  const selectLocationSuggestion = (item: LocationSuggestion) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);

    if (!isValid(lat, lng)) {
      setSearchError("Selected location does not have valid coordinates.");
      return;
    }

    const result: Building = {
      id: item.place_id || Date.now(),
      name: item.display_name,
      previewImage: getLatestLocationPreviewImage(lat, lng),
      fallbackImage: mainImg,
      status: "Search Location",
      locationText: item.display_name,
      plotSize: item.type ? `Type: ${item.type}` : "Location search result",
      position: [lat, lng],
      source: "search",
    };

    setSearchName(item.display_name);
    setSearchLat("");
    setSearchLng("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError("");
    setManualSearched(true);
    setSearchResults([result]);
    setSelected(result);
  };

  const handleSearchByCoordinates = () => {
    const lat = getCleanNumber(searchLat);
    const lng = getCleanNumber(searchLng);

    if (!isValid(lat, lng)) {
      setSearchError(
        "Please enter valid latitude and longitude. Example: 17.3850, 78.4867"
      );
      return;
    }

    const displayName =
      searchName.trim() ||
      `Custom Location ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    const result: Building = {
      id: Date.now(),
      name: displayName,
      previewImage: getLatestLocationPreviewImage(lat, lng),
      fallbackImage: mainImg,
      status: "Search Location",
      locationText: displayName,
      plotSize: "Manual coordinate search",
      position: [lat, lng],
      source: "search",
    };

    setManualSearched(true);
    setSearchError("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchResults([result]);
    setSelected(result);
  };

  const handleSearchByName = async () => {
    const query = searchName.trim();

    if (!query) {
      setSearchError("Please enter a location name or enter latitude/longitude.");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const response = await apiGet<LocationSearchResponse>(
        `/api/location/search?q=${encodeURIComponent(query)}`
      );

      const firstSuggestion = response?.data?.[0];

      if (!firstSuggestion) {
        setSearchResults([]);
        setSearchError("No location found for this search.");
        return;
      }

      selectLocationSuggestion(firstSuggestion);
    } catch {
      setSearchResults([]);
      setSearchError(
        "Location search failed. Please check backend /api/location/search route."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async () => {
    const hasCoordinates = searchLat.trim() && searchLng.trim();

    if (hasCoordinates) {
      handleSearchByCoordinates();
      return;
    }

    if (suggestions.length > 0) {
      selectLocationSuggestion(suggestions[0]);
      return;
    }

    await handleSearchByName();
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchLat("");
    setSearchLng("");
    setSearchError("");
    setSearchResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setManualSearched(false);
    setSelected(null);
  };

  const handleBackToApplications = () => {
    setSelected(null);
    setShowArchive(false);
  };

  return (
    <div className="gis-page">
      <div className="gis-page-header">
        <div>
          <h1 className="gis-title">GIS & Satellite Monitoring</h1>
          <p className="gis-page-subtitle">
            Search any location by name or coordinates and view satellite
            history every 3 months.
          </p>
        </div>
      </div>

      {/* Search Panel */}
      <div className="gis-search-panel">
        <div className="gis-search-head">
          <div>
            <h2>Search Satellite Location</h2>
            <p>
              Enter a location name, or provide exact latitude and longitude to
              inspect historical imagery.
            </p>
          </div>
        </div>

        <div className="gis-search-grid">
          <div className="gis-field gis-field-wide gis-location-field">
            <label>Location Name</label>

            <div className="gis-input-wrap">
              <input
                type="text"
                value={searchName}
                placeholder="Example: Vijayawada, Amaravati, Hyderabad..."
                onChange={(event) => {
                  setSearchName(event.target.value);
                  setSearchError("");
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }

                  if (event.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
              />

              {suggestionLoading && (
                <span className="gis-suggestion-loader">Searching...</span>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="gis-suggestions-dropdown">
                  {suggestions.map((item, index) => (
                    <button
                      type="button"
                      key={`${item.place_id || item.display_name}-${index}`}
                      className="gis-suggestion-item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectLocationSuggestion(item)}
                    >
                      <span>{item.display_name}</span>

                      <small>
                        {Number(item.lat).toFixed(6)},{" "}
                        {Number(item.lon).toFixed(6)}
                        {item.type ? ` · ${item.type}` : ""}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="gis-field">
            <label>Latitude</label>

            <input
              type="number"
              value={searchLat}
              placeholder="17.3850"
              onChange={(event) => {
                setSearchLat(event.target.value);
                setShowSuggestions(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div className="gis-field">
            <label>Longitude</label>

            <input
              type="number"
              value={searchLng}
              placeholder="78.4867"
              onChange={(event) => {
                setSearchLng(event.target.value);
                setShowSuggestions(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <button
            type="button"
            className="gis-search-icon-btn"
            onClick={handleSearch}
            disabled={searchLoading}
            aria-label="Search satellite history"
            title="Search satellite history"
          >
            <Search size={18} strokeWidth={3} />
          </button>
        </div>

        {searchError && <div className="gis-search-error">{searchError}</div>}

        {manualSearched && searchResults.length === 1 && !selected && (
          <div className="gis-selected-search-result">
            <button
              type="button"
              className="gis-result-item gis-result-item-selected"
              onClick={() => setSelected(searchResults[0])}
            >
              <span>{searchResults[0].name}</span>

              <small>
                {searchResults[0].position[0].toFixed(6)},{" "}
                {searchResults[0].position[1].toFixed(6)}
              </small>
            </button>
          </div>
        )}
      </div>

      {loading && <p className="gis-loading">Loading applications...</p>}

      {!loading &&
        !selected &&
        buildings.length === 0 &&
        searchResults.length === 0 && (
          <div className="gis-empty">
            No applications found. Submit applications with latitude/longitude
            or search any location above to enable satellite monitoring.
          </div>
        )}

      {/* Building Grid */}
      {!selected && buildings.length > 0 && (
        <>
          <div className="gis-section-label gis-section-label-main">
            🏢 Application Locations
            <span className="gis-section-sub">
              Click any card to view 3-month satellite history
            </span>
          </div>

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
        </>
      )}

      {/* Detail View */}
      {selected && (
        <div className="gis-detail">
          <div className="gis-detail-actions">
            {selected.source === "search" ? (
              <button
                type="button"
                className="gis-clear-search-btn"
                onClick={handleClearSearch}
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                className="gis-back"
                onClick={handleBackToApplications}
              >
                ⬅ Back
              </button>
            )}
          </div>

          <div className="gis-detail-header-card">
            <div>
              <span className="gis-detail-kicker">
                {selected.source === "search"
                  ? "Searched Location"
                  : "Application Location"}
              </span>

              <h2>{selected.name}</h2>

              <div className="gis-meta-row">
                <span>Status: {selected.status}</span>

                {selected.locationText && (
                  <span>📍 {selected.locationText}</span>
                )}

                {selected.plotSize && <span>📐 {selected.plotSize}</span>}

                <span>
                  🌐 {selected.position[0].toFixed(6)},{" "}
                  {selected.position[1].toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          <div className="gis-section-label">
            📅 Satellite History — Every 3 Months
            <span className="gis-section-sub">
              Latest 4 quarterly snapshots shown below
            </span>
          </div>

          {loadingHist && (
            <p className="gis-loading">
              🛰️ Matching historical satellite releases…
            </p>
          )}

          {!loadingHist && historySlots.length > 0 && (
            <div className="gis-timeline">
              {historySlots.slice(0, 4).map((slot, index) => (
                <StageCard
                  key={`${slot.label}-${index}`}
                  slot={slot}
                  pos={selected.position}
                  status={selected.status}
                  index={index}
                  isLatest={index === 0}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="gis-archive-btn"
            onClick={() => setShowArchive((value) => !value)}
          >
            {showArchive
              ? "▲ Hide Archive"
              : "🛰️ View Full Historical Archive"}
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