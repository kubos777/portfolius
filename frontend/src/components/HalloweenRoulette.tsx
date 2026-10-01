import { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  Circle, 
  Download, 
  Share2, 
  Calendar, 
  Skull, 
  Film, 
  Flame, 
  Volume2, 
  VolumeX, 
  X,
  Link2,
  Check
} from 'lucide-react';
import storyBgImage from '../assets/halloween_story_bg.jpg';

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

interface HalloweenRouletteProps {
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

// Sound effects generator using Web Audio API (no external asset dependencies)
function playSpookySound(type: 'spin' | 'reveal' | 'win') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'win') {
      // Eerie gong chord
      [110, 164.81, 196, 261.63].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      });
    }
  } catch {
    // Ignore audio context errors if blocked by browser
  }
}

export default function HalloweenRoulette({ allMovies, onSelectMovie }: HalloweenRouletteProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedCount, setRevealedCount] = useState<number>(5);
  const [dailyPicks, setDailyPicks] = useState<Movie[]>([]);
  const [watchedStatus, setWatchedStatus] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [posters, setPosters] = useState<Record<string, string>>({});
  const [isSharedView, setIsSharedView] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check URL query parameters for shared challenge on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const challengeToken = params.get('challenge');
      if (challengeToken && allMovies.length > 0) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(challengeToken))));
        if (decoded.d && Array.isArray(decoded.m)) {
          setSelectedDay(decoded.d);
          const matched = decoded.m
            .map((id: string) => allMovies.find((m) => m.id === id))
            .filter(Boolean) as Movie[];

          if (matched.length === 5) {
            setDailyPicks(matched);
            setRevealedCount(5);
            const wMap: Record<string, boolean> = {};
            decoded.m.forEach((id: string, idx: number) => {
              wMap[id] = !!(decoded.w && decoded.w[idx]);
            });
            setWatchedStatus(wMap);
            setIsSharedView(true);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse shared challenge from URL', e);
    }

    // Load saved watched status and selections from localStorage
    try {
      const savedWatched = localStorage.getItem(`spooktober_watched_day_${selectedDay}`);
      if (savedWatched) {
        setWatchedStatus(JSON.parse(savedWatched));
      } else {
        setWatchedStatus({});
      }

      const savedPicks = localStorage.getItem(`spooktober_picks_day_${selectedDay}`);
      if (savedPicks) {
        setDailyPicks(JSON.parse(savedPicks));
        setRevealedCount(5);
      } else {
        generatePicksForDay(selectedDay, false);
      }
    } catch {
      generatePicksForDay(selectedDay, false);
    }
  }, [selectedDay, allMovies]);

  // Fetch poster thumbnail from Wikipedia REST API for the 5 picks
  useEffect(() => {
    dailyPicks.forEach(async (movie) => {
      if (posters[movie.id] || !movie.wikiUrl) return;

      const slug = movie.wikiUrl.split('/wiki/')[1];
      if (!slug) return;

      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail && data.thumbnail.source) {
            setPosters(prev => ({ ...prev, [movie.id]: data.thumbnail.source }));
          }
        }
      } catch {
        // Keep fallback
      }
    });
  }, [dailyPicks]);

  // Generate 5 horror movies for a specific day
  const generatePicksForDay = (day: number, shouldAnimate = true) => {
    if (allMovies.length < 5) return;

    // Filter out movies that have clean titles and preferably directors
    const eligibleMovies = allMovies.filter(m => m.title && m.director && m.director !== 'Desconocido');
    const pool = eligibleMovies.length > 50 ? eligibleMovies : allMovies;

    // Seeded selection + randomized shuffle
    const seed = day * 1337;
    const shuffled = [...pool].sort(() => Math.sin(seed + Math.random() * 1000) - 0.5);

    // Pick 5 movies ensuring diverse years & subgenres
    const picks: Movie[] = [];
    const usedYears = new Set<number>();

    for (const movie of shuffled) {
      if (picks.length >= 5) break;
      if (!usedYears.has(movie.year) || picks.length >= 4) {
        picks.push(movie);
        usedYears.add(movie.year);
      }
    }

    if (shouldAnimate) {
      setIsSpinning(true);
      setRevealedCount(0);
      setDailyPicks(picks);

      // Play tick sounds during spin
      let ticks = 0;
      const spinInterval = setInterval(() => {
        if (soundEnabled) playSpookySound('spin');
        ticks++;
        if (ticks > 12) clearInterval(spinInterval);
      }, 100);

      // Stop spinning after 1.4s
      setTimeout(() => {
        setIsSpinning(false);
        if (soundEnabled) playSpookySound('win');

        // Reveal step-by-step
        for (let i = 1; i <= 5; i++) {
          setTimeout(() => {
            setRevealedCount(i);
            if (soundEnabled) playSpookySound('reveal');
          }, i * 380);
        }
      }, 1400);
    } else {
      setDailyPicks(picks);
      setRevealedCount(5);
    }

    // Save to localStorage
    try {
      localStorage.setItem(`spooktober_picks_day_${day}`, JSON.stringify(picks));
    } catch {
      // ignore
    }
  };

  // Toggle watched status
  const toggleWatched = (movieId: string) => {
    const updated = { ...watchedStatus, [movieId]: !watchedStatus[movieId] };
    setWatchedStatus(updated);
    try {
      localStorage.setItem(`spooktober_watched_day_${selectedDay}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Generate Instagram Story Image on Canvas
  const generateInstagramStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Instagram Story dimension: 1080 x 1920
    canvas.width = 1080;
    canvas.height = 1920;

    const bg = new Image();
    bg.crossOrigin = 'anonymous';
    bg.src = storyBgImage;

    bg.onload = () => {
      // 1. Draw gothic background
      ctx.drawImage(bg, 0, 0, 1080, 1920);

      // 2. Add subtle dark gradient overlay in center for ultra sharp readability
      const grad = ctx.createLinearGradient(0, 400, 0, 1500);
      grad.addColorStop(0, 'rgba(10, 10, 15, 0.4)');
      grad.addColorStop(0.5, 'rgba(10, 10, 15, 0.75)');
      grad.addColorStop(1, 'rgba(10, 10, 15, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(100, 440, 880, 1050);

      // 3. Draw Header Title
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#F97316'; // Pumpkin orange
      ctx.shadowColor = 'rgba(249, 115, 22, 0.8)';
      ctx.shadowBlur = 18;
      ctx.fillText('🎃 SPOOKTOBER 31-DAY HORROR CHALLENGE 🎃', 540, 360);

      // Subtitle
      ctx.font = '900 64px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.shadowBlur = 24;
      ctx.fillText(`DÍA ${selectedDay} DE OCTUBRE`, 540, 440);

      ctx.font = '600 28px sans-serif';
      ctx.fillStyle = '#D1D5DB';
      ctx.shadowBlur = 0;
      ctx.fillText('Maratón de 5 Películas de Terror', 540, 490);

      // 4. Draw Movie Rows
      const startY = 570;
      const rowHeight = 170;

      dailyPicks.forEach((movie, index) => {
        const y = startY + index * rowHeight;
        const isWatched = !!watchedStatus[movie.id];

        // Row Card Background
        ctx.fillStyle = isWatched ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = isWatched ? '#EF4444' : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(140, y, 800, 140, 16);
        ctx.fill();
        ctx.stroke();

        // Checkbox icon
        ctx.textAlign = 'left';
        ctx.font = 'bold 44px sans-serif';
        if (isWatched) {
          ctx.fillStyle = '#EF4444';
          ctx.fillText('✓', 170, y + 84);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillText('☐', 170, y + 84);
        }

        // Movie Title
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        
        let titleText = `${index + 1}. ${movie.title}`;
        if (titleText.length > 28) {
          titleText = titleText.substring(0, 26) + '...';
        }
        ctx.fillText(titleText, 230, y + 60);

        // Metadata: Year, Director & Subgenre
        ctx.shadowBlur = 0;
        ctx.font = '500 24px monospace';
        ctx.fillStyle = '#F97316';
        ctx.fillText(`(${movie.year})`, 230, y + 105);

        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#9CA3AF';
        const metaText = `Dir: ${movie.director.split(',')[0]} • ${movie.subgenre || 'Horror'}`;
        const truncatedMeta = metaText.length > 36 ? metaText.substring(0, 34) + '...' : metaText;
        ctx.fillText(truncatedMeta, 330, y + 105);
      });

      // 5. Footer Watermark & Challenge instructions
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#FBBF24';
      ctx.fillText('¿Aceptas el reto? Marca las que logres ver y comparte tu progreso!', 540, 1540);

      ctx.font = '22px monospace';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('Generado en Portfolius • Creado por Jorge Chávez (@kubos777)', 540, 1585);

      // Convert to Image URL
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedStoryUrl(dataUrl);
      setShowStoryModal(true);
    };
  };

  // Download the story card
  const handleDownloadImage = () => {
    if (!generatedStoryUrl) return;
    const a = document.createElement('a');
    a.href = generatedStoryUrl;
    a.download = `Spooktober_Dia_${selectedDay}_Challenge.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Share Permalink (Instagram bio, WhatsApp, Facebook, etc.)
  const handleSharePermalink = () => {
    if (dailyPicks.length === 0) return;
    const challengeData = {
      d: selectedDay,
      m: dailyPicks.map((p) => p.id),
      w: dailyPicks.map((p) => (watchedStatus[p.id] ? 1 : 0)),
    };
    const token = btoa(unescape(encodeURIComponent(JSON.stringify(challengeData))));
    const shareUrl = `${window.location.origin}/horror-movies?challenge=${token}`;

    if (navigator.share) {
      navigator.share({
        title: `Spooktober 31-Day Horror Challenge - Día ${selectedDay}`,
        text: `¡Mira mi maratón de 5 películas de terror para el Día ${selectedDay} de Octubre! ¿Aceptas el reto?`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#130E1C] via-[#0E0C17] to-[#0A0812] border-2 border-orange-950/60 p-6 sm:p-10 shadow-[0_0_50px_rgba(249,115,22,0.1)]">
      {/* Halloween decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Shared Challenge Banner */}
      {isSharedView && (
        <div className="mb-6 p-4 rounded-2xl bg-orange-950/80 border border-orange-500/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-orange-200 relative z-20">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👻</span>
            <span>
              <strong>¡Estás viendo un Reto de Halloween compartido!</strong> Este maratón fue generado para el Día {selectedDay} de Octubre.
            </span>
          </div>
          <button
            onClick={() => {
              setIsSharedView(false);
              window.history.replaceState({}, '', '/horror-movies');
              generatePicksForDay(selectedDay, true);
            }}
            className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors"
          >
            Girar mi propia ruleta
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-orange-950/60 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-mono mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
            Especial de Halloween • 31 Días de Maratón
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>La Ruleta del Miedo</span>
            <span className="text-2xl">🎃</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Gira la ruleta y convoca 5 películas de terror para cada día de octubre. Marca las que logres ver, comparte tu enlace único o genera tu tarjeta historia para Instagram.
          </p>
        </div>

        {/* Audio Toggle, Share Link & Instagram Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSharePermalink}
            disabled={dailyPicks.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 hover:text-white transition-all disabled:opacity-50"
            title="Copiar enlace permanente para compartir en historias o mensajes"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-orange-400" />}
            <span>{copiedToast ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
          </button>

          <button
            onClick={generateInstagramStory}
            disabled={dailyPicks.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all disabled:opacity-50"
            id="share-story-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Plantilla Instagram</span>
          </button>
        </div>
      </div>

      {/* October 31-Day Selector */}
      <div className="py-6 relative z-10 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 text-orange-300 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            Selecciona el Día de Octubre:
          </span>
          <span>Día seleccionado: <strong className="text-white font-mono text-sm">{selectedDay} de Octubre</strong></span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                disabled={isSpinning}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-110'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roulette Spinning Area */}
      <div className="relative z-10 my-8 text-center">
        <div className="max-w-md mx-auto relative flex flex-col items-center">
          {/* Wheel Graphic */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6">
            <div className={`w-full h-full rounded-full border-4 border-orange-500/80 p-2 shadow-[0_0_35px_rgba(249,115,22,0.4)] ${
              isSpinning ? 'animate-spin' : ''
            }`}>
              <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,#EF4444,#F97316,#7C3AED,#EF4444)] flex items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-[#0E0C17] border-2 border-orange-400/60 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                  <Skull className="w-6 h-6 text-orange-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-gray-300 font-bold mt-1">DÍA {selectedDay}</span>
                </div>
              </div>
            </div>

            {/* Wheel Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.9)] text-2xl font-black">
              ▼
            </div>
          </div>

          {/* Action Spin Button */}
          <button
            onClick={() => generatePicksForDay(selectedDay, true)}
            disabled={isSpinning}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 hover:from-orange-500 hover:to-red-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] transition-all disabled:opacity-50 group"
            id="spin-roulette-btn"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
            <span>{isSpinning ? 'Invocando Películas...' : `Girar Ruleta del Día ${selectedDay}`}</span>
          </button>
        </div>
      </div>

      {/* Step by Step Daily Movie Picks (5 Movies) */}
      <div className="relative z-10 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Las 5 del Día</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-950 text-orange-400 font-mono">
              {Object.values(watchedStatus).filter(Boolean).length}/5 Vistas
            </span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            Haz clic en la portada para ver detalles o marca si lograste verla
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dailyPicks.map((movie, index) => {
            const isRevealed = index < revealedCount;
            const isWatched = !!watchedStatus[movie.id];
            const posterUrl = posters[movie.id];

            if (!isRevealed) {
              return (
                <div 
                  key={index} 
                  className="h-80 rounded-2xl bg-white/[0.02] border-2 border-dashed border-orange-950/40 flex flex-col items-center justify-center p-6 text-center animate-pulse"
                >
                  <Skull className="w-8 h-8 text-orange-950 mb-2" />
                  <span className="text-xs font-mono text-gray-600">Película #{index + 1}</span>
                  <span className="text-[10px] text-gray-700 mt-1">Por revelar...</span>
                </div>
              );
            }

            return (
              <div
                key={movie.id}
                className={`relative flex flex-col justify-between rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isWatched 
                    ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : 'bg-[#120F1D]/80 border-orange-950/70 hover:border-orange-500/40 shadow-lg'
                }`}
              >
                {/* Movie Poster Preview */}
                <div 
                  className="h-44 relative bg-black/60 overflow-hidden cursor-pointer group"
                  onClick={() => onSelectMovie(movie)}
                >
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-t from-black to-orange-950/40 text-center">
                      <Film className="w-8 h-8 text-orange-400/60 mb-2" />
                      <span className="text-xs font-bold text-gray-300 line-clamp-2">{movie.title}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#120F1D] via-transparent to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600/90 text-white shadow">
                      #{index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-orange-300 border border-orange-500/30">
                      {movie.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => onSelectMovie(movie)}
                      className="text-sm font-bold text-white hover:text-orange-300 transition-colors cursor-pointer line-clamp-2 mb-1"
                    >
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1">Dir: {movie.director}</p>
                    <p className="text-[10px] text-orange-400/80 font-mono mt-0.5 line-clamp-1">{movie.subgenre || 'Horror'}</p>
                  </div>

                  {/* Watched Action Button */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleWatched(movie.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isWatched
                          ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isWatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>¡Vista! 👁️</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>Marcar vista</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Canvas for Story Generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instagram Story Modal Preview */}
      {showStoryModal && generatedStoryUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in"
          onClick={() => setShowStoryModal(false)}
        >
          <div 
            className="relative w-full max-w-sm sm:max-w-md bg-[#0D0B14] border-2 border-orange-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Tu Plantilla de Instagram</h3>
              <p className="text-xs text-gray-400 mt-0.5">Lista para compartir en tus historias de Halloween</p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 max-h-[460px] shadow-2xl">
              <img 
                src={generatedStoryUrl} 
                alt="Instagram Story Card" 
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDownloadImage}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar PNG (1080x1920)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
