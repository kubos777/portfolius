import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import HorrorScraperPage from './pages/HorrorScraperPage';
import HorrorScraperLab from './pages/HorrorScraperLab';

function PortfolioMain() {
  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-gray-200">
      {/* Sticky header navigation */}
      <Navbar />

      {/* Main site sections */}
      <main>
        {/* Intro Hero Section */}
        <Hero />

        {/* Profile Biography Section */}
        <About />

        {/* Work Portfolio Section */}
        <Projects />

        {/* Inquiry Interaction Section */}
        <Contact />
      </main>

      {/* Footer copyright */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioMain />} />
        <Route path="/horror-movies" element={<HorrorScraperPage />} />
        <Route path="/horror-movies/scraper-lab" element={<HorrorScraperLab />} />
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
