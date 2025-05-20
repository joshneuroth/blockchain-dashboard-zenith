
import React from "react";
import { Clock } from "lucide-react";

interface RefreshIndicatorProps {
  secondsSinceRefresh: number;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ secondsSinceRefresh }) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s ago`;
  };

  return (
    <div className="flex items-center text-xs text-muted-foreground gap-1">
      <Clock size={12} />
      <span>Last updated: {formatTime(secondsSinceRefresh)}</span>
      {secondsSinceRefresh >= 55 && (
        <span className="animate-pulse ml-1 text-amber-500">Refreshing soon...</span>
      )}
    </div>
  );
};

export default RefreshIndicator;
