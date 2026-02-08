/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Arun B (arunvellanikode) and Amal J Krishnan (jetblackwing)
 */

import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './SSHWindow.css';

interface SSHWindowProps {
  host: string;
  username: string;
  port?: number;
  onClose: () => void;
}

const SSHWindow: React.FC<SSHWindowProps> = ({ host, username, port = 22, onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminal.current = new Terminal();
      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();

      const wsUrl = `ws://localhost:8080/?host=${encodeURIComponent(host)}&username=${encodeURIComponent(username)}&port=${port}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        terminal.current?.write(event.data);
      };

      ws.current.onclose = () => {
        console.log('WebSocket closed');
        terminal.current?.write('\r\nConnection closed\r\n');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        terminal.current?.write('\r\nConnection error\r\n');
      };

      terminal.current.onData((data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(data);
        }
      });

      const handleResize = () => {
        if (fitAddon.current) {
          fitAddon.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (ws.current) {
          ws.current.close();
        }
        if (terminal.current) {
          terminal.current.dispose();
        }
      };
    }
  }, [host, username, port]);

  return (
    <div className="ssh-window-overlay">
      <div className="ssh-window">
        <div className="ssh-window-header">
          <h3>SSH to {username}@{host}:{port}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div ref={terminalRef} className="ssh-terminal"></div>
      </div>
    </div>
  );
};

export default SSHWindow;