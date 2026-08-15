"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Imagens() {
  const router = useRouter();

  const [imagens, setImagens] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");

  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAberto, setComentariosAberto] = useState(false);

  // =====================================================
  // NOVO: IMAGEM QUE ESTÁ SENDO PREPARADA PARA PUBLICAÇÃO
  // =====================================================
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [publicandoImagem, setPublicandoImagem] = useState(false);

  async function curtir(post) {
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
  }

  async function darAmei(post) {
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
  }

  async function comentar(post) {
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
          comentarios: [...comentariosAtuais, novoComentario],
        }),
      }
    );

    setNovoComentario("");
    carregarFeed();
  }

  function voltarHome() {
    router.push("/feed");
  }

  useEffect(() => {
    carregarFeed();
  }, []);

  async function carregarFeed() {
    const res = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/get_imagens"
    );

    const data = await res.json();

    setImagens(data || []);
  }

  // =====================================================
  // ESCOLHER IMAGEM
  // =====================================================
  async function escolherImagem(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setEnviandoImagem(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        // IMPORTANTE:
        // Aqui NÃO salvamos no Xano ainda.
        // Apenas guardamos a URL da imagem escolhida.
        setImagemSelecionada(data.url);
      } else {
        alert("Não foi possível enviar a imagem.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar a imagem.");
    } finally {
      setEnviandoImagem(false);

      // Permite escolher a mesma imagem novamente depois
      e.target.value = "";
    }
  }

  // =====================================================
// GOOGLE VISION
// =====================================================
async function analisarComVision(imageUrl) {
  try {
    const res = await fetch(
      "https://apis-sentiment-gemini-vision.claitonwr17.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      }
    );

    const data = await res.json();

    console.log("===== RESULTADO DO WORKER =====");
    console.log(data);

    if (!res.ok) {
      throw new Error(
        data.detalhes || "Erro ao chamar o Worker."
      );
    }

    return data;
  } catch (error) {
    console.error("Erro na Google Vision:", error);
    alert("Erro ao analisar a imagem com a Vision.");
    return null;
  }
}

// =====================================================
// PUBLICAR IMAGEM
// =====================================================
async function publicarImagem() {
  if (!imagemSelecionada) {
    alert("Escolha uma imagem primeiro.");
    return;
  }
  try {
    setPublicandoImagem(true);
const resultadoVision = await analisarComVision(imagemSelecionada);

if (!resultadoVision) {
  setPublicandoImagem(false);
  return;
}
    const res = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/salvar_imagem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          URL_da_imagem: imagemSelecionada,
          curtir: 0,
          amei: 0,
          comentarios: [],
        }),
      }
    );

    // Pega exatamente a resposta enviada pelo Xano
    const respostaTexto = await res.text();

    console.log("STATUS XANO:", res.status);
    console.log("RESPOSTA XANO:", respostaTexto);

    if (!res.ok) {
      throw new Error(
        `Xano respondeu ${res.status}: ${respostaTexto}`
      );
    }

    // Limpa a área de publicação
    setImagemSelecionada(null);

    // Atualiza o feed
    await carregarFeed();

    alert("Imagem publicada com sucesso!");

  } catch (error) {
    console.error("ERRO COMPLETO AO PUBLICAR:", error);

    alert(
      "Erro ao publicar a imagem.\n\n" +
      error.message
    );

  } finally {
    setPublicandoImagem(false);
  }
}

  // =====================================================
  // CANCELAR IMAGEM
  // =====================================================
  function cancelarImagem() {
    setImagemSelecionada(null);
  }

  return (
    <div style={styles.page}>

      {/* =================================================
          SIDEBAR
      ================================================== */}
      <div style={styles.sidebar}>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: "bold",
            fontSize: 28,
          }}
        >
          <img
            src="/logo/logo-simbolo.png"
            alt="Logo"
            style={{
              width: 35,
              height: 35,
              objectFit: "contain",
            }}
          />

          <span>Conrad</span>
        </div>

        <div
          style={styles.menu}
          onClick={() => router.push("/feed")}
        >
          🏠 Home
        </div>

        <div
          style={{
            ...styles.menu,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
          onClick={() => router.push("/IA")}
        >
          <img
            src="/logo/logo-simbolo.png"
            alt="IA"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />

          <span>IA</span>
        </div>

        <div
          style={styles.menu}
          onClick={() => router.push("/feed")}
        >
          📰 Feed
        </div>

        <div
          style={styles.menu}
          onClick={() => router.push("/perfil")}
        >
          👤 Perfil
        </div>

        <button
          style={styles.logout}
          onClick={voltarHome}
        >
          Sair
        </button>

      </div>

      {/* =================================================
          ÁREA PRINCIPAL
      ================================================== */}
      <div style={styles.feedArea}>

        {/* =================================================
            ÁREA DE PUBLICAÇÃO
            FICA FORA DOS POSTS DO FEED
        ================================================== */}
        <div style={styles.composer}>

          {/* USUÁRIO */}
          <div style={styles.userInfo}>

            <img
              src="/insta.png"
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

          {/* BOTÃO ESCOLHER IMAGEM */}
          <div style={styles.composerButtons}>

            <label style={styles.uploadButton}>
              📸 Escolher imagem

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={escolherImagem}
              />
            </label>

          </div>

          {/* =================================================
              CARREGANDO IMAGEM
          ================================================== */}
          {enviandoImagem && (
            <div style={styles.loadingText}>
              ⏳ Enviando imagem...
            </div>
          )}

          {/* =================================================
              PREVIEW DA IMAGEM ESCOLHIDA
          ================================================== */}
          {imagemSelecionada && (
            <div style={styles.previewArea}>

              <img
                src={imagemSelecionada}
                alt="Imagem selecionada"
                style={styles.previewImage}
              />

              {/* BOTÕES */}
              <div style={styles.publishArea}>

                <button
                  style={styles.cancelButton}
                  onClick={cancelarImagem}
                  disabled={publicandoImagem}
                >
                  Cancelar
                </button>

                <button
                  style={styles.postButton}
                  onClick={publicarImagem}
                  disabled={publicandoImagem}
                >
                  {publicandoImagem
                    ? "Publicando..."
                    : "Publicar"}
                </button>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            FEED DE IMAGENS PUBLICADAS
        ================================================== */}
        {imagens.map((img, index) => (

          <div
            key={index}
            style={styles.card}
          >

            {/* USUÁRIO */}
            <div style={styles.userInfo}>

              <img
                src="/insta.png"
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

            {/* =================================================
                IMAGEM
            ================================================== */}
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

            {/* =================================================
                AÇÕES
            ================================================== */}
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

      {/* =================================================
          MODAL COMENTÁRIOS
      ================================================== */}
      {comentariosAberto && postSelecionado && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalTop}>

              <h3>
                Comentários
              </h3>

              <button
                style={styles.closeButton}
                onClick={() => setComentariosAberto(false)}
              >
                ✖
              </button>

            </div>

            <div style={styles.commentsList}>

              {postSelecionado.comentarios?.length > 0 ? (

                postSelecionado.comentarios.map((c, i) => (

                  <div
                    key={i}
                    style={styles.comment}
                  >
                    💬 {c}
                  </div>

                ))

              ) : (

                <p>
                  Sem comentários ainda.
                </p>

              )}

            </div>

            <div style={styles.commentArea}>

              <input
                value={novoComentario}
                onChange={(e) =>
                  setNovoComentario(e.target.value)
                }
                placeholder="Digite um comentário..."
                style={styles.input}
              />

              <button
                style={styles.button}
                onClick={() =>
                  comentar(postSelecionado)
                }
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


/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {
    display: "flex",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },

  sidebar: {
    width: 220,
    background: "#fff",
    padding: 30,
    position: "fixed",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  logo: {
    fontWeight: "bold",
    marginBottom: 30,
  },

  menu: {
    padding: 10,
    cursor: "pointer",
  },

  logout: {
    marginTop: 20,
    background: "black",
    color: "white",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  feedArea: {
    marginLeft: 240,
    paddingTop: 40,
    paddingBottom: 40,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  /* ===================================================
     NOVO COMPOSER
     FICA SEPARADO DOS POSTS
  =================================================== */

  composer: {
    background: "#fff",
    width: 520,
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },

  composerButtons: {
    display: "flex",
    alignItems: "center",
    marginTop: 15,
  },

  uploadButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  loadingText: {
    marginTop: 15,
    color: "#666",
    fontSize: 14,
  },

  previewArea: {
    marginTop: 15,
  },

  previewImage: {
    width: "100%",
    maxHeight: 700,
    objectFit: "contain",
    display: "block",
    borderRadius: 12,
    background: "#eee",
  },

  publishArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },

  cancelButton: {
    background: "#f0f2f5",
    color: "#000",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  postButton: {
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  /* ===================================================
     POSTS PUBLICADOS
  =================================================== */

  card: {
    background: "#fff",
    width: 520,
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },

  userInfo: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: "50%",
  },

  username: {
    fontWeight: "bold",
  },

  time: {
    fontSize: 12,
    color: "gray",
  },

  imageBox: {
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eee",
    borderRadius: 12,
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    maxHeight: 700,
    objectFit: "contain",
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 10,
  },

  button: {
    background: "#f0f2f5",
    padding: 10,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    color: "black",
  },

  /* ===================================================
     MODAL
  =================================================== */

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: 400,
    background: "white",
    borderRadius: 16,
    padding: 20,
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
  },

  commentsList: {
    maxHeight: 300,
    overflowY: "auto",
    marginBottom: 15,
  },

  commentArea: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
  },

  comment: {
    background: "#f0f2f5",
    padding: 8,
    marginTop: 5,
    borderRadius: 8,
  },
};