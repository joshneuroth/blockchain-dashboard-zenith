
import { useState, useCallback, useEffect } from 'react';
import { NETWORKS } from '@/lib/api';
import { useGeoLocation } from './utils/geoLocationUtils';
import { 
  LatencyResult, 
  storeLatencyResults, 
  getStoredLatencyResults, 
  isStoredLatencyValid 
} from './utils/latencyUtils';
import { saveResultsToSupabase } from './utils/supabaseUtils';
import { measureLatency, processBlockHeightLatencyData } from './utils/rpcUtils';

export type { LatencyResult } from './utils/latencyUtils';
export type { GeoLocationInfo } from './utils/geoLocationUtils';

export const useLatencyTest = (networkId: string) => {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { geoInfo, fetchGeoInfo } = useGeoLocation();

  // Check for stored latency data on component mount
  useEffect(() => {
    const storedData = getStoredLatencyResults(networkId);
    
    // Only use stored data if it's recent enough
    if (isStoredLatencyValid(storedData)) {
      setResults(storedData!.results);
      setHasRun(true);
      // Also fetch user geo info when using stored results
      fetchGeoInfo();
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
  }, [networkId, fetchGeoInfo]);
  
  // Process and update latency data from block height monitoring
  const updateFromBlockHeightLatency = useCallback((blockHeightLatency: Record<string, { latency: number, endpoint: string, timestamp: number }>) => {
    setResults(prevResults => {
      const updatedResults = processBlockHeightLatencyData(blockHeightLatency, prevResults);
      
      // Store updated results
      if (updatedResults.length > 0) {
        storeLatencyResults(networkId, updatedResults);
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

  // Function to run a full latency test for all endpoints of a network
  const runLatencyTest = useCallback(async () => {
    if (!networkId || isRunning) return;
    setSaveError(null);
    
    // Check for recent stored results first
    const storedData = getStoredLatencyResults(networkId);
    if (isStoredLatencyValid(storedData)) {
      setResults(storedData!.results);
      setHasRun(true);
      const geoData = await fetchGeoInfo();
      
      // Try to save these results to Supabase as well
      const { error } = await saveResultsToSupabase(networkId, storedData!.results, geoData);
      if (error) setSaveError(error);
      
      return; // Use stored results, don't run a new test
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
    const testResults: LatencyResult[] = [];
    
    for (const rpc of network.rpcs) {
      const result = await measureLatency(rpc.url, rpc.name);
      testResults.push(result);
      // Add a small delay between requests to reduce chance of rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Store the results locally
    storeLatencyResults(networkId, testResults);
    
    setResults(testResults);
    setIsRunning(false);
    setHasRun(true);
    
    // Also save to Supabase if we have successful results
    const { error } = await saveResultsToSupabase(networkId, testResults, geoData);
    if (error) setSaveError(error);
    
  }, [networkId, isRunning, fetchGeoInfo]);

  return {
    results,
    isRunning,
    geoInfo,
    runLatencyTest,
    hasRun,
    saveError
  };
};
