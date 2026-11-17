import { useNavigate } from "react-router-dom";
import { WALLPAPER_THEMES, useCustomizationStore } from "@/features/settings";
import { usePlayerStore } from "@/features/player";

const EQ_LABELS = ["32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "16kHz"];
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function SettingsPage() {
  const navigate = useNavigate();
  const customization = useCustomizationStore();
  const player = usePlayerStore();

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "var(--bg-canvas)", color: "var(--text-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ background: "var(--bg-elevated)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Configuración</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* === CUSTOMIZATION === */}
        <section className="px-4 pt-5 pb-2">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent-primary)" }}
          >
            Personalización
          </h2>

          {/* Wallpaper picker */}
          <div
            className="rounded-2xl overflow-hidden mb-3"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm font-medium text-text-primary">Fondo de pantalla</p>
              <p className="text-xs text-text-tertiary">Elige un tema visual</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3">
              {/* No wallpaper option */}
              <button
                onClick={() => customization.setWallpaper(null)}
                className="relative rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 transition-all"
                style={{
                  background: "var(--bg-panel)",
                  borderColor:
                    customization.wallpaperId === null
                      ? "var(--accent-primary)"
                      : "transparent",
                }}
              >
                <span className="text-xs text-text-tertiary">Ninguno</span>
                {customization.wallpaperId === null && (
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent-primary)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" style={{ color: "var(--btn-primary-text)" }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </button>

              {WALLPAPER_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => customization.setWallpaper(theme.id)}
                  className="relative rounded-xl overflow-hidden aspect-video border-2 transition-all"
                  style={{
                    borderColor:
                      customization.wallpaperId === theme.id
                        ? theme.accentColor
                        : "transparent",
                  }}
                >
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-start justify-end p-2">
                    <span className="text-xs font-bold text-white drop-shadow">{theme.name}</span>
                    <span className="text-[10px] text-white/70 leading-tight">{theme.subtitle}</span>
                  </div>
                  {customization.wallpaperId === theme.id && (
                    <div
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: theme.accentColor }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Dim / Blur sliders */}
            {customization.wallpaperId && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-text-tertiary mb-1">
                    <span>Oscurecer</span>
                    <span>{customization.wallpaperDim}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={customization.wallpaperDim}
                    onChange={(e) => customization.setWallpaperDim(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent-primary) ${customization.wallpaperDim / 80 * 100}%, var(--bg-panel) ${customization.wallpaperDim / 80 * 100}%)`,
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-text-tertiary mb-1">
                    <span>Desenfoque</span>
                    <span>{customization.wallpaperBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={customization.wallpaperBlur}
                    onChange={(e) => customization.setWallpaperBlur(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--accent-primary) ${customization.wallpaperBlur / 20 * 100}%, var(--bg-panel) ${customization.wallpaperBlur / 20 * 100}%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* === AUDIO === */}
        <section className="px-4 pt-2 pb-2">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent-primary)" }}
          >
            Audio
          </h2>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
            {/* Playback speed */}
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm font-medium text-text-primary mb-2">Velocidad de reproducción</p>
              <div className="flex gap-2 flex-wrap">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => player.setPlaybackRate(speed)}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background:
                        player.playbackRate === speed
                          ? "var(--accent-primary)"
                          : "var(--bg-panel)",
                      color:
                        player.playbackRate === speed
                          ? "var(--btn-primary-text)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* EQ Toggle */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">Ecualizador</p>
                <p className="text-xs text-text-tertiary">Ajuste de frecuencias</p>
              </div>
              <button
                onClick={() => player.setEqualizerEnabled(!player.equalizerEnabled)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: player.equalizerEnabled ? "var(--accent-primary)" : "var(--bg-panel)" }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: player.equalizerEnabled ? "calc(100% - 20px)" : "4px" }}
                />
              </button>
            </div>

            {/* EQ Bands */}
            {player.equalizerEnabled && (
              <div className="px-4 py-4">
                <div className="flex gap-2 items-end justify-between h-32">
                  {player.equalizerBands.map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[9px] text-text-tertiary">{val > 0 ? `+${val}` : val}</span>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={1}
                        value={val}
                        onChange={(e) => player.setEqualizerBand(i, Number(e.target.value))}
                        className="appearance-none cursor-pointer"
                        style={{
                          writingMode: "vertical-lr",
                          direction: "rtl",
                          height: 80,
                          width: 4,
                          accentColor: "var(--accent-primary)",
                        }}
                      />
                      <span className="text-[9px] text-text-tertiary">{EQ_LABELS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* === ABOUT === */}
        <section className="px-4 pt-2 pb-8">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent-primary)" }}
          >
            Acerca de
          </h2>
          <div
            className="rounded-2xl px-4 py-4 flex items-center gap-3"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: "var(--bg-panel)" }}
            >
              <img src="/icon.png" alt="SpoPlayer" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">SpoPlayer Android</p>
              <p className="text-xs text-text-tertiary">v0.1.0 · by FrancisQ221</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
