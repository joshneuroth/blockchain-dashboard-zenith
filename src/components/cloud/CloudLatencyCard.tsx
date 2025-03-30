
import React, { useState, useEffect } from 'react';
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
  const { data, isLoading, error } = useCloudLatency(networkId);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // Auto retry logic with progressive backoff
  useEffect(() => {
    if (error && !retrying && data.length === 0 && retryCount < MAX_RETRIES) {
      setRetrying(true);
      
      // Exponential backoff: 2s, 4s, 8s
      const backoffTime = Math.pow(2, retryCount + 1) * 1000;
      
      console.log(`Scheduling retry ${retryCount + 1}/${MAX_RETRIES} in ${backoffTime}ms`);
      
      const timer = setTimeout(() => {
        // This will trigger a new fetch by accessing the API directly
        const refetch = async () => {
          try {
            console.log(`Retry attempt ${retryCount + 1} started`);
            const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
              headers: { 
                'Accept': 'application/json',
                'Cache-Control': 'no-cache' 
              },
              signal: AbortSignal.timeout(15000) // Extended timeout
            });
            
            if (response.ok) {
              const cloudData = await response.json();
              console.log('Retry successful, received', cloudData.length, 'records');
              
              // Only update count after success, so we preserve retry attempts for actual failures
              setRetryCount(prevCount => prevCount + 1);
              setRetrying(false);
            } else {
              throw new Error(`HTTP error ${response.status}`);
            }
          } catch (err) {
            console.error('Retry attempt failed:', err);
            setRetryCount(prevCount => prevCount + 1);
            setRetrying(false);
          }
        };
        
        refetch();
      }, backoffTime);
      
      return () => clearTimeout(timer);
    }
  }, [error, data, retrying, retryCount]);

  // Manual retry handler
  const handleManualRetry = () => {
    setRetryCount(0); // Reset retry count for manual retries
    setRetrying(true);
    
    // Force the browser to reload the data
    const refetch = async () => {
      try {
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
          headers: { 
            'Accept': 'application/json', 
            'Cache-Control': 'no-cache', 
            'Pragma': 'no-cache' 
          },
          signal: AbortSignal.timeout(15000)
        });
        
        if (response.ok) {
          const cloudData = await response.json();
          console.log('Manual retry successful, received', cloudData.length, 'records');
        }
      } catch (err) {
        console.error('Manual retry failed:', err);
      } finally {
        setRetrying(false);
      }
    };
    
    refetch();
  };

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
          <div>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading cloud latency data: {error}
                {retrying && <span className="block mt-2">Retrying... ({retryCount}/{MAX_RETRIES})</span>}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CloudOff className="h-16 w-16 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-center">
                We're having trouble connecting to the cloud latency service.
              </p>
              
              {retryCount >= MAX_RETRIES && (
                <Button 
                  onClick={handleManualRetry} 
                  variant="outline"
                  disabled={retrying}
                  className="flex items-center gap-2"
                >
                  {retrying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <CloudLatencyConnections data={data} networkName={networkName} />
        )}
      </CardContent>
    </Card>
  );
};

export default CloudLatencyCard;
