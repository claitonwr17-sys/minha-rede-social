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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        fontFamily: "Arial"
      }}
    >

      {/* área central */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px"
        }}
      >

        {/* textarea */}
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="No que você está pensando?"
          style={{
            width: "320px",
            height: "90px",
            padding: "12px",
            fontSize: "15px",
            borderRadius: "8px",
            border: "2px solid black",
            resize: "none"
          }}
        />

        <br />

        {/* botão publicar */}
        <button
          onClick={publicarPost}
          style={{
            padding: "10px 18px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          Publicar
        </button>

      </div>

      {/* botão sair no final */}
      <button
        onClick={logout}
        style={{
          marginTop: "auto",
          width: "90px",
          padding: "10px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "15px"
        }}
      >
        Sair
      </button>

    </div>
  )
}