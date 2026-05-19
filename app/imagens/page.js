"use client";

import { useState } from "react";

export default function Imagens() {
  const [imagens] = useState([
    "https://picsum.photos/400/400?1",
    "https://picsum.photos/400/400?2",
    "https://picsum.photos/400/400?3",
    "https://picsum.photos/400/400?4",
    "https://picsum.photos/400/400?5",
    "https://picsum.photos/400/400?6",
    "https://picsum.photos/400/400?7",
    "https://picsum.photos/400/400?8",
    "https://picsum.photos/400/400?9",
  ]);

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>📸 Feed de Imagens</h2>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {imagens.map((img, index) => (
          <div key={index} style={styles.card}>
            <img src={img} style={styles.image} />
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#fafafa",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Arial",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    maxWidth: 900,
    margin: "0 auto",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },

  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    display: "block",
  },
};