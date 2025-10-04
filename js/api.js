/**
 * JukeBx API Service
 * Mock backend with easy-to-replace real API integration
 * All API calls return Promises for easy async/await usage
 */

// Configuration
const API_CONFIG = {
    // Set to true to use mock data, false to use real API
    useMock: true,
    // Base URL for real API (when useMock is false)
    baseUrl: 'https://lmf.logge.top/api',
    // API endpoints
    endpoints: {
        tracks: '/tracks',
        playlists: '/playlists',
        artists: '/artists',
        albums: '/albums',
        search: '/search',
        upload: '/upload',
        scan: '/scan'
    }
};

// Mock data generator
class MockDataGenerator {
    constructor() {
        this.tracks = this.generateTracks(500); // Generate 500 tracks for testing large playlists
        this.playlists = this.generatePlaylists();
        this.artists = this.generateArtists();
        this.albums = this.generateAlbums();
        this.userProfile = this.generateUserProfile();
    }

    generateTracks(count = 100) {
        const genres = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Hip Hop', 'Classical', 'Indie', 'R&B'];
        const adjectives = ['Blue', 'Golden', 'Midnight', 'Crimson', 'Electric', 'Cosmic', 'Velvet', 'Silver'];
        const nouns = ['Dreams', 'Sunrise', 'Melody', 'Journey', 'Echo', 'Horizon', 'Paradise', 'Symphony'];
        
        return Array.from({ length: count }, (_, i) => ({
            id: `track-${i + 1}`,
            title: `${adjectives[i % adjectives.length]} ${nouns[(i + 3) % nouns.length]}`,
            artist: `Artist ${Math.floor(i / 10) + 1}`,
            album: `Album ${Math.floor(i / 20) + 1}`,
            duration: 180 + Math.floor(Math.random() * 180), // 3-6 minutes
            genre: genres[i % genres.length],
            year: 2015 + (i % 9),
            coverUrl: null,
            audioUrl: `https://example.com/audio/${i + 1}.mp3`,
            liked: Math.random() > 0.8,
            playCount: Math.floor(Math.random() * 1000),
            addedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        }));
    }

    generatePlaylists() {
        const names = [
            'Chill Vibes', 'Workout Mix', 'Road Trip', 'Focus Flow', 
            'Party Hits', 'Late Night', 'Morning Coffee', 'Throwback Thursday',
            'Summer Breeze', 'Winter Wonderland', 'Indie Discovery', 'Top 50'
        ];
        
        return names.map((name, i) => ({
            id: `playlist-${i + 1}`,
            name,
            description: `The perfect ${name.toLowerCase()} playlist for any mood`,
            trackCount: 20 + Math.floor(Math.random() * 80),
            coverUrl: null,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            tracks: this.tracks.slice(i * 10, i * 10 + 30).map(t => t.id)
        }));
    }

    generateArtists() {
        const uniqueArtists = [...new Set(this.tracks.map(t => t.artist))];
        return uniqueArtists.map((name, i) => ({
            id: `artist-${i + 1}`,
            name,
            bio: `${name} is a talented artist known for their unique sound.`,
            genres: ['Pop', 'Rock', 'Electronic'],
            followers: Math.floor(Math.random() * 1000000),
            verified: Math.random() > 0.5,
            imageUrl: null
        }));
    }

    generateAlbums() {
        const uniqueAlbums = [...new Set(this.tracks.map(t => t.album))];
        return uniqueAlbums.map((title, i) => ({
            id: `album-${i + 1}`,
            title,
            artist: `Artist ${i + 1}`,
            year: 2015 + (i % 9),
            trackCount: 10 + Math.floor(Math.random() * 10),
            coverUrl: null,
            genre: 'Various',
            tracks: this.tracks.filter(t => t.album === title).map(t => t.id)
        }));
    }

    getRecentlyPlayed() {
        return [...this.tracks]
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .slice(0, 10);
    }

    getPopularPlaylists() {
        return this.playlists.slice(0, 8);
    }

    getRecommendedTracks() {
        return [...this.tracks]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
    }

    generateUserProfile() {
        return {
            id: 'user-1',
            username: 'MusicLover',
            displayName: 'Music Lover',
            email: 'user@jukebx.local',
            bio: 'Passionate about discovering new music and creating the perfect playlists.',
            avatarUrl: null,
            memberSince: '2023-01-15',
            followersCount: 42,
            followingCount: 78,
            preferences: {
                theme: 'dark',
                autoplay: true,
                crossfade: false,
                normalizeVolume: true,
                showExplicitContent: true,
                language: 'en',
                socialStats: true,
                publicProfile: false
            },
            statistics: {
                totalListeningTime: 125430, // minutes
                totalTracks: 1245,
                topGenre: 'Electronic',
                topArtist: 'Artist 1',
                playlistsCreated: 15,
                likedSongs: 347
            }
        };
    }

    generateArtistStats(artistName) {
        const artistTracks = this.tracks.filter(t => t.artist === artistName);
        const listeningTime = Math.floor(Math.random() * 500) + 50; // 50-550 hours
        const playCount = Math.floor(Math.random() * 1000) + 100;
        const likedTracks = artistTracks.filter(t => t.liked).length;
        const rank = Math.floor(Math.random() * 10) + 1;
        
        // Generate top tracks (most played by user)
        const topTracks = artistTracks
            .slice(0, 5)
            .map(track => ({
                ...track,
                userPlayCount: Math.floor(Math.random() * 100) + 10
            }))
            .sort((a, b) => b.userPlayCount - a.userPlayCount);
        
        // Generate listening timeline (last 6 months)
        const timeline = Array.from({ length: 6 }, (_, i) => ({
            month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
            hours: Math.floor(Math.random() * 100) + 10
        }));
        
        return {
            artistName,
            listeningTime,
            playCount,
            likedTracks,
            rank,
            topTracks,
            timeline
        };
    }
}

// Initialize mock data
const mockData = new MockDataGenerator();

// API Service
class APIService {
    constructor() {
        this.config = API_CONFIG;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generic API request handler
     * Automatically switches between mock and real API based on config
     */
    async request(endpoint, options = {}) {
        const { method = 'GET', body, params } = options;
        
        if (this.config.useMock) {
            return this.mockRequest(endpoint, options);
        }

        // Real API implementation
        const url = new URL(this.config.baseUrl + endpoint);
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Mock request handler
     * Returns simulated data with realistic delays
     */
    async mockRequest(endpoint, options = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const { params } = options;

        // Route mock requests
        if (endpoint === this.config.endpoints.tracks) {
            return { tracks: mockData.tracks, total: mockData.tracks.length };
        }
        
        if (endpoint === this.config.endpoints.playlists) {
            if (params?.id) {
                const playlist = mockData.playlists.find(p => p.id === params.id);
                if (playlist) {
                    const tracks = mockData.tracks.filter(t => playlist.tracks.includes(t.id));
                    return { ...playlist, tracks };
                }
                throw new Error('Playlist not found');
            }
            return { playlists: mockData.playlists, total: mockData.playlists.length };
        }
        
        if (endpoint === this.config.endpoints.artists) {
            return { artists: mockData.artists, total: mockData.artists.length };
        }
        
        if (endpoint === this.config.endpoints.albums) {
            return { albums: mockData.albums, total: mockData.albums.length };
        }
        
        if (endpoint === this.config.endpoints.search) {
            const query = params?.q?.toLowerCase() || '';
            return {
                tracks: mockData.tracks.filter(t => 
                    t.title.toLowerCase().includes(query) ||
                    t.artist.toLowerCase().includes(query) ||
                    t.album.toLowerCase().includes(query)
                ),
                playlists: mockData.playlists.filter(p => 
                    p.name.toLowerCase().includes(query)
                ),
                artists: mockData.artists.filter(a => 
                    a.name.toLowerCase().includes(query)
                )
            };
        }

        throw new Error('Endpoint not found');
    }

    // Public API methods

    /**
     * Get all tracks with optional filtering and pagination
     */
    async getTracks(options = {}) {
        const { limit, offset, sort, filter } = options;
        const result = await this.request(this.config.endpoints.tracks, { params: options });
        return result.tracks || result;
    }

    /**
     * Get a single track by ID
     */
    async getTrack(id) {
        const tracks = await this.getTracks();
        return tracks.find(t => t.id === id);
    }

    /**
     * Get all playlists
     */
    async getPlaylists() {
        const result = await this.request(this.config.endpoints.playlists);
        return result.playlists || result;
    }

    /**
     * Get a single playlist with its tracks
     */
    async getPlaylist(id) {
        const result = await this.request(this.config.endpoints.playlists, { 
            params: { id } 
        });
        return result;
    }

    /**
     * Get recently played tracks
     */
    async getRecentlyPlayed() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return mockData.getRecentlyPlayed();
        }
        return this.request('/recently-played');
    }

    /**
     * Get popular playlists
     */
    async getPopularPlaylists() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return mockData.getPopularPlaylists();
        }
        return this.request('/popular-playlists');
    }

    /**
     * Get recommended tracks
     */
    async getRecommendedTracks() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return mockData.getRecommendedTracks();
        }
        return this.request('/recommended');
    }

    /**
     * Search for tracks, playlists, artists
     */
    async search(query) {
        return this.request(this.config.endpoints.search, { 
            params: { q: query } 
        });
    }

    /**
     * Get all artists
     */
    async getArtists() {
        const result = await this.request(this.config.endpoints.artists);
        return result.artists || result;
    }

    /**
     * Get all albums
     */
    async getAlbums() {
        const result = await this.request(this.config.endpoints.albums);
        return result.albums || result;
    }

    /**
     * Upload a music file (admin)
     */
    async uploadTrack(file, metadata) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Mock upload:', file, metadata);
            return { success: true, trackId: `track-${Date.now()}` };
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));
        
        return fetch(this.config.baseUrl + this.config.endpoints.upload, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
    }

    /**
     * Scan library for new tracks (admin)
     */
    async scanLibrary() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Mock library scan initiated');
            return { success: true, tracksFound: Math.floor(Math.random() * 20) };
        }
        
        return this.request(this.config.endpoints.scan, { method: 'POST' });
    }

    /**
     * Toggle track like status
     */
    async toggleLike(trackId) {
        const track = await this.getTrack(trackId);
        if (track) {
            track.liked = !track.liked;
            return track.liked;
        }
        return false;
    }

    /**
     * Get statistics for admin panel
     */
    async getStatistics() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return {
                totalTracks: mockData.tracks.length,
                totalPlaylists: mockData.playlists.length,
                totalArtists: mockData.artists.length,
                totalAlbums: mockData.albums.length
            };
        }
        
        return this.request('/statistics');
    }

    /**
     * Get user profile
     */
    async getUserProfile() {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return mockData.userProfile;
        }
        
        return this.request('/user/profile');
    }

    /**
     * Update user profile
     */
    async updateUserProfile(updates) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 200));
            Object.assign(mockData.userProfile, updates);
            return mockData.userProfile;
        }
        
        return this.request('/user/profile', { 
            method: 'PUT', 
            body: updates 
        });
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(preferences) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            Object.assign(mockData.userProfile.preferences, preferences);
            return mockData.userProfile.preferences;
        }
        
        return this.request('/user/preferences', { 
            method: 'PUT', 
            body: preferences 
        });
    }

    /**
     * Download a single track
     */
    async downloadTrack(trackId) {
        const track = await this.getTrack(trackId);
        if (!track) {
            throw new Error('Track not found');
        }

        if (this.config.useMock) {
            // Mock download - create a sample file
            await new Promise(resolve => setTimeout(resolve, 500));
            const content = `Mock audio file for: ${track.title} by ${track.artist}`;
            const blob = new Blob([content], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${track.artist} - ${track.title}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return { success: true, trackId };
        }

        // Real API implementation
        const response = await fetch(track.audioUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.artist} - ${track.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true, trackId };
    }

    /**
     * Download entire playlist as a zip file
     */
    async downloadPlaylist(playlistId) {
        const playlist = await this.getPlaylist(playlistId);
        if (!playlist) {
            throw new Error('Playlist not found');
        }

        if (this.config.useMock) {
            // Mock download - simulate downloading all tracks
            await new Promise(resolve => setTimeout(resolve, 1000));
            const content = `Mock playlist archive for: ${playlist.name}\n\nTracks:\n${playlist.tracks.map(t => `- ${t.artist} - ${t.title}`).join('\n')}`;
            const blob = new Blob([content], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${playlist.name}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return { success: true, playlistId, tracksCount: playlist.tracks.length };
        }

        // Real API implementation - request zip from backend
        return this.request(`${this.config.endpoints.playlists}/${playlistId}/download`, {
            method: 'POST'
        });
    }

    /**
     * Delete/Shred a playlist
     */
    async deletePlaylist(playlistId) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const index = mockData.playlists.findIndex(p => p.id === playlistId);
            if (index === -1) {
                throw new Error('Playlist not found');
            }
            mockData.playlists.splice(index, 1);
            return { success: true, playlistId };
        }

        return this.request(`${this.config.endpoints.playlists}/${playlistId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Create a new playlist
     */
    async createPlaylist(name, description = '') {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const newPlaylist = {
                id: `playlist-${Date.now()}`,
                name,
                description,
                trackCount: 0,
                coverUrl: null,
                createdAt: new Date().toISOString(),
                tracks: []
            };
            mockData.playlists.push(newPlaylist);
            return newPlaylist;
        }

        return this.request(this.config.endpoints.playlists, {
            method: 'POST',
            body: { name, description }
        });
    }

    /**
     * Get artist details with tracks
     */
    async getArtist(artistName) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const artist = mockData.artists.find(a => a.name === artistName);
            if (!artist) {
                throw new Error('Artist not found');
            }
            const tracks = mockData.tracks.filter(t => t.artist === artistName);
            return {
                ...artist,
                tracks,
                trackCount: tracks.length
            };
        }

        return this.request(`${this.config.endpoints.artists}/${encodeURIComponent(artistName)}`);
    }

    /**
     * Get artist listening statistics for current user
     */
    async getArtistStats(artistName) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 150));
            return mockData.generateArtistStats(artistName);
        }

        return this.request(`${this.config.endpoints.artists}/${encodeURIComponent(artistName)}/stats`);
    }

    /**
     * Toggle artist follow status
     */
    async toggleFollowArtist(artistName) {
        if (this.config.useMock) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const artist = mockData.artists.find(a => a.name === artistName);
            if (artist) {
                artist.followed = !artist.followed;
                return artist.followed;
            }
            return false;
        }

        return this.request(`${this.config.endpoints.artists}/${encodeURIComponent(artistName)}/follow`, {
            method: 'POST'
        });
    }
}

// Export singleton instance
export const api = new APIService();
export { API_CONFIG };
