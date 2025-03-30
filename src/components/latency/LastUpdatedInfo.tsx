
import React from 'react';
import { History } from 'lucide-react';

interface LastUpdatedInfoProps {
  lastUpdated: string | null;
}

const LastUpdatedInfo: React.FC<LastUpdatedInfoProps> = ({ lastUpdated }) => {
  if (!lastUpdated) return null;
  
  return (
    <div className="ml-auto flex items-center text-gray-500 text-xs">
      <History size={14} className="mr-1" />
      <span>Last updated: {lastUpdated}</span>
    </div>
  );
};

export default LastUpdatedInfo;
