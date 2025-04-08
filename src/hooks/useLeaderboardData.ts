
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
  
  return response.json();
};

export function useLeaderboardData() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });
}
