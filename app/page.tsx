import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
            você a pensar antes de postar. O app analisa o sentimento e o tom
            emocional das suas postagens — identificando se são positivas,
            negativas ou neutras — e oferece uma resposta humanizada.
          </p>

          <p className="text-gray-700 mb-6">
            Com a tecnologia do Google Cloud e Gemini AI, o Conrad atua como uma
            espécie de consciência digital.
          </p>

          <h2 className="text-xl font-semibold mb-2">
            🌍 Por que usar o Conrad
          </h2>

          <p className="text-gray-700 mb-6">
            O Conrad ajuda você a entender como suas palavras podem soar para os outros.
          </p>

          <h2 className="text-xl font-semibold mb-2">
            ⚙️ Como funciona
          </h2>

          <p className="text-gray-700 mb-6">
            Você digita sua postagem e a IA analisa o sentimento.
          </p>

          <h2 className="text-xl font-semibold mb-2">
            🌟 Benefícios
          </h2>

          <p className="text-gray-700 mb-6">
            Evite publicações impulsivas e desenvolva consciência emocional online.
          </p>

          <h2 className="text-xl font-semibold mb-2">
            💡 Missão
          </h2>

          <p className="text-gray-700 mb-8">
            Tornar a internet um lugar mais empático e humano.
          </p>

          {/* BOTÃO LOGIN */}
          <Link href="/pag2">
            <button className="bg-white text-black px-6 py-3 rounded-lg border border-gray-300 text-lg font-medium hover:bg-gray-50 transition">
              Fazer login
            </button>
          </Link>

        </div>
      </main>
    </>
  );
}
