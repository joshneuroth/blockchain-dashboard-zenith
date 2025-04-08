
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LatencyInfoBox: React.FC = () => {
  return (
    <Alert className="my-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
      <div className="flex items-start gap-3">
        <div className="animate-pulse-opacity">
          <Lightbulb className="h-7 w-7 mt-0.5 text-yellow-500 dark:text-yellow-400" />
        </div>
        <AlertDescription className="text-sm">
          P50 latency data is averaged across tests. The P90/P50 ratio shows consistency in response times. 
          A value under 2 is typically expected. Higher ratios represent more outliers, and higher inconsistency.
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default LatencyInfoBox;
