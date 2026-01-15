import { useState } from 'react'
import Login from './Login'
import LogViewer from './LogViewer'
import Header from './Header'
import Welcome from './Welcome'
import './App.css'

interface Log {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedLogType, setSelectedLogType] = useState('')
  const [logs, setLogs] = useState<Log[]>([])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const handleLogTypeChange = (type: string) => {
    setSelectedLogType(type)
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <Welcome />
          <Header onLogout={handleLogout} selectedLogType={selectedLogType} onLogTypeChange={handleLogTypeChange} logs={logs} />
          <LogViewer selectedLogType={selectedLogType} setLogs={setLogs} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App