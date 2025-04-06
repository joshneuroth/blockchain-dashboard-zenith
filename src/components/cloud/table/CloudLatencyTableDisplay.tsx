
import React from 'react';
import { Server } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudLatencyConnection from './CloudLatencyConnection';

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
        <TableCell colSpan={6} className="text-center py-4">
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
            <TableCell className={getLatencyColor(item.p50_latency)}>
              {formatLatency(item.p50_latency)}
            </TableCell>
            <TableCell className={getLatencyColor(item.p90_latency)}>
              {formatLatency(item.p90_latency)}
            </TableCell>
            <TableCell>
              {item.sample_size || 'N/A'}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default CloudLatencyTableDisplay;
