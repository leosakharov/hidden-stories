import { useState, useCallback, useEffect, useRef } from 'react';

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
  maxRetries?: number;
}

/**
 * Custom hook for handling browser geolocation with improved error handling
 */
export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  // More precise detection of Apple devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMacOS = /Mac/.test(navigator.userAgent) && !isIOS;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isAppleDevice = isIOS || (isMacOS && isSafari);
  
  // Use more conservative defaults for Apple devices
  const {
    enableHighAccuracy = isAppleDevice ? false : true,
    timeout = isAppleDevice ? 30000 : 10000, // Increased timeout for Apple devices
    maximumAge = isAppleDevice ? 120000 : 0, // Increased maximumAge for Apple devices
    autoLocateOnMount = true,
    maxRetries = 2 // Limit retries to prevent infinite loops
  } = options;
  
  // Log device detection for debugging
  if (isAppleDevice) {
    console.log(`Apple device detected (iOS: ${isIOS}, macOS: ${isMacOS}, Safari: ${isSafari}), using optimized geolocation settings`);
  }

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLocating: false,
    lastRequestTime: null
  });
  
  // Track retry attempts to prevent infinite loops
  const retryCount = useRef(0);

  /**
   * Get user's current location with improved error handling
   */
  const getCurrentLocation = useCallback(() => {
    // Reset retry counter when explicitly requesting location
    retryCount.current = 0;
    
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
          
          // Try fallback with less strict settings if we haven't exceeded max retries
          if (enableHighAccuracy && retryCount.current < maxRetries) {
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
      // Increment retry counter
      retryCount.current += 1;
      
      console.log(`Trying fallback geolocation with less strict settings (attempt ${retryCount.current}/${maxRetries})`);
      
      // If we've exceeded max retries, don't attempt another fallback
      if (retryCount.current > maxRetries) {
        console.log('Maximum retry attempts reached, stopping fallback attempts');
        setState(prev => ({
          ...prev,
          error: "Unable to determine your location after multiple attempts. Please select a location on the map instead.",
          isLocating: false
        }));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Reset retry counter on success
          retryCount.current = 0;
          
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
    
    // Try to get cached position first for Apple devices
    if (isAppleDevice && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Success with cached position
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
          () => {
            // If cached position fails, proceed with normal request
            // Don't handle error here, just continue to the next request
          },
          { 
            maximumAge: Infinity, // Use any cached position
            timeout: 1000, // Short timeout for cached position
            enableHighAccuracy: false 
          }
        );
      } catch (e) {
        // Ignore errors in the cached position attempt
        console.log('Error getting cached position, continuing with normal request');
      }
    }
    
    // Main geolocation request
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Reset retry counter on success
        retryCount.current = 0;
        
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
        let shouldTryFallback = false;
        
        // More specific check for CoreLocation errors
        const isCoreLocationUnknownError = error.message && 
          (error.message.includes('kCLErrorLocationUnknown') || 
           error.message.includes('CoreLocationProvider'));
        
        // Handle different error types
        if (isCoreLocationUnknownError) {
          // Specific handling for CoreLocation unknown error
          errorMessage = "Unable to determine your precise location. Please try selecting a location on the map instead.";
          console.log('CoreLocation unknown error detected, trying fallback if retries available');
          shouldTryFallback = retryCount.current < maxRetries;
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable. Please try selecting a location on the map.";
          shouldTryFallback = retryCount.current < maxRetries;
        } else {
          // Standard geolocation errors
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location services.";
              shouldTryFallback = false; // Don't retry if permission denied
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again or select a location on the map.";
              shouldTryFallback = retryCount.current < maxRetries;
              break;
            default:
              errorMessage = `Error getting location: ${error.message || 'Unknown error'}`;
              shouldTryFallback = retryCount.current < maxRetries;
          }
        }
        
        if (shouldTryFallback) {
          console.log(`Trying fallback for error: ${error.message || error.code}`);
          tryFallbackGeolocation(now);
        } else {
          // If we're not trying fallback, update state with error
          setState(prev => ({
            position: null,
            error: errorMessage,
            isLocating: false,
            lastRequestTime: prev.lastRequestTime
          }));
        }
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
    
    // Return cleanup function to clear timeout if component unmounts during geolocation
    return () => clearTimeout(timeoutId);
  }, [enableHighAccuracy, timeout, maximumAge, maxRetries, isAppleDevice]);

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

  // Provide a way to check if we're on an Apple device
  return {
    ...state,
    getCurrentLocation,
    isAppleDevice
  };
};
