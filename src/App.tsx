import { useState } from 'react'
import Login from './Login'
import LogViewer from './LogViewer'
import Header from './Header'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedLogType, setSelectedLogType] = useState('')

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
          <Header onLogout={handleLogout} selectedLogType={selectedLogType} onLogTypeChange={handleLogTypeChange} />
          <LogViewer selectedLogType={selectedLogType} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App