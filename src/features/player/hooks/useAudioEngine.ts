/**
 * useAudioEngine — HTML5 Audio + Web Audio API engine for SpoPlayer Android.
 * Works inside Android WebView via Capacitor.
 */
import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../store/playerStore";
import { resolveStreamUrl } from "../lib/ytResolver";

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const resolveRef = useRef<((url: string) => void) | null>(null);

  const store = usePlayerStore();

  // Lazily create Audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  }, []);

  // Setup Web Audio API graph
  const setupAudioGraph = useCallback(() => {
    const audio = getAudio();
    if (audioCtxRef.current) return;

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;

      // Gain node for volume
      const gain = ctx.createGain();
      gainRef.current = gain;

      // 10-band EQ (approximate center frequencies)
      const EQ_FREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      const filters = EQ_FREQS.map((freq) => {
        const f = ctx.createBiquadFilter();
        f.type = "peaking";
        f.frequency.value = freq;
        f.Q.value = 1.4;
        f.gain.value = 0;
        return f;
      });
      eqFiltersRef.current = filters;

      // Chain: source → filters → gain → destination
      let prev: AudioNode = source;
      for (const f of filters) {
        prev.connect(f);
        prev = f;
      }
      prev.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn("[AudioEngine] Web Audio not available:", e);
    }
  }, [getAudio]);

  // Update EQ bands
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const { equalizerEnabled, equalizerBands } = store;
    eqFiltersRef.current.forEach((f, i) => {
      f.gain.value = equalizerEnabled ? equalizerBands[i] : 0;
    });
  }, [store.equalizerEnabled, store.equalizerBands]);

  // Update volume
  useEffect(() => {
    const audio = getAudio();
    audio.volume = store.isMuted ? 0 : store.volume;
    if (gainRef.current) {
      gainRef.current.gain.value = store.isMuted ? 0 : store.volume;
    }
  }, [store.volume, store.isMuted, getAudio]);

  // Update playback rate
  useEffect(() => {
    const audio = getAudio();
    audio.playbackRate = store.playbackRate;
  }, [store.playbackRate, getAudio]);

  // Handle play/pause
  useEffect(() => {
    const audio = getAudio();
    if (store.isPlaying && audio.src && !store.isLoading) {
      audioCtxRef.current?.resume();
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [store.isPlaying, store.isLoading, getAudio]);

  // Handle track change → resolve stream and load
  useEffect(() => {
    const track = store.currentTrack;
    if (!track) return;

    const audio = getAudio();
    setupAudioGraph();

    let cancelled = false;
    store.setIsLoading(true);
    store.setError(null);

    resolveStreamUrl(track.videoId)
      .then((url) => {
        if (cancelled) return;
        audio.src = url;
        audio.load();
        if (store.isPlaying) {
          audioCtxRef.current?.resume();
          audio.play().catch(() => {});
        }
        store.setIsLoading(false);

        // Update MediaSession
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album ?? "",
            artwork: track.albumArt
              ? [{ src: track.albumArt, sizes: "512x512", type: "image/jpeg" }]
              : [],
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        store.setIsLoading(false);
        store.setError(String(err));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentTrack?.videoId]);

  // Wire audio events
  useEffect(() => {
    const audio = getAudio();

    const onTimeUpdate = () => store.setCurrentTime(audio.currentTime);
    const onDuration = () => store.setDuration(audio.duration || 0);
    const onEnded = () => store.nextTrack();
    const onError = () => {
      store.setIsLoading(false);
      store.setError("Error de reproducción");
    };
    const onCanPlay = () => store.setIsLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MediaSession action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () =>
      store.setIsPlaying(true)
    );
    navigator.mediaSession.setActionHandler("pause", () =>
      store.setIsPlaying(false)
    );
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      store.nextTrack()
    );
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      store.prevTrack()
    );
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        const audio = getAudio();
        audio.currentTime = details.seekTime;
        store.setCurrentTime(details.seekTime);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose seek function via store override
  useEffect(() => {
    // Monkey-patch seekTo in the store action
    // The store's seekTo is a no-op; we wire it here via a ref
    resolveRef.current = (_url: string) => {};
  }, []);

  // Seek when store.currentTime is updated externally (slider)
  const prevTimeRef = useRef(0);
  useEffect(() => {
    // Distinguish user-initiated seeks from normal playback updates
    // We track if currentTime changed without audio driving it
    const audio = getAudio();
    const diff = Math.abs(store.currentTime - audio.currentTime);
    if (diff > 1.5 && !store.isLoading) {
      audio.currentTime = store.currentTime;
    }
    prevTimeRef.current = store.currentTime;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentTime]);
}
