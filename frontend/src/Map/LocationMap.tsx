import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationMap.css";

type LocationMapProps = {
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
};

const DEFAULT_POSITION: LatLngExpression = [17.385, 78.4867];

const MapMover = ({
  setPosition,
  setLatitude,
  setLongitude,
}: {
  setPosition: (position: LatLngExpression) => void;
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ lat: number; lon: number }>;
      const { lat, lon } = customEvent.detail;

      map.setView([lat, lon], 15);
      setPosition([lat, lon]);
      setLatitude(lat.toString());
      setLongitude(lon.toString());
    };

    window.addEventListener("moveMap", handler);

    return () => {
      window.removeEventListener("moveMap", handler);
    };
  }, [map, setPosition, setLatitude, setLongitude]);

  return null;
};

const CurrentLocationButton = ({
  setPosition,
  setLatitude,
  setLongitude,
}: {
  setPosition: (position: LatLngExpression) => void;
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
}) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Current location is not supported in this browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const lat = geoPosition.coords.latitude;
        const lng = geoPosition.coords.longitude;
        const newPosition: LatLngExpression = [lat, lng];

        setPosition(newPosition);
        setLatitude(lat.toString());
        setLongitude(lng.toString());

        map.setView(newPosition, 16);
        setLocating(false);
      },
      (error) => {
        setLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert("Location permission denied. Please allow location access.");
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Current location is unavailable.");
          return;
        }

        if (error.code === error.TIMEOUT) {
          alert("Location request timed out.");
          return;
        }

        alert("Unable to get current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <button
      type="button"
      className="current-location-btn"
      onClick={handleCurrentLocation}
      disabled={locating}
    >
      {locating ? "Locating..." : "📍 Use Current Location"}
    </button>
  );
};

const MapClickHandler = ({
  setPosition,
  setLatitude,
  setLongitude,
}: {
  setPosition: (position: LatLngExpression) => void;
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
}) => {
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

const LocationMap: React.FC<LocationMapProps> = ({
  setLatitude,
  setLongitude,
}) => {
  const [position, setPosition] =
    useState<LatLngExpression>(DEFAULT_POSITION);

  return (
    <div className="location-map-wrapper">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapMover
          setPosition={setPosition}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />

        <CurrentLocationButton
          setPosition={setPosition}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />

        <MapClickHandler
          setPosition={setPosition}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />

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
    </div>
  );
};

export default LocationMap;