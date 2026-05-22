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

const respostaXano = await fetch("URL_REAL_DO_XANO", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    URL_da_imagem: resultado?.secure_url,
  }),
});

if (!respostaXano.ok) {
  const erroTexto = await respostaXano.text();

  console.log("ERRO XANO:", erroTexto);

  return Response.json(
    {
      error: "Erro ao salvar no Xano",
      detalhes: erroTexto,
    },
    {
      status: 500,
    }
  );
}
