import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const uploadResponse = await cloudinary.uploader.upload(
      body.image,
      {
        folder: "conrad",
      }
    );

    return Response.json({
      success: true,
      url: uploadResponse.secure_url,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
        error: "Erro no upload",
      },
      {
        status: 500,
      }
    );
  }
}