@"
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  function irParaFeed() {
    router.push("/pag2");
  }

  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center text-2xl font-bold tracking-tight">
            <Image
              src="/logo/logo-simbolo.png"
              alt="Logo Conrad"
              width={28}
              height={28}
              className="mr-1"
              priority
            />
            <span>onrad</span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">

          <h1 className="text-3xl font-bold mb-4">
            Conrad – Sua Consciência Digital
          </h1>

          <p className="text-gray-700 mb-6">
            Conrad é uma rede social de inteligência artificial criada para ajudar
            você a pensar antes de postar.
          </p>

          <p className="text-gray-700 mb-6">
            O sistema analisa o sentimento das postagens e ajuda você a refletir
            antes de publicar.
          </p>

          {/* BOTÃO LOGIN */}
          <button
            onClick={irParaFeed}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition"
          >
            Fazer login
          </button>

        </div>
      </main>
    </>
  );
}
"@ | Set-Content page.tsx -Encoding utf8
