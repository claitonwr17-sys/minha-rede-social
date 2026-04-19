"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function criarConta() {

    if (!email || !senha) {
      alert("Digite email e senha");
      return;
    }

    try {

      const resposta = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        })
      });

      const dados = await resposta.json();

      console.log("Status:", resposta.status);
      console.log("Dados:", dados);

      if (!resposta.ok) {
        alert(dados.message || "Erro ao criar conta");
        return;
      }

      alert("Conta criada com sucesso!");

      router.push("/pag2");

    } catch (erro) {

      console.error("Erro:", erro);
      alert("Erro ao conectar com o servidor");

    }

  }

  async function fazerLogin() {

    if (!email || !senha) {
      alert("Digite email e senha");
      return;
    }

    try {

      const resposta = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        })
      });

      const dados = await resposta.json();

      console.log("Login status:", resposta.status);
      console.log("Login dados:", dados);

      if (!resposta.ok) {
        alert(dados.message || "Email ou senha inválidos");
        return;
      }

      // salvar usuário logado
      localStorage.setItem("user", JSON.stringify(dados.user));
      localStorage.setItem("token", dados.authToken);

      alert("Login realizado com sucesso!");

      router.push("/pag2");

    } catch (erro) {

      console.error("Erro:", erro);
      alert("Erro ao conectar com o servidor");

    }

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

            {/* TEXTO */}
            <div>

              <h1 className="text-4xl font-bold mb-4">
                Conrad – Sua Consciência Digital
              </h1>

              <p className="text-gray-700 mb-4">
                Conrad é uma rede social de inteligência artificial criada para ajudar
                você a pensar antes de postar.
              </p>

            </div>

            {/* CADASTRO / LOGIN */}
            <div className="bg-white p-6 rounded-lg shadow-md">

              <h2 className="text-xl font-semibold mb-4 text-center">
                Criar conta
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
                onClick={criarConta}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Criar conta
              </button>

              <p className="text-center text-sm text-gray-500 mt-4 mb-2">
                Já tem uma conta?
              </p>

              <button
                onClick={fazerLogin}
                className="w-full border border-black text-black py-2 rounded hover:bg-gray-100 transition"
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