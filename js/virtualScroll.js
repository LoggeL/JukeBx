/**
 * Virtual Scrolling Implementation
 * Optimized for rendering large playlists efficiently
 */

export class VirtualScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.items = [];
        this.itemHeight = options.itemHeight || 56;
        this.buffer = options.buffer || 5; // Extra items to render above/below viewport
        this.renderItem = options.renderItem || ((item) => item.toString());
        this.onItemClick = options.onItemClick || (() => {});
        
        this.viewportHeight = 0;
        this.scrollTop = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        
        this.scrollContainer = null;
        this.contentContainer = null;
        
        this.init();
    }

    init() {
        // Create scroll container
        this.container.style.position = 'relative';
        this.container.style.overflow = 'auto';
        
        // Create content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.position = 'relative';
        this.container.appendChild(this.contentContainer);
        
        // Setup scroll listener
        this.container.addEventListener('scroll', () => this.handleScroll());
        
        // Setup resize observer
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
        
        this.handleResize();
    }

    setItems(items) {
        this.items = items;
        this.updateTotalHeight();
        this.render();
    }

    updateTotalHeight() {
        const totalHeight = this.items.length * this.itemHeight;
        this.contentContainer.style.height = `${totalHeight}px`;
    }

    handleScroll() {
        this.scrollTop = this.container.scrollTop;
        this.render();
    }

    handleResize() {
        this.viewportHeight = this.container.clientHeight;
        this.render();
    }

    calculateVisibleRange() {
        const start = Math.floor(this.scrollTop / this.itemHeight);
        const end = Math.ceil((this.scrollTop + this.viewportHeight) / this.itemHeight);
        
        this.visibleStart = Math.max(0, start - this.buffer);
        this.visibleEnd = Math.min(this.items.length, end + this.buffer);
    }

    render() {
        this.calculateVisibleRange();
        
        // Clear existing content
        this.contentContainer.innerHTML = '';
        
        // Create a wrapper for visible items
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = `${this.visibleStart * this.itemHeight}px`;
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        
        // Render visible items
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.items[i];
            const element = this.renderItem(item, i);
            
            if (typeof element === 'string') {
                const div = document.createElement('div');
                div.innerHTML = element;
                div.style.height = `${this.itemHeight}px`;
                div.addEventListener('click', () => this.onItemClick(item, i));
                wrapper.appendChild(div);
            } else {
                element.style.height = `${this.itemHeight}px`;
                element.addEventListener('click', () => this.onItemClick(item, i));
                wrapper.appendChild(element);
            }
        }
        
        this.contentContainer.appendChild(wrapper);
    }

    scrollToIndex(index) {
        const scrollTop = index * this.itemHeight;
        this.container.scrollTop = scrollTop;
    }

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}

/**
 * Create a track row element for virtual scrolling
 */
export function createTrackRow(track, index, options = {}) {
    const { showAlbum = true, showNumber = true, onPlay, onMenu, onDownload } = options;
    
    const row = document.createElement('div');
    row.className = 'track-row';
    row.dataset.trackId = track.id;
    
    // Track number or play button
    const numberCell = document.createElement('div');
    numberCell.className = 'track-number';
    if (showNumber) {
        numberCell.textContent = index + 1;
    }
    row.appendChild(numberCell);
    
    // Track info (title + artist)
    const infoCell = document.createElement('div');
    infoCell.className = 'track-info';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'track-name';
    titleDiv.textContent = track.title;
    infoCell.appendChild(titleDiv);
    
    const artistDiv = document.createElement('div');
    artistDiv.className = 'track-artist';
    artistDiv.textContent = track.artist;
    infoCell.appendChild(artistDiv);
    
    row.appendChild(infoCell);
    
    // Album (optional)
    if (showAlbum) {
        const albumCell = document.createElement('div');
        albumCell.className = 'track-album';
        albumCell.textContent = track.album;
        row.appendChild(albumCell);
    }
    
    // Duration
    const durationCell = document.createElement('div');
    durationCell.className = 'track-duration';
    durationCell.textContent = formatDuration(track.duration);
    row.appendChild(durationCell);
    
    // Actions
    const actionsCell = document.createElement('div');
    actionsCell.className = 'track-actions';
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-icon';
    downloadBtn.title = 'Download track';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        if (onDownload) {
            onDownload(track);
        } else {
            // Import ui dynamically to avoid circular dependency
            import('./ui.js').then(module => {
                module.ui.downloadTrack(track.id);
            });
        }
    };
    actionsCell.appendChild(downloadBtn);
    
    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-icon';
    moreBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    moreBtn.onclick = (e) => {
        e.stopPropagation();
        if (onMenu) onMenu(track, e);
    };
    actionsCell.appendChild(moreBtn);
    
    row.appendChild(actionsCell);
    
    // Click handler
    if (onPlay) {
        row.onclick = () => onPlay(track, index);
    }
    
    return row;
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a playlist card element
 */
export function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.playlistId = playlist.id;
    
    const cover = document.createElement('div');
    cover.className = 'card-cover';
    if (playlist.coverUrl) {
        const img = document.createElement('img');
        img.src = playlist.coverUrl;
        img.alt = playlist.name;
        cover.appendChild(img);
    } else {
        cover.innerHTML = '<i class="fas fa-music"></i>';
    }
    
    const playBtn = document.createElement('button');
    playBtn.className = 'card-play';
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    cover.appendChild(playBtn);
    
    card.appendChild(cover);
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = playlist.name;
    card.appendChild(title);
    
    const subtitle = document.createElement('div');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = playlist.description || `${playlist.trackCount} songs`;
    card.appendChild(subtitle);
    
    return card;
}

/**
 * Create a track card element
 */
export function createTrackCard(track) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.trackId = track.id;
    
    const cover = document.createElement('div');
    cover.className = 'card-cover';
    if (track.coverUrl) {
        const img = document.createElement('img');
        img.src = track.coverUrl;
        img.alt = track.title;
        cover.appendChild(img);
    } else {
        cover.innerHTML = '<i class="fas fa-music"></i>';
    }
    
    const playBtn = document.createElement('button');
    playBtn.className = 'card-play';
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    cover.appendChild(playBtn);
    
    card.appendChild(cover);
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = track.title;
    card.appendChild(title);
    
    const subtitle = document.createElement('div');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = track.artist;
    card.appendChild(subtitle);
    
    return card;
}
