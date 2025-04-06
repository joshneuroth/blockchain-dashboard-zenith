
import React from 'react';
import { Server, Info } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudLatencyConnection from './CloudLatencyConnection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CloudLatencyTableDisplayProps {
  sortedData: CloudLatencyData[];
  getLatencyColor: (time: number | undefined) => string;
  formatLatency: (time: number | undefined) => string;
}

const CloudLatencyTableDisplay: React.FC<CloudLatencyTableDisplayProps> = ({
  sortedData,
  getLatencyColor,
  formatLatency
}) => {
  if (sortedData.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-4">
          <p className="text-muted-foreground">No results match your filter criteria.</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {sortedData.map((item, index) => {
        // Determine if this is a high latency connection
        const isHighLatency = item.p50_latency !== undefined && item.p50_latency > 200;
        
        return (
          <TableRow key={`${item.provider || 'unknown'}-${index}`}>
            <TableCell>
              {item.origin?.region || 'Global'}
            </TableCell>
            <TableCell className="p-0">
              <CloudLatencyConnection isHighLatency={isHighLatency} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Server size={16} />
                <span>{item.provider || 'Unknown provider'}</span>
              </div>
            </TableCell>
            <TableCell>
              {item.method || 'eth_blockNumber'}
            </TableCell>
            <TableCell className={getLatencyColor(item.p50_latency)}>
              <div className="flex items-center gap-1">
                {formatLatency(item.p50_latency)}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sample size: {item.sample_size || 'N/A'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
            <TableCell className={getLatencyColor(item.p90_latency)}>
              <div className="flex items-center gap-1">
                {formatLatency(item.p90_latency)}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sample size: {item.sample_size || 'N/A'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default CloudLatencyTableDisplay;
