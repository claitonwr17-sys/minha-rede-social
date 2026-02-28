"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function fazerLogin() {

    if (!email || !senha) {
      alert("Digite email e senha");
      return;
    }

    router.push("/pag2");

  }

  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
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
      <main className="min-h-screen bg-gray-100 flex items-center">

        <div className="max-w-5xl mx-auto px-4 w-full">

          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* LADO ESQUERDO — TEXTO ORIGINAL COMPLETO */}
            <div>

              <h1 className="text-4xl font-bold mb-4">
                Conrad – Sua Consciência Digital
              </h1>

              <p className="text-gray-700 mb-4">
                Conrad é uma rede social de inteligência artificial criada para ajudar
                você a pensar antes de postar. O app analisa o sentimento e o tom
                emocional das suas postagens — identificando se são positivas,
                negativas ou neutras — e oferece uma resposta humanizada.
              </p>

              <p className="text-gray-700 mb-4">
                Com a tecnologia do Google Cloud e Gemini AI, o Conrad atua como uma
                consciência digital que ajuda você a se expressar melhor online.
              </p>

              <p className="text-gray-700">
                Evite publicações impulsivas, desenvolva consciência emocional e
                compartilhe mensagens mais positivas.
              </p>

            </div>

            {/* LADO DIREITO — LOGIN */}
            <div className="bg-white p-6 rounded-lg shadow-md">

              <h2 className="text-xl font-semibold mb-4 text-center">
                Fazer login
              </h2>

              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 mb-3 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Senha"
                className="w-full border p-2 mb-4 rounded"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button
                onClick={fazerLogin}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Fazer login
              </button>

            </div>

          </div>

        </div>

      </main>
    </>
  );
}
