
import React, { useEffect, useState } from 'react';
import { useLatencyTest } from '@/hooks/blockchain/useLatencyTest';
import { useToast } from '@/hooks/use-toast';
import { formatTimeDiff } from '@/lib/api';

// Import our new components
import LatencyLoading from './latency/LatencyLoading';
import LatencyHeader from './latency/LatencyHeader';
import LatencyConnections from './latency/LatencyConnections';
import LastUpdatedInfo from './latency/LastUpdatedInfo';

interface LatencyTestProps {
  networkId: string;
  networkName: string;
}

const LatencyTest: React.FC<LatencyTestProps> = ({ networkId, networkName }) => {
  const { results, isRunning, geoInfo, runLatencyTest, hasRun, saveError } = useLatencyTest(networkId);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Auto-run the latency test when the component mounts if we don't have results
  useEffect(() => {
    if (!hasRun && !isRunning) {
      runLatencyTest();
    }
  }, [hasRun, isRunning, runLatencyTest]);
  
  // Check when the latency data was last updated
  useEffect(() => {
    const storedData = localStorage.getItem(`latency-results-${networkId}`);
    if (storedData && hasRun) {
      try {
        const parsedData = JSON.parse(storedData);
        const timestamp = parsedData.timestamp;
        if (timestamp) {
          const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
          setLastUpdated(formatTimeDiff(secondsAgo));
        }
      } catch (e) {
        console.error('Error parsing timestamp:', e);
      }
    }
  }, [networkId, hasRun, results]);
  
  // Show toast when there's a save error
  useEffect(() => {
    if (saveError) {
      toast({
        title: "Database Save Error",
        description: saveError,
        variant: "destructive",
      });
    }
  }, [saveError, toast]);

  if (isRunning && !hasRun) {
    return <LatencyLoading networkName={networkName} />;
  }

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <LatencyHeader 
        networkName={networkName} 
        isRunning={isRunning} 
        onRefresh={runLatencyTest}
        saveError={saveError}
      />
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
        <div>
          <p>This test measures the latency between your browser and the RPC endpoints. P50 (median) values are shown when available.</p>
        </div>
        <LastUpdatedInfo lastUpdated={lastUpdated} isp={geoInfo.isp} />
      </div>
      
      <LatencyConnections results={results} geoInfo={geoInfo} />
    </div>
  );
};

export default LatencyTest;
