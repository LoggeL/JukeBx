/**
 * JukeBx Data Preloader
 * Preloads critical data and resources for instant navigation
 */

import { api } from './api.js';

class DataPreloader {
    constructor() {
        this.preloadedData = new Map();
        this.preloadInProgress = new Set();
        this.priority = {
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3
        };
    }

    /**
     * Preload critical data on app init
     */
    async preloadCriticalData() {
        try {
            // Preload in parallel for speed
            const criticalRequests = [
                this.preload('playlists', () => api.getPlaylists(), this.priority.HIGH),
                this.preload('recentlyPlayed', () => api.getRecentlyPlayed(), this.priority.HIGH),
                this.preload('statistics', () => api.getStatistics(), this.priority.MEDIUM),
            ];

            await Promise.allSettled(criticalRequests);
            console.log('✅ Critical data preloaded');
        } catch (error) {
            console.error('Error preloading critical data:', error);
        }
    }

    /**
     * Preload data for a view before user navigates to it
     */
    async preloadView(viewName) {
        const preloadStrategies = {
            library: async () => {
                await Promise.all([
                    this.preload('library-playlists', () => api.getPlaylists()),
                    this.preload('library-artists', () => api.getArtists()),
                ]);
            },
            admin: async () => {
                await Promise.all([
                    this.preload('admin-tracks', () => api.getTracks()),
                    this.preload('admin-stats', () => api.getStatistics()),
                ]);
            },
            search: async () => {
                // Preload empty search state, nothing heavy needed
                return Promise.resolve();
            },
            home: async () => {
                await Promise.all([
                    this.preload('home-recent', () => api.getRecentlyPlayed()),
                    this.preload('home-popular', () => api.getPopularPlaylists()),
                ]);
            }
        };

        const strategy = preloadStrategies[viewName];
        if (strategy) {
            await strategy();
        }
    }

    /**
     * Preload data with caching
     */
    async preload(key, fetchFunction, priority = this.priority.MEDIUM) {
        // Return cached data if available
        if (this.preloadedData.has(key)) {
            return this.preloadedData.get(key);
        }

        // Avoid duplicate requests
        if (this.preloadInProgress.has(key)) {
            // Wait for existing request
            while (this.preloadInProgress.has(key)) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            return this.preloadedData.get(key);
        }

        try {
            this.preloadInProgress.add(key);
            const data = await fetchFunction();
            this.preloadedData.set(key, {
                data,
                timestamp: Date.now(),
                priority
            });
            return data;
        } catch (error) {
            console.error(`Error preloading ${key}:`, error);
            throw error;
        } finally {
            this.preloadInProgress.delete(key);
        }
    }

    /**
     * Get preloaded data
     */
    get(key) {
        const cached = this.preloadedData.get(key);
        if (!cached) return null;

        // Check if data is stale (older than 5 minutes)
        const isStale = (Date.now() - cached.timestamp) > 5 * 60 * 1000;
        if (isStale) {
            this.preloadedData.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Prefetch next likely navigation targets
     */
    prefetchLikelyTargets(currentView) {
        const navigationPatterns = {
            home: ['library', 'search'],
            search: ['library'],
            library: ['home'],
            admin: ['home'],
            playlist: ['library', 'home'],
            artist: ['library', 'home']
        };

        const targets = navigationPatterns[currentView] || [];
        
        // Preload with low priority in the background
        setTimeout(() => {
            targets.forEach(target => {
                this.preloadView(target).catch(err => {
                    console.debug('Background prefetch failed:', err);
                });
            });
        }, 1000); // Wait 1s before background prefetch
    }

    /**
     * Preload playlist details
     */
    async preloadPlaylist(playlistId) {
        return this.preload(`playlist-${playlistId}`, () => api.getPlaylist(playlistId));
    }

    /**
     * Preload artist details
     */
    async preloadArtist(artistName) {
        return this.preload(`artist-${artistName}`, () => api.getArtist(artistName));
    }

    /**
     * Clear old cache entries
     */
    clearStaleCache() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes

        for (const [key, value] of this.preloadedData.entries()) {
            if (now - value.timestamp > maxAge) {
                this.preloadedData.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.preloadedData.clear();
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.preloadedData.size,
            keys: Array.from(this.preloadedData.keys()),
            inProgress: Array.from(this.preloadInProgress)
        };
    }

    /**
     * Smart preload based on user behavior
     */
    intelligentPreload(context) {
        const { currentView, hoveredElement, scrollPosition } = context;

        // Preload on hover (intent detection)
        if (hoveredElement) {
            const playlistId = hoveredElement.dataset?.playlistId;
            const artistName = hoveredElement.dataset?.artistName;

            if (playlistId) {
                setTimeout(() => this.preloadPlaylist(playlistId), 200);
            }
            if (artistName) {
                setTimeout(() => this.preloadArtist(artistName), 200);
            }
        }

        // Preload based on scroll position
        if (scrollPosition && scrollPosition.nearBottom) {
            this.prefetchLikelyTargets(currentView);
        }
    }
}

// Export singleton
export const dataPreloader = new DataPreloader();

// Auto-cleanup stale cache every 5 minutes
setInterval(() => {
    dataPreloader.clearStaleCache();
}, 5 * 60 * 1000);
