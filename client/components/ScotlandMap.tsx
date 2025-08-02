import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin as MapPinType } from '@shared/api';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ScotlandMapProps {
  pins: MapPinType[];
  onMapClick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPinType) => void;
  className?: string;
}

export function ScotlandMap({ pins, onMapClick, onPinClick, className = '' }: ScotlandMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Scotland
    const map = L.map(mapRef.current).setView([56.8, -4.2], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Set bounds to Scotland
    const scotlandBounds = L.latLngBounds(
      [54.6, -8.0], // Southwest corner
      [60.9, -1.5]  // Northeast corner
    );
    map.fitBounds(scotlandBounds);

    // Handle map clicks
    if (onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    pins.forEach(pin => {
      if (mapInstanceRef.current) {
        // Create custom icon for family journal pins
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: #ef4444; 
              border: 3px solid white; 
              border-radius: 50%; 
              width: 24px; 
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 12px;
            ">
              📍
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon })
          .addTo(mapInstanceRef.current);

        // Add popup with pin details
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${pin.title}</h3>
            ${pin.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${pin.description}</p>` : ''}
            <div style="font-size: 12px; color: #9ca3af;">
              📍 ${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}
            </div>
            ${pin.images && pin.images.length > 0 ? `
              <div style="margin-top: 8px;">
                <img src="${pin.images[0]}" alt="${pin.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        // Handle pin clicks
        if (onPinClick) {
          marker.on('click', () => {
            onPinClick(pin);
          });
        }

        markersRef.current.push(marker);
      }
    });
  }, [pins, onPinClick]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
      {pins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Scotland!</h3>
            <p className="text-gray-600 text-sm">
              Click anywhere on the map to add your first adventure pin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
