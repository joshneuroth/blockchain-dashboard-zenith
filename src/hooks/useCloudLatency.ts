
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

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
  
  const fetchCloudLatencyData = async (): Promise<CloudLatencyData[]> => {
    console.log('Fetching cloud latency data...');
    const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cloud latency data received:', data.length, 'records');
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available');
    }
    
    return data;
  };

  const result = useQuery({
    queryKey: ['cloudLatency', networkId],
    queryFn: fetchCloudLatencyData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Extract data and hook callbacks
  const { data = [], isLoading, error, refetch } = result;

  // Handle errors outside the query configuration, but only show the toast once
  if (error && !hasShownErrorToast.current) {
    console.error('Error fetching cloud latency data:', error);
    toast({
      title: "Connection Issue",
      description: "Could not load cloud latency data. Click 'Retry' to try again.",
      variant: "destructive",
    });
    hasShownErrorToast.current = true;
  }

  return { data, isLoading, error, refetch };
};
