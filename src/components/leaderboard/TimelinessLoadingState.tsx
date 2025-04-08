
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import TimelinessInfoBox from './TimelinessInfoBox';

const TimelinessLoadingState: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Clock size={20} />
          Provider Timeliness Ranking
        </CardTitle>
        <TimelinessInfoBox />
      </CardHeader>
      <CardContent>
        <div className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">Loading timeliness data...</p>
        </div>
      </CardContent>
    </>
  );
};

export default TimelinessLoadingState;
