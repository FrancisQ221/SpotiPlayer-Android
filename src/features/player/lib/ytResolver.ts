/**
 * YouTube stream resolver for Android WebView.
 * Uses youtubei.js (Innertube) to get playable audio-only stream URLs.
 */
import { Innertube } from "youtubei.js";

let innertubeInstance: Awaited<ReturnType<typeof Innertube.create>> | null =
  null;

async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      retrieve_player: true,
    });
  }
  return innertubeInstance;
}

export async function resolveStreamUrl(videoId: string): Promise<string> {
  const yt = await getInnertube();
  const info = await yt.getInfo(videoId);

  // Prefer audio-only formats, highest quality
  const formats = info.streaming_data?.adaptive_formats ?? [];
  const audioFormats = formats
    .filter((f) => f.has_audio && !f.has_video)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  const best = audioFormats[0];
  if (!best) {
    throw new Error("No audio stream found for " + videoId);
  }

  const url = best.decipher(yt.session.player);
  if (!url) throw new Error("Failed to decipher stream URL");
  return url;
}

export interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number;
}

export async function searchYouTubeMusic(query: string): Promise<SearchResult[]> {
  const yt = await getInnertube();
  const results = await yt.music.search(query, { type: "song" });

  const items: SearchResult[] = [];
  for (const section of results.contents ?? []) {
    if ("contents" in section) {
      for (const item of (section as any).contents ?? []) {
        try {
          const videoId = item.id;
          const title = item.title ?? "Unknown";
          const artist =
            item.artists?.[0]?.name ?? item.author?.name ?? "Unknown";
          const album = item.album?.name;
          const albumArt =
            item.thumbnail?.contents?.[0]?.url?.split("=")?.[0] + "=w512-h512-rw";
          const duration =
            item.duration?.seconds ?? 0;

          if (videoId) {
            items.push({ videoId, title, artist, album, albumArt, duration });
          }
        } catch {
          // skip malformed items
        }
      }
    }
  }

  return items.slice(0, 30);
}
