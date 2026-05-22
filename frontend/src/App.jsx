import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NoiseOverlay from './components/NoiseOverlay';
import Home from './pages/Home';
import Live from './pages/Live';
import Upload from './pages/Upload';

export default function App() {
  const location = useLocation();

  return (
    <div className="main-content">
      <NoiseOverlay />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
