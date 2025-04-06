
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Server } from 'lucide-react';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data }) => {
  // Log data received to help with debugging
  console.log(`CloudLatencyTable received ${data.length} items`);
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No cloud latency data available.</p>
      </div>
    );
  }

  // Sort providers by p50 latency (fastest first)
  const sortedData = [...data].sort((a, b) => a.p50_latency - b.p50_latency);

  // Get origin location information from the first item
  const firstItem = sortedData[0];
  const locationName = firstItem?.origin?.city || firstItem?.origin?.region || "Global";
  const locationCountry = firstItem?.origin?.country || "";
  const locationDisplay = locationCountry ? `${locationName}, ${locationCountry}` : locationName;

  // Get color class based on response time
  const getLatencyColor = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "text-gray-500";
    if (time < 100) return "text-green-600 dark:text-green-400";
    if (time < 300) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format number with ms suffix
  const formatLatency = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "N/A";
    return `${time.toFixed(2)} ms`;
  };

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from {locationDisplay} to blockchain RPCs. Data collected over the last 7 days.
      </p>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">{locationDisplay}</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>P50 Latency</TableHead>
              <TableHead>P90 Latency</TableHead>
              <TableHead>Sample Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={`${item.provider}-${index}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Server size={16} />
                    <span>{item.provider}</span>
                  </div>
                </TableCell>
                <TableCell className={getLatencyColor(item.p50_latency)}>
                  {formatLatency(item.p50_latency)}
                </TableCell>
                <TableCell className={getLatencyColor(item.p90_latency)}>
                  {formatLatency(item.p90_latency)}
                </TableCell>
                <TableCell>
                  {item.sample_size}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CloudLatencyTable;
