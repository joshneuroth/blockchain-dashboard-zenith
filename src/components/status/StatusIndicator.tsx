
import React from 'react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type StatusType = 'operational' | 'degraded' | 'critical';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  operational: {
    color: "bg-green-500",
    label: "Operational",
    description: "Service is operating normally"
  },
  degraded: {
    color: "bg-yellow-500",
    label: "Degraded",
    description: "Service is experiencing degraded performance"
  },
  critical: {
    color: "bg-red-500",
    label: "Critical",
    description: "Service is experiencing critical issues"
  }
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label, 
  showLabel = false,
  className
}) => {
  const config = statusConfig[status];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("h-3 w-3 rounded-full", config.color)} />
            {showLabel && <span>{label || config.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusIndicator;
