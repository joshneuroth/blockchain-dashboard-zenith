
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Zap, Award, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { Skeleton } from '@/components/ui/skeleton';

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
  // Log props for debugging
  React.useEffect(() => {
    console.log("LatencyRankingCard Props:", { providers, isLoading, error, lastUpdated });
  }, [providers, isLoading, error, lastUpdated]);

  // Sort providers by latency (lower is better)
  const sortedProviders = React.useMemo(() => {
    return [...(providers || [])].sort((a, b) => a.latency - b.latency);
  }, [providers]);

  // Get latency ranking color
  const getLatencyColor = (latency: number) => {
    if (latency <= 200) return "bg-green-500 text-white";
    if (latency <= 500) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
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
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-red-200">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="text-red-500" size={32} />
            <p className="text-red-500 text-center">Error loading latency data</p>
            <p className="text-sm text-gray-500 text-center max-w-md">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if providers array is empty
  if (!providers || providers.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex flex-col items-center justify-center gap-2">
            <p className="text-gray-500">No provider data available</p>
          </div>
        </CardContent>
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="text-right">Latency (ms)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProviders.map((provider, index) => (
              <TableRow key={`${provider.provider}-${provider.network}`}>
                <TableCell className="font-mono">
                  {index === 0 ? (
                    <div className="flex items-center justify-center">
                      <Award className="text-yellow-500" size={18} />
                    </div>
                  ) : (
                    <div className="text-center">{index + 1}</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{provider.provider}</TableCell>
                <TableCell>{provider.network}</TableCell>
                <TableCell className="text-right">
                  <Badge className={getLatencyColor(provider.latency)}>
                    {provider.latency.toFixed(1)} ms
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
