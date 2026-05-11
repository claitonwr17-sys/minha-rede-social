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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: textoPendente })
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
          <img src="/logo/logo-simbolo.png" style={styles.logoImage} />
          <span style={styles.logoText}>Conrad</span>
        </div>

        <input placeholder="Pesquisar" style={styles.search} />
      </div>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarItem}>🏠 Home</div>
        <div style={styles.sidebarItem}>🤖 IA</div>
        <div style={styles.sidebarItem}>🔍 Explorar</div>
        <div style={styles.sidebarItem}>👤 Perfil</div>
        <div style={styles.sidebarItem}>⚙️ Configurações</div>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>
      </div>

      {/* FEED */}
      <div style={styles.feed}>

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

        {posts.map((post) => (
          <div key={post.id} style={styles.postCard}>
            <div style={styles.aiHeader}>👤 Usuário</div>
            <div style={styles.postText}>{post.texto}</div>
          </div>
        ))}

      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <div style={styles.modalTitle}>🤖 Conrad AI</div>

            <div style={styles.modalText}>{respostaIA}</div>

            <div style={styles.modalButtons}>

              <button onClick={() => setMostrarModal(false)} style={styles.cancelButton}>
                Cancelar
              </button>

              <button onClick={confirmarPostagem} style={styles.confirmButton}>
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
    padding: 8,
    borderRadius: 20,
    border: "1px solid #ddd",
    width: 250
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
    padding: "12px 10px",
    cursor: "pointer",
    borderRadius: 8,
    marginBottom: 5
  },

  logout: {
    marginTop: 20,
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  },

  feed: {
    marginLeft: 240,
    marginTop: 80,
    padding: 20,
    width: "100%",
    maxWidth: 600
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  textarea: {
    width: "100%",
    minHeight: 80,
    borderRadius: 10,
    border: "1px solid #ddd",
    padding: 10
  },

  postButton: {
    marginTop: 10,
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  },

  postCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },

  aiHeader: {
    fontWeight: "bold",
    marginBottom: 5
  },

  postText: {
    color: "#333"
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
    justifyContent: "center"
  },

  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 400
  },

  modalTitle: {
    fontWeight: "bold",
    marginBottom: 10
  },

  modalText: {
    marginBottom: 20
  },

  modalButtons: {
    display: "flex",
    justifyContent: "space-between"
  },

  cancelButton: {
    backgroundColor: "gray",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8
  },

  confirmButton: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 8
  }
}
