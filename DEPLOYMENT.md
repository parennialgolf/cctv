# CCTV System Deployment Guide

## Environment Variables Setup

To secure your CCTV system, set these environment variables on your server:

### Required Environment Variables

```bash
# Admin user password
CCTV_ADMIN_PASSWORD=your_secure_admin_password_here

# Viewer user password  
CCTV_VIEWER_PASSWORD=your_secure_viewer_password_here
```

### Optional Environment Variables

```bash
# Additional users (optional)
CCTV_MANAGER_PASSWORD=manager_password_here
CCTV_GUEST_PASSWORD=guest_password_here
```

## Server Setup Examples

### Apache/Nginx Static Hosting

Add to your virtual host configuration:

```apache
# Apache .htaccess or virtual host
SetEnv CCTV_ADMIN_PASSWORD "YourSecurePassword123!"
SetEnv CCTV_VIEWER_PASSWORD "ViewerPassword456!"
```

```nginx
# Nginx
location / {
    fastcgi_param CCTV_ADMIN_PASSWORD "YourSecurePassword123!";
    fastcgi_param CCTV_VIEWER_PASSWORD "ViewerPassword456!";
}
```

### Node.js/Express Hosting

```bash
# Set environment variables
export CCTV_ADMIN_PASSWORD="YourSecurePassword123!"
export CCTV_VIEWER_PASSWORD="ViewerPassword456!"

# Or use a .env file
echo "CCTV_ADMIN_PASSWORD=YourSecurePassword123!" > .env
echo "CCTV_VIEWER_PASSWORD=ViewerPassword456!" >> .env
```

### Docker Deployment

```dockerfile
# Dockerfile
ENV CCTV_ADMIN_PASSWORD=YourSecurePassword123!
ENV CCTV_VIEWER_PASSWORD=ViewerPassword456!
```

```bash
# Or with docker run
docker run -e CCTV_ADMIN_PASSWORD="YourSecurePassword123!" \
           -e CCTV_VIEWER_PASSWORD="ViewerPassword456!" \
           your-cctv-image
```

### Cloud Hosting (Vercel, Netlify, etc.)

Add environment variables in your hosting platform's dashboard:

- `CCTV_ADMIN_PASSWORD` = `YourSecurePassword123!`
- `CCTV_VIEWER_PASSWORD` = `ViewerPassword456!`

## Security Best Practices

1. **Use Strong Passwords**: At least 12 characters with mix of letters, numbers, symbols
2. **Regular Updates**: Change passwords periodically
3. **HTTPS Only**: Always use SSL certificates
4. **IP Restrictions**: Limit access to specific IP ranges if possible
5. **Monitor Access**: Check server logs regularly

## Default Behavior

- If environment variables are not set, the system uses default passwords for development
- Default passwords: `cctv2025` for both admin and viewer
- **WARNING**: Never deploy to production without setting custom environment variables!

## Testing Your Setup

1. Deploy your files to the server
2. Set the environment variables
3. Access your CCTV system
4. Try logging in with your new credentials
5. Verify old default passwords no longer work

## Troubleshooting

- **Environment variables not working**: Check your server's method for setting env vars
- **Still using defaults**: Verify environment variable names are exact (case-sensitive)
- **Access denied**: Double-check your password values in the environment settings
