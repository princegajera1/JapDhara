import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Jaap from './pages/Jaap';
import Mala from './pages/Mala';
import Mantras from './pages/Mantras';
import MantraDetails from './pages/MantraDetails';
import Meditation from './pages/Meditation';
import Stats from './pages/Stats';
import History from './pages/History';
import Achievements from './pages/Achievements';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Splash Entry Screen */}
            <Route path="/" element={<Splash />} />

            {/* Onboarding Screen */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Main Application Layout Routes */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/jaap" element={<Jaap />} />
              <Route path="/mala" element={<Mala />} />
              <Route path="/mantras" element={<Mantras />} />
              <Route path="/mantras/:id" element={<MantraDetails />} />
              <Route path="/meditation" element={<Meditation />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/statistics" element={<Stats />} />
              <Route path="/history" element={<History />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
