
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Server, AlertTriangle } from 'lucide-react';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data }) => {
  // Log data received to help with debugging
  console.log(`CloudLatencyTable received ${data?.length || 0} items:`, data);
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 flex flex-col items-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
        <p>No cloud latency data available for this network.</p>
        <p className="text-sm text-muted-foreground mt-2">
          This may be because the network is not yet supported by our cloud metrics system.
        </p>
      </div>
    );
  }

  // Validate data objects before sorting
  const validData = data.filter(item => 
    item && typeof item === 'object' && item.p50_latency !== undefined && item.provider
  );
  
  console.log(`CloudLatencyTable found ${validData.length} valid data items`);
  
  if (validData.length === 0) {
    return (
      <div className="text-center py-4 flex flex-col items-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
        <p>Received data format is invalid.</p>
        <p className="text-sm text-muted-foreground mt-2">
          The data structure doesn't match the expected format.
        </p>
        <pre className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 text-xs rounded overflow-x-auto max-w-full">
          {JSON.stringify(data[0], null, 2)}
        </pre>
      </div>
    );
  }

  // Sort providers by p50 latency (fastest first)
  const sortedData = [...validData].sort((a, b) => {
    // Handle undefined or NaN values
    const aLatency = a.p50_latency !== undefined && !isNaN(a.p50_latency) ? a.p50_latency : Infinity;
    const bLatency = b.p50_latency !== undefined && !isNaN(b.p50_latency) ? b.p50_latency : Infinity;
    return aLatency - bLatency;
  });

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

  // Get location name from the origin information
  const getLocationName = () => {
    // Check if any item has origin information
    const itemWithOrigin = data.find(item => 
      item.origin && (item.origin.city || item.origin.region || item.origin.country)
    );
    
    if (!itemWithOrigin || !itemWithOrigin.origin) return "Global";
    
    const { city, region, country } = itemWithOrigin.origin;
    if (city) return city;
    if (region) return region;
    if (country) return country;
    return "Global";
  };

  const locationName = getLocationName();

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from {locationName} to blockchain RPCs. Data collected over the last 7 days.
      </p>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">{locationName}</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>P50 Latency</TableHead>
              <TableHead>P90 Latency</TableHead>
              <TableHead>Sample Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={`${item.provider || 'unknown'}-${index}`}>
                <TableCell>
                  {item.origin?.region || 'Global'}
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
                  {formatLatency(item.p50_latency)}
                </TableCell>
                <TableCell className={getLatencyColor(item.p90_latency)}>
                  {formatLatency(item.p90_latency)}
                </TableCell>
                <TableCell>
                  {item.sample_size || 'N/A'}
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
