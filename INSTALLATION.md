# Installation Guide

## Quick Start

### 1. Prerequisites
- Node.js 18 or higher
- MongoDB 5.0 or higher
- Linux system with NFTables support
- Sudo privileges

### 2. Installation Steps

```bash
# Clone the repository
git clone <your-repo-url>
cd chromecast-gateway-cms

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Edit environment variables
nano .env.local

# Start MongoDB (if not already running)
sudo systemctl start mongod

# Initialize NFTables rules
npm run init-system

# Start the application
npm run dev
```

### 3. Environment Configuration

Edit `.env.local` with your settings:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chromecast-gateway

# Authentication
NEXTAUTH_SECRET=your-very-secure-secret-key-here
ADMIN_PASSWORD=your-secure-admin-password

# Server Configuration
SERVER_HOST=192.168.70.215
SERVER_PORT=3000

# Network Configuration
MOBILE_NETWORK=192.168.10.0/24
CHROMECAST_NETWORK=192.168.20.0/24

# NFTables Configuration
NFT_TABLE=inet
NFT_NAMESPACE=chromecast
NFT_SET=authorized_sessions
```

### 4. Access the Application

- **Main Dashboard**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **System Status**: http://localhost:3000/status

### 5. First Time Setup

1. Go to the admin panel
2. Login with your admin password
3. Add your first Chromecast device:
   - Room ID: `living-room`
   - Device Name: `Living Room TV`
   - IP Address: `192.168.20.100` (must be in 192.168.20.x range)
   - MAC Address: (optional)

4. Generate QR code for the device
5. Scan with mobile device on 192.168.10.x network
6. Start casting!

## Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t chromecast-gateway .

# Run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Run the application
docker run -d --name chromecast-gateway \
  --link mongodb:mongodb \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongodb:27017/chromecast-gateway \
  --privileged \
  chromecast-gateway
```

## Production Deployment

### System Service

Create a systemd service file:

```ini
# /etc/systemd/system/chromecast-gateway.service
[Unit]
Description=Chromecast Gateway CMS
After=network.target mongod.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/chromecast-gateway-cms
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable chromecast-gateway
sudo systemctl start chromecast-gateway
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/chromecast-gateway
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Find process using port 3000
   sudo lsof -i :3000
   
   # Kill the process
   sudo kill -9 <PID>
   
   # Or use a different port
   PORT=3001 npm run dev
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   
   # Check MongoDB logs
   sudo journalctl -u mongod
   ```

3. **NFTables permission denied**
   ```bash
   # Ensure user has sudo privileges
   sudo visudo
   
   # Add: username ALL=(ALL) NOPASSWD: /sbin/nft
   
   # Test NFTables
   sudo nft list tables
   ```

4. **Device not reachable**
   ```bash
   # Test connectivity
   ping 192.168.20.100
   
   # Check network configuration
   ip route show
   
   # Verify firewall rules
   sudo nft list ruleset
   ```

### Logs and Debugging

```bash
# Application logs
npm run dev

# System logs
sudo journalctl -u chromecast-gateway -f

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# NFTables rules
sudo nft list ruleset
```

### Performance Optimization

1. **Enable MongoDB indexing**
   ```javascript
   // Connect to MongoDB shell
   mongo chromecast-gateway
   
   // Create indexes
   db.sessions.createIndex({ "active": 1, "expiresAt": 1 })
   db.logs.createIndex({ "timestamp": -1 })
   ```

2. **Configure PM2 for production**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start npm --name "chromecast-gateway" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

## Security Considerations

1. **Change default passwords**
2. **Use strong JWT secrets**
3. **Enable HTTPS in production**
4. **Regular security updates**
5. **Monitor NFTables rules**
6. **Backup database regularly**

## Backup and Recovery

### Database Backup

```bash
# Create backup
mongodump --db chromecast-gateway --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db chromecast-gateway /backup/20240101/chromecast-gateway
```

### Configuration Backup

```bash
# Backup environment and config
cp .env.local /backup/
cp docker-compose.yml /backup/

# Backup NFTables rules
sudo nft list ruleset > /backup/nftables-backup.nft
```

## Support

For additional help:
- Check the main README.md
- Review application logs
- Create an issue on GitHub
- Check MongoDB and NFTables documentation
