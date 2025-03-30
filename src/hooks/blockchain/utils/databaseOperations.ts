import { supabase } from '@/integrations/supabase/client';

// Save blockchain data to the database
export const saveBlockchainData = async (
  networkId: string,
  providerStatusMap: any,
  timestamp: number
) => {
  // Create the measurement record
  const { error: insertError } = await supabase
    .from('blockchain_readings')
    .insert({
      network_id: networkId,
      providers_data: JSON.stringify(providerStatusMap),
      created_at: new Date(timestamp).toISOString()
    });
    
  if (insertError) {
    console.error("Error saving blockchain data:", insertError);
    return false;
  }
  
  return true;
};

// Clean up old records, keeping only the newest 100
export const cleanupOldRecords = async (networkId: string) => {
  try {
    console.log(`Starting cleanup for network ${networkId}`);
    
    // Count how many records we have for this network
    const { count, error: countError } = await supabase
      .from('blockchain_readings')
      .select('*', { count: 'exact' })
      .eq('network_id', networkId);
    
    if (countError) {
      console.error("Error counting blockchain records:", countError);
      return false;
    }
    
    console.log(`Found ${count} records for network ${networkId}`);
    
    // Only proceed with cleanup if we have more than 100 records
    if (count && count > 100) {
      // First, get the IDs of records we want to keep (the newest 100)
      const { data: recordsToKeep, error: fetchKeepError } = await supabase
        .from('blockchain_readings')
        .select('id')
        .eq('network_id', networkId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (fetchKeepError || !recordsToKeep) {
        console.error("Error fetching records to keep:", fetchKeepError);
        return false;
      }
      
      // Extract the IDs to keep
      const idsToKeep = recordsToKeep.map(record => record.id);
      
      // Now delete all records for this network that aren't in the keep list
      const { data: deleteResult, error: deleteError } = await supabase
        .from('blockchain_readings')
        .delete()
        .eq('network_id', networkId)
        .not('id', 'in', `(${idsToKeep.join(',')})`);
      
      if (deleteError) {
        console.error("Error cleaning up old blockchain data:", deleteError);
        return false;
      }
      
      console.log(`Successfully cleaned up records for ${networkId}, keeping newest 100 records`);
      return true;
    } else {
      console.log(`No cleanup needed for ${networkId}, only ${count} records found (below 100 threshold)`);
      return true;
    }
  } catch (error) {
    console.error("Unexpected error during blockchain data cleanup:", error);
    return false;
  }
};
