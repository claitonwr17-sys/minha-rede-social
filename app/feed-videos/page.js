
'use client'

import "@fontsource/inter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const XANO_POST_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/publicacoes_videos"

const XANO_GET_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/listar-publicacoes-videos"

export default function FeedVideos() {
  const router = useRouter()

  const [hoverItem, setHoverItem] = useState("")
  const [videoSelecionado, setVideoSelecionado] = useState(null)
  const [arquivoVideo, setArquivoVideo] = useState(null)
  const [publicando, setPublicando] = useState(false)
  const [videos, setVideos] = useState([])
  const [carregandoVideos, setCarregandoVideos] = useState(true)
  const [erroFeed, setErroFeed] = useState("")

  // GET: carregar as publicações salvas no Xano
  async function carregarVideos() {
    try {
      setErroFeed("")

      const resposta = await fetch(XANO_GET_URL, {
        method: "GET",
        cache: "no-store",
      })

      if (!resposta.ok) {
        throw new Error(
          `Não foi possível carregar os vídeos. HTTP ${resposta.status}`
        )
      }

      const dados = await resposta.json()

      // Aceita uma lista direta ou uma lista dentro de api1/data
      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.api1)
          ? dados.api1
          : Array.isArray(dados.data)
            ? dados.data
            : null

      if (!lista) {
        throw new Error(
          "O GET respondeu, mas o formato da lista de vídeos é diferente do esperado."
        )
      }

      setVideos(lista)
    } catch (erro) {
      console.error("Erro ao carregar vídeos do Xano:", erro)
      setErroFeed(erro.message || "Erro ao carregar as publicações.")
    } finally {
      setCarregandoVideos(false)
    }
  }

  // Carregar o feed quando a página abrir
  useEffect(() => {
    carregarVideos()
  }, [])

  function logout() {
    router.push("/feed")
  }

  function escolherVideo(event) {
    const arquivo = event.target.files?.[0]

    if (!arquivo) return

    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado)
    }

    setArquivoVideo(arquivo)
    setVideoSelecionado(URL.createObjectURL(arquivo))

    // Permite escolher novamente o mesmo arquivo
    event.target.value = ""
  }

  function cancelarVideo() {
    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado)
    }

    setArquivoVideo(null)
    setVideoSelecionado(null)
  }

  async function publicarVideo() {
    if (!arquivoVideo) {
      alert("Selecione um vídeo primeiro.")
      return
    }

    try {
      setPublicando(true)

      // 1. Preparar o upload no Cloudinary
      const respostaAssinatura = await fetch(
        "/api/upload-video-signature",
        { method: "POST" }
      )

      const dadosAssinatura = await respostaAssinatura.json()

      if (!respostaAssinatura.ok) {
        throw new Error(
          dadosAssinatura.error ||
            "Não foi possível preparar o envio do vídeo."
        )
      }

      // 2. Enviar o arquivo ao Cloudinary
      const formulario = new FormData()
      formulario.append("file", arquivoVideo)
      formulario.append("api_key", dadosAssinatura.apiKey)
      formulario.append("timestamp", String(dadosAssinatura.timestamp))
      formulario.append("signature", dadosAssinatura.signature)
      formulario.append("folder", dadosAssinatura.folder)

      const respostaUpload = await fetch(
        `https://api.cloudinary.com/v1_1/${dadosAssinatura.cloudName}/video/upload`,
        {
          method: "POST",
          body: formulario,
        }
      )

      const resultado = await respostaUpload.json()

      if (!respostaUpload.ok) {
        throw new Error(
          resultado.error?.message ||
            "Não foi possível enviar o vídeo ao Cloudinary."
        )
      }

      if (!resultado.secure_url || !resultado.public_id) {
        throw new Error(
          "O Cloudinary não retornou a URL ou o identificador do vídeo."
        )
      }

      console.log("Upload concluído no Cloudinary:", resultado.public_id)

      
      const respostaXano = await fetch(XANO_POST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url_do_video: resultado.secure_url,
          id_cloudinary: resultado.public_id,
          usuario_id: 10,
          status: "publicado",
          curtidas: 0,
          amei: 0,
          comentarios: 0,
        }),
      })


      const textoResposta = await respostaXano.text()
      let dadosXano = null

      try {
        dadosXano = textoResposta ? JSON.parse(textoResposta) : null
      } catch {
        dadosXano = textoResposta
      }

      console.log(
        "Resposta do POST no Xano:",
        respostaXano.status,
        dadosXano
      )

      if (!respostaXano.ok) {
        throw new Error(
          typeof dadosXano === "object" && dadosXano
            ? dadosXano.message ||
                dadosXano.mensagem ||
                dadosXano.error ||
                `O Xano não salvou a publicação. HTTP ${respostaXano.status}`
            : `O Xano não salvou a publicação. HTTP ${respostaXano.status}`
        )
      }

      // 4. Atualizar o feed com os dados persistidos no Xano
      await carregarVideos()

      cancelarVideo()

      alert("Vídeo publicado e salvo no Xano com sucesso!")
    } catch (erro) {
      console.error("Erro ao publicar vídeo:", erro)
      alert(erro.message || "Erro ao publicar vídeo.")
    } finally {
      setPublicando(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div>
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
            <Link href="/feed" style={{ textDecoration: "none" }}>
              <div
                style={{
                  ...styles.menuItem,
                  ...(hoverItem === "home" ? styles.menuHover : {}),
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
                gap: 12,
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
                  objectFit: "contain",
                }}
              />
              <span>IA</span>
            </div>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "feed" ? styles.menuHover : {}),
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
                ...(hoverItem === "perfil" ? styles.menuHover : {}),
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
            ...(hoverItem === "logout" ? styles.logoutHover : {}),
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
          <div style={styles.titulo}>
            Feed de vídeos
          </div>

          {/* CARTÃO DE PUBLICAÇÃO */}
          <div style={styles.postCard}>
            <div style={styles.usuario}>
              <img
                src="/insta.png"
                alt="Claiton Wroblewski"
                style={styles.avatarImage}
              />

              <div>
                <div style={styles.nomeUsuario}>
                  Claiton Wroblewski
                </div>
                <div style={styles.agora}>
                  Publicar um novo vídeo
                </div>
              </div>
            </div>

            <label style={styles.botaoVideo}>
              🎥 Escolher vídeo
              <input
                type="file"
                accept="video/*"
                onChange={escolherVideo}
                style={{ display: "none" }}
                disabled={publicando}
              />
            </label>
          </div>

          {/* PRÉVIA DO VÍDEO */}
          {videoSelecionado && (
            <div>
              <div style={styles.videoCard}>
                <video
                  src={videoSelecionado}
                  controls
                  playsInline
                  style={styles.video}
                />
              </div>

              <div style={styles.acoesVideo}>
                <button
                  type="button"
                  style={{
                    ...styles.botaoPublicar,
                    opacity: publicando ? 0.6 : 1,
                  }}
                  onClick={publicarVideo}
                  disabled={publicando}
                >
                  {publicando ? "Enviando vídeo..." : "Publicar vídeo"}
                </button>

                <button
                  type="button"
                  style={styles.botaoCancelar}
                  onClick={cancelarVideo}
                  disabled={publicando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* PUBLICAÇÕES SALVAS NO XANO */}
          <div style={styles.secaoPublicacoes}>
            <div style={styles.tituloPublicacoes}>
              Vídeos publicados
              <button
                type="button"
                style={styles.botaoAtualizar}
                onClick={carregarVideos}
                disabled={carregandoVideos}
              >
                {carregandoVideos ? "Carregando..." : "Atualizar"}
              </button>
            </div>

            {carregandoVideos && (
              <p style={styles.mensagem}>
                Carregando vídeos...
              </p>
            )}

            {!carregandoVideos && erroFeed && (
              <div style={styles.erro}>
                <p>{erroFeed}</p>
                <button
                  type="button"
                  style={styles.botaoCancelar}
                  onClick={carregarVideos}
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!carregandoVideos &&
              !erroFeed &&
              videos.length === 0 && (
                <div style={styles.postCard}>
                  <p style={styles.mensagem}>
                    Ainda não há vídeos publicados.
                  </p>
                </div>
              )}

            {!erroFeed &&
              videos.map((item) => (
                <div
                  key={item.id ?? item.id_cloudinary}
                  style={styles.publicacaoCard}
                >
                  <div style={styles.usuario}>
                    <img
                      src="/insta.png"
                      alt="Conrad"
                      style={styles.avatarImage}
                    />

                    <div>
                      <div style={styles.nomeUsuario}>
                        Claiton Wroblewski
                      </div>
                      <div style={styles.agora}>
                        {item.criado_em
                          ? new Date(
                              Number(item.criado_em)
                            ).toLocaleString("pt-BR")
                          : "Publicação do Conrad"}
                      </div>
                    </div>
                  </div>

                  <video
                    src={item.url_do_video}
                    controls
                    playsInline
                    preload="metadata"
                    style={styles.video}
                  />

                  {item.legenda && (
                    <p style={styles.legenda}>
                      {item.legenda}
                    </p>
                  )}
                </div>
              ))}
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
    fontFamily: "Inter, sans-serif",
  },

  sidebar: {
    width: 240,
    flexShrink: 0,
    backgroundColor: "white",
    padding: 25,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #ddd",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },

  logoImagem: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  menuItem: {
    padding: "14px 18px",
    borderRadius: 12,
    cursor: "pointer",
    color: "#444",
    fontSize: 18,
    transition: "0.2s",
  },

  menuHover: {
    backgroundColor: "#edf3ff",
    color: "#1877f2",
    transform: "translateX(5px)",
  },

  menuAtivo: {
    padding: "14px 18px",
    borderRadius: 12,
    backgroundColor: "#e7f0ff",
    color: "#1877f2",
    fontSize: 18,
    fontWeight: "bold",
  },

  logout: {
    backgroundColor: "#000",
    color: "white",
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 18,
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center",
  },

  logoutHover: {
    transform: "translateX(5px)",
    opacity: 0.8,
  },

  content: {
    flex: 1,
    minWidth: 0,
    padding: 20,
  },

  feed: {
    maxWidth: 900,
    margin: "0 auto",
  },

  titulo: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  postCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  usuario: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    objectFit: "cover",
  },

  nomeUsuario: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },

  agora: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },

  botaoVideo: {
    display: "inline-block",
    backgroundColor: "#000",
    color: "white",
    padding: "14px 25px",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },

  videoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },

  video: {
    width: "100%",
    maxHeight: 600,
    display: "block",
    backgroundColor: "#000",
  },

  acoesVideo: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },

  botaoPublicar: {
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },

  botaoCancelar: {
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #ccc",
    padding: "14px 24px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },

  secaoPublicacoes: {
    marginTop: 30,
  },

  tituloPublicacoes: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  botaoAtualizar: {
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #ccc",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
  },

  publicacaoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },

  legenda: {
    color: "#333",
    fontSize: 16,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    marginTop: 16,
  },

  mensagem: {
    color: "#666",
    fontSize: 16,
    lineHeight: 1.5,
  },

  erro: {
    backgroundColor: "white",
    color: "#a12622",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
}
