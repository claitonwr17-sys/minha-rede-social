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

  // 🔒 proteção + carregar feed
  useEffect(() => {

    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
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
    router.push("/login")
  }

  // 🚀 publicar post
  async function publicarPost() {

    if (!texto.trim()) {
      alert("Digite alguma coisa")
      return
    }

    setLoading(true)
    setRespostaIA("Conrad AI está pensando...")

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

      console.log("RESPOSTA IA:", data)

      if (!response.ok) {
        alert("Erro ao publicar")
        setLoading(false)
        return
      }

      // 🔥 pega apenas interpretação da IA
      const resposta = data.response.result.interpretacao

      setRespostaIA(resposta)

      setTexto("")

      buscarPosts()

    } catch (error) {
      console.error(error)
      alert("Erro na requisição")
    }

    setLoading(false)
  }

  return (

    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>

        <div style={styles.logoArea}>

          <img
            src="/logo.png"
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
            {loading ? "Publicando..." : "Publicar"}
          </button>

        </div>

        {/* RESPOSTA IA IMEDIATA */}
        {respostaIA && (
          <div style={styles.postCard}>

            <div style={styles.aiHeader}>
              🤖 Conrad AI
            </div>

            <p style={styles.postText}>
              {respostaIA}
            </p>

          </div>
        )}

        {/* FEED IA */}
        <div style={{ marginTop: "20px" }}>

          {posts
            .filter(post => post && post.resposta)
            .map((post) => (

              <div key={post.id} style={styles.postCard}>

                <div style={styles.aiHeader}>
                  🤖 Conrad AI
                </div>

                <p style={styles.postText}>
                  {post.resposta}
                </p>

              </div>

            ))
          }

        </div>

      </div>

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

  // NAVBAR
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

  // LOGO
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  logoImage: {
    width: "42px",
    height: "42px",
    objectFit: "contain"
  },

  logoText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111"
  },

  // SEARCH
  search: {
    width: "240px",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    outline: "none",
    backgroundColor: "#f7f7f7",
    fontSize: "14px"
  },

  // SIDEBAR
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

  // FEED
  feed: {
    width: "680px",
    marginTop: "100px"
  },

  // CARD DE POST
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

  // POSTS IA
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
  }

}