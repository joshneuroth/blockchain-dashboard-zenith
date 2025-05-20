
import { useQuery } from "@tanstack/react-query";
import { ServiceEvent, fetchServiceEvents } from "@/lib/eventsApi";
import { useState, useEffect } from "react";

export function useServiceEvents(types: string[] = []) {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState(0);

  const result = useQuery<ServiceEvent[], Error>({
    queryKey: ['serviceEvents', { types }],
    queryFn: () => fetchServiceEvents(types),
    refetchInterval: 60000, // Refetch every minute
    onSuccess: () => {
      setLastRefreshTime(new Date());
      setSecondsSinceRefresh(0);
    },
  });

  // Update seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceRefresh(Math.floor((new Date().getTime() - lastRefreshTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastRefreshTime]);

  return {
    ...result,
    lastRefreshTime,
    secondsSinceRefresh
  };
}
