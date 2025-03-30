
import React from 'react';
import { History } from 'lucide-react';

interface LastUpdatedInfoProps {
  lastUpdated: string | null;
  isp?: string | null;
}

const LastUpdatedInfo: React.FC<LastUpdatedInfoProps> = ({ lastUpdated, isp }) => {
  if (!lastUpdated) return null;
  
  return (
    <div className="ml-auto flex items-center text-gray-500 text-xs">
      {isp && <span className="mr-2">{isp}</span>}
      <History size={14} className="mr-1" />
      <span>Last updated: {lastUpdated}</span>
    </div>
  );
};

export default LastUpdatedInfo;
