"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Imagens() {
  const router = useRouter();

  const [imagens, setImagens] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");

  async function curtir(post) {
    try {
      await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/Reagir_a_iamgens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            curtir: (post.curtir || 0) + 1,
            amei: post.amei || 0,
            comentarios: post.comentarios || [],
          }),
        }
      );

      carregarFeed();
    } catch (error) {
      console.log("Erro ao curtir:", error);
    }
  }

  async function darAmei(post) {
    try {
      await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/Reagir_a_iamgens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            curtir: post.curtir || 0,
            amei: (post.amei || 0) + 1,
            comentarios: post.comentarios || [],
          }),
        }
      );

      carregarFeed();
    } catch (error) {
      console.log("Erro ao amei:", error);
    }
  }

  async function comentar(post) {
    try {
      if (!novoComentario || !novoComentario.trim()) return;

      const comentariosAtuais = post.comentarios || [];

      await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/Reagir_a_iamgens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            curtir: post.curtir || 0,
            amei: post.amei || 0,
            comentarios: [...comentariosAtuais, novoComentario.trim()],
          }),
        }
      );

      setNovoComentario("");
      carregarFeed();
    } catch (error) {
      console.log("Erro ao comentar:", error);
    }
  }

  function voltarHome() {
    router.push("/feed");
  }

  useEffect(() => {
    carregarFeed();
  }, []);

  async function carregarFeed() {
    try {
      const res = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/get_imagens"
      );

      const data = await res.json();

      const imagensUnicas = [
        ...new Map(
          (data || []).map((item) => [
            item.image_url ||
              item["URL da imagem"] ||
              item.url ||
              item.imagem,
            item,
          ])
        ).values(),
      ];

      setImagens(imagensUnicas);
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
        {Array.isArray(imagens) &&
          imagens.map((img, index) => (
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
                  <div style={styles.time}>Agora mesmo</div>
                </div>
              </div>

              {/* BOTÃO UPLOAD (AGORA DENTRO DO POST) */}
              <label style={styles.uploadButton}>
                📸 Escolher imagem
                <input
                  type="file"
                  hidden
                  onChange={async (e) => {
                    if (enviando) return;
                    setEnviando(true);

                    const arquivo = e.target.files?.[0];
                    if (!arquivo) {
                      setEnviando(false);
                      return;
                    }

                    const formData = new FormData();
                    formData.append("file", arquivo);

                    try {
                      const resposta = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const dados = await resposta.json();

                      if (dados.url) {
                        await fetch(
                          "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/salvar_imagem",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              "URL da imagem": dados.url,
                              curtir: 0,
                              amei: 0,
                              comentarios: [],
                            }),
                          }
                        );

                        carregarFeed();
                      }
                    } catch (erro) {
                      console.log("Erro upload:", erro);
                    }

                    setEnviando(false);
                  }}
                />
              </label>

              {/* IMAGEM */}
              <div style={styles.imageBox}>
                {img.image_url ||
                img["URL da imagem"] ||
                img.url ||
                img.imagem ? (
                  <img
                    src={
                      img.image_url ||
                      img["URL da imagem"] ||
                      img.url ||
                      img.imagem
                    }
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
                  onClick={() => curtir(img)}
                >
                  👍🏿 Curtir {img.curtir || 0}
                </button>

                <button
                  style={styles.button}
                  onClick={() => darAmei(img)}
                >
                  🖤 Amei {img.amei || 0}
                </button>

                <button style={styles.button}>💬</button>
              </div>

              {/* COMENTÁRIOS */}
              <div style={styles.commentBox}>
                <div style={styles.commentArea}>
                  <input
                    type="text"
                    placeholder="Digite um comentário..."
                    value={novoComentario}
                    onChange={(e) =>
                      setNovoComentario(e.target.value)
                    }
                    style={styles.input}
                  />

                  <button
                    style={styles.button}
                    onClick={() => comentar(img)}
                  >
                    Enviar
                  </button>
                </div>

                <div style={{ marginTop: 10 }}>
                  {img.comentarios?.map((comentario, i) => (
                    <div key={i} style={styles.comment}>
                      💬 {comentario}
                    </div>
                  ))}
                </div>
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
  logo: { fontWeight: "bold", fontSize: 18, marginBottom: 30 },
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
  userInfo: { display: "flex", alignItems: "center", marginBottom: 12 },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    marginRight: 12,
  },
  username: { fontWeight: "bold", fontSize: 15 },
  time: { fontSize: 12, color: "gray" },
  uploadButton: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    display: "inline-block",
    marginBottom: 15,
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
  postImage: { width: "100%", height: "100%", objectFit: "cover" },
  actions: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#f0f2f5",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
  commentArea: {
    display: "flex",
    gap: 10,
    marginTop: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
  },
  comment: {
    backgroundColor: "#f0f2f5",
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
};