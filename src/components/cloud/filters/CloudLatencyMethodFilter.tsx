
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CloudLatencyMethodFilterProps {
  uniqueMethods: string[];
  methodFilter: string | null;
  setMethodFilter: (method: string | null) => void;
}

const CloudLatencyMethodFilter: React.FC<CloudLatencyMethodFilterProps> = ({
  uniqueMethods,
  methodFilter,
  setMethodFilter
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Method</label>
      <Select 
        value={methodFilter || "all_methods"} 
        onValueChange={(value) => setMethodFilter(value === "all_methods" ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_methods">All Methods</SelectItem>
          {uniqueMethods.map(method => (
            <SelectItem key={method} value={method}>{method}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CloudLatencyMethodFilter;
