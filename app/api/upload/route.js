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

    if (!file) {
      return Response.json(
        {
          error: "Nenhum arquivo enviado",
        },
        {
          status: 400,
        }
      );
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
  resolve(result || {});
}
          }
        )
      .end(buffer);
});

await fetch("https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/salvar_imagem", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    imagem: resultado?.secure_url,
  }),
});

  } catch (erro) {
    console.log(erro);

    return Response.json(
      {
        error: "Erro no upload",
      },
      {
        status: 500,
      }
    );
  }
}