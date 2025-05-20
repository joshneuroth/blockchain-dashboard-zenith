
// Type definitions for service events
export interface ServiceEvent {
  id: string;
  provider: string;
  chain: string;
  status: 'degraded' | 'outage' | 'resolved';
  title: string;
  description: string;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// API service for fetching events
export const fetchServiceEvents = async (): Promise<ServiceEvent[]> => {
  try {
    const response = await fetch(
      "https://blockheight.xyz/api/v1/events"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error fetching service events:", error);
    return [];
  }
};
