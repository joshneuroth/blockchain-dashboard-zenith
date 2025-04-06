
import React, { useState, useMemo } from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Server, AlertTriangle, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data }) => {
  // Log data received to help with debugging
  console.log(`CloudLatencyTable received ${data?.length || 0} items:`, data);
  
  // State for filters
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Extract unique regions and methods for filters
  const uniqueRegions = Array.from(new Set(validData.map(item => item.origin?.region || 'Global')));
  const uniqueMethods = Array.from(new Set(validData.map(item => item.method || 'eth_blockNumber')));

  // Apply filters to data
  const filteredData = useMemo(() => {
    return validData.filter(item => {
      const itemRegion = item.origin?.region || 'Global';
      const itemMethod = item.method || 'eth_blockNumber';
      
      const regionMatches = !regionFilter || itemRegion === regionFilter;
      const methodMatches = !methodFilter || itemMethod === methodFilter;
      
      return regionMatches && methodMatches;
    });
  }, [validData, regionFilter, methodFilter]);

  // Sort providers by p50 latency (fastest first)
  const sortedData = [...filteredData].sort((a, b) => {
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

  // Reset all filters
  const resetFilters = () => {
    setRegionFilter(null);
    setMethodFilter(null);
  };

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from {locationName} to blockchain RPCs. Data collected over the last 7 days.
      </p>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{locationName}</h3>
          
          <div className="flex items-center gap-2">
            {(regionFilter || methodFilter) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
            
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Filter size={14} />
                  Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 border rounded-md bg-background shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Select value={regionFilter || ""} onValueChange={(value) => setRegionFilter(value || null)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        {uniqueRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Method</label>
                    <Select value={methodFilter || ""} onValueChange={(value) => setMethodFilter(value || null)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Methods</SelectItem>
                        {uniqueMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
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
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <p className="text-muted-foreground">No results match your filter criteria.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CloudLatencyTable;
