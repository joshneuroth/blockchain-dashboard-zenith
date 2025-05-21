
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const MobileNetworkSelector: React.FC = () => {
  const { networkId } = useParams();
  
  // Only show Ethereum in the main selector
  const ethereumNetwork = Object.entries(NETWORKS).find(([id]) => id === 'ethereum');
  
  return (
    <div className="md:hidden p-4 overflow-x-auto flex items-center">
      <div className="blockchain-tabs flex">
        {ethereumNetwork && (
          <Link
            key={ethereumNetwork[0]}
            to={`/${ethereumNetwork[0]}`}
            className={`blockchain-tab ${networkId === ethereumNetwork[0] ? 'active' : ''} whitespace-nowrap`}
          >
            {ethereumNetwork[1].name}
          </Link>
        )}
        
        {/* Single ellipsis icon with popover for all chains */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="More chains"
            >
              <MoreHorizontal size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium mb-2">More Chains</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NETWORKS).map(([id, network]) => (
                  <Link
                    key={id}
                    to={`/${id}`}
                    className={`px-3 py-2 rounded text-sm ${
                      networkId === id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {network.name}
                  </Link>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MobileNetworkSelector;
