"use client";

import { useState } from "react";

export default function Imagens() {
  const imagens = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
  ];

  const [likes, setLikes] = useState({});

  function curtir(index) {
    setLikes((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    }));
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>📷 Feed de Imagens</h2>

      <div style={styles.feed}>
        {imagens.map((img, index) => (
          <div key={index} style={styles.card}>
            
            <div style={styles.imageBox}>
              <span>Imagem vazia</span>
            </div>

            <div style={styles.actions}>
              <button onClick={() => curtir(index)}>👍 Curtir {likes[index] || 0}</button>
              <button>❤️ Amei</button>
              <button>💬 Comentar</button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 80,
    background: "#f0f2f5",
    minHeight: "100vh",
  },

  title: {
    marginBottom: 20,
  },

  feed: {
    width: "100%",
    maxWidth: 500,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  card: {
    background: "white",
    borderRadius: 16,
    padding: 15,
  },

  imageBox: {
    height: 300,
    background: "#ddd",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
  },
};