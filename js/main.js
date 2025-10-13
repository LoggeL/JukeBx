/**
 * JukeBx - Main Application Entry Point
 * A sleek, self-hosted music streaming alternative
 * Powered by LMF (lmf.logge.top)
 * 
 * Performance Features:
 * - Blurhash placeholders for instant visual feedback
 * - Intelligent data preloading with hover intent detection
 * - Image lazy loading with IntersectionObserver
 * - Resource hints for optimal loading
 * - Virtual scrolling for large playlists
 * - GPU-accelerated animations
 */

import './ui.js';
import { dataPreloader } from './preloader.js';
import { imageLoader } from './imageLoader.js';

// Application initialization
console.log(`
     __  __  __ _  __ ____  ____       
    (  )(  )(  / )(  ) __ )(_  _)      
     )(__)(  )  (  )( )(_ \ _)(_       
    (______)(__)(__)(____) (____)      
    
    🎵 JukeBx - Your Music, Your Way
    Powered by LMF (lmf.logge.top)
    
    Version: 1.0.0
    Status: Ready
`);

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Prevent default drag and drop behavior
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space: Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const event = new CustomEvent('player:toggleplay');
        document.dispatchEvent(event);
    }
    
    // Arrow Left: Previous track
    if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        const event = new CustomEvent('player:previous');
        document.dispatchEvent(event);
    }
    
    // Arrow Right: Next track
    if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        const event = new CustomEvent('player:next');
        document.dispatchEvent(event);
    }
});

// Export app info for debugging
window.JukeBx = {
    version: '1.0.0',
    powered: 'LMF (lmf.logge.top)',
    repo: 'https://github.com/yourusername/jukebx'
};

// Development mode indicator
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Running in development mode');
    document.body.classList.add('dev-mode');
}

// Ready
console.log('✅ JukeBx initialized and ready!');
