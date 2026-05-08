"use client"

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

      // 🔥 pega resposta da IA
      const resposta =
        data?.response?.result ||
        data?.resposta ||
        data?.result ||
        "Resposta recebida com sucesso"

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
              console.log("CLICOU")
              publicarPost()
            }}

            onMouseDown={(e) => {
              e.target.style.transform = "scale(0.95)"
            }}

            onMouseUp={(e) => {
              e.target.style.transform = "scale(1)"
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

            <p>{respostaIA}</p>

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

                <p>{post.resposta}</p>

              </div>
            ))
          }

        </div>

      </div>

      {/* logout */}
      <button onClick={logout} style={styles.logout}>
        Sair
      </button>

    </div>
  )
}

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f6f8",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Arial"
  },

  feed: {
    width: "500px",
    marginTop: "40px"
  },

  card: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  textarea: {
    width: "100%",
    height: "100px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    padding: "10px",
    resize: "none",
    fontSize: "14px",
    outline: "none"
  },

  postButton: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.15s"
  },

  postCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    lineHeight: "1.5"
  },

  aiHeader: {
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#444"
  },

  logout: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    backgroundColor: "#111",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer"
  }

}