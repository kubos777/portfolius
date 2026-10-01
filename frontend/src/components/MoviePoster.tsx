import { useState, useEffect } from 'react';
import { Skull } from 'lucide-react';

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

interface MoviePosterProps {
  movie: Movie;
  posterUrl?: string | null;
  className?: string;
  alt?: string;
}

const POSTER_CACHE_KEY = 'spooktober_poster_cache_v2';
const memoryPosterCache = new Map<string, string>();
const activeFetches = new Map<string, Promise<string | null>>();

// Initialize memory cache from localStorage once
try {
  const saved = localStorage.getItem(POSTER_CACHE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string') memoryPosterCache.set(k, v);
    });
  }
} catch {
  // ignore
}

export function getCachedPoster(movieId: string): string | undefined {
  return memoryPosterCache.get(movieId);
}

export function setCachedPoster(movieId: string, url: string) {
  memoryPosterCache.set(movieId, url);
  try {
    const obj: Record<string, string> = {};
    const entries = Array.from(memoryPosterCache.entries()).slice(-250);
    entries.forEach(([k, v]) => (obj[k] = v));
    localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

// Fetch poster from Wikipedia with deduplication and 0ms cache hits
export async function fetchWikipediaPoster(movie: Movie): Promise<string | null> {
  if (memoryPosterCache.has(movie.id)) {
    return memoryPosterCache.get(movie.id) || null;
  }

  if (activeFetches.has(movie.id)) {
    return activeFetches.get(movie.id)!;
  }

  if (!movie.wikiUrl) return null;
  const slug = movie.wikiUrl.split('/wiki/')[1];
  if (!slug) return null;

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const source = data.thumbnail?.source || data.originalimage?.source;
        if (source) {
          setCachedPoster(movie.id, source);
          return source;
        }
      }
    } catch {
      // ignore
    } finally {
      activeFetches.delete(movie.id);
    }
    return null;
  })();

  activeFetches.set(movie.id, fetchPromise);
  return fetchPromise;
}

// 8 Curated High-Definition Thematic Horror Backdrops from Unsplash
const HORROR_BACKDROPS = [
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', // Skull & Forest Fog
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Victorian Fog Manor
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80', // Gothic Cemetery
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // Crimson Neon Noir
  'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80', // Occult Dark Silhouette
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80', // Misty Dark Pines
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', // Cosmic Blood Moon
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', // VHS Static Terror
];

function getBackdropForMovie(id: string, title: string): string {
  let hash = 0;
  const str = id + title;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % HORROR_BACKDROPS.length;
  return HORROR_BACKDROPS[idx];
}

export default function MoviePoster({
  movie,
  posterUrl: propPosterUrl,
  className = 'w-full h-full',
  alt,
}: MoviePosterProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    return propPosterUrl || memoryPosterCache.get(movie.id) || null;
  });
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if we already have it in cache or prop
    const cached = propPosterUrl || memoryPosterCache.get(movie.id);
    if (cached) {
      setResolvedUrl(cached);
      return;
    }

    // Otherwise fetch in background
    fetchWikipediaPoster(movie).then((url) => {
      if (isMounted && url) {
        setResolvedUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [movie.id, movie.wikiUrl, propPosterUrl]);

  const fallbackBackdrop = getBackdropForMovie(movie.id, movie.title);
  const is2026 = movie.year === 2026;
  const cleanDirector = movie.director && movie.director !== 'Desconocido'
    ? movie.director.split(',')[0].trim()
    : null;
  const cleanGenre = movie.subgenre && movie.subgenre !== 'Desconocido'
    ? movie.subgenre.split(',')[0].trim()
    : 'CINE DE TERROR';

  // If real Wikipedia poster is resolved and hasn't errored
  if (resolvedUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        <img
          src={resolvedUrl}
          alt={alt || movie.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />

        {/* Ambient shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Film reel watermark overlay */}
        <div className="absolute bottom-1 right-2 pointer-events-none opacity-40 text-[9px] font-mono font-bold tracking-widest text-orange-400">
          VAULT
        </div>
      </div>
    );
  }

  // Authentic Cinematic Thematic Poster Generator (Guarantees 100% of movies have high-quality poster art)
  return (
    <div className={`relative overflow-hidden bg-[#0A0710] flex flex-col justify-between ${className}`}>
      {/* Background Horror Photographic Artwork */}
      <img
        src={fallbackBackdrop}
        alt="Horror Backdrop"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity filter contrast-125"
      />

      {/* Dark Vignette and Blood-Orange Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/45 to-[#090611] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-red-950/40 pointer-events-none" />

      {/* Top Header Stamp */}
      <div className="relative z-10 p-2.5 flex items-center justify-between border-b border-orange-500/20">
        <span className="flex items-center gap-1 text-[8px] font-mono font-extrabold tracking-widest uppercase text-orange-400">
          <Skull className="w-2.5 h-2.5 text-orange-500" />
          <span>SPOOKTOBER ARCHIVE</span>
        </span>
        <span className="text-[8px] font-mono font-bold text-gray-400">
          {movie.year}
        </span>
      </div>

      {/* Center Cinematic Title */}
      <div className="relative z-10 px-3 py-2 text-center my-auto">
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white drop-shadow-[0_2px_8px_rgba(249,115,22,0.9)] line-clamp-3 font-serif">
          {movie.title}
        </h4>
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto my-1.5" />
        <span className="text-[9px] font-mono tracking-widest text-orange-300 font-bold uppercase block truncate">
          {cleanGenre}
        </span>
      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-10 p-2 bg-black/60 backdrop-blur-xs border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-gray-400">
        <span className="truncate max-w-[120px]">
          {cleanDirector ? `DIR. ${cleanDirector.toUpperCase()}` : 'CINE DE CULTO'}
        </span>
        {is2026 ? (
          <span className="text-orange-400 font-bold">🎃 ESTRENO</span>
        ) : (
          <span className="text-gray-500">HD ARCHIVE</span>
        )}
      </div>
    </div>
  );
}
