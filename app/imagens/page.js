
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const XANO_BASE =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3";

export default function Imagens() {
  const router = useRouter();

  const [imagens, setImagens] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");

  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAberto, setComentariosAberto] = useState(false);

  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [publicandoImagem, setPublicandoImagem] = useState(false);

  const [respostaConradAI, setRespostaConradAI] = useState("");
  const [analisandoImagem, setAnalisandoImagem] = useState(false);

  const [perfilAtual, setPerfilAtual] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroFeed, setErroFeed] = useState("");

  // =====================================================
  // IDENTIFICAR USUÁRIO AUTENTICADO
  // =====================================================

  function obterToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  }

  async function carregarPerfilAtual() {
    try {
      setCarregandoPerfil(true);

      const token = obterToken();

      if (!token) {
        setPerfilAtual(null);
        router.replace("/");
        return;
      }

      const res = await fetch(`${XANO_BASE}/meu_perfil`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.replace("/");
        return;
      }

      if (!res.ok) {
        throw new Error(
          `Não foi possível carregar seu perfil. Código: ${res.status}`
        );
      }

      const dados = await res.json();

      if (!dados || !dados.users_id) {
        throw new Error(
          "O Xano não retornou um perfil válido."
        );
      }

      setPerfilAtual(dados);
    } catch (erro) {
      console.error("Erro ao carregar perfil:", erro);
      setErroFeed(
        erro.message || "Erro ao carregar perfil."
      );
    } finally {
      setCarregandoPerfil(false);
    }
  }

  // =====================================================
  // OBTER FOTO DE PERFIL
  // =====================================================

  function obterUrlFoto(valor) {
    if (!valor) return "";

    if (typeof valor === "string") {
      return valor.trim();
    }

    if (typeof valor === "object") {
      return (
        valor.url ||
        valor.path ||
        valor.image_url ||
        ""
      );
    }

    return "";
  }

  // =====================================================
  // EXTRAIR PERFIL ASSOCIADO À PUBLICAÇÃO
  // =====================================================

  function obterPerfilDaImagem(img) {
    if (!img) return null;

    if (Array.isArray(img._perfis) && img._perfis.length > 0) {
      return img._perfis[0];
    }

    if (img._perfis && !Array.isArray(img._perfis)) {
      return img._perfis;
    }

    if (Array.isArray(img.perfis) && img.perfis.length > 0) {
      return img.perfis[0];
    }

    if (img.perfil && typeof img.perfil === "object") {
      return img.perfil;
    }

    return null;
  }

  function obterIdAutor(img) {
    return (
      img?.id_do_usuário ??
      img?.usuario_id ??
      img?._usuario_id ??
      null
    );
  }

  function obterAutorImagem(img) {
    const perfilPost = obterPerfilDaImagem(img);

    if (perfilPost) {
      return {
        nome: perfilPost.nome || "Usuário",
        foto: obterUrlFoto(perfilPost.foto_perfil),
      };
    }

    // Caso seja uma publicação do usuário conectado,
    // podemos utilizar seu perfil já autenticado.
    if (
      perfilAtual &&
      obterIdAutor(img) != null &&
      Number(obterIdAutor(img)) ===
        Number(perfilAtual.users_id)
    ) {
      return {
        nome: perfilAtual.nome || "Usuário",
        foto: obterUrlFoto(perfilAtual.foto_perfil),
      };
    }

    return {
      nome: "Usuário",
      foto: "",
    };
  }

  // =====================================================
  // COMPONENTE DE AVATAR
  // =====================================================

  function Avatar({ foto }) {
    if (foto) {
      return (
        <img
          src={foto}
          alt="Foto de perfil"
          style={styles.avatarImage}
        />
      );
    }

    return (
      <div style={styles.avatarVazio}>
        👤
      </div>
    );
  }

  // =====================================================
  // CURTIR
  // =====================================================

  async function curtir(post) {
    try {
      const res = await fetch(
        `${XANO_BASE}/Reagir_a_iamgens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.id,
            curtir: (post.curtir || 0) + 1,
            amei: post.amei || 0,
            comentarios: post.comentarios || [],
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao curtir imagem.");
      }

      await carregarFeed();
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível curtir a imagem.");
    }
  }

  // =====================================================
  // AMEI
  // =====================================================

  async function darAmei(post) {
    try {
      const res = await fetch(
        `${XANO_BASE}/Reagir_a_iamgens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.id,
            curtir: post.curtir || 0,
            amei: (post.amei || 0) + 1,
            comentarios: post.comentarios || [],
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao reagir à imagem.");
      }

      await carregarFeed();
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível reagir à imagem.");
    }
  }

  // =====================================================
  // COMENTAR
  // =====================================================

  async function comentar(post) {
    if (!novoComentario.trim()) return;

    try {
      const comentariosAtuais = post.comentarios || [];

      const res = await fetch(
        `${XANO_BASE}/Reagir_a_iamgens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.id,
            curtir: post.curtir || 0,
            amei: post.amei || 0,
            comentarios: [
              ...comentariosAtuais,
              novoComentario.trim(),
            ],
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar comentário.");
      }

      setNovoComentario("");

      await carregarFeed();

      setPostSelecionado((anterior) => ({
        ...anterior,
        comentarios: [
          ...comentariosAtuais,
          novoComentario.trim(),
        ],
      }));
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível enviar o comentário.");
    }
  }

  // =====================================================
  // VOLTAR PARA HOME
  // =====================================================

  function voltarHome() {
    router.push("/feed");
  }

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    carregarPerfilAtual();
    carregarFeed();
  }, []);

  // =====================================================
  // CARREGAR FEED DE IMAGENS
  // =====================================================

  async function carregarFeed() {
    try {
      setErroFeed("");

      const res = await fetch(
        `${XANO_BASE}/get_imagens`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Erro ao carregar imagens. Código: ${res.status}`
        );
      }

      const data = await res.json();

      let lista = [];

      if (Array.isArray(data)) {
        lista = data;
      } else if (Array.isArray(data?.items)) {
        lista = data.items;
      } else if (Array.isArray(data?.result)) {
        lista = data.result;
      }

      setImagens(lista);
    } catch (erro) {
      console.error("Erro ao carregar Feed:", erro);
      setErroFeed(
        erro.message || "Não foi possível carregar as imagens."
      );
    }
  }

  // =====================================================
  // ESCOLHER IMAGEM
  // =====================================================

  async function escolherImagem(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      e.target.value = "";
      return;
    }

    try {
      setEnviandoImagem(true);
      setRespostaConradAI("");
      setImagemSelecionada(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(
          `Erro no upload. Código: ${res.status}`
        );
      }

      const data = await res.json();

      if (data.url) {
        setImagemSelecionada(data.url);

        setAnalisandoImagem(true);

        try {
          const resultadoIA = await analisarComVision(
            data.url
          );

          const textoIA =
            resultadoIA?.gemini?.candidates?.[0]
              ?.content?.parts?.[0]?.text;

          if (textoIA) {
            setRespostaConradAI(textoIA);
          } else {
            setRespostaConradAI(
              "A IA do Conrad não conseguiu gerar uma análise."
            );
          }
        } finally {
          setAnalisandoImagem(false);
        }
      } else {
        alert("Não foi possível enviar a imagem.");
      }
    } catch (error) {
      console.error(error);
      alert(
        error.message || "Erro ao enviar a imagem."
      );
    } finally {
      setEnviandoImagem(false);
      e.target.value = "";
    }
  }

  // =====================================================
  // GOOGLE VISION / CONRAD AI
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
      console.error(
        "Erro na Google Vision:",
        error
      );

      alert(
        "Erro ao analisar a imagem com a Vision."
      );

      return null;
    }
  }

  // =====================================================
  // PUBLICAR IMAGEM COM USUÁRIO AUTENTICADO
  // =====================================================

  async function publicarImagem() {
    if (!imagemSelecionada) {
      alert("Escolha uma imagem primeiro.");
      return;
    }

    if (!perfilAtual?.users_id) {
      alert(
        "Não foi possível identificar sua conta. Atualize a página e tente novamente."
      );
      return;
    }

    const token = obterToken();

    if (!token) {
      alert(
        "Sua sessão expirou. Entre novamente."
      );
      router.push("/");
      return;
    }

    try {
      setPublicandoImagem(true);

      const resultadoVision =
        await analisarComVision(imagemSelecionada);

      if (!resultadoVision) {
        return;
      }

      console.log(
        "===== CHAMANDO SALVAR_IMAGEM ====="
      );

      console.log(
        "Imagem enviada:",
        imagemSelecionada
      );

      const res = await fetch(
        `${XANO_BASE}/salvar_imagem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            URL_da_imagem: imagemSelecionada,
          }),
        }
      );

      const respostaTexto = await res.text();

      console.log(
        "STATUS XANO:",
        res.status
      );

      console.log(
        "RESPOSTA XANO:",
        respostaTexto
      );

      if (res.status === 401) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      if (!res.ok) {
        throw new Error(
          `Xano respondeu ${res.status}: ${respostaTexto}`
        );
      }

      setImagemSelecionada(null);
      setRespostaConradAI("");

      await carregarFeed();

      alert(
        "Imagem publicada com sucesso!"
      );
    } catch (error) {
      console.error(
        "ERRO COMPLETO AO PUBLICAR:",
        error
      );

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
    setRespostaConradAI("");
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  const autorAtual = {
    nome: perfilAtual?.nome || "Usuário",
    foto: obterUrlFoto(perfilAtual?.foto_perfil),
  };

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

        <div
          style={styles.menu}
          onClick={() => router.push("/feed-videos")}
        >
          🎬 Feed de vídeos
        </div>

        <div
          style={styles.menu}
          onClick={() =>
            router.push("/politica-de-privacidade")
          }
        >
          🔒 Política de Privacidade
        </div>

        <div
          style={styles.menu}
          onClick={() =>
            router.push("/termos-de-uso")
          }
        >
          📜 Termos de Uso
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
        ================================================== */}
        <div style={styles.composer}>
          <div style={styles.userInfo}>
            <Avatar foto={autorAtual.foto} />

            <div>
              <div style={styles.username}>
                {carregandoPerfil
                  ? "Carregando perfil..."
                  : autorAtual.nome}
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
                disabled={
                  enviandoImagem ||
                  publicandoImagem ||
                  carregandoPerfil
                }
                onChange={escolherImagem}
              />
            </label>
          </div>

          {/* CARREGANDO IMAGEM */}
          {enviandoImagem && (
            <div style={styles.loadingText}>
              ⏳ Enviando imagem...
            </div>
          )}

          {/* ERRO DO FEED */}
          {erroFeed && (
            <div style={styles.erroFeed}>
              {erroFeed}
            </div>
          )}

          {/* PREVIEW */}
          {imagemSelecionada && (
            <div style={styles.previewArea}>
              <img
                src={imagemSelecionada}
                alt="Imagem selecionada"
                style={styles.previewImage}
              />

              {/* CONRAD AI */}
              {analisandoImagem ? (
                <div style={styles.aiBox}>
                  <img
                    src="/logo/conrad-ai.png"
                    alt="Conrad AI"
                    style={{
                      width: 42,
                      height: 42,
                      objectFit: "contain",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Conrad AI
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color: "#666",
                        fontSize: 14,
                      }}
                    >
                      Analisando sua imagem...
                    </div>
                  </div>
                </div>
              ) : respostaConradAI ? (
                <div style={styles.aiBox}>
                  <strong style={{ fontSize: 17 }}>
                    Conrad AI
                  </strong>

                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                      fontSize: 15,
                      color: "#222",
                      marginTop: 12,
                    }}
                  >
                    {respostaConradAI}
                  </div>
                </div>
              ) : null}

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
                  disabled={
                    publicandoImagem ||
                    enviandoImagem ||
                    analisandoImagem ||
                    carregandoPerfil ||
                    !perfilAtual
                  }
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
        {imagens.map((img, index) => {
          const autor = obterAutorImagem(img);

          return (
            <div
              key={img.id || index}
              style={styles.card}
            >
              {/* AUTOR DA IMAGEM */}
              <div style={styles.userInfo}>
                <Avatar foto={autor.foto} />

                <div>
                  <div style={styles.username}>
                    {autor.nome}
                  </div>

                  <div style={styles.time}>
                    Publicação
                  </div>
                </div>
              </div>

              {/* IMAGEM */}
              <div style={styles.imageBox}>
                {img.image_url ||
                img["URL da imagem"] ||
                img.url ||
                img.imagem ||
                img.url_da_imagem ? (
                  <img
                    src={
                      img.image_url ||
                      img["URL da imagem"] ||
                      img.url ||
                      img.imagem ||
                      img.url_da_imagem
                    }
                    alt="Imagem publicada"
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
          );
        })}
      </div>

      {/* =================================================
          MODAL DE COMENTÁRIOS
      ================================================== */}
      {comentariosAberto && postSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTop}>
              <h3>Comentários</h3>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setComentariosAberto(false)
                }
              >
                ✖
              </button>
            </div>

            <div style={styles.commentsList}>
              {postSelecionado.comentarios?.length > 0 ? (
                postSelecionado.comentarios.map(
                  (c, i) => (
                    <div
                      key={i}
                      style={styles.comment}
                    >
                      💬 {c}
                    </div>
                  )
                )
              ) : (
                <p>Sem comentários ainda.</p>
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

// =====================================================
// ESTILOS
// =====================================================

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
    top: 0,
    left: 0,
    height: "100vh",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 18,
    overflowY: "auto",
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

  composer: {
    background: "#fff",
    width: 520,
    maxWidth: "calc(100% - 30px)",
    boxSizing: "border-box",
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

  erroFeed: {
    marginTop: 15,
    padding: 12,
    background: "#fff1f0",
    color: "#b42318",
    borderRadius: 10,
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

  aiBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    background: "#f7f7f8",
    border: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    gap: 12,
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

  card: {
    background: "#fff",
    width: 520,
    maxWidth: "calc(100% - 30px)",
    boxSizing: "border-box",
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
    objectFit: "cover",
  },

  avatarVazio: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 25,
    flexShrink: 0,
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
    zIndex: 1000,
  },

  modal: {
    width: 400,
    maxWidth: "calc(100% - 30px)",
    boxSizing: "border-box",
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
    minWidth: 0,
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
