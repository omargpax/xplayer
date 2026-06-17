import { NextRequest, NextResponse } from "next/server";

// Reemplaza tu antigua variable DOWNLOADER_URL por la clave de RapidAPI
// Configúrala en Vercel → Settings → Environment Variables:
// RAPIDAPI_KEY = tu_clave_secreta_aqui
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// 1. Función auxiliar para extraer el ID exacto del video (RapidAPI no acepta URLs completas)
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // 2. Extraemos el ID
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL format" }, { status: 400 });
  }

  try {
    // 3. Consultamos a RapidAPI
    const rapidApiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      },
      // cache: "no-store" es el comportamiento por defecto en Next.js con headers dinámicos,
      // pero lo dejamos explícito si lo prefieres:
      cache: "no-store" as RequestCache,
    };

    const rapidResponse = await fetch(rapidApiUrl, options);
    
    if (!rapidResponse.ok) {
      // Si llegas al límite de los 300 requests, RapidAPI devolverá un error aquí
      return NextResponse.json(
        { error: "La API de descarga falló o llegó a su límite. Intenta más tarde." },
        { status: rapidResponse.status }
      );
    }

    const data = await rapidResponse.json();

    // Verificamos que la API nos devolvió el link de descarga
    if (!data || !data.link) {
      return NextResponse.json(
        { error: data.message || "No se pudo generar el enlace de descarga." },
        { status: 500 }
      );
    }

    // 4. Redirigimos al usuario al link final del MP3
    // Esto hará que el navegador inicie la descarga automáticamente
    return NextResponse.redirect(data.link);

  } catch (error: any) {
    console.error("RapidAPI Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Next.js Route" },
      { status: 500 }
    );
  }
}