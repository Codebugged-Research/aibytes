import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Path } from './pages/Path';
import { Profile } from './pages/Profile';
import { Activity } from './pages/Activity';
import { Leaderboard } from './pages/Leaderboard';
import { LessonPlayer } from './pages/LessonPlayer';
import { PhoneWrapper } from './components/PhoneWrapper';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 16, margin: 16, overflow: 'auto', maxHeight: '90%' }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Render Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, fontFamily: 'monospace' }}>
            {this.state.error ? this.state.error.toString() : 'Unknown error'}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 9, fontFamily: 'monospace', marginTop: 8, opacity: 0.8 }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: 12, padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', borderRadius: 8, fontSize: 11, fontWeight: 'bold' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('splashShown', 'true');
    }
  }, []);

  return (
    <div className="App">
      <PhoneWrapper>
        <ErrorBoundary>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {showSplash ? (
                <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
              ) : (
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/activity" element={<Activity />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/path" element={<Path />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
                </Routes>
              )}
            </AnimatePresence>
          </BrowserRouter>
        </ErrorBoundary>
      </PhoneWrapper>
    </div>
  );
}

export default App;