
import { supabase } from '@/integrations/supabase/client';
import { NETWORKS } from '@/lib/api';
import type { LatencyResult } from './latencyUtils';
import type { GeoLocationInfo } from './geoLocationUtils';

// Save latency results to Supabase
export const saveResultsToSupabase = async (
  networkId: string,
  latencyResults: LatencyResult[],
  geoInfo: GeoLocationInfo
): Promise<{ success: boolean; error: string | null }> => {
  const networkName = NETWORKS[networkId as keyof typeof NETWORKS]?.name || networkId;
  
  try {
    // Only insert results that have valid latency
    const successfulResults = latencyResults.filter(r => r.status === 'success' && r.medianLatency !== null);
    
    if (successfulResults.length === 0) {
      console.log('No valid latency results to save to Supabase');
      return { success: true, error: null };
    }
    
    // Process each result - use batch insert since we might have multiple results
    const insertPromises = successfulResults.map(result => {
      return supabase
        .from('public_latency_test')
        .insert({
          network: networkName,
          origin_asn: geoInfo.asn,
          origin_host: geoInfo.isp, // Use ISP info instead of null
          origin_country: geoInfo.location ? geoInfo.location.split(', ')[2] : null,
          origin_city: geoInfo.location ? geoInfo.location.split(', ')[0] : null,
          origin_region: geoInfo.location ? geoInfo.location.split(', ')[1] : null,
          p50_latency: result.medianLatency,
          provider_name: result.provider,
          provider_endpoint: result.endpoint,
          minute_bucket: '' // Will be set by database trigger
        })
        .select();
    });
    
    const responseResults = await Promise.allSettled(insertPromises);
    
    // Check for any errors
    const errors = responseResults
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason);
    
    if (errors.length) {
      console.warn('Some latency results could not be saved:', errors);
      // Only return an error if all inserts failed
      if (errors.length === successfulResults.length) {
        return { success: false, error: 'Failed to save latency data to database' };
      }
    }
    
    console.log('Successfully saved latency data to Supabase');
    return { success: true, error: null };
    
  } catch (error) {
    console.error('Error saving latency data to Supabase:', error);
    return { success: false, error: 'Failed to save latency data to database' };
  }
};
