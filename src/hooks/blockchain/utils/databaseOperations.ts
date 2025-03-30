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
  const { count } = await supabase
    .from('blockchain_readings')
    .select('*', { count: 'exact', head: true })
    .eq('network_id', networkId);

  if (count && count > 100) {
    const { data: oldestKeepData } = await supabase
      .from('blockchain_readings')
      .select('created_at')
      .eq('network_id', networkId)
      .order('created_at', { ascending: false })
      .range(99, 99);
    
    if (oldestKeepData && oldestKeepData.length > 0) {
      const cutoffTimestamp = oldestKeepData[0].created_at;
      
      const { error: deleteError } = await supabase
        .from('blockchain_readings')
        .delete()
        .eq('network_id', networkId)
        .lt('created_at', cutoffTimestamp);
      
      if (deleteError) {
        console.error("Error cleaning up old blockchain data:", deleteError);
        return false;
      } else {
        console.log(`Cleaned up blockchain_readings table, keeping only the latest 100 records for ${networkId}`);
        return true;
      }
    }
  }
  
  return false;
};
