
import React from 'react';
import { RefreshCw, CheckCircle, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LatencyHeaderProps {
  networkName: string;
  isRunning: boolean;
  onRefresh: () => void;
  saveError: string | null;
}

const LatencyHeader: React.FC<LatencyHeaderProps> = ({ 
  networkName, 
  isRunning, 
  onRefresh,
  saveError
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-medium flex items-center gap-2">
        Your Browser To {networkName} RPCs
        {!saveError ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Results are being saved to our database anonymously</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="text-xs text-amber-500 flex items-center">
                  <CloudOff size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Results are only saved locally</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h2>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onRefresh}
        disabled={isRunning}
      >
        <RefreshCw size={16} className={isRunning ? "animate-spin" : ""} />
        <span>{isRunning ? "Running..." : "Refresh"}</span>
      </Button>
    </div>
  );
};

export default LatencyHeader;
