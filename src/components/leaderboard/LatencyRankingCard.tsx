
import React from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink } from 'lucide-react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { useLatencyRankingFilters } from '@/hooks/useLatencyRankingFilters';
import LatencyInfoBox from './LatencyInfoBox';
import LatencyTableSection from './LatencyTableSection';
import LatencyLoadingState from './LatencyLoadingState';
import LatencyErrorState from './LatencyErrorState';

interface LatencyRankingCardProps {
  providers: LeaderboardProvider[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

const LatencyRankingCard: React.FC<LatencyRankingCardProps> = ({ 
  providers,
  isLoading,
  error,
  lastUpdated
}) => {
  const {
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
  } = useLatencyRankingFilters(providers);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <LatencyLoadingState />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <LatencyErrorState error={error} />
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Zap size={20} />
          Provider Latency Ranking
        </CardTitle>
        <LatencyInfoBox />
      </CardHeader>
      
      <LatencyTableSection 
        selectedNetwork={selectedNetwork}
        selectedRegion={selectedRegion}
        selectedPeriod={selectedPeriod}
        availableNetworks={availableNetworks}
        availableRegions={availableRegions}
        availablePeriods={availablePeriods}
        filteredProviders={filteredProviders}
        handleNetworkChange={handleNetworkChange}
        handleRegionChange={handleRegionChange}
        handlePeriodChange={handlePeriodChange}
      />
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {lastUpdated ? `Last updated: ${formatDate(lastUpdated)}` : 'Data freshness unknown'}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.open('https://blockheight-api.fly.dev/docs', '_blank')}
        >
          <ExternalLink size={14} />
          API Docs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LatencyRankingCard;
