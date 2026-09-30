import React from 'react';
import { ArrowUpRight, Github, Linkedin, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 z-0"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] glow-purple opacity-70 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] glow-cyan opacity-60 blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
        {/* Text Area */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent-cyan text-xs font-semibold mb-6 tracking-wide backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
            </span>
            Disponible para Nuevos Proyectos
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
            Hola, soy <br />
            <span className="text-gradient-purple-cyan animate-gradient-x bg-clip-text">Jorge Chávez</span> <br />
            Desarrollador Full Stack
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            Más de 6 años de experiencia en el diseño, construcción y mantenimiento de aplicaciones escalables basadas en Python (Flask, Django, FastAPI) y JavaScript (React, Angular, Vue.js). Experto en arquitecturas en la nube con AWS.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
            <a
              href="#proyectos"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-indigo hover:from-primary-500 hover:to-accent-indigo text-white font-semibold text-sm shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
              id="hero-projects-btn"
            >
              Explorar Proyectos
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#contacto"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-sm backdrop-blur-md active:scale-95 transition-all w-full sm:w-auto"
              id="hero-contact-btn"
            >
              Hablemos
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Conéctame:</span>
            <a href="https://github.com/kubos777" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/jorge-luis-ch%C3%A1vez-delgado-9719a1178/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Code Visualizer Mockup */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 relative overflow-hidden shadow-2xl border-white/10">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <Terminal className="w-3.5 h-3.5" />
                developer.ts
              </div>
            </div>
            
            <pre className="font-mono text-xs text-left leading-relaxed overflow-x-auto text-gray-300">
              <code>
{`const developer = {
  name: 'Jorge Chávez',
  role: 'Desarrollador Full Stack',
  skills: [
    'Python', 'React', 'AWS', 
    'Node.js', 'PostgreSQL', 'Docker'
  ],
  passion: 'Crafting high-quality software',
  coffeeConsumption: 'Infinite',
  
  solveProblems: (ideas) => {
    return ideas
      .map(idea => translateToCode(idea))
      .filter(isSecure && isPerformant);
  }
};`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
