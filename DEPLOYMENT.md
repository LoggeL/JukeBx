# 🚀 JukeBx Deployment Guide

This guide will help you deploy JukeBx to various hosting platforms.

## GitHub Pages (Recommended)

GitHub Pages offers free static site hosting, perfect for JukeBx.

### Step 1: Fork/Clone Repository

```bash
git clone https://github.com/yourusername/jukebx.git
cd jukebx
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Your site will be available at: `https://yourusername.github.io/jukebx`

### Step 3: Custom Domain (Optional)

1. Edit the `CNAME` file in the repository root
2. Add your domain (e.g., `music.yourdomain.com`)
3. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `yourusername.github.io`
4. Commit and push changes

## Netlify

Netlify provides easy deployment with automatic builds.

### Deploy from Git

1. Sign up at [netlify.com](https://netlify.com)
2. Click **New site from Git**
3. Choose your repository
4. Configure build settings:
   - Build command: (leave empty)
   - Publish directory: `/`
5. Click **Deploy site**

### Deploy via Drag & Drop

1. Zip your JukeBx directory
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop your zip file
4. Your site is live!

## Vercel

Vercel offers excellent performance and easy deployments.

### Deploy from Git

1. Sign up at [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your repository
4. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `.`
5. Click **Deploy**

## Self-Hosting

### Using Python SimpleHTTPServer

```bash
cd jukebx
python -m http.server 8000
# Visit http://localhost:8000
```

### Using Node.js HTTP Server

```bash
npx http-server -p 8000
# Visit http://localhost:8000
```

### Using Nginx

1. Install Nginx:
```bash
sudo apt-get update
sudo apt-get install nginx
```

2. Copy files to web root:
```bash
sudo cp -r jukebx/* /var/www/html/
```

3. Configure Nginx (`/etc/nginx/sites-available/jukebx`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Enable site and restart:
```bash
sudo ln -s /etc/nginx/sites-available/jukebx /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Using Apache

1. Install Apache:
```bash
sudo apt-get update
sudo apt-get install apache2
```

2. Copy files:
```bash
sudo cp -r jukebx/* /var/www/html/
```

3. Create `.htaccess` in the root:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Caching
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

4. Enable mod_rewrite:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Docker

Create a `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy app files
COPY . /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t jukebx .
docker run -d -p 8080:80 jukebx
# Visit http://localhost:8080
```

## Environment-Specific Configuration

### Production API Configuration

Before deploying to production, update `js/api.js`:

```javascript
const API_CONFIG = {
    useMock: false,  // Use real backend
    baseUrl: 'https://your-lmf-backend.com/api',
    endpoints: {
        // ... your endpoints
    }
};
```

### Enable Service Worker

For offline support, uncomment in `js/main.js`:

```javascript
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
```

## Troubleshooting

### GitHub Pages Shows 404

- Ensure `.nojekyll` file exists in the root
- Check that GitHub Pages is enabled in repository settings
- Verify the branch and folder settings

### Assets Not Loading

- Check browser console for errors
- Verify all paths are relative (no leading `/` unless necessary)
- Ensure all files are committed and pushed

### API Not Working

- Check `js/api.js` configuration
- Verify CORS settings on your backend
- Check browser console for network errors

### Mobile View Issues

- Clear browser cache
- Disable browser extensions
- Test in incognito/private mode

## Performance Optimization

### Enable Gzip Compression (Nginx)

Add to nginx configuration:

```nginx
gzip on;
gzip_types text/css application/javascript application/json;
gzip_min_length 1000;
```

### Enable HTTP/2

```nginx
server {
    listen 443 ssl http2;
    # ... rest of config
}
```

### Add CDN

Consider using a CDN like Cloudflare for:
- Faster asset delivery
- DDoS protection
- Free SSL certificates

## Monitoring

### Basic Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-ID');
</script>
```

### Error Tracking

Consider integrating Sentry for error monitoring:

```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: 'YOUR-DSN' });
</script>
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Set Content Security Policy** headers
3. **Enable CORS** properly on your backend
4. **Keep dependencies updated** (Font Awesome, etc.)
5. **Validate all user inputs** before sending to backend

## Need Help?

- Check the [main README](README.md)
- Visit [LMF Documentation](https://lmf.logge.top)
- Open an issue on GitHub

---

Happy deploying! 🚀
