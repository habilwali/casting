# Chromecast Gateway CMS

A modern web application for managing Chromecast devices with room-based network isolation using NFTables. Built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

- 🎯 **Room-based Device Management**: Organize Chromecast devices by rooms
- 📱 **QR Code Generation**: Easy mobile device connection via QR codes
- 🔒 **Network Isolation**: Secure communication between mobile (192.168.10.x) and Chromecast (192.168.20.x) networks
- ⚙️ **Admin Panel**: Manage devices, view logs, and monitor sessions
- 🛡️ **NFTables Integration**: Automatic firewall rules for authorized sessions
- 📊 **Real-time Monitoring**: Live session tracking and system status
- 🔐 **Authentication**: Secure admin access with JWT tokens

## Architecture

```
Mobile Network (192.168.10.x) ←→ Gateway Server ←→ Chromecast Network (192.168.20.x)
                                      ↓
                                 NFTables Rules
                                 (Time-based Authorization)
```

## Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Linux system with NFTables support
- Sudo privileges for NFTables management

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chromecast-gateway-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/chromecast-gateway
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key-here
   ADMIN_PASSWORD=admin123
   
   # Server Configuration
   SERVER_PORT=3000
   SERVER_HOST=192.168.70.215
   
   # Network Configuration
   MOBILE_NETWORK=192.168.10.0/24
   CHROMECAST_NETWORK=192.168.20.0/24
   
   # NFTables Configuration
   NFT_TABLE=inet
   NFT_NAMESPACE=chromecast
   NFT_SET=authorized_sessions
   ```

4. **Start MongoDB**
   ```bash
   # Using systemd
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Initialize NFTables** (Run as root)
   ```bash
   sudo nft add table inet chromecast
   sudo nft add set inet chromecast authorized_sessions '{ type ipv4_addr . ipv4_addr ; flags timeout ; }'
   sudo nft add chain inet chromecast forward '{ type filter hook forward priority 0 ; policy drop ; }'
   sudo nft add rule inet chromecast forward ct state established,related accept
   sudo nft add rule inet chromecast forward iif lo accept
   sudo nft add rule inet chromecast forward ip saddr . ip daddr @authorized_sessions accept
   sudo nft add rule inet chromecast forward ip saddr 192.168.10.0/24 ip daddr 192.168.20.0/24 drop
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Main Dashboard: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin`
   - System Status: `http://localhost:3000/status`

## Usage

### 1. Adding Devices

1. Access the admin panel at `/admin`
2. Login with the admin password
3. Fill in the device form:
   - **Room ID**: Unique identifier (e.g., "living-room")
   - **Device Name**: Display name (e.g., "Living Room TV")
   - **IP Address**: Must be in 192.168.20.x network
   - **MAC Address**: Optional device MAC address

### 2. Connecting Mobile Devices

1. Ensure your mobile device is on the 192.168.10.x network
2. Scan the QR code from the device page or visit the connection URL
3. The system will automatically authorize the connection for 2 hours
4. Start casting from any supported app!

### 3. Session Management

- Sessions automatically expire after 2 hours
- Admin can manually end sessions from the dashboard
- All session activity is logged for monitoring

## API Endpoints

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Add/update device
- `DELETE /api/devices/[room]` - Remove device

### Sessions
- `GET /api/sessions` - List active sessions
- `POST /api/sessions` - Create new session
- `DELETE /api/sessions/[id]` - End session

### Authentication
- `POST /api/auth/login` - Admin login

### System
- `GET /api/status` - System status
- `GET /api/logs` - System logs
- `GET /api/qr/[room]` - Generate QR code

## Network Security

The application implements network isolation using NFTables:

1. **Default Policy**: Drop all traffic between networks
2. **Authorized Sessions**: Time-based rules for specific IP pairs
3. **Automatic Cleanup**: Expired sessions are automatically removed
4. **Audit Logging**: All connection attempts are logged

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── qr/                # QR code pages
│   └── page.tsx           # Main dashboard
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── nftables.ts        # NFTables integration
│   ├── logger.ts          # Logging utilities
│   └── utils.ts           # Helper functions
├── models/                # MongoDB models
└── components/            # React components
```

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `ADMIN_PASSWORD` | Admin panel password | `admin123` |
| `SERVER_HOST` | Server IP address | `192.168.70.215` |
| `SERVER_PORT` | Server port | `3000` |
| `MOBILE_NETWORK` | Mobile devices network | `192.168.10.0/24` |
| `CHROMECAST_NETWORK` | Chromecast devices network | `192.168.20.0/24` |

## Troubleshooting

### Common Issues

1. **NFTables Permission Denied**
   - Ensure the application runs with sudo privileges
   - Check NFTables is installed: `sudo apt install nftables`

2. **MongoDB Connection Failed**
   - Verify MongoDB is running: `sudo systemctl status mongod`
   - Check connection string in `.env.local`

3. **QR Code Not Loading**
   - Verify device IP is reachable
   - Check network connectivity

4. **Sessions Not Working**
   - Ensure mobile device is on correct network (192.168.10.x)
   - Verify NFTables rules are properly configured

### Logs

View application logs:
```bash
# Application logs
npm run dev

# System logs (if using systemd)
sudo journalctl -u your-app-service
```

## Security Considerations

- Change default admin password
- Use HTTPS in production
- Regularly update dependencies
- Monitor NFTables rules
- Implement proper backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error messages
