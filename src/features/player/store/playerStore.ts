import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number; // seconds
  streamUrl?: string;
  videoId: string;
}

export type RepeatMode = "none" | "one" | "all";

interface PlayerState {
  // Queue
  queue: Track[];
  queueIndex: number;
  currentTrack: Track | null;

  // Playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;

  // Audio filters
  playbackRate: number;
  pitch: number; // semitones
  equalizerEnabled: boolean;
  equalizerBands: number[]; // 10 bands in dB

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  playTrack: (track: Track) => void;
  setIsPlaying: (v: boolean) => void;
  seekTo: (time: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setPlaybackRate: (r: number) => void;
  setPitch: (p: number) => void;
  setEqualizerEnabled: (v: boolean) => void;
  setEqualizerBand: (index: number, value: number) => void;
  setIsLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

const DEFAULT_EQ_BANDS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      queueIndex: 0,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      repeatMode: "none",
      isShuffled: false,
      playbackRate: 1,
      pitch: 0,
      equalizerEnabled: false,
      equalizerBands: DEFAULT_EQ_BANDS,
      isLoading: false,
      error: null,

      setQueue: (tracks, startIndex = 0) =>
        set({
          queue: tracks,
          queueIndex: startIndex,
          currentTrack: tracks[startIndex] ?? null,
          currentTime: 0,
        }),

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      playTrack: (track) =>
        set({
          currentTrack: track,
          currentTime: 0,
          isPlaying: true,
          isLoading: true,
          error: null,
        }),

      setIsPlaying: (v) => set({ isPlaying: v }),
      seekTo: (_time) => {
        // Handled by the audio engine hook
      },
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      setVolume: (v) => set({ volume: v }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleRepeat: () =>
        set((s) => {
          const modes: RepeatMode[] = ["none", "all", "one"];
          const idx = modes.indexOf(s.repeatMode);
          return { repeatMode: modes[(idx + 1) % modes.length] };
        }),

      toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),

      nextTrack: () => {
        const { queue, queueIndex, repeatMode, isShuffled } = get();
        if (!queue.length) return;
        let next: number;
        if (repeatMode === "one") {
          next = queueIndex;
        } else if (isShuffled) {
          next = Math.floor(Math.random() * queue.length);
        } else {
          next = queueIndex + 1;
          if (next >= queue.length) {
            next = repeatMode === "all" ? 0 : queueIndex;
          }
        }
        set({
          queueIndex: next,
          currentTrack: queue[next],
          currentTime: 0,
          isLoading: true,
        });
      },

      prevTrack: () => {
        const { queue, queueIndex, currentTime } = get();
        if (!queue.length) return;
        // If more than 3s in, restart; else go prev
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        const prev = Math.max(0, queueIndex - 1);
        set({
          queueIndex: prev,
          currentTrack: queue[prev],
          currentTime: 0,
          isLoading: true,
        });
      },

      setPlaybackRate: (r) => set({ playbackRate: r }),
      setPitch: (p) => set({ pitch: p }),
      setEqualizerEnabled: (v) => set({ equalizerEnabled: v }),
      setEqualizerBand: (index, value) =>
        set((s) => {
          const bands = [...s.equalizerBands];
          bands[index] = value;
          return { equalizerBands: bands };
        }),
      setIsLoading: (v) => set({ isLoading: v }),
      setError: (e) => set({ error: e }),
    }),
    {
      name: "spoplayer-player",
      partialize: (s) => ({
        volume: s.volume,
        isMuted: s.isMuted,
        repeatMode: s.repeatMode,
        isShuffled: s.isShuffled,
        playbackRate: s.playbackRate,
        equalizerEnabled: s.equalizerEnabled,
        equalizerBands: s.equalizerBands,
      }),
    }
  )
);
