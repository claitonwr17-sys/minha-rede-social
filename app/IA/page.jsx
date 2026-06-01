"use client";

import "@fontsource/inter";
import { useRouter } from "next/navigation";
export default function IA() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f5f5f7",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        color: "#111",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 260,
          backgroundColor: "white",
          borderRight: "1px solid #e5e5e5",
          padding: 30,
          position: "fixed",
          height: "100vh",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 50,
          }}
        >
          <img
            src="/logo/logo-simbolo.png"
            alt="Conrad"
            style={{
              width: 46,
              height: 46,
              objectFit: "contain",
            }}
          />

          <h2 style={{ margin: 0, fontSize: 34 }}>Conrad IA</h2>
        </div>

        {/* MENU */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
  style={menuItem}
  onClick={() => router.push("/feed")}
>
  🏠 Home
</div>

          <div style={menuItem}>
            <img
              src="/logo/logo-simbolo.png"
              alt="IA"
              style={{
                width: 24,
                height: 24,
                objectFit: "contain",
              }}
            />

            <span>IA</span>
          </div>

          <div
  style={menuItem}
  onClick={() => router.push("/imagens")}
>
  📰 Feed
</div>
         <div
  style={menuItem}
  onClick={() => router.push("/perfil")}
>
  👤 Perfil
</div>
          <div style={menuItem}>⚙️ Configurações</div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          marginLeft: 260,
          width: "100%",
          padding: 40,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* HERO */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <img
                src="/logo/logo-simbolo.png"
                alt="Conrad"
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "contain",
                }}
              />

              <h1
                style={{
                  fontSize: 58,
                  margin: 0,
                  color: "#111",
                }}
              >
                Conrad – Sua Consciência Digital
              </h1>
            </div>

            <p style={text}>
              Conrad é uma rede social de IA que ajuda você a pensar antes de
              postar.
            </p>

            <p style={text}>
              Ele analisa o sentimento do texto e gera uma resposta
              humanizada.
            </p>

            <p style={text}>
              Com Google Cloud e Gemini AI, funciona como uma consciência
              digital.
            </p>
          </div>

          {/* POR QUE USAR */}
          <div style={card}>
            <h3 style={title}>🌍 Por que usar o Conrad</h3>

            <ul style={list}>
              <li>Um simples post pode gerar grandes impactos</li>
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
              <li>Mais consciência, menos arrependimento</li>
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
        </div>
      </div>
    </div>
  );
}

/* ESTILOS */

const card = {
  backgroundColor: "white",
  padding: 40,
  borderRadius: 24,
  border: "1px solid #e5e5e5",
  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
};

const title = {
  fontSize: 42,
  fontWeight: "bold",
  marginBottom: 20,
  color: "#111",
};

const text = {
  fontSize: 26,
  color: "#444",
  lineHeight: 1.8,
};

const list = {
  fontSize: 24,
  color: "#444",
  lineHeight: 2,
  paddingLeft: 25,
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 28,
  padding: "14px 18px",
  borderRadius: 14,
  cursor: "pointer",
};