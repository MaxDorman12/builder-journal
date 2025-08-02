import React, { useState, useEffect } from 'react';
import { MapPin as MapPinType } from '@shared/api';

interface ScotlandMapWrapperProps {
  pins: MapPinType[];
  onMapClick?: (lat: number, lng: number) => void;
  onPinClick?: (pin: MapPinType) => void;
  className?: string;
}

export function ScotlandMapWrapper(props: ScotlandMapWrapperProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import the map component only on the client side
    const loadMap = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          return;
        }

        const { ScotlandMap } = await import('./ScotlandMap');
        setMapComponent(() => ScotlandMap);
        setError(null);
      } catch (err) {
        console.error('Failed to load map component:', err);
        setError('Failed to load map. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${props.className || 'h-96'}`}>
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Scotland map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${props.className || 'h-96'}`}>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${props.className || 'h-96'}`}>
        <div className="text-center p-6">
          <div className="text-4xl mb-2">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Scotland!</h3>
          <p className="text-gray-600 text-sm">
            Interactive map will load here
          </p>
        </div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}
