import { useEffect, useState } from "react";

let MapContainer: any, TileLayer: any, Marker: any, Popup: any;

const MapComponent = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      MapContainer = mod.MapContainer;
      TileLayer = mod.TileLayer;
      Marker = mod.Marker;
      Popup = mod.Popup;
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <div>Loading map...</div>;

  const position: [number, number] = [17.385, 78.4867];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent; // ✅ REQUIRED