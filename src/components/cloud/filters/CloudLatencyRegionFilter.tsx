
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CloudLatencyRegionFilterProps {
  regionFilter: string | null;
  setRegionFilter: (region: string | null) => void;
  uniqueRegions: string[];
}

const CloudLatencyRegionFilter: React.FC<CloudLatencyRegionFilterProps> = ({
  regionFilter,
  setRegionFilter,
  uniqueRegions
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Region</label>
      <Select 
        value={regionFilter || "all_regions"} 
        onValueChange={(value) => setRegionFilter(value === "all_regions" ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_regions">All Regions</SelectItem>
          {uniqueRegions.map(region => (
            <SelectItem key={region} value={region}>{region}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CloudLatencyRegionFilter;
