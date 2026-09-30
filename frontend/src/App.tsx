import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-gray-200">
      {/* Sticky header navigation */}
      <Navbar />

      {/* Main site pages */}
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
