/**
 * JukeBx Image Loader with Blurhash
 * Handles image preloading, blurhash placeholders, and lazy loading
 */

// Blurhash presets for different types of album covers
const BLURHASH_PRESETS = {
    warm: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    cool: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
    vibrant: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    dark: 'L15O;3_3%M%1~q9F$*xvM{NGROo0',
    light: 'L8L4}g^+4n%M~q4n?b-;-;D%D%-;',
};

class ImageLoader {
    constructor() {
        this.cache = new Map();
        this.loadingQueue = new Map();
        this.intersectionObserver = null;
        this.preloadQueue = [];
        this.maxConcurrentLoads = 6; // Browser-optimal concurrent requests
        this.currentLoads = 0;
        
        this.initIntersectionObserver();
    }

    /**
     * Initialize IntersectionObserver for lazy loading
     */
    initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.intersectionObserver.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px', // Start loading 50px before entering viewport
                    threshold: 0.01
                }
            );
        }
    }

    /**
     * Generate blurhash for a given type
     */
    generateBlurhash(type = 'vibrant', width = 32, height = 32) {
        if (!window.blurhash || !window.blurhash.decode) {
            console.warn('Blurhash library not loaded');
            return null;
        }

        try {
            const hash = BLURHASH_PRESETS[type] || BLURHASH_PRESETS.vibrant;
            const pixels = window.blurhash.decode(hash, width, height);
            
            // Create canvas and draw blurhash
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.createImageData(width, height);
            imageData.data.set(pixels);
            ctx.putImageData(imageData, 0, 0);
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error generating blurhash:', error);
            return null;
        }
    }

    /**
     * Create an image element with blurhash placeholder
     */
    createImageWithBlurhash(src, options = {}) {
        const {
            alt = '',
            blurhashType = 'vibrant',
            className = '',
            width = 300,
            height = 300,
            lazy = true
        } = options;

        const container = document.createElement('div');
        container.className = `image-container ${className}`;
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.width = '100%';
        container.style.height = '100%';

        // Create blurhash placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.position = 'absolute';
        placeholder.style.top = '0';
        placeholder.style.left = '0';
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.transition = 'opacity 0.3s ease';
        
        const blurhashUrl = this.generateBlurhash(blurhashType, 32, 32);
        if (blurhashUrl) {
            placeholder.style.backgroundImage = `url(${blurhashUrl})`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.filter = 'blur(20px)';
            placeholder.style.transform = 'scale(1.1)';
        } else {
            // Fallback gradient
            placeholder.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        }

        container.appendChild(placeholder);

        // Create actual image
        const img = document.createElement('img');
        img.alt = alt;
        img.className = 'lazy-image';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        // Store data for lazy loading
        img.dataset.src = src;
        img.dataset.loaded = 'false';

        // Load handler
        img.addEventListener('load', () => {
            img.style.opacity = '1';
            placeholder.style.opacity = '0';
            setTimeout(() => {
                if (placeholder.parentNode) {
                    placeholder.remove();
                }
            }, 300);
        });

        container.appendChild(img);

        // Start loading
        if (lazy && this.intersectionObserver) {
            this.intersectionObserver.observe(img);
        } else {
            this.loadImage(img);
        }

        return container;
    }

    /**
     * Load an image
     */
    async loadImage(imgElement) {
        const src = imgElement.dataset.src;
        if (!src || imgElement.dataset.loaded === 'true') {
            return;
        }

        // Check cache
        if (this.cache.has(src)) {
            imgElement.src = src;
            imgElement.dataset.loaded = 'true';
            return;
        }

        // Wait for loading slot
        await this.waitForLoadingSlot();

        try {
            this.currentLoads++;
            
            // Preload image
            const loadPromise = new Promise((resolve, reject) => {
                const tempImg = new Image();
                tempImg.onload = () => {
                    this.cache.set(src, true);
                    resolve();
                };
                tempImg.onerror = reject;
                tempImg.src = src;
            });

            await loadPromise;
            imgElement.src = src;
            imgElement.dataset.loaded = 'true';
        } catch (error) {
            console.error('Error loading image:', error);
            imgElement.dataset.loaded = 'error';
        } finally {
            this.currentLoads--;
            this.processNextInQueue();
        }
    }

    /**
     * Wait for a loading slot to become available
     */
    async waitForLoadingSlot() {
        while (this.currentLoads >= this.maxConcurrentLoads) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Process next item in queue
     */
    processNextInQueue() {
        if (this.preloadQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
            const next = this.preloadQueue.shift();
            if (next) {
                this.preloadImage(next);
            }
        }
    }

    /**
     * Preload images in background
     */
    preloadImages(urls) {
        urls.forEach(url => {
            if (!this.cache.has(url)) {
                this.preloadQueue.push(url);
            }
        });
        
        // Start processing
        while (this.currentLoads < this.maxConcurrentLoads && this.preloadQueue.length > 0) {
            this.processNextInQueue();
        }
    }

    /**
     * Preload a single image
     */
    async preloadImage(url) {
        if (this.cache.has(url)) return;

        await this.waitForLoadingSlot();
        
        try {
            this.currentLoads++;
            
            const img = new Image();
            const loadPromise = new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            img.src = url;
            await loadPromise;
            
            this.cache.set(url, true);
        } catch (error) {
            console.error('Error preloading image:', error);
        } finally {
            this.currentLoads--;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Disconnect observer (cleanup)
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }
}

// Export singleton
export const imageLoader = new ImageLoader();

/**
 * Helper function to create album cover with blurhash
 */
export function createAlbumCover(coverUrl, options = {}) {
    const {
        className = 'card-cover',
        fallbackIcon = 'fas fa-music',
        blurhashType = 'vibrant',
        size = 300
    } = options;

    if (coverUrl) {
        return imageLoader.createImageWithBlurhash(coverUrl, {
            className,
            blurhashType,
            width: size,
            height: size,
            lazy: true
        });
    } else {
        // Fallback to icon
        const fallback = document.createElement('div');
        fallback.className = className;
        fallback.innerHTML = `<i class="${fallbackIcon}"></i>`;
        return fallback;
    }
}
