
import React from 'react';
import { Button } from '@/components/ui/button';
import { TimePeriod } from '@/hooks/useLeaderboardData';
import { Clock } from 'lucide-react';

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({ 
  selectedPeriod, 
  onChange 
}) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'day', label: 'Last Day' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Time Period</span>
      </div>
      <div className="flex gap-2">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(period.value)}
            className="flex-1 transition-all"
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodFilter;
