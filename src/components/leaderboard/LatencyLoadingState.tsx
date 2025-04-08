
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import LatencyInfoBox from './LatencyInfoBox';

const LatencyLoadingState: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Zap size={20} />
          Provider Latency Ranking
        </CardTitle>
        <LatencyInfoBox />
      </CardHeader>
      <CardContent>
        <div className="h-60 flex items-center justify-center">
          <p className="text-muted-foreground">Loading latency data...</p>
        </div>
      </CardContent>
    </>
  );
};

export default LatencyLoadingState;
