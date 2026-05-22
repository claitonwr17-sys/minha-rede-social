"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Imagens() {
  const router = useRouter();

  // 📌 FEED REAL DO XANO
  const [imagens, setImagens] = useState([]);

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
    router.push("/feed");
  }

  // 🔥 CARREGAR FEED DO XANO (F5 FUNCIONA AQUI)
  useEffect(() => {
    carregarFeed();
  }, []);

  async function carregarFeed() {
    try {
      const res = await fetch("SUA_URL_DO_XANO/get_imagens");
      const data = await res.json();
      setImagens(data);
    } catch (error) {
      console.log("Erro ao carregar feed:", error);
    }
  }

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>📷 Conrad</div>

        <div style={styles.menu} onClick={() => router.push("/feed")}>
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

      {/* FEED */}
      <div style={styles.feedArea}>
        <h2 style={{ marginBottom: 20 }}>📷 Feed de Imagens</h2>

        {imagens.map((img, index) => (
          <div key={img.id || index} style={styles.card}>
            
            {/* USUÁRIO */}
            <div style={styles.userInfo}>
              <img
                src="/insta.png"
                alt="Perfil"
                style={styles.avatarImage}
              />

              <div>
                <div style={styles.username}>
                  Claiton Wroblewski
                </div>

                <div style={styles.time}>
                  Agora mesmo
                </div>
              </div>
            </div>

            {/* BOTÃO UPLOAD */}
            <label style={styles.uploadButton}>
              📸 Escolher imagem

              <input
                type="file"
                hidden
                onChange={async (e) => {
                  const arquivo = e.target.files?.[0];
                  if (!arquivo) return;

                  const formData = new FormData();
                  formData.append("file", arquivo);

                  try {
                    const resposta = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });

                    const dados = await resposta.json();

                    if (dados.url) {
                      // opcional: aqui depois podemos salvar no Xano
                      console.log("Upload:", dados.url);
                    }
                  } catch (erro) {
                    console.log(erro);
                  }
                }}
              />
            </label>

            {/* IMAGEM REAL DO XANO */}
            <div style={styles.imageBox}>
              {img["URL da imagem"] ? (
                <img
                  src={img["URL da imagem"]}
                  alt="Post"
                  style={styles.postImage}
                />
              ) : (
                "🖼️ Sem imagem"
              )}
            </div>

            {/* AÇÕES */}
            <div style={styles.actions}>
              <button
                style={styles.button}
                onClick={() => curtir(index)}
              >
                👍🏿 Curtir {likes[index] || 0}
              </button>

              <button
                style={styles.button}
                onClick={() => darAmei(index)}
              >
                🖤 Amei {amei[index] || 0}
              </button>

              <button style={styles.button}>
                💬 Comentar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}