import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export type MapApplication = {
  id: number;
  name?: string;
  applicantName?: string;
  status: "Approved" | "Rejected" | "Pending" | "Violation" | string;
  lat?: number;
  lng?: number;
  latitude?: number | null;
  longitude?: number | null;
  location?: string;
  plotSize?: string;
};

type MapViewProps = {
  data?: MapApplication[];
  onAdd: (app: MapApplication) => void;
};

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const getMarkerIcon = (status: string) => {
  if (status === "Approved") return greenIcon;
  if (status === "Rejected" || status === "Violation") return redIcon;
  return yellowIcon;
};

const getLat = (app: MapApplication) => {
  return typeof app.lat === "number" ? app.lat : app.latitude;
};

const getLng = (app: MapApplication) => {
  return typeof app.lng === "number" ? app.lng : app.longitude;
};

const isValidCoordinate = (lat: unknown, lng: unknown) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
};

const MapClickHandler: React.FC<{
  onAdd: (app: MapApplication) => void;
}> = ({ onAdd }) => {
  useMapEvents({
    click(event) {
      const name = window.prompt("Enter owner name");

      const newApp: MapApplication = {
        id: Date.now(),
        name: name?.trim() || "Unknown",
        applicantName: name?.trim() || "Unknown",
        status: "Pending",
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      };

      onAdd(newApp);
    },
  });

  return null;
};

const MapView: React.FC<MapViewProps> = ({ data = [], onAdd }) => {
  const validApplications = data.filter((app) => {
    const lat = getLat(app);
    const lng = getLng(app);

    return isValidCoordinate(lat, lng);
  });

  return (
    <MapContainer
      {...({
        center: [17.385, 78.4867],
        zoom: 13,
        style: { height: "300px", width: "100%", borderRadius: "12px" },
      } as any)}
    >
      <TileLayer
        {...({
          attribution: "&copy; OpenStreetMap contributors",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as any)}
      />

      <MapClickHandler onAdd={onAdd} />

      {validApplications.map((app) => {
        const lat = getLat(app) as number;
        const lng = getLng(app) as number;

        return (
          <Marker
            key={app.id}
            position={[lat, lng]}
            icon={getMarkerIcon(app.status)}
          >
            <Popup>
              <div style={{ minWidth: "160px" }}>
                <strong>{app.applicantName || app.name || "Unknown"}</strong>
                <br />
                Status: {app.status}
                <br />
                {app.location && <>Location: {app.location}</>}
                {app.location && <br />}
                {app.plotSize && <>Plot Size: {app.plotSize}</>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;