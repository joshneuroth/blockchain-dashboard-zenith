
import { useState, useMemo } from 'react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';

export function useLatencyRankingFilters(providers: LeaderboardProvider[]) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Ethereum");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  
  const availableNetworks = useMemo(() => {
    if (!providers || providers.length === 0) return ["Ethereum"];
    
    const networks = [...new Set(providers.map(provider => provider.network))];
    return networks.length > 0 ? networks : ["Ethereum"];
  }, [providers]);

  const availableRegions = useMemo(() => {
    if (!providers || providers.length === 0) return ["All Regions"];
    
    const regions = ["All Regions", ...new Set(providers
      .filter(provider => provider.network === selectedNetwork && provider.region)
      .map(provider => provider.region as string))];
    
    return regions;
  }, [providers, selectedNetwork]);

  const filteredProviders = useMemo(() => {
    return [...(providers || [])]
      .filter(provider => 
        provider.latency > 0 && 
        provider.network === selectedNetwork &&
        (selectedRegion === "All Regions" || provider.region === selectedRegion)
      )
      .sort((a, b) => a.latency - b.latency);
  }, [providers, selectedNetwork, selectedRegion]);

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    setSelectedRegion("All Regions");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  return {
    selectedNetwork,
    selectedRegion,
    availableNetworks,
    availableRegions,
    filteredProviders,
    handleNetworkChange,
    handleRegionChange
  };
}
