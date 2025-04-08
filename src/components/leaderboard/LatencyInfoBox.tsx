
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LatencyInfoBox: React.FC = () => {
  return (
    <Alert className="my-4 border border-black dark:border-gray-700">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 mt-0.5" />
        <AlertDescription className="text-sm">
          P50 latency data is averaged across tests. The P90/P50 ratio shows consistency in response times. 
          A value under 2 is typically expected. Higher ratios represent more outliers, and higher inconsistency.
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default LatencyInfoBox;
