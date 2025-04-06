
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import { Cloud, AlertCircle, Loader2, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import CloudLatencyConnections from './CloudLatencyConnections';

interface CloudLatencyCardProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkId, networkName }) => {
  const { data, isLoading, error } = useCloudLatency(networkId);
  
  console.log(`CloudLatencyCard for network: ${networkId}, name: ${networkName}`);
  console.log(`Data state: isLoading=${isLoading}, hasError=${!!error}, dataItems=${data?.length || 0}`);

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Global Cloud Latency Data for {networkName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cloud latency data...</span>
          </div>
        ) : error ? (
          <div className="py-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading cloud latency data</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2 text-xs">
                  Network ID: {networkId}
                </div>
              </AlertDescription>
            </Alert>
            <p className="text-sm mt-2 text-muted-foreground">
              This may be due to network connectivity issues or API changes. The API expects numeric IDs for networks (e.g., "1" for Ethereum).
            </p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-6">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>No data available</AlertTitle>
              <AlertDescription>
                No cloud latency data available for {networkName} (ID: {networkId}).
                <div className="mt-2 text-xs">
                  The API might not have data for this network yet.
                </div>
              </AlertDescription>
            </Alert>
            <p className="text-sm mt-2 text-muted-foreground">
              We're constantly adding more networks and data. Check back later for updates.
            </p>
          </div>
        ) : (
          <CloudLatencyConnections 
            data={data} 
            networkName={networkName}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Data sourced from global cloud providers measuring RPC performance
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

export default CloudLatencyCard;
