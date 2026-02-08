/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Arun B (arunvellanikode) and Amal J Krishnan (jetblackwing)
 */

import React, { useState, useEffect } from 'react';
import SSHWindow from './SSHWindow';
import './Header.css';

interface Log {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

interface ActivityStatus {
  isActive: boolean;
  currentActivity: string;
  progress: number;
  message: string;
  error: string | null;
  startTime: string | null;
}

interface HeaderProps {
  onLogout: () => void;
  selectedLogType: string;
  onLogTypeChange: (type: string) => void;
  logs: Log[];
}

const Header: React.FC<HeaderProps> = ({ onLogout, selectedLogType, onLogTypeChange, logs }) => {
  const [sshWindow, setSshWindow] = useState<{ host: string; username: string; port: number } | null>(null);
  const [status, setStatus] = useState<ActivityStatus>({
    isActive: false,
    currentActivity: 'idle',
    progress: 0,
    message: 'Ready',
    error: null,
    startTime: null
  });

  // Poll for status updates
  useEffect(() => {
    if (!status.isActive) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/status');
        if (response.ok) {
          const statusData = await response.json();
          setStatus(statusData);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status.isActive]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLogTypeChange(e.target.value);
  };

  const handleDownload = () => {
    const filteredLogs = selectedLogType ? logs.filter(log => log.source.toLowerCase() === selectedLogType) : logs;
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Timestamp,Level,Message,Source\n' + 
      filteredLogs.map(log => `${log.timestamp},${log.level},${log.message},${log.source}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `logs_${selectedLogType || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRemoteLogs = async () => {
    try {
      setStatus({
        isActive: true,
        currentActivity: 'downloading',
        progress: 0,
        message: 'Starting download...',
        error: null,
        startTime: new Date().toISOString()
      });

      const response = await fetch('http://localhost:3000/api/download-logs');
      if (!response.ok) {
        throw new Error('Failed to download remote logs');
      }
      
      setStatus({
        ...status,
        currentActivity: 'analyzing',
        progress: 75,
        message: 'Analyzing downloaded logs...'
      });

      // Fetch analytics after downloading
      const analyticsResponse = await fetch('http://localhost:3000/api/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        
        // Create CSV with analytics data
        const csvContent = 'data:text/csv;charset=utf-8,' +
          'Agent,Source,Total Alerts,Critical,Warning,Info,Success Rate,Last Update\n' +
          analyticsData.map((item: any) => 
            `${item.agent},${item.source},${item.totalAlerts},${item.criticalCount},${item.warningCount},${item.infoCount},${item.successRate}%,${new Date(item.lastUpdate).toLocaleString()}`
          ).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setStatus({
        isActive: false,
        currentActivity: 'idle',
        progress: 100,
        message: 'Download and analysis complete',
        error: null,
        startTime: null
      });

      alert('Remote logs downloaded and analytics report generated successfully');
      // Refresh logs
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus({
        isActive: false,
        currentActivity: 'idle',
        progress: 0,
        message: `Error: ${errorMessage}`,
        error: errorMessage,
        startTime: null
      });
      alert('Error downloading remote logs: ' + errorMessage);
    }
  };

  const handleSSHClick = (sshUrl: string) => {
    const url = new URL(sshUrl);
    const username = url.username;
    const host = url.hostname;
    const port = parseInt(url.port) || 22;
    setSshWindow({ host, username, port });
  };

  return (
    <header>
      <div className="top-bar">
        <div className="last-logins">
          Last logins: 2026-01-15 10:00, 2026-01-14 15:30, 2026-01-13 09:15
        </div>
        <div className="actions">
          <button className="button logout small" onClick={onLogout}>🚪 Logout</button>
        </div>
      </div>
      <nav>
        <div className="category">
          <label>📋 Log Sources</label>
          <p>Select which security logs to view and filter. Options include Wazuh (security information and event management), Suricata (network intrusion detection), ClamAV (antivirus scanning), Falco (runtime security monitoring), and OpenVAS-GVM (vulnerability scanning).</p>
          <div className="radio-group">
            <label>
              <input type="radio" name="logs" value="" checked={selectedLogType === ""} onChange={handleSelectChange} />
              All Logs
            </label>
            <label>
              <input type="radio" name="logs" value="wazuh" checked={selectedLogType === "wazuh"} onChange={handleSelectChange} />
              Wazuh
            </label>
            <label>
              <input type="radio" name="logs" value="suricata" checked={selectedLogType === "suricata"} onChange={handleSelectChange} />
              Suricata
            </label>
            <label>
              <input type="radio" name="logs" value="clamav" checked={selectedLogType === "clamav"} onChange={handleSelectChange} />
              ClamAV
            </label>
            <label>
              <input type="radio" name="logs" value="falco" checked={selectedLogType === "falco"} onChange={handleSelectChange} />
              Falco
            </label>
            <label>
              <input type="radio" name="logs" value="openvas-gvm" checked={selectedLogType === "openvas-gvm"} onChange={handleSelectChange} />
              OpenVAS-GVM
            </label>
          </div>
          <button className="button download" onClick={handleDownload}>📥 Download Logs</button>
          <button className="button download" onClick={handleDownloadRemoteLogs}>📥 Download Remote Logs</button>
          
          {status.isActive && (
            <div className="activity-status">
              <div className="status-header">
                <span className="status-activity">⏳ {status.currentActivity.toUpperCase()}</span>
                <span className="status-progress">{Math.round(status.progress)}%</span>
              </div>
              <div className="status-message">{status.message}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${status.progress}%` }}></div>
              </div>
            </div>
          )}
          
          {status.error && (
            <div className="activity-error">
              <span className="error-icon">❌</span>
              <span className="error-message">{status.error}</span>
            </div>
          )}
        </div>
        <div className="category">
          <label>📊 Dashboards</label>
          <p>Access external security dashboards for comprehensive threat analysis. Includes Wazuh for security information and event management, and OpenVAS for vulnerability scanning.</p>
          <a href="https://172.31.18.26/" className="button" target="_blank">📊 Wazuh</a>
          <a href="http://172.31.85.154:9392/" className="button" target="_blank">📊 OpenVAS</a>
        </div>
        <div className="category">
          <label>🔐 SSH Access</label>
          <p>Direct SSH connections to your AWS EC2 instances for server management and troubleshooting. Quick access to 5 configured servers.</p>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@172.31.28.18')}>🖥️ Agent 1</button>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@172.31.18.207')}>🖥️ Agent 2</button>
          <button className="button" onClick={() => handleSSHClick('ssh://admin@172.31.84.36')}>🖥️ Kali Machine</button>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@172.31.18.26')}>🖥️ Wazuh Machine</button>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@172.31.85.154')}>🖥️ OpenVAS Machine</button>
        </div>
      </nav>
      {sshWindow && (
        <SSHWindow
          host={sshWindow.host}
          username={sshWindow.username}
          port={sshWindow.port}
          onClose={() => setSshWindow(null)}
        />
      )}
    </header>
  );
};

export default Header;