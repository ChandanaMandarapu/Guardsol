const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached data from localStorage
 * @param {string} type - Type of data (e.g., 'tokens', 'metadata', 'risk_score')
 * @param {string} key - Unique identifier (e.g., wallet address, token mint)
 * @returns {any|null} - Cached data or null if expired/missing
 */
export function getCachedData(type, key) {
  const cacheKey = `guardsol_${type}_${key}`;
  const cached = localStorage.getItem(cacheKey);

  if (!cached) {
    return null;
  }

  try {
    const { data, timestamp } = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`❌ Cache parse error for ${cacheKey}:`, error);
    localStorage.removeItem(cacheKey);
    return null;
  }
}

/**
 * Save data to localStorage cache
 * @param {string} type - Type of data
 * @param {string} key - Unique identifier
 * @param {any} data - Data to cache
 */
export function setCachedData(type, key, data) {
  const cacheKey = `guardsol_${type}_${key}`;

  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
  } catch (error) {
    console.error(`❌ Cache set error for ${cacheKey}:`, error);

    // If quota exceeded, clear old caches
    if (error.name === 'QuotaExceededError') {
      clearOldCaches();
      // Try again
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (retryError) {
        console.error('❌ Cache still full after cleanup:', retryError);
      }
    }
  }
}

/**
 * Clear specific cache entry
 * @param {string} type - Type of data
 * @param {string} key - Unique identifier
 */
export function clearCache(type, key) {
  const cacheKey = `guardsol_${type}_${key}`;
  localStorage.removeItem(cacheKey);
}

/**
 * Clear old/expired caches to free up space
 */
function clearOldCaches() {
  const now = Date.now();
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('guardsol_')) continue;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) continue;

      const { timestamp } = JSON.parse(cached);
      if (now - timestamp > CACHE_DURATION) {
        keysToRemove.push(key);
      }
    } catch (error) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}