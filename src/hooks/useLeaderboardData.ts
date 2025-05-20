
import { useQuery } from "@tanstack/react-query";

export interface LatencyRegionData {
  provider_name: string;
  region: string;
  p50_latency_ms: number;
  p90_latency_ms: number;
  total_tests: number;
  rank: number;
  is_tied: boolean;
  tied_count: number;
}

export interface LatencyOverallData {
  provider_name: string;
  overall_p50_latency_ms: number;
  rank: number;
  is_tied: boolean;
  tied_count: number;
}

export interface ConsistencyData {
  provider_name: string;
  region: string;
  consistency_ratio: number;
  rank: number;
  is_tied: boolean;
  tied_count: number;
}

export interface HighLatencyEventsCount {
  provider_name: string;
  event_count: number;
  rank: number;
  is_tied?: boolean;
  tied_count?: number;
}

export interface HighLatencyEventsPercentage {
  provider_name: string;
  event_count: number;
  percentage: number;
  rank: number;
  is_tied: boolean;
  tied_count: number;
}

export interface BlockheightAccuracy {
  provider_name: string;
  ahead_count: number;
  at_count: number;
  behind_count: number;
  total_count: number;
  tip_accuracy_percentage: number;
  ahead_percentage: number;
  tip_rank: number;
  ahead_rank: number;
  rank: number;
  is_tied_tip_rank: boolean;
  tied_count_tip_rank: number;
  is_tied_ahead_rank: boolean;
  tied_count_ahead_rank: number;
}

export interface Reliability {
  provider_name: string;
  provider_error_count: number;
  total_tests: number;
  error_rate_percentage: number;
  rank: number;
  is_tied: boolean;
  tied_count: number;
}

export interface ProviderData {
  provider_name: string;
  latency: {
    by_region: LatencyRegionData[];
    overall: LatencyOverallData;
    consistency: ConsistencyData[];
  };
  high_latency_events: {
    count: HighLatencyEventsCount;
    percentage: HighLatencyEventsPercentage | null;
  };
  blockheight_accuracy: BlockheightAccuracy;
  reliability: Reliability;
}

export interface LeaderboardResponse {
  network: string;
  chain_id: string;
  time_period: string;
  time_range: {
    start: string;
    end: string;
  };
  provider_metrics: ProviderData[];
  last_updated?: string;
}

const fetchLeaderboardData = async (): Promise<LeaderboardResponse> => {
  // Using the correct API endpoint URL for provider leaderboard data
  const response = await fetch("https://blockheight-api.fly.dev/internal/leaderboard/v1");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
  }
  
  const data = await response.json();
  console.log("API Response:", data);
  
  // Create a mock response structure if the API does not return the expected format
  const mockData: LeaderboardResponse = {
    network: "ethereum",
    chain_id: "1",
    time_period: "24h",
    time_range: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    provider_metrics: [],
    last_updated: new Date().toISOString()
  };
  
  // Check if we have actual provider metrics data, otherwise use mock data
  return {
    ...(data.provider_metrics ? data : mockData),
    last_updated: new Date().toISOString()
  };
};

export function useLeaderboardData() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    retry: 2, // Retry failed requests 2 times
  });
}
