"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Imagens() {
  const router = useRouter();

  const [imagens, setImagens] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");

  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAberto, setComentariosAberto] = useState(false);

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
      if (!novoComentario.trim()) return;

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
        {imagens.map((img, index) => (
          <div key={img.id || index} style={styles.card}>
            
            {/* USUÁRIO */}
            <div style={styles.userInfo}>
              <img src="/insta.png" style={styles.avatarImage} />
              <div>
                <div style={styles.username}>Claiton Wroblewski</div>
                <div style={styles.time}>Agora mesmo</div>
              </div>
            </div>

            {/* IMAGEM */}
            <div style={styles.imageBox}>
              <img
                src={
                  img.image_url ||
                  img["URL da imagem"] ||
                  img.url ||
                  img.imagem
                }
                style={styles.postImage}
              />
            </div>

            {/* AÇÕES */}
            <div style={styles.actions}>
              <button onClick={() => curtir(img)} style={styles.button}>
                👍 Curtir {img.curtir || 0}
              </button>

              <button onClick={() => darAmei(img)} style={styles.button}>
                🖤 Amei {img.amei || 0}
              </button>

              <button
                style={styles.button}
                onClick={() => {
                  setPostSelecionado(img);
                  setComentariosAberto(true);
                }}
              >
                💬 {img.comentarios?.length || 0}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL COMENTÁRIOS */}
      {comentariosAberto && postSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Comentários</h3>
              <button onClick={() => setComentariosAberto(false)}>
                X
              </button>
            </div>

            <div>
              {postSelecionado.comentarios?.map((c, i) => (
                <div key={i} style={styles.comment}>
                  💬 {c}
                </div>
              ))}
            </div>

            <div style={styles.commentArea}>
              <input
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                style={styles.input}
                placeholder="Escreva um comentário..."
              />

              <button
                style={styles.button}
                onClick={() => comentar(postSelecionado)}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

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
  menu: { padding: 12, cursor: "pointer", marginBottom: 10 },
  logout: {
    marginTop: 20,
    backgroundColor: "black",
    color: "white",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  feedArea: {
    marginLeft: 240,
    paddingTop: 80,
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
  },
  userInfo: { display: "flex", marginBottom: 10 },
  avatarImage: { width: 40, height: 40, borderRadius: "50%" },
  username: { fontWeight: "bold" },
  time: { fontSize: 12, color: "gray" },
  imageBox: { height: 280, overflow: "hidden" },
  postImage: { width: "100%", height: "100%", objectFit: "cover" },
  actions: { display: "flex", justifyContent: "space-around" },
  button: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 10,
    border: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: 500,
    height: "70vh",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  comment: {
    backgroundColor: "#f0f2f5",
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
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
};