
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TimelinessInfoBox: React.FC = () => {
  return (
    <Alert className="my-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm rounded-md">
      <div className="flex items-start gap-3">
        <div className="animate-pulse-opacity">
          <Lightbulb className="h-7 w-7 mt-0.5 text-yellow-500 dark:text-yellow-400" />
        </div>
        <AlertDescription className="text-sm">
          Our systems calculate consensus for current blockheight between RPC providers. 
          If a provider agrees with the majority, then they pass the test.
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default TimelinessInfoBox;
