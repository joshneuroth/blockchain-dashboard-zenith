
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface TimelinessFilterControlsProps {
  networks: string[];
  selectedNetwork: string;
  setSelectedNetwork: (network: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
}

const TimelinessFilterControls: React.FC<TimelinessFilterControlsProps> = ({
  networks,
  selectedNetwork,
  setSelectedNetwork,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const hasActiveFilters = selectedNetwork !== "all" || startDate || endDate;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Network Filter */}
      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <SelectValue placeholder="Filter by network" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network} value={network}>
              {network === "all" ? "All Networks" : network}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Date Range Selector - Start Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "PPP") : "Start Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {/* Date Range Selector - End Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "PPP") : "End Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setSelectedNetwork("all");
            setStartDate(undefined);
            setEndDate(undefined);
          }}
          className="text-xs"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default TimelinessFilterControls;
