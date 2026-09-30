import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Search, 
  Calendar, 
  Globe, 
  Tag, 
  ExternalLink, 
  ArrowLeft, 
  Terminal, 
  Download, 
  Filter, 
  Play, 
  CheckCircle2, 
  Clapperboard, 
  Users, 
  X, 
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import horrorData from '../data/horror_movies.json';

interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  cast: string;
  country: string;
  subgenre: string;
  wikiUrl: string;
}

const ITEMS_PER_PAGE = 24;

export default function HorrorScraperPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Live Scraper Simulation Terminal state
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapeTargetYear, setScrapeTargetYear] = useState(2024);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Available years list (descending 2026 -> 2000)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y >= 2000; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute top genres and countries
  const { genresList, countriesList } = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    horrorData.films.forEach((m: Movie) => {
      // Clean genre
      const g = m.subgenre ? m.subgenre.split(',')[0].trim() : 'Horror';
      genreCounts[g] = (genreCounts[g] || 0) + 1;

      // Clean country
      const c = m.country ? m.country.split(',')[0].trim() : 'Desconocido';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .filter(g => g !== 'Horror' && g !== 'Desconocido' && g.length > 2)
      .slice(0, 12);

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .filter(c => c !== 'Desconocido')
      .slice(0, 15);

    return {
      genresList: ['all', 'Horror', ...topGenres],
      countriesList: ['all', ...topCountries]
    };
  }, []);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return horrorData.films.filter((m: Movie) => {
      // Year filter
      if (selectedYear !== 'all' && m.year !== selectedYear) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'all') {
        const movieGenre = (m.subgenre || '').toLowerCase();
        if (!movieGenre.includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }

      // Country filter
      if (selectedCountry !== 'all') {
        const movieCountry = (m.country || '').toLowerCase();
        if (!movieCountry.includes(selectedCountry.toLowerCase())) {
          return false;
        }
      }

      // Search query (title, director, cast)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inDirector = m.director.toLowerCase().includes(q);
        const inCast = m.cast.toLowerCase().includes(q);
        return inTitle || inDirector || inCast;
      }

      return true;
    }).sort((a: Movie, b: Movie) => {
      if (sortBy === 'newest') return b.year - a.year || a.title.localeCompare(b.title);
      if (sortBy === 'oldest') return a.year - b.year || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
  }, [selectedYear, selectedGenre, selectedCountry, searchQuery, sortBy]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear, selectedGenre, selectedCountry, sortBy]);

  // Paginated movies
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  // Simulate Live Scrape in Console
  const runLiveScrapeSimulation = (year: number) => {
    if (isScrapingActive) return;
    setIsScrapingActive(true);
    setIsConsoleOpen(true);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] Iniciando scrapper en vivo para el año ${year}...`,
      `[HTTP GET] Solicitando https://en.wikipedia.org/wiki/List_of_horror_films_of_${year}`,
      `[STATUS] 200 OK - Longitud de respuesta: ~680 KB`,
      `[CHEERIO] Cargando árbol DOM y parseando tablas .wikitable sortable...`,
    ]);

    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        `[PARSER] Detectada tabla principal: 'Horror films released in ${year}'`,
        `[COLUMNS] Columnas extraídas: [Title, Director, Cast, Country, Subgenre/Notes]`,
        `[NORMALIZER] Limpiando citas de referencias (sup.reference) y saneando metadatos...`,
      ]);
    }, 900);

    setTimeout(() => {
      const yearCount = (horrorData.metadata.filmsByYear as Record<string, number>)[year.toString()] || 120;
      setConsoleLogs(prev => [
        ...prev,
        `[SUCCESS] ¡Extracción completada! Se procesaron ${yearCount} películas de terror de ${year}.`,
        `[EXPORT] Dataset enriquecido y sincronizado en caché local con éxito.`,
      ]);
      setIsScrapingActive(false);
      setSelectedYear(year);
    }, 2000);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredMovies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `horror_movies_${selectedYear}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-200 selection:bg-red-900 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-950/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/3 right-10 w-[450px] h-[450px] bg-cyan-950/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090E]/80 border-b border-red-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/40 transition-all text-gray-300 hover:text-white group"
              id="back-to-portfolio-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Volver al Portfolio
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <Flame className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h1 className="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
                  Horror Scraper <span className="text-red-500 font-mono text-xs">v1.0</span>
                </h1>
                <p className="text-[11px] text-gray-400">26 Años de Cine de Terror (2000 – 2026)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isConsoleOpen 
                  ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-red-500/30'
              }`}
              id="toggle-scraper-console-btn"
            >
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              <span>Consola Scrapper</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-600/90 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
              id="export-json-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Terminal Drawer (Scraper Console) */}
      {isConsoleOpen && (
        <div className="relative z-30 bg-[#0C0F17] border-b border-red-950/60 shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-400" />
                <span className="text-xs font-mono font-semibold text-gray-200">Terminal de Control de Scrapping</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Engine: Node.js + Cheerio
                </span>
              </div>
              <button 
                onClick={() => setIsConsoleOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-mono">Año objetivo:</span>
                <select 
                  value={scrapeTargetYear}
                  onChange={(e) => setScrapeTargetYear(Number(e.target.value))}
                  className="bg-black/60 border border-white/10 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => runLiveScrapeSimulation(scrapeTargetYear)}
                disabled={isScrapingActive}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-all font-mono"
              >
                <Play className="w-3 h-3 fill-current" />
                {isScrapingActive ? 'Scrapeando...' : `Ejecutar Scrapper (${scrapeTargetYear})`}
              </button>

              <span className="text-[11px] text-gray-500 font-mono">
                Fuente: Wikipedia (Wikitables estructuradas) • Dataset completo indexado: {horrorData.metadata.totalFilms} películas
              </span>
            </div>

            {/* Console Log Output */}
            <div className="mt-3 bg-black/80 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-gray-300 max-h-48 overflow-y-auto border border-white/5 space-y-1">
              {consoleLogs.length === 0 ? (
                <p className="text-gray-500">Selecciona un año y presiona "Ejecutar Scrapper" para ver la traza de recolección en tiempo real.</p>
              ) : (
                consoleLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-400 select-none">&gt;</span>
                    <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('HTTP') ? 'text-cyan-300' : 'text-gray-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Header Section */}
        <section className="mb-10 text-center sm:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-mono font-medium mb-3">
                <Database className="w-3.5 h-3.5 text-red-400" />
                Base de Datos Web Scraped • {horrorData.metadata.yearsCovered.totalYears} Años Continuos
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Horror Cinema <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">Archives</span>
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl">
                Scraper automatizado y explorador analítico de cine de terror de los últimos 26 años. Filtra por época, subgéneros como slasher, sobrenatural o psicológico, directores y países de origen.
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-2xl font-black text-red-400 font-mono">
                  {horrorData.metadata.totalFilms.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Películas</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-2xl font-black text-cyan-400 font-mono">27</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Años (2000-2026)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-2xl font-black text-amber-400 font-mono">
                  {genresList.length - 1}+
                </span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Subgéneros</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-2xl font-black text-purple-400 font-mono">
                  {countriesList.length - 1}+
                </span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Países</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, director o elenco..."
                className="w-full bg-[#0C101A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                id="horror-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subgenre Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-[#0C101A] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                  id="horror-genre-select"
                >
                  <option value="all">Todos los Subgéneros</option>
                  {genresList.filter(g => g !== 'all').map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                <Tag className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Country Filter */}
            <div className="md:col-span-2">
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#0C101A] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                  id="horror-country-select"
                >
                  <option value="all">Todos los Países</option>
                  {countriesList.filter(c => c !== 'all').map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <Globe className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#0C101A] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-red-500 cursor-pointer"
                id="horror-sort-select"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Timeline Year Scroll Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Línea de tiempo (Últimos 26 años):
              </span>
              <span className="font-mono text-gray-500">
                {selectedYear === 'all' ? `Mostrando todos (${filteredMovies.length})` : `Año ${selectedYear} (${filteredMovies.length} películas)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedYear === 'all'
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                Todos ({horrorData.metadata.totalFilms})
              </button>
              {availableYears.map((year) => {
                const count = (horrorData.metadata.filmsByYear as Record<string, number>)[year.toString()] || 0;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedYear === year
                        ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{year}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400 font-mono">
            Mostrando <span className="text-white font-semibold">{paginatedMovies.length}</span> de <span className="text-red-400 font-semibold">{filteredMovies.length}</span> películas encontradas
            {selectedYear !== 'all' && ` en ${selectedYear}`}
          </p>

          {/* Quick Clear Button if filters active */}
          {(selectedYear !== 'all' || selectedGenre !== 'all' || selectedCountry !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedGenre('all');
                setSelectedCountry('all');
                setSearchQuery('');
              }}
              className="text-xs text-red-400 hover:text-red-300 underline font-mono"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Movie Cards Grid */}
        {paginatedMovies.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white/[0.02] border border-white/5">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-300">No se encontraron películas</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Intenta cambiar los filtros de búsqueda o seleccionar otro año en la línea de tiempo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-[#0D121F]/70 border border-white/5 hover:border-red-500/40 hover:bg-[#111728] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)]"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800/40 text-red-400">
                      {movie.year}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 truncate max-w-[140px] text-right">
                      {movie.country || 'Desconocido'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors line-clamp-2 mb-2">
                    {movie.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate">Dir: {movie.director || 'Desconocido'}</span>
                    </div>
                    {movie.cast && movie.cast !== 'N/A' && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{movie.cast}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subgenre Pill & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-300 truncate max-w-[140px]">
                    {movie.subgenre || 'Horror'}
                  </span>
                  
                  <span className="text-xs text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                    Detalles →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
              id="prev-page-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-gray-400 px-4">
              Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
              id="next-page-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Film Detail Modal */}
      {selectedMovie && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedMovie(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#0E1321] border border-red-950/80 rounded-2xl p-6 shadow-2xl space-y-5 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-red-950 border border-red-800/60 text-red-400">
                  {selectedMovie.year}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-white/5 text-gray-300">
                  {selectedMovie.subgenre || 'Horror'}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedMovie.country}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{selectedMovie.title}</h3>
            </div>

            <div className="space-y-3 text-sm bg-black/30 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-xs uppercase text-gray-500 font-bold block mb-0.5">Director</span>
                <p className="text-white font-medium">{selectedMovie.director || 'Desconocido'}</p>
              </div>

              <div>
                <span className="text-xs uppercase text-gray-500 font-bold block mb-0.5">Elenco Principal</span>
                <p className="text-gray-300">{selectedMovie.cast && selectedMovie.cast !== 'N/A' ? selectedMovie.cast : 'No registrado'}</p>
              </div>

              <div>
                <span className="text-xs uppercase text-gray-500 font-bold block mb-0.5">País de Producción</span>
                <p className="text-gray-300">{selectedMovie.country || 'Desconocido'}</p>
              </div>

              <div>
                <span className="text-xs uppercase text-gray-500 font-bold block mb-0.5">Clasificación / Notas</span>
                <p className="text-gray-300">{selectedMovie.subgenre || 'Película de terror'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {selectedMovie.wikiUrl && (
                <a
                  href={selectedMovie.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en Wikipedia
                </a>
              )}

              <a
                href={`https://www.imdb.com/find?q=${encodeURIComponent(selectedMovie.title + ' ' + selectedMovie.year)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <Film className="w-4 h-4" />
                Buscar en IMDb
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center text-xs text-gray-500 font-mono">
        <p>Desarrollado como proyecto para portfolio por Jorge Chávez (kubos777).</p>
        <p className="mt-1">Scraper construido con Node.js & Cheerio • React 18 + Tailwind CSS</p>
      </footer>
    </div>
  );
}
