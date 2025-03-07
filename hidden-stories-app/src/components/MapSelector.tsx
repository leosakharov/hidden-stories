import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Custom hooks and utilities
import { useGeolocation } from '../shared/hooks';
import { getAddressFromCoordinates } from '../shared/utils';
import { MAP_CONTAINER_STYLE, DEFAULT_LOCATION, DARK_MAP_STYLES } from '../shared/constants';

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
    isUsingDefaultLocation,
    defaultAddress
  } = useGeolocation({
    autoLocateOnMount: true,
    maxRetries: 2,
    useDefaultLocation: true // Use Stenhuggervej 4 as default location
  });
  
  // Initialize Google Maps with API key from environment variables
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Get address when current location changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (currentLocation && isLoaded) {
        // If using default location, use the default address
        if (isUsingDefaultLocation && defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else {
          // Otherwise, get address from coordinates
          const address = await getAddressFromCoordinates(
            currentLocation.lat, 
            currentLocation.lng
          );
          setSelectedAddress(address);
        }
      }
    };
    
    fetchAddress();
  }, [currentLocation, isLoaded, isUsingDefaultLocation, defaultAddress]);

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
    <div className="w-100 h-100 overflow-hidden position-absolute top-0 start-0 end-0 bottom-0">
      <div className="position-relative h-100">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={selectedPosition || currentLocation || DEFAULT_LOCATION}
          zoom={10}
          onClick={onMapClick}
          options={{
            styles: DARK_MAP_STYLES,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP
            }
          }}
        >
          {selectedPosition && (
            <Marker 
              position={selectedPosition}
              label={{
                text: "S",
                color: "#000000",
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: "bold"
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
                fontSize: "12px",
                fontWeight: "bold"
              }}
            />
          )}
        </GoogleMap>
        
        {/* Map Controls Overlay */}
        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 p-3">
          <div className="d-flex justify-content-between align-items-center">
            <button 
              onClick={handleGetCurrentLocation}
              className="btn btn-primary"
              title="Use my current location"
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true"></span>
                  Locating...
                </>
              ) : (
                "LOCATE ME"
              )}
            </button>
            
            <div className="text-light text-center flex-grow-1 px-3">
              {locationError ? (
                <p className="text-danger mb-0 small">
                  <span className="me-1">⚠️</span>
                  {locationError}
                </p>
              ) : (
                <p className="text-light mb-0 text-truncate">
                  {selectedPosition && selectedAddress
                    ? `${selectedAddress}` 
                    : currentLocation 
                      ? `${selectedAddress || `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}` 
                      : 'Click on map to select a location'}
                </p>
              )}
            </div>
            
            {selectedPosition && (
              <button 
                className="btn btn-outline-light"
                onClick={() => {
                  setSelectedPosition(null);
                  onLocationSelect(
                    currentLocation?.lat || DEFAULT_LOCATION.lat,
                    currentLocation?.lng || DEFAULT_LOCATION.lng,
                    selectedAddress || undefined
                  );
                }}
              >
                RESET
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="text-center">
        <div className="spinner-border text-light mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading map...</p>
      </div>
    </div>
  );
};

export default MapSelector;
