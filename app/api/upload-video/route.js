
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json(
        { error: "Nenhum arquivo de vídeo enviado." },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith("video/")) {
      return Response.json(
        { error: "O arquivo enviado não é um vídeo." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resultado = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "conrad",
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return Response.json({
      url: resultado.secure_url,
      public_id: resultado.public_id,
      resource_type: resultado.resource_type,
      format: resultado.format,
      duration: resultado.duration,
    });
  } catch (erro) {
    console.error("Erro ao enviar vídeo ao Cloudinary:", erro);

    return Response.json(
      { error: "Falha ao enviar o vídeo ao Cloudinary." },
      { status: 500 }
    );
  }
}
