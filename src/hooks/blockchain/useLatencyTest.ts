
import { useState, useCallback } from 'react';
import { NETWORKS } from '@/lib/api';

export interface LatencyResult {
  provider: string;
  endpoint: string;
  latency: number | null; // in milliseconds
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
  errorType?: 'timeout' | 'rate-limit' | 'connection' | 'rpc-error' | 'unknown';
}

export const useLatencyTest = (networkId: string) => {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

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
          status: 'error',
          errorMessage: data.error.message || 'RPC error',
          errorType: 'rpc-error'
        };
      }
      
      return {
        provider: providerName,
        endpoint,
        latency,
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
        status: 'error',
        errorMessage,
        errorType
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
    setHasRun(true);
  }, [networkId, isRunning, measureLatency]);

  return {
    results,
    isRunning,
    userLocation,
    runLatencyTest,
    hasRun
  };
};
