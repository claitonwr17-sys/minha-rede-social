'use client'

import "@fontsource/inter"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Pag2() {

  const router = useRouter()

  const [texto, setTexto] = useState("")
  const [posts, setPosts] = useState([])
  const [respostaIA, setRespostaIA] = useState("")
  const [loading, setLoading] = useState(false)

  const [mostrarModal, setMostrarModal] = useState(false)
  const [textoPendente, setTextoPendente] = useState("")

  const [hoverItem, setHoverItem] = useState("")

  useEffect(() => {
    buscarPosts()
  }, [])

  async function buscarPosts() {
    try {

      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/posts"
      )

      const data = await response.json()

      const ordenado = data.sort((a, b) => b.id - a.id)

      setPosts(ordenado)

    } catch (error) {
      console.error("Erro ao buscar posts", error)
    }
  }

  function logout() {
    router.push("/")
  }

  async function publicarPost() {

    if (!texto.trim()) {
      alert("Digite alguma coisa")
      return
    }

    setLoading(true)

    try {

      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/sentimento-gemini",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ texto })
        }
      )

      const data = await response.json()

      const resposta =
        data?.response?.result?.interpretacao ||
        "Sem resposta da IA"

      setRespostaIA(resposta)

      setTextoPendente(texto)

      setMostrarModal(true)

    } catch (error) {

      console.error(error)

      alert("Erro na requisição")

    }

    setLoading(false)
  }

  async function confirmarPostagem() {

    try {

      await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            texto: textoPendente
          })
        }
      )

      buscarPosts()

      setTexto("")
      setTextoPendente("")
      setMostrarModal(false)
      setRespostaIA("")

    } catch (error) {

      console.error(error)

      alert("Erro ao salvar post")
    }
  }

  // NOVA FUNÇÃO DE REAÇÕES
async function reagirPost(id, tipo) {

  const postAtual = posts.find((p) => p.id === id)

  if (!postAtual) return

  const novoValor = (postAtual[tipo] || 0) + 1

  try {

    await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/posts/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          [tipo]: novoValor
        })
      }
    )

    buscarPosts()

  } catch (error) {

    console.error(error)

    alert("Erro ao salvar reação")
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

          <span style={styles.logoText}>
            Conrad
          </span>
        </div>

        <input
          placeholder="Pesquisar"
          style={styles.search}
        />

      </div>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "home" && styles.sidebarItemHover)
          }}
          onMouseEnter={() => setHoverItem("home")}
          onMouseLeave={() => setHoverItem("")}
        >
          🏠 Home
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "ia" && styles.sidebarItemHover)
          }}
          onMouseEnter={() => setHoverItem("ia")}
          onMouseLeave={() => setHoverItem("")}
        >
          🤖 IA
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "explorar" && styles.sidebarItemHover)
          }}
          onMouseEnter={() => setHoverItem("explorar")}
          onMouseLeave={() => setHoverItem("")}
        >
          🔍 Explorar
        </div>

        <div
          style={{
            ...styles.sidebarItem,
            ...(hoverItem === "perfil" && styles.sidebarItemHover)
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
            ...(hoverItem === "config" && styles.sidebarItemHover)
          }}
          onMouseEnter={() => setHoverItem("config")}
          onMouseLeave={() => setHoverItem("")}
        >
          ⚙️ Configurações
        </div>

        <button
          onClick={logout}
          style={styles.logout}
        >
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

          <button
            onClick={publicarPost}
            style={styles.postButton}
          >
            {loading ? "Analisando..." : "Publicar"}
          </button>

        </div>

        {/* POSTS */}
        {posts.map((post) => (

          <div
            key={post.id}
            style={styles.postCard}
          >

            <div style={styles.aiHeader}>
              👤 Usuário
            </div>

            <div style={styles.postText}>
              {post.texto}
            </div>

            <div style={styles.actions}>

              <button
                style={styles.actionButton}
                onClick={() => reagirPost(post.id, "curtir")}
              >
                🖒 Curtir {post.curtir || 0}
              </button>

              <button
                style={styles.actionButton}
                onClick={() => reagirPost(post.id, "amei")}
              >
                ❤ Amei {post.amei || 0}
              </button>

             <button
  style={styles.actionButton}
  onClick={async () => {

    const comentario = prompt("Digite seu comentário")

if (!comentario) return

const comentariosAtuais = post.comentarios || []

const novosComentarios = [
  ...comentariosAtuais,
  comentario
]

try {

  await fetch(
    `https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/posts/${post.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        comentarios: novosComentarios
      })
    }
  )

  buscarPosts()

} catch (error) {

  console.error(error)

  alert("Erro ao salvar comentário")
}
  }}
>
  🗨 Comentários ({post.comentarios?.length || 0})
</button>
            </div>
{post.comentarios && post.comentarios.length > 0 && (

  <div style={styles.commentsArea}>

    {post.comentarios.map((comentario, index) => (

      <div
        key={index}
        style={styles.comment}
      >
        💬 {comentario}
      </div>

    ))}

  </div>

)}
          </div>

        ))}

      </div>

      {/* MODAL */}
      {mostrarModal && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalTitle}>
              🤖 Conrad AI
            </div>

            <div style={styles.modalText}>
              {respostaIA}
            </div>

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
  )
}

const styles = {

  page: {
    display: "flex",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif"
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
    zIndex: 1000
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },

  logoImage: {
    width: 40,
    height: 40,
    objectFit: "contain"
  },

  logoText: {
    fontWeight: "bold",
    fontSize: 18
  },

  search: {
    padding: 10,
    borderRadius: 20,
    border: "1px solid #ddd",
    width: 250,
    outline: "none"
  },

  sidebar: {
    width: 220,
    backgroundColor: "white",
    height: "100vh",
    paddingTop: 80,
    paddingLeft: 15,
    position: "fixed",
    left: 0,
    borderRight: "1px solid #ddd"
  },

  sidebarItem: {
    padding: "12px 14px",
    cursor: "pointer",
    borderRadius: 10,
    marginBottom: 8,
    transition: "all 0.2s ease",
    fontWeight: 500,
    color: "#333"
  },

  sidebarItemHover: {
    backgroundColor: "#e7f3ff",
    color: "#1877f2",
    transform: "translateX(5px)"
  },

  logout: {
    marginTop: 20,
   backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "0.2s",
    fontWeight: "bold"
  },

  feed: {
    marginLeft: 240,
    marginTop: 80,
    padding: 20,
    width: "100%",
    maxWidth: 650
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 12,
    resize: "none",
    outline: "none",
    fontSize: 16
  },

  postButton: {
    marginTop: 12,
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s"
  },

  postCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
  },

  aiHeader: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 18
  },

  postText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 1.5
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 15
  },

  actionButton: {
    border: "none",
    backgroundColor: "#f0f2f5",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    transition: "0.2s"
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
    zIndex: 2000
  },

  modal: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    width: 400
  },

  modalTitle: {
    fontWeight: "bold",
    marginBottom: 15,
    fontSize: 20
  },

  modalText: {
    marginBottom: 20,
    lineHeight: 1.5
  },

  modalButtons: {
    display: "flex",
    justifyContent: "space-between"
  },

  cancelButton: {
    backgroundColor: "#999",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer"
  },

 confirmButton: {
  backgroundColor: "#22c55e",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  cursor: "pointer"
},

commentsArea: {
  marginTop: 12,
  backgroundColor: "#f9fafb",
  padding: 10,
  borderRadius: 10
},

comment: {
  padding: 8,
  borderBottom: "1px solid #e5e7eb",
  fontSize: 14,
  color: "#333"
}

}