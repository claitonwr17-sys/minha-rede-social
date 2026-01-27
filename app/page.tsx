import Header from "./components/Header";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 flex-col md:flex-row px-6">

        {/* LADO ESQUERDO – LOGIN */}
        <section className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-6">
              Entrar
            </h1>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="password"
                placeholder="Senha"
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <button
                type="button"
                className="w-full rounded-lg bg-black text-white py-2 font-semibold hover:bg-gray-900 transition"
              >
                Fazer login
              </button>
            </form>
          </div>
        </section>

        {/* LADO DIREITO – TEXTO CONRAD */}
        <section className="w-full md:w-1/2 flex items-center justify-end">
          <div className="max-w-md text-sm text-gray-700">

            <h2 className="text-xl font-semibold mb-3">
              Conrad – Sua Consciência Digital
            </h2>

            <p className="mb-3">
              Conrad é uma rede social de inteligência artificial criada para ajudar
              você a pensar antes de postar.
            </p>

            <p className="mb-3">
              O app analisa o sentimento e o tom emocional das suas postagens —
              identificando se são positivas, negativas ou neutras — e oferece
              uma resposta humanizada, ajudando você a refletir antes de compartilhar.
            </p>

            <p className="mb-4">
              Com a tecnologia do Google Cloud e Gemini AI, o Conrad atua como uma
              espécie de “consciência digital”, um amigo que te ajuda a se expressar
              melhor nas redes sociais.
            </p>

            <h3 className="font-semibold mb-1">🌍 Por que usar o Conrad</h3>
            <p className="mb-3">
              Vivemos em um mundo em que um simples post pode gerar grandes
              consequências. O Conrad ajuda você a entender como suas palavras
              podem soar para os outros e se vale a pena publicá-las.
            </p>

            <h3 className="font-semibold mb-1">⚙️ Como funciona</h3>
            <ul className="list-disc list-inside mb-3">
              <li>Digite ou cole sua postagem no app</li>
              <li>A IA analisa o texto usando Google Cloud e Gemini</li>
              <li>Você recebe uma resposta com o impacto emocional</li>
            </ul>

            <h3 className="font-semibold mb-1">🌟 Benefícios</h3>
            <ul className="list-disc list-inside mb-3">
              <li>Evite publicações impulsivas ou ofensivas</li>
              <li>Desenvolva consciência emocional online</li>
              <li>Compartilhe mensagens mais positivas</li>
              <li>Entenda melhor como suas palavras afetam os outros</li>
            </ul>

            <h3 className="font-semibold mb-1">💡 Missão</h3>
            <p>
              Tornar a internet um lugar mais empático, responsável e humano —
              ajudando cada usuário a pensar antes de postar. Porque, às vezes,
              tudo o que precisamos é de um pequeno empurrão da nossa própria
              consciência digital.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}
