import React from 'react';
import { Layers, Database, Cpu, Compass } from 'lucide-react';

export default function About() {
  const skillCategories = [
    {
      title: 'Backend',
      icon: <Database className="w-5 h-5 text-accent-cyan" />,
      skills: ['Python', 'Flask', 'Django', 'FastAPI', 'Node.js', 'PHP (Laravel)'],
    },
    {
      title: 'Frontend',
      icon: <Layers className="w-5 h-5 text-primary-500" />,
      skills: ['React', 'Angular (2+)', 'Vue.js', 'Tailwind CSS', 'HTML5', 'CSS3'],
    },
    {
      title: 'Cloud & DevOps',
      icon: <Cpu className="w-5 h-5 text-accent-indigo" />,
      skills: ['AWS (Lambda, S3, RDS)', 'Docker', 'Linux', 'Git & GitHub Actions', 'CI/CD'],
    },
    {
      title: 'Databases & Herramientas',
      icon: <Compass className="w-5 h-5 text-purple-400" />,
      skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'RethinkDB', 'iOS Dev', 'Metodologías Ágiles'],
    }
  ];

  const stats = [
    { number: '6+', label: 'Años de Experiencia' },
    { number: 'UNAM', label: 'Ing. Computación' },
    { number: 'AWS', label: 'Experto en Nube' },
  ];

  return (
    <section id="sobre-mi" className="py-24 relative overflow-hidden">
      <div className="absolute top-[30%] right-[5%] w-[30vw] h-[30vw] glow-purple opacity-40 blur-[130px] pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-cyan mb-3">
            Conóceme mejor
          </h2>
          <p className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Transformando Código en Soluciones de Alto Impacto
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-accent-cyan mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-start">
          <div className="lg:col-span-6 text-left flex flex-col justify-center h-full">
            <h3 className="font-display font-bold text-2xl text-white mb-4">
              ¿Quién es el desarrollador detrás del código?
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Hola, soy un desarrollador enfocado en resolver problemas del mundo real a través del software. Soy Ingeniero en Computación por la UNAM, con un Diplomado en Infraestructura de Tecnologías.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Tengo pasión por la innovación tecnológica, la optimización de bases de datos y el aprendizaje continuo. Poseo un historial comprobado en la resolución de incidencias y creación de APIs robustas.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Me especializo en arquitecturas en la nube (AWS), backend con Python y frontend con React y Angular, asegurando siempre que las aplicaciones sean escalables y eficientes.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
              {stats.map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {skillCategories.map((category, index) => (
              <div
                key={index}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                    {category.icon}
                  </div>
                  <h4 className="font-display font-bold text-sm text-white tracking-wide">
                    {category.title}
                  </h4>
                </div>
                
                <ul className="flex flex-wrap gap-2">
                  {category.skills.map((skill, sIdx) => (
                    <li
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400 font-medium hover:text-white hover:border-white/10 transition-all"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
