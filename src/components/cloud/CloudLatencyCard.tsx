
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import CloudLatencyConnections from './CloudLatencyConnections';
import { Cloud, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CloudLatencyCardProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkId, networkName }) => {
  const { data, isLoading, error } = useCloudLatency(networkId);
  const [retrying, setRetrying] = useState<boolean>(false);

  // Auto retry once if there's an error
  useEffect(() => {
    if (error && !retrying && data.length === 0) {
      setRetrying(true);
      
      // Wait 2 seconds and try again
      const timer = setTimeout(() => {
        // This will trigger the useEffect in useCloudLatency
        const refetch = async () => {
          try {
            const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(10000)
            });
            
            if (response.ok) {
              const cloudData = await response.json();
              console.log('Retry successful, received', cloudData.length, 'records');
            }
          } catch (err) {
            console.error('Retry attempt failed:', err);
          }
        };
        
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, data, retrying]);

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Cloud Latency
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cloud latency data...</span>
          </div>
        ) : error && data.length === 0 ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading cloud latency data: {error}
              {retrying && <span className="block mt-2">Retrying...</span>}
            </AlertDescription>
          </Alert>
        ) : (
          <CloudLatencyConnections data={data} networkName={networkName} />
        )}
      </CardContent>
    </Card>
  );
};

export default CloudLatencyCard;
