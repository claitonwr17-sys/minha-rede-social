"use client";

import { useState } from "react";

export default function Imagens() {
  const [imagem, setImagem] = useState(null);

  function selecionarImagem(e) {
    const file = e.target.files[0];

    if (file) {
      setImagem(URL.createObjectURL(file));
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Feed de Imagens</h1>

      <input
        type="file"
        accept="image/*"
        onChange={selecionarImagem}
      />

      {imagem && (
        <img
          src={imagem}
          alt="Preview"
          style={styles.preview}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 30,
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  title: {
    marginBottom: 20,
  },

  preview: {
    marginTop: 20,
    width: 400,
    borderRadius: 12,
  },
};