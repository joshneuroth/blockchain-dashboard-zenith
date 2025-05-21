
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

export type TimePeriod = 'month' | 'week' | 'day';

const fetchLeaderboardData = async (timePeriod: TimePeriod): Promise<LeaderboardResponse> => {
  // Using the API endpoint with API key and time period parameter
  const response = await fetch(`https://api.internal.blockheight.xyz/leaderboard/ethereum?api_key=bh_a7c63f38-5757-4250-88cd-8d1f842a7142&time_period=${timePeriod}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
  }
  
  const data = await response.json();
  console.log("API Response:", data);
  
  // Create a mock response structure if the API does not return the expected format
  const mockData: LeaderboardResponse = {
    network: "ethereum",
    chain_id: "1",
    time_period: timePeriod,
    time_range: {
      start: new Date(Date.now() - getTimePeriodInMs(timePeriod)).toISOString(),
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

const getTimePeriodInMs = (timePeriod: TimePeriod): number => {
  switch (timePeriod) {
    case 'day':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
};

export function useLeaderboardData(timePeriod: TimePeriod = 'month') {
  return useQuery({
    queryKey: ["leaderboard", timePeriod],
    queryFn: () => fetchLeaderboardData(timePeriod),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    retry: 2, // Retry failed requests 2 times
  });
}
