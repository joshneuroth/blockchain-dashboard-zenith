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
    // Count how many records we have for this network
    const { count, error: countError } = await supabase
      .from('blockchain_readings')
      .select('*', { count: 'exact' })
      .eq('network_id', networkId);
    
    if (countError) {
      console.error("Error counting blockchain records:", countError);
      return false;
    }
    
    // Only proceed with cleanup if we have more than 100 records
    if (count && count > 100) {
      console.log(`Found ${count} records for ${networkId}, performing cleanup to keep only 100`);
      
      // Get all the IDs sorted by timestamp, oldest first
      const { data: allRecords, error: fetchError } = await supabase
        .from('blockchain_readings')
        .select('id, created_at')
        .eq('network_id', networkId)
        .order('created_at', { ascending: false });
      
      if (fetchError || !allRecords) {
        console.error("Error fetching records for cleanup:", fetchError);
        return false;
      }
      
      // Get the IDs of records we want to delete (all except newest 100)
      const recordsToDelete = allRecords.slice(100).map(record => record.id);
      
      if (recordsToDelete.length > 0) {
        // Delete the old records
        const { error: deleteError } = await supabase
          .from('blockchain_readings')
          .delete()
          .in('id', recordsToDelete);
        
        if (deleteError) {
          console.error("Error cleaning up old blockchain data:", deleteError);
          return false;
        } else {
          console.log(`Successfully deleted ${recordsToDelete.length} old records for ${networkId}`);
          return true;
        }
      }
    } else {
      // Less than 100 records, no cleanup needed
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Unexpected error during blockchain data cleanup:", error);
    return false;
  }
};
