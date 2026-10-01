import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  description: string;
  category: 'fullstack' | 'frontend' | 'backend';
  tech: string[];
  gradient: string;
  route?: string;
  badge?: string;
}

export default function Projects() {
  const [filter, setFilter] = useState<'all' | 'fullstack' | 'frontend' | 'backend'>('all');

  const projectsData: Project[] = [
    {
      id: 0,
      title: 'El Archivo del Terror & Ruleta de Halloween',
      description: 'Plataforma interactiva de cine de terror con 3,088 películas de los últimos 26 años (2000–2026). Incluye Ruleta del Miedo para el reto de 31 días de octubre, seguimiento de películas vistas, generador de historias para Instagram y motor de indexación.',
      category: 'fullstack',
      tech: ['React', 'Node.js', 'Cheerio', 'Canvas API', 'Web Audio API', 'Tailwind CSS'],
      gradient: 'from-orange-950 via-red-900 to-black',
      route: '/horror-movies',
      badge: '🎃 RETO HALLOWEEN',
    },
    {
      id: 1,
      title: 'Desarrollador Web Full Stack - PRESTANÓMICO',
      description: 'Desarrollo y mantenimiento de APIs RESTful escalables con Python. Optimización de consultas SQL, gestión de requerimientos y despliegues continuos en AWS.',
      category: 'fullstack',
      tech: ['Python', 'SQL', 'AWS', 'API REST'],
      gradient: 'from-violet-600 via-indigo-600 to-cyan-500',
    },
    {
      id: 2,
      title: 'Desarrollador SAP HANA XS - SI CONSULTING',
      description: 'Mantenimiento y optimización de bases de datos SAP HANA. Integración de sistemas mediante APIs y desarrollo de programas LSMW para migración de datos.',
      category: 'backend',
      tech: ['SAP HANA', 'APIs', 'LSMW', 'SQL'],
      gradient: 'from-cyan-500 via-teal-500 to-indigo-600',
    },
    {
      id: 3,
      title: 'Desarrollador Python - STRATBRANDING',
      description: 'Desarrollo de módulos en Python para visualización y análisis de encuestas. Automatización de reportes visuales y modelos de datos optimizados.',
      category: 'backend',
      tech: ['Python', 'Data Analysis', 'Automation'],
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    },
    {
      id: 4,
      title: 'Desarrollador Web - PROMOTORA ILDUOMO',
      description: 'Desarrollo de módulos frontend interactivos con Angular 2+ y backend robusto con NestJS. Creación de scripts de migración de bases de datos con Python.',
      category: 'fullstack',
      tech: ['Angular 2+', 'NestJS', 'Python', 'PHP'],
      gradient: 'from-purple-600 via-pink-500 to-red-500',
    },
    {
      id: 5,
      title: 'Desarrollador Full Stack - FEMEDESSIR',
      description: 'Desarrollo integral del sitio web corporativo, abarcando frontend, backend y administración del servidor VPS Linux para garantizar alta disponibilidad.',
      category: 'fullstack',
      tech: ['Frontend', 'Backend', 'Linux VPS', 'Web Security'],
      gradient: 'from-pink-500 via-purple-600 to-indigo-600',
    },
    {
      id: 6,
      title: 'Instructor de Python y Web - UNAM',
      description: 'Impartición de talleres y cursos especializados en Python (básico a avanzado) y Diseño Web en la Facultad de Ingeniería (UNAM).',
      category: 'frontend',
      tech: ['Python', 'HTML5', 'CSS3', 'Mentoring'],
      gradient: 'from-orange-500 via-red-500 to-purple-600',
    }
  ];

  const filteredProjects = filter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  const filterButtons = [
    { id: 'all', label: 'Todos' },
    { id: 'fullstack', label: 'Fullstack' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
  ] as const;

  return (
    <section id="proyectos" className="py-24 relative overflow-hidden bg-[#0A0D17]">
      <div className="absolute top-[10%] left-[5%] w-[35vw] h-[35vw] glow-cyan opacity-30 blur-[130px] pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Head */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-primary-500 mb-3">
            Trayectoria Profesional
          </h2>
          <p className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Experiencia y Proyectos Destacados
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-accent-cyan mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 ${
                filter === btn.id
                  ? 'bg-gradient-to-r from-primary-600 to-accent-indigo text-white border-transparent shadow-lg shadow-primary-650/20'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group h-full border border-white/5 hover:border-primary-500/40"
            >
              <div>
                {/* Card visual header */}
                <div className={`h-48 bg-gradient-to-tr ${project.gradient} p-6 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[#0B0F19]/25 backdrop-blur-[1px] mix-blend-multiply"></div>
                  
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

                  <div className="flex justify-between items-start w-full relative z-10">
                    <span className="px-3 py-1 rounded-full bg-[#0B0F19]/60 backdrop-blur-md text-[10px] font-bold tracking-wider text-white uppercase border border-white/5">
                      {project.category}
                    </span>
                    {project.badge ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/80 backdrop-blur-md text-[10px] font-bold text-white border border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        {project.badge}
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#0B0F19]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-white leading-snug tracking-tight text-left relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {project.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 text-left">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-400 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link for Route */}
              {project.route && (
                <div className="p-6 pt-0 space-y-2">
                  {project.id === 0 && (
                    <Link
                      to="/horror-movies?poster=today"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.65)] transform hover:scale-[1.02] active:scale-95 group/poster"
                      id="generate-today-poster-project-btn"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>🖼️ Generar Póster de Hoy (5 Películas) 🎃</span>
                    </Link>
                  )}

                  <Link
                    to={project.route}
                    className={`w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all group/link ${
                      project.id === 0
                        ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                        : 'bg-gradient-to-r from-orange-600 via-red-600 to-rose-700 hover:from-orange-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.35)]'
                    }`}
                    id="open-horror-scraper-btn"
                  >
                    <span>🎃 Iniciar Reto de Halloween & Explorar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
