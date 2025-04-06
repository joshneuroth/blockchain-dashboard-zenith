
import { useState, useEffect } from 'react';

// Interface for the metrics in the API response
interface MetricItem {
  origin_asn?: string;
  provider: string;
  method?: string;
  p50_latency_ms: number;
  p90_latency_ms: number;
  sample_size: number;
  last_updated?: string;
}

// Interface for the API response format
interface ApiResponse {
  region: string;
  metrics: MetricItem[];
}

// Our application's internal data model
export interface CloudLatencyData {
  provider: string;
  origin: {
    city?: string;
    region?: string;
    country?: string;
  };
  p50_latency: number;
  p90_latency: number;
  sample_size: number;
  success_rate?: number;
  timestamp?: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching cloud latency data for network ${networkId}...`);
        
        const apiUrl = `https://blockheight-api.fly.dev/networks/${networkId}/metrics/latency`;
        
        console.log(`Calling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          console.error(`API returned status: ${response.status}`);
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Retrieved raw cloud data', rawData);
        
        // Handle the new API response format
        if (!rawData || typeof rawData !== 'object') {
          console.error('Unexpected API response format:', rawData);
          throw new Error('Invalid data format received from API');
        }
        
        // If the API returns an array directly (old format)
        if (Array.isArray(rawData)) {
          console.log('API returned an array (old format)');
          if (rawData.length === 0) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          // Process old format
          const processedData: CloudLatencyData[] = rawData.map(item => ({
            provider: item.provider || 'Unknown',
            origin: {
              city: item.origin?.city,
              region: item.origin?.region,
              country: item.origin?.country
            },
            p50_latency: item.p50_latency_ms !== undefined ? item.p50_latency_ms : 
                       (item.avg_p50_latency_ms !== undefined ? item.avg_p50_latency_ms : 0),
            p90_latency: item.p90_latency_ms !== undefined ? item.p90_latency_ms : 
                       (item.avg_p90_latency_ms !== undefined ? item.avg_p90_latency_ms : 0),
            sample_size: item.sample_size || 0,
            success_rate: item.success_rate || 1.0,
            timestamp: item.timestamp
          }));
          
          console.log('Processed old format data:', processedData);
          setData(processedData);
        } 
        // New format - object with region and metrics array
        else if (rawData.region && Array.isArray(rawData.metrics)) {
          console.log('API returned new format with region and metrics');
          const region = rawData.region;
          const metrics = rawData.metrics;
          
          if (metrics.length === 0) {
            setData([]);
            setIsLoading(false);
            return;
          }
          
          // Process new format
          const processedData: CloudLatencyData[] = metrics.map(item => ({
            provider: item.provider || 'Unknown',
            origin: {
              region: region
            },
            p50_latency: item.p50_latency_ms,
            p90_latency: item.p90_latency_ms,
            sample_size: item.sample_size || 0,
            success_rate: 1.0, // Default if not provided
            timestamp: item.last_updated
          }));
          
          console.log('Processed new format data:', processedData);
          setData(processedData);
        }
        // Array of objects with region and metrics (multiple regions)
        else if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].region && Array.isArray(rawData[0].metrics)) {
          console.log('API returned array of region/metrics objects');
          
          // Flatten all metrics from all regions
          const processedData: CloudLatencyData[] = rawData.flatMap((regionData: ApiResponse) => {
            return regionData.metrics.map(item => ({
              provider: item.provider || 'Unknown',
              origin: {
                region: regionData.region
              },
              p50_latency: item.p50_latency_ms,
              p90_latency: item.p90_latency_ms,
              sample_size: item.sample_size || 0,
              success_rate: 1.0, // Default if not provided
              timestamp: item.last_updated
            }));
          });
          
          console.log('Processed multiple regions data:', processedData);
          setData(processedData);
        }
        else {
          console.error('Unrecognized API response format:', rawData);
          throw new Error('Unrecognized data format received from API');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setData(null);
        setIsLoading(false);
      }
    };

    if (networkId) {
      fetchData();
    } else {
      console.error('Network ID is undefined or empty');
      setError('Missing network ID');
      setIsLoading(false);
    }
    
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  return { data, isLoading, error };
};
