import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  Circle, 
  Download, 
  Share2, 
  Calendar, 
  Skull, 
  Flame, 
  Volume2, 
  VolumeX, 
  X,
  Link2,
  Check,
  Tv,
  ExternalLink,
  Trophy,
  Filter,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import storyBgImage from '../assets/halloween_story_bg.jpg';
import MoviePoster, { getCachedPoster, fetchWikipediaPoster, getBackdropForMovie } from './MoviePoster';

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

// Singleton AudioContext for ultra-fast, stutter-free spooky audio
let sharedAudioCtx: AudioContext | null = null;
function getSharedAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Sound effects generator using Web Audio API
function playSpookySound(type: 'spin' | 'reveal' | 'win') {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'win') {
      // Eerie gong chord
      [110, 164.81, 196, 261.63].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.1);
      });
    }
  } catch {
    // Ignore audio context errors if blocked by browser
  }
}

// Helper to draw rounded rectangle safely on any HTML5 canvas
function drawCanvasRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

// Safely pre-load image element with CORS
function loadPosterImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 2500);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

interface RenderPosterParams {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  bgImg: HTMLImageElement | null;
  movies: Movie[];
  loadedImages: (HTMLImageElement | null)[];
  day: number;
  isToday: boolean;
  watched: Record<string, boolean>;
  watchedCount: number;
  selectedYears: number[];
  isAllYearsSelected: boolean;
  useImages: boolean;
}

function renderTheatricalPoster({
  ctx,
  canvas,
  bgImg,
  movies,
  loadedImages,
  day,
  isToday,
  watched,
  watchedCount,
  selectedYears,
  isAllYearsSelected,
  useImages,
}: RenderPosterParams) {
  canvas.width = 1080;
  canvas.height = 1920;

  // 1. Base Dark Fill
  ctx.fillStyle = '#07050B';
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Background Image
  if (useImages && bgImg) {
    ctx.drawImage(bgImg, 0, 0, 1080, 1920);
  }

  // 3. Dark Wash & Cinematic Vignette
  const darkGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  darkGrad.addColorStop(0, 'rgba(8, 5, 12, 0.88)');
  darkGrad.addColorStop(0.2, 'rgba(8, 5, 12, 0.72)');
  darkGrad.addColorStop(0.8, 'rgba(8, 5, 12, 0.78)');
  darkGrad.addColorStop(1, 'rgba(8, 5, 12, 0.96)');
  ctx.fillStyle = darkGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  const radialGlow = ctx.createRadialGradient(540, 240, 50, 540, 240, 750);
  radialGlow.addColorStop(0, 'rgba(234, 88, 12, 0.25)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, 1080, 1920);

  // 4. Theatrical Double Borders
  ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, 1080 - 56, 1920 - 56);

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, 1080 - 76, 1920 - 76);

  // Corner ornaments
  ctx.fillStyle = '#EA580C';
  [[28, 28], [1080 - 28, 28], [28, 1920 - 28], [1080 - 28, 1920 - 28]].forEach(([cx, cy]) => {
    ctx.fillRect(cx - 5, cy - 5, 10, 10);
  });

  // 5. Header (Top)
  // Festival Pill
  ctx.fillStyle = 'rgba(249, 115, 22, 0.16)';
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 1.5;
  drawCanvasRoundRect(ctx, 540 - 270, 76, 540, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#FB923C';
  ctx.fillText('🎃 MARATÓN DE HALLOWEEN • SPOOKTOBER 🎃', 540, 105);

  // Title
  ctx.font = '900 62px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
  ctx.shadowBlur = 24;
  ctx.fillText('LAS 3 PELÍCULAS DE HOY', 540, 190);

  // Sub-header (Day)
  ctx.font = '900 42px sans-serif';
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.75)';
  ctx.shadowBlur = 18;
  const dayStr = isToday ? `DÍA ${day} DE OCTUBRE (HOY)` : `DÍA ${day} DE OCTUBRE`;
  ctx.fillText(dayStr, 540, 252);

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.font = '600 23px sans-serif';
  ctx.fillStyle = '#CBD5E1';
  const subtitleStr = isAllYearsSelected
    ? '3 Películas Obligatorias del Reto • Archivo Histórico (2000–2026)'
    : `Edición Terror (${selectedYears.length} Años: ${selectedYears.slice(0, 3).join(', ')}${selectedYears.length > 3 ? '...' : ''})`;
  ctx.fillText(subtitleStr, 540, 302);

  // Separator line
  const sepGrad = ctx.createLinearGradient(120, 335, 960, 335);
  sepGrad.addColorStop(0, 'rgba(249, 115, 22, 0)');
  sepGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
  sepGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.strokeStyle = sepGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 335);
  ctx.lineTo(940, 335);
  ctx.stroke();

  // 6. The 3 Mandatory Movie Cards (Generous 350px tall layout for maximum legibility)
  const cardStartY = 380;
  const cardHeight = 350;
  const cardGap = 35;

  movies.slice(0, 3).forEach((movie, i) => {
    const cardY = cardStartY + i * (cardHeight + cardGap);
    const isWatched = !!watched[movie.id];
    const cardW = 940;
    const cardX = 70;

    // Card background
    ctx.fillStyle = isWatched ? 'rgba(22, 16, 32, 0.96)' : 'rgba(14, 11, 20, 0.94)';
    drawCanvasRoundRect(ctx, cardX, cardY, cardW, cardHeight, 22);
    ctx.fill();

    // Card border
    ctx.strokeStyle = isWatched ? '#10B981' : 'rgba(249, 115, 22, 0.45)';
    ctx.lineWidth = isWatched ? 3 : 2;
    ctx.stroke();

    // Movie Thumbnail Poster (Large 205x310 cinematic format)
    const thumbX = cardX + 22;
    const thumbY = cardY + 20;
    const thumbW = 205;
    const thumbH = 310;

    ctx.save();
    drawCanvasRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 16);
    ctx.clip();

    const img = loadedImages[i];
    if (useImages && img) {
      ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
    } else {
      // Stylized cinematic dark fallback card
      const fbGrad = ctx.createLinearGradient(thumbX, thumbY, thumbX + thumbW, thumbY + thumbH);
      fbGrad.addColorStop(0, '#1E122C');
      fbGrad.addColorStop(1, '#090610');
      ctx.fillStyle = fbGrad;
      ctx.fillRect(thumbX, thumbY, thumbW, thumbH);

      ctx.textAlign = 'center';
      ctx.font = '50px sans-serif';
      ctx.fillText('💀', thumbX + thumbW / 2, thumbY + 120);
      ctx.font = '900 28px monospace';
      ctx.fillStyle = '#EA580C';
      ctx.fillText(String(movie.year), thumbX + thumbW / 2, thumbY + 180);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText('HD ARCHIVE', thumbX + thumbW / 2, thumbY + 220);
    }

    // Thumbnail gradient footer
    const tOver = ctx.createLinearGradient(thumbX, thumbY + 180, thumbX, thumbY + thumbH);
    tOver.addColorStop(0, 'rgba(0,0,0,0)');
    tOver.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = tOver;
    ctx.fillRect(thumbX, thumbY + 180, thumbW, 130);
    ctx.restore();

    // Thumbnail border
    ctx.strokeStyle = isWatched ? 'rgba(16, 185, 129, 0.7)' : 'rgba(249, 115, 22, 0.55)';
    ctx.lineWidth = 2;
    drawCanvasRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 16);
    ctx.stroke();

    // Circular Number Badge
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(thumbX + 22, thumbY + 22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = '900 22px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(String(i + 1), thumbX + 22, thumbY + 30);

    // Text details
    const textX = thumbX + thumbW + 30;

    // Title
    ctx.textAlign = 'left';
    ctx.font = '900 38px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    let titleStr = movie.title;
    if (titleStr.length > 25) titleStr = titleStr.substring(0, 23) + '...';
    ctx.fillText(titleStr, textX, cardY + 68);
    ctx.shadowBlur = 0;

    // Year & Genre - ULTRA HIGH VISIBILITY YEAR BADGE
    ctx.fillStyle = '#EA580C'; // Solid bright neon pumpkin
    drawCanvasRoundRect(ctx, textX, cardY + 98, 110, 42, 8);
    ctx.fill();
    ctx.strokeStyle = '#FFEDD5';
    ctx.lineWidth = 1.5;
    drawCanvasRoundRect(ctx, textX, cardY + 98, 110, 42, 8);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '900 24px monospace';
    ctx.fillStyle = '#000000'; // High contrast black on bright neon orange
    ctx.fillText(String(movie.year), textX + 55, cardY + 128);

    // Subgenre
    ctx.textAlign = 'left';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#FDBA74';
    let genreStr = movie.subgenre || 'Terror';
    if (genreStr.length > 22) genreStr = genreStr.substring(0, 20) + '...';
    ctx.fillText(`•   ${genreStr}`, textX + 125, cardY + 128);

    // Director
    ctx.font = '600 24px sans-serif';
    ctx.fillStyle = '#F1F5F9';
    let dirStr = `🎬 Dir: ${movie.director.split(',')[0].trim()}`;
    if (dirStr.length > 32) dirStr = dirStr.substring(0, 30) + '...';
    ctx.fillText(dirStr, textX, cardY + 195);

    // Cast
    ctx.font = '400 22px sans-serif';
    ctx.fillStyle = '#CBD5E1';
    let castStr = movie.cast && movie.cast !== 'Desconocido'
      ? `👥 Elenco: ${movie.cast.split(',').slice(0, 3).join(', ')}`
      : '👥 Elenco: Joya de Terror de Culto';
    if (castStr.length > 34) castStr = castStr.substring(0, 32) + '...';
    ctx.fillText(castStr, textX, cardY + 248);

    // Watched Status Badge on right - ULTRA HIGH VISIBILITY POR VER / VISTA
    const badgeX = cardX + cardW - 200;
    const badgeY = cardY + 140;
    const badgeW = 175;
    const badgeH = 64;

    if (isWatched) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      drawCanvasRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#6EE7B7';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
      ctx.shadowBlur = 12;
      ctx.fillText('✓ VISTA 👁️', badgeX + badgeW / 2, badgeY + 41);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      drawCanvasRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.95)';
      ctx.shadowBlur = 14;
      ctx.fillText('🎃 POR VER', badgeX + badgeW / 2, badgeY + 41);
      ctx.shadowBlur = 0;
    }
  });

  // 7. Footer
  const isDaySuperado = watchedCount >= 3;
  ctx.fillStyle = 'rgba(15, 10, 22, 0.9)';
  ctx.strokeStyle = isDaySuperado ? '#10B981' : '#F59E0B';
  ctx.lineWidth = 2.5;
  drawCanvasRoundRect(ctx, 90, 1600, 900, 80, 18);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '900 26px sans-serif';
  if (isDaySuperado) {
    ctx.fillStyle = '#34D399';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
    ctx.shadowBlur = 14;
    ctx.fillText(`🏆 ¡RETO DÍA ${day} SUPERADO! (3/3 PELÍCULAS VISTAS) 🏆`, 540, 1650);
  } else {
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 0;
    ctx.fillText(`🎃 RETO DÍA ${day}: ${watchedCount}/3 PELÍCULAS VISTAS (Las 3 son obligatorias)`, 540, 1650);
  }
  ctx.shadowBlur = 0;

  // Platform brand without PORTFOLIUS
  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#F97316';
  ctx.fillText('EL ARCHIVO DEL TERROR DE HALLOWEEN', 540, 1735);

  // Author watermark with Hecho con ♥ por kubos777
  ctx.font = '500 22px monospace';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('3,088 Películas (2000–2026) • Hecho con ♥ por kubos777', 540, 1785);
}

export default function HalloweenRoulette({ allMovies, onSelectMovie }: HalloweenRouletteProps) {
  // Base default day on today's calendar date
  const getTodayDay = () => {
    const now = new Date();
    if (now.getMonth() === 9) {
      return now.getDate();
    }
    return Math.min(Math.max(now.getDate(), 1), 31);
  };

  const ALL_YEARS = useMemo(() => Array.from({ length: 27 }, (_, i) => 2026 - i), []);

  const todayDayNumber = getTodayDay();
  const [selectedDay, setSelectedDay] = useState<number>(getTodayDay);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedCount, setRevealedCount] = useState<number>(3);
  const [dailyPicks, setDailyPicks] = useState<Movie[]>([]);
  const [watchedStatus, setWatchedStatus] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Poster Generator state
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterTargetDay, setPosterTargetDay] = useState<number>(todayDayNumber);

  // Multi-Year selection state (defaults to all years)
  const [selectedYears, setSelectedYears] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('spooktober_selected_years');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return Array.from({ length: 27 }, (_, i) => 2026 - i);
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Total films count per year (memoized once)
  const filmsCountByYear = useMemo(() => {
    const counts: Record<number, number> = {};
    allMovies.forEach((m) => {
      counts[m.year] = (counts[m.year] || 0) + 1;
    });
    return counts;
  }, [allMovies]);

  // Total movies available in current year filter selection
  const selectedYearsMoviesCount = useMemo(() => {
    if (selectedYears.length === ALL_YEARS.length) return allMovies.length;
    const set = new Set(selectedYears);
    return allMovies.filter((m) => set.has(m.year)).length;
  }, [selectedYears, allMovies, ALL_YEARS.length]);

  const isAllYearsSelected = selectedYears.length === ALL_YEARS.length;

  // Compute completed days lazily ONCE on mount (avoids 31 synchronous localStorage reads on every render!)
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => {
    const completed: Record<number, boolean> = {};
    for (let d = 1; d <= 31; d++) {
      try {
        const data = localStorage.getItem(`spooktober_watched_day_${d}`);
        if (data) {
          const parsed = JSON.parse(data);
          const count = Object.values(parsed).filter(Boolean).length;
          if (count >= 3) {
            completed[d] = true;
          }
        }
      } catch {}
    }
    return completed;
  });

  const watchedCount = Object.values(watchedStatus).filter(Boolean).length;
  const isDaySuperado = watchedCount >= 3;

  // Toggle single year in multi-select
  const toggleYear = (year: number) => {
    let updated: number[];
    if (isAllYearsSelected) {
      // If all were active, clicking one isolates that specific year
      updated = [year];
    } else if (selectedYears.includes(year)) {
      if (selectedYears.length === 1) {
        // Unselecting the last remaining year resets to all
        updated = ALL_YEARS;
      } else {
        updated = selectedYears.filter((y) => y !== year);
      }
    } else {
      updated = [...selectedYears, year].sort((a, b) => b - a);
    }
    setSelectedYears(updated);
    try {
      localStorage.setItem('spooktober_selected_years', JSON.stringify(updated));
    } catch {}
    generatePicksForDay(selectedDay, true, updated);
  };

  // Preset selectors
  const selectAllYears = () => {
    setSelectedYears(ALL_YEARS);
    try {
      localStorage.setItem('spooktober_selected_years', JSON.stringify(ALL_YEARS));
    } catch {}
    generatePicksForDay(selectedDay, true, ALL_YEARS);
  };

  const selectPresetYears = (years: number[]) => {
    setSelectedYears(years);
    try {
      localStorage.setItem('spooktober_selected_years', JSON.stringify(years));
    } catch {}
    generatePicksForDay(selectedDay, true, years);
  };

  // Check URL query parameters for shared challenge or poster generation on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const posterParam = params.get('poster');
      if (posterParam === 'today' || posterParam === '1' || params.has('poster')) {
        setTimeout(() => {
          handleGeneratePosterForDay(todayDayNumber);
        }, 500);
      }
      const challengeToken = params.get('challenge');
      if (challengeToken && allMovies.length > 0) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(challengeToken))));
        if (decoded.d && Array.isArray(decoded.m)) {
          setSelectedDay(decoded.d);
          if (decoded.y) {
            const parsedY = typeof decoded.y === 'string' 
              ? decoded.y.split(',').map(Number).filter((n: number) => !isNaN(n))
              : Array.isArray(decoded.y) ? decoded.y : null;
            if (parsedY && parsedY.length > 0) {
              setSelectedYears(parsedY);
            }
          }
          const matched = decoded.m
            .map((id: string) => allMovies.find((m) => m.id === id))
            .filter(Boolean) as Movie[];

          if (matched.length >= 3) {
            setDailyPicks(matched.slice(0, 3));
            setRevealedCount(3);
            const wMap: Record<string, boolean> = {};
            decoded.m.slice(0, 3).forEach((id: string, idx: number) => {
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

      const savedYears = localStorage.getItem(`spooktober_years_day_${selectedDay}`);
      let yearsToUse = selectedYears;
      if (savedYears) {
        try {
          const parsed = JSON.parse(savedYears);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedYears(parsed);
            yearsToUse = parsed;
          }
        } catch {}
      }

      const savedPicks = localStorage.getItem(`spooktober_picks_day_${selectedDay}`);
      if (savedPicks) {
        const parsed = JSON.parse(savedPicks);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setDailyPicks(parsed.slice(0, 3));
          setRevealedCount(3);
        } else {
          generatePicksForDay(selectedDay, false, yearsToUse);
        }
      } else {
        generatePicksForDay(selectedDay, false, yearsToUse);
      }
    } catch {
      generatePicksForDay(selectedDay, false, selectedYears);
    }
  }, [selectedDay, allMovies]);

  // High performance movie pick generation with multi-year filter and Fisher-Yates sampling
  const generatePicksForDay = (day: number, shouldAnimate = true, yearsToUse = selectedYears) => {
    if (allMovies.length < 3) return;

    const targetYears = yearsToUse && yearsToUse.length > 0 ? yearsToUse : ALL_YEARS;
    const yearSet = new Set(targetYears);

    const yearFiltered = targetYears.length === ALL_YEARS.length
      ? allMovies
      : allMovies.filter((m) => yearSet.has(m.year));

    const eligibleMovies = yearFiltered.filter((m) => m.title && m.director && m.director !== 'Desconocido');
    const pool = eligibleMovies.length >= 3 ? eligibleMovies : yearFiltered;
    if (pool.length === 0) return;

    // Fast Fisher-Yates sampling (O(N) with 0 trig calls)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const picks: Movie[] = [];
    const usedIds = new Set<string>();
    const usedYears = new Set<number>();

    // Pass 1: Prioritize year diversity across selected years
    for (const movie of shuffled) {
      if (picks.length >= 3) break;
      if (!usedIds.has(movie.id)) {
        if (!usedYears.has(movie.year) || picks.length >= targetYears.length) {
          picks.push(movie);
          usedIds.add(movie.id);
          usedYears.add(movie.year);
        }
      }
    }

    // Pass 2: Fill remaining up to 3
    if (picks.length < 3) {
      for (const movie of shuffled) {
        if (picks.length >= 3) break;
        if (!usedIds.has(movie.id)) {
          picks.push(movie);
          usedIds.add(movie.id);
        }
      }
    }

    if (shouldAnimate) {
      setIsSpinning(true);
      setRevealedCount(0);
      setDailyPicks(picks);

      let ticks = 0;
      const spinInterval = setInterval(() => {
        if (soundEnabled) playSpookySound('spin');
        ticks++;
        if (ticks > 10) clearInterval(spinInterval);
      }, 90);

      // Fast, punchy reveal sequence
      setTimeout(() => {
        setIsSpinning(false);
        if (soundEnabled) playSpookySound('win');

        for (let i = 1; i <= 3; i++) {
          setTimeout(() => {
            setRevealedCount(i);
            if (soundEnabled) playSpookySound('reveal');
          }, i * 260);
        }
      }, 950);
    } else {
      setDailyPicks(picks);
      setRevealedCount(3);
    }

    try {
      localStorage.setItem(`spooktober_picks_day_${day}`, JSON.stringify(picks));
      localStorage.setItem(`spooktober_years_day_${day}`, JSON.stringify(targetYears));
    } catch {}
  };

  // Toggle watched status with instant single-day completed update
  const toggleWatched = (movieId: string) => {
    const updated = { ...watchedStatus, [movieId]: !watchedStatus[movieId] };
    setWatchedStatus(updated);
    try {
      localStorage.setItem(`spooktober_watched_day_${selectedDay}`, JSON.stringify(updated));
    } catch {}

    const count = Object.values(updated).filter(Boolean).length;
    setCompletedDays((prev) => ({
      ...prev,
      [selectedDay]: count >= 3,
    }));
  };

  // Deterministic or cached movie pick loader for any given day
  const getPicksForSpecificDay = (day: number, yearsToUse = selectedYears): Movie[] => {
    if (day === selectedDay && dailyPicks.length === 3) {
      return dailyPicks;
    }
    try {
      const saved = localStorage.getItem(`spooktober_picks_day_${day}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.slice(0, 3);
        }
      }
    } catch {}

    const targetYears = yearsToUse && yearsToUse.length > 0 ? yearsToUse : ALL_YEARS;
    const yearSet = new Set(targetYears);
    const pool = allMovies.filter((m) => yearSet.has(m.year) && m.title && m.director && m.director !== 'Desconocido');
    const source = pool.length >= 3 ? pool : allMovies;
    if (source.length === 0) return [];

    const picks: Movie[] = [];
    const used = new Set<string>();
    for (let i = 0; i < source.length && picks.length < 3; i++) {
      const idx = (day * 37 + i * 113) % source.length;
      const m = source[idx];
      if (!used.has(m.id)) {
        picks.push(m);
        used.add(m.id);
      }
    }
    return picks;
  };

  // Generate Theatrical Poster with 3 Mandatory Movies on Canvas
  const handleGeneratePosterForDay = async (targetDay: number = todayDayNumber) => {
    if (isGeneratingPoster) return;
    setIsGeneratingPoster(true);

    try {
      // 1. Get 3 mandatory movies for targetDay
      let picks = getPicksForSpecificDay(targetDay, selectedYears);
      if (!picks || picks.length < 3) {
        picks = allMovies.slice(0, 3);
      }

      // 2. Get watched status for targetDay
      let watched: Record<string, boolean> = {};
      if (targetDay === selectedDay) {
        watched = watchedStatus;
      } else {
        try {
          const savedWatched = localStorage.getItem(`spooktober_watched_day_${targetDay}`);
          if (savedWatched) watched = JSON.parse(savedWatched);
        } catch {}
      }
      const watchedCount = picks.filter((m) => !!watched[m.id]).length;

      // 3. Pre-fetch images in parallel with timeout
      const loadedImages = await Promise.all(
        picks.map(async (m) => {
          try {
            let url: string | null | undefined = getCachedPoster(m.id);
            if (!url) {
              url = await Promise.race([
                fetchWikipediaPoster(m),
                new Promise<string | null>((res) => setTimeout(() => res(null), 1800)),
              ]);
            }
            if (!url) {
              url = getBackdropForMovie(m.id, m.title);
            }
            return await loadPosterImage(url);
          } catch {
            return null;
          }
        })
      );

      // 4. Load background image
      const bgImg = await loadPosterImage(storyBgImage);

      // 5. Get canvas
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 6. Draw theatrical poster on canvas
      renderTheatricalPoster({
        ctx,
        canvas,
        bgImg,
        movies: picks,
        loadedImages,
        day: targetDay,
        isToday: targetDay === todayDayNumber,
        watched,
        watchedCount,
        selectedYears,
        isAllYearsSelected,
        useImages: true,
      });

      let dataUrl: string;
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch {
        // Fallback: draw safe mode without external cross-origin images
        renderTheatricalPoster({
          ctx,
          canvas,
          bgImg,
          movies: picks,
          loadedImages: [null, null, null, null, null],
          day: targetDay,
          isToday: targetDay === todayDayNumber,
          watched,
          watchedCount,
          selectedYears,
          isAllYearsSelected,
          useImages: false,
        });
        dataUrl = canvas.toDataURL('image/png');
      }

      setGeneratedStoryUrl(dataUrl);
      setPosterTargetDay(targetDay);
      setShowStoryModal(true);

      if (soundEnabled) playSpookySound('win');
    } catch (e) {
      console.error('Error generating poster:', e);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const generateInstagramStory = () => {
    handleGeneratePosterForDay(selectedDay);
  };

  const handleDownloadImage = () => {
    if (!generatedStoryUrl) return;
    const a = document.createElement('a');
    a.href = generatedStoryUrl;
    const isToday = posterTargetDay === todayDayNumber;
    a.download = isToday
      ? `Spooktober_Poster_Hoy_Dia_${posterTargetDay}.png`
      : `Spooktober_Poster_Dia_${posterTargetDay}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSharePoster = async () => {
    if (!generatedStoryUrl) return;
    try {
      if (navigator.share) {
        const res = await fetch(generatedStoryUrl);
        const blob = await res.blob();
        const file = new File([blob], `Spooktober_Poster_Dia_${posterTargetDay}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Cartelera Spooktober - Día ${posterTargetDay}`,
            text: `🎃 ¡Mira mi cartelera con las 5 películas de terror de hoy en el maratón Spooktober! ¿Aceptas el reto?`,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // fallback
    }

    handleSharePermalink();
  };

  const handleSharePermalink = () => {
    if (dailyPicks.length === 0) return;
    const challengeData = {
      d: selectedDay,
      m: dailyPicks.map((p) => p.id),
      w: dailyPicks.map((p) => (watchedStatus[p.id] ? 1 : 0)),
      y: selectedYears.join(',')
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
            Gira la ruleta y convoca 3 películas de terror para cada día de octubre. Las 3 son obligatorias para superar el reto diario y generar tu póster oficial.
          </p>
        </div>

        {/* Audio Toggle, Share Link & Poster Buttons */}
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
            onClick={() => handleGeneratePosterForDay(todayDayNumber)}
            disabled={isGeneratingPoster || allMovies.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] transition-all transform hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
            id="generate-today-poster-btn"
            title="Generar póster en alta resolución con las 3 películas obligatorias de hoy"
          >
            {isGeneratingPoster ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generando Póster...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
                <span>🖼️ Póster de Hoy (3 Películas) 🎃</span>
              </>
            )}
          </button>

          <button
            onClick={generateInstagramStory}
            disabled={isGeneratingPoster || dailyPicks.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white border border-white/10 transition-all disabled:opacity-50"
            id="share-story-btn"
            title={`Generar póster para el Día ${selectedDay}`}
          >
            <Share2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Póster Día {selectedDay}</span>
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
            const isCompleted = !!completedDays[day];
            const isToday = day === todayDayNumber;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                disabled={isSpinning}
                className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all relative flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-110 z-10'
                    : isCompleted
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
                title={
                  isCompleted
                    ? `Día ${day}: ¡Reto Superado (3+ películas vistas)! 🏆`
                    : isToday
                    ? `Día ${day}: ¡Hoy!`
                    : `Día ${day}`
                }
              >
                <span>{day}</span>
                {isCompleted ? (
                  <span className="text-[9px] text-emerald-400 font-black leading-none mt-0.5">✓</span>
                ) : isToday ? (
                  <span className="text-[7px] text-orange-400 font-extrabold leading-none mt-0.5">HOY</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roulette Spinning Area & Multi-Year Filter Controls */}
      <div className="relative z-10 my-8 text-center space-y-6">
        {/* Multi-Year Filter Controls */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#0B0914]/95 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] backdrop-blur-md space-y-4 text-left">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtro Multi-Año para la Ruleta:</span>
            </span>
            <span className="text-[11px] font-mono text-orange-200/90 bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-500/30">
              {isAllYearsSelected
                ? 'Todos los Años (3,088 filmes)'
                : `${selectedYears.length} ${selectedYears.length === 1 ? 'Año Seleccionado' : 'Años Seleccionados'} • ${selectedYearsMoviesCount} filmes`}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={selectAllYears}
              disabled={isSpinning}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 ${
                isAllYearsSelected
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Todos (2000–2026)</span>
            </button>

            <button
              type="button"
              onClick={() => selectPresetYears([2026])}
              disabled={isSpinning}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedYears.length === 1 && selectedYears.includes(2026)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              🎃 2026 (Estrenos)
            </button>

            <button
              type="button"
              onClick={() => selectPresetYears([2026, 2025, 2024, 2023, 2022])}
              disabled={isSpinning}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedYears.length === 5 && selectedYears.includes(2026) && selectedYears.includes(2022)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              ⭐ Últimos 5 Años
            </button>

            <button
              type="button"
              onClick={() => selectPresetYears([2026, 2025, 2024, 2023, 2022, 2021, 2020])}
              disabled={isSpinning}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedYears.length === 7 && selectedYears.includes(2020)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              🔥 2020s
            </button>

            <button
              type="button"
              onClick={() => selectPresetYears([2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010])}
              disabled={isSpinning}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedYears.length === 10 && selectedYears.includes(2010)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              ⚡ 2010s
            </button>

            <button
              type="button"
              onClick={() => selectPresetYears([2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000])}
              disabled={isSpinning}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                selectedYears.length === 10 && selectedYears.includes(2000)
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              📼 2000s
            </button>
          </div>

          {/* Interactive Multi-Select Year Pills (2026 -> 2000) */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-orange-400" />
                Haz clic en cualquier año para agregarlo o quitarlo:
              </span>
              <button
                type="button"
                onClick={selectAllYears}
                className="text-orange-400 hover:text-orange-300 underline font-mono text-[11px]"
              >
                Seleccionar todos
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-orange-900/50">
              {ALL_YEARS.map((yr) => {
                const isSelected = selectedYears.includes(yr);
                const count = filmsCountByYear[yr] || 0;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    disabled={isSpinning}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                        : 'bg-white/5 text-gray-400 hover:text-white border-white/5 hover:border-white/15'
                    }`}
                    title={`Año ${yr}: ${count} películas (${isSelected ? 'Activo' : 'Inactivo'})`}
                  >
                    <span>{yr === 2026 ? '🎃 2026' : yr}</span>
                    <span className="text-[9px] opacity-75 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wheel Graphic */}
        <div className="max-w-md mx-auto relative flex flex-col items-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6">
            <div className={`w-full h-full rounded-full border-4 border-orange-500/80 p-2 shadow-[0_0_35px_rgba(249,115,22,0.4)] ${
              isSpinning ? 'animate-spin' : ''
            }`}>
              <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,#EF4444,#F97316,#7C3AED,#EF4444)] flex items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-[#0E0C17] border-2 border-orange-400/60 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                  <Skull className="w-6 h-6 text-orange-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-gray-300 font-bold mt-1">DÍA {selectedDay}</span>
                  <span className="text-[8px] font-mono font-extrabold text-orange-400 truncate max-w-[80px]">
                    {isAllYearsSelected 
                      ? '2000–2026' 
                      : selectedYears.length === 1 
                      ? `Año ${selectedYears[0]}` 
                      : `${selectedYears.length} Años`}
                  </span>
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
            <span>
              {isSpinning 
                ? 'Invocando Películas...' 
                : `Girar Ruleta del Día ${selectedDay} (${isAllYearsSelected ? 'Todos los Años' : `${selectedYears.length} Años Seleccionados`})`}
            </span>
          </button>
        </div>
      </div>

      {/* Step by Step Daily Movie Picks (5 Movies) */}
      <div className="relative z-10 mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Las 3 del Día</span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                isDaySuperado 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-orange-950 text-orange-400 border border-orange-500/30'
              }`}>
                {watchedCount}/3 Vistas
              </span>
            </h3>

            {isDaySuperado ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡RETO DEL DÍA SUPERADO! (3/3 vistas) 🏆</span>
              </div>
            ) : (
              <span className="text-xs text-orange-300/80 font-mono">
                {watchedCount === 0 
                  ? '🎯 Mira las 3 películas obligatorias para superar el reto' 
                  : `🔥 Te falta${3 - watchedCount === 1 ? '' : 'n'} ${3 - watchedCount} para superar el reto de hoy`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGeneratePosterForDay(selectedDay)}
              disabled={isGeneratingPoster || dailyPicks.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title={`Generar póster del Día ${selectedDay}`}
            >
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Póster Día {selectedDay}</span>
            </button>
            {selectedDay !== todayDayNumber && (
              <button
                onClick={() => handleGeneratePosterForDay(todayDayNumber)}
                disabled={isGeneratingPoster || allMovies.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-950/80 hover:bg-orange-900 border border-orange-500/50 text-orange-200 hover:text-white transition-all shadow-[0_0_10px_rgba(249,115,22,0.2)] cursor-pointer"
                title="Generar póster con las 3 películas de hoy"
              >
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                <span>Póster de Hoy 🎃</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-6">
          {dailyPicks.map((movie, index) => {
            const isRevealed = index < revealedCount;
            const isWatched = !!watchedStatus[movie.id];

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
                {/* Movie Poster Preview with 100% Guaranteed Covers */}
                <div 
                  className="h-48 relative bg-black/80 overflow-hidden cursor-pointer group"
                  onClick={() => onSelectMovie(movie)}
                >
                  <MoviePoster 
                    movie={movie} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
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

                  {/* Streaming Platforms & Watched Action */}
                  <div className="mt-3 space-y-2.5">
                    {/* Where to Watch Streaming Link */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <a
                        href={`https://www.justwatch.com/mx/buscar?q=${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                        title="Ver plataformas de streaming en JustWatch"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>¿Dónde ver?</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>

                      <span className="text-[10px] text-gray-500 font-mono">Streaming</span>
                    </div>

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

      {/* Theatrical Poster / Story Modal Preview */}
      {showStoryModal && generatedStoryUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowStoryModal(false)}
        >
          <div 
            className="relative w-full max-w-sm sm:max-w-md bg-[#0D0B14] border-2 border-orange-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-[11px] font-mono mb-2">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>Cartelera Oficial en Alta Resolución</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {posterTargetDay === todayDayNumber
                  ? `🎃 Las 3 de Hoy (Día ${posterTargetDay})`
                  : `🎃 Póster del Día ${posterTargetDay} de Octubre`}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Formato HD (1080x1920) con las 3 películas obligatorias, listo para historias de Instagram, WhatsApp o descargar
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-orange-500/30 max-h-[440px] sm:max-h-[480px] shadow-[0_0_30px_rgba(249,115,22,0.2)] bg-black/60 flex items-center justify-center">
              <img 
                src={generatedStoryUrl} 
                alt="Horror Movie Poster" 
                className="w-full h-auto max-h-[440px] sm:max-h-[480px] object-contain rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleDownloadImage}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-lg shadow-orange-600/30 transition-all cursor-pointer transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PNG (1080x1920)</span>
              </button>

              <button
                onClick={handleSharePoster}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer"
                title="Compartir o copiar enlace"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
