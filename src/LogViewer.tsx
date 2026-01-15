import React, { useState, useEffect } from 'react';
import './LogViewer.css';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface LogViewerProps {
  selectedLogType: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ selectedLogType }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Replace with your actual log server API endpoint
      const response = await fetch('https://your-log-server-api.com/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data: LogEntry[] = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading logs...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className={`log-viewer ${selectedLogType ? `highlight-${selectedLogType}` : ''}`}>
      {selectedLogType && (
        <div className="notification">
          Viewing {selectedLogType.charAt(0).toUpperCase() + selectedLogType.slice(1)} logs
        </div>
      )}
      <h2>Centralized Log Management Dashboard</h2>
      <table className="log-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.timestamp}</td>
              <td className={`level-${log.level.toLowerCase()}`}>{log.level}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogViewer;