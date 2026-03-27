import { NextRequest, NextResponse } from "next/server";

const YT_API_KEY = process.env.YOUTUBE_API_KEY;

// Limitar el número de páginas para evitar Timeouts en serverless
const MAX_PAGES = 4; // Máximo 200 videos (4 * 50)

function extractPlaylistId(url: string): string | null {
  try {
    // Asegurar que la URL sea válida para el constructor
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(validUrl);
    return u.searchParams.get("list");
  } catch { return null; }
}

function extractVideoId(url: string): string | null {
  try {
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(validUrl);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}

function parseISODuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") * 3600) + (parseInt(m[2] ?? "0") * 60) + parseInt(m[3] ?? "0");
}

async function fetchWithApiKey(playlistId: string) {
  const items: any[] = [];
  let pageToken = "";
  let pagesFetched = 0;

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${pageToken}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Error de YouTube API");
    }
    
    const data = await res.json();
    if (!data.items || data.items.length === 0) break;

    const videoIds = data.items
      .map((i: any) => i.snippet?.resourceId?.videoId)
      .filter(Boolean);

    if (videoIds.length > 0) {
        // Fetch durations
        const detailRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${YT_API_KEY}`
        );
        const detailData = await detailRes.json();
        const durationMap: Record<string, number> = {};
        
        for (const v of detailData.items ?? []) {
          durationMap[v.id] = parseISODuration(v.contentDetails?.duration ?? "");
        }

        for (const item of data.items) {
          const s = item.snippet;
          const vid = s?.resourceId?.videoId;
          if (!vid || s?.title === "Deleted video" || s?.title === "Private video") continue;
          items.push({
            id: vid,
            title: s.title,
            artist: s.videoOwnerChannelTitle ?? "Unknown",
            duration: durationMap[vid] || 0,
            thumbnail: s.thumbnails?.medium?.url ?? s.thumbnails?.default?.url,
            url: `https://www.youtube.com/watch?v=${vid}`,
            source: "youtube",
          });
        }
    }

    pageToken = data.nextPageToken ?? "";
    pagesFetched++;
  } while (pageToken && pagesFetched < MAX_PAGES);

  return items;
}

// ... (fetchSingleVideo se mantiene igual)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) return NextResponse.json({ error: "URL no proporcionada" }, { status: 400 });

    const playlistId = extractPlaylistId(url);
    const videoId = extractVideoId(url);

    // Caso 1: Es una Playlist
    if (playlistId) {
      if (!YT_API_KEY) {
        return NextResponse.json({ 
            error: "API Key faltante", 
            hint: "Configura YOUTUBE_API_KEY en .env.local" 
        }, { status: 422 });
      }
      const tracks = await fetchWithApiKey(playlistId);
      return NextResponse.json({ tracks, source: "youtube", total: tracks.length });
    }

    // Caso 2: Es un Video individual
    if (videoId) {
      const tracks = await (async function fetchSingleVideo(videoId: string) {
        const res = await fetch(`https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`);
        if (!res.ok) throw new Error("Video no encontrado o privado");
        const data = await res.json();
        return [{
          id: videoId,
          title: data.title,
          artist: data.author_name,
          thumbnail: data.thumbnail_url,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          source: "youtube",
        }];
      })(videoId);
      return NextResponse.json({ tracks, source: "youtube", total: 1 });
    }

    return NextResponse.json({ error: "URL de YouTube no válida" }, { status: 400 });

  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
