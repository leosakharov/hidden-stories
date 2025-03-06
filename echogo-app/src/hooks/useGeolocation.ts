import { useState, useCallback, useEffect } from 'react';

interface GeolocationState {
  position: {
    lat: number;
    lng: number;
  } | null;
  error: string | null;
  isLocating: boolean;
  lastRequestTime: number | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoLocateOnMount?: boolean;
}

/**
 * Custom hook for handling browser geolocation
 */
export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  // Detect if running on an Apple device (Safari or iOS WebView)
  const isAppleDevice = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                        /iP(ad|hone|od)/i.test(navigator.userAgent);
  
  // Use more conservative defaults for Apple devices
  const {
    enableHighAccuracy = isAppleDevice ? false : true,
    timeout = isAppleDevice ? 20000 : 10000,
    maximumAge = isAppleDevice ? 60000 : 0,
    autoLocateOnMount = true
  } = options;
  
  // Log device detection for debugging
  if (isAppleDevice) {
    console.log('Apple device detected, using optimized geolocation settings');
  }

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLocating: false,
    lastRequestTime: null
  });

  /**
   * Get user's current location
   */
  const getCurrentLocation = useCallback(() => {
    // Don't allow multiple requests within 2 seconds
    const now = Date.now();
    if (state.lastRequestTime && now - state.lastRequestTime < 2000) {
      console.log('Throttling geolocation request');
      return;
    }
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLocating: false
      }));
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isLocating: true, 
      error: null,
      lastRequestTime: now
    }));
    
    // Create a timeout for geolocation request
    const timeoutId = setTimeout(() => {
      setState(prev => {
        // Only update if we're still locating (to avoid race conditions)
        if (prev.isLocating) {
          console.log('Geolocation request timed out, trying fallback');
          
          // Try fallback with less strict settings
          if (enableHighAccuracy) {
            tryFallbackGeolocation(now);
          } else {
            return {
              ...prev,
              error: "Location request timed out. Please try selecting a location on the map instead.",
              isLocating: false
            };
          }
        }
        return prev;
      });
    }, timeout + 1000); // Add 1 second buffer to the timeout
    
    // Fallback geolocation with less strict settings
    const tryFallbackGeolocation = (requestTime: number) => {
      console.log('Trying fallback geolocation with less strict settings');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setState({
            position: userLocation,
            error: null,
            isLocating: false,
            lastRequestTime: requestTime
          });
        },
        (fallbackError) => {
          console.log('Fallback geolocation failed:', fallbackError);
          setState(prev => ({
            ...prev,
            error: "Unable to determine your location. Please select a location on the map instead.",
            isLocating: false
          }));
        },
        { 
          enableHighAccuracy: false, 
          timeout: 30000, 
          maximumAge: 120000 
        }
      );
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setState(prev => ({
          position: userLocation,
          error: null,
          isLocating: false,
          lastRequestTime: prev.lastRequestTime
        }));
      },
      (error) => {
        clearTimeout(timeoutId);
        
        // Handle specific geolocation errors
        let errorMessage = "Unknown location error occurred";
        let isCoreLocationError = false;
        
        // Check for CoreLocation specific errors - expanded to catch more variations
        if (error.message && (
            error.message.includes('kCLErrorLocationUnknown') || 
            error.message.includes('CoreLocationProvider') || 
            error.message.includes('CoreLocation framework') ||
            error.message.includes('location') ||
            error.code === 2 // POSITION_UNAVAILABLE
          )) {
          errorMessage = "Unable to determine your location. Please try selecting a location on the map instead.";
          isCoreLocationError = true;
          console.log('CoreLocation or location error detected, providing fallback');
          
          // Try a more aggressive fallback approach
          console.log('Trying aggressive fallback approach');
          tryFallbackGeolocation(now);
        } else {
          // Standard geolocation errors
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again later.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = `Error getting location: ${error.message || 'Unknown error'}`;
          }
        }
        
        setState(prev => ({
          position: null,
          error: errorMessage,
          isLocating: false,
          lastRequestTime: prev.lastRequestTime
        }));
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
    
    // Return cleanup function to clear timeout if component unmounts during geolocation
    return () => clearTimeout(timeoutId);
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Get the current location on component mount if autoLocateOnMount is true
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (autoLocateOnMount) {
      cleanup = getCurrentLocation();
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [autoLocateOnMount, getCurrentLocation]);

  return {
    ...state,
    getCurrentLocation
  };
};
