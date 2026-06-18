import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Path } from './pages/Path';
import { Profile } from './pages/Profile';
import { LessonPlayer } from './pages/LessonPlayer';
import './App.css';

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
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <BrowserRouter key="main">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/path" element={<Path />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;