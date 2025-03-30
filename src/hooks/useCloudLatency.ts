
import { useState, useEffect } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
  origin?: string; // Added origin field which might be present in the API response
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
          headers: {
            'Accept': 'application/json',
          },
          // Add a reasonable timeout
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const cloudData = await response.json();
        
        // Validate the data is an array
        if (!Array.isArray(cloudData)) {
          throw new Error('Invalid data format received');
        }
        
        // Process the data to ensure all required fields are present and valid
        const processedData = cloudData
          .filter(item => 
            item && 
            typeof item === 'object' &&
            item.provider_name && 
            typeof item.response_time === 'number' && 
            !isNaN(item.response_time)
          )
          .map(item => ({
            ...item,
            // If origin is missing, infer it from provider_name or set to "Unknown"
            origin: item.origin || inferOriginFromProvider(item.provider_name) || "Unknown"
          }));
        
        setData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setData([]);
        setIsLoading(false);
      }
    };

    if (networkId) {
      fetchData();
    }
    
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  // Helper function to infer origin from provider name if not provided by API
  const inferOriginFromProvider = (providerName: string): string | null => {
    const lowerProvider = providerName.toLowerCase();
    if (lowerProvider.includes('us') || lowerProvider.includes('america')) return 'US';
    if (lowerProvider.includes('eu') || lowerProvider.includes('europe')) return 'Europe';
    if (lowerProvider.includes('asia') || lowerProvider.includes('ap')) return 'Asia';
    return null;
  };

  return { data, isLoading, error };
};
