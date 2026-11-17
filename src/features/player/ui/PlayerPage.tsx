import { usePlayerStore } from "../store/playerStore";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useNavigate } from "react-router-dom";

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SkipNextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M6 18l8.5-6L6 6v12zm8.5-6L23 6v12l-8.5-6z" />
    </svg>
  );
}

function SkipPrevIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function ShuffleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ opacity: active ? 1 : 0.5 }}>
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  );
}

function RepeatIcon({ mode }: { mode: string }) {
  const opacity = mode === "none" ? 0.5 : 1;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ opacity }}>
      {mode === "one" ? (
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      ) : (
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      )}
    </svg>
  );
}

export default function PlayerPage() {
  useAudioEngine();
  const navigate = useNavigate();
  const store = usePlayerStore();

  const track = store.currentTrack;
  const progress = store.duration > 0 ? store.currentTime / store.duration : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value) * store.duration;
    store.setCurrentTime(newTime);
  };

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-canvas text-text-secondary gap-4">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 opacity-30">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <p className="text-lg">Nada en reproducción</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-full bg-accent-primary text-btn-primary-text font-medium text-sm"
          style={{ background: "var(--accent-primary)", color: "var(--btn-primary-text)" }}
        >
          Buscar música
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-canvas text-text-primary select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ background: "var(--bg-elevated)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-text-tertiary uppercase tracking-widest">Reproduciendo</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div
          className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl"
          style={{ maxWidth: 320 }}
        >
          {track.albumArt ? (
            <img
              src={track.albumArt}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "var(--bg-elevated)" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 opacity-30">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 pb-2">
        <h2 className="text-xl font-bold text-text-primary truncate">{track.title}</h2>
        <p className="text-text-secondary text-sm truncate">{track.artist}</p>
      </div>

      {/* Progress */}
      <div className="px-6 pb-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-primary) ${progress * 100}%, var(--bg-elevated) ${progress * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-text-tertiary mt-1">
          <span>{formatTime(store.currentTime)}</span>
          <span>{formatTime(store.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-4">
        {/* Row 1: shuffle / prev / play / next / repeat */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={store.toggleShuffle}>
            <ShuffleIcon active={store.isShuffled} />
          </button>
          <button
            onClick={store.prevTrack}
            className="p-3 rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          >
            <SkipPrevIcon />
          </button>
          <button
            onClick={() => store.setIsPlaying(!store.isPlaying)}
            className="p-5 rounded-full shadow-lg"
            style={{ background: "var(--accent-primary)", color: "var(--btn-primary-text)" }}
            disabled={store.isLoading}
          >
            {store.isLoading ? (
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : store.isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>
          <button
            onClick={store.nextTrack}
            className="p-3 rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          >
            <SkipNextIcon />
          </button>
          <button onClick={store.toggleRepeat}>
            <RepeatIcon mode={store.repeatMode} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-tertiary">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={store.isMuted ? 0 : store.volume}
            onChange={(e) => store.setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-primary) ${(store.isMuted ? 0 : store.volume) * 100}%, var(--bg-elevated) ${(store.isMuted ? 0 : store.volume) * 100}%)`,
            }}
          />
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-text-tertiary">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </div>
      </div>

      {/* Error */}
      {store.error && (
        <div className="mx-6 mb-3 p-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          {store.error}
        </div>
      )}

      {/* Safe area padding */}
      <div className="safe-bottom" />
    </div>
  );
}
