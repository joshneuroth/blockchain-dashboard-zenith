
import { useState, useEffect } from 'react';

export interface LeaderboardEntry {
  provider: string;
  network: string;
  score: number;
  rank: number;
  uptime: number;
  responseTime: number;
  successfulCalls: number;
  totalCalls: number;
  lastUpdated: string;
  [key: string]: any; // For any additional fields in the API response
}

export const useLeaderboardData = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://blockheight-api.fly.dev/internal/leaderboard/v1');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        setRawResponse(result); // Store the raw response for debugging
        
        // Process the data based on the actual structure returned
        // This will need to be adjusted once we see the actual response
        const processedData = Array.isArray(result) 
          ? result 
          : Array.isArray(result.data) 
            ? result.data 
            : [];
            
        setData(processedData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  return { data, isLoading, error, rawResponse };
};
