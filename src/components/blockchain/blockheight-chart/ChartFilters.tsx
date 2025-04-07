
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartFiltersProps {
  providers: string[];
  selectedProviders: Record<string, boolean>;
  toggleProvider: (provider: string) => void;
  uniqueRegions: string[];
  selectedRegion: string | null;
  handleRegionChange: (region: string) => void;
  getProviderColor: (provider: string) => string;
}

const ChartFilters: React.FC<ChartFiltersProps> = ({
  providers,
  selectedProviders,
  toggleProvider,
  uniqueRegions,
  selectedRegion,
  handleRegionChange,
  getProviderColor
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        {providers.map(provider => (
          <div key={provider} className="flex items-center space-x-2">
            <Checkbox 
              id={`provider-${provider}`}
              checked={selectedProviders[provider]}
              onCheckedChange={() => toggleProvider(provider)}
              className="rounded"
              style={{ 
                borderColor: getProviderColor(provider),
                backgroundColor: selectedProviders[provider] ? getProviderColor(provider) : 'transparent' 
              }}
            />
            <label 
              htmlFor={`provider-${provider}`}
              className="text-sm font-medium cursor-pointer"
            >
              {provider}
            </label>
          </div>
        ))}
      </div>
      
      {uniqueRegions.length > 0 && (
        <div className="flex items-center gap-2">
          <Label htmlFor="region-select" className="text-sm">Region:</Label>
          <Select 
            value={selectedRegion || ''} 
            onValueChange={handleRegionChange}
          >
            <SelectTrigger id="region-select" className="w-[180px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {uniqueRegions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ChartFilters;
