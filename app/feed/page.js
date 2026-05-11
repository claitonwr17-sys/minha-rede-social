"use client"

import "@fontsource/inter"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Pag2() {

  const router = useRouter()

  const [texto, setTexto] = useState("")
  const [posts, setPosts] = useState([])
  const [respostaIA, setRespostaIA] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔥 novos states
  const [mostrarModal, setMostrarModal] = useState(false)
  const [textoPendente, setTextoPendente] = useState("")

  // 🔒 proteção + carregar feed
  useEffect(() => {

    const token = localStorage.getItem("token")

    // ✅ CORREÇÃO AQUI
    if (!token) {
      router.push("/")
      return
    }

    buscarPosts()

  }, [])

  // 📥 buscar posts
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

  // 🚪 logout
  function logout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  // 🚀 ANALISA O POST
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

      if (!response.ok) {
        throw new Error("Erro na API")
      }

      const data = await response.json()

      console.log("RESPOSTA IA:", data)

      const resposta =
        data?.response?.result?.interpretacao ||
        "Sem resposta da IA"

      // 🔥 salva resposta
      setRespostaIA(resposta)

      // 🔥 guarda texto temporário
      setTextoPendente(texto)

      // 🔥 abre modal
      setMostrarModal(true)

    } catch (error) {

      console.error(error)
      alert("Erro na requisição")

    }

    setLoading(false)
  }

  // ✅ CONFIRMAR POSTAGEM
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

  return (

    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>

        <div style={styles.logoArea}>

          <img
            src="/logo/logo-simbolo.png"
            alt="Conrad"
            style={styles.logoImage}
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
          style={styles.sidebarItem}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eaeaea"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          🏠 Home
        </div>

        <div
          style={styles.sidebarItem}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eaeaea"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          🤖 IA
        </div>

        <div
          style={styles.sidebarItem}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eaeaea"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          🔍 Explorar
        </div>

        <div
          style={styles.sidebarItem}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eaeaea"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          👤 Perfil
        </div>

        <div
          style={styles.sidebarItem}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eaeaea"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
          }}
        >
          ⚙️ Configurações
        </div>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>

      </div>

      {/* FEED */}
      <div style={styles.feed}>

        {/* CARD DE POST */}
        <div style={styles.card}>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="No que você está pensando?"
            style={styles.textarea}
          />

          <button
            onClick={() => {
              publicarPost()
            }}

            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.96)"
            }}

            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)"
            }}

            style={styles.postButton}
          >
            {loading ? "Analisando..." : "Publicar"}
          </button>

        </div>

        {/* POSTS DO FEED */}
        {posts.map((post) => (

          <div key={post.id} style={styles.postCard}>

            <div style={styles.aiHeader}>
              👤 {post.nome || "Usuário"}
            </div>

            <div style={styles.postText}>
              {post.texto || post.content || "Post sem conteúdo"}
            </div>

          </div>

        ))}

      </div>

      {/* 🔥 MODAL IA */}
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
                onClick={() => {
                  setMostrarModal(false)
                }}
                style={styles.cancelButton}
              >
                Cancelar postagem
              </button>

              <button
                onClick={confirmarPostagem}
                style={styles.confirmButton}
              >
                Postar mesmo assim
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
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif"
  },

  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "65px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    zIndex: 1000
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  logoImage: {
    width: "38px",
    height: "38px",
    objectFit: "contain"
  },

  logoText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111"
  },

  search: {
    width: "240px",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    outline: "none",
    backgroundColor: "#f7f7f7",
    fontSize: "14px"
  },

  sidebar: {
    position: "fixed",
    left: "20px",
    top: "100px",
    width: "220px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  sidebarItem: {
    padding: "14px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "500",
    color: "#111",
    transition: "0.2s",
    backgroundColor: "transparent"
  },

  feed: {
    width: "680px",
    marginTop: "100px",
    paddingBottom: "40px"
  },

  card: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  textarea: {
    width: "100%",
    height: "110px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    padding: "14px",
    resize: "none",
    fontSize: "16px",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "#fff"
  },

  postButton: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "0.15s"
  },

  postCard: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "18px",
    marginTop: "20px",
    border: "1px solid #e9e9e9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    lineHeight: "1.7"
  },

  aiHeader: {
    fontWeight: "700",
    marginBottom: "14px",
    color: "#111",
    fontSize: "16px"
  },

  postText: {
    whiteSpace: "pre-wrap",
    fontSize: "15px",
    color: "#222"
  },

  logout: {
    marginTop: "20px",
    backgroundColor: "#111",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    width: "100px",
    fontWeight: "600"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },

  modal: {
    width: "520px",
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 15px 45px rgba(0,0,0,0.2)"
  },

  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "18px"
  },

  modalText: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#333",
    whiteSpace: "pre-wrap"
  },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "28px"
  },

  cancelButton: {
    backgroundColor: "#e5e5e5",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600"
  },

  confirmButton: {
    backgroundColor: "#111",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600"
  }

}