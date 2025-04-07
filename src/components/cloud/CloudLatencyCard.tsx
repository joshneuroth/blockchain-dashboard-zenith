
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import { Cloud, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CloudLatencyContent from './CloudLatencyContent';

interface CloudLatencyCardProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkId, networkName }) => {
  const { data, isLoading, error, rawApiResponse } = useCloudLatency(networkId);
  
  console.log(`CloudLatencyCard for network: ${networkId}, name: ${networkName}`);
  console.log(`Data state: isLoading=${isLoading}, hasError=${!!error}, dataItems=${data?.length || 0}`);

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Global Latency Data for {networkName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CloudLatencyContent 
          isLoading={isLoading}
          error={error}
          data={data}
          networkId={networkId}
          networkName={networkName}
          rawApiResponse={rawApiResponse}
        />
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
