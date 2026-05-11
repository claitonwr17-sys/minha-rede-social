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

  const [mostrarModal, setMostrarModal] = useState(false)
  const [textoPendente, setTextoPendente] = useState("")

  // 🚀 FEED LIVRE (SEM LOGIN / SEM TOKEN)
  useEffect(() => {
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

  // 🚪 logout simples (sem token)
  function logout() {
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

          <button
            onClick={publicarPost}
            style={styles.postButton}
          >
            {loading ? "Analisando..." : "Publicar"}
          </button>

        </div>

        {/* POSTS */}
        {posts.map((post) => (
          <div key={post.id} style={styles.postCard}>
            <div style={styles.aiHeader}>👤 Usuário</div>
            <div style={styles.postText}>{post.texto}</div>
          </div>
        ))}

      </div>

      {/* MODAL IA */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <div style={styles.modalTitle}>🤖 Conrad AI</div>

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