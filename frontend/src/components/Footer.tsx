import React from 'react';
import { ArrowUp } from 'lucide-react';
import logo from '../assets/kubo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 py-12 relative overflow-hidden bg-[#0A0D17]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Brand */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
          />
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500 font-medium">
          © {currentYear} Jorge Chávez. Desarrollador Full Stack. Todos los derechos reservados.
        </p>

        {/* Scroll back to top */}
        <a
          href="#inicio"
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md"
          aria-label="Volver arriba"
          id="scroll-to-top"
        >
          <ArrowUp className="w-4 h-4" />
        </a>
      </div>
    </footer>
  );
}
