import { useEffect, useState } from "react";
import { Landmark } from "@/types";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface ItineraryMapProps {
  landmarks: Landmark[];
  selectedLandmarks: Landmark[];
  markerColor?: "blue" | "green";
}

export function ItineraryMap({ landmarks, selectedLandmarks, markerColor = "blue" }: ItineraryMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Import Leaflet CSS and library
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      
      // Fix for default marker icons in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isMounted || !L) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Cebu City center coordinates
  const center: [number, number] = [10.3157, 123.8854];

  // Create custom icons
  const defaultIcon = L && new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Create numbered DivIcon for selected landmarks
  const createNumberedIcon = (number: number) => {
    return L && new L.DivIcon({
      className: 'custom-numbered-marker',
      html: `<div class="numbered-marker" style="background:${markerColor === 'green' ? '#16a34a' : '#3b82f6'}">${number}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  // Create route polyline coordinates
  const routeCoordinates = selectedLandmarks.map((landmark) => [
    landmark.location.lat,
    landmark.location.lng,
  ]) as [number, number][];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Display all landmark markers */}
        {landmarks.map((landmark) => {
          const isSelected = selectedLandmarks.some((l) => l.id === landmark.id);
          const selectedIndex = selectedLandmarks.findIndex((l) => l.id === landmark.id);
          
          return (
            <Marker
              key={landmark.id}
              position={[landmark.location.lat, landmark.location.lng]}
              icon={isSelected ? createNumberedIcon(selectedIndex + 1) : defaultIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">{landmark.name}</h3>
                  {isSelected && (
                    <p className="text-xs text-green-600 font-semibold mb-1">
                      Stop #{selectedIndex + 1}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mb-2">{landmark.description}</p>
                  <img
                    src={landmark.image}
                    alt={landmark.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ~{landmark.estimatedDuration} minutes visit
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Draw route between selected landmarks */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}

