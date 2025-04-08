
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';

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
  // Sort providers by timeliness (higher is better)
  const sortedProviders = React.useMemo(() => {
    return [...(providers || [])].sort((a, b) => b.timeliness - a.timeliness);
  }, [providers]);

  // Get timeliness ranking color
  const getTimelinessColor = (score: number) => {
    if (score >= 95) return "bg-green-500 text-white";
    if (score >= 85) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">Loading timeliness data...</p>
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
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-red-500">Error loading timeliness data: {error.message}</p>
          </div>
        </CardContent>
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="text-right">Timeliness Score</TableHead>
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
                  <Badge className={getTimelinessColor(provider.timeliness)}>
                    {provider.timeliness.toFixed(1)}%
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

export default TimelinessRankingCard;
