
import { useQuery } from "@tanstack/react-query";

export interface ProviderNetworkStatus {
  network: string;
  chain_id: number;
  status: {
    reported_blockheight: number;
    consensus_blockheight: number;
    blocks_behind: number;
    timeliness_score: number;
    is_at_tip: boolean;
    is_at_consensus: boolean;
    last_updated: string;
  };
}

export interface ProviderStatus {
  provider: string;
  networks: ProviderNetworkStatus[];
}

export const fetchProviderStatus = async (): Promise<ProviderStatus[]> => {
  try {
    const response = await fetch("https://blockheight-api.fly.dev/providers/status");
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching provider status:", error);
    throw error;
  }
};

export const useProviderStatus = () => {
  return useQuery({
    queryKey: ["providerStatus"],
    queryFn: fetchProviderStatus,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};
