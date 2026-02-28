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

    // futuramente aqui vamos conectar com Xano
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
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

          <h1 className="text-2xl font-bold mb-6 text-center">
            Entrar no Conrad
          </h1>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* SENHA */}
          <input
            type="password"
            placeholder="Senha"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {/* BOTÃO */}
          <button
            onClick={fazerLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Fazer login
          </button>

        </div>

      </main>
    </>
  );
}
