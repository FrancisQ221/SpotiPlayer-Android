import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchYouTubeMusic, type SearchResult } from "@/features/player/lib/ytResolver";
import { usePlayerStore, type Track } from "@/features/player";
import logoUrl from "@/assets/spoplayer-logo.png";

function MiniPlayer() {
  const store = usePlayerStore();
  const navigate = useNavigate();

  if (!store.currentTrack) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 glass border-t"
      style={{ borderColor: "var(--border-primary)" }}
      onClick={() => navigate("/player")}
    >
      {/* Art */}
      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--bg-elevated)" }}>
        {store.currentTrack.albumArt ? (
          <img src={store.currentTrack.albumArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-40">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{store.currentTrack.title}</p>
        <p className="text-xs text-text-tertiary truncate">{store.currentTrack.artist}</p>
      </div>
      {/* Controls */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          store.setIsPlaying(!store.isPlaying);
        }}
        className="p-2 rounded-full"
        style={{ background: "var(--accent-primary)", color: "var(--btn-primary-text)" }}
      >
        {store.isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          store.nextTrack();
        }}
        className="p-2"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-text-secondary">
          <path d="M6 18l8.5-6L6 6v12zm8.5-6L23 6v12l-8.5-6z" />
        </svg>
      </button>
    </div>
  );
}

function SearchResultItem({
  result,
  onPlay,
}: {
  result: SearchResult;
  onPlay: (r: SearchResult) => void;
}) {
  const duration = result.duration;
  const m = Math.floor(duration / 60);
  const s = duration % 60;
  const dStr = `${m}:${s.toString().padStart(2, "0")}`;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 active:opacity-70 cursor-pointer"
      style={{ borderBottom: "1px solid var(--border-primary)" }}
      onClick={() => onPlay(result)}
    >
      <div
        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: "var(--bg-elevated)" }}
      >
        {result.albumArt ? (
          <img src={result.albumArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-30">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{result.title}</p>
        <p className="text-xs text-text-tertiary truncate">
          {result.artist}
          {result.album ? ` • ${result.album}` : ""}
        </p>
      </div>
      <span className="text-xs text-text-tertiary flex-shrink-0">{dStr}</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const store = usePlayerStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await searchYouTubeMusic(query.trim());
      setResults(res);
    } catch (e) {
      setError("Error al buscar: " + String(e));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handlePlay = useCallback(
    (result: SearchResult) => {
      const track: Track = {
        id: result.videoId,
        videoId: result.videoId,
        title: result.title,
        artist: result.artist,
        album: result.album,
        albumArt: result.albumArt,
        duration: result.duration,
      };
      const tracks: Track[] = results.map((r) => ({
        id: r.videoId,
        videoId: r.videoId,
        title: r.title,
        artist: r.artist,
        album: r.album,
        albumArt: r.albumArt,
        duration: r.duration,
      }));
      const idx = results.findIndex((r) => r.videoId === result.videoId);
      store.setQueue(tracks, idx >= 0 ? idx : 0);
      store.playTrack(track);
      navigate("/player");
    },
    [results, store, navigate]
  );

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "var(--bg-canvas)", color: "var(--text-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="SpoPlayer" className="w-7 h-7" />
          <span className="text-lg font-bold" style={{ color: "var(--accent-primary)" }}>
            SpoPlayer
          </span>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-full"
          style={{ background: "var(--bg-elevated)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
            placeholder="Buscar canciones, artistas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: "var(--text-tertiary)" }}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
        <button
          className="mt-2 w-full py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent-primary)", color: "var(--btn-primary-text)" }}
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: store.currentTrack ? 80 : 16 }}>
        {error && (
          <div className="mx-4 my-3 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 opacity-20">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <p className="text-text-secondary text-sm">
              Busca cualquier canción de YouTube Music
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
            />
            <p className="text-text-secondary text-sm">Buscando...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-text-secondary">Sin resultados para "{query}"</p>
          </div>
        )}

        {!loading &&
          results.map((r) => (
            <SearchResultItem key={r.videoId} result={r} onPlay={handlePlay} />
          ))}
      </div>

      {/* Mini Player */}
      <MiniPlayer />
    </div>
  );
}
