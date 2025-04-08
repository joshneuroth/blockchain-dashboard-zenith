
import React from 'react';
import { Filter, Globe } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface LatencyFilterControlsProps {
  selectedNetwork: string;
  selectedRegion: string;
  availableNetworks: string[];
  availableRegions: string[];
  onNetworkChange: (network: string) => void;
  onRegionChange: (region: string) => void;
}

const LatencyFilterControls: React.FC<LatencyFilterControlsProps> = ({
  selectedNetwork,
  selectedRegion,
  availableNetworks,
  availableRegions,
  onNetworkChange,
  onRegionChange
}) => {
  return (
    <div className="flex items-center gap-3">
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
    </div>
  );
};

export default LatencyFilterControls;
