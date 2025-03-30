import { supabase } from '@/integrations/supabase/client';

// Save blockchain data to localStorage instead of database
export const saveBlockchainData = async (
  networkId: string,
  providerStatusMap: any,
  timestamp: number
) => {
  try {
    // Also save locally
    const localStorageKey = `blockchain-readings-${networkId}`;
    
    // Get existing data
    let readings = [];
    const existingData = localStorage.getItem(localStorageKey);
    
    if (existingData) {
      readings = JSON.parse(existingData);
    }
    
    // Add new reading
    readings.push({
      network_id: networkId,
      providers_data: providerStatusMap,
      created_at: new Date(timestamp).toISOString(),
      timestamp: timestamp
    });
    
    // Store back to localStorage
    localStorage.setItem(localStorageKey, JSON.stringify(readings));
    
    return true;
  } catch (error) {
    console.error("Error saving blockchain data to local storage:", error);
    return false;
  }
};

// Clean up old records from localStorage, keeping only the newest 100
export const cleanupOldRecords = async (networkId: string) => {
  try {
    console.log(`Starting local storage cleanup for network ${networkId}`);
    
    // Get existing data
    const localStorageKey = `blockchain-readings-${networkId}`;
    const existingData = localStorage.getItem(localStorageKey);
    
    if (!existingData) {
      console.log(`No data found for ${networkId} in local storage`);
      return true;
    }
    
    // Parse data
    const readings = JSON.parse(existingData);
    console.log(`Found ${readings.length} records for network ${networkId} in local storage`);
    
    // Only keep 100 most recent entries
    if (readings.length > 100) {
      // Sort by timestamp (newest first)
      readings.sort((a: any, b: any) => b.timestamp - a.timestamp);
      
      // Slice to keep only the newest 100
      const trimmedReadings = readings.slice(0, 100);
      
      // Store back to localStorage
      localStorage.setItem(localStorageKey, JSON.stringify(trimmedReadings));
      console.log(`Cleaned up local storage for ${networkId}, keeping newest 100 records`);
    } else {
      console.log(`No cleanup needed for ${networkId}, only ${readings.length} records found (below 100 threshold)`);
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error during local storage cleanup:", error);
    return false;
  }
};
