import { NextRequest, NextResponse } from "next/server";

// URL del microservicio Python en Railway.
// Configúrala en Vercel → Settings → Environment Variables:
//   DOWNLOADER_URL = https://tu-servicio.up.railway.app
const DOWNLOADER_URL = process.env.DOWNLOADER_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");
  const videoTitle = searchParams.get("title") || "track";

  if (!videoUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }


  try {
    const railwayResponse = await fetch(
      `${DOWNLOADER_URL}/download?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(videoTitle)}`,
      {
        method: "GET",
        // Importante: No pongas caché para que siempre descargue el archivo nuevo
        cache: "no-store",
      }
    );

    if (!railwayResponse.ok) {
      const errorData = await railwayResponse.json().catch(() => ({}));
      // Extraemos solo el mensaje importante
      const cleanMessage = errorData.detail?.split(':').pop() || "YouTube limitó la descarga. Intenta en unos minutos.";
      return NextResponse.json(
        { error: cleanMessage },
        { status: railwayResponse.status }
      );
    }

    // Retornamos el stream directamente al navegador
    // Esto hace que Next.js actúe como un puente (pipe)
    return new NextResponse(railwayResponse.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(videoTitle)}.mp3"`,
      },
    });

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Proxy" },
      { status: 500 }
    );
  }
}
