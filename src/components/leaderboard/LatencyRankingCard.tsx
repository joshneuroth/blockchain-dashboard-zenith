
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink } from 'lucide-react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { useLatencyRankingFilters } from '@/hooks/useLatencyRankingFilters';
import LatencyFilterControls from './LatencyFilterControls';
import LatencyRankingTable from './LatencyRankingTable';

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
    availableNetworks,
    availableRegions,
    filteredProviders,
    handleNetworkChange,
    handleRegionChange
  } = useLatencyRankingFilters(providers);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">Loading latency data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-red-500">Error loading latency data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Zap size={20} />
          Provider Latency Ranking
        </CardTitle>
        <LatencyFilterControls
          selectedNetwork={selectedNetwork}
          selectedRegion={selectedRegion}
          availableNetworks={availableNetworks}
          availableRegions={availableRegions}
          onNetworkChange={handleNetworkChange}
          onRegionChange={handleRegionChange}
        />
      </CardHeader>
      <CardContent>
        <LatencyRankingTable 
          providers={filteredProviders}
          selectedNetwork={selectedNetwork}
          selectedRegion={selectedRegion}
        />
      </CardContent>
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
