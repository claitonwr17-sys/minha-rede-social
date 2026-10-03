'use client'

import "@fontsource/inter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function FeedVideos() {

  const router = useRouter()

  const [hoverItem, setHoverItem] = useState("")
  const [videoSelecionado, setVideoSelecionado] = useState(null)

  function logout() {
    router.push("/feed")
  }

  function escolherVideo(event) {

    const arquivo = event.target.files[0]

    if (!arquivo) {
      return
    }

    const videoURL = URL.createObjectURL(arquivo)

    setVideoSelecionado(videoURL)
  }

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <div>

          {/* LOGO CONRAD */}
          <div style={styles.logo}>

            <img
              src="/logo/logo-simbolo.png"
              alt="Conrad"
              style={styles.logoImagem}
            />

            <span>Conrad</span>

          </div>

          {/* MENU */}
          <div style={styles.menu}>

            <Link
              href="/feed"
              style={{ textDecoration: "none" }}
            >

              <div
                style={{
                  ...styles.menuItem,
                  ...(hoverItem === "home" ? styles.menuHover : {})
                }}
                onMouseEnter={() => setHoverItem("home")}
                onMouseLeave={() => setHoverItem("")}
              >
                🏠 Home
              </div>

            </Link>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "ia" ? styles.menuHover : {}),
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
              onMouseEnter={() => setHoverItem("ia")}
              onMouseLeave={() => setHoverItem("")}
              onClick={() => router.push("/IA")}
            >

              <img
                src="/logo/logo-simbolo.png"
                alt="IA"
                style={{
                  width: 32,
                  height: 32,
                  objectFit: "contain"
                }}
              />

              <span>IA</span>

            </div>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "feed" ? styles.menuHover : {})
              }}
              onMouseEnter={() => setHoverItem("feed")}
              onMouseLeave={() => setHoverItem("")}
              onClick={() => router.push("/imagens")}
            >
              📰 Feed
            </div>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "perfil" ? styles.menuHover : {})
              }}
              onMouseEnter={() => setHoverItem("perfil")}
              onMouseLeave={() => setHoverItem("")}
              onClick={() => router.push("/perfil")}
            >
              👤 Perfil
            </div>

            <div style={styles.menuAtivo}>
              🎬 Feed de vídeos
            </div>

          </div>

        </div>

        {/* SAIR */}
        <div
          style={{
            ...styles.logout,
            ...(hoverItem === "logout" ? styles.logoutHover : {})
          }}
          onMouseEnter={() => setHoverItem("logout")}
          onMouseLeave={() => setHoverItem("")}
          onClick={logout}
        >
          Sair
        </div>

      </div>

      {/* CONTEÚDO */}
      <div style={styles.content}>

        <div style={styles.feed}>

          {/* TÍTULO */}
          <div style={styles.titulo}>
            Feed de vídeos
          </div>

          {/* CARTÃO DE PUBLICAÇÃO */}
          <div style={styles.postCard}>

            <div style={styles.usuario}>

              <div style={styles.avatar}>
                👤
              </div>

              <div>

                <div style={styles.nomeUsuario}>
                  Claiton Wroblewski
                </div>

                <div style={styles.agora}>
                  Agora mesmo
                </div>

              </div>

            </div>

            {/* BOTÃO ESCOLHER VÍDEO */}
            <label style={styles.botaoVideo}>

              🎥 Escolher vídeo

              <input
                type="file"
                accept="video/*"
                onChange={escolherVideo}
                style={{ display: "none" }}
              />

            </label>

          </div>

          {/* VÍDEO ESCOLHIDO */}
          {videoSelecionado && (

            <div style={styles.videoCard}>

              <video
                src={videoSelecionado}
                controls
                style={styles.video}
              />

            </div>

          )}

        </div>

      </div>

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

  sidebar: {
    width: 240,
    backgroundColor: "white",
    padding: 25,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #ddd"
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40
  },

  logoImagem: {
    width: 44,
    height: 44,
    objectFit: "contain"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 15
  },

  menuItem: {
    padding: "14px 18px",
    borderRadius: 12,
    cursor: "pointer",
    color: "#444",
    fontSize: 18,
    transition: "0.2s"
  },

  menuHover: {
    backgroundColor: "#edf3ff",
    color: "#1877f2",
    transform: "translateX(5px)"
  },

  menuAtivo: {
    padding: "14px 18px",
    borderRadius: 12,
    backgroundColor: "#e7f0ff",
    color: "#1877f2",
    fontSize: 18,
    fontWeight: "bold"
  },

  logout: {
    backgroundColor: "#000",
    color: "white",
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 18,
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center"
  },

  logoutHover: {
    transform: "translateX(5px)",
    opacity: 0.8
  },

  content: {
    flex: 1,
    padding: 20
  },

  feed: {
    maxWidth: 900,
    margin: "0 auto"
  },

  titulo: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20
  },

  /* CARTÃO DE PUBLICAÇÃO */
  postCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
  },

  usuario: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 25
  },

  nomeUsuario: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222"
  },

  agora: {
    fontSize: 16,
    color: "#888",
    marginTop: 4
  },

  /* BOTÃO */
  botaoVideo: {
    display: "inline-block",
    backgroundColor: "#000",
    color: "white",
    padding: "14px 25px",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer"
  },

  /* VÍDEO APÓS ESCOLHER */
  videoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
  },

  video: {
    width: "100%",
    maxHeight: 600,
    display: "block",
    backgroundColor: "#000"
  }

}