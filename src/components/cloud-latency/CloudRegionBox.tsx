
import React from 'react';
import { CloudServer } from 'lucide-react';

const CloudRegionBox: React.FC = () => {
  // For now, we hardcode New York as the cloud region
  return (
    <div className="absolute left-0 top-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <div className="text-xs text-gray-500 mb-2">Cloud Origin</div>
      <div className="flex items-center gap-3">
        <CloudServer size={18} className="text-blue-500" />
        <div>
          <div className="font-medium text-sm">New York</div>
          <div className="text-xs text-gray-500 mt-1">AWS us-east-1</div>
        </div>
      </div>
    </div>
  );
};

export default CloudRegionBox;
