
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const { toast } = useToast();
  const hasShownErrorToast = useRef(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const fetchCloudLatencyData = async (): Promise<CloudLatencyData[]> => {
    console.log('Fetching cloud latency data with URL:', 'https://edgeprobe.fly.dev/simple-latency?days=7');
    
    try {
      const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(30000) // Increased timeout to 30 seconds
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Cloud latency data received:', data.length, 'records, first record:', data[0]);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available or invalid data format');
      }
      
      return data;
    } catch (error) {
      console.error('Fetch error details:', error);
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const result = useQuery({
    queryKey: ['cloudLatency', networkId],
    queryFn: fetchCloudLatencyData,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Extract data and hook callbacks
  const { data = [], isLoading, error, refetch } = result;

  // Handle errors outside the query configuration, but only show the toast once
  if (error && !hasShownErrorToast.current) {
    console.error('Error fetching cloud latency data:', error, 'Last error:', lastError);
    toast({
      title: "Connection Issue",
      description: `Could not load cloud latency data: ${lastError || 'Unknown error'}. Click 'Retry' to try again.`,
      variant: "destructive",
    });
    hasShownErrorToast.current = true;
  }

  // Reset error toast flag when refetching
  const wrappedRefetch = () => {
    hasShownErrorToast.current = false;
    return refetch();
  };

  return { data, isLoading, error, refetch: wrappedRefetch, lastError };
};
