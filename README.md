# Cloud Security Dashboard

A web UI for centralized log management system hosted on AWS. This dashboard easily accesses log analysis servers and displays logs in a user-friendly interface.

## Features

- Fetch and display logs from AWS log analysis servers
- Real-time log viewing
- Color-coded log levels (error, warn, info, debug)
- Responsive design

## Prerequisites

- Node.js (version 18 or higher)
- npm

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

Update the API endpoint in `src/LogViewer.tsx` to point to your log server API:

```typescript
const response = await fetch('https://your-log-server-api.com/logs');
```

Replace `'https://your-log-server-api.com/logs'` with your actual API endpoint.

## Development

To start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

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
    "message": "Log message here"
  }
]
```

## Login Credentials

- Username: admin
- Password: admin

**Note:** This is a basic authentication for demonstration. In production, implement proper security measures.