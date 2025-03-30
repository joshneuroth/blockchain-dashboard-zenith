
import React, { useEffect } from 'react';
import { useCloudLatency } from '@/hooks/blockchain/useCloudLatency';
import { formatTimeDiff } from '@/lib/api';
import { RefreshCw } from 'lucide-react';
import CloudLatencyHeader from './cloud-latency/CloudLatencyHeader';
import CloudLatencyConnections from './cloud-latency/CloudLatencyConnections';
import CloudLatencyLoading from './cloud-latency/CloudLatencyLoading';
import CloudMethodSelector from './cloud-latency/CloudMethodSelector';
import { useToast } from '@/hooks/use-toast';

interface CloudLatencyTestProps {
  networkId: string;
  networkName: string;
}

const CloudLatencyTest: React.FC<CloudLatencyTestProps> = ({ networkId, networkName }) => {
  const { 
    results, 
    availableMethods,
    selectedMethod,
    setSelectedMethod,
    isLoading, 
    error, 
    lastUpdated, 
    retry 
  } = useCloudLatency(networkId);
  const { toast } = useToast();
  
  const handleRefresh = () => {
    // Use the retry function instead of reloading the page
    retry();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest cloud latency information...",
    });
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    toast({
      title: "Method Changed",
      description: `Now showing data for ${method} method.`,
    });
  };
  
  // Move the useEffect outside of the conditional rendering
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch cloud latency data. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const formattedLastUpdated = lastUpdated ? 
    formatTimeDiff(Math.floor((Date.now() - lastUpdated.getTime()) / 1000)) : 
    null;
  
  if (isLoading) {
    return <CloudLatencyLoading networkName={networkName} />;
  }
  
  if (error) {
    return (
      <div className="glass-card p-6 mb-6 animate-fade-in">
        <h2 className="text-xl font-medium mb-4">Cloud Region to {networkName} RPCs</h2>
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
          <p>Error loading cloud latency data: {error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-800/30 rounded flex items-center gap-1"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <CloudLatencyHeader 
        networkName={networkName} 
        onRefresh={handleRefresh}
        lastUpdated={formattedLastUpdated}
      />
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>This test measures the latency between a cloud region and the {networkName} RPC endpoints.</p>
        </div>
        
        {availableMethods.length > 0 && (
          <CloudMethodSelector
            methods={availableMethods}
            selectedMethod={selectedMethod}
            onSelectMethod={handleMethodChange}
          />
        )}
      </div>
      
      <CloudLatencyConnections results={results} />
    </div>
  );
};

export default CloudLatencyTest;
