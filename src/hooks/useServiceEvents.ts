
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ServiceEvent, fetchServiceEvents } from "@/lib/eventsApi";

export function useServiceEvents(types: string[] = []) {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState(0);

  // Set up a timer to update the seconds since refresh
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000);
      setSecondsSinceRefresh(seconds);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastRefreshed]);

  const query = useQuery<ServiceEvent[], Error>({
    queryKey: ['serviceEvents', { types }],
    queryFn: () => fetchServiceEvents(types),
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: false,
    meta: {
      onSuccess: () => {
        setLastRefreshed(new Date());
        setSecondsSinceRefresh(0);
      }
    }
  });

  return {
    ...query,
    data: query.data || [],
    lastRefreshed,
    secondsSinceRefresh
  };
}
