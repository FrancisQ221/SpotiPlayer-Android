import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomizationState {
  wallpaperId: string | null;
  wallpaperDim: number;
  wallpaperBlur: number;
  setWallpaper: (id: string | null) => void;
  setWallpaperDim: (v: number) => void;
  setWallpaperBlur: (v: number) => void;
}

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set) => ({
      wallpaperId: null,
      wallpaperDim: 15,
      wallpaperBlur: 0,
      setWallpaper: (id) => set({ wallpaperId: id }),
      setWallpaperDim: (v) => set({ wallpaperDim: v }),
      setWallpaperBlur: (v) => set({ wallpaperBlur: v }),
    }),
    { name: "spoplayer-customization" }
  )
);
