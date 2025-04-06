
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import CloudLatencyRegionFilter from './CloudLatencyRegionFilter';
import CloudLatencyMethodFilter from './CloudLatencyMethodFilter';

interface CloudLatencyFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  regionFilter: string | null;
  setRegionFilter: (region: string | null) => void;
  methodFilter: string | null;
  setMethodFilter: (method: string | null) => void;
  uniqueRegions: string[];
  uniqueMethods: string[];
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

const CloudLatencyFilters: React.FC<CloudLatencyFiltersProps> = ({
  showFilters,
  setShowFilters,
  regionFilter,
  setRegionFilter,
  methodFilter,
  setMethodFilter,
  uniqueRegions,
  uniqueMethods,
  hasActiveFilters,
  resetFilters
}) => {
  return (
    <div className="flex items-center gap-2">
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Filter size={14} />
              Filters
            </Button>
          </CollapsibleTrigger>
          
          {/* Move the Clear Filters button next to the Filters button */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <CollapsibleContent className="mt-2 p-4 border rounded-md bg-background shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <CloudLatencyRegionFilter 
              regionFilter={regionFilter} 
              setRegionFilter={setRegionFilter}
              uniqueRegions={uniqueRegions} 
            />
            
            <CloudLatencyMethodFilter 
              methodFilter={methodFilter} 
              setMethodFilter={setMethodFilter}
              uniqueMethods={uniqueMethods} 
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CloudLatencyFilters;
