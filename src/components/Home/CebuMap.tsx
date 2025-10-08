
import { useEffect, useRef } from "react";
import { cebuHotspots } from "@/lib/mockData";

export function CebuMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = () => {
      const google = (window as any).google;
      if (!google) return;

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 10.3157, lng: 123.8854 },
        zoom: 10,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#3b82f6" }]
          }
        ]
      });

      cebuHotspots.forEach((spot) => {
        new google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8
          }
        });
      });
    };

    if ((window as any).google) {
      loadMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", loadMap);
      document.head.appendChild(script);
    }
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Cebu's Top Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From pristine beaches to historic landmarks, discover the places that make Cebu special
          </p>
        </div>

        <div ref={mapRef} className="w-full h-96 md:h-[500px] rounded-lg shadow-xl"></div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cebuHotspots.map((spot, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">{spot.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
