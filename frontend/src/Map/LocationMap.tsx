import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationMapProps = {
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
};

const MapMover = ({
  setPosition,
}: {
  setPosition: (position: LatLngExpression) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ lat: number; lon: number }>;
      const { lat, lon } = customEvent.detail;

      map.setView([lat, lon], 13);
      setPosition([lat, lon]);
    };

    window.addEventListener("moveMap", handler);

    return () => {
      window.removeEventListener("moveMap", handler);
    };
  }, [map, setPosition]);

  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({
  setLatitude,
  setLongitude,
}) => {
  const [position, setPosition] = useState<LatLngExpression>([17.385, 78.4867]);

  const MapClickHandler = () => {
    useMapEvents({
      click(event) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        setPosition([lat, lng]);
        setLatitude(lat.toString());
        setLongitude(lng.toString());
      },
    });

    return null;
  };

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

      <MapMover setPosition={setPosition} />
      <MapClickHandler />

      <Marker
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target;
            const latlng = marker.getLatLng();

            setPosition([latlng.lat, latlng.lng]);
            setLatitude(latlng.lat.toString());
            setLongitude(latlng.lng.toString());
          },
        }}
      >
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default LocationMap;