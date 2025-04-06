
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CloudLatencyMethodFilterProps {
  methodFilter: string | null;
  setMethodFilter: (method: string | null) => void;
  uniqueMethods: string[];
}

const CloudLatencyMethodFilter: React.FC<CloudLatencyMethodFilterProps> = ({
  methodFilter,
  setMethodFilter,
  uniqueMethods
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
