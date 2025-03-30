
import React, { useState } from 'react';
import { useCloudLatencyTest } from '@/hooks/blockchain/useCloudLatencyTest';
import { useToast } from '@/hooks/use-toast';
import { formatTimeDiff } from '@/lib/api';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CloudLatencyConnections from './CloudLatencyConnections';
import CloudRegionBox from './CloudRegionBox';
import LastUpdatedInfo from '../latency/LastUpdatedInfo';

interface CloudLatencyTestProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyTest: React.FC<CloudLatencyTestProps> = ({ networkId, networkName }) => {
  const { results, isLoading, error, lastUpdated, refetch } = useCloudLatencyTest(networkId);
  const [formattedLastUpdated, setFormattedLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  // Update the formatted last updated time
  React.useEffect(() => {
    if (lastUpdated) {
      const secondsAgo = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      setFormattedLastUpdated(formatTimeDiff(secondsAgo));
    }
  }, [lastUpdated]);

  // Show toast when there's an API error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "API Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading && results.length === 0) {
    return (
      <Card className="glass-card mb-6 animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <RefreshCw size={48} className="mb-4 opacity-70 animate-spin" />
          <h3 className="text-xl font-medium mb-2">Loading Cloud Latency Data...</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Fetching latency data between cloud regions and {networkName} RPC endpoints.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Cloud Region to {networkName} RPCs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
        <div>
          <p>This test measures the latency between a cloud region or server and the RPC endpoints.</p>
        </div>
        <LastUpdatedInfo lastUpdated={formattedLastUpdated} />
      </div>
      
      <div className="relative my-8">
        <CloudRegionBox />
        <div className="ml-[220px] space-y-6">
          {results.map((result, index) => (
            <CloudLatencyConnections key={index} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudLatencyTest;
