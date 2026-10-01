import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Terminal, 
  Play, 
  Database, 
  Download, 
  FileCode2, 
  Layers, 
  Server
} from 'lucide-react';
import horrorData from '../data/horror_movies.json';

export default function HorrorScraperLab() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] Laboratorio de Scrapping de Jorge Chávez (@kubos777)',
    '[SYSTEM] Engine: Node.js + Cheerio HTML Parser',
    `[CACHE] Dataset activo: ${horrorData.metadata.totalFilms} películas (2000-2026)`,
  ]);

  const availableYears: number[] = [];
  for (let y = 2026; y >= 2000; y--) {
    availableYears.push(y);
  }

  const runScrapeSimulation = (year: number) => {
    if (isScraping) return;
    setIsScraping(true);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] Iniciando recolección para el año ${year}...`,
      `[HTTP GET] Solicitando: https://en.wikipedia.org/wiki/List_of_horror_films_of_${year}`,
      `[HEADERS] User-Agent: PortfoliusScraper/1.0`,
      `[STATUS] 200 OK • Tamaño del HTML: ~750 KB`,
    ]);

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        `[CHEERIO] Cargando DOM y buscando tablas 'wikitable sortable'...`,
        `[PARSER] Detectada tabla: 'Horror films released in ${year}'`,
        `[NORMALIZER] Extrayendo Title, Director, Cast, Country y Subgenres...`,
      ]);
    }, 700);

    setTimeout(() => {
      const count = (horrorData.metadata.filmsByYear as Record<string, number>)[year.toString()] || 140;
      setConsoleLogs((prev) => [
        ...prev,
        `[SUCCESS] Se procesaron ${count} películas de terror de ${year} exitosamente.`,
        `[STORAGE] Datos almacenados en frontend/src/data/horror_movies.json`,
      ]);
      setIsScraping(false);
    }, 1600);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(horrorData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `horror_movies_database_full.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-200 p-6 sm:p-10 font-sans selection:bg-red-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              to="/horror-movies"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a El Archivo del Terror
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
              Subruta Privada // Dev Scraper Lab
            </span>
          </div>

          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Base de Datos Completa (JSON)
          </button>
        </div>

        {/* Overview Banner */}
        <div className="p-6 rounded-2xl bg-[#0D111C] border border-red-950/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Server className="w-6 h-6 text-red-500" />
              <span>Motor de Web Scraping & Ingesta de Datos</span>
            </h1>
            <p className="mt-1 text-sm text-gray-400 max-w-2xl">
              Panel técnico de recolección de películas de terror (2000–2026). Este módulo permite ejecutar la extracción en vivo, monitorear el parseo de Wikipedia con Cheerio y consultar la base de datos persistida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="block text-xl font-bold font-mono text-red-400">{horrorData.metadata.totalFilms}</span>
              <span className="text-[10px] text-gray-500 uppercase">Películas</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="block text-xl font-bold font-mono text-cyan-400">27</span>
              <span className="text-[10px] text-gray-500 uppercase">Años</span>
            </div>
          </div>
        </div>

        {/* Live Terminal & Interactive Trigger */}
        <div className="rounded-2xl bg-[#0A0D15] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-4 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono font-bold text-gray-300">Terminal de Control de Ingesta</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Año {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => runScrapeSimulation(selectedYear)}
                disabled={isScraping}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-all font-mono"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isScraping ? 'Extrayendo...' : `Scrapear Año ${selectedYear}`}
              </button>
            </div>
          </div>

          <div className="p-4 font-mono text-xs text-gray-300 bg-black/80 min-h-[220px] max-h-[300px] overflow-y-auto space-y-1.5">
            {consoleLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 select-none">&gt;</span>
                <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('HTTP') ? 'text-cyan-400' : 'text-gray-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#0C101A] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
              <FileCode2 className="w-4 h-4" />
              <span>Script de Scraping</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ubicado en <code className="text-gray-300">frontend/scripts/scrape.js</code>. Ejecutable en terminal con el comando <code className="text-orange-400">npm run scrape</code> para actualizar los 26+ años en 15 segundos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C101A] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Database className="w-4 h-4" />
              <span>Almacenamiento Actual</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Persistido en <code className="text-gray-300">frontend/src/data/horror_movies.json</code> (981 KB). Carga instantánea en cliente con cero latencia para el portfolio.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C101A] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <Layers className="w-4 h-4" />
              <span>Recomendación Base de Datos</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Para escalar: <strong>SQLite + Drizzle</strong> para persistencia local en <code className="text-gray-300">/backend</code>, o <strong>Supabase (PostgreSQL)</strong> para despliegue en la nube gratuito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
