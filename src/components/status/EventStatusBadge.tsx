
import React from "react";
import { Badge } from "@/components/ui/badge";

interface EventStatusBadgeProps {
  status: 'degraded' | 'outage' | 'resolved';
}

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status }) => {
  const variants = {
    degraded: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-500",
    outage: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-500",
    resolved: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-500"
  };

  const labels = {
    degraded: "Degraded",
    outage: "Outage",
    resolved: "Resolved"
  };

  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {labels[status]}
    </Badge>
  );
};

export default EventStatusBadge;
