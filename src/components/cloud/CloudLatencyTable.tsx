
import React, { useMemo } from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Server, Globe } from 'lucide-react';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data }) => {
  // Log data received to help with debugging
  console.log(`CloudLatencyTable received ${data.length} items`);
  
  // Group data by origin and provider
  const organizedData = useMemo(() => {
    const byOriginAndProvider: Record<string, Record<string, CloudLatencyData[]>> = {};
    
    // Process each data point
    data.forEach(item => {
      const origin = item.origin || 'Unknown';
      
      // Initialize origin object if it doesn't exist
      if (!byOriginAndProvider[origin]) {
        byOriginAndProvider[origin] = {};
      }
      
      // Initialize provider array if it doesn't exist
      if (!byOriginAndProvider[origin][item.provider_name]) {
        byOriginAndProvider[origin][item.provider_name] = [];
      }
      
      // Add this data point to the appropriate bucket
      byOriginAndProvider[origin][item.provider_name].push(item);
    });
    
    console.log('Organized data by origin and provider:', Object.keys(byOriginAndProvider));
    return byOriginAndProvider;
  }, [data]);

  // Calculate statistics for each origin and provider
  const statistics = useMemo(() => {
    const stats: Record<string, Record<string, { latest: number; average: number }>> = {};
    
    // For each origin
    Object.entries(organizedData).forEach(([origin, providers]) => {
      stats[origin] = {};
      
      // For each provider in this origin
      Object.entries(providers).forEach(([provider, measurements]) => {
        if (measurements.length === 0) return;
        
        // Get valid response times
        const validTimes = measurements
          .filter(item => typeof item.response_time === 'number' && !isNaN(item.response_time))
          .map(item => item.response_time);
        
        if (validTimes.length === 0) return;
        
        // Sort by timestamp (descending) to get the latest measurement
        const sortedMeasurements = [...measurements].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Calculate latest and average response time
        stats[origin][provider] = {
          latest: sortedMeasurements[0].response_time,
          average: validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
        };
      });
    });
    
    return stats;
  }, [organizedData]);

  // Get color class based on response time
  const getResponseTimeColor = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "text-gray-500";
    if (time < 100) return "text-green-600 dark:text-green-400";
    if (time < 300) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format number with ms suffix
  const formatResponseTime = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "N/A";
    return `${time.toFixed(2)} ms`;
  };

  // Sort origins for consistent display
  const sortedOrigins = Object.keys(organizedData).sort();
  
  // Check if we have any actual data after organization
  const hasData = sortedOrigins.length > 0 && 
                  sortedOrigins.some(origin => Object.keys(organizedData[origin]).length > 0);
  
  if (!hasData) {
    console.log('No data available after organization');
    return (
      <div className="text-center py-4">
        <p>No cloud latency data available after processing.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from cloud services to blockchain RPCs. Data collected over the last 7 days.
      </p>
      
      <div className="space-y-6">
        {sortedOrigins.map(origin => {
          // Skip origins with no providers
          if (Object.keys(organizedData[origin]).length === 0) return null;
          
          return (
            <div key={origin} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={18} className="text-blue-500" />
                <h3 className="font-medium">{origin}</h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Latest Response</TableHead>
                    <TableHead>7-Day Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statistics[origin] || {})
                    // Sort providers by latest response time (fastest first)
                    .sort((a, b) => a[1].latest - b[1].latest)
                    .map(([provider, stats]) => (
                      <TableRow key={provider}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Server size={16} />
                            <span>{provider}</span>
                          </div>
                        </TableCell>
                        <TableCell className={getResponseTimeColor(stats.latest)}>
                          {formatResponseTime(stats.latest)}
                        </TableCell>
                        <TableCell>
                          {formatResponseTime(stats.average)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CloudLatencyTable;
