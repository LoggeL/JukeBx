/**
 * JukeBx UI Controller
 * Handles all UI interactions and view management
 */

import { api } from './api.js';
import { player } from './player.js';
import { VirtualScroller, createTrackRow, createPlaylistCard, createTrackCard } from './virtualScroll.js';
import { dataPreloader } from './preloader.js';
import { imageLoader } from './imageLoader.js';

class UIController {
    constructor() {
        this.currentView = 'home';
        this.currentPlaylist = null;
        this.virtualScrollers = new Map();
        this.searchTimeout = null;
        this.userProfile = null;
        
        this.elements = {};
        this.init();
    }

    async init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupPlayerListeners();
        await this.loadInitialData();
    }

    cacheElements() {
        // Views
        this.elements.views = {
            home: document.getElementById('homeView'),
            search: document.getElementById('searchView'),
            library: document.getElementById('libraryView'),
            admin: document.getElementById('adminView'),
            playlist: document.getElementById('playlistView'),
            artist: document.getElementById('artistView')
        };

        // Navigation
        this.elements.navItems = document.querySelectorAll('.nav-item');
        this.elements.mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.sidebarToggle = document.getElementById('sidebarToggle');
        this.elements.sidebarToggleMobile = document.getElementById('sidebarToggleMobile');

        // Player
        this.elements.player = {
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            progressHandle: document.getElementById('progressHandle'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            volumeControl: document.getElementById('volumeControl'),
            volumeBtn: document.getElementById('volumeBtn'),
            playerTitle: document.getElementById('playerTitle'),
            playerArtist: document.getElementById('playerArtist'),
            playerCover: document.getElementById('playerCover'),
            likeTrack: document.getElementById('likeTrack')
        };

        // Queue
        this.elements.queueBtn = document.getElementById('queueBtn');
        this.elements.queueSidebar = document.getElementById('queueSidebar');
        this.elements.closeQueue = document.getElementById('closeQueue');
        this.elements.queueList = document.getElementById('queueList');

        // Search
        this.elements.globalSearch = document.getElementById('globalSearch');
        this.elements.searchResults = document.getElementById('searchResults');

        // Home
        this.elements.recentlyPlayed = document.getElementById('recentlyPlayed');
        this.elements.popularPlaylists = document.getElementById('popularPlaylists');

        // Library
        this.elements.libraryContent = document.getElementById('libraryContent');
        this.elements.libraryTabs = document.querySelectorAll('.tab-btn');

        // Admin
        this.elements.admin = {
            totalTracks: document.getElementById('totalTracks'),
            totalPlaylists: document.getElementById('totalPlaylists'),
            adminTracksTable: document.getElementById('adminTracksTable'),
            adminSearch: document.getElementById('adminSearch')
        };

        // Playlists
        this.elements.playlistsList = document.getElementById('playlistsList');
        this.elements.createPlaylist = document.getElementById('createPlaylist');
        this.elements.playlistTracks = document.getElementById('playlistTracks');
        this.elements.playlistTitle = document.getElementById('playlistTitle');
        this.elements.playlistDescription = document.getElementById('playlistDescription');
        this.elements.playlistTrackCount = document.getElementById('playlistTrackCount');
        this.elements.playlistDuration = document.getElementById('playlistDuration');
        this.elements.playPlaylist = document.getElementById('playPlaylist');
        this.elements.downloadPlaylist = document.getElementById('downloadPlaylist');
        this.elements.deletePlaylist = document.getElementById('deletePlaylist');

        // Profile Modal
        this.elements.userProfileBtn = document.getElementById('userProfile');
        this.elements.profileModal = document.getElementById('profileModal');
        this.elements.profileModalOverlay = document.getElementById('profileModalOverlay');
        this.elements.closeProfileModal = document.getElementById('closeProfileModal');
        this.elements.profileDisplayName = document.getElementById('profileDisplayName');
        this.elements.profileUsername = document.getElementById('profileUsername');
        this.elements.profileMemberSince = document.getElementById('profileMemberSince');
        this.elements.profileFollowers = document.getElementById('profileFollowers');
        this.elements.profileFollowing = document.getElementById('profileFollowing');
        this.elements.profilePlaylists = document.getElementById('profilePlaylists');
        
        // Profile Tabs
        this.elements.profileTabBtns = document.querySelectorAll('.profile-tab-btn');
        this.elements.profileInfoTab = document.getElementById('profileInfoTab');
        this.elements.profileStatsTab = document.getElementById('profileStatsTab');
        this.elements.profileSettingsTab = document.getElementById('profileSettingsTab');
        
        // Profile Info Form
        this.elements.editDisplayName = document.getElementById('editDisplayName');
        this.elements.editEmail = document.getElementById('editEmail');
        this.elements.editBio = document.getElementById('editBio');
        this.elements.saveProfileBtn = document.getElementById('saveProfileBtn');
        
        // Profile Stats
        this.elements.statsListeningTime = document.getElementById('statsListeningTime');
        this.elements.statsTotalTracks = document.getElementById('statsTotalTracks');
        this.elements.statsLikedSongs = document.getElementById('statsLikedSongs');
        this.elements.statsPlaylistsCreated = document.getElementById('statsPlaylistsCreated');
        this.elements.statsTopGenre = document.getElementById('statsTopGenre');
        this.elements.statsTopArtist = document.getElementById('statsTopArtist');
        
        // Profile Settings
        this.elements.settingAutoplay = document.getElementById('settingAutoplay');
        this.elements.settingCrossfade = document.getElementById('settingCrossfade');
        this.elements.settingNormalizeVolume = document.getElementById('settingNormalizeVolume');
        this.elements.settingExplicitContent = document.getElementById('settingExplicitContent');
        this.elements.settingSocialStats = document.getElementById('settingSocialStats');
        this.elements.settingPublicProfile = document.getElementById('settingPublicProfile');
        this.elements.settingLanguage = document.getElementById('settingLanguage');
        this.elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');

        // Artist View
        this.elements.artistName = document.getElementById('artistName');
        this.elements.artistBio = document.getElementById('artistBio');
        this.elements.artistFollowers = document.getElementById('artistFollowers');
        this.elements.artistTracksCount = document.getElementById('artistTracks');
        this.elements.artistTracksContainer = document.querySelector('#artistView .artist-tracks');
        this.elements.playArtist = document.getElementById('playArtist');
        this.elements.shuffleArtist = document.getElementById('shuffleArtist');
        this.elements.followArtist = document.getElementById('followArtist');
        
        // Artist Social Stats
        this.elements.artistSocialStats = document.getElementById('artistSocialStats');
        this.elements.toggleArtistStats = document.getElementById('toggleArtistStats');
        this.elements.artistStatsContent = document.getElementById('artistStatsContent');
        this.elements.artistListeningTime = document.getElementById('artistListeningTime');
        this.elements.artistPlayCount = document.getElementById('artistPlayCount');
        this.elements.artistLikedTracks = document.getElementById('artistLikedTracks');
        this.elements.artistRank = document.getElementById('artistRank');
        this.elements.artistTopTracks = document.getElementById('artistTopTracks');
        this.elements.artistTimeline = document.getElementById('artistTimeline');
    }

    setupEventListeners() {
        // Hover intent detection for smart preloading
        this.setupHoverIntentListeners();
        
        // Navigation
        [...this.elements.navItems, ...this.elements.mobileNavItems].forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);
            });
        });

        // Sidebar toggle (mobile)
        this.elements.sidebarToggle?.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('open');
        });

        this.elements.sidebarToggleMobile?.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('open');
        });

        // Player controls
        this.elements.player.playBtn.addEventListener('click', () => {
            player.togglePlayPause();
        });

        this.elements.player.prevBtn.addEventListener('click', () => {
            player.previous();
        });

        this.elements.player.nextBtn.addEventListener('click', () => {
            player.next();
        });

        this.elements.player.shuffleBtn.addEventListener('click', () => {
            const shuffleOn = player.toggleShuffle();
            this.elements.player.shuffleBtn.classList.toggle('active', shuffleOn);
        });

        this.elements.player.repeatBtn.addEventListener('click', () => {
            const repeat = player.toggleRepeat();
            this.elements.player.repeatBtn.classList.toggle('active', repeat !== 'none');
            if (repeat === 'one') {
                this.elements.player.repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
            } else {
                this.elements.player.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
            }
        });

        // Progress bar
        this.elements.player.progressBar.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            player.seek(position);
        });

        // Volume control
        this.elements.player.volumeControl.addEventListener('input', (e) => {
            player.setVolume(e.target.value / 100);
        });

        this.elements.player.volumeBtn.addEventListener('click', () => {
            if (player.volume > 0) {
                player.setVolume(0);
                this.elements.player.volumeControl.value = 0;
            } else {
                player.setVolume(0.7);
                this.elements.player.volumeControl.value = 70;
            }
        });

        // Like track
        this.elements.player.likeTrack.addEventListener('click', async () => {
            if (player.currentTrack) {
                const liked = await api.toggleLike(player.currentTrack.id);
                this.elements.player.likeTrack.innerHTML = liked 
                    ? '<i class="fas fa-heart"></i>'
                    : '<i class="far fa-heart"></i>';
            }
        });

        // Queue
        this.elements.queueBtn.addEventListener('click', () => {
            this.elements.queueSidebar.classList.toggle('hidden');
        });

        this.elements.closeQueue.addEventListener('click', () => {
            this.elements.queueSidebar.classList.add('hidden');
        });

        // Search
        this.elements.globalSearch.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        // Library tabs
        this.elements.libraryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.elements.libraryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadLibraryTab(tab.dataset.tab);
            });
        });

        // Create playlist
        this.elements.createPlaylist?.addEventListener('click', async () => {
            const name = prompt('Enter playlist name:');
            if (name) {
                try {
                    await api.createPlaylist(name);
                    await this.loadPlaylists();
                    this.showNotification('Playlist created successfully!', 'success');
                } catch (error) {
                    console.error('Error creating playlist:', error);
                    this.showNotification('Failed to create playlist', 'error');
                }
            }
        });

        // Play playlist
        this.elements.playPlaylist?.addEventListener('click', async () => {
            if (this.currentPlaylist) {
                const playlist = await api.getPlaylist(this.currentPlaylist.id);
                player.setQueue(playlist.tracks, 0);
            }
        });

        // Download playlist
        this.elements.downloadPlaylist?.addEventListener('click', async () => {
            if (this.currentPlaylist) {
                await this.downloadPlaylist(this.currentPlaylist.id);
            }
        });

        // Delete playlist
        this.elements.deletePlaylist?.addEventListener('click', async () => {
            if (this.currentPlaylist) {
                await this.deletePlaylistConfirm(this.currentPlaylist.id);
            }
        });

        // Profile button
        this.elements.userProfileBtn?.addEventListener('click', () => {
            this.showProfileModal();
        });

        // Close profile modal
        this.elements.closeProfileModal?.addEventListener('click', () => {
            this.hideProfileModal();
        });

        this.elements.profileModalOverlay?.addEventListener('click', () => {
            this.hideProfileModal();
        });

        // Profile tabs
        this.elements.profileTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.profileTab;
                this.switchProfileTab(tab);
            });
        });

        // Save profile
        this.elements.saveProfileBtn?.addEventListener('click', () => {
            this.saveProfile();
        });

        // Save settings
        this.elements.saveSettingsBtn?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Artist page actions
        this.elements.playArtist?.addEventListener('click', () => {
            if (this.currentArtist && this.currentArtist.tracks) {
                player.setQueue(this.currentArtist.tracks, 0);
            }
        });

        this.elements.shuffleArtist?.addEventListener('click', () => {
            if (this.currentArtist && this.currentArtist.tracks) {
                const shuffled = [...this.currentArtist.tracks].sort(() => Math.random() - 0.5);
                player.setQueue(shuffled, 0);
            }
        });

        this.elements.followArtist?.addEventListener('click', async () => {
            if (this.currentArtist) {
                const followed = await api.toggleFollowArtist(this.currentArtist.name);
                this.elements.followArtist.innerHTML = followed
                    ? '<i class="fas fa-heart"></i>'
                    : '<i class="far fa-heart"></i>';
            }
        });

        // Toggle artist stats
        this.elements.toggleArtistStats?.addEventListener('click', () => {
            const content = this.elements.artistStatsContent;
            const icon = this.elements.toggleArtistStats.querySelector('.expand-icon');
            
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                content.classList.add('expanded');
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('collapsed');
                content.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }

    setupPlayerListeners() {
        player.on('play', () => {
            this.elements.player.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });

        player.on('pause', () => {
            this.elements.player.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        player.on('trackchange', (track) => {
            this.updatePlayerUI(track);
        });

        player.on('timeupdate', ({ currentTime, duration }) => {
            this.updateProgress(currentTime, duration);
        });

        player.on('queuechange', (queue) => {
            this.updateQueue(queue);
        });

        player.on('queueindexchange', (index) => {
            this.highlightQueueIndex(index);
        });

        player.on('volumechange', (volume) => {
            this.updateVolumeIcon(volume);
        });
    }

    async loadInitialData() {
        try {
            // Preload critical data first
            await dataPreloader.preloadCriticalData();
            
            // Load UI with preloaded data
            await Promise.all([
                this.loadHomeData(),
                this.loadPlaylists(),
                this.loadUserProfile()
            ]);
            
            // Prefetch likely next views in background
            dataPreloader.prefetchLikelyTargets('home');
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadUserProfile() {
        try {
            this.userProfile = await api.getUserProfile();
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async loadHomeData() {
        try {
            // Try to get preloaded data first, fallback to API
            const recently = dataPreloader.get('home-recent') || dataPreloader.get('recentlyPlayed') || await api.getRecentlyPlayed();
            const popular = dataPreloader.get('home-popular') || await api.getPopularPlaylists();

            this.renderRecentlyPlayed(recently);
            this.renderPopularPlaylists(popular);
            
            // Preload album covers in background
            const coverUrls = [...recently, ...popular]
                .map(item => item.coverUrl)
                .filter(Boolean);
            imageLoader.preloadImages(coverUrls);
        } catch (error) {
            console.error('Error loading home data:', error);
        }
    }

    renderRecentlyPlayed(tracks) {
        this.elements.recentlyPlayed.innerHTML = '';
        tracks.forEach(track => {
            const card = createTrackCard(track);
            card.addEventListener('click', () => {
                player.setQueue([track], 0);
            });
            this.elements.recentlyPlayed.appendChild(card);
        });
    }

    renderPopularPlaylists(playlists) {
        this.elements.popularPlaylists.innerHTML = '';
        playlists.forEach(playlist => {
            const card = createPlaylistCard(playlist);
            card.addEventListener('click', () => {
                this.showPlaylist(playlist.id);
            });
            this.elements.popularPlaylists.appendChild(card);
        });
    }

    async loadPlaylists() {
        try {
            const playlists = await api.getPlaylists();
            this.elements.playlistsList.innerHTML = '';
            
            playlists.forEach(playlist => {
                const item = document.createElement('a');
                item.href = '#';
                item.className = 'playlist-item';
                item.textContent = playlist.name;
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPlaylist(playlist.id);
                });
                this.elements.playlistsList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    }

    async showPlaylist(playlistId) {
        try {
            const playlist = await api.getPlaylist(playlistId);
            this.currentPlaylist = playlist;
            
            this.elements.playlistTitle.textContent = playlist.name;
            this.elements.playlistDescription.textContent = playlist.description;
            this.elements.playlistTrackCount.textContent = `${playlist.tracks.length} songs`;
            
            const totalDuration = playlist.tracks.reduce((sum, t) => sum + t.duration, 0);
            this.elements.playlistDuration.textContent = `${Math.floor(totalDuration / 60)} min`;
            
            // Use virtual scrolling for tracks
            this.renderPlaylistTracks(playlist.tracks);
            
            this.switchView('playlist');
        } catch (error) {
            console.error('Error loading playlist:', error);
        }
    }

    renderPlaylistTracks(tracks) {
        // Clear existing scroller
        if (this.virtualScrollers.has('playlist')) {
            this.virtualScrollers.get('playlist').destroy();
        }

        this.elements.playlistTracks.innerHTML = '';
        
        // Create virtual scroller
        const scroller = new VirtualScroller(this.elements.playlistTracks, {
            itemHeight: 56,
            renderItem: (track, index) => createTrackRow(track, index, {
                onPlay: (track, index) => {
                    player.setQueue(tracks, index);
                }
            }),
            onItemClick: (track, index) => {
                player.setQueue(tracks, index);
            }
        });

        scroller.setItems(tracks);
        this.virtualScrollers.set('playlist', scroller);
    }

    async loadLibraryTab(tab) {
        this.elements.libraryContent.innerHTML = '<div class="loading">Loading...</div>';
        
        try {
            let items;
            switch (tab) {
                case 'playlists':
                    items = await api.getPlaylists();
                    this.renderLibraryPlaylists(items);
                    break;
                case 'songs':
                    items = await api.getTracks();
                    this.renderLibrarySongs(items);
                    break;
                case 'artists':
                    items = await api.getArtists();
                    this.renderLibraryArtists(items);
                    break;
                case 'albums':
                    items = await api.getAlbums();
                    this.renderLibraryAlbums(items);
                    break;
            }
        } catch (error) {
            console.error('Error loading library tab:', error);
            this.elements.libraryContent.innerHTML = '<div class="error">Error loading content</div>';
        }
    }

    renderLibraryPlaylists(playlists) {
        this.elements.libraryContent.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'horizontal-scroll';
        
        playlists.forEach(playlist => {
            const card = createPlaylistCard(playlist);
            card.addEventListener('click', () => this.showPlaylist(playlist.id));
            grid.appendChild(card);
        });
        
        this.elements.libraryContent.appendChild(grid);
    }

    renderLibrarySongs(tracks) {
        this.elements.libraryContent.innerHTML = '';
        const container = document.createElement('div');
        container.style.height = '600px';
        container.style.overflow = 'auto';
        
        const scroller = new VirtualScroller(container, {
            itemHeight: 56,
            renderItem: (track, index) => createTrackRow(track, index, {
                onPlay: (track, index) => player.setQueue(tracks, index)
            })
        });
        
        scroller.setItems(tracks);
        this.elements.libraryContent.appendChild(container);
    }

    renderLibraryArtists(artists) {
        this.elements.libraryContent.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'horizontal-scroll';
        
        artists.forEach(artist => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-cover" style="border-radius: 50%;">
                    <i class="fas fa-user"></i>
                </div>
                <div class="card-title">${artist.name}</div>
                <div class="card-subtitle">Artist</div>
            `;
            card.addEventListener('click', () => this.showArtist(artist.name));
            grid.appendChild(card);
        });
        
        this.elements.libraryContent.appendChild(grid);
    }

    renderLibraryAlbums(albums) {
        this.elements.libraryContent.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'horizontal-scroll';
        
        albums.forEach(album => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-cover">
                    <i class="fas fa-compact-disc"></i>
                </div>
                <div class="card-title">${album.title}</div>
                <div class="card-subtitle">${album.artist}</div>
            `;
            grid.appendChild(card);
        });
        
        this.elements.libraryContent.appendChild(grid);
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.elements.searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Search for your favorite music</p>
                </div>
            `;
            return;
        }

        this.elements.searchResults.innerHTML = '<div class="loading">Searching...</div>';

        try {
            const results = await api.search(query);
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.elements.searchResults.innerHTML = '<div class="error">Search failed</div>';
        }
    }

    renderSearchResults(results) {
        this.elements.searchResults.innerHTML = '';

        // Check if we have multi-source results (new format)
        if (results.youtube || results.soundcloud || results.deezer || results.local) {
            // Render results by source
            const sources = [
                { key: 'local', name: 'Your Library', icon: 'fas fa-music' },
                { key: 'youtube', name: 'YouTube', icon: 'fab fa-youtube' },
                { key: 'soundcloud', name: 'SoundCloud', icon: 'fab fa-soundcloud' },
                { key: 'deezer', name: 'Deezer', icon: 'fab fa-deezer' }
            ];

            let hasResults = false;

            sources.forEach(({ key, name, icon }) => {
                if (results[key] && results[key].length > 0) {
                    hasResults = true;
                    const section = document.createElement('div');
                    section.className = `search-source-section ${key}`;
                    
                    const header = document.createElement('h3');
                    header.innerHTML = `<i class="${icon}"></i> ${name}`;
                    section.appendChild(header);
                    
                    const grid = document.createElement('div');
                    grid.className = 'horizontal-scroll';
                    
                    results[key].forEach(track => {
                        const card = createTrackCard(track);
                        card.addEventListener('click', () => {
                            if (track.source === 'local' || track.downloadStatus === 'downloaded') {
                                player.setQueue([track], 0);
                            } else {
                                // Show add to library option
                                this.showAddTrackPrompt(track);
                            }
                        });
                        grid.appendChild(card);
                    });
                    
                    section.appendChild(grid);
                    this.elements.searchResults.appendChild(section);
                }
            });

            if (!hasResults) {
                this.elements.searchResults.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No results found across any source</p>
                    </div>
                `;
            }
        } else {
            // Old format support (backward compatible)
            if (results.tracks && results.tracks.length > 0) {
                const section = document.createElement('section');
                section.className = 'content-section';
                section.innerHTML = '<h2>Songs</h2>';
                
                const grid = document.createElement('div');
                grid.className = 'horizontal-scroll';
                
                results.tracks.slice(0, 10).forEach(track => {
                    const card = createTrackCard(track);
                    card.addEventListener('click', () => player.setQueue([track], 0));
                    grid.appendChild(card);
                });
                
                section.appendChild(grid);
                this.elements.searchResults.appendChild(section);
            }

            if (!results.tracks || results.tracks.length === 0) {
                this.elements.searchResults.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No results found</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Show prompt to add track to library
     */
    showAddTrackPrompt(track) {
        const message = `"${track.title}" is not in your library. Would you like to add it?`;
        if (confirm(message)) {
            this.addTrackToLibrary(track);
        }
    }

    /**
     * Add track to library (download on-demand)
     */
    async addTrackToLibrary(track) {
        try {
            this.showNotification(`Adding "${track.title}" to your library...`, 'info');
            
            // Update UI to show downloading status
            const trackElements = document.querySelectorAll(`[data-track-id="${track.id}"]`);
            trackElements.forEach(el => {
                const statusBadge = el.querySelector('.download-status');
                if (statusBadge) {
                    statusBadge.className = 'download-status downloading';
                    statusBadge.innerHTML = '<i class="fas fa-spinner"></i> Downloading';
                }
            });
            
            const result = await api.addTrackToLibrary(track);
            
            if (result.success) {
                this.showNotification(`"${track.title}" added to your library!`, 'success');
                
                // Update UI to show downloaded status
                trackElements.forEach(el => {
                    const statusBadge = el.querySelector('.download-status');
                    if (statusBadge) {
                        statusBadge.remove();
                    }
                    const sourceBadge = el.querySelector('.source-badge');
                    if (sourceBadge) {
                        sourceBadge.className = 'source-badge local';
                        sourceBadge.textContent = 'local';
                    }
                });
            }
        } catch (error) {
            console.error('Error adding track to library:', error);
            this.showNotification('Failed to add track to library', 'error');
        }
    }

    async loadAdminData() {
        try {
            const [stats, tracks] = await Promise.all([
                api.getStatistics(),
                api.getTracks()
            ]);

            this.elements.admin.totalTracks.textContent = stats.totalTracks;
            this.elements.admin.totalPlaylists.textContent = stats.totalPlaylists;

            this.renderAdminTracksTable(tracks);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    renderAdminTracksTable(tracks) {
        if (this.virtualScrollers.has('admin')) {
            this.virtualScrollers.get('admin').destroy();
        }

        this.elements.admin.adminTracksTable.innerHTML = '';
        
        const scroller = new VirtualScroller(this.elements.admin.adminTracksTable, {
            itemHeight: 56,
            renderItem: (track, index) => createTrackRow(track, index, {
                showAlbum: true,
                onPlay: (track, index) => player.setQueue(tracks, index)
            })
        });

        scroller.setItems(tracks);
        this.virtualScrollers.set('admin', scroller);
    }

    switchView(viewName) {
        // Hide all views
        Object.values(this.elements.views).forEach(view => {
            view.classList.add('hidden');
        });

        // Show selected view
        if (this.elements.views[viewName]) {
            this.elements.views[viewName].classList.remove('hidden');
            this.currentView = viewName;

            // Preload view data before loading
            dataPreloader.preloadView(viewName).then(() => {
                // Load view data if needed
                if (viewName === 'library') {
                    this.loadLibraryTab('playlists');
                } else if (viewName === 'admin') {
                    this.loadAdminData();
                }
            });
            
            // Prefetch likely next views
            dataPreloader.prefetchLikelyTargets(viewName);
        }

        // Update navigation
        [...this.elements.navItems, ...this.elements.mobileNavItems].forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.elements.sidebar.classList.remove('open');
        }
    }

    updatePlayerUI(track) {
        if (!track) return;

        this.elements.player.playerTitle.textContent = track.title;
        this.elements.player.playerArtist.textContent = track.artist;
        
        this.elements.player.likeTrack.innerHTML = track.liked 
            ? '<i class="fas fa-heart"></i>'
            : '<i class="far fa-heart"></i>';
    }

    updateProgress(currentTime, duration) {
        if (!duration || isNaN(duration)) return;

        const progress = (currentTime / duration) * 100;
        this.elements.player.progressFill.style.width = `${progress}%`;
        this.elements.player.progressHandle.style.left = `${progress}%`;

        this.elements.player.currentTime.textContent = player.constructor.formatTime(currentTime);
        this.elements.player.totalTime.textContent = player.constructor.formatTime(duration);
    }

    updateQueue(queue) {
        this.elements.queueList.innerHTML = '';
        
        queue.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            if (index === player.queueIndex) {
                item.classList.add('playing');
            }
            
            item.innerHTML = `
                <div class="track-cover">
                    <i class="fas fa-music"></i>
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                player.playFromQueue(index);
            });
            
            this.elements.queueList.appendChild(item);
        });
    }

    highlightQueueIndex(currentIndex) {
        const items = this.elements.queueList.querySelectorAll('.queue-item');
        items.forEach((el, index) => {
            el.classList.toggle('playing', index === currentIndex);
        });
    }

    updateVolumeIcon(volume) {
        let icon = 'fa-volume-up';
        if (volume === 0) {
            icon = 'fa-volume-mute';
        } else if (volume < 0.5) {
            icon = 'fa-volume-down';
        }
        this.elements.player.volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    // Profile Modal Methods
    async showProfileModal() {
        try {
            // Load/refresh profile data
            await this.loadUserProfile();
            this.populateProfile();
            
            // Show modal
            this.elements.profileModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Failed to load profile data');
        }
    }

    hideProfileModal() {
        this.elements.profileModal.classList.add('hidden');
    }

    populateProfile() {
        if (!this.userProfile) return;

        // Header info
        this.elements.profileDisplayName.textContent = this.userProfile.displayName;
        this.elements.profileUsername.textContent = `@${this.userProfile.username}`;
        
        const memberDate = new Date(this.userProfile.memberSince);
        this.elements.profileMemberSince.textContent = 
            `Member since ${memberDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        
        // Stats header
        this.elements.profileFollowers.textContent = this.userProfile.followersCount;
        this.elements.profileFollowing.textContent = this.userProfile.followingCount;
        this.elements.profilePlaylists.textContent = this.userProfile.statistics.playlistsCreated;

        // Profile info form
        this.elements.editDisplayName.value = this.userProfile.displayName;
        this.elements.editEmail.value = this.userProfile.email;
        this.elements.editBio.value = this.userProfile.bio;

        // Statistics
        const listeningHours = Math.floor(this.userProfile.statistics.totalListeningTime / 60);
        this.elements.statsListeningTime.textContent = `${listeningHours.toLocaleString()} hours`;
        this.elements.statsTotalTracks.textContent = this.userProfile.statistics.totalTracks.toLocaleString();
        this.elements.statsLikedSongs.textContent = this.userProfile.statistics.likedSongs.toLocaleString();
        this.elements.statsPlaylistsCreated.textContent = this.userProfile.statistics.playlistsCreated;
        this.elements.statsTopGenre.textContent = this.userProfile.statistics.topGenre;
        this.elements.statsTopArtist.textContent = this.userProfile.statistics.topArtist;

        // Settings
        this.elements.settingAutoplay.checked = this.userProfile.preferences.autoplay;
        this.elements.settingCrossfade.checked = this.userProfile.preferences.crossfade;
        this.elements.settingNormalizeVolume.checked = this.userProfile.preferences.normalizeVolume;
        this.elements.settingExplicitContent.checked = this.userProfile.preferences.showExplicitContent;
        this.elements.settingSocialStats.checked = this.userProfile.preferences.socialStats ?? true;
        this.elements.settingPublicProfile.checked = this.userProfile.preferences.publicProfile ?? false;
        this.elements.settingLanguage.value = this.userProfile.preferences.language;
    }

    switchProfileTab(tab) {
        // Update tab buttons
        this.elements.profileTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.profileTab === tab);
        });

        // Update tab content
        this.elements.profileInfoTab.classList.toggle('hidden', tab !== 'info');
        this.elements.profileStatsTab.classList.toggle('hidden', tab !== 'stats');
        this.elements.profileSettingsTab.classList.toggle('hidden', tab !== 'settings');
    }

    async saveProfile() {
        try {
            const updates = {
                displayName: this.elements.editDisplayName.value,
                email: this.elements.editEmail.value,
                bio: this.elements.editBio.value
            };

            const btn = this.elements.saveProfileBtn;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            this.userProfile = await api.updateUserProfile(updates);
            
            // Update header display
            this.elements.profileDisplayName.textContent = this.userProfile.displayName;
            this.elements.profileUsername.textContent = `@${this.userProfile.username}`;

            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }, 2000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
            this.elements.saveProfileBtn.disabled = false;
            this.elements.saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    }

    async saveSettings() {
        try {
            const preferences = {
                autoplay: this.elements.settingAutoplay.checked,
                crossfade: this.elements.settingCrossfade.checked,
                normalizeVolume: this.elements.settingNormalizeVolume.checked,
                showExplicitContent: this.elements.settingExplicitContent.checked,
                socialStats: this.elements.settingSocialStats.checked,
                publicProfile: this.elements.settingPublicProfile.checked,
                language: this.elements.settingLanguage.value
            };

            const btn = this.elements.saveSettingsBtn;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            await api.updateUserPreferences(preferences);
            this.userProfile.preferences = preferences;

            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
            }, 2000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
            this.elements.saveSettingsBtn.disabled = false;
            this.elements.saveSettingsBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
        }
    }

    /**
     * Show artist detail page
     */
    async showArtist(artistName) {
        try {
            const artist = await api.getArtist(artistName);
            this.currentArtist = artist;
            
            // Update artist info
            this.elements.artistName.textContent = artist.name;
            this.elements.artistBio.textContent = artist.bio || 'No biography available';
            this.elements.artistFollowers.textContent = `${artist.followers?.toLocaleString() || 0} followers`;
            this.elements.artistTracksCount.textContent = `${artist.trackCount} tracks`;
            
            // Update follow button
            this.elements.followArtist.innerHTML = artist.followed
                ? '<i class="fas fa-heart"></i>'
                : '<i class="far fa-heart"></i>';
            
            // Check if social stats are enabled
            if (this.userProfile?.preferences?.socialStats) {
                this.elements.artistSocialStats.style.display = 'block';
                await this.loadArtistStats(artistName);
            } else {
                this.elements.artistSocialStats.style.display = 'none';
            }
            
            // Render artist tracks
            this.renderArtistTracks(artist.tracks);
            
            this.switchView('artist');
        } catch (error) {
            console.error('Error loading artist:', error);
            this.showNotification('Failed to load artist', 'error');
        }
    }

    /**
     * Load and display artist listening statistics
     */
    async loadArtistStats(artistName) {
        try {
            const stats = await api.getArtistStats(artistName);
            
            // Update stat cards
            this.elements.artistListeningTime.textContent = `${stats.listeningTime.toLocaleString()} hours`;
            this.elements.artistPlayCount.textContent = stats.playCount.toLocaleString();
            this.elements.artistLikedTracks.textContent = stats.likedTracks;
            this.elements.artistRank.textContent = `#${stats.rank}`;
            
            // Render top tracks
            this.renderArtistTopTracks(stats.topTracks);
            
            // Render timeline chart
            this.renderArtistTimeline(stats.timeline);
        } catch (error) {
            console.error('Error loading artist stats:', error);
        }
    }

    /**
     * Render artist's top tracks for this user
     */
    renderArtistTopTracks(topTracks) {
        this.elements.artistTopTracks.innerHTML = '';
        
        topTracks.forEach((track, index) => {
            const trackEl = document.createElement('div');
            trackEl.className = 'top-track-item';
            trackEl.innerHTML = `
                <span class="track-rank">${index + 1}</span>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-plays">${track.userPlayCount} plays</div>
                </div>
                <button class="btn-icon play-track">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            trackEl.querySelector('.play-track').addEventListener('click', (e) => {
                e.stopPropagation();
                player.setQueue([track], 0);
            });
            
            this.elements.artistTopTracks.appendChild(trackEl);
        });
    }

    /**
     * Render listening timeline chart
     */
    renderArtistTimeline(timeline) {
        this.elements.artistTimeline.innerHTML = '';
        
        const maxHours = Math.max(...timeline.map(t => t.hours));
        
        timeline.forEach(period => {
            const barHeight = (period.hours / maxHours) * 100;
            
            const barEl = document.createElement('div');
            barEl.className = 'timeline-bar';
            barEl.innerHTML = `
                <div class="bar" style="height: ${barHeight}%">
                    <span class="bar-value">${period.hours}h</span>
                </div>
                <div class="bar-label">${period.month}</div>
            `;
            
            this.elements.artistTimeline.appendChild(barEl);
        });
    }

    /**
     * Render artist tracks with virtual scrolling
     */
    renderArtistTracks(tracks) {
        // Clear existing scroller
        if (this.virtualScrollers.has('artist')) {
            this.virtualScrollers.get('artist').destroy();
        }

        this.elements.artistTracksContainer.innerHTML = '';
        
        // Create virtual scroller
        const scroller = new VirtualScroller(this.elements.artistTracksContainer, {
            itemHeight: 56,
            renderItem: (track, index) => createTrackRow(track, index, {
                onPlay: (track, index) => {
                    player.setQueue(tracks, index);
                }
            }),
            onItemClick: (track, index) => {
                player.setQueue(tracks, index);
            }
        });

        scroller.setItems(tracks);
        this.virtualScrollers.set('artist', scroller);
    }

    /**
     * Download playlist
     */
    async downloadPlaylist(playlistId) {
        const btn = this.elements.downloadPlaylist;
        const originalHTML = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const result = await api.downloadPlaylist(playlistId);
            this.showNotification(`Playlist downloaded successfully! (${result.tracksCount} tracks)`, 'success');
        } catch (error) {
            console.error('Error downloading playlist:', error);
            this.showNotification('Failed to download playlist', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    }

    /**
     * Delete playlist with confirmation
     */
    async deletePlaylistConfirm(playlistId) {
        const playlist = this.currentPlaylist;
        if (!playlist) return;

        const confirmed = confirm(
            `Are you sure you want to delete "${playlist.name}"?\\n\\n` +
            `This will permanently remove the playlist and cannot be undone.`
        );

        if (!confirmed) return;

        const btn = this.elements.deletePlaylist;
        const originalHTML = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            await api.deletePlaylist(playlistId);
            this.showNotification('Playlist deleted successfully', 'success');
            
            // Refresh playlists list
            await this.loadPlaylists();
            
            // Navigate back to home
            this.switchView('home');
        } catch (error) {
            console.error('Error deleting playlist:', error);
            this.showNotification('Failed to delete playlist', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    }

    /**
     * Download individual track
     */
    async downloadTrack(trackId) {
        try {
            this.showNotification('Starting download...', 'info');
            await api.downloadTrack(trackId);
            this.showNotification('Track downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading track:', error);
            this.showNotification('Failed to download track', 'error');
        }
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Setup hover intent detection for intelligent preloading
     */
    setupHoverIntentListeners() {
        let hoverTimeout = null;
        const hoverDelay = 200; // ms to wait before triggering preload

        // Listen for hover on cards
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                // Intelligent preload based on hovered element
                dataPreloader.intelligentPreload({
                    currentView: this.currentView,
                    hoveredElement: card
                });

                // Preload playlist details
                const playlistId = card.dataset.playlistId;
                if (playlistId) {
                    dataPreloader.preloadPlaylist(playlistId);
                }

                // Preload artist details
                const artistName = card.dataset.artistName;
                if (artistName) {
                    dataPreloader.preloadArtist(artistName);
                }
            }, hoverDelay);
        });

        // Clear timeout on mouseout
        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                clearTimeout(hoverTimeout);
            }
        });

        // Preload on navigation hover
        [...this.elements.navItems, ...this.elements.mobileNavItems].forEach(item => {
            item.addEventListener('mouseenter', () => {
                const view = item.dataset.view;
                if (view && view !== this.currentView) {
                    setTimeout(() => {
                        dataPreloader.preloadView(view);
                    }, 300);
                }
            });
        });
    }
}

export const ui = new UIController();
