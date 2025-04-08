
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import TimelinessInfoBox from './TimelinessInfoBox';
import TimelinessFilterControls from './TimelinessFilterControls';
import TimelinessTable from './TimelinessTable';
import TimelinessEmptyState from './TimelinessEmptyState';
import TimelinessLoadingState from './TimelinessLoadingState';
import TimelinessErrorState from './TimelinessErrorState';

interface TimelinessRankingCardProps {
  providers: LeaderboardProvider[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

const TimelinessRankingCard: React.FC<TimelinessRankingCardProps> = ({ 
  providers,
  isLoading,
  error,
  lastUpdated
}) => {
  // State for filters
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Extract unique networks from providers
  const networks = useMemo(() => {
    const uniqueNetworks = [...new Set(providers.map(provider => provider.network))];
    return ["all", ...uniqueNetworks].filter(Boolean);
  }, [providers]);

  // Sort and filter providers by timeliness (higher is better) and filter by selected network
  const filteredProviders = useMemo(() => {
    return [...(providers || [])]
      .filter(provider => provider.timeliness > 0)
      .filter(provider => selectedNetwork === "all" || provider.network === selectedNetwork)
      .sort((a, b) => b.timeliness - a.timeliness);
  }, [providers, selectedNetwork]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <TimelinessLoadingState />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <TimelinessErrorState error={error} />
      </Card>
    );
  }

  if (filteredProviders.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
          <TimelinessInfoBox />
          <TimelinessFilterControls
            networks={networks}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </CardHeader>
        <TimelinessEmptyState />
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Clock size={20} />
          Provider Timeliness Ranking
        </CardTitle>
        <TimelinessInfoBox />
        
        <TimelinessFilterControls
          networks={networks}
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </CardHeader>
      <CardContent>
        <TimelinessTable providers={filteredProviders} />
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

export default TimelinessRankingCard;
