/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Arun B (arunvellanikode) and Amal J Krishnan (jetblackwing)
 */

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Analytics.css';

interface AnalyticsData {
  agent: string;
  source: string;
  totalAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  successRate: number;
  lastUpdate: string;
}

interface AnalyticsProps {
  logs: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('combined');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [histogramData, setHistogramData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchHistogramData();
  }, [logs, timeFilter]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistogramData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/histogram?timeFilter=${timeFilter}`);
      if (!response.ok) {
        // Use mock data if API endpoint doesn't exist
        const mockData = generateMockHistogramData();
        setHistogramData(mockData);
        return;
      }
      const data = await response.json();
      setHistogramData(data);
    } catch (error) {
      console.error('Error fetching histogram data:', error);
      // Fallback to mock data
      const mockData = generateMockHistogramData();
      setHistogramData(mockData);
    }
  };

  const generateMockHistogramData = () => {
    const hours = 24;
    const logTypes = ['suricata', 'clamav', 'falco'];
    const data = [];

    for (let i = 0; i < hours; i++) {
      const hour = new Date();
      hour.setHours(hour.getHours() - (hours - i - 1));
      const timeLabel = hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const dataPoint: any = {
        time: timeLabel,
      };

      logTypes.forEach(type => {
        dataPoint[type] = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 30);
      });

      data.push(dataPoint);
    }

    return data;
  };

  const getSeverityColor = (level: string | number): string => {
    const levelStr = String(level).toLowerCase();
    if (levelStr.includes('critical') || levelStr === '15' || levelStr === '13' || levelStr === '12') return '#d32f2f';
    if (levelStr.includes('high') || levelStr.includes('warning') || levelStr === '11' || levelStr === '10') return '#f57c00';
    if (levelStr.includes('medium') || levelStr === '7' || levelStr === '6' || levelStr === '5') return '#fbc02d';
    return '#4caf50';
  };

  const handleDownloadAnalytics = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Agent,Source,Total Alerts,Critical,Warning,Info,Success Rate,Last Update\n' +
      analyticsData.map(item => 
        `${item.agent},${item.source},${item.totalAlerts},${item.criticalCount},${item.warningCount},${item.infoCount},${item.successRate}%,${item.lastUpdate}`
      ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:3000/api/reanalyze', { method: 'POST' });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Re-analysis failed');
      }
      const body = await resp.json();
      if (body.analytics) {
        setAnalyticsData(body.analytics);
      } else {
        // Fallback to fetching analytics
        await fetchAnalytics();
      }
    } catch (err) {
      console.error('Error re-analyzing logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPieChartData = () => {
    if (chartView === 'combined') {
      return [
        {
          name: 'Critical',
          value: analyticsData.reduce((sum, item) => sum + item.criticalCount, 0),
          fill: '#d32f2f'
        },
        {
          name: 'Warning',
          value: analyticsData.reduce((sum, item) => sum + item.warningCount, 0),
          fill: '#f57c00'
        },
        {
          name: 'Info',
          value: analyticsData.reduce((sum, item) => sum + item.infoCount, 0),
          fill: '#4caf50'
        }
      ];
    } else if (chartView === 'agent1') {
      const agent1Data = analyticsData.filter(item => item.agent === 'Agent 1');
      return [
        {
          name: 'Critical',
          value: agent1Data.reduce((sum, item) => sum + item.criticalCount, 0),
          fill: '#d32f2f'
        },
        {
          name: 'Warning',
          value: agent1Data.reduce((sum, item) => sum + item.warningCount, 0),
          fill: '#f57c00'
        },
        {
          name: 'Info',
          value: agent1Data.reduce((sum, item) => sum + item.infoCount, 0),
          fill: '#4caf50'
        }
      ];
    } else {
      const agent2Data = analyticsData.filter(item => item.agent === 'Agent 2');
      return [
        {
          name: 'Critical',
          value: agent2Data.reduce((sum, item) => sum + item.criticalCount, 0),
          fill: '#d32f2f'
        },
        {
          name: 'Warning',
          value: agent2Data.reduce((sum, item) => sum + item.warningCount, 0),
          fill: '#f57c00'
        },
        {
          name: 'Info',
          value: agent2Data.reduce((sum, item) => sum + item.infoCount, 0),
          fill: '#4caf50'
        }
      ];
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h2>📊 Security Analytics Report</h2>
        <div className="analytics-header-actions">
          <button className="button download-analytics" onClick={handleDownloadAnalytics}>
            📥 Download Report
          </button>
          <button className="button reanalyze" onClick={handleReanalyze}>
            🔁 Re-analyze
          </button>
        </div>
      </div>
      
      <div className="analytics-summary">
        <div className="summary-stat">
          <div className="stat-label">Total Alerts</div>
          <div className="stat-value">{analyticsData.reduce((sum, item) => sum + item.totalAlerts, 0)}</div>
        </div>
        <div className="summary-stat critical">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{analyticsData.reduce((sum, item) => sum + item.criticalCount, 0)}</div>
        </div>
        <div className="summary-stat warning">
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{analyticsData.reduce((sum, item) => sum + item.warningCount, 0)}</div>
        </div>
        <div className="summary-stat info">
          <div className="stat-label">Info</div>
          <div className="stat-value">{analyticsData.reduce((sum, item) => sum + item.infoCount, 0)}</div>
        </div>
        <div className="summary-stat success">
          <div className="stat-label">Avg Success Rate</div>
          <div className="stat-value">
            {analyticsData.length > 0 
              ? (analyticsData.reduce((sum, item) => sum + item.successRate, 0) / analyticsData.length).toFixed(1) 
              : 0}%
          </div>
        </div>
      </div>

      <div className="analytics-table-container">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Security Tool</th>
              <th>Total Alerts</th>
              <th>Critical</th>
              <th>Warnings</th>
              <th>Info</th>
              <th>Success Rate</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.length > 0 ? (
              analyticsData.map((item, index) => (
                <tr key={index} className="analytics-row">
                  <td className="agent-cell">
                    <span className="agent-badge">{item.agent}</span>
                  </td>
                  <td className="source-cell">{item.source}</td>
                  <td className="number-cell">{item.totalAlerts}</td>
                  <td className="critical-cell" style={{ color: getSeverityColor('critical') }}>
                    {item.criticalCount}
                  </td>
                  <td className="warning-cell" style={{ color: getSeverityColor('warning') }}>
                    {item.warningCount}
                  </td>
                  <td className="info-cell" style={{ color: getSeverityColor('info') }}>
                    {item.infoCount}
                  </td>
                  <td className="success-cell">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${item.successRate}%`, backgroundColor: item.successRate >= 80 ? '#4caf50' : item.successRate >= 60 ? '#fbc02d' : '#d32f2f' }}
                      />
                    </div>
                    <span className="percentage">{item.successRate}%</span>
                  </td>
                  <td className="timestamp-cell">{new Date(item.lastUpdate).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">No analytics data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="analytics-details">
        <div className="detail-card">
          <h3>🛡️ Agent 1 (172.31.28.18)</h3>
          <ul>
            {analyticsData.filter(item => item.agent === 'Agent 1').map((item, idx) => (
              <li key={idx}>{item.source}: {item.totalAlerts} alerts</li>
            ))}
          </ul>
        </div>
        <div className="detail-card">
          <h3>🛡️ Agent 2 (172.31.18.207)</h3>
          <ul>
            {analyticsData.filter(item => item.agent === 'Agent 2').map((item, idx) => (
              <li key={idx}>{item.source}: {item.totalAlerts} alerts</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="charts-container">
        <div className="alert-category-box">
          <h3>📊 Alerts by Category</h3>
          
          <div className="chart-view-controls">
            <label className="radio-group">
              <input
                type="radio"
                name="chartView"
                value="combined"
                checked={chartView === 'combined'}
                onChange={(e) => setChartView(e.target.value)}
              />
              <span>Combined (All Agents)</span>
            </label>
            <label className="radio-group">
              <input
                type="radio"
                name="chartView"
                value="agent1"
                checked={chartView === 'agent1'}
                onChange={(e) => setChartView(e.target.value)}
              />
              <span>Agent 1 (172.31.28.18)</span>
            </label>
            <label className="radio-group">
              <input
                type="radio"
                name="chartView"
                value="agent2"
                checked={chartView === 'agent2'}
                onChange={(e) => setChartView(e.target.value)}
              />
              <span>Agent 2 (172.31.18.207)</span>
            </label>
          </div>

          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} alerts`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="alert-category-box">
          <h3>📈 Alerts Timeline by Log Type</h3>
          
          <div className="histogram-time-filter">
            <label>Time Range:</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="histogram-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#fff', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #fff', borderRadius: '4px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => `${value} alerts`}
                />
                <Legend wrapperStyle={{ color: '#fff', paddingTop: '20px' }} />
                <Bar dataKey="suricata" fill="#ff6b6b" name="Suricata" />
                <Bar dataKey="clamav" fill="#4ecdc4" name="ClamAV" />
                <Bar dataKey="falco" fill="#ffd93d" name="Falco" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
