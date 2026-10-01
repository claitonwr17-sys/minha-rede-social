'use client'

import "@fontsource/inter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function FeedVideos() {

  const router = useRouter()
  const [hoverItem, setHoverItem] = useState("")

  function logout() {
    router.push("/feed")
  }

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <div>

          <div style={styles.logo}>
            Conrad
          </div>

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
              Feed de vídeos
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

        {/* NAVBAR */}
        <div style={styles.navbar}>

          <input
            placeholder="Pesquisar"
            style={styles.search}
          />

        </div>

        {/* FEED DE VÍDEOS */}
        <div style={styles.feed}>

          <div style={styles.titulo}>
            Feed de vídeos
          </div>

          <div style={styles.videoCard}>

            <div style={styles.videoArea}>
              <div style={styles.videoPlaceholder}>
                🎬
              </div>
            </div>

            <div style={styles.videoInfo}>

              <div style={styles.videoTitulo}>
                Vídeo
              </div>

              <div style={styles.videoDescricao}>
                Seu vídeo aparecerá aqui.
              </div>

            </div>

          </div>

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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40
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
    padding: 10
  },

  navbar: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10
  },

  search: {
    width: 300,
    padding: 12,
    borderRadius: 30,
    border: "1px solid #ddd",
    outline: "none"
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

  videoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: 20
  },

  videoArea: {
    width: "100%",
    height: 500,
    backgroundColor: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  videoPlaceholder: {
    fontSize: 70,
    color: "white"
  },

  videoInfo: {
    padding: 25
  },

  videoTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222"
  },

  videoDescricao: {
    fontSize: 18,
    color: "#666",
    marginTop: 8
  }

}