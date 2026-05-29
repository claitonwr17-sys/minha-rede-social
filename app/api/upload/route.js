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

    console.log(
      "CLOUDINARY NAME:",
      process.env.CLOUDINARY_CLOUD_NAME
    );

    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "conrad",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(buffer);
    });

    const respostaXano = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/salvar_imagem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          "URL da imagem": resultado.secure_url,
          curtir: 0,
          amei: 0,
          comentarios: [],
        }),
      }
    );

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

    return Response.json({
      url: resultado.secure_url,
    });

  } catch (erro) {
    console.log("ERRO COMPLETO:", erro);

    return Response.json(
      {
        error: "Erro no upload",
        detalhes: erro?.message || String(erro),
      },
      {
        status: 500,
      }
    );
  }
}