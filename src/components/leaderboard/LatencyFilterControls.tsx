
import React, { useState } from 'react';
import { Filter, Globe, Clock, Square } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { TimePeriod } from '@/hooks/useLatencyRankingFilters';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LatencyFilterControlsProps {
  selectedNetwork: string;
  selectedRegion: string;
  selectedPeriod: TimePeriod;
  availableNetworks: string[];
  availableRegions: string[];
  availablePeriods: TimePeriod[];
  onNetworkChange: (network: string) => void;
  onRegionChange: (region: string) => void;
  onPeriodChange: (period: TimePeriod) => void;
}

const LatencyFilterControls: React.FC<LatencyFilterControlsProps> = ({
  selectedNetwork,
  selectedRegion,
  selectedPeriod,
  availableNetworks,
  availableRegions,
  availablePeriods,
  onNetworkChange,
  onRegionChange,
  onPeriodChange
}) => {
  const [periodOpen, setPeriodOpen] = useState(false);

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "24h": return "24 Hours";
      case "7d": return "7 Days";
      case "30d": return "30 Days";
      case "all": return "All Time";
      default: return period;
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <Filter size={16} className="text-muted-foreground" />
        <Select value={selectedNetwork} onValueChange={onNetworkChange}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent>
            {availableNetworks.map((network) => (
              <SelectItem key={network} value={network}>
                {network}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-1">
        <Globe size={16} className="text-muted-foreground" />
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            {availableRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Clock size={16} className="text-muted-foreground" />
        <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-[140px] h-10 justify-between"
              aria-label="Select time period"
            >
              <span>{getPeriodLabel(selectedPeriod)}</span>
              <Square className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <ToggleGroup 
                type="single" 
                className="flex flex-col gap-1 w-full" 
                value={selectedPeriod}
                onValueChange={(value) => {
                  if (value) onPeriodChange(value as TimePeriod);
                  setPeriodOpen(false);
                }}
              >
                {availablePeriods.map((period) => (
                  <ToggleGroupItem 
                    key={period} 
                    value={period}
                    className="justify-start w-full data-[state=on]:bg-accent"
                    aria-label={getPeriodLabel(period)}
                  >
                    {getPeriodLabel(period)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default LatencyFilterControls;
