import React, { useEffect, useRef, useState } from 'react';
import { MapPin as MapPinType } from '@shared/api';

interface SimpleScotlandMapProps {
  pins: MapPinType[];
  onMapClick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPinType) => void;
  className?: string;
}

export function SimpleScotlandMap({ pins, onMapClick, onPinClick, className = '' }: SimpleScotlandMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const initializeMap = async () => {
    if (!mapRef.current || mapInstance) return;

    try {
      setIsLoading(true);
      console.log('🗺️ Attempting to load Leaflet...');

      // Try to load Leaflet JavaScript module with timeout
      const loadPromise = import('leaflet');

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Leaflet import timeout after 10 seconds')), 10000)
      );

      const leafletModule = await Promise.race([loadPromise, timeoutPromise]) as any;
      const L = leafletModule.default || leafletModule;

      if (!L || !L.map) {
        throw new Error('Leaflet module loaded but missing required functions');
      }

      console.log('✅ Leaflet loaded successfully');

      // Fix marker icons
      if (L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: [56.8, -4.2],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Set Scotland bounds
      const scotlandBounds = [[54.6, -8.0], [60.9, -1.5]];
      map.fitBounds(scotlandBounds);

      // Add click handler
      if (onMapClick) {
        map.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      setMapInstance(map);
      setIsLoading(false);
      console.log('🎉 Map initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
      setIsLoading(false);
      setLoadAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const addMarkers = async () => {
      try {
        const leafletModule = await import('leaflet');
        const L = leafletModule.default || leafletModule;

        // Clear existing markers
        markers.forEach(marker => {
          try {
            mapInstance.removeLayer(marker);
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        });

        // Add new markers
        const newMarkers = pins.map(pin => {
          const marker = L.marker([pin.latitude, pin.longitude])
            .addTo(mapInstance)
            .bindPopup(`
              <div style="min-width: 150px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pin.title}</h3>
                ${pin.description ? `<p style="margin: 0 0 8px 0; font-size: 14px;">${pin.description}</p>` : ''}
                <div style="font-size: 12px; color: #666;">
                  📍 ${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}
                </div>
              </div>
            `);

          if (onPinClick) {
            marker.on('click', () => onPinClick(pin));
          }

          return marker;
        });

        setMarkers(newMarkers);
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    addMarkers();
  }, [pins, mapInstance, onPinClick]);

  const handleRetry = () => {
    setLoadAttempts(0);
    setMapInstance(null);
    setMarkers([]);
    initializeMap();
  };

  if (loadAttempts > 2) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full rounded-lg shadow-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center border-2 border-dashed border-blue-200" style={{ minHeight: '400px' }}>
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">Scotland Adventure Map</h3>
            <p className="text-gray-600 mb-4">Interactive map temporarily unavailable</p>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-700 mb-3">
                You can still add pins by entering coordinates manually:
              </p>
              <button 
                onClick={() => onMapClick && onMapClick(56.8, -4.2)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Add Pin at Scotland Center
              </button>
            </div>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Try Loading Map Again
            </button>
          </div>
        </div>
        {pins.length > 0 && (
          <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-600">{pins.length} pins saved</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Scotland map...</p>
            <p className="text-xs text-gray-500 mt-2">Attempt {loadAttempts + 1}</p>
          </div>
        </div>
      )}
      {pins.length === 0 && mapInstance && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg pointer-events-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
              <h3 className="font-semibold text-gray-700 mb-1">Welcome to Scotland!</h3>
              <p className="text-sm text-gray-600">
                Click anywhere on the map to add your first pin
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
