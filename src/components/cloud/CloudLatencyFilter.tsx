
import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudLatencyFilterProps {
  data: CloudLatencyData[];
  selectedMethod: string | null;
  onMethodChange: (method: string | null) => void;
}

const CloudLatencyFilter: React.FC<CloudLatencyFilterProps> = ({ 
  data, 
  selectedMethod, 
  onMethodChange 
}) => {
  // Extract unique methods from the data
  const methods = Array.from(new Set(data.map(item => item.method).filter(Boolean))) as string[];

  if (methods.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <Filter size={16} className="text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Filter by method:</span>
      <Select 
        value={selectedMethod || ''} 
        onValueChange={(value) => onMethodChange(value === '' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All methods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All methods</SelectItem>
          {methods.map(method => (
            <SelectItem key={method} value={method}>{method}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CloudLatencyFilter;
