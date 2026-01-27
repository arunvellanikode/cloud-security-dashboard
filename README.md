# Cloud Security Dashboard

A web UI for centralized log management system hosted on AWS. This dashboard easily accesses log analysis servers and displays logs in a user-friendly interface.

## Features

- **Fetch and display logs** from AWS log analysis servers (Agent 1 and Agent 2)
- **Real-time log viewing** with log filtering by source
- **Security Analytics Dashboard** with detailed metrics for:
  - Wazuh (Security Information and Event Management)
  - Suricata (Network Intrusion Detection)
  - ClamAV (Antivirus Scanning)
- **Analytics Report** showing alerts at a glance for both agents
- **Table-based Report Display** with critical, warning, and info counts
- **Export Analytics** to CSV format for compliance and reporting
- **Color-coded log levels** (critical, warning, info, debug)
- **Download remote logs** from both Agent 1 (172.31.28.18) and Agent 2 (172.31.18.207)
- **Responsive design** optimized for desktop and mobile

## Prerequisites

- Node.js (version 18 or higher)
- npm
- Access to log servers at 172.31.28.18/log1/ and 172.31.18.207/log2/

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cloud-security-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The dashboard is pre-configured to connect to:
- **Agent 1**: 172.31.28.18/log1/ (Wazuh, Suricata, ClamAV logs)
- **Agent 2**: 172.31.18.207/log2/ (Wazuh, Suricata, ClamAV logs)

Update API endpoints in the following files if needed:
- `src/LogViewer.tsx` - for log fetching
- `server.js` - for remote log download URLs

## Development

To start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Express backend server runs on `http://localhost:3000` and the WebSocket server runs on `ws://localhost:8080`.

## Build

To build the project for production:

```bash
npm run build
```

## Deployment

Deploy the `dist` folder to your preferred hosting service (e.g., AWS S3, AWS Amplify, Vercel).

## API Requirements

The log server API should return JSON in the following format:

```json
[
  {
    "timestamp": "2023-01-01T00:00:00Z",
    "level": "INFO",
    "message": "Log message here",
    "source": "wazuh|suricata|clamav"
  }
]
```

## Analytics API Endpoints

### Get Logs
- **GET** `/api/logs` - Returns all parsed logs from Agent 1 and Agent 2

### Download Remote Logs
- **GET** `/api/download-logs` - Downloads logs from remote agents and generates analytics

### Get Analytics
- **GET** `/api/analytics` - Returns analytics data with statistics for each agent and security tool:
  ```json
  [
    {
      "agent": "Agent 1",
      "source": "wazuh",
      "totalAlerts": 125,
      "criticalCount": 5,
      "warningCount": 12,
      "infoCount": 108,
      "successRate": 86,
      "lastUpdate": "2026-01-27T15:30:00Z"
    }
  ]
  ```

## Features Breakdown

### Log Sources Section
- Filter logs by source: All Logs, Wazuh, Suricata, ClamAV, Falco
- Download logs in CSV format for selected source or all logs
- Download remote logs directly from Agent 1 and Agent 2
- Analytics report is generated automatically with download

### Analytics Dashboard
- **Summary Statistics**: Total alerts, critical count, warnings, info count, and average success rate
- **Analytics Table**: Detailed breakdown by agent and security tool
  - Agent badge (Agent 1 or Agent 2)
  - Security tool (Wazuh, Suricata, ClamAV)
  - Alert counts by severity
  - Success rate with visual progress bar
  - Last update timestamp
- **Agent Details**: Quick reference cards for each agent showing tool-specific alert counts
- **Export**: Download full analytics report as CSV

### Dashboard Access
- External Wazuh Dashboard: https://172.31.18.26/
- External OpenVAS Dashboard: http://172.31.85.154:9392/

### SSH Access
- Direct SSH connections to:
  - Agent 1 (ubuntu@172.31.28.18)
  - Agent 2 (ubuntu@172.31.18.207)
  - Server 3 (admin@172.31.84.36)
  - Server 4 (ubuntu@172.31.18.26)
  - Server 5 (ubuntu@172.31.85.154)

## Login Credentials

- Username: admin
- Password: admin

**Note:** This is a basic authentication for demonstration. In production, implement proper security measures.