
"use client"

import "@fontsource/inter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const XANO_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3"
// =====================================================
// CONRAD AI - PESQUISA DE USUÁRIOS NA PÁGINA PERFIL
// =====================================================

function PesquisaUsuariosPerfil() {
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const areaRef = useRef(null);

  useEffect(() => {
    const termo = busca.trim();

    if (!termo) {
      setUsuarios([]);
      setCarregando(false);
      setErro("");
      return;
    }

    const controller = new AbortController();

    setUsuarios([]);
    setCarregando(true);
    setErro("");

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Faça login para pesquisar usuários.");
        }

        const url = new URL(
          `${XANO_BASE}/pesquisar_usuarios`
        );

        url.searchParams.set("busca", termo);

        const resposta = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
          signal: controller.signal
        });

        if (!resposta.ok) {
          if (resposta.status === 401) {
            throw new Error(
              "Sua sessão expirou. Faça login novamente."
            );
          }

          throw new Error(
            `Erro ao pesquisar usuários: ${resposta.status}`
          );
        }

        const dados = await resposta.json();

        if (!controller.signal.aborted) {
          setUsuarios(
            Array.isArray(dados?.usuarios?.items)
              ? dados.usuarios.items
              : []
          );
        }

      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erro na pesquisa:", error);
          setUsuarios([]);
          setErro(
            error.message ||
            "Não foi possível pesquisar usuários."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [busca]);

  useEffect(() => {
    function clicarFora(event) {
      if (
        areaRef.current &&
        !areaRef.current.contains(event.target)
      ) {
        setMostrarResultados(false);
      }
    }

    document.addEventListener("mousedown", clicarFora);

    return () => {
      document.removeEventListener("mousedown", clicarFora);
    };
  }, []);

  const estilos = {
    area: {
      position: "relative",
      width: 300,
      maxWidth: "100%",
      zIndex: 100
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 12,
      borderRadius: 30,
      border: "1px solid #ddd",
      outline: "none",
      fontSize: 15,
      backgroundColor: "white"
    },

    resultados: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      width: "min(350px, 90vw)",
      maxHeight: 350,
      overflowY: "auto",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
      zIndex: 101
    },

    usuario: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderBottom: "1px solid #f0f0f0",
      color: "#222",
      textDecoration: "none",
      cursor: "pointer"
    },

    foto: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0
    },

    semFoto: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      backgroundColor: "#f0f2f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },

    dados: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    },

    nome: {
      fontSize: 14,
      fontWeight: "bold",
      overflowWrap: "anywhere"
    },

    username: {
      fontSize: 13,
      color: "#777",
      overflowWrap: "anywhere"
    },

    mensagem: {
      padding: 15,
      fontSize: 14,
      color: "#666"
    }
  };

  return (
    <div ref={areaRef} style={estilos.area}>
      <input
        type="search"
        placeholder="Pesquisar usuários"
        aria-label="Pesquisar usuários"
        autoComplete="off"
        value={busca}
        onChange={(event) => {
          setBusca(event.target.value);
          setMostrarResultados(true);
        }}
        onFocus={() => setMostrarResultados(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMostrarResultados(false);
          }
        }}
        style={estilos.input}
      />

      {mostrarResultados && busca.trim() !== "" && (
        <div
          style={estilos.resultados}
          role="status"
          aria-live="polite"
        >
          {carregando ? (
            <div style={estilos.mensagem}>
              Pesquisando...
            </div>
          ) : erro ? (
            <div
              style={{
                ...estilos.mensagem,
                color: "#b91c1c"
              }}
            >
              {erro}
            </div>
          ) : usuarios.length === 0 ? (
            <div style={estilos.mensagem}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            usuarios.map((usuario) => (
              <a
                key={usuario.id}
                href={`/perfil?users_id=${encodeURIComponent(
                  usuario.users_id
                )}`}
                style={estilos.usuario}
              >
                {usuario.foto_perfil ? (
                  <img
                    src={usuario.foto_perfil}
                    alt={`Foto de ${usuario.nome || "usuário"}`}
                    style={estilos.foto}
                  />
                ) : (
                  <div style={estilos.semFoto}>
                    👤
                  </div>
                )}

                <div style={estilos.dados}>
                  <span style={estilos.nome}>
                    {usuario.nome || "Usuário"}
                  </span>

                  <span style={estilos.username}>
                    @{usuario.username || "sem-username"}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
export default function Perfil() {
  const router = useRouter()

  const [hoverItem, setHoverItem] = useState("")
  const [perfil, setPerfil] = useState(null)
  const [perfilVisitadoId, setPerfilVisitadoId] = useState(null)
const [visualizandoOutroPerfil, setVisualizandoOutroPerfil] = useState(false)
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [erroPerfil, setErroPerfil] = useState("")

  const [totalPosts, setTotalPosts] = useState(0)
  const [postsPerfil, setPostsPerfil] = useState([])
  const [carregandoPosts, setCarregandoPosts] = useState(true)

  // NOVO: nenhum usuário recebe uma foto padrão pessoal.
  const [fotoPerfil, setFotoPerfil] = useState("")
  const [fotoCapa, setFotoCapa] = useState("")

  const [salvandoFoto, setSalvandoFoto] = useState(false)
  const [salvandoCapa, setSalvandoCapa] = useState(false)

  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [nomeEditado, setNomeEditado] = useState("")
  const [bioEditada, setBioEditada] = useState("")
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [erroEdicao, setErroEdicao] = useState("")

  const operacaoEmAndamento =
    salvandoFoto || salvandoCapa || salvandoPerfil

  function logout() {
    localStorage.removeItem("token")
    router.push("/")
  }

  function obterUrlImagem(valor, fallback = "") {
    if (!valor) return fallback

    if (typeof valor === "string") {
      return valor.trim() || fallback
    }

    if (typeof valor === "object") {
      return (
        valor.url ||
        valor.path ||
        valor.image_url ||
        fallback
      )
    }

    return fallback
  }

  // =====================================================
  // CARREGAR PERFIL DO USUÁRIO AUTENTICADO
  // =====================================================

  async function buscarPerfil() {
    try {
      setCarregandoPerfil(true)
      setErroPerfil("")

      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/")
        return
      }
     // IDENTIFICAR O PERFIL SOLICITADO NA URL
const parametros = new URLSearchParams(window.location.search)
const idNaUrl = parametros.get("users_id")

const idSolicitado =
  idNaUrl && /^[1-9]\d*$/.test(idNaUrl)
    ? Number(idNaUrl)
    : null

setPerfilVisitadoId(idSolicitado)

      // DEFINIR QUAL ENDPOINT CONSULTAR
const urlPerfil = idSolicitado
  ? `${XANO_BASE}/perfil_publico?users_id=${idSolicitado}`
  : `${XANO_BASE}/meu_perfil`

const resposta = await fetch(urlPerfil, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json"
  },
  cache: "no-store"
})

      if (!resposta.ok) {
        if (resposta.status === 401) {
          localStorage.removeItem("token")
          router.replace("/")
          return
        }

        throw new Error(
          `Não foi possível carregar o perfil. Código: ${resposta.status}`
        )
      }

      // RECEBER A RESPOSTA DO XANO
const dados = await resposta.json()

// IDENTIFICAR SE É PERFIL PRÓPRIO OU VISITADO
const visualizandoOutro = idSolicitado !== null

// EXTRAIR OS DADOS CORRETAMENTE
const dadosPerfil = visualizandoOutro
  ? dados?.perfil
  : dados

// VALIDAR O PERFIL
if (
  !dadosPerfil ||
  typeof dadosPerfil !== "object" ||
  !dadosPerfil.users_id
) {
  throw new Error(
    "O Xano não retornou um perfil válido."
  )
}

// REGISTRAR SE É UM PERFIL VISITADO
setVisualizandoOutroPerfil(visualizandoOutro)

// GUARDAR OS DADOS DO PERFIL
setPerfil(dadosPerfil)

// FOTO DE PERFIL
setFotoPerfil(
  obterUrlImagem(dadosPerfil.foto_perfil, "")
)

// FOTO DE CAPA
setFotoCapa(
  obterUrlImagem(dadosPerfil.foto_capa, "")
)

// CARREGAR AS PUBLICAÇÕES DESSE USUÁRIO
await buscarTotalPosts(dadosPerfil.users_id)
    } catch (erro) {
      console.error("Erro ao buscar perfil:", erro)

      setErroPerfil(
        erro.message || "Erro ao carregar perfil."
      )

      setCarregandoPosts(false)
    } finally {
      setCarregandoPerfil(false)
    }
  }

  // =====================================================
  // BUSCAR PUBLICAÇÕES DO USUÁRIO
  // =====================================================

  async function buscarTotalPosts(usuarioId) {
    try {
      setCarregandoPosts(true)

      const [
        resTexto,
        resImagens,
        resVideos
      ] = await Promise.all([
        fetch(`${XANO_BASE}/posts`),
        fetch(`${XANO_BASE}/get_imagens`),
        fetch(`${XANO_BASE}/listar-publicacoes-videos`)
      ])

      if (
        !resTexto.ok ||
        !resImagens.ok ||
        !resVideos.ok
      ) {
        throw new Error(
          "Erro ao buscar publicações do Xano"
        )
      }

      const respostaTexto = await resTexto.json()
      const respostaImagens = await resImagens.json()
      const respostaVideos = await resVideos.json()

      function extrairLista(dados) {
        if (Array.isArray(dados)) return dados
        if (Array.isArray(dados?.items)) return dados.items
        if (Array.isArray(dados?.result)) return dados.result
        return []
      }

      const postsTexto = extrairLista(respostaTexto)
      const postsImagens = extrairLista(respostaImagens)
      const postsVideos = extrairLista(respostaVideos)

      const textosDoUsuario = postsTexto.filter(
        post =>
          Number(post._usuario_id) === Number(usuarioId)
      )

      const imagensDoUsuario = postsImagens.filter(
        post =>
          Number(post.usuario_id) === Number(usuarioId)
      )

      const videosDoUsuario = postsVideos.filter(
        post =>
          Number(post.usuario_id) === Number(usuarioId)
      )

      setTotalPosts(
        textosDoUsuario.length +
        imagensDoUsuario.length +
        videosDoUsuario.length
      )

      const publicacoesTexto = textosDoUsuario.map(
        post => ({
          tipo: "texto",
          id: post.id,
          texto: post.texto,
          data: post.id
        })
      )

      const publicacoesImagem = imagensDoUsuario.map(
        post => ({
          tipo: "imagem",
          id: post.id,
          imagem: post.image_url,
          data: post.id
        })
      )

      const publicacoesVideo = videosDoUsuario.map(
        post => ({
          tipo: "video",
          id: post.id,
          video: post.url_do_video,
          legenda: post.legenda || "",
          data: post.id
        })
      )

      const todasPublicacoes = [
        ...publicacoesTexto,
        ...publicacoesImagem,
        ...publicacoesVideo
      ].sort(
        (a, b) => Number(b.data) - Number(a.data)
      )

      setPostsPerfil(todasPublicacoes)
    } catch (erro) {
      console.error(
        "Erro ao buscar posts do perfil:",
        erro
      )

      setPostsPerfil([])
      setTotalPosts(0)
    } finally {
      setCarregandoPosts(false)
    }
  }

  useEffect(() => {
    buscarPerfil()
  }, [])

  // =====================================================
  // EDIÇÃO DO PERFIL
  // =====================================================

 function abrirEdicaoPerfil() {
  if (
    !perfil ||
    visualizandoOutroPerfil ||
    operacaoEmAndamento
  ) return

    setNomeEditado(perfil.nome || "")
    setBioEditada(perfil.bio || "")
    setErroEdicao("")
    setEditandoPerfil(true)
  }

  // =====================================================
  // ATUALIZAR PERFIL NO XANO
  // =====================================================

  async function atualizarPerfilXano(campos) {
    if (visualizandoOutroPerfil) {
  throw new Error(
    "Você não tem permissão para editar este perfil."
  )
}
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error(
        "Sua sessão expirou. Entre novamente."
      )
    }

    const resposta = await fetch(
      `${XANO_BASE}/meu_perfil`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(campos)
      }
    )

    if (resposta.status === 401) {
      localStorage.removeItem("token")
      router.replace("/")

      throw new Error(
        "Sua sessão expirou."
      )
    }

    if (!resposta.ok) {
      const detalhes = await resposta
        .text()
        .catch(() => "")

      throw new Error(
        `Não foi possível atualizar o perfil. Código: ${resposta.status}. ${detalhes}`
      )
    }

    const atualizado = await resposta.json()

    if (
      !atualizado ||
      Number(atualizado.users_id) !==
        Number(perfil.users_id)
    ) {
      throw new Error(
        "O Xano não retornou o perfil atualizado corretamente."
      )
    }

    return atualizado
  }

  // Preserva os dados já existentes.
  function montarDadosPerfil(alteracoes = {}) {
    return {
      nome: perfil.nome || "",
      username: perfil.username || "",
      bio: perfil.bio || "",
      foto_perfil: perfil.foto_perfil || "",
      foto_capa: perfil.foto_capa || "",
      ...alteracoes
    }
  }

  function aplicarPerfilAtualizado(atualizado) {
    setPerfil(atualizado)

    // NOVO: não utiliza mais /insta.png.
    setFotoPerfil(
      obterUrlImagem(atualizado.foto_perfil, "")
    )

    setFotoCapa(
      obterUrlImagem(atualizado.foto_capa, "")
    )
  }

  // =====================================================
  // SALVAR NOME E BIOGRAFIA
  // =====================================================

  async function salvarEdicaoPerfil(evento) {
    evento.preventDefault()

    if (!perfil || operacaoEmAndamento) return

    const nome = nomeEditado.trim()
    const bio = bioEditada.trim()

    if (!nome) {
      setErroEdicao(
        "Informe um nome para o perfil."
      )
      return
    }

    try {
      setSalvandoPerfil(true)
      setErroEdicao("")

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          nome,
          bio
        })
      )

      aplicarPerfilAtualizado(atualizado)
      setEditandoPerfil(false)
    } catch (erro) {
      console.error(
        "Erro ao salvar perfil:",
        erro
      )

      setErroEdicao(
        erro.message ||
        "Não foi possível salvar as alterações."
      )
    } finally {
      setSalvandoPerfil(false)
    }
  }

  // =====================================================
  // UPLOAD DE IMAGEM
  // UTILIZA A ROTA EXISTENTE DO CONRAD AI
  // =====================================================

  async function enviarImagem(arquivo) {
    if (!arquivo.type.startsWith("image/")) {
      throw new Error(
        "Selecione um arquivo de imagem."
      )
    }

    const formData = new FormData()
    formData.append("file", arquivo)

    const respostaUpload = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData
      }
    )

    if (!respostaUpload.ok) {
      throw new Error(
        `Falha no envio da imagem. Código: ${respostaUpload.status}`
      )
    }

    const dadosUpload = await respostaUpload.json()
    const urlImagem = dadosUpload?.url

    if (
      typeof urlImagem !== "string" ||
      !/^https?:\/\//i.test(urlImagem)
    ) {
      throw new Error(
        "O upload não retornou um endereço válido para a imagem."
      )
    }

    return urlImagem
  }

  // =====================================================
  // ALTERAR FOTO DE PERFIL
  // =====================================================

  async function alterarFotoPerfil(evento) {
    const arquivo = evento.target.files?.[0]

    if (
      !arquivo ||
      !perfil ||
      operacaoEmAndamento
    ) {
      return
    }

    try {
      setSalvandoFoto(true)

      const urlFoto = await enviarImagem(arquivo)

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          foto_perfil: urlFoto
        })
      )

      const urlSalva = obterUrlImagem(
        atualizado.foto_perfil,
        ""
      )

      if (urlSalva !== urlFoto) {
        throw new Error(
          "O Xano não confirmou o salvamento da fotografia."
        )
      }

      aplicarPerfilAtualizado(atualizado)

      alert(
        "Foto de perfil salva com sucesso!"
      )
    } catch (erro) {
      console.error(
        "Erro ao salvar foto de perfil:",
        erro
      )

      alert(
        erro.message ||
        "Não foi possível salvar a foto de perfil."
      )
    } finally {
      setSalvandoFoto(false)
      evento.target.value = ""
    }
  }

  // =====================================================
  // ALTERAR E SALVAR FOTO DE CAPA
  // =====================================================

  async function alterarFotoCapa(evento) {
    const arquivo = evento.target.files?.[0]

    if (
      !arquivo ||
      !perfil ||
      operacaoEmAndamento
    ) {
      return
    }

    try {
      setSalvandoCapa(true)

      const urlCapa = await enviarImagem(arquivo)

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          foto_capa: urlCapa
        })
      )

      const urlSalva = obterUrlImagem(
        atualizado.foto_capa,
        ""
      )

      if (urlSalva !== urlCapa) {
        throw new Error(
          "O Xano não confirmou o salvamento da foto de capa. Verifique o campo foto_capa."
        )
      }

      aplicarPerfilAtualizado(atualizado)

      alert(
        "Foto de capa salva com sucesso!"
      )
    } catch (erro) {
      console.error(
        "Erro ao salvar foto de capa:",
        erro
      )

      alert(
        erro.message ||
        "Não foi possível salvar a foto de capa."
      )
    } finally {
      setSalvandoCapa(false)
      evento.target.value = ""
    }
  }

  // =====================================================
  // MENU LATERAL
  // =====================================================

  const itensMenu = [
    {
      id: "home",
      texto: "🏠 Home",
      rota: "/feed"
    },
    {
      id: "explorar",
      texto: "📰 Feed",
      rota: "/imagens"
    },
    {
      id: "videos",
      texto: "🎬 Feed de vídeos",
      rota: "/feed-videos"
    },
    {
      id: "privacidade",
      texto: "🔒 Política de Privacidade",
      rota: "/politica-de-privacidade"
    },
    {
      id: "termos",
      texto: "📜 Termos de Uso",
      rota: "/termos-de-uso"
    }
  ]

  // =====================================================
  // PUBLICAÇÕES
  // =====================================================

  function renderizarPublicacao(post) {
    return (
      <div
        key={`${post.tipo}-${post.id}`}
        style={styles.postCard}
      >
        {post.tipo === "texto" && (
          <div style={styles.postTexto}>
            {post.texto}
          </div>
        )}

        {post.tipo === "imagem" && (
          <img
            src={post.imagem}
            alt="Publicação"
            style={styles.postImagem}
          />
        )}

        {post.tipo === "video" && (
          <div>
            <video
              src={post.video}
              controls
              playsInline
              preload="metadata"
              style={styles.postVideo}
            />

            {post.legenda && (
              <p style={styles.postTexto}>
                {post.legenda}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // INTERFACE DA PÁGINA
  // =====================================================

  return (
    <div style={styles.page}>
      {/* MENU LATERAL */}
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
                  ...(hoverItem === "home" &&
                    styles.menuHover)
                }}
                onMouseEnter={() =>
                  setHoverItem("home")
                }
                onMouseLeave={() =>
                  setHoverItem("")
                }
              >
                🏠 Home
              </div>
            </Link>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "ia" &&
                  styles.menuHover),
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
              onMouseEnter={() =>
                setHoverItem("ia")
              }
              onMouseLeave={() =>
                setHoverItem("")
              }
              onClick={() =>
                router.push("/IA")
              }
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
                ...(hoverItem === "explorar" &&
                  styles.menuHover)
              }}
              onMouseEnter={() =>
                setHoverItem("explorar")
              }
              onMouseLeave={() =>
                setHoverItem("")
              }
              onClick={() =>
                router.push("/imagens")
              }
            >
              📰 Feed
            </div>

            <div style={styles.menuAtivo}>
              👤 Perfil
            </div>

            {itensMenu
              .filter(
                item =>
                  item.id !== "home" &&
                  item.id !== "explorar"
              )
              .map(item => (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuItem,
                    ...(hoverItem === item.id &&
                      styles.menuHover)
                  }}
                  onMouseEnter={() =>
                    setHoverItem(item.id)
                  }
                  onMouseLeave={() =>
                    setHoverItem("")
                  }
                  onClick={() =>
                    router.push(item.rota)
                  }
                >
                  {item.texto}
                </div>
              ))}
          </div>
        </div>

        <div
          style={{
            ...styles.logout,
            ...(hoverItem === "logout" &&
              styles.logoutHover)
          }}
          onMouseEnter={() =>
            setHoverItem("logout")
          }
          onMouseLeave={() =>
            setHoverItem("")
          }
          onClick={logout}
        >
          Sair
        </div>
      </div>

    {/* CONTEÚDO PRINCIPAL */}
<div style={styles.content}>
  <div style={styles.navbar}>
    <PesquisaUsuariosPerfil />
  </div>

        {carregandoPerfil ? (
          <div style={styles.estadoPerfil}>
            Carregando seu perfil...
          </div>
        ) : erroPerfil ? (
          <div style={styles.estadoPerfil}>
            <p>{erroPerfil}</p>

            <button
              onClick={buscarPerfil}
              style={styles.botao}
            >
              Tentar novamente
            </button>
          </div>
        ) : perfil ? (
          <div style={styles.card}>
            {/* FOTO DE CAPA */}
            <div style={styles.bannerContainer}>
              {fotoCapa ? (
                <img
                  src={fotoCapa}
                  alt="Capa do perfil"
                  style={styles.banner}
                />
              ) : (
                <div
                  style={styles.bannerVazio}
                >
                  <span style={styles.iconeCapa}>
                    🖼️
                  </span>

                  <span>
                    Adicione uma foto de capa
                  </span>
                </div>
              )}
             {!visualizandoOutroPerfil && (
  <label
    style={{
      ...styles.changeCoverButton,
      opacity: operacaoEmAndamento ? 0.65 : 1,
      cursor: operacaoEmAndamento ? "wait" : "pointer"
    }}
  >
    {salvandoCapa ? "Salvando capa..." : "Alterar capa"}

    <input
      type="file"
      accept="image/*"
      hidden
      disabled={operacaoEmAndamento}
      onChange={alterarFotoCapa}
    />
  </label>
)}
</div>

          {/* FOTO DE PERFIL */}
<div style={styles.avatarArea}>
  {visualizandoOutroPerfil ? (
    <div>
      {fotoPerfil ? (
        <img
          src={fotoPerfil}
          alt="Foto de perfil"
          style={styles.avatar}
        />
      ) : (
        <div style={styles.avatarVazio}>
          👤
        </div>
      )}
    </div>
  ) : (
    <label
      style={{
        ...styles.avatarLabel,
        opacity: operacaoEmAndamento ? 0.65 : 1,
        cursor: operacaoEmAndamento ? "wait" : "pointer"
      }}
      title="Alterar foto de perfil"
    >
      {fotoPerfil ? (
        <img
          src={fotoPerfil}
          alt="Foto de perfil"
          style={styles.avatar}
        />
      ) : (
        <div style={styles.avatarVazio}>
          👤
        </div>
      )}

      <span style={styles.avatarHint}>
        {salvandoFoto ? "Salvando foto..." : "Alterar foto"}
      </span>

      <input
        type="file"
        accept="image/*"
        hidden
        disabled={operacaoEmAndamento}
        onChange={alterarFotoPerfil}
      />
    </label>
  )}
</div>

{/* INFORMAÇÕES */}
            <div style={styles.info}>
              <div>
                <div style={styles.nome}>
                  {perfil.nome?.trim() ||
                    "Novo usuário"}
                </div>

                <div style={styles.usuario}>
                  {perfil.username?.trim()
                    ? `@${perfil.username.trim()}`
                    : "@usuario"}
                </div>
              </div>

              {!visualizandoOutroPerfil && (
  <button
    type="button"
    style={styles.botao}
    onClick={abrirEdicaoPerfil}
    disabled={operacaoEmAndamento}
  >
    Editar perfil
  </button>
)}
            </div>

            <div style={styles.bio}>
              {perfil.bio?.trim() ||
                "Nenhuma biografia adicionada."}
            </div>

            {/* ESTATÍSTICAS */}
            <div style={styles.stats}>
              <div style={styles.statBox}>
                <div style={styles.statNumero}>
                  {totalPosts}
                </div>

                <div style={styles.statTexto}>
                  Posts
                </div>
              </div>

              <div style={styles.statBox}>
                <div style={styles.statNumero}>
                  0
                </div>

                <div style={styles.statTexto}>
                  Seguidores
                </div>
              </div>

              <div style={styles.statBox}>
                <div style={styles.statNumero}>
                  0
                </div>

                <div style={styles.statTexto}>
                  Seguindo
                </div>
              </div>
            </div>

            {/* PUBLICAÇÕES */}
            <div style={styles.publicacoes}>
              <div style={styles.tituloPublicacoes}>
                Publicações
              </div>

              {carregandoPosts ? (
                <div style={styles.mensagemPosts}>
                  Carregando publicações...
                </div>
              ) : postsPerfil.length === 0 ? (
                <div style={styles.mensagemPosts}>
                  Nenhuma publicação ainda.
                </div>
              ) : (
                postsPerfil.map(
                  renderizarPublicacao
                )
              )}
            </div>
          </div>
        ) : null}

        {/* JANELA EDITAR PERFIL */}
        {editandoPerfil && (
          <div
            style={styles.modalOverlay}
            onClick={() => {
              if (!salvandoPerfil) {
                setEditandoPerfil(false)
              }
            }}
          >
            <form
              style={styles.modal}
              onClick={evento =>
                evento.stopPropagation()
              }
              onSubmit={salvarEdicaoPerfil}
            >
              <h2 style={styles.modalTitulo}>
                Editar perfil
              </h2>

              <label
                htmlFor="nome-perfil"
                style={styles.campoLabel}
              >
                Nome
              </label>

              <input
                id="nome-perfil"
                type="text"
                maxLength={100}
                value={nomeEditado}
                onChange={evento =>
                  setNomeEditado(
                    evento.target.value
                  )
                }
                style={styles.campoInput}
                disabled={salvandoPerfil}
                required
              />

              <label
                htmlFor="bio-perfil"
                style={styles.campoLabel}
              >
                Biografia
              </label>

              <textarea
                id="bio-perfil"
                maxLength={500}
                rows={5}
                value={bioEditada}
                onChange={evento =>
                  setBioEditada(
                    evento.target.value
                  )
                }
                style={styles.campoInput}
                disabled={salvandoPerfil}
              />

              {erroEdicao && (
                <p
                  style={styles.erroEdicao}
                  role="alert"
                >
                  {erroEdicao}
                </p>
              )}

              <div style={styles.modalBotoes}>
                <button
                  type="button"
                  style={styles.botaoCancelar}
                  disabled={salvandoPerfil}
                  onClick={() =>
                    setEditandoPerfil(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={styles.botao}
                  disabled={salvandoPerfil}
                >
                  {salvandoPerfil
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// ESTILOS
// =====================================================

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
    border: "none",
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 18,
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center"
  },

  logoutHover: {
    transform: "translateY(5px)",
    opacity: 0.8
  },

  content: {
    flex: 1,
    padding: 10,
    minWidth: 0
  },

  navbar: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10
  },

  search: {
    width: 300,
    maxWidth: "100%",
    padding: 12,
    borderRadius: 30,
    border: "1px solid #ddd",
    outline: "none"
  },

  estadoPerfil: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 40,
    textAlign: "center",
    color: "#444",
    maxWidth: 900,
    margin: "0 auto"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    maxWidth: 900,
    margin: "0 auto"
  },

  bannerContainer: {
    position: "relative"
  },

  banner: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    display: "block"
  },

  // NOVO: capa neutra para perfis sem fotografia.
  bannerVazio: {
    width: "100%",
    height: 260,
    backgroundColor: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#6b7280",
    fontSize: 18,
    textAlign: "center"
  },

  iconeCapa: {
    fontSize: 42
  },

  changeCoverButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#000",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold"
  },

  avatarArea: {
    marginTop: -40,
    marginLeft: 30,
    position: "relative",
    zIndex: 10
  },

  avatarLabel: {
    display: "inline-block",
    position: "relative",
    cursor: "pointer"
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    backgroundColor: "white",
    padding: 6,
    objectFit: "cover",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  },

  // NOVO: avatar neutro para novos usuários.
  avatarVazio: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    padding: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 65,
    color: "#6b7280",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  },

  avatarHint: {
    display: "block",
    textAlign: "center",
    color: "#555",
    fontSize: 13
  },

  info: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px 0px 30px",
    gap: 16,
    flexWrap: "wrap"
  },

  nome: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#222",
    overflowWrap: "anywhere"
  },

  usuario: {
    fontSize: 22,
    color: "#666",
    marginTop: 5
  },

  botao: {
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s"
  },

  bio: {
    fontSize: 24,
    color: "#333",
    padding: "20px 30px",
    overflowWrap: "anywhere"
  },

  stats: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid #eee",
    marginTop: 10,
    padding: 30
  },

  statBox: {
    textAlign: "center"
  },

  statNumero: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222"
  },

  statTexto: {
    marginTop: 5,
    color: "#666",
    fontSize: 18
  },

  publicacoes: {
    borderTop: "1px solid #eee",
    padding: 30
  },

  tituloPublicacoes: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20
  },

  mensagemPosts: {
    textAlign: "center",
    color: "#666",
    fontSize: 18,
    padding: 30
  },

  postCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    border: "1px solid #eee"
  },

  postTexto: {
    fontSize: 20,
    color: "#222",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap"
  },

  postImagem: {
    width: "100%",
    maxHeight: 600,
    objectFit: "cover",
    borderRadius: 12,
    display: "block"
  },

  postVideo: {
    width: "100%",
    maxHeight: 600,
    objectFit: "contain",
    borderRadius: 12,
    display: "block",
    backgroundColor: "#000"
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 16
  },

  modal: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 10px 35px rgba(0,0,0,0.2)"
  },

  modalTitulo: {
    margin: "0 0 10px",
    fontSize: 26
  },

  campoLabel: {
    fontWeight: "bold",
    fontSize: 16
  },

  campoInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 10,
    font: "inherit"
  },

  erroEdicao: {
    color: "#b42318",
    margin: 0
  },

  modalBotoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12
  },

  botaoCancelar: {
    backgroundColor: "#eee",
    color: "#222",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: 18,
    cursor: "pointer"
  }
}

