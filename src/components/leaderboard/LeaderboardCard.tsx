
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LatencyTable from './LatencyTable';
import ReliabilityTable from './ReliabilityTable';
import BlockheightTable from './BlockheightTable';
import { ProviderData } from '@/hooks/useLeaderboardData';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardCardProps {
  providers: ProviderData[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
  timeRange?: {
    start: string;
    end: string;
  };
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  providers,
  isLoading,
  error,
  lastUpdated,
  timeRange
}) => {
  const { toast } = useToast();
  
  // Extract data for different tabs, ensuring we don't include null/undefined values
  const latencyData = providers?.filter(p => p && p.latency && p.latency.overall).map(p => p.latency.overall) || [];
  const reliabilityData = providers?.filter(p => p && p.reliability).map(p => p.reliability) || [];
  const blockheightData = providers?.filter(p => p && p.blockheight_accuracy).map(p => p.blockheight_accuracy) || [];
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      // Format to YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid date';
    }
  };
  
  // Show toast when there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-lg font-medium text-red-500 mb-2">Failed to load leaderboard data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("Provider data in LeaderboardCard:", providers);
  console.log("Latency data:", latencyData);
  console.log("Reliability data:", reliabilityData);
  console.log("Blockheight data:", blockheightData);

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
            <LatencyTable providers={latencyData} isLoading={isLoading} providerData={providers} />
          </TabsContent>
          <TabsContent value="reliability" className="pt-2">
            <ReliabilityTable providers={reliabilityData} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="blockheight" className="pt-2">
            <BlockheightTable providers={blockheightData} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between w-full gap-2">
        <div className="text-sm text-muted-foreground">
          <p>Last updated: {formatDate(lastUpdated)}</p>
          {timeRange && (
            <p className="text-xs">
              Time range: {formatDate(timeRange.start)} - {formatDate(timeRange.end)}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.open('https://docs.blockheight.xyz/', '_blank')}
        >
          <ExternalLink size={14} />
          API Docs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeaderboardCard;
