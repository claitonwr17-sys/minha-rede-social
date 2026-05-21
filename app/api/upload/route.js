import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CHAVE_API_NA_NUVINARY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return Response.json({
        error: "Nenhum arquivo enviado",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resultado = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "conrad",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return Response.json({
      url: resultado.secure_url,
    });
  } catch (erro) {
    console.log(erro);

    return Response.json({
      error: "Erro no upload",
    });
  }
}