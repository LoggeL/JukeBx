# 🎵 JukeBx

**A sleek, self-hosted Spotify alternative powered by [LMF](https://lmf.logge.top)**

JukeBx is a modern, responsive web-based music streaming application designed to reduce the clunkiness of traditional music players. Built with performance and user experience in mind, it handles large playlists with ease and provides comprehensive control over your music library.

![JukeBx](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Powered by](https://img.shields.io/badge/powered%20by-LMF-orange)

## ✨ Features

### 🎨 **Modern, Sleek Interface**
- Beautiful Spotify-inspired design with JukeBx branding
- Dark theme optimized for extended listening sessions
- Smooth animations and transitions

### 📱 **Mobile Optimized**
- Responsive design that works perfectly on all devices
- Touch-friendly controls
- Mobile bottom navigation for easy access

### ⚡ **High Performance**
- Virtual scrolling for handling large playlists (tested with 500+ tracks)
- Optimized rendering for smooth scrolling even with thousands of songs
- Minimal memory footprint

### 🎧 **Full-Featured Music Player**
- Complete playback controls (play, pause, skip, seek)
- Queue management with drag-and-drop support
- Shuffle and repeat modes
- Volume control
- Progress tracking

### 🌟 **Social Listening Features** (Opt-in)
- Personal listening statistics on artist pages
- Expandable/collapsible stats sections for clean UI
- Track your listening hours per artist
- View your most played tracks from each artist
- See listening trends over time with timeline charts
- Privacy-focused: Enable/disable in settings

### 🔍 **Smart Search**
- Real-time search across tracks, artists, and playlists
- Instant results with debouncing for performance
- Search within your entire library

### 👤 **Your Library**
- Organize music by playlists, songs, artists, and albums
- Create and manage custom playlists
- Like/favorite tracks

### 🛠️ **Admin Panel**
- Comprehensive overview of your music collection
- Statistics dashboard
- Library scanning capabilities
- Music file management
- Upload functionality (ready for backend integration)

### 🔌 **Backend-Ready Architecture**
- Mock backend included for testing
- Easy API abstraction layer
- Simple switch between mock and real backend
- Built to integrate with LMF backend

## 🚀 Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jukebx.git
   cd jukebx
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. **Deploy to GitHub Pages**
   - Push to your GitHub repository
   - Enable GitHub Pages in repository settings
   - Select the main branch as source
   - Your site will be live at `https://yourusername.github.io/jukebx`

### GitHub Pages Deployment

JukeBx is optimized for GitHub Pages deployment:

1. **Fork or clone this repository**
2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click Save

3. **Optional: Custom Domain**
   - Edit the `CNAME` file with your domain
   - Configure DNS settings with your domain provider

That's it! Your music player is now live and accessible.

## 🔧 Configuration

### Connecting to LMF Backend

To connect JukeBx to a real backend (LMF or custom):

1. Open `js/api.js`
2. Update the configuration:

```javascript
const API_CONFIG = {
    useMock: false,  // Set to false to use real API
    baseUrl: 'https://lmf.logge.top/api',  // Your API endpoint
    endpoints: {
        tracks: '/tracks',
        playlists: '/playlists',
        // ... customize as needed
    }
};
```

3. Ensure your backend implements the expected API endpoints:
   - `GET /tracks` - Get all tracks
   - `GET /playlists` - Get all playlists
   - `GET /search?q=query` - Search functionality
   - `POST /upload` - Upload music files
   - `POST /scan` - Scan library for new files

### API Response Format

JukeBx expects the following data structures:

**Track Object:**
```javascript
{
    id: "track-1",
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    duration: 180,  // in seconds
    audioUrl: "https://example.com/song.mp3",
    coverUrl: "https://example.com/cover.jpg",  // optional
    liked: false
}
```

**Playlist Object:**
```javascript
{
    id: "playlist-1",
    name: "Playlist Name",
    description: "Description",
    trackCount: 20,
    tracks: ["track-1", "track-2", ...],  // or full track objects
    coverUrl: "https://example.com/cover.jpg"  // optional
}
```

## 📁 Project Structure

```
jukebx/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styles (mobile-first, responsive)
├── js/
│   ├── main.js            # Application entry point
│   ├── api.js             # API service with mock/real backend switching
│   ├── player.js          # Music player logic and audio handling
│   ├── ui.js              # UI controller and event handlers
│   └── virtualScroll.js   # Virtual scrolling implementation
├── .nojekyll              # GitHub Pages configuration
├── CNAME                  # Custom domain configuration (optional)
└── README.md              # This file
```

## 🎯 Key Technologies

- **Pure JavaScript (ES6+)** - No framework dependencies for minimal bundle size
- **CSS Grid & Flexbox** - Modern, responsive layouts
- **Web Audio API** - Native audio playback
- **Virtual Scrolling** - Custom implementation for performance
- **Module System** - ES6 modules for clean code organization

## 🎮 Keyboard Shortcuts

- `Space` - Play/Pause
- `Ctrl + ←` - Previous track
- `Ctrl + →` - Next track

## 🌟 Why JukeBx?

### vs Spotify
- ✅ Self-hosted - You own your data
- ✅ No subscriptions or ads
- ✅ More responsive with large libraries
- ✅ Greater user control
- ✅ Customizable

### vs Other Self-Hosted Solutions
- ✅ Modern, sleek interface
- ✅ Optimized for large playlists
- ✅ True mobile-first design
- ✅ Easy to deploy (static site)
- ✅ No complex server setup required (initially)

## 🔮 Future Enhancements

- [x] Social features (personal listening statistics)
- [ ] Service Worker for offline playback
- [ ] Advanced audio features (equalizer, crossfade)
- [ ] Social sharing and collaborative playlists
- [ ] Music visualization
- [ ] Lyrics integration
- [ ] Podcast support
- [ ] Integration with music file metadata editors
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support
- [ ] Yearly listening reports ("Wrapped" style)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Powered by [LMF](https://lmf.logge.top)
- Inspired by Spotify's user interface
- Built with ❤️ for music lovers

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Visit [LMF](https://lmf.logge.top) for backend documentation

## 🎵 Made with Love

JukeBx is designed to bring joy to music listening. Enjoy your music, your way!

---

**Note:** This is currently using a mock backend for demonstration. Connect to LMF or your own backend for full functionality with real audio files.
