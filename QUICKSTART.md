# ⚡ JukeBx Quick Start Guide

Get JukeBx running in under 5 minutes!

## 🚀 Instant Demo (No Installation)

Want to try it right now? Just open `index.html` in your browser!

```bash
# If you have the files
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

## 📦 Quick Setup

### Option 1: GitHub Pages (Easiest)

1. **Fork this repository** on GitHub
2. **Go to Settings** → **Pages**
3. **Select source:** Branch `main`, folder `/ (root)`
4. **Done!** Your site is live at `https://yourusername.github.io/jukebx`

⏱️ **Time:** 2 minutes

### Option 2: Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/jukebx.git
cd jukebx

# Start a local server (choose one):

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (npx)
npx http-server -p 8000

# Node.js (global)
npm install -g http-server
http-server -p 8000

# PHP
php -S localhost:8000

# Open browser
# Visit: http://localhost:8000
```

⏱️ **Time:** 3 minutes

## 🎮 First Steps

Once JukeBx is running:

### 1. Explore the Interface

- **Home** - Browse recently played and popular playlists
- **Search** - Search for tracks (try typing anything!)
- **Library** - View your music collection
- **Admin Panel** - Manage your music files

### 2. Try the Player

Click on any track or playlist to start playing. Use the player controls at the bottom:

- **Play/Pause** - Space bar or click button
- **Next/Previous** - Arrow buttons or Ctrl+← / Ctrl+→
- **Shuffle** - Randomize playback order
- **Repeat** - Loop current track or playlist
- **Queue** - View and manage upcoming tracks

### 3. Test with Large Playlists

JukeBx is optimized for performance. Open the console and try:

```javascript
// Navigate to a playlist and check the smooth scrolling
// even with 500 tracks!
```

## 🔌 Connect to Real Backend

Currently, JukeBx uses **mock data** for demonstration. To connect to a real backend:

### Step 1: Update API Configuration

Edit `js/api.js`:

```javascript
const API_CONFIG = {
    useMock: false,  // Change to false
    baseUrl: 'https://your-backend-url.com/api',
    // ... rest of config
};
```

### Step 2: Ensure Backend Compatibility

Your backend should implement these endpoints:

```
GET  /tracks        - List all tracks
GET  /playlists     - List all playlists
GET  /search?q=...  - Search functionality
POST /upload        - Upload music files
POST /scan          - Scan library
```

### Step 3: Deploy

Follow the [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

## 📱 Mobile Access

JukeBx is fully responsive! Access it from:

- 📱 **iPhone/iPad** - Works in Safari
- 🤖 **Android** - Works in Chrome
- 💻 **Desktop** - Works in all modern browsers

### Add to Home Screen

#### iOS (iPhone/iPad)
1. Open JukeBx in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Enjoy app-like experience!

#### Android
1. Open JukeBx in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"
4. Done!

## 🎨 Customization

### Change Theme Colors

Edit CSS variables in `styles/main.css`:

```css
:root {
    --primary: #1db954;        /* Your color */
    --background: #121212;     /* Dark theme */
    /* ... more colors */
}
```

### Modify Mock Data

Edit `js/api.js` to customize the demo:

```javascript
generateTracks(count = 100) {  // Change to 1000 for more tracks
    // Customize track data here
}
```

## 🐛 Troubleshooting

### Nothing appears?

1. Check browser console for errors (F12)
2. Ensure you're using a modern browser
3. Try opening in incognito mode
4. Clear browser cache

### Player not working?

1. Check that audio is not muted
2. Look for browser console errors
3. Try a different track
4. Verify mock data is loading

### Styles look broken?

1. Verify `styles/main.css` loaded
2. Check network tab for 404 errors
3. Clear browser cache
4. Ensure Font Awesome CSS is loading

## 💡 Tips & Tricks

### Keyboard Shortcuts

- `Space` - Play/Pause (when not typing)
- `Ctrl + ←` - Previous track
- `Ctrl + →` - Next track

### Performance

JukeBx uses virtual scrolling to handle thousands of tracks smoothly. The more tracks you have, the more impressive the performance!

### Development

Open browser dev tools (F12) to see:
- Console logs
- Network requests (currently mocked)
- Performance metrics

## 🔗 Next Steps

✅ JukeBx is running!

Now you can:

1. **Read the [full README](README.md)** for detailed information
2. **Check [DEPLOYMENT.md](DEPLOYMENT.md)** for production setup
3. **Browse [CONTRIBUTING.md](CONTRIBUTING.md)** to contribute
4. **Connect to LMF backend** for real music streaming
5. **Customize** the UI to match your style

## 🆘 Need Help?

- 📖 Read the [full documentation](README.md)
- 🐛 [Report a bug](https://github.com/yourusername/jukebx/issues)
- 💬 [Ask a question](https://github.com/yourusername/jukebx/discussions)
- 🔗 Visit [LMF documentation](https://lmf.logge.top)

## 🎉 Success!

You're now running JukeBx! Enjoy your music, your way. 🎵

---

**Time from zero to music:** < 5 minutes ⚡
