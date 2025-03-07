/**
 * Utility functions for geocoding operations
 */

/**
 * Get address from coordinates using Google Maps Geocoding API
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @returns Promise with formatted address or null
 */
export const getAddressFromCoordinates = async (
  lat: number, 
  lng: number
): Promise<string | null> => {
  try {
    if (!window.google || !window.google.maps) return null;
    
    const geocoder = new google.maps.Geocoder();
    const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
    
    // Get the most detailed address
    const address = response[0]?.formatted_address;
    return address || null;
  } catch (error) {
    console.error("Error getting address:", error);
    return null;
  }
};
