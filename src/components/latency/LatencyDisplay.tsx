
import React from 'react';
import { Clock, Ban, ExternalLink, AlertTriangle, AlertCircle, BarChart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { LatencyResult } from '@/hooks/blockchain/useLatencyTest';

interface LatencyDisplayProps {
  result: LatencyResult;
}

export const LatencyDisplay: React.FC<LatencyDisplayProps> = ({ result }) => {
  const { latency, medianLatency, samples, status, errorMessage, errorType } = result;
  
  if (status === 'loading') return <Skeleton className="h-6 w-16" />;
  
  if (status === 'error' || (latency === null && medianLatency === null)) {
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
  
  const sampleCount = samples?.length || 0;
  
  if (sampleCount > 1 && medianLatency !== null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <span className="font-medium">{medianLatency} ms</span>
              <BarChart size={14} className="text-gray-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-medium mb-1">P50 (median) latency: {medianLatency} ms</p>
              <p>Latest reading: {latency} ms</p>
              <p>Based on {sampleCount} samples</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return <span className="font-medium">{latency} ms</span>;
};
