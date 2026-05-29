"use client";

import "@fontsource/inter";

export default function IA() {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 260,
          padding: 30,
          borderRight: "1px solid #1f1f1f",
          position: "fixed",
          height: "100vh",
        }}
      >
        <h2 style={{ marginBottom: 40 }}>Conrad IA</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>
          <div>🏠 Home</div>
          <div>🧠 IA</div>
          <div>📰 Feed</div>
          <div>👤 Perfil</div>
          <div>⚙️ Configurações</div>
        </div>
      </div>

      {/* CONTEÚDO CENTRAL */}
      <div
        style={{
          marginLeft: 260,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            gap: 25,
          }}
        >
          {/* HERO */}
          <div style={card}>
            <h2 style={{ fontSize: 42, marginBottom: 10 }}>
              🧠 Conrad – Sua Consciência Digital
            </h2>
            <p style={text}>
              Conrad é uma rede social de IA que ajuda você a pensar antes de postar.
              Ele analisa o sentimento do texto e gera uma resposta humanizada.
              Com Google Cloud e Gemini AI, funciona como uma consciência digital.
            </p>
          </div>

          {/* POR QUE USAR */}
          <div style={card}>
            <h3 style={title}>🌍 Por que usar o Conrad</h3>
            <p style={text}>Um simples post pode gerar grandes impactos.</p>
            <ul style={list}>
              <li>Como suas palavras soam para outras pessoas</li>
              <li>Qual emoção seu texto transmite</li>
              <li>Se vale a pena publicar</li>
            </ul>
          </div>

          {/* COMO FUNCIONA */}
          <div style={card}>
            <h3 style={title}>⚙️ Como funciona</h3>
            <ul style={list}>
              <li>Você digita sua postagem</li>
              <li>IA analisa com Google Cloud + Gemini</li>
              <li>Você recebe uma resposta emocional</li>
            </ul>
          </div>

          {/* BENEFÍCIOS */}
          <div style={card}>
            <h3 style={title}>🌟 Benefícios</h3>
            <ul style={list}>
              <li>Evita posts impulsivos</li>
              <li>Aumenta consciência emocional</li>
              <li>Melhora sua comunicação</li>
              <li>Ajuda a entender o impacto das palavras</li>
            </ul>
          </div>

          {/* MISSÃO */}
          <div style={card}>
            <h3 style={title}>💡 Missão</h3>
            <p style={text}>
              Tornar a internet mais empática e humana, ajudando cada pessoa a pensar antes de postar.
            </p>
            <p style={text}>
              💭 Às vezes, só precisamos de um pequeno empurrão da nossa consciência digital.
            </p>
          </div>

          {/* TECNOLOGIAS */}
          <div style={card}>
            <h3 style={title}>⚙️ Tecnologias</h3>
            <ul style={list}>
              <li>Google Cloud Natural Language API</li>
              <li>Gemini AI</li>
              <li>AppGyver + Xano</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ESTILOS FORA DO COMPONENTE (CORRETO) */
const card = {
  backgroundColor: "#0d0d0d",
  padding: 25,
  borderRadius: 16,
  border: "1px solid #1f1f1f",
};

const title = {
  fontSize: 26,
  fontWeight: "bold",
  marginBottom: 15,
};

const text = {
  fontSize: 18,
  color: "#cfcfcf",
  lineHeight: 1.7,
};

const list = {
  fontSize: 18,
  color: "#cfcfcf",
  paddingLeft: 20,
  lineHeight: 1.8,
};