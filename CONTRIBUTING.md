# Contributing to JukeBx

First off, thank you for considering contributing to JukeBx! It's people like you that make JukeBx such a great tool.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Browser and OS** information
- **Console errors** (if any)

**Example:**

```markdown
**Bug:** Player not advancing to next track

**Steps to reproduce:**
1. Load a playlist with 3+ tracks
2. Play first track
3. Wait for track to finish
4. Observe that next track doesn't play

**Expected:** Next track should auto-play
**Actual:** Playback stops

**Browser:** Chrome 120.0
**OS:** macOS 14.0
**Console errors:** None
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why would this be useful?
- **Mockups or examples** if applicable
- **Technical approach** if you have ideas

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- A modern web browser
- Git
- Text editor (VS Code recommended)
- Optional: Local web server (Python, Node.js, etc.)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/yourusername/jukebx.git
cd jukebx

# Create a branch
git checkout -b feature/my-new-feature

# Make changes and test locally
python -m http.server 8000
# Open http://localhost:8000

# Commit and push
git add .
git commit -m "Add my new feature"
git push origin feature/my-new-feature
```

## Code Style Guidelines

### JavaScript

- Use **ES6+ features** (modules, arrow functions, async/await)
- Use **const** by default, **let** when reassignment needed
- Use **template literals** for string interpolation
- Add **JSDoc comments** for functions and classes
- Keep functions **small and focused**
- Use **descriptive variable names**

**Good:**

```javascript
/**
 * Format duration from seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

**Bad:**

```javascript
function fd(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
}
```

### CSS

- Use **CSS variables** for colors and spacing
- Follow **mobile-first** approach
- Use **semantic class names**
- Group related properties
- Add comments for complex sections

**Good:**

```css
/* Player controls section */
.player-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

@media (min-width: 768px) {
    .player-controls {
        flex-direction: row;
    }
}
```

### HTML

- Use **semantic HTML5** elements
- Add **ARIA labels** for accessibility
- Keep structure **clean and organized**
- Use **data attributes** for JS hooks

**Good:**

```html
<button 
    class="btn-icon" 
    id="playBtn" 
    aria-label="Play"
    data-action="play">
    <i class="fas fa-play"></i>
</button>
```

## Project Structure

```
jukebx/
├── index.html          # Main HTML - keep clean, minimal inline scripts
├── styles/
│   └── main.css       # All styles - organized by component
├── js/
│   ├── main.js        # Entry point - initialization only
│   ├── api.js         # API layer - all backend communication
│   ├── player.js      # Player logic - audio handling
│   ├── ui.js          # UI controller - DOM manipulation
│   └── virtualScroll.js # Utilities - reusable components
└── docs/              # Documentation
```

## API Integration Guidelines

When adding new API endpoints:

1. **Add to mock data generator** in `api.js`
2. **Create API method** following existing pattern
3. **Test with mock data** first
4. **Document expected response format**
5. **Handle errors gracefully**

**Example:**

```javascript
/**
 * Get artist details
 * @param {string} artistId - Artist ID
 * @returns {Promise<Object>} Artist object
 */
async getArtist(artistId) {
    if (this.config.useMock) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockData.artists.find(a => a.id === artistId);
    }
    
    return this.request(`/artists/${artistId}`);
}
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Different screen sizes (mobile, tablet, desktop)
- ✅ Player controls work correctly
- ✅ Navigation works on all views
- ✅ Search functionality
- ✅ Console has no errors

### Test Large Playlists

```javascript
// In browser console
const bigPlaylist = Array.from({ length: 1000 }, (_, i) => ({
    id: `test-${i}`,
    title: `Test Track ${i}`,
    artist: `Test Artist ${i % 10}`,
    duration: 180
}));
player.setQueue(bigPlaylist);
```

## Performance Considerations

- **Virtual scrolling** for lists > 100 items
- **Debounce** search inputs (300ms)
- **Lazy load** images when implemented
- **Minimize** DOM manipulations
- **Use** `requestAnimationFrame` for animations

## Accessibility

- Ensure **keyboard navigation** works
- Add **ARIA labels** to interactive elements
- Test with **screen readers** if possible
- Maintain **sufficient color contrast**
- Support **reduced motion** preferences

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Documentation

- Update **README.md** for new features
- Add **JSDoc comments** to new functions
- Update **DEPLOYMENT.md** if deployment process changes
- Include **code examples** in documentation

## Commit Messages

Use clear, descriptive commit messages:

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting)
- **refactor:** Code refactoring
- **perf:** Performance improvements
- **test:** Adding tests
- **chore:** Maintenance tasks

**Examples:**

```
feat: Add shuffle mode to player
fix: Prevent progress bar from jumping on mobile
docs: Update API integration guide
style: Format code with prettier
refactor: Extract track rendering to separate module
perf: Implement virtual scrolling for playlists
```

## Review Process

1. **Automated checks** will run on your PR
2. **Maintainer review** - may request changes
3. **Testing** - verify functionality works
4. **Merge** - once approved and passing checks

## Questions?

- Check existing **issues** and **discussions**
- Read the **README** and **documentation**
- Open a new **issue** for questions
- Join our community chat (if available)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to JukeBx! 🎵
