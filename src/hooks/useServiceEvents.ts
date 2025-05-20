
import { useQuery } from "@tanstack/react-query";
import { ServiceEvent, fetchServiceEvents } from "@/lib/eventsApi";

export function useServiceEvents() {
  return useQuery<ServiceEvent[], Error>({
    queryKey: ['serviceEvents'],
    queryFn: fetchServiceEvents,
    refetchInterval: 60000, // Refetch every minute
  });
}
