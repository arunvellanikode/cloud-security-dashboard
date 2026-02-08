/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Arun B (arunvellanikode) and Amal J Krishnan (jetblackwing)
 */

import React from 'react';
import './Welcome.css';

const Welcome: React.FC = () => {
  return (
    <div className="welcome-banner">
      <h1>Welcome to Cloud Security Dashboard</h1>
      <p>This dashboard provides centralized log management for your AWS security systems, allowing you to monitor and analyze security events from multiple sources.</p>
    </div>
  );
};

export default Welcome;