
import { useQuery } from "@tanstack/react-query";

export interface LeaderboardProvider {
  provider: string;
  network: string;
  timeliness: number;
  latency: number;
  reliability: number;
  uptime: number;
}

export interface LeaderboardResponse {
  providers: LeaderboardProvider[];
  last_updated: string;
}

const fetchLeaderboardData = async (): Promise<LeaderboardResponse> => {
  const response = await fetch("https://blockheight-api.fly.dev/internal/leaderboard/v1");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
  }
  
  const rawData = await response.json();
  
  // Transform the API response into our expected format
  const providers: LeaderboardProvider[] = [];
  const now = new Date().toISOString();
  
  // Process each chain in the response
  Object.entries(rawData.chains || {}).forEach(([chainId, chainData]: [string, any]) => {
    const network = chainData.network;
    
    // Process timeliness data
    if (chainData.leaderboards?.timeliness) {
      chainData.leaderboards.timeliness.forEach((item: any) => {
        providers.push({
          provider: item.provider_name,
          network,
          timeliness: item.at_block_height_percentage,
          latency: 0, // Will be updated for providers that have latency data
          reliability: item.total_at_tip / item.total_checks * 100,
          uptime: 100, // Default value
        });
      });
    }
    
    // Process latency data for New York region
    if (chainData.leaderboards?.latency?.regions?.["New York"]?.average_p50) {
      chainData.leaderboards.latency.regions["New York"].average_p50.forEach((item: any) => {
        // Find if provider already exists from timeliness data
        const existingProvider = providers.find(
          p => p.provider === item.provider_name && p.network === network
        );
        
        if (existingProvider) {
          // Update latency for existing provider
          existingProvider.latency = item.avg_p50_latency_ms;
        } else {
          // Add new provider with latency data
          providers.push({
            provider: item.provider_name,
            network,
            timeliness: 0, // Not in timeliness data
            latency: item.avg_p50_latency_ms,
            reliability: 0,
            uptime: 100, // Default value
          });
        }
      });
    }
  });
  
  return {
    providers,
    last_updated: now
  };
};

export function useLeaderboardData() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });
}
