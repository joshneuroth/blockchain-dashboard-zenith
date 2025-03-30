
import { useState, useEffect } from 'react';

export interface CloudLatencyResult {
  provider_name: string;
  endpoint: string;
  test_type: string;
  method: string;
  date: string;
  p50_latency: number;
  p90_latency: number;
  total_pings: number;
  success_rate: number;
}

export const useCloudLatencyTest = (networkId: string) => {
  const [results, setResults] = useState<CloudLatencyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchCloudLatencyData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://edgeprobe.fly.dev/simple-latency');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter results for the current network if needed in the future
      // For now, we'll use all results as the API doesn't yet filter by network
      setResults(data);
      
      // Set last updated time
      const now = new Date();
      setLastUpdated(now.toISOString());
      
      // Cache the data
      localStorage.setItem('cloud-latency-results', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching cloud latency data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Try to load cached data on initial render
  useEffect(() => {
    const cachedData = localStorage.getItem('cloud-latency-results');
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        // Only use cached data if it's less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setResults(data);
          setLastUpdated(new Date(timestamp).toISOString());
        } else {
          // Data is too old, fetch fresh data
          fetchCloudLatencyData();
        }
      } catch (err) {
        console.error('Error parsing cached cloud latency data:', err);
        fetchCloudLatencyData();
      }
    } else {
      // No cached data, fetch fresh data
      fetchCloudLatencyData();
    }
  }, [networkId]);

  return {
    results,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchCloudLatencyData
  };
};
