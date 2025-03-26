
import React from 'react';
import { Computer, Server, RefreshCw, AlertCircle, Zap, Clock, Ban, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLatencyTest } from '@/hooks/blockchain/useLatencyTest';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

interface LatencyTestProps {
  networkId: string;
  networkName: string;
}

const LatencyTest: React.FC<LatencyTestProps> = ({ networkId, networkName }) => {
  const { results, isRunning, userLocation, runLatencyTest, hasRun } = useLatencyTest(networkId);
  
  // Format latency display
  const formatLatency = (latency: number | null, status: string, errorMessage?: string, errorType?: string) => {
    if (status === 'loading') return <Skeleton className="h-6 w-16" />;
    if (status === 'error' || latency === null) {
      // Get the appropriate icon based on error type
      const getErrorIcon = () => {
        switch(errorType) {
          case 'timeout':
            return <Clock size={14} className="mr-1" />;
          case 'rate-limit':
            return <Ban size={14} className="mr-1" />;
          case 'connection':
            return <ExternalLink size={14} className="mr-1" />;
          case 'rpc-error':
            return <AlertTriangle size={14} className="mr-1" />;
          default:
            return <AlertCircle size={14} className="mr-1" />;
        }
      };
      
      const shortErrorMessage = 
        errorType === 'timeout' ? 'Timeout' :
        errorType === 'rate-limit' ? 'Rate Limited' :
        errorType === 'connection' ? 'Unreachable' :
        errorType === 'rpc-error' ? 'RPC Error' :
        'Failed';
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-red-500">
                {getErrorIcon()}
                <span>Failed: {shortErrorMessage}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{errorMessage || 'Connection failed'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span className="font-medium">{latency} ms</span>;
  };

  // Get color class based on latency
  const getLatencyColorClass = (latency: number | null, status: string) => {
    if (status === 'loading') return "bg-gray-200 dark:bg-gray-700";
    if (status === 'error' || latency === null) return "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    if (latency < 100) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (latency < 300) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  if (!hasRun) {
    return (
      <Card className="glass-card mb-6 animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Zap size={48} className="mb-4 opacity-70" />
          <h3 className="text-xl font-medium mb-2">Measure RPC Latency</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Test the connection speed between your browser and {networkName} RPC endpoints.
          </p>
          <Button 
            onClick={runLatencyTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={isRunning ? "animate-spin" : ""} />
            Run Latency Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Your Browser To {networkName} RPCs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => runLatencyTest()}
          disabled={isRunning}
        >
          <RefreshCw size={16} className={isRunning ? "animate-spin" : ""} />
          <span>{isRunning ? "Running..." : "Refresh"}</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        This test measures the latency between your browser and the RPC endpoints. Lower values are better.
      </div>
      
      <div className="relative my-8">
        {/* User location box */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm z-10">
          <div className="text-xs text-gray-500 mb-1">Your Location</div>
          <div className="flex items-center gap-2">
            <Computer size={16} />
            <span className="text-sm font-medium">{userLocation || 'Detecting...'}</span>
          </div>
        </div>
        
        {/* Connection lines and results */}
        <div className="ml-[180px] space-y-6">
          {results.map((result, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0 h-px w-32 bg-blue-400"></div>
              
              {/* Latency box */}
              <div className={`px-3 py-1 rounded-md text-sm ${getLatencyColorClass(result.latency, result.status)}`}>
                {formatLatency(result.latency, result.status, result.errorMessage, result.errorType)}
              </div>
              
              <div className="flex-shrink-0 h-px w-4 bg-blue-400"></div>
              
              {/* Server box */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Provider</div>
                <div className="flex items-center gap-2">
                  <Server size={16} />
                  <span className="text-sm font-medium">{result.provider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatencyTest;
