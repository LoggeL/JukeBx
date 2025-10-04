/**
 * JukeBx UI Controller
 * Handles all UI interactions and view management
 */

import { api } from './api.js';
import { player } from './player.js';
import { VirtualScroller, createTrackRow, createPlaylistCard, createTrackCard } from './virtualScroll.js';

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
            playlist: document.getElementById('playlistView')
        };

        // Navigation
        this.elements.navItems = document.querySelectorAll('.nav-item');
        this.elements.mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.sidebarToggle = document.getElementById('sidebarToggle');

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
        this.elements.recommendedTracks = document.getElementById('recommendedTracks');

        // Library
        this.elements.libraryContent = document.getElementById('libraryContent');
        this.elements.libraryTabs = document.querySelectorAll('.tab-btn');

        // Admin
        this.elements.admin = {
            totalTracks: document.getElementById('totalTracks'),
            totalPlaylists: document.getElementById('totalPlaylists'),
            totalArtists: document.getElementById('totalArtists'),
            totalAlbums: document.getElementById('totalAlbums'),
            scanLibrary: document.getElementById('scanLibrary'),
            uploadMusic: document.getElementById('uploadMusic'),
            adminTracksTable: document.getElementById('adminTracksTable'),
            adminSearch: document.getElementById('adminSearch'),
            sortBy: document.getElementById('sortBy')
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
        this.elements.settingLanguage = document.getElementById('settingLanguage');
        this.elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    }

    setupEventListeners() {
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

        // Admin actions
        this.elements.admin.scanLibrary?.addEventListener('click', async () => {
            const btn = this.elements.admin.scanLibrary;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Scanning...';
            
            try {
                const result = await api.scanLibrary();
                alert(`Scan complete! Found ${result.tracksFound} new tracks.`);
                await this.loadAdminData();
            } catch (error) {
                alert('Scan failed: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync"></i> Scan Library';
            }
        });

        this.elements.admin.uploadMusic?.addEventListener('click', () => {
            alert('Upload functionality would open a file picker here.\nIn production, this would connect to the LMF backend.');
        });

        // Create playlist
        this.elements.createPlaylist?.addEventListener('click', () => {
            const name = prompt('Enter playlist name:');
            if (name) {
                alert(`Playlist "${name}" created!\nIn production, this would save to the backend.`);
                this.loadPlaylists();
            }
        });

        // Play playlist
        this.elements.playPlaylist?.addEventListener('click', async () => {
            if (this.currentPlaylist) {
                const playlist = await api.getPlaylist(this.currentPlaylist.id);
                player.setQueue(playlist.tracks, 0);
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

        player.on('volumechange', (volume) => {
            this.updateVolumeIcon(volume);
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadHomeData(),
                this.loadPlaylists()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadHomeData() {
        try {
            const [recently, popular, recommended] = await Promise.all([
                api.getRecentlyPlayed(),
                api.getPopularPlaylists(),
                api.getRecommendedTracks()
            ]);

            this.renderRecentlyPlayed(recently);
            this.renderPopularPlaylists(popular);
            this.renderRecommendedTracks(recommended);
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

    renderRecommendedTracks(tracks) {
        this.elements.recommendedTracks.innerHTML = '';
        tracks.forEach(track => {
            const card = createTrackCard(track);
            card.addEventListener('click', () => {
                player.setQueue([track], 0);
            });
            this.elements.recommendedTracks.appendChild(card);
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

        if (results.tracks.length > 0) {
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

        if (results.playlists.length > 0) {
            const section = document.createElement('section');
            section.className = 'content-section';
            section.innerHTML = '<h2>Playlists</h2>';
            
            const grid = document.createElement('div');
            grid.className = 'horizontal-scroll';
            
            results.playlists.slice(0, 10).forEach(playlist => {
                const card = createPlaylistCard(playlist);
                card.addEventListener('click', () => this.showPlaylist(playlist.id));
                grid.appendChild(card);
            });
            
            section.appendChild(grid);
            this.elements.searchResults.appendChild(section);
        }

        if (results.tracks.length === 0 && results.playlists.length === 0) {
            this.elements.searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
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
            this.elements.admin.totalArtists.textContent = stats.totalArtists;
            this.elements.admin.totalAlbums.textContent = stats.totalAlbums;

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

            // Load view data if needed
            if (viewName === 'library') {
                this.loadLibraryTab('playlists');
            } else if (viewName === 'admin') {
                this.loadAdminData();
            }
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
            // Load profile data
            this.userProfile = await api.getUserProfile();
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
}

export const ui = new UIController();
