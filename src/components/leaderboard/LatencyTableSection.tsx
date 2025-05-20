
import React from 'react';
import { CardContent } from '@/components/ui/card';
import LatencyFilterControls from './LatencyFilterControls';
import LatencyRankingTable from './LatencyRankingTable';
import LatencyEmptyState from './LatencyEmptyState';
import { ProviderData } from '@/hooks/useLeaderboardData';
import { TimePeriod } from '@/hooks/useLatencyRankingFilters';

interface LatencyTableSectionProps {
  selectedNetwork: string;
  selectedRegion: string;
  selectedPeriod: TimePeriod;
  availableNetworks: string[];
  availableRegions: string[];
  availablePeriods: TimePeriod[];
  filteredProviders: ProviderData[];
  handleNetworkChange: (network: string) => void;
  handleRegionChange: (region: string) => void;
  handlePeriodChange: (period: TimePeriod) => void;
}

const LatencyTableSection: React.FC<LatencyTableSectionProps> = ({
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
}) => {
  return (
    <CardContent>
      <div className="mb-4">
        <LatencyFilterControls
          selectedNetwork={selectedNetwork}
          selectedRegion={selectedRegion}
          selectedPeriod={selectedPeriod}
          availableNetworks={availableNetworks}
          availableRegions={availableRegions}
          availablePeriods={availablePeriods}
          onNetworkChange={handleNetworkChange}
          onRegionChange={handleRegionChange}
          onPeriodChange={handlePeriodChange}
        />
      </div>
      
      {filteredProviders.length > 0 ? (
        <LatencyRankingTable 
          providers={filteredProviders}
          selectedNetwork={selectedNetwork}
          selectedRegion={selectedRegion}
          selectedPeriod={selectedPeriod}
        />
      ) : (
        <LatencyEmptyState 
          selectedNetwork={selectedNetwork}
          selectedRegion={selectedRegion}
          selectedPeriod={selectedPeriod}
        />
      )}
    </CardContent>
  );
};

export default LatencyTableSection;
