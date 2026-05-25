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

  // 🔥 CARREGAR FEED DO XANO
  useEffect(() => {
    carregarFeed();
  }, []);

  async function carregarFeed() {
    try {
      const res = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/get_imagens"
      );

      const data = await res.json();

      console.log("DADOS XANO:", data);

      setImagens(data.data || data || []);
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

        {Array.isArray(imagens) &&
          imagens.map((img, index) => {
            console.log("OBJETO XANO:", img);

            return (
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
                        // 🔥 UPLOAD CLOUDINARY
                        const resposta = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });

                        const dados = await resposta.json();

                        console.log("Upload:", dados.url);

                        if (dados.url) {

                          // 🔥 SALVAR NO XANO
                          await fetch(
                            "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/analisar_imagem",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                "URL da imagem": dados.url,
                              }),
                            }
                          );

                          // 🔥 MOSTRAR IMAGEM NA HORA
                          setImagens((prev) => [
                            {
                              "URL da imagem": dados.url,
                            },
                            ...prev,
                          ]);
                        }
                      } catch (erro) {
                        console.log("Erro upload:", erro);
                      }
                    }}
                  />
                </label>

                {/* IMAGEM */}
                <div style={styles.imageBox}>
                  {img.imagens?.length > 0 ? (
                    <div style={styles.gridImages}>
                      {img.imagens.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Post"
                          style={styles.gridImg}
                        />
                      ))}
                    </div>
                  ) : img["URL da imagem"] ||
                    img.url ||
                    img.imagem ? (
                    <img
                      src={
                        img["URL da imagem"] ||
                        img.url ||
                        img.imagem
                      }
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
            );
          })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },

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

  userInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: 12,
  },

  username: {
    fontWeight: "bold",
    fontSize: 15,
  },

  time: {
    fontSize: 12,
    color: "gray",
  },

  uploadButton: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    display: "inline-block",
    marginBottom: 12,
    fontWeight: "bold",
  },

  imageBox: {
    height: 280,
    backgroundColor: "#ddd",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  gridImages: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    width: "100%",
    height: "100%",
  },

  gridImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
  },

  button: {
    backgroundColor: "#f0f2f5",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
};