
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
          <Popover>
            <PopoverTrigger className="blockchain-tab flex items-center whitespace-nowrap">
              <MoreHorizontal size={18} />
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">More Chains</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(NETWORKS).map(([id, network]) => (
                    <Link
                      key={id}
                      to={`/${id}`}
                      className={`px-3 py-2 rounded-md text-sm ${
                        networkId === id
                          ? 'bg-gray-100 dark:bg-gray-700 font-medium'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {network.name}
                    </Link>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default MobileNetworkSelector;
