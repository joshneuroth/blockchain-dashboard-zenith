
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import { Cloud, AlertCircle, Loader2, ExternalLink, Info, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import CloudLatencyConnections from './CloudLatencyConnections';
import CloudLatencyTable from './CloudLatencyTable';
import CloudLatencyFilter from './CloudLatencyFilter';

interface CloudLatencyCardProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkId, networkName }) => {
  const { data, isLoading, error, rawApiResponse } = useCloudLatency(networkId);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
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
            
            {rawApiResponse && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
                <div className="flex items-center mb-2">
                  <Bug size={16} className="mr-2" />
                  <span className="font-medium">Raw API Response (Debug):</span>
                </div>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(rawApiResponse, null, 2)}
                </pre>
              </div>
            )}
            
            <p className="text-sm mt-2 text-muted-foreground">
              We're constantly adding more networks and data. Check back later for updates.
            </p>
          </div>
        ) : (
          <>
            <CloudLatencyFilter 
              data={data} 
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
            />
            
            <CloudLatencyTable 
              data={data}
              filterMethod={selectedMethod}
            />
            
            <div className="mt-6">
              <CloudLatencyConnections 
                data={data} 
                networkName={networkName}
              />
            </div>
            
            {/* Debug section */}
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="flex items-center mb-2">
                <Bug size={16} className="mr-2" />
                <span className="font-medium">Debug Information:</span>
              </div>
              <p className="text-xs">Network ID: {networkId}</p>
              <p className="text-xs">Data items: {data.length}</p>
              <p className="text-xs">First provider: {data[0]?.provider}</p>
              <p className="text-xs">First method: {data[0]?.method || 'N/A'}</p>
              <p className="text-xs">Selected filter: {selectedMethod || 'None'}</p>
            </div>
          </>
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
