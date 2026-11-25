
"use client";

import "@fontsource/inter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
const XANO_PESQUISAR_USUARIOS_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/pesquisar_usuarios";
export default function Pag2() {
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [posts, setPosts] = useState([]);
  const [respostaIA, setRespostaIA] = useState("");
  const [loading, setLoading] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [textoPendente, setTextoPendente] = useState("");

  const [hoverItem, setHoverItem] = useState("");

  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAberto, setComentariosAberto] = useState(false);
// PESQUISA DE USUÁRIOS DO CONRAD AI

const [buscaUsuarios, setBuscaUsuarios] = useState("");
const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
const [pesquisandoUsuarios, setPesquisandoUsuarios] = useState(false);
const [erroPesquisa, setErroPesquisa] = useState("");
const [mostrarResultados, setMostrarResultados] = useState(false);

const areaPesquisaRef = useRef(null);

// Consulta o endpoint de pesquisa do Xano.
useEffect(() => {
  const termo = buscaUsuarios.trim();

  if (!termo) {
    setUsuariosEncontrados([]);
    setPesquisandoUsuarios(false);
    setErroPesquisa("");
    return;
  }

  const controller = new AbortController();

  // Aguarda uma pequena pausa na digitação.
  const timer = setTimeout(async () => {
    setPesquisandoUsuarios(true);
    setErroPesquisa("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUsuariosEncontrados([]);
        setErroPesquisa("Faça login para pesquisar usuários.");
        return;
      }

      const url = new URL(XANO_PESQUISAR_USUARIOS_URL);
      url.searchParams.set("busca", termo);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Sessão inválida ou expirada. Faça login novamente."
          );
        }

        throw new Error(
          `Erro ao pesquisar usuários: HTTP ${response.status}`
        );
      }

      const dados = await response.json();

      // Estrutura confirmada no teste do Xano:
      // usuarios.items
      setUsuariosEncontrados(
        Array.isArray(dados?.usuarios?.items)
          ? dados.usuarios.items
          : []
      );

    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro na pesquisa de usuários:", error);
        setUsuariosEncontrados([]);
        setErroPesquisa(
          error.message || "Não foi possível pesquisar usuários."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setPesquisandoUsuarios(false);
      }
    }
  }, 350);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [buscaUsuarios]);

// Fecha os resultados ao clicar fora da pesquisa.
useEffect(() => {
  function fecharAoClicarFora(event) {
    if (
      areaPesquisaRef.current &&
      !areaPesquisaRef.current.contains(event.target)
    ) {
      setMostrarResultados(false);
    }
  }

  document.addEventListener("mousedown", fecharAoClicarFora);

  return () => {
    document.removeEventListener("mousedown", fecharAoClicarFora);
  };
}, []);
  useEffect(() => {
    buscarPosts();
  }, []);

  async function buscarPosts() {
    try {
      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/posts"
      );

      const data = await response.json();

      const ordenado = data.sort((a, b) => b.id - a.id);

      setPosts(ordenado);
    } catch (error) {
      console.error("Erro ao buscar posts", error);
    }
  }

  function logout() {
    router.push("/");
  }

  async function publicarPost() {
    if (!texto.trim()) {
      alert("Digite alguma coisa");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/sentimento-gemini",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texto }),
        }
      );

      const data = await response.json();

      console.log("RESPOSTA COMPLETA DO XANO:", data);

      const resposta =
        data?.response?.result?.interpretacao || "Sem resposta da IA";

      setRespostaIA(resposta);
      setTextoPendente(texto);
      setMostrarModal(true);
    } catch (error) {
      console.error(error);
      alert("Erro na requisição");
    }

    setLoading(false);
  }

  async function confirmarPostagem() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const resposta = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/POST_/salvar-post-texto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            texto: textoPendente,
            resposta_da_api: respostaIA,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(
          `Erro ao salvar publicação: ${resposta.status}`
        );
      }

      await buscarPosts();

      setTexto("");
      setTextoPendente("");
      setMostrarModal(false);
      setRespostaIA("");
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      alert("Erro ao salvar post");
    }
  }

  async function reagirPost(id, tipo) {
    const postAtual = posts.find((p) => p.id === id);

    if (!postAtual) return;

    const novoCurtir =
      tipo === "curtir"
        ? (postAtual.curtir || 0) + 1
        : postAtual.curtir || 0;

    const novoAmei =
      tipo === "amei"
        ? (postAtual.amei || 0) + 1
        : postAtual.amei || 0;

    try {
      await fetch("https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/PATCH", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postAtual.id,
          curtir: novoCurtir,
          amei: novoAmei,
          comentarios: postAtual.comentarios || [],
        }),
      });

      buscarPosts();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar reação");
    }
  }

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.logoArea}>
          <img
            src="/logo/logo-simbolo.png"
            style={styles.logoImage}
            alt="Logo"
          />

          <span style={styles.logoText}>Conrad</span>
        </div>

        {/* PESQUISA DE USUÁRIOS */}
<div ref={areaPesquisaRef} style={styles.searchArea}>

  <input
    type="search"
    placeholder="Pesquisar usuários"
    aria-label="Pesquisar usuários"
    autoComplete="off"
    style={styles.search}
    value={buscaUsuarios}
    onChange={(e) => {
      setBuscaUsuarios(e.target.value);
      setMostrarResultados(true);
    }}
    onFocus={() => setMostrarResultados(true)}
    onKeyDown={(e) => {
      if (e.key === "Escape") {
        setMostrarResultados(false);
      }
    }}
  />

  {mostrarResultados && buscaUsuarios.trim() !== "" && (

    <div
      style={styles.resultadosPesquisa}
      role="status"
      aria-live="polite"
    >

      {pesquisandoUsuarios ? (

        <div style={styles.mensagemPesquisa}>
          Pesquisando...
        </div>

      ) : erroPesquisa ? (

        <div style={styles.erroPesquisa}>
          {erroPesquisa}
        </div>

      ) : usuariosEncontrados.length === 0 ? (

        <div style={styles.mensagemPesquisa}>
          Nenhum usuário encontrado.
        </div>

      ) : (

        usuariosEncontrados.map((usuario) => (

          <div
            key={usuario.id}
            style={styles.usuarioResultado}
          >

            {usuario.foto_perfil ? (

              <img
                src={usuario.foto_perfil}
                alt={`Foto de ${usuario.nome || "usuário"}`}
                style={styles.fotoUsuarioPesquisa}
              />

            ) : (

              <div style={styles.fotoUsuarioVazia}>
                👤
              </div>

            )}

            <div style={styles.dadosUsuarioPesquisa}>

              <strong style={styles.nomeUsuarioPesquisa}>
                {usuario.nome || "Usuário"}
              </strong>

              <span style={styles.usernamePesquisa}>
                @{usuario.username || "sem-username"}
              </span>

            </div>

          </div>

        ))

      )}

    </div>

  )}

</div>
      </div>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "home" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("home")}
          onMouseLeave={() => setHoverItem("")}
        >
          🏠 Home
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "ia" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("ia")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/IA")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src="/logo/logo-simbolo.png"
              alt="IA"
              style={{
                width: 24,
                height: 24,
                objectFit: "contain",
              }}
            />

            <span>IA</span>
          </div>
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "explorar" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("explorar")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/imagens")}
        >
          Feed
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "perfil" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("perfil")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/perfil")}
        >
          👤 Perfil
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "config" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("config")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/feed-videos")}
        >
          Feed de vídeos
        </div>

        {/* POLÍTICA DE PRIVACIDADE */}
        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "privacidade" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("privacidade")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/politica-de-privacidade")}
        >
          🔒 Política de Privacidade
        </div>

        {/* TERMOS DE USO */}
        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "termos" && styles.sidebarItemHover),
          }}
          onMouseEnter={() => setHoverItem("termos")}
          onMouseLeave={() => setHoverItem("")}
          onClick={() => router.push("/termos-de-uso")}
        >
          📜 Termos de Uso
        </div>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>
      </div>

      {/* FEED */}
      <div style={styles.feed}>
        {/* CARD PUBLICAÇÃO */}
        <div style={styles.card}>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="No que você está pensando?"
            style={styles.textarea}
          />

          <button onClick={publicarPost} style={styles.postButton}>
            {loading ? "Analisando..." : "Publicar"}
          </button>
        </div>

        {posts
          .filter((post) => post.texto && post.texto.trim() !== "")
          .map((post) => (
            <div key={post.id} style={styles.postCard}>
              <div style={styles.aiHeader}>
  {post._perfis?.[0]?.foto_perfil ? (
    <img
      src={post._perfis[0].foto_perfil}
      alt="Foto do autor"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: 10,
        verticalAlign: "middle",
      }}
    />
  ) : (
    <span style={{ marginRight: 10 }}>👤</span>
  )}

  {post._perfis?.[0]?.nome || "Usuário"}
</div>

              <div style={styles.postText}>
                {typeof post.texto === "string"
                  ? post.texto
                  : JSON.stringify(post.texto)}
              </div>

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => reagirPost(post.id, "curtir")}
                >
                  👍🏿 Curtir {post.curtir || 0}
                </button>

                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => reagirPost(post.id, "amei")}
                >
                  🖤 Amei {post.amei || 0}
                </button>

                <button
                  type="button"
                  style={styles.actionButton}
                  onClick={() => {
                    setPostSelecionado(post);
                    setComentariosAberto(true);
                  }}
                >
                  💬 Comentarios ({post.comentarios?.length || 0})
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL COMENTÁRIOS */}
      {comentariosAberto && postSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.commentsModal}>
            <div style={styles.commentsHeader}>
              <span>Comentários</span>

              <button
                onClick={() => setComentariosAberto(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.commentsList}>
              {postSelecionado.comentarios?.map((comentario, index) => (
                <div key={index} style={styles.comment}>
                  💬 {comentario}
                </div>
              ))}
            </div>

            <div style={styles.commentInputArea}>
              <input
                type="text"
                placeholder="Digite um comentário..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                style={styles.commentInput}
              />

              <button
                style={styles.sendButton}
                onClick={async () => {
                  if (!texto.trim()) return;

                  const comentariosAtuais =
                    postSelecionado.comentarios || [];

                  const novosComentarios = [
                    ...comentariosAtuais,
                    texto,
                  ];

                  try {
                    await fetch(
                      "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/PATCH",
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          post_id: postSelecionado.id,
                          comentarios: novosComentarios,
                          curtir: postSelecionado.curtir || 0,
                          amei: postSelecionado.amei || 0,
                        }),
                      }
                    );

                    setTexto("");

                    buscarPosts();

                    setPostSelecionado({
                      ...postSelecionado,
                      comentarios: novosComentarios,
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IA */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>Conrad AI</div>

            <div style={styles.modalText}>{respostaIA}</div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setMostrarModal(false)}
                style={styles.cancelButton}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarPostagem}
                style={styles.confirmButton}
              >
                Postar
              </button>
            </div>
          </div>
        </div>
      )}
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

  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "1px solid #ddd",
    zIndex: 1000,
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logoImage: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },

  logoText: {
    fontWeight: "bold",
    fontSize: 18,
  },

 searchArea: {
  position: "relative",
  width: 250,
  maxWidth: "50vw",
},

search: {
  boxSizing: "border-box",
  padding: 10,
  borderRadius: 20,
  border: "1px solid #ddd",
  width: "100%",
  outline: "none",
},

resultadosPesquisa: {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: "min(340px, 90vw)",
  maxHeight: 360,
  overflowY: "auto",
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  zIndex: 1100,
},

usuarioResultado: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "11px 14px",
  borderBottom: "1px solid #f0f0f0",
},

fotoUsuarioPesquisa: {
  width: 42,
  height: 42,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
},

fotoUsuarioVazia: {
  width: 42,
  height: 42,
  borderRadius: "50%",
  backgroundColor: "#f0f2f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
},

dadosUsuarioPesquisa: {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
},

nomeUsuarioPesquisa: {
  fontSize: 14,
  color: "#111827",
  overflowWrap: "anywhere",
},

usernamePesquisa: {
  fontSize: 13,
  color: "#6b7280",
  overflowWrap: "anywhere",
},

mensagemPesquisa: {
  padding: 15,
  color: "#6b7280",
  fontSize: 14,
},

erroPesquisa: {
  padding: 15,
  color: "#b91c1c",
  fontSize: 14,
},

  sidebar: {
    width: 220,
    backgroundColor: "white",
    height: "100vh",
    paddingTop: 80,
    paddingLeft: 15,
    position: "fixed",
    left: 0,
    borderRight: "1px solid #ddd",
  },

  sidebarItem: {
    padding: "12px 14px",
    cursor: "pointer",
    borderRadius: 10,
    marginBottom: 8,
    transition: "all 0.2s ease",
    fontWeight: 500,
    color: "#333",
  },

  sidebarItemHover: {
    backgroundColor: "#e7f3ff",
    color: "#1877f2",
    transform: "translateX(5px)",
  },

  logout: {
    marginTop: 20,
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  feed: {
    marginLeft: 240,
    marginTop: 80,
    padding: 20,
    width: "100%",
    maxWidth: 650,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 12,
    resize: "none",
    outline: "none",
    fontSize: 16,
  },

  postButton: {
    marginTop: 12,
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  postCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  aiHeader: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 18,
  },

  postText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 1.5,
    marginBottom: 15,
    wordBreak: "break-word",
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #eee",
    flexWrap: "wrap",
  },

  actionButton: {
    border: "none",
    backgroundColor: "#f0f2f5",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    color: "black",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },

  modal: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    width: 400,
  },

  modalTitle: {
    fontWeight: "bold",
    marginBottom: 15,
    fontSize: 20,
  },

  modalText: {
    marginBottom: 20,
    lineHeight: 1.5,
  },

  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
  },

  cancelButton: {
    backgroundColor: "#999",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },

  confirmButton: {
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },

  commentsModal: {
    backgroundColor: "white",
    width: 500,
    maxHeight: "80vh",
    borderRadius: 16,
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  commentsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    fontWeight: "bold",
    fontSize: 18,
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 20,
    cursor: "pointer",
  },

  commentsList: {
    flex: 1,
    overflowY: "auto",
    marginBottom: 15,
  },

  comment: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  commentInputArea: {
    display: "flex",
    gap: 10,
  },

  commentInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    outline: "none",
  },

  sendButton: {
    backgroundColor: "black",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },
};
