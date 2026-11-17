import { useEffect } from "react";
import { useCustomizationStore } from "./store/customizationStore";
import { WALLPAPER_THEMES } from "./data/wallpaperThemes";

export function useThemeSync() {
  const wallpaperId = useCustomizationStore((s) => s.wallpaperId);

  useEffect(() => {
    const root = document.documentElement;
    const theme = WALLPAPER_THEMES.find((t) => t.id === wallpaperId);
    if (theme) {
      root.setAttribute("data-wallpaper", theme.id);
    } else {
      root.removeAttribute("data-wallpaper");
    }
  }, [wallpaperId]);
}

export { useCustomizationStore } from "./store/customizationStore";
export { WALLPAPER_THEMES } from "./data/wallpaperThemes";
export type { WallpaperTheme } from "./data/wallpaperThemes";
export { default as SettingsPage } from "./ui/SettingsPage";
