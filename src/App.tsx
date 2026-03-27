import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/common/BottomNav';
import ToastContainer from './components/common/Toast';
import Home from './pages/Home';
import LevelSelect from './pages/LevelSelect';
import Practice from './pages/Practice';
import Test from './pages/Test';
import WrongNotes from './pages/WrongNotes';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/test" element={<Test />} />
        <Route path="/wrong" element={<WrongNotes />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
