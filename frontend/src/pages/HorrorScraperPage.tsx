import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Search, 
  Calendar, 
  Globe, 
  Tag, 
  ExternalLink, 
  ArrowLeft, 
  Clapperboard, 
  Users, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Code2,
  Tv
} from 'lucide-react';
import horrorData from '../data/horror_movies.json';
import HalloweenRoulette from '../components/HalloweenRoulette';
import MoviePoster from '../components/MoviePoster';

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

interface IndexedMovie extends Movie {
  _corpus: string;
  _genreLower: string;
  _countryLower: string;
}

// Pre-compute lowercased search index once to eliminate runtime string allocation overhead
const indexedFilms: IndexedMovie[] = (horrorData.films as Movie[]).map((m) => ({
  ...m,
  _corpus: `${m.title} ${m.director} ${m.cast}`.toLowerCase(),
  _genreLower: (m.subgenre || '').toLowerCase(),
  _countryLower: (m.country || '').toLowerCase(),
}));

const ITEMS_PER_PAGE = 24;

export default function HorrorScraperPage() {
  const [activeTab, setActiveTab] = useState<'roulette' | 'catalog'>('roulette');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [onlyUpcoming, setOnlyUpcoming] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Poster cache for modal view
  const [modalPoster, setModalPoster] = useState<string | null>(null);
  const [modalSynopsis, setModalSynopsis] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch poster and summary from Wikipedia REST API when a movie is selected in modal
  useEffect(() => {
    if (!selectedMovie || !selectedMovie.wikiUrl) {
      setModalPoster(null);
      setModalSynopsis(null);
      return;
    }

    const slug = selectedMovie.wikiUrl.split('/wiki/')[1];
    if (!slug) return;

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.thumbnail && data.thumbnail.source) {
            setModalPoster(data.thumbnail.source);
          } else {
            setModalPoster(null);
          }
          if (data.extract) {
            setModalSynopsis(data.extract);
          } else {
            setModalSynopsis(null);
          }
        }
      })
      .catch(() => {
        setModalPoster(null);
        setModalSynopsis(null);
      });
  }, [selectedMovie]);

  // Available years list (descending 2026 -> 2000)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y >= 2000; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute genres and countries list
  const { genresList, countriesList } = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    horrorData.films.forEach((m: Movie) => {
      const g = m.subgenre ? m.subgenre.split(',')[0].trim() : 'Horror';
      genreCounts[g] = (genreCounts[g] || 0) + 1;

      const c = m.country ? m.country.split(',')[0].trim() : 'Desconocido';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .filter((g) => g !== 'Horror' && g !== 'Desconocido' && g.length > 2)
      .slice(0, 12);

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .filter((c) => c !== 'Desconocido')
      .slice(0, 15);

    return {
      genresList: ['all', 'Horror', ...topGenres],
      countriesList: ['all', ...topCountries],
    };
  }, []);

  const deferredSearch = useDeferredValue(searchQuery);

  // High-performance filter and sort using pre-computed search corpus
  const filteredMovies = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const genreFilter = selectedGenre !== 'all' ? selectedGenre.toLowerCase() : null;
    const countryFilter = selectedCountry !== 'all' ? selectedCountry.toLowerCase() : null;

    return indexedFilms
      .filter((m) => {
        if (onlyUpcoming && m.year !== 2026) return false;
        if (selectedYear !== 'all' && m.year !== selectedYear) return false;
        if (genreFilter && !m._genreLower.includes(genreFilter)) return false;
        if (countryFilter && !m._countryLower.includes(countryFilter)) return false;
        if (q && !m._corpus.includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.year - a.year || a.title.localeCompare(b.title);
        if (sortBy === 'oldest') return a.year - b.year || a.title.localeCompare(b.title);
        return a.title.localeCompare(b.title);
      });
  }, [selectedYear, selectedGenre, selectedCountry, deferredSearch, sortBy, onlyUpcoming]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear, selectedGenre, selectedCountry, sortBy, onlyUpcoming]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  return (
    <div className="min-h-screen bg-[#07060B] text-gray-200 selection:bg-orange-900 selection:text-white relative">
      {/* Halloween atmosphere glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-950/20 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-red-950/25 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-950/20 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ff6b0008_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07060B]/85 border-b border-orange-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/40 transition-all text-gray-300 hover:text-white group"
              id="back-to-portfolio-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Volver al Portfolio
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎃</span>
              <div>
                <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
                  El Archivo del Terror <span className="text-orange-500 font-mono text-xs">2000–2026</span>
                </h1>
                <p className="text-[11px] text-gray-400">Halloween Edition • 3,088 Películas de Terror</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs & Secret Dev Lab Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('roulette')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'roulette'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🎃 Ruleta de Octubre</span>
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🎬 Catálogo Completo</span>
              </button>
            </div>

            {/* Secret Dev Lab Link for Jorge */}
            <Link
              to="/horror-movies/scraper-lab"
              className="p-2 rounded-xl text-gray-500 hover:text-orange-400 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              title="Dev Scraper Lab (Acceso Técnico)"
            >
              <Code2 className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Render Tab 1: Spooktober Roulette */}
        {activeTab === 'roulette' && (
          <div className="space-y-8 animate-fade-in">
            <HalloweenRoulette 
              allMovies={horrorData.films} 
              onSelectMovie={(movie) => setSelectedMovie(movie)} 
            />

            {/* Quick jump to catalog banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-black to-red-950/40 border border-orange-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>¿Prefieres explorar todo el archivo histórico?</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
                    3,088 filmes
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Accede al catálogo completo con filtros por año (2000–2026), subgéneros como slasher o psicológico y películas por estrenar.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 whitespace-nowrap transition-all"
              >
                Ver Catálogo Completo →
              </button>
            </div>
          </div>
        )}

        {/* Render Tab 2: Full Catalog & Explorer */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-fade-in">
            {/* Catalog Hero Banner */}
            <div className="pb-6 border-b border-orange-950/50 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-mono mb-3">
                  <span>🎃 Archivo Histórico</span> • 27 Años de Cine de Terror
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Catálogo de Películas <span className="text-orange-500">(2000–2026)</span>
                </h2>
                <p className="mt-2 text-sm text-gray-400 max-w-2xl">
                  Explora más de tres décadas de cine de terror. Filtra por época, subgéneros, país o descubre las películas que están próximas a estrenarse.
                </p>
              </div>

              {/* Quick toggle for Upcoming 2026 movies */}
              <button
                onClick={() => setOnlyUpcoming(!onlyUpcoming)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  onlyUpcoming
                    ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                    : 'bg-white/5 border-white/10 text-orange-400 hover:bg-white/10'
                }`}
              >
                <span>🎃 Por Estrenar (2026)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                  {horrorData.metadata.filmsByYear['2026'] || 165}
                </span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, director o elenco..."
                    className="w-full bg-[#0D0B14] border border-orange-950/60 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
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
                <div className="md:col-span-3 relative">
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-[#0D0B14] border border-orange-950/60 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los Subgéneros</option>
                    {genresList.filter((g) => g !== 'all').map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  <Tag className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Country Filter */}
                <div className="md:col-span-2 relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-[#0D0B14] border border-orange-950/60 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los Países</option>
                    {countriesList.filter((c) => c !== 'all').map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <Globe className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Sort Order */}
                <div className="md:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-[#0D0B14] border border-orange-950/60 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none cursor-pointer"
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
                  <span className="font-mono flex items-center gap-1.5 text-orange-300">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    Línea de tiempo de 26 años:
                  </span>
                  <span className="font-mono text-gray-500">
                    {filteredMovies.length} películas encontradas
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                  <button
                    onClick={() => {
                      setSelectedYear('all');
                      setOnlyUpcoming(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedYear === 'all' && !onlyUpcoming
                        ? 'bg-orange-500 text-black font-bold shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Todos ({horrorData.metadata.totalFilms})
                  </button>
                  {availableYears.map((year) => {
                    const count = (horrorData.metadata.filmsByYear as Record<string, number>)[year.toString()] || 0;
                    const is2026 = year === 2026;
                    return (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setOnlyUpcoming(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          selectedYear === year
                            ? 'bg-orange-500 text-black font-bold shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <span>{year}</span>
                        {is2026 && <span className="text-[10px]">🎃</span>}
                        <span className="text-[10px] opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results count & Clear button */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <p>
                Mostrando <span className="text-white font-bold">{paginatedMovies.length}</span> de{' '}
                <span className="text-orange-400 font-bold">{filteredMovies.length}</span> películas
              </p>

              {(selectedYear !== 'all' || selectedGenre !== 'all' || selectedCountry !== 'all' || searchQuery || onlyUpcoming) && (
                <button
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedGenre('all');
                    setSelectedCountry('all');
                    setSearchQuery('');
                    setOnlyUpcoming(false);
                  }}
                  className="text-orange-400 hover:text-orange-300 underline font-mono"
                >
                  Restablecer filtros
                </button>
              )}
            </div>

            {/* Movies Grid */}
            {paginatedMovies.length === 0 ? (
              <div className="text-center py-20 rounded-2xl bg-white/[0.02] border border-orange-950/40">
                <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-300">No se encontraron películas</h3>
                <p className="text-sm text-gray-500 mt-1">Intenta con otros criterios de búsqueda o selecciona otro año.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedMovies.map((movie) => {
                  const isUpcoming = movie.year === 2026;
                  return (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie)}
                      className="group relative flex flex-col justify-between rounded-2xl bg-[#0E0C16]/80 border border-orange-950/60 hover:border-orange-500/50 hover:bg-[#13101E] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] overflow-hidden"
                    >
                      {/* Movie Poster Cover (Guaranteed 100% covers) */}
                      <div className="h-48 relative overflow-hidden bg-black/80">
                        <MoviePoster movie={movie} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded shadow ${
                              isUpcoming
                                ? 'bg-orange-600 text-white'
                                : 'bg-black/80 border border-orange-900/60 text-orange-400'
                            }`}
                          >
                            {movie.year}
                          </span>

                          {isUpcoming ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-500/30 flex items-center gap-1 shadow">
                              <span>🎃</span>
                              <span>Por Estrenar</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300 bg-black/80 px-2 py-0.5 rounded truncate max-w-[120px] text-right font-mono">
                              {movie.country || 'Desconocido'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-2 mb-2">
                            {movie.title}
                          </h3>

                          {/* Details */}
                          <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clapperboard className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span className="truncate">Dir: {movie.director || 'Desconocido'}</span>
                            </div>
                            {movie.cast && movie.cast !== 'N/A' && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="truncate">{movie.cast}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Subgenre */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-300 truncate max-w-[140px]">
                            {movie.subgenre || 'Horror'}
                          </span>
                          <span className="text-xs text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                            Ficha →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-gray-400 px-4">
                  Página <span className="text-white font-bold">{currentPage}</span> de{' '}
                  <span className="text-white font-bold">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Film Detail Modal with Live Wikipedia Poster & Synopsis */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="relative w-full max-w-xl bg-[#0F0C18] border-2 border-orange-950/80 rounded-3xl p-6 shadow-2xl space-y-5 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster & Header Split */}
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Poster Preview with Guaranteed Cover */}
              <div className="w-full sm:w-44 h-60 rounded-2xl overflow-hidden bg-black/80 border border-orange-500/30 shrink-0 relative shadow-2xl">
                <MoviePoster movie={selectedMovie} posterUrl={modalPoster} className="w-full h-full object-cover" />
              </div>

              {/* Title & Badges */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-orange-600 text-white shadow">
                      {selectedMovie.year}
                    </span>

                    {selectedMovie.year === 2026 && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-950 border border-orange-500/40 text-orange-400 font-bold">
                        🎃 Por Estrenar
                      </span>
                    )}

                    <span className="text-xs px-2.5 py-0.5 rounded bg-white/5 text-gray-300">
                      {selectedMovie.subgenre || 'Horror'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white">{selectedMovie.title}</h3>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 mt-3 pt-3 border-t border-white/5">
                  <p>
                    <strong className="text-gray-200">Director:</strong> {selectedMovie.director || 'Desconocido'}
                  </p>
                  <p>
                    <strong className="text-gray-200">Elenco:</strong> {selectedMovie.cast && selectedMovie.cast !== 'N/A' ? selectedMovie.cast : 'No registrado'}
                  </p>
                  <p>
                    <strong className="text-gray-200">País:</strong> {selectedMovie.country || 'Desconocido'}
                  </p>
                </div>
              </div>
            </div>

            {/* Synopsis / Summary */}
            {modalSynopsis && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto">
                <span className="text-orange-400 font-bold block mb-1">Sinopsis / Resumen:</span>
                <p>{modalSynopsis}</p>
              </div>
            )}

            {/* Streaming Platforms Section */}
            <div className="p-4 rounded-2xl bg-black/50 border border-orange-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 font-mono">
                  <Tv className="w-3.5 h-3.5 text-orange-400" />
                  ¿Dónde ver en Streaming?
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  (Netflix, Prime, Max, Shudder, etc.)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={`https://www.justwatch.com/mx/buscar?q=${encodeURIComponent(selectedMovie.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600/90 hover:bg-orange-600 text-white text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all"
                  title="Ver catálogo de streaming disponible en tu país en JustWatch"
                >
                  <span>JustWatch (Catálogo)</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={`https://www.shudder.com/search?q=${encodeURIComponent(selectedMovie.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold transition-all"
                  title="Buscar en Shudder (Streaming de Terror)"
                >
                  <span>Shudder (Terror)</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' ' + selectedMovie.year + ' pelicula completa')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-bold border border-white/10 transition-all"
                  title="Buscar en YouTube Películas y Google Play"
                >
                  <span>YouTube / Google TV</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Actions */}
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

      {/* Spooky Footer */}
      <footer className="mt-20 py-8 border-t border-orange-950/40 text-center text-xs text-gray-500 font-mono">
        <p>🎃 El Archivo del Terror • Creado por Jorge Chávez (@kubos777)</p>
        <p className="mt-1">
          Especial de Halloween con más de 3,088 películas de terror (2000–2026) •{' '}
          <Link to="/horror-movies/scraper-lab" className="text-orange-500 hover:underline">
            Acceso Dev Lab
          </Link>
        </p>
      </footer>
    </div>
  );
}
