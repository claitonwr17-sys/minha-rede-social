"use client";

import "@fontsource/inter";

export default function IA() {
  return (
    <div
      style={{
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        padding: 40,
      }}
    >
      {/* LOGO NO CANTO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 50,
        }}
      >
        <img
          src="/logo/logo-simbolo.png"
          alt="Conrad"
          style={{
            width: 55,
            height: 55,
            objectFit: "contain",
          }}
        />

        <h1
          style={{
            fontSize: 36,
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Conrad IA
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          lineHeight: 1.8,
        }}
      >
        <h2
          style={{
            fontSize: 52,
            marginBottom: 10,
          }}
        >
          Olá Claiton
        </h2>

        <p
          style={{
            fontSize: 28,
            color: "#b3b3b3",
            marginBottom: 50,
          }}
        >
          Eu sou o Conrad IA
        </p>

        <h3 style={styles.title}>
          Conrad – Sua Consciência Digital
        </h3>

        <p style={styles.text}>
          Conrad é uma rede social de inteligência artificial criado
          para ajudar você a pensar antes de postar. O app analisa
          o sentimento e o tom emocional das suas postagens —
          identificando se são positivas, negativas ou neutras —
          e oferece uma resposta humanizada, ajudando você a refletir
          sobre o impacto das suas palavras antes de compartilhá-las.
        </p>

        <p style={styles.text}>
          Com a tecnologia do Google Cloud e Gemini AI, o Conrad
          atua como uma espécie de “consciência digital”, um amigo
          que te ajuda a se expressar melhor nas redes sociais.
        </p>

        <h3 style={styles.title}>
          🌍 Por que usar o Conrad
        </h3>

        <p style={styles.text}>
          Vivemos em um mundo em que um simples post pode gerar
          grandes consequências.
        </p>

        <p style={styles.text}>
          O Conrad ajuda você a entender:
        </p>

        <ul style={styles.list}>
          <li>Como suas palavras podem soar para os outros;</li>
          <li>O tipo de emoção que seu texto transmite;</li>
          <li>
            E se vale a pena realmente publicar o que você escreveu.
          </li>
        </ul>

        <h3 style={styles.title}>
          ⚙️ Como funciona
        </h3>

        <ul style={styles.list}>
          <li>Digite ou cole sua postagem no app;</li>
          <li>
            A IA do Conrad analisa o texto usando o Google Cloud
            Natural Language API e Gemini;
          </li>
          <li>
            Você recebe uma resposta humanizada, refletindo o
            sentimento predominante e o impacto do texto.
          </li>
        </ul>

        <h3 style={styles.title}>
          🌟 Benefícios
        </h3>

        <ul style={styles.list}>
          <li>Evite publicações impulsivas ou ofensivas;</li>
          <li>Desenvolva consciência emocional online;</li>
          <li>Compartilhe mensagens mais positivas;</li>
          <li>
            Entenda melhor como suas palavras afetam os outros.
          </li>
        </ul>

        <h3 style={styles.title}>
          💡 Missão
        </h3>

        <p style={styles.text}>
          O Conrad nasceu para tornar a internet um lugar mais
          empático, responsável e humano — ajudando cada usuário
          a pensar antes de postar.
        </p>

        <p style={styles.text}>
          Porque, às vezes, tudo o que precisamos é de um pequeno
          empurrão da nossa própria consciência digital. 💭
        </p>

        <h3 style={styles.title}>
          ⚙️ Tecnologias
        </h3>

        <ul style={styles.list}>
          <li>
            Google Cloud Natural Language API – para análise de
            sentimento;
          </li>

          <li>
            Gemini AI – para respostas naturais e empáticas;
          </li>

          <li>
            AppGyver + Xano – infraestrutura do aplicativo.
          </li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },

  text: {
    fontSize: 20,
    color: "#d1d1d1",
    marginBottom: 20,
  },

  list: {
    fontSize: 20,
    color: "#d1d1d1",
    paddingLeft: 30,
    lineHeight: 2,
  },
};