
import React from 'react';

interface ProviderListProps {
  providers: Record<string, any> | null;
}

const ProviderList: React.FC<ProviderListProps> = ({ providers }) => {
  if (!providers || Object.keys(providers).length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex items-center flex-wrap gap-2">
      {Object.entries(providers).map(([name, data], index) => (
        <div 
          key={index} 
          className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded flex items-center"
        >
          <span className="font-medium mr-1">{name}</span>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      ))}
    </div>
  );
};

export default ProviderList;
