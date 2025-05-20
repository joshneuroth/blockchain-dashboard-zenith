
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LatencyTable from './LatencyTable';
import ReliabilityTable from './ReliabilityTable';
import BlockheightTable from './BlockheightTable';
import { ProviderData } from '@/hooks/useLeaderboardData';

interface LeaderboardCardProps {
  providers: ProviderData[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  providers,
  isLoading,
  error,
  lastUpdated
}) => {
  // Extract data for different tabs
  const latencyData = providers?.map(p => p.latency.overall) || [];
  const reliabilityData = providers?.map(p => p.reliability) || [];
  const blockheightData = providers?.map(p => p.blockheight_accuracy) || [];
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString();
  };
  
  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-lg font-medium text-red-500 mb-2">Failed to load leaderboard data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("Provider data:", providers);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">
          Ethereum Provider Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="latency" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="reliability">Reliability</TabsTrigger>
            <TabsTrigger value="blockheight">Blockheight</TabsTrigger>
          </TabsList>
          <TabsContent value="latency" className="pt-2">
            <LatencyTable providers={latencyData} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="reliability" className="pt-2">
            <ReliabilityTable providers={reliabilityData} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="blockheight" className="pt-2">
            <BlockheightTable providers={blockheightData} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(lastUpdated)}
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

export default LeaderboardCard;
