// Aggressive caching to protect free tier

const RPC_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (longer than normal)

class RPCCache {
    constructor() {
        this.cache = new Map();
    }

    getCacheKey(method, params) {
        return `${method}_${JSON.stringify(params)}`;
    }

    get(method, params) {
        const key = this.getCacheKey(method, params);
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Check if expired
        if (Date.now() - cached.timestamp > RPC_CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        console.log('🎯 RPC Cache HIT:', method);
        return cached.data;
    }

    set(method, params, data) {
        const key = this.getCacheKey(method, params);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        console.log('💾 RPC Cached:', method);
    }

    clear() {
        this.cache.clear();
    }

    // Cleanup old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > RPC_CACHE_DURATION) {
                this.cache.delete(key);
            }
        }
    }
}

export const rpcCache = new RPCCache();

// Cleanup every 5 minutes
setInterval(() => rpcCache.cleanup(), 5 * 60 * 1000);
