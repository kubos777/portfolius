import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/kubo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio', isInternal: false },
    { name: 'Sobre mí', href: '#sobre-mi', isInternal: false },
    { name: 'Proyectos', href: '#proyectos', isInternal: false },
    { name: 'Horror Scraper', href: '/horror-movies', isInternal: true, isNew: true },
    { name: 'Contacto', href: '#contacto', isInternal: false },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-navbar py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.isInternal ? (
                  <Link
                    to={link.href}
                    className="font-medium text-sm text-gray-400 hover:text-white transition-colors relative flex items-center gap-1.5 py-1"
                  >
                    <span>{link.name}</span>
                    {link.isNew && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        <Flame className="w-2.5 h-2.5" />
                        DEMO
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="font-medium text-sm text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:height-[2px] after:bg-accent-cyan hover:after:w-full after:transition-all after:duration-300"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          <a
            href="#contacto"
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-primary-500/50 transition-all"
            id="nav-cta-btn"
          >
            Contratar
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 top-[73px] z-40 bg-background/95 backdrop-blur-xl border-t border-white/5 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="flex flex-col p-6 gap-6">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.isInternal ? (
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-2.5 px-4 rounded-xl text-lg font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span>{link.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      PROYECTO
                    </span>
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2.5 px-4 rounded-xl text-lg font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <a
            href="#contacto"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-indigo text-white shadow-lg shadow-primary-600/25 hover:opacity-90 transition-all"
          >
            Hablemos ahora
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  );
}
