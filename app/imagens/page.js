"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Imagens() {
  const router = useRouter();

  const imagens = [1, 2, 3, 4, 5];

  const [likes, setLikes] = useState({});
  const [amei, setAmei] = useState({});

  function curtir(index) {
    setLikes((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    }));
  }

  function darAmei(index) {
    setAmei((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    }));
  }

  function voltarHome() {
    router.push("/");
  }

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>📷 Conrad</div>

        <div style={styles.menu} onClick={() => router.push("/")}>
          🏠 Home
        </div>
        <div style={styles.menu} onClick={() => router.push("/ia")}>
          🤖 IA
        </div>
        <div style={styles.menu} onClick={() => router.push("/feed")}>
          📰 Feed
        </div>
        <div style={styles.menu} onClick={() => router.push("/perfil")}>
          👤 Perfil
        </div>

        <button style={styles.logout} onClick={voltarHome}>
          Sair
        </button>
      </div>

      {/* FEED CENTRAL */}
      <div style={styles.feedArea}>
        <h2 style={{ marginBottom: 20 }}>📷 Feed de Imagens</h2>

        {imagens.map((img, index) => (
          <div key={index} style={styles.card}>
            {/* IMAGEM */}
            <div style={styles.imageBox}>🖼️ Imagem vazia</div>

            {/* AÇÕES */}
            <div style={styles.actions}>
             <button
  style={styles.blackButton}
  onClick={() => curtir(index)}
>
  👍 Curtir {likes[index] || 0}
</button>

<button
  style={styles.blackButton}
  onClick={() => darAmei(index)}
>
  ❤️ Amei {amei[index] || 0}
</button>
<button style={styles.button}>
  💬 Comentar
</button>
const styles = {
  page: {
    display: "flex",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },

  /* SIDEBAR */
  sidebar: {
    width: 220,
    backgroundColor: "white",
    height: "100vh",
    padding: 20,
    borderRight: "1px solid #ddd",
    position: "fixed",
  },

  logo: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 30,
  },

  menu: {
    padding: 12,
    cursor: "pointer",
    borderRadius: 8,
    marginBottom: 10,
    transition: "0.2s",
  },

  logout: {
    marginTop: 20,
    backgroundColor: "black",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    width: "100%",
  },

  /* FEED */
  feedArea: {
    marginLeft: 240,
    paddingTop: 80,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  card: {
    backgroundColor: "white",
    width: 500,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  imageBox: {
    height: 280,
    backgroundColor: "#ddd",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
  },

  button: {
    backgroundColor: "#f0f2f5",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
};
