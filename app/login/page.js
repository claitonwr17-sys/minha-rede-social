"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Pag2() {

  const router = useRouter()
  const [texto, setTexto] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [])

  function logout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  async function publicarPost() {

    if (!texto.trim()) {
      alert("Digite alguma coisa")
      return
    }

    try {

      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/sentimento-gemini",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto })
        }
      )

      if (!response.ok) {
        alert("Erro ao publicar")
        return
      }

      alert("Post publicado!")
      setTexto("")

    } catch (err) {
      alert("Erro na requisição")
    }
  }

  return (
    <div style={styles.page}>

      {/* CONTAINER CENTRAL (tipo feed) */}
      <div style={styles.feed}>

        {/* CARD DE POST */}
        <div style={styles.card}>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="No que você está pensando?"
            style={styles.textarea}
          />

          <button onClick={publicarPost} style={styles.postButton}>
            Publicar
          </button>

        </div>

        {/* AQUI DEPOIS VAI ENTRAR O FEED */}
        <div style={styles.placeholderFeed}>
          Seus posts aparecerão aqui...
        </div>

      </div>

      {/* logout fixo */}
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
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },

  placeholderFeed: {
    marginTop: "20px",
    textAlign: "center",
    color: "#888",
    fontSize: "14px"
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