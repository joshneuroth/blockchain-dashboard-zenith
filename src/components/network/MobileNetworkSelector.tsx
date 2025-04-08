
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const MobileNetworkSelector: React.FC = () => {
  const { networkId } = useParams();
  
  // Define main networks to show in the mobile selector
  const mainNetworks = Object.entries(NETWORKS).slice(0, 4);
  // Define additional networks for the dropdown
  const additionalNetworks = Object.entries(NETWORKS).slice(4);
  
  return (
    <div className="md:hidden p-4 overflow-x-auto flex items-center">
      <div className="blockchain-tabs flex">
        {mainNetworks.map(([id, network]) => (
          <Link
            key={id}
            to={`/${id}`}
            className={`blockchain-tab ${networkId === id ? 'active' : ''} whitespace-nowrap`}
          >
            {network.name}
          </Link>
        ))}
        
        {additionalNetworks.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="blockchain-tab flex items-center whitespace-nowrap">
              <MoreHorizontal size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {additionalNetworks.map(([id, network]) => (
                <DropdownMenuItem key={id} asChild>
                  <Link
                    to={`/${id}`}
                    className={`w-full px-4 py-2 text-sm ${
                      networkId === id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {network.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Add chain icon for mobile */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="More chains"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="6" height="10" rx="1" />
              <rect x="9" y="4" width="6" height="16" rx="1" />
              <rect x="16" y="10" width="6" height="7" rx="1" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">More Chains</h3>
            <p className="text-xs text-gray-500">Dropdown content will be added in the next step</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MobileNetworkSelector;
