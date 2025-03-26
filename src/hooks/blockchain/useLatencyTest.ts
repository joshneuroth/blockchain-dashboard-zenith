
import { useState, useEffect, useCallback } from 'react';
import { NETWORKS } from '@/lib/api';

export interface LatencyResult {
  provider: string;
  endpoint: string;
  latency: number | null; // in milliseconds
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export const useLatencyTest = (networkId: string) => {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);

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
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      if (!response.ok) {
        return {
          provider: providerName,
          endpoint,
          latency: null,
          status: 'error',
          errorMessage: `HTTP error: ${response.status}`
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        return {
          provider: providerName,
          endpoint,
          latency: null,
          status: 'error',
          errorMessage: data.error.message || 'RPC error'
        };
      }
      
      return {
        provider: providerName,
        endpoint,
        latency,
        status: 'success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        provider: providerName,
        endpoint,
        latency: null,
        status: 'error',
        errorMessage
      };
    }
  }, []);

  // Function to run a full latency test for all endpoints of a network
  const runLatencyTest = useCallback(async () => {
    if (!networkId || isRunning) return;
    
    const network = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!network) return;
    
    setIsRunning(true);
    
    // Initialize results with loading state
    const initialResults = network.rpcs.map(rpc => ({
      provider: rpc.name,
      endpoint: rpc.url,
      latency: null,
      status: 'loading' as const
    }));
    
    setResults(initialResults);
    
    // Try to get user's location
    try {
      const locationResponse = await fetch('https://ipapi.co/json/');
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        if (locationData.city && locationData.region && locationData.country) {
          setUserLocation(`${locationData.city}, ${locationData.region}, ${locationData.country}`);
        } else {
          setUserLocation('Unknown Location');
        }
      } else {
        setUserLocation('Unknown Location');
      }
    } catch (error) {
      console.log('Failed to get location:', error);
      setUserLocation('Unknown Location');
    }
    
    // Run tests in parallel
    const testPromises = network.rpcs.map(rpc => 
      measureLatency(rpc.url, rpc.name)
    );
    
    const newResults = await Promise.all(testPromises);
    setResults(newResults);
    setIsRunning(false);
  }, [networkId, isRunning, measureLatency]);

  // Run the test on initial load
  useEffect(() => {
    if (networkId) {
      runLatencyTest();
    }
  }, [networkId, runLatencyTest]);

  return {
    results,
    isRunning,
    userLocation,
    runLatencyTest
  };
};
