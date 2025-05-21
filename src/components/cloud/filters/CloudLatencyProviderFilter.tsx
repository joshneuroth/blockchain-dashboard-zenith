
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CloudLatencyProviderFilterProps {
  uniqueProviders: string[];
  providerFilter: string | null;
  setProviderFilter: (provider: string | null) => void;
}

const CloudLatencyProviderFilter: React.FC<CloudLatencyProviderFilterProps> = ({
  uniqueProviders,
  providerFilter,
  setProviderFilter
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Provider</label>
      <Select 
        value={providerFilter || "all_providers"} 
        onValueChange={(value) => setProviderFilter(value === "all_providers" ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_providers">All Providers</SelectItem>
          {uniqueProviders.map(provider => (
            <SelectItem key={provider} value={provider}>{provider}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CloudLatencyProviderFilter;
