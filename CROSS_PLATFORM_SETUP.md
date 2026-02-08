# Cross-Platform Setup Guide

This project is fully compatible with both Windows and Linux. Follow these platform-specific instructions.

## Prerequisites (Both Platforms)
- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)

### Verify Installation
```bash
node --version
npm --version
```

## Linux Setup

### Install Dependencies
```bash
npm install
```

### SSH Key Setup
The project uses a private SSH key for authentication. Ensure proper permissions:
```bash
chmod 600 keyfile/NewPem.pem
```

### Run Development Server (Both Frontend + Backend)
```bash
npm run dev-full
```

Or run separately:
```bash
# Terminal 1: Frontend (Vite dev server on http://localhost:5173)
npm run dev

# Terminal 2: Backend (Express server on http://localhost:3000)
npm run server
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Windows Setup

### Install Dependencies
```bash
npm install
```

### SSH Key Setup
Ensure the SSH key file exists at `keyfile/NewPem.pem`. File permissions are handled automatically by Node.js/Windows.

### Run Development Server (Both Frontend + Backend)
```bash
npm run dev-full
```

Or run separately in PowerShell/Command Prompt:
```bash
# Terminal 1: Frontend (Vite dev server on http://localhost:5173)
npm run dev

# Terminal 2: Backend (Express server on http://localhost:3000)
npm run server
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Environment Compatibility

### Cross-Platform Features
✅ Path handling using `path.join()` (works on both Windows & Linux)
✅ Line endings normalized with `.gitattributes`
✅ All dependencies support Windows and Linux
✅ No platform-specific shell scripts

### Tested On
- Windows 10/11 (PowerShell, Command Prompt)
- Linux (Ubuntu 20.04+, CentOS, Debian)
- macOS (compatible)

## Troubleshooting

### Port Already in Use
- Vite default: `http://localhost:5173`
- Express default: `http://localhost:3000`

Change ports in your environment or modify the configuration.

### Permission Denied (Linux)
If you get permission errors:
```bash
# Set proper permissions for SSH key
chmod 600 keyfile/NewPem.pem

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found
```bash
# Clear cache and reinstall
npm cache clean --force
npm install
```

### npm run server exits with code 1
Check the console output for specific errors. Common issues:
1. SSH key file missing or permissions incorrect
2. Port 3000 already in use
3. SSH connection issues to target servers

## Project Structure
```
cloud-security-dashboard/
├── src/                 # React source files
├── keyfile/            # SSH key for authentication
├── temp_logs/          # Downloaded logs directory
├── server.js           # Express/WebSocket server
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── .gitattributes      # Cross-platform line ending config
```

## Git Configuration for Team

After cloning, configure git for proper line endings:
```bash
git config core.autocrlf true    # On Windows
git config core.autocrlf input   # On Linux/macOS
```

## Support

For issues specific to your platform, check:
- Node.js version compatibility
- Port availability (netstat/ss commands)
- SSH key permissions
- Network connectivity to target servers
