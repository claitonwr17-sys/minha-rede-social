"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Pag2() {

  const router = useRouter()

  // estado do textarea
  const [texto, setTexto] = useState("")

  // 🔒 Proteção da página
  useEffect(() => {

    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
    }

  }, [])

  // 🚪 Logout
  function logout() {

    localStorage.removeItem("token")
    router.push("/login")

  }

  // 🚀 publicar post
  async function publicarPost() {

    console.log("TEXTO:", texto)

    if (!texto.trim()) {
      alert("Digite alguma coisa")
      return
    }

    try {

      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/sentimento-gemini",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            texto: texto
          })
        }
      )

      const data = await response.json()

      console.log("STATUS:", response.status)
      console.log("RESPOSTA:", data)

      if (!response.ok) {
        alert("Erro no servidor")
        return
      }

      alert("Post publicado com sucesso!")

      // limpa textarea
      setTexto("")

    } catch (error) {

      console.error(error)

      alert("Erro ao publicar")

    }
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Página 2 (logado)</h1>

      <p>Você está autenticado ✔️</p>

      <br />

      {/* textarea */}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="No que você está pensando?"
        style={{
          width: "400px",
          height: "120px",
          padding: "10px"
        }}
      />

      <br />
      <br />

      {/* botão publicar */}
      <button
        onClick={publicarPost}
        style={{
          padding: "10px 20px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Publicar
      </button>

      <br />
      <br />

      {/* logout */}
      <button
        onClick={logout}
        style={{
          padding: "10px 20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Sair
      </button>

    </div>
  )
}