import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";

type App = {
  id: number;
  status: string;
  lat: number;
  lng: number;
};

const MapView = ({
  data,
  onAdd,
}: {
  data: App[];
  onAdd: (app: App) => void;
}) => {

  // ✅ icons OUTSIDE map loop
  const greenIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const redIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const yellowIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
const MapClickHandler = ({ onAdd }: any) => {
  useMapEvents({
    click(e) {
    const name = prompt("Enter owner name");

const newApp = {
  id: Date.now(),
  name: name || "Unknown",
  status: "Pending",
  lat: e.latlng.lat,
  lng: e.latlng.lng,
};
      onAdd(newApp);
    },
  });

  return null;
};
  return (
    <MapContainer
      center={[17.385, 78.4867]}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onAdd={onAdd} />

      {/* ✅ CORRECT MAP LOOP */}
      {data.map((app) => (
        <Marker
          key={app.id}
          position={[app.lat, app.lng]}
          icon={
            app.status === "Approved"
              ? greenIcon
              : app.status === "Violation"
              ? redIcon
              : yellowIcon
          }
        >
          <Popup>{app.status}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;