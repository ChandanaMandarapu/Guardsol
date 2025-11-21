// Simple caching system using localStorage stores data with timestamp, expires after 24 hours

const CACHE_DURATION = 24 * 60 * 60 * 1000; 

// Generate cache key
function getCacheKey(prefix, identifier) {
  return `guardsol_${prefix}_${identifier}`;
}

// data from cache
export function getCachedData(prefix, identifier) {
  try {
    const key = getCacheKey(prefix, identifier);
    const cached = localStorage.getItem(key);
    
    if (!cached) {
      console.log('💾 Cache miss:', key);
      return null;
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    // Check if expired
    if (age > CACHE_DURATION) {
      console.log('💾 Cache expired:', key);
      localStorage.removeItem(key);
      return null;
    }
    
    console.log('✅ Cache hit:', key, `(${Math.floor(age / 1000 / 60)}min old)`);
    return data;
    
  } catch (error) {
    console.error('❌ Cache read error:', error);
    return null;
  }
}

// Store data in cache
export function setCachedData(prefix, identifier, data) {
  try {
    const key = getCacheKey(prefix, identifier);
    const cached = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(cached));
    console.log('💾 Cached:', key);
    
  } catch (error) {
    console.error('❌ Cache write error:', error);
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
    }
  }
}

// Clear cache for specific item
export function clearCache(prefix, identifier) {
  const key = getCacheKey(prefix, identifier);
  localStorage.removeItem(key);
  console.log('🗑️ Cleared cache:', key);
}

// Clear all old cache entries
export function clearOldCache() {
  console.log('🧹 Cleaning old cache...');
  
  let cleared = 0;
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (!key.startsWith('guardsol_')) return;
    
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      const age = Date.now() - cached.timestamp;
      
      if (age > CACHE_DURATION) {
        localStorage.removeItem(key);
        cleared++;
      }
    } catch (e) {
      localStorage.removeItem(key);
      cleared++;
    }
  });
  
  console.log('✅ Cleared', cleared, 'old entries');
}