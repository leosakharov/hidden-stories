import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Custom hooks
import { useGeolocation } from '../../../hooks/useGeolocation';

// Utils
import { getAddressFromCoordinates } from '../../../utils/geocoding';

// Constants
import { 
  MAP_CONTAINER_STYLE, 
  DEFAULT_CENTER, 
  DARK_MAP_STYLES 
} from '../../../constants/mapStyles';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

/**
 * Map component that allows users to select a location
 */
const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  
  // Use custom geolocation hook
  const { 
    position: currentLocation, 
    error: locationError, 
    isLocating, 
    getCurrentLocation 
  } = useGeolocation({
    autoLocateOnMount: true
  });
  
  // Initialize Google Maps with API key from environment variables
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Get address when current location changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (currentLocation) {
        const address = await getAddressFromCoordinates(
          currentLocation.lat, 
          currentLocation.lng
        );
        setSelectedAddress(address);
      }
    };
    
    fetchAddress();
  }, [currentLocation]);

  // Handle map click
  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setSelectedPosition(newPosition);
      
      // Get address from coordinates
      const address = await getAddressFromCoordinates(newPosition.lat, newPosition.lng);
      setSelectedAddress(address);
      onLocationSelect(newPosition.lat, newPosition.lng, address || undefined);
    }
  }, [onLocationSelect]);

  // Handle current location button click
  const handleGetCurrentLocation = useCallback(() => {
    getCurrentLocation();
    
    // We don't call onLocationSelect here anymore
    // Instead, we'll use an effect to watch for currentLocation changes
  }, [getCurrentLocation]);
  
  // Use a ref to track if we've already called onLocationSelect for the current location
  const hasCalledSelectRef = React.useRef(false);
  
  // Call onLocationSelect when currentLocation changes and there's no selected position
  useEffect(() => {
    // Only proceed if we have a location, no selected position, not currently locating,
    // and haven't already called onLocationSelect for this location
    if (currentLocation && !selectedPosition && !isLocating && !hasCalledSelectRef.current) {
      // Mark that we've called onLocationSelect for this location
      hasCalledSelectRef.current = true;
      
      onLocationSelect(
        currentLocation.lat, 
        currentLocation.lng, 
        selectedAddress || undefined
      );
    }
  }, [currentLocation, isLocating, onLocationSelect, selectedAddress, selectedPosition]);
  
  // Reset the ref when selectedPosition changes
  useEffect(() => {
    if (selectedPosition) {
      hasCalledSelectRef.current = false;
    }
  }, [selectedPosition]);

  return isLoaded ? (
    <div className="w-full overflow-hidden">
      <div className="relative">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={selectedPosition || currentLocation || DEFAULT_CENTER}
          zoom={10}
          onClick={onMapClick}
          options={{
            styles: DARK_MAP_STYLES
          }}
        >
          {selectedPosition && (
            <Marker 
              position={selectedPosition}
              label={{
                text: "S",
                color: "#000000",
                fontFamily: "monospace",
                fontSize: "10px"
              }}
            />
          )}
          {currentLocation && !selectedPosition && (
            <Marker 
              position={currentLocation}
              label={{
                text: "C",
                color: "#000000",
                fontFamily: "monospace",
                fontSize: "10px"
              }}
            />
          )}
        </GoogleMap>
        <button 
          onClick={handleGetCurrentLocation}
          className="absolute top-4 right-4 bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-700 focus:outline-none transition-colors"
          title="Use my current location"
          disabled={isLocating}
        >
          LOCATE
        </button>
      </div>
      <div className="p-3 bg-zinc-800 border-t border-zinc-700 text-xs font-mono text-center">
        {locationError && (
          <div className="mb-3">
            <p className="text-red-400 mb-1">{locationError}</p>
            <p className="text-zinc-400 text-xs">
              <span className="inline-block mr-1">💡</span>
              Try clicking directly on the map to select a location
            </p>
          </div>
        )}
        {isLocating && (
          <p className="text-zinc-400 mb-2">
            <span className="inline-block animate-pulse">●</span> locating...
          </p>
        )}
        <p className="text-zinc-400 truncate">
          {selectedPosition && selectedAddress
            ? `${selectedAddress}` 
            : currentLocation 
              ? `${selectedAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}` 
              : 'click map to select location or use LOCATE button'}
        </p>
      </div>
    </div>
  ) : (
    <div className="w-full h-96 flex items-center justify-center bg-zinc-800 border border-zinc-700">
      <p className="text-zinc-500 font-mono text-xs">loading maps...</p>
    </div>
  );
};

export default MapSelector;
