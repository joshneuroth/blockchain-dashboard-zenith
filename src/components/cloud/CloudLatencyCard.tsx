
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import { Cloud, AlertCircle, Loader2 } from 'lucide-react';

interface CloudLatencyCardProps {
  networkId?: string;
  networkName?: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkName }) => {
  const { data, isLoading, error } = useCloudLatency();

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Raw Cloud Latency Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cloud latency data...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-destructive">Error loading cloud latency data: {error}</p>
            <p className="text-sm mt-2 text-muted-foreground">This may be due to network connectivity issues or CORS restrictions.</p>
          </div>
        ) : !data ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p>No cloud latency data available.</p>
            <p className="text-sm mt-2 text-muted-foreground">
              The API might not have data available at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <pre className="text-xs p-4 bg-gray-100 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CloudLatencyCard;
