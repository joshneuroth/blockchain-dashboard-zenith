
import React from 'react';
import { Server } from 'lucide-react';

const CloudRegionBox: React.FC = () => {
  // Currently showing static data, but this could be dynamic in the future
  const region = "Germany";
  
  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-md">
        <div className="text-xs text-gray-500 mb-1">Blockheight Server</div>
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="text-lg font-medium">{region}</span>
        </div>
      </div>
    </div>
  );
};

export default CloudRegionBox;
