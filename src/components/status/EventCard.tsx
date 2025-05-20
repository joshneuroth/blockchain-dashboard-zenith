
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ServiceEvent } from "@/lib/eventsApi";
import EventStatusBadge from "./EventStatusBadge";
import { formatDistanceToNow } from "date-fns";

interface EventCardProps {
  event: ServiceEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isActive = !event.resolved_at;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ongoing";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Format event type by removing underscores and capitalizing each word
  const formatEventType = (type: string | undefined) => {
    if (!type) return "Issue";
    
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const startedAt = formatDate(event.started_at);
  const resolvedAt = formatDate(event.resolved_at);
  const duration = event.resolved_at ? 
    formatDistanceToNow(new Date(event.started_at), { 
      addSuffix: false 
    }) : "Ongoing";

  // Create a formatted title using the formatted event type
  const formattedTitle = `${formatEventType(event.type || '')} on ${event.provider}`;

  return (
    <Card className={`${isActive ? "border-l-4 border-l-red-500" : ""} mb-4`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EventStatusBadge status={event.status} />
              <span className="text-sm text-muted-foreground">
                {event.chain}
              </span>
            </div>
            <CardTitle className="text-lg">{event.provider}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <h3 className="font-medium mb-1">{formattedTitle}</h3>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <div>
            Started: {startedAt}
            {event.resolved_at && <> • Resolved: {resolvedAt}</>}
          </div>
          <div>Duration: {duration}</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
