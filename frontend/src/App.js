import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Path } from './pages/Path';
import { Profile } from './pages/Profile';
import { LessonPlayer } from './pages/LessonPlayer';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/path" element={<Path />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
