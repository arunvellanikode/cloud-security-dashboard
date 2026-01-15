import React from 'react';
import './Header.css';

interface HeaderProps {
  onLogout: () => void;
  selectedLogType: string;
  onLogTypeChange: (type: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, selectedLogType, onLogTypeChange }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLogTypeChange(e.target.value);
  };

  return (
    <header>
      <nav>
        <div className="category">
          <label>Log Sources</label>
          <select name="logs" id="logs-dropdown" value={selectedLogType} onChange={handleSelectChange}>
            <option value="">All Logs</option>
            <option value="suricata">Suricata</option>
            <option value="clamav">ClamAV</option>
            <option value="falco">Falco</option>
          </select>
        </div>
        <div className="category">
          <label>Dashboards</label>
          <a href="https://wazuh-dashboard-url" className="button">Wazuh</a>
          <a href="https://openvas-dashboard-url" className="button">OpenVAS</a>
        </div>
        <div className="category">
          <label>SSH Access</label>
          <a href="ssh://ec2-user@server1" className="button">Server 1</a>
          <a href="ssh://ec2-user@server2" className="button">Server 2</a>
          <a href="ssh://ec2-user@server3" className="button">Server 3</a>
          <a href="ssh://ec2-user@server4" className="button">Server 4</a>
          <a href="ssh://ec2-user@server5" className="button">Server 5</a>
        </div>
        <div className="category">
          <label>Actions</label>
          <button className="button logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;