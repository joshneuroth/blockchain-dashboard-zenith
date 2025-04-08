
import React from 'react';
import { CardContent } from '@/components/ui/card';

const TimelinessEmptyState: React.FC = () => {
  return (
    <CardContent>
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">No timeliness data available for the selected filters</p>
      </div>
    </CardContent>
  );
};

export default TimelinessEmptyState;
