# PARennial Golf CCTV System

A secure, responsive CCTV monitoring system for multiple golf course locations.

## Features

- 🎥 **Multi-Location Support**: Lincoln Park (3 bays), West Loop (5 bays), Wicker Park (4 bays)
- 🔐 **Secure Authentication**: Environment variable-based password protection
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎛️ **Two View Modes**: Individual location dropdowns or all-feeds grid view
- 🚀 **Docker Ready**: Easy deployment with Docker Compose
- ⚡ **Dokku Compatible**: One-click deployment to your Dokku instance

## Quick Deployment with Dokku

### 1. Create Dokku App
```bash
# On your Dokku server
dokku apps:create cctv-system
```

### 2. Set Environment Variables
```bash
dokku config:set cctv-system CCTV_ADMIN_PASSWORD=your_secure_admin_password
dokku config:set cctv-system CCTV_VIEWER_PASSWORD=your_secure_viewer_password
# Optional additional users
dokku config:set cctv-system CCTV_MANAGER_PASSWORD=manager_password
dokku config:set cctv-system CCTV_GUEST_PASSWORD=guest_password
```

### 3. Deploy from GitHub
```bash
# Clone and deploy
git clone https://github.com/your-username/cctv-system.git
cd cctv-system
git remote add dokku dokku@your-server.com:cctv-system
git push dokku main
```

### 4. Configure Domain (Optional)
```bash
dokku domains:set cctv-system cctv.your-domain.com
dokku letsencrypt:enable cctv-system  # For SSL
```

## Local Development

### Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/your-username/cctv-system.git
cd cctv-system

# Set environment variables (optional - will use defaults)
export CCTV_ADMIN_PASSWORD=admin123
export CCTV_VIEWER_PASSWORD=viewer123

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost
```

### Direct File Serving
```bash
# Serve files with any static server
python -m http.server 8000
# Access at http://localhost:8000
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CCTV_ADMIN_PASSWORD` | Yes | `cctv2025` | Admin user password |
| `CCTV_VIEWER_PASSWORD` | Yes | `cctv2025` | Viewer user password |
| `CCTV_MANAGER_PASSWORD` | No | - | Manager user password |
| `CCTV_GUEST_PASSWORD` | No | - | Guest user password |

### CCTV Server URLs

The system expects CCTV streams at these URLs:

**Lincoln Park (pgl-1):**
- `http://pgl-1:8889/bay_1/`
- `http://pgl-1:8889/bay_2/`
- `http://pgl-1:8889/bay_3/`

**West Loop (pgl-2):**
- `http://pgl-2:8889/bay_1/` through `bay_5/`

**Wicker Park (pgl-3):**
- `http://pgl-3:8889/bay_1/` through `bay_4/`

## User Accounts

- **admin**: Full access to all features
- **viewer**: View-only access to all feeds
- **manager**: (Optional) Custom access level
- **guest**: (Optional) Limited access

## Security Features

- ✅ Tab-based sessions (logout on browser close)
- ✅ Environment variable password storage
- ✅ No hardcoded credentials in source code
- ✅ Session storage (not persistent cookies)
- ✅ HTTPS-ready configuration
- ✅ Security headers in nginx config

## File Structure

```
cctv-system/
├── index.html           # Entry point (redirects based on auth)
├── login.html          # Login page
├── cctv.html           # Main page (dropdown sections)
├── all-feeds.html      # Grid view (all feeds)
├── styles.css          # Responsive CSS styles
├── auth.js             # Authentication logic
├── logo_mark_gradient_sized.png  # Logo file
├── docker-compose.yml  # Docker composition
├── Dockerfile          # Container build instructions
├── nginx.conf          # Web server configuration
└── README.md           # This file
```

## Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox  
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Environment Variables Not Working
- Verify exact variable names (case-sensitive)
- Check Dokku config: `dokku config cctv-system`
- Restart app: `dokku ps:restart cctv-system`

### CCTV Streams Not Loading
- Verify CCTV server URLs are accessible
- Check network connectivity to pgl-1, pgl-2, pgl-3
- Ensure port 8889 is open and streams are running

### Mobile Display Issues
- Clear browser cache
- Check viewport meta tag is present
- Verify responsive CSS is loading

## License

MIT License - see LICENSE file for details.
