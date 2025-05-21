
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CloudLatencyRegionFilter from './CloudLatencyRegionFilter';
import CloudLatencyMethodFilter from './CloudLatencyMethodFilter';

interface CloudLatencyFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  regionFilter: string | null;
  setRegionFilter: (region: string | null) => void;
  methodFilter: string | null;
  setMethodFilter: (method: string | null) => void;
  testTypeFilter: string | null;
  setTestTypeFilter: (testType: string | null) => void;
  uniqueRegions: string[];
  uniqueMethods: string[];
  uniqueTestTypes: string[];
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

const CloudLatencyFilters: React.FC<CloudLatencyFiltersProps> = ({
  showFilters, setShowFilters,
  regionFilter, setRegionFilter,
  methodFilter, setMethodFilter,
  testTypeFilter, setTestTypeFilter,
  uniqueRegions, uniqueMethods, uniqueTestTypes,
  hasActiveFilters, resetFilters
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter size={14} />
            <span>Filters</span>
            {hasActiveFilters && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">{
              (regionFilter ? 1 : 0) + (methodFilter ? 1 : 0) + (testTypeFilter ? 1 : 0)
            }</Badge>}
          </Button>
          
          {regionFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Region: {regionFilter}
              <X size={12} className="ml-1 cursor-pointer" onClick={() => setRegionFilter(null)} />
            </Badge>
          )}
          
          {methodFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Method: {methodFilter}
              <X size={12} className="ml-1 cursor-pointer" onClick={() => setMethodFilter(null)} />
            </Badge>
          )}
          
          {testTypeFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Test Type: {testTypeFilter}
              <X size={12} className="ml-1 cursor-pointer" onClick={() => setTestTypeFilter(null)} />
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900">
          <CloudLatencyRegionFilter
            regions={uniqueRegions}
            selectedRegion={regionFilter}
            setRegion={setRegionFilter}
          />
          
          <CloudLatencyMethodFilter
            methods={uniqueMethods}
            selectedMethod={methodFilter}
            setMethod={setMethodFilter}
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Test Type</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTestTypes.map(testType => (
                <Badge 
                  key={testType} 
                  variant={testTypeFilter === testType ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setTestTypeFilter(testTypeFilter === testType ? null : testType)}
                >
                  {testType}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudLatencyFilters;
