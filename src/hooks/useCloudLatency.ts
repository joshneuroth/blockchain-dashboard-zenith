
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state on new fetch
        
        console.log('Fetching cloud latency data...');
        // Use a more resilient URL pattern with query parameters and a longer timeout
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache', // Prevent caching issues
          },
          signal: AbortSignal.timeout(15000) // Extended 15 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const cloudData = await response.json();
        console.log('Cloud latency data received:', cloudData.length, 'records');
        
        if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
          setData(cloudData);
          setIsLoading(false);
          setError(null);
        } else {
          // Handle empty data case
          console.warn('Received empty data array from API');
          setData([]);
          setError('No data available');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setIsLoading(false);
        
        // Show toast for network errors
        toast({
          title: "Connection Issue",
          description: "Could not load cloud latency data. Will retry automatically.",
          variant: "destructive",
        });
      }
    };

    fetchData();

    return () => {
      // Clean up the fetch request if component unmounts
      controller.abort();
    };
  }, [networkId, toast]);

  return { data, isLoading, error };
};
