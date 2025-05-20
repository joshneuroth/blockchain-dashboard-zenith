
import { useQuery } from "@tanstack/react-query";
import { ServiceEvent, fetchServiceEvents } from "@/lib/eventsApi";

export function useServiceEvents(types: string[] = []) {
  return useQuery<ServiceEvent[], Error>({
    queryKey: ['serviceEvents', { types }],
    queryFn: () => fetchServiceEvents(types),
    refetchInterval: 60000, // Refetch every minute
  });
}
