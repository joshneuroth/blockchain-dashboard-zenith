
// Type definitions for service events
export interface ServiceEvent {
  id: string;
  provider_id?: string;
  provider_name: string;
  timestamp: string;
  origin_region?: string;
  origin_asn?: string;
  type?: string;
  network: string;
  chain_id?: string;
  measurements?: {
    current_latency_ms?: number;
    average_latency_ms?: number;
    baseline_latency_ms?: number;
    endpoint?: string;
    event_created?: string;
    error_code?: number;
    success?: number;
  };
  metadata?: {
    max_latency_ms?: number;
    consecutive_failures?: number;
    origin_asn?: string;
    error?: string;
    source?: string;
    error_type?: string;
  };
  resolved_at: string | null;
  reason: string;
  status: 'active' | 'degraded' | 'outage' | 'resolved';
  elapsed_time?: {
    seconds: number;
    human_readable: string;
  };
  // For backward compatibility with existing code
  provider: string;
  chain: string;
  title?: string;
  description?: string;
  started_at: string;
  created_at?: string;
  updated_at?: string;
}

// API service for fetching events
export const fetchServiceEvents = async (types: string[] = []): Promise<ServiceEvent[]> => {
  try {
    // Build URL with type filters if provided
    let url = "https://api.internal.blockheight.xyz/events?api_key=bh_a7c63f38-5757-4250-88cd-8d1f842a7142";
    
    // Add type filters if any are selected
    if (types.length > 0) {
      types.forEach(type => {
        url += `&type=${type}`;
      });
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    
    // Check if the data is in the expected format
    if (data && data.data) {
      // Map the API response to our ServiceEvent interface
      return data.data.map((event: any) => ({
        ...event,
        // Map the provider_name to provider for backward compatibility
        provider: event.provider_name,
        // Map the network to chain for backward compatibility
        chain: event.network,
        // Map the timestamp to started_at for backward compatibility
        started_at: event.timestamp,
        // Title and description for display purposes
        title: `${event.type || 'Issue'} on ${event.provider_name}`,
        description: event.reason || 'No details provided'
      }));
    }
    
    console.log("Unexpected API response format:", data);
    return [];
  } catch (error) {
    console.error("Error fetching service events:", error);
    return [];
  }
};
