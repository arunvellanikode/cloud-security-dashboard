import React, { useState } from 'react';
import SSHWindow from './SSHWindow';
import './Header.css';

interface Log {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

interface HeaderProps {
  onLogout: () => void;
  selectedLogType: string;
  onLogTypeChange: (type: string) => void;
  logs: Log[];
}

const Header: React.FC<HeaderProps> = ({ onLogout, selectedLogType, onLogTypeChange, logs }) => {
  const [sshWindow, setSshWindow] = useState<{ host: string; username: string; port: number } | null>(null);
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
          <p>Select which security logs to view and filter. Options include Suricata (network intrusion detection), ClamAV (antivirus scanning), and Falco (runtime security monitoring).</p>
          <div className="radio-group">
            <label>
              <input type="radio" name="logs" value="" checked={selectedLogType === ""} onChange={handleSelectChange} />
              All Logs
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
          </div>
          <button className="button download" onClick={handleDownload}>📥 Download Logs</button>
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
          <button className="button" onClick={() => handleSSHClick('ssh://admin@172.31.84.36')}>🖥️ Server 3</button>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@172.31.18.26')}>🖥️ Server 4</button>
          <button className="button" onClick={() => handleSSHClick('ssh://ubuntu@98.93.200.121')}>🖥️ Server 5</button>
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