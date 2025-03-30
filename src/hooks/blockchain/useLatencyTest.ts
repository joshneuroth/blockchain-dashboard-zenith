import { useState, useCallback, useEffect } from 'react';
import { NETWORKS } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export interface LatencyResult {
  provider: string;
  endpoint: string;
  latency: number | null; // in milliseconds
  medianLatency: number | null; // P50 latency value
  samples: number[]; // track multiple latency samples
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
  errorType?: 'timeout' | 'rate-limit' | 'connection' | 'rpc-error' | 'unknown';
}

export interface GeoLocationInfo {
  location: string | null;
  asn: string | null;
  isp: string | null;
}

interface StoredLatencyData {
  results: LatencyResult[];
  timestamp: number;
}

interface CachedGeoInfo {
  data: GeoLocationInfo;
  timestamp: number;
}

// How long to consider stored latency data valid (5 minutes)
const LATENCY_DATA_TTL = 5 * 60 * 1000;

// How long to consider geo location data valid (4 hours)
const GEO_DATA_TTL = 4 * 60 * 60 * 1000;

// Calculate median (P50) value from an array of numbers
const calculateMedian = (values: number[]): number | null => {
  if (!values || values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

export const useLatencyTest = (networkId: string) => {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [geoInfo, setGeoInfo] = useState<GeoLocationInfo>({
    location: null,
    asn: null,
    isp: null
  });
  const [hasRun, setHasRun] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check for stored latency data on component mount
  useEffect(() => {
    const storedData = localStorage.getItem(`latency-results-${networkId}`);
    if (storedData) {
      try {
        const parsedData: StoredLatencyData = JSON.parse(storedData);
        const dataAge = Date.now() - parsedData.timestamp;
        
        // Only use stored data if it's recent enough
        if (dataAge < LATENCY_DATA_TTL && parsedData.results.length > 0) {
          setResults(parsedData.results);
          setHasRun(true);
          // Also fetch user geo info when using stored results
          fetchGeoInfo();
        }
      } catch (e) {
        console.error('Error parsing stored latency data:', e);
        // Invalid data, will run test normally when requested
      }
    }
    
    // Check for block height latency data and incorporate it
    const blockHeightLatencyKey = `blockheight-latency-${networkId}`;
    const blockHeightLatencyData = localStorage.getItem(blockHeightLatencyKey);
    
    if (blockHeightLatencyData) {
      try {
        const latencyData = JSON.parse(blockHeightLatencyData);
        if (latencyData && Object.keys(latencyData).length > 0) {
          updateFromBlockHeightLatency(latencyData);
        }
      } catch (e) {
        console.error('Error parsing block height latency data:', e);
      }
    }
  }, [networkId]);
  
  // Process and update latency data from block height monitoring
  const updateFromBlockHeightLatency = useCallback((blockHeightLatency: Record<string, { latency: number, endpoint: string, timestamp: number }>) => {
    setResults(prevResults => {
      const updatedResults = [...prevResults];
      
      // For each entry in the block height latency data
      Object.entries(blockHeightLatency).forEach(([provider, data]) => {
        const { latency, endpoint } = data;
        if (latency <= 0) return; // Skip invalid latency values
        
        // Find matching provider in existing results
        const existingIndex = updatedResults.findIndex(r => r.provider === provider);
        
        if (existingIndex >= 0) {
          // Update existing provider data
          const existing = updatedResults[existingIndex];
          const samples = [...(existing.samples || []), latency].slice(-10); // Keep last 10 samples
          
          updatedResults[existingIndex] = {
            ...existing,
            latency: latency, // Most recent latency
            samples: samples,
            medianLatency: calculateMedian(samples),
            status: 'success'
          };
        } else {
          // Add new provider data
          updatedResults.push({
            provider,
            endpoint,
            latency,
            samples: [latency],
            medianLatency: latency, // With only one sample, median = the value
            status: 'success'
          });
        }
      });
      
      // Store updated results
      if (updatedResults.length > 0) {
        localStorage.setItem(`latency-results-${networkId}`, JSON.stringify({
          results: updatedResults,
          timestamp: Date.now()
        }));
        setHasRun(true);
      }
      
      return updatedResults;
    });
  }, [networkId]);
  
  // Listen for block height latency updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `blockheight-latency-${networkId}` && e.newValue) {
        try {
          const latencyData = JSON.parse(e.newValue);
          if (latencyData && Object.keys(latencyData).length > 0) {
            updateFromBlockHeightLatency(latencyData);
          }
        } catch (error) {
          console.error('Error processing block height latency update:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [networkId, updateFromBlockHeightLatency]);

  // Function to fetch user's geo information with caching
  const fetchGeoInfo = useCallback(async () => {
    // Check for cached geo location data first
    const cachedGeoData = localStorage.getItem('cached-geo-location');
    if (cachedGeoData) {
      try {
        const parsedCache: CachedGeoInfo = JSON.parse(cachedGeoData);
        const dataAge = Date.now() - parsedCache.timestamp;
        
        // If cached data is still valid (less than 24 hours old), use it
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

  // Function to measure latency to an RPC endpoint
  const measureLatency = useCallback(async (endpoint: string, providerName: string): Promise<LatencyResult> => {
    try {
      const startTime = performance.now();
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      if (!response.ok) {
        // Categorize HTTP errors
        let errorType: LatencyResult['errorType'] = 'unknown';
        let errorMessage = `HTTP error: ${response.status}`;
        
        if (response.status === 429) {
          errorType = 'rate-limit';
          errorMessage = 'Rate limit exceeded';
        } else if (response.status >= 500) {
          errorType = 'rpc-error';
          errorMessage = 'Server error';
        } else if (response.status === 403) {
          errorType = 'connection';
          errorMessage = 'Access denied';
        }
        
        return {
          provider: providerName,
          endpoint,
          latency: null,
          samples: [],
          medianLatency: null,
          status: 'error',
          errorMessage,
          errorType
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        return {
          provider: providerName,
          endpoint,
          latency: null,
          samples: [],
          medianLatency: null,
          status: 'error',
          errorMessage: data.error.message || 'RPC error',
          errorType: 'rpc-error'
        };
      }
      
      return {
        provider: providerName,
        endpoint,
        latency,
        samples: [latency],
        medianLatency: latency, // With only one sample, median = the value
        status: 'success'
      };
    } catch (error) {
      // Categorize JavaScript errors
      let errorType: LatencyResult['errorType'] = 'unknown';
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        errorType = 'timeout';
        errorMessage = 'Connection timed out';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorType = 'connection';
        errorMessage = 'Connection failed';
      }
      
      return {
        provider: providerName,
        endpoint,
        latency: null,
        samples: [],
        medianLatency: null,
        status: 'error',
        errorMessage,
        errorType
      };
    }
  }, []);

  // Save latency results to Supabase
  const saveResultsToSupabase = useCallback(async (latencyResults: LatencyResult[], geoInfo: GeoLocationInfo) => {
    setSaveError(null);
    const networkName = NETWORKS[networkId as keyof typeof NETWORKS]?.name || networkId;
    
    try {
      // Only insert results that have valid latency
      const successfulResults = latencyResults.filter(r => r.status === 'success' && r.medianLatency !== null);
      
      if (successfulResults.length === 0) {
        console.log('No valid latency results to save to Supabase');
        return;
      }
      
      // Process each result - use batch insert since we might have multiple results
      const insertPromises = successfulResults.map(result => {
        return supabase
          .from('public_latency_test')
          .insert({
            network: networkName,
            origin_asn: geoInfo.asn,
            origin_host: null, // We don't collect the hostname for privacy
            origin_country: geoInfo.location ? geoInfo.location.split(', ')[2] : null,
            origin_city: geoInfo.location ? geoInfo.location.split(', ')[0] : null,
            origin_region: geoInfo.location ? geoInfo.location.split(', ')[1] : null,
            p50_latency: result.medianLatency,
            provider_name: result.provider,
            provider_endpoint: result.endpoint,
            minute_bucket: '' // Will be set by database trigger
          })
          .select();
      });
      
      const responseResults = await Promise.allSettled(insertPromises);
      
      // Check for any errors
      const errors = responseResults
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason);
      
      if (errors.length) {
        console.warn('Some latency results could not be saved:', errors);
        // Only set an error if all inserts failed
        if (errors.length === successfulResults.length) {
          setSaveError('Failed to save latency data to database');
        }
      } else {
        console.log('Successfully saved latency data to Supabase');
      }
    } catch (error) {
      console.error('Error saving latency data to Supabase:', error);
      setSaveError('Failed to save latency data to database');
    }
  }, [networkId]);

  // Function to run a full latency test for all endpoints of a network
  const runLatencyTest = useCallback(async () => {
    if (!networkId || isRunning) return;
    setSaveError(null);
    
    // Check for recent stored results first
    const storedData = localStorage.getItem(`latency-results-${networkId}`);
    if (storedData) {
      try {
        const parsedData: StoredLatencyData = JSON.parse(storedData);
        const dataAge = Date.now() - parsedData.timestamp;
        
        if (dataAge < LATENCY_DATA_TTL && parsedData.results.length > 0) {
          setResults(parsedData.results);
          setHasRun(true);
          const geoData = await fetchGeoInfo();
          
          // Try to save these results to Supabase as well
          await saveResultsToSupabase(parsedData.results, geoData);
          
          return; // Use stored results, don't run a new test
        }
      } catch (e) {
        // Invalid data, continue with the test
        console.error('Error parsing stored latency data:', e);
      }
    }
    
    const network = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!network) return;
    
    setIsRunning(true);
    
    // Initialize results with loading state
    const initialResults = network.rpcs.map(rpc => ({
      provider: rpc.name,
      endpoint: rpc.url,
      latency: null,
      samples: [],
      medianLatency: null,
      status: 'loading' as const
    }));
    
    setResults(initialResults);
    
    // Try to get user's location
    const geoData = await fetchGeoInfo();
    
    // Run tests in parallel but with a small delay between each to avoid rate limiting
    const testResults: LatencyResult[] = []; // Renamed from 'results' to 'testResults' to avoid conflict
    
    for (const rpc of network.rpcs) {
      const result = await measureLatency(rpc.url, rpc.name);
      testResults.push(result);
      // Add a small delay between requests to reduce chance of rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Store the results locally
    localStorage.setItem(`latency-results-${networkId}`, JSON.stringify({
      results: testResults,
      timestamp: Date.now()
    }));
    
    setResults(testResults);
    setIsRunning(false);
    setHasRun(true);
    
    // Also save to Supabase if we have successful results
    await saveResultsToSupabase(testResults, geoData);
    
  }, [networkId, isRunning, measureLatency, fetchGeoInfo, saveResultsToSupabase]);

  return {
    results,
    isRunning,
    geoInfo,
    runLatencyTest,
    hasRun,
    saveError
  };
};
