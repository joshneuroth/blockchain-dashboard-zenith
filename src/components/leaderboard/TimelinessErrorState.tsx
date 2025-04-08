
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import TimelinessInfoBox from './TimelinessInfoBox';

interface TimelinessErrorStateProps {
  error: Error;
}

const TimelinessErrorState: React.FC<TimelinessErrorStateProps> = ({ error }) => {
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
          <p className="text-red-500">Error loading timeliness data: {error.message}</p>
        </div>
      </CardContent>
    </>
  );
};

export default TimelinessErrorState;
