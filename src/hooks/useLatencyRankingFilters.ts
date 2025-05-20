
import { useState, useMemo } from 'react';
import { ProviderData } from '@/hooks/useLeaderboardData';

export type TimePeriod = '24h' | '7d' | '30d' | 'all';

export function useLatencyRankingFilters(providers: ProviderData[]) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Ethereum");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("24h");
  
  const availableNetworks = useMemo(() => {
    if (!providers || providers.length === 0) return ["Ethereum"];
    
    // Since we're using the new API, we'll just return Ethereum for now
    return ["Ethereum"];
  }, [providers]);

  const availableRegions = useMemo(() => {
    if (!providers || providers.length === 0) return ["All Regions"];
    
    // Get unique regions from all providers' latency by_region data
    const regions = new Set(["All Regions"]);
    providers.forEach(provider => {
      provider.latency.by_region.forEach(regionData => {
        if (regionData.region) {
          regions.add(regionData.region);
        }
      });
    });
    
    return Array.from(regions);
  }, [providers]);

  const availablePeriods: TimePeriod[] = ["24h", "7d", "30d", "all"];

  const filteredProviders = useMemo(() => {
    if (!providers || providers.length === 0) return [];
    
    return [...providers]
      .filter(provider => {
        // For region filtering
        if (selectedRegion === "All Regions") {
          return true;
        }
        
        // Check if provider has data for the selected region
        return provider.latency.by_region.some(
          regionData => regionData.region === selectedRegion
        );
      })
      .sort((a, b) => {
        // Sort by overall latency ranking
        return a.latency.overall.rank - b.latency.overall.rank;
      });
  }, [providers, selectedRegion]);

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    setSelectedRegion("All Regions");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  return {
    selectedNetwork,
    selectedRegion,
    selectedPeriod,
    availableNetworks,
    availableRegions,
    availablePeriods,
    filteredProviders,
    handleNetworkChange,
    handleRegionChange,
    handlePeriodChange
  };
}
