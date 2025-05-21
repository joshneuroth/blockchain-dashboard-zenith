
import React, { useState, useMemo } from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import CloudLatencyErrorState from './CloudLatencyErrorState';
import CloudLatencyFilters from './filters/CloudLatencyFilters';
import CloudLatencyTableDisplay from './table/CloudLatencyTableDisplay';
import { getLatencyColor, formatLatency, getLocationName } from './utils/latencyUtils';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data }) => {
  // Log data received to help with debugging
  console.log(`CloudLatencyTable received ${data?.length || 0} items:`, data);
  
  // State for filters
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [testTypeFilter, setTestTypeFilter] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!data || data.length === 0) {
    return (
      <CloudLatencyErrorState 
        message="No cloud latency data available for this network."
        submessage="This may be because the network is not yet supported by our cloud metrics system."
      />
    );
  }

  // Validate data objects before sorting
  const validData = data.filter(item => 
    item && typeof item === 'object' && item.p50_latency !== undefined && item.provider
  );
  
  console.log(`CloudLatencyTable found ${validData.length} valid data items`);
  
  if (validData.length === 0) {
    return (
      <CloudLatencyErrorState 
        message="Received data format is invalid."
        submessage="The data structure doesn't match the expected format."
        debugData={data[0]}
      />
    );
  }

  // Extract unique values for filters
  const uniqueRegions = Array.from(new Set(validData.map(item => item.origin?.region || 'Global')));
  const uniqueMethods = Array.from(new Set(validData.map(item => item.method || 'eth_blockNumber')));
  const uniqueTestTypes = Array.from(new Set(validData.map(item => item.test_type).filter(Boolean)));
  const uniqueProviders = Array.from(new Set(validData.map(item => item.provider)));

  // Filter to only show most recent method test per provider-method-region combination
  const mostRecentData = useMemo(() => {
    // Create a map to store the most recent entry for each provider-method-region combination
    const latestEntryMap = new Map();
    
    validData.forEach(item => {
      // Create a unique key for each provider-method-region combination
      const itemRegion = item.origin?.region || 'Global';
      const itemMethod = item.method || 'eth_blockNumber';
      const itemTestType = item.test_type || 'simple';
      const key = `${item.provider}-${itemMethod}-${itemRegion}-${itemTestType}`;
      
      const existingItem = latestEntryMap.get(key);
      
      // If no entry exists for this key or the current item has a more recent timestamp
      if (!existingItem || 
          (item.timestamp && existingItem.timestamp && 
          new Date(item.timestamp) > new Date(existingItem.timestamp))) {
        latestEntryMap.set(key, item);
      }
    });
    
    // Convert map values back to an array
    return Array.from(latestEntryMap.values());
  }, [validData]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return mostRecentData.filter(item => {
      const itemRegion = item.origin?.region || 'Global';
      const itemMethod = item.method || 'eth_blockNumber';
      const itemTestType = item.test_type || 'simple';
      const itemProvider = item.provider;
      
      const regionMatches = !regionFilter || itemRegion === regionFilter;
      const methodMatches = !methodFilter || itemMethod === methodFilter;
      const testTypeMatches = !testTypeFilter || itemTestType === testTypeFilter;
      const providerMatches = !providerFilter || itemProvider === providerFilter;
      
      return regionMatches && methodMatches && testTypeMatches && providerMatches;
    });
  }, [mostRecentData, regionFilter, methodFilter, testTypeFilter, providerFilter]);

  // Sort providers by p50 latency (fastest first)
  const sortedData = [...filteredData].sort((a, b) => {
    // Handle undefined or NaN values
    const aLatency = a.p50_latency !== undefined && !isNaN(a.p50_latency) ? a.p50_latency : Infinity;
    const bLatency = b.p50_latency !== undefined && !isNaN(b.p50_latency) ? b.p50_latency : Infinity;
    return aLatency - bLatency;
  });

  const locationName = getLocationName(data);

  // Reset all filters
  const resetFilters = () => {
    setRegionFilter(null);
    setMethodFilter(null);
    setTestTypeFilter(null);
    setProviderFilter(null);
  };

  // Check if we have active filters
  const hasActiveFilters = regionFilter !== null || methodFilter !== null || 
                           testTypeFilter !== null || providerFilter !== null;

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times sourced from our global monitoring system. Use this data to determine which provider is closest to your servers and users.
      </p>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <CloudLatencyFilters 
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            methodFilter={methodFilter}
            setMethodFilter={setMethodFilter}
            testTypeFilter={testTypeFilter}
            setTestTypeFilter={setTestTypeFilter}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
            uniqueRegions={uniqueRegions}
            uniqueMethods={uniqueMethods}
            uniqueTestTypes={uniqueTestTypes}
            uniqueProviders={uniqueProviders}
            hasActiveFilters={hasActiveFilters}
            resetFilters={resetFilters}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>P50 Latency</TableHead>
              <TableHead>P90 Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <CloudLatencyTableDisplay 
              sortedData={sortedData}
              getLatencyColor={getLatencyColor}
              formatLatency={formatLatency}
            />
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CloudLatencyTable;
