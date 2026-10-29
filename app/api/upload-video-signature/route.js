import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "conrad";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({
      timestamp,
      signature,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (erro) {
    console.error("Erro ao gerar assinatura do Cloudinary:", erro);

    return Response.json(
      { error: "Não foi possível preparar o envio do vídeo." },
      { status: 500 }
    );
  }
}
