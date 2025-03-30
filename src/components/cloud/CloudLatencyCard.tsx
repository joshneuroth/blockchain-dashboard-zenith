
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import CloudLatencyConnections from './CloudLatencyConnections';
import { Cloud, AlertCircle, Loader2, CloudOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CloudLatencyCardProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkId, networkName }) => {
  const { data, isLoading, error, refetch } = useCloudLatency(networkId);
  
  const handleRetry = () => {
    refetch();
  };

  return (
    <Card className="glass-card mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Cloud Latency
        </CardTitle>
        
        {(error || data.length === 0) && (
          <Button 
            onClick={handleRetry} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Retry
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cloud latency data...</span>
          </div>
        ) : error ? (
          <div>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading cloud latency data: {error instanceof Error ? error.message : String(error)}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CloudOff className="h-16 w-16 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-center">
                We're having trouble connecting to the cloud latency service.
              </p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <CloudOff className="h-16 w-16 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-center">No cloud latency data available.</p>
          </div>
        ) : (
          <CloudLatencyConnections data={data} networkName={networkName} />
        )}
      </CardContent>
    </Card>
  );
};

export default CloudLatencyCard;
