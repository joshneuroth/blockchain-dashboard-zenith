
/**
 * Get color class based on response time
 */
export const getLatencyColor = (time: number | undefined): string => {
  if (time === undefined || isNaN(time)) return "text-gray-500";
  if (time < 80) return "text-green-600 dark:text-green-400";
  if (time < 120) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

/**
 * Format number with ms suffix
 */
export const formatLatency = (time: number | undefined): string => {
  if (time === undefined || isNaN(time)) return "N/A";
  return `${time.toFixed(2)} ms`;
};

/**
 * Get location name from the origin information
 */
export const getLocationName = (data: any[]): string => {
  // Check if any item has origin information
  const itemWithOrigin = data.find(item => 
    item.origin && (item.origin.city || item.origin.region || item.origin.country)
  );
  
  if (!itemWithOrigin || !itemWithOrigin.origin) return "Global";
  
  const { city, region, country } = itemWithOrigin.origin;
  if (city) return city;
  if (region) return region;
  if (country) return country;
  return "Global";
};
