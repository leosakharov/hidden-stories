import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Custom hooks
import { useGeolocation } from '../../../hooks/useGeolocation';

// Utils
import { getAddressFromCoordinates, MAP_CONTAINER_STYLE, DEFAULT_CENTER, DARK_MAP_STYLES } from '../../../utils/utils';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

/**
 * Map component that allows users to select a location
 */
const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  
  // Use custom geolocation hook with improved error handling
  const { 
    position: currentLocation, 
    error: locationError, 
    isLocating, 
    getCurrentLocation,
    isAppleDevice 
  } = useGeolocation({
    autoLocateOnMount: true,
    maxRetries: 2
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
    <div className="w-100 overflow-hidden">
      <div className="position-relative">
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
      </div>
      <button 
        onClick={handleGetCurrentLocation}
        className="btn btn-dark my-2"
        title="Use my current location"
        disabled={isLocating}
      >
        LOCATE
      </button>
      <div className="p-3 bg-secondary border-top text-center">
        {locationError && (
          <div className="mb-3">
            <p className="text-danger mb-1">{locationError}</p>
            <p className="text-muted">
              <span className="me-1">💡</span>
              Try clicking directly on the map to select a location
            </p>
            {isAppleDevice && (
              <p className="text-muted small">
                <span className="me-1">ℹ️</span>
                Apple devices may have location accuracy issues. Try enabling Precise Location in your device settings.
              </p>
            )}
          </div>
        )}
        {isLocating && (
          <p className="text-muted mb-2">
            <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true"></span> locating...
            {isAppleDevice && <span className="ms-1 small">(optimized for Apple devices)</span>}
          </p>
        )}
        <p className="text-muted text-truncate">
          {selectedPosition && selectedAddress
            ? `${selectedAddress}` 
            : currentLocation 
              ? `${selectedAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}` 
              : 'click map to select location or use LOCATE button'}
        </p>
      </div>
    </div>
  ) : (
    <div className="w-100 h-96 d-flex align-items-center justify-content-center bg-secondary border">
      <p className="text-muted">loading maps...</p>
    </div>
  );
};

export default MapSelector;
