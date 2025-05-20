
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
export const fetchServiceEvents = async (): Promise<ServiceEvent[]> => {
  try {
    // Using the provider leaderboard endpoint which doesn't require authentication
    const response = await fetch(
      "https://blockheight-api.fly.dev/internal/leaderboard/v1"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Create mock service events based on provider data
    if (data && Array.isArray(data)) {
      // Convert provider data to service events format
      return data.slice(0, 5).map((provider: any) => ({
        id: `evt_${provider.provider_id || Math.random().toString(36).substring(2, 10)}`,
        provider_id: provider.provider_id || "",
        provider_name: provider.name || "Unknown Provider",
        timestamp: new Date().toISOString(),
        network: provider.network || "Ethereum",
        reason: `High latency detected for ${provider.name}`,
        resolved_at: Math.random() > 0.5 ? null : new Date(Date.now() - 86400000).toISOString(),
        status: Math.random() > 0.5 ? 'active' : 'resolved',
        // Mapped fields for backward compatibility
        provider: provider.name || "Unknown Provider",
        chain: provider.network || "Ethereum",
        started_at: new Date().toISOString(),
        title: `Latency issue on ${provider.name}`,
        description: `${provider.name} is experiencing higher than normal latency`
      }));
    }
    
    console.log("Unexpected API response format:", data);
    return [];
  } catch (error) {
    console.error("Error fetching service events:", error);
    return [];
  }
};
