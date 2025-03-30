
import { useState, useCallback } from 'react';

export interface GeoLocationInfo {
  location: string | null;
  asn: string | null;
  isp: string | null;
}

// How long to consider geo location data valid (4 hours)
const GEO_DATA_TTL = 4 * 60 * 60 * 1000;

export const useGeoLocation = () => {
  const [geoInfo, setGeoInfo] = useState<GeoLocationInfo>({
    location: null,
    asn: null,
    isp: null
  });

  const fetchGeoInfo = useCallback(async (): Promise<GeoLocationInfo> => {
    // Check for cached geo location data first
    const cachedGeoData = localStorage.getItem('cached-geo-location');
    if (cachedGeoData) {
      try {
        const parsedCache = JSON.parse(cachedGeoData);
        const dataAge = Date.now() - parsedCache.timestamp;
        
        // If cached data is still valid (less than TTL old), use it
        if (dataAge < GEO_DATA_TTL) {
          console.log('Using cached geo location data');
          setGeoInfo(parsedCache.data);
          return parsedCache.data;
        } else {
          console.log('Cached geo location data expired, fetching fresh data');
        }
      } catch (e) {
        console.error('Error parsing cached geo location data:', e);
      }
    }
    
    // If no valid cached data, fetch from API
    try {
      const locationResponse = await fetch('https://ipapi.co/json/');
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        
        // Format location string
        let locationString = 'Unknown Location';
        if (locationData.city && locationData.region && locationData.country) {
          locationString = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
        }
        
        // Get ASN and ISP information if available
        const asnInfo = locationData.asn ? `AS${locationData.asn}` : null;
        const ispInfo = locationData.org || null;
        
        const geoInformation = {
          location: locationString,
          asn: asnInfo,
          isp: ispInfo
        };
        
        // Cache the geo information
        localStorage.setItem('cached-geo-location', JSON.stringify({
          data: geoInformation,
          timestamp: Date.now()
        }));
        
        setGeoInfo(geoInformation);
        return geoInformation;
      } else {
        setGeoInfo({
          location: 'Unknown Location',
          asn: null,
          isp: null
        });
        return {
          location: 'Unknown Location',
          asn: null,
          isp: null
        };
      }
    } catch (error) {
      console.log('Failed to get location:', error);
      setGeoInfo({
        location: 'Unknown Location',
        asn: null,
        isp: null
      });
      return {
        location: 'Unknown Location',
        asn: null,
        isp: null
      };
    }
  }, []);

  return { geoInfo, fetchGeoInfo };
};
