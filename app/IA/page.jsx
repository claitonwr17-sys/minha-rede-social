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
          }}
        >
          <h2 style={{ fontSize: 52, marginBottom: 10 }}>
            Olá Claiton
          </h2>

          <p style={{ fontSize: 28, color: "#b3b3b3" }}>
            Eu sou o Conrad IA
          </p>

          <h3 style={styles.title}>Conrad – Sua Consciência Digital</h3>

          <p style={styles.text}>
            Conrad é uma rede social de inteligência artificial criado
            para ajudar você a pensar antes de postar...
          </p>

          <p style={styles.text}>
            Com a tecnologia do Google Cloud e Gemini AI...
          </p>

          <h3 style={styles.title}>🌍 Por que usar o Conrad</h3>

          <p style={styles.text}>
            Vivemos em um mundo em que um simples post pode gerar grandes consequências.
          </p>
        </div>
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
    lineHeight: 1.8,
  },
};