
"use client";

import "@fontsource/inter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const XANO_BASE =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3";

const XANO_POST_URL = `${XANO_BASE}/publicacoes_videos`;
const XANO_GET_URL = `${XANO_BASE}/listar-publicacoes-videos`;
const XANO_INICIAR_ANALISE_URL = `${XANO_BASE}/iniciar_analise_video`;
const XANO_CONSULTAR_ANALISE_URL = `${XANO_BASE}/consultar_analise_video`;

const WORKER_STORAGE =
  "https://sentiment-gemini-vision-video.claitonwr17.workers.dev/";

// =====================================================
// AUTENTICAÇÃO E PERFIS
// =====================================================

function obterToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function headersAutenticados() {
  const token = obterToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function obterUrlFoto(valor) {
  if (!valor) return "";

  if (typeof valor === "string") {
    return valor.trim();
  }

  if (typeof valor === "object") {
    return (
      valor.url ||
      valor.path ||
      valor.image_url ||
      ""
    );
  }

  return "";
}


function obterPerfilDoVideo(item) {
  if (!item) return null;

  const fontes = [
    item._perfis_of_users,
    item._perfis,
    item.perfis,
    item.perfil,
  ];

  for (const fonte of fontes) {
    if (Array.isArray(fonte)) {
      if (fonte.length > 0) {
        return fonte[0];
      }
    } else if (fonte && typeof fonte === "object") {
      return fonte;
    }
  }

  return null;
}


function obterIdAutor(item) {
  return (
    item?.id_do_usuário ??
    item?.usuario_id ??
    item?._usuario_id ??
    null
  );
}

function obterAutorVideo(item, perfilAtual) {
  const perfil = obterPerfilDoVideo(item);

  if (perfil) {
    return {
      nome: perfil.nome || "Usuário",
      foto: obterUrlFoto(perfil.foto_perfil),
    };
  }

  const idAutor = obterIdAutor(item);

  if (
    perfilAtual &&
    idAutor != null &&
    Number(idAutor) === Number(perfilAtual.users_id)
  ) {
    return {
      nome: perfilAtual.nome || "Usuário",
      foto: obterUrlFoto(perfilAtual.foto_perfil),
    };
  }

  return {
    nome: "Usuário",
    foto: "",
  };
}

function Avatar({ foto }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt="Foto de perfil"
        style={styles.avatarImage}
      />
    );
  }

  return (
    <div style={styles.avatarVazio}>
      👤
    </div>
  );
}

// =====================================================
// RESULTADOS DA INTELIGÊNCIA ARTIFICIAL
// =====================================================

function extrairResultadoAnalise(dados) {
  return (
    dados?.api1?.response?.result ||
    dados?.api1?.result ||
    dados?.response?.result ||
    dados?.result ||
    dados
  );
}

function extrairNomeOperacao(dados) {
  return (
    dados?.operationName ||
    dados?.nome_da_operacao ||
    dados?.result?.operationName ||
    dados?.response?.result?.operationName ||
    dados?.api1?.response?.result?.operationName ||
    ""
  );
}

function ResultadoAnaliseVideo({
  resultado,
  publicado = false,
}) {
  if (!resultado) return null;

  const interpretacao =
    resultado.geminiAnaliseFinal ||
    resultado.geminiAnaliseTextual;

  return (
    <div
      style={
        publicado
          ? styles.painelAnalisePublicada
          : styles.painelAnalise
      }
    >
      <h3 style={styles.tituloAnalise}>
        {publicado
          ? "✨ Análise do vídeo concluída"
          : "Análise do vídeo concluída"}
      </h3>

      {interpretacao ? (
        <div style={styles.blocoAnalise}>
          <h4 style={styles.subtituloAnalise}>
            Interpretação do Conrad AI
          </h4>

          <p style={styles.textoAnalise}>
            {typeof interpretacao === "string"
              ? interpretacao
              : JSON.stringify(interpretacao, null, 2)}
          </p>
        </div>
      ) : (
        <p style={styles.mensagem}>
          A análise foi concluída, mas não foi
          retornada uma interpretação para exibição.
        </p>
      )}
    </div>
  );
}
// =====================================================
// CONRAD AI - PESQUISA DE USUÁRIOS
// =====================================================

function PesquisaUsuariosVideos() {
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
        const token = obterToken();

        if (!token) {
          throw new Error(
            "Faça login para pesquisar usuários."
          );
        }

        const url = new URL(
          `${XANO_BASE}/pesquisar_usuarios`
        );

        url.searchParams.set("busca", termo);

        const resposta = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
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
          console.error("Erro na pesquisa de usuários:", error);

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

  // Fecha a lista ao clicar fora da pesquisa.
  useEffect(() => {
    function fecharPesquisa(event) {
      if (
        areaRef.current &&
        !areaRef.current.contains(event.target)
      ) {
        setMostrarResultados(false);
      }
    }

    document.addEventListener("mousedown", fecharPesquisa);

    return () => {
      document.removeEventListener(
        "mousedown",
        fecharPesquisa
      );
    };
  }, []);

  const estilos = {
    area: {
      position: "relative",
      width: 300,
      maxWidth: "100%",
      zIndex: 100,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 16px",
      border: "1px solid #ddd",
      borderRadius: 22,
      backgroundColor: "#fff",
      fontSize: 15,
      outline: "none",
    },

    resultados: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: "min(350px, 90vw)",
      maxHeight: 350,
      overflowY: "auto",
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
      zIndex: 101,
    },

    usuario: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderBottom: "1px solid #f0f0f0",
    },

    foto: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0,
    },

    semFoto: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      backgroundColor: "#f0f2f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    dados: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    },

    nome: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#222",
      overflowWrap: "anywhere",
    },

    username: {
      color: "#777",
      fontSize: 13,
      overflowWrap: "anywhere",
    },

    mensagem: {
      padding: 15,
      fontSize: 14,
      color: "#666",
    },
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
                color: "#b91c1c",
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
              <div
                key={usuario.id}
                style={estilos.usuario}
              >
                {usuario.foto_perfil ? (
                  <img
                    src={obterUrlFoto(usuario.foto_perfil)}
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function FeedVideos() {
  const router = useRouter();

  const [hoverItem, setHoverItem] = useState("");
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);

  const [videoSelecionado, setVideoSelecionado] =
    useState(null);
  const [arquivoVideo, setArquivoVideo] = useState(null);

  const [publicando, setPublicando] = useState(false);
  const [enviandoVideo, setEnviandoVideo] =
    useState(false);
  const [analisandoVideo, setAnalisandoVideo] =
    useState(false);

  const [analiseConcluida, setAnaliseConcluida] =
    useState(false);
  const [resultadoAnalise, setResultadoAnalise] =
    useState(null);
  const [erroAnalise, setErroAnalise] = useState("");
  const [operationName, setOperationName] = useState("");

  const [videos, setVideos] = useState([]);
  const [carregandoVideos, setCarregandoVideos] =
    useState(true);
  const [erroFeed, setErroFeed] = useState("");

  const [comentariosAbertos, setComentariosAbertos] =
    useState({});
  const [novoComentario, setNovoComentario] =
    useState({});
  const [atualizandoInteracao, setAtualizandoInteracao] =
    useState({});

  const [analisesPublicadas, setAnalisesPublicadas] =
    useState({});

  const uploadEmAndamentoRef = useRef(null);
  const arquivoAtualRef = useRef(null);
  const dadosUploadRef = useRef(null);
  const versaoVideoRef = useRef(0);

  const consultasPublicadasRef = useRef(new Set());
  const iniciandoPublicadasRef = useRef(new Set());
  const interacoesEmAndamentoRef = useRef(new Set());
  const consultaPreviaRef = useRef(false);

  // =====================================================
  // CARREGAR PERFIL DO USUÁRIO CONECTADO
  // =====================================================

  useEffect(() => {
    let ativo = true;

    async function carregarPerfilAtual() {
      try {
        setCarregandoPerfil(true);

        const token = obterToken();

        if (!token) {
          router.replace("/");
          return;
        }

        const resposta = await fetch(
          `${XANO_BASE}/meu_perfil`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.replace("/");
          return;
        }

        if (!resposta.ok) {
          throw new Error(
            `Erro ao carregar perfil: ${resposta.status}`
          );
        }

        const dados = await resposta.json();

        if (!dados?.users_id) {
          throw new Error(
            "O Xano não retornou um perfil válido."
          );
        }

        if (ativo) {
          setPerfilAtual(dados);
        }
      } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);

        if (ativo) {
          setErroFeed(
            erro.message || "Erro ao carregar perfil."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoPerfil(false);
        }
      }
    }

    carregarPerfilAtual();

    return () => {
      ativo = false;
    };
  }, [router]);

  // =====================================================
  // CARREGAR VÍDEOS DO XANO
  // =====================================================

  const carregarVideos = useCallback(async () => {
    try {
      setCarregandoVideos(true);
      setErroFeed("");

      const resposta = await fetch(XANO_GET_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!resposta.ok) {
        throw new Error(
          `Erro ao carregar vídeos: ${resposta.status}`
        );
      }

      const dados = await resposta.json();

      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados?.api1)
          ? dados.api1
          : Array.isArray(dados?.data)
            ? dados.data
            : null;

      if (!lista) {
        throw new Error(
          "O Xano retornou uma lista de vídeos inválida."
        );
      }

      setVideos(lista);
    } catch (erro) {
      console.error("Erro ao carregar vídeos:", erro);
      setErroFeed(
        erro.message || "Erro ao carregar vídeos."
      );
    } finally {
      setCarregandoVideos(false);
    }
  }, []);

  useEffect(() => {
    carregarVideos();
  }, [carregarVideos]);

  // =====================================================
  // ATUALIZAR INTERAÇÕES SEM RECARREGAR O FEED
  // =====================================================

  async function atualizarInteracao(item, alteracoes) {
    const id = String(item.id);

    if (interacoesEmAndamentoRef.current.has(id)) {
      return false;
    }

    interacoesEmAndamentoRef.current.add(id);

    setAtualizandoInteracao((anterior) => ({
      ...anterior,
      [id]: true,
    }));

    try {
      const dados = {
        post_id: Number(item.id),
        url_do_video: item.url_do_video ?? "",
        id_cloudinary: item.id_cloudinary ?? "",
        legenda: item.legenda ?? null,

        // Mantém o autor original.
        // O Xano ainda deverá proteger esse campo.
        usuario_id: obterIdAutor(item),

        status: item.status ?? "publicado",

        curtidas: Number(
          alteracoes.curtidas ??
          item.curtidas ??
          0
        ),

        amei: Number(
          alteracoes.amei ??
          item.amei ??
          0
        ),

        comentarios: Array.isArray(
          alteracoes.comentarios
        )
          ? alteracoes.comentarios
          : Array.isArray(item.comentarios)
            ? item.comentarios
            : [],
      };

      const resposta = await fetch(XANO_POST_URL, {
        method: "POST",
        headers: headersAutenticados(),
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        throw new Error(
          `Erro ao atualizar interação: ${resposta.status}`
        );
      }

      // Atualiza somente o vídeo selecionado.
      // Não reorganiza o feed e não desloca a página.
      setVideos((listaAnterior) =>
        listaAnterior.map((video) =>
          String(video.id) === id
            ? {
                ...video,
                curtidas: dados.curtidas,
                amei: dados.amei,
                comentarios: dados.comentarios,
              }
            : video
        )
      );

      return true;
    } catch (erro) {
      console.error("Erro na interação:", erro);
      alert(
        "Não foi possível atualizar a interação."
      );
      return false;
    } finally {
      interacoesEmAndamentoRef.current.delete(id);

      setAtualizandoInteracao((anterior) => ({
        ...anterior,
        [id]: false,
      }));
    }
  }

  async function enviarComentario(item) {
    const texto = (
      novoComentario[item.id] || ""
    ).trim();

    if (!texto) {
      alert("Digite um comentário primeiro.");
      return;
    }

    const comentarios = Array.isArray(item.comentarios)
      ? item.comentarios
      : [];

    const sucesso = await atualizarInteracao(item, {
      comentarios: [...comentarios, texto],
    });

    if (sucesso) {
      setNovoComentario((anterior) => ({
        ...anterior,
        [item.id]: "",
      }));
    }
  }

  // =====================================================
  // SELECIONAR E CANCELAR VÍDEO
  // =====================================================

  function escolherVideo(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (
      publicando ||
      enviandoVideo ||
      analisandoVideo
    ) {
      alert("Aguarde a operação atual terminar.");
      return;
    }

    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado);
    }

    versaoVideoRef.current += 1;
    arquivoAtualRef.current = arquivo;
    dadosUploadRef.current = null;
    uploadEmAndamentoRef.current = null;

    setArquivoVideo(arquivo);
    setVideoSelecionado(
      URL.createObjectURL(arquivo)
    );

    setAnaliseConcluida(false);
    setResultadoAnalise(null);
    setErroAnalise("");
    setOperationName("");
    setAnalisandoVideo(false);
    setEnviandoVideo(false);

    event.target.value = "";
  }

  function cancelarVideo() {
    if (
      publicando ||
      enviandoVideo ||
      analisandoVideo
    ) {
      return;
    }

    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado);
    }

    versaoVideoRef.current += 1;
    arquivoAtualRef.current = null;
    dadosUploadRef.current = null;
    uploadEmAndamentoRef.current = null;

    setArquivoVideo(null);
    setVideoSelecionado(null);
    setAnaliseConcluida(false);
    setResultadoAnalise(null);
    setErroAnalise("");
    setOperationName("");
    setAnalisandoVideo(false);
    setEnviandoVideo(false);
  }

  // =====================================================
  // UPLOAD CLOUDINARY
  // =====================================================

  async function garantirUploadCloudinary() {
    if (!arquivoVideo) {
      throw new Error("Selecione um vídeo primeiro.");
    }

    if (
      dadosUploadRef.current &&
      arquivoAtualRef.current === arquivoVideo
    ) {
      return dadosUploadRef.current;
    }

    if (uploadEmAndamentoRef.current) {
      return uploadEmAndamentoRef.current;
    }

    const arquivoDestaOperacao = arquivoVideo;
    const versaoDestaOperacao =
      versaoVideoRef.current;

    const promessa = (async () => {
      const respostaAssinatura = await fetch(
        "/api/upload-video-signature",
        { method: "POST" }
      );

      const dadosAssinatura =
        await respostaAssinatura.json();

      if (!respostaAssinatura.ok) {
        throw new Error(
          dadosAssinatura.error ||
          "Não foi possível preparar o upload."
        );
      }

      const formulario = new FormData();

      formulario.append(
        "file",
        arquivoDestaOperacao
      );
      formulario.append(
        "api_key",
        dadosAssinatura.apiKey
      );
      formulario.append(
        "timestamp",
        String(dadosAssinatura.timestamp)
      );
      formulario.append(
        "signature",
        dadosAssinatura.signature
      );
      formulario.append(
        "folder",
        dadosAssinatura.folder
      );

      const respostaUpload = await fetch(
        `https://api.cloudinary.com/v1_1/${dadosAssinatura.cloudName}/video/upload`,
        {
          method: "POST",
          body: formulario,
        }
      );

      const resultado = await respostaUpload.json();

      if (!respostaUpload.ok) {
        throw new Error(
          resultado.error?.message ||
          "Erro ao enviar vídeo ao Cloudinary."
        );
      }

      if (
        !resultado.secure_url ||
        !resultado.public_id
      ) {
        throw new Error(
          "O Cloudinary não retornou os dados do vídeo."
        );
      }

      if (
        versaoVideoRef.current !==
          versaoDestaOperacao ||
        arquivoAtualRef.current !==
          arquivoDestaOperacao
      ) {
        throw new Error(
          "O vídeo selecionado mudou durante o upload."
        );
      }

      const dados = {
        secure_url: resultado.secure_url,
        public_id: resultado.public_id,
      };

      dadosUploadRef.current = dados;

      return dados;
    })();

    uploadEmAndamentoRef.current = promessa;
    setEnviandoVideo(true);

    try {
      return await promessa;
    } finally {
      if (
        uploadEmAndamentoRef.current === promessa
      ) {
        uploadEmAndamentoRef.current = null;
      }

      setEnviandoVideo(false);
    }
  }

  // =====================================================
  // PUBLICAR VÍDEO
  // =====================================================

  async function publicarVideo() {
    if (!arquivoVideo) {
      alert("Selecione um vídeo primeiro.");
      return;
    }

    if (!perfilAtual?.users_id) {
      alert(
        "Não foi possível identificar seu usuário."
      );
      return;
    }

    if (publicando || enviandoVideo) return;

    try {
      setPublicando(true);

      const dadosCloudinary =
        await garantirUploadCloudinary();

      const respostaXano = await fetch(
        XANO_POST_URL,
        {
          method: "POST",
          headers: headersAutenticados(),
          body: JSON.stringify({
            post_id: null,
            url_do_video:
              dadosCloudinary.secure_url,
            id_cloudinary:
              dadosCloudinary.public_id,
            legenda: null,

            // ID do perfil conectado.
            // O Xano deverá validá-lo com auth.id.
            usuario_id: perfilAtual.users_id,

            status: "publicado",
            curtidas: 0,
            amei: 0,
            comentarios: [],
          }),
        }
      );

      const textoResposta =
        await respostaXano.text();

      let dadosXano = null;

      try {
        dadosXano = textoResposta
          ? JSON.parse(textoResposta)
          : null;
      } catch {
        dadosXano = textoResposta;
      }

      if (!respostaXano.ok) {
        throw new Error(
          dadosXano?.message ||
          dadosXano?.mensagem ||
          dadosXano?.error ||
          `O Xano não salvou o vídeo: ${respostaXano.status}`
        );
      }

      // Preserva a gravação independente no GCS.
      try {
        const respostaStorage = await fetch(
          WORKER_STORAGE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              acao: "salvar_video",
              videoUri:
                dadosCloudinary.secure_url,
            }),
          }
        );

        const dadosStorage =
          await respostaStorage.json();

        if (
          !respostaStorage.ok ||
          dadosStorage.status !== "salvo"
        ) {
          throw new Error(
            dadosStorage.detalhes ||
            dadosStorage.erro ||
            "O Google Storage não confirmou a gravação."
          );
        }

        console.log(
          "Vídeo salvo no Google Storage:",
          dadosStorage.videoUri
        );
      } catch (erroStorage) {
        console.error(
          "Falha ao salvar vídeo no Google Storage:",
          erroStorage
        );
      }

      await carregarVideos();

      if (!analisandoVideo) {
        cancelarVideo();
      }

      alert(
        "Vídeo publicado e salvo no Xano com sucesso!"
      );
    } catch (erro) {
      console.error("Erro ao publicar vídeo:", erro);
      alert(
        erro.message || "Erro ao publicar vídeo."
      );
    } finally {
      setPublicando(false);
    }
  }

  // =====================================================
  // INICIAR ANÁLISE ANTES DA PUBLICAÇÃO
  // =====================================================

  async function enviarVideoParaAnalise() {
    if (!arquivoVideo) {
      alert("Selecione um vídeo primeiro.");
      return;
    }

    if (
      enviandoVideo ||
      publicando ||
      analisandoVideo
    ) {
      return;
    }

    try {
      setErroAnalise("");
      setAnaliseConcluida(false);
      setResultadoAnalise(null);
      setOperationName("");

      const resultado =
        await garantirUploadCloudinary();

      const resposta = await fetch(
        XANO_INICIAR_ANALISE_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUri: resultado.secure_url,
            operationName: "",
          }),
        }
      );

      const texto = await resposta.text();

      let dados = null;

      try {
        dados = texto ? JSON.parse(texto) : null;
      } catch {
        dados = texto;
      }

      if (!resposta.ok) {
        throw new Error(
          "O Xano não conseguiu iniciar a análise."
        );
      }

      const nomeOperacao =
        extrairNomeOperacao(dados);

      if (!nomeOperacao) {
        throw new Error(
          "O Xano não retornou o identificador da análise."
        );
      }

      setOperationName(nomeOperacao);
      setAnalisandoVideo(true);

      alert("Análise iniciada com sucesso!");
    } catch (erro) {
      console.error("Erro ao iniciar análise:", erro);
      setErroAnalise(
        erro.message || "Erro ao iniciar análise."
      );
      alert(
        erro.message || "Erro ao iniciar análise."
      );
    }
  }

  // =====================================================
  // CONSULTAR ANÁLISE ANTES DA PUBLICAÇÃO
  // =====================================================

  const consultarResultadoAnalise = useCallback(
    async () => {
      if (
        !operationName ||
        consultaPreviaRef.current
      ) {
        return;
      }

      consultaPreviaRef.current = true;

      try {
        const resposta = await fetch(
          `${XANO_CONSULTAR_ANALISE_URL}?operation_name=${encodeURIComponent(operationName)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const texto = await resposta.text();
        const dados = texto
          ? JSON.parse(texto)
          : null;

        const resultado =
          extrairResultadoAnalise(dados);

        if (resultado?.status === "concluido") {
          setResultadoAnalise(resultado);
          setAnaliseConcluida(true);
          setAnalisandoVideo(false);
          setErroAnalise("");
        } else if (
          resultado?.status === "parcial" ||
          resultado?.status === "erro"
        ) {
          setErroAnalise(
            resultado.detalhes ||
            resultado.mensagem ||
            "A análise não foi concluída."
          );

          setAnalisandoVideo(false);
          setAnaliseConcluida(false);
        } else if (!resposta.ok) {
          throw new Error(
            "Erro ao consultar a análise."
          );
        }
      } catch (erro) {
        console.error(
          "Erro ao consultar análise:",
          erro
        );

        setErroAnalise(
          erro.message ||
          "Erro ao consultar análise."
        );
        setAnalisandoVideo(false);
      } finally {
        consultaPreviaRef.current = false;
      }
    },
    [operationName]
  );

  useEffect(() => {
    if (!analisandoVideo || !operationName) return;

    const intervalo = setInterval(() => {
      consultarResultadoAnalise();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [
    analisandoVideo,
    operationName,
    consultarResultadoAnalise,
  ]);

  // =====================================================
  // ANÁLISE DE VÍDEOS JÁ PUBLICADOS
  // =====================================================

  async function analisarPublicacao(item) {
    const id = String(
      item.id ?? item.id_cloudinary ?? ""
    );

    const videoUri = item.url_do_video;

    if (!id || !videoUri) {
      alert(
        "Esta publicação não possui um vídeo válido."
      );
      return;
    }

    if (iniciandoPublicadasRef.current.has(id)) {
      return;
    }

    if (
      analisesPublicadas[id]?.status ===
        "iniciando" ||
      analisesPublicadas[id]?.status ===
        "processando"
    ) {
      return;
    }

    iniciandoPublicadasRef.current.add(id);

    setAnalisesPublicadas((anterior) => ({
      ...anterior,
      [id]: {
        status: "iniciando",
        operationName: "",
        resultado: null,
        erro: "",
      },
    }));

    try {
      const resposta = await fetch(
        XANO_INICIAR_ANALISE_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUri,
            operationName: "",
          }),
        }
      );

      const texto = await resposta.text();

      let dados = null;

      try {
        dados = texto ? JSON.parse(texto) : null;
      } catch {
        dados = texto;
      }

      if (!resposta.ok) {
        throw new Error(
          "O Xano não conseguiu iniciar a análise."
        );
      }

      const nomeOperacao =
        extrairNomeOperacao(dados);

      if (!nomeOperacao) {
        throw new Error(
          "O Xano não retornou o identificador da operação."
        );
      }

      setAnalisesPublicadas((anterior) => ({
        ...anterior,
        [id]: {
          status: "processando",
          operationName: nomeOperacao,
          resultado: null,
          erro: "",
        },
      }));
    } catch (erro) {
      console.error(
        "Erro ao analisar publicação:",
        erro
      );

      setAnalisesPublicadas((anterior) => ({
        ...anterior,
        [id]: {
          status: "erro",
          operationName: "",
          resultado: null,
          erro:
            erro.message ||
            "Não foi possível iniciar a análise.",
        },
      }));
    } finally {
      iniciandoPublicadasRef.current.delete(id);
    }
  }

  const consultarAnalisePublicada = useCallback(
    async (id, nomeOperacao) => {
      const chave = `${id}:${nomeOperacao}`;

      if (
        consultasPublicadasRef.current.has(chave)
      ) {
        return;
      }

      consultasPublicadasRef.current.add(chave);

      try {
        const resposta = await fetch(
          `${XANO_CONSULTAR_ANALISE_URL}?operation_name=${encodeURIComponent(nomeOperacao)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const texto = await resposta.text();

        let dados = null;

        try {
          dados = texto ? JSON.parse(texto) : null;
        } catch {
          throw new Error(
            "O Xano retornou uma resposta inválida."
          );
        }

        const resultado =
          extrairResultadoAnalise(dados);

        if (!resposta.ok) {
          throw new Error(
            resultado?.mensagem ||
            resultado?.detalhes ||
            "Erro ao consultar a análise."
          );
        }

        if (resultado?.status === "concluido") {
          setAnalisesPublicadas((anterior) => {
            if (
              anterior[id]?.operationName !==
              nomeOperacao
            ) {
              return anterior;
            }

            return {
              ...anterior,
              [id]: {
                status: "concluido",
                operationName: nomeOperacao,
                resultado,
                erro: "",
              },
            };
          });
        } else if (
          resultado?.status === "parcial" ||
          resultado?.status === "erro"
        ) {
          setAnalisesPublicadas((anterior) => {
            if (
              anterior[id]?.operationName !==
              nomeOperacao
            ) {
              return anterior;
            }

            return {
              ...anterior,
              [id]: {
                status: "erro",
                operationName: nomeOperacao,
                resultado: null,
                erro:
                  resultado.detalhes ||
                  resultado.mensagem ||
                  "A análise não foi concluída.",
              },
            };
          });
        }
      } catch (erro) {
        console.error(
          "Erro ao consultar análise publicada:",
          erro
        );

        setAnalisesPublicadas((anterior) => {
          if (
            anterior[id]?.operationName !==
            nomeOperacao
          ) {
            return anterior;
          }

          return {
            ...anterior,
            [id]: {
              status: "erro",
              operationName: nomeOperacao,
              resultado: null,
              erro:
                erro.message ||
                "Não foi possível consultar a análise.",
            },
          };
        });
      } finally {
        consultasPublicadasRef.current.delete(
          chave
        );
      }
    },
    []
  );

  useEffect(() => {
    const pendentes = Object.entries(
      analisesPublicadas
    ).filter(
      ([, analise]) =>
        analise.status === "processando" &&
        analise.operationName
    );

    if (pendentes.length === 0) return;

    const intervalo = setInterval(() => {
      pendentes.forEach(([id, analise]) => {
        consultarAnalisePublicada(
          id,
          analise.operationName
        );
      });
    }, 3000);

    return () => clearInterval(intervalo);
  }, [
    analisesPublicadas,
    consultarAnalisePublicada,
  ]);

  function fecharAnalisePublicada(id) {
    setAnalisesPublicadas((anterior) => {
      const atualizadas = { ...anterior };
      delete atualizadas[String(id)];
      return atualizadas;
    });
  }

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  function logout() {
    router.push("/feed");
  }

  const itensMenu = [
    { id: "home", texto: "🏠 Home", href: "/feed" },
    { id: "ia", texto: "IA", href: "/IA" },
    { id: "feed", texto: "📰 Feed", href: "/imagens" },
    { id: "perfil", texto: "👤 Perfil", href: "/perfil" },
    {
      id: "privacidade",
      texto: "🔒 Política de Privacidade",
      href: "/politica-de-privacidade",
    },
    {
      id: "termos",
      texto: "📜 Termos de Uso",
      href: "/termos-de-uso",
    },
  ];

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div style={styles.page}>
      {/* MENU LATERAL */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <img
            src="/logo/logo-simbolo.png"
            alt="Conrad"
            style={styles.logoImagem}
          />
          <span>Conrad</span>
        </div>

        <div style={styles.menu}>
          {itensMenu.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  ...styles.menuItem,
                  ...(hoverItem === item.id
                    ? styles.menuHover
                    : {}),
                }}
                onMouseEnter={() =>
                  setHoverItem(item.id)
                }
                onMouseLeave={() =>
                  setHoverItem("")
                }
              >
                {item.id === "ia" && (
                  <img
                    src="/logo/logo-simbolo.png"
                    alt="IA"
                    style={{
                      width: 28,
                      height: 28,
                      objectFit: "contain",
                      verticalAlign: "middle",
                      marginRight: 8,
                    }}
                  />
                )}
                {item.texto}
              </div>
            </Link>
          ))}

          <div style={styles.menuAtivo}>
            🎬 Feed de vídeos
          </div>

          {itensMenu.slice(4).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  ...styles.menuItem,
                  ...(hoverItem === item.id
                    ? styles.menuHover
                    : {}),
                }}
                onMouseEnter={() =>
                  setHoverItem(item.id)
                }
                onMouseLeave={() =>
                  setHoverItem("")
                }
              >
                {item.texto}
              </div>
            </Link>
          ))}

          <div
            style={{
              ...styles.logout,
              ...(hoverItem === "logout"
                ? styles.logoutHover
                : {}),
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
      </div>

      {/* CONTEÚDO */}
<div style={styles.content}>

  {/* PESQUISA DE USUÁRIOS */}
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 20,
      width: "100%",
    }}
  >
    <PesquisaUsuariosVideos />
  </div>

  <div style={styles.feed}>
    <div style={styles.titulo}>
      Feed de vídeos
    </div>

          {/* PUBLICAR VÍDEO */}
          <div style={styles.postCard}>
            <div style={styles.usuario}>
              <Avatar
                foto={obterUrlFoto(
                  perfilAtual?.foto_perfil
                )}
              />

              <div>
                <div style={styles.nomeUsuario}>
                  {perfilAtual?.nome ||
                    (carregandoPerfil
                      ? "Carregando perfil..."
                      : "Usuário")}
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
                disabled={
                  publicando ||
                  enviandoVideo ||
                  analisandoVideo ||
                  carregandoPerfil
                }
              />
            </label>
          </div>

          {/* PRÉVIA */}
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
                  style={styles.botaoPublicar}
                  onClick={enviarVideoParaAnalise}
                  disabled={
                    enviandoVideo ||
                    publicando ||
                    analisandoVideo ||
                    analiseConcluida
                  }
                >
                  {enviandoVideo
                    ? "Enviando vídeo..."
                    : analisandoVideo
                      ? "Análise em andamento..."
                      : "Analisar vídeo"}
                </button>

                <button
                  type="button"
                  style={styles.botaoPublicar}
                  onClick={publicarVideo}
                  disabled={
                    publicando ||
                    enviandoVideo ||
                    !perfilAtual
                  }
                >
                  {publicando
                    ? "Publicando vídeo..."
                    : "Publicar vídeo"}
                </button>

                <button
                  type="button"
                  style={styles.botaoCancelar}
                  onClick={cancelarVideo}
                  disabled={
                    publicando ||
                    enviandoVideo ||
                    analisandoVideo
                  }
                >
                  Cancelar
                </button>
              </div>

              {analisandoVideo && (
                <div
                  style={styles.painelAnalise}
                  role="status"
                >
                  <h3 style={styles.tituloAnalise}>
                    Análise do vídeo
                  </h3>

                  <p style={styles.mensagem}>
                    Análise em andamento.
                    Aguarde o resultado...
                  </p>
                </div>
              )}

              {erroAnalise && (
                <div
                  style={styles.erro}
                  role="alert"
                >
                  <strong>
                    Não foi possível concluir
                    a análise.
                  </strong>
                  <p>{erroAnalise}</p>
                </div>
              )}

              {analiseConcluida &&
                resultadoAnalise && (
                  <ResultadoAnaliseVideo
                    resultado={resultadoAnalise}
                  />
                )}
            </div>
          )}

          {/* VÍDEOS PUBLICADOS */}
          <div style={styles.secaoPublicacoes}>
            <div style={styles.tituloPublicacoes}>
              <span>Vídeos publicados</span>

              <button
                type="button"
                style={styles.botaoAtualizar}
                onClick={carregarVideos}
                disabled={carregandoVideos}
              >
                {carregandoVideos
                  ? "Carregando..."
                  : "Atualizar"}
              </button>
            </div>

            {carregandoVideos && (
              <p style={styles.mensagem}>
                Carregando vídeos...
              </p>
            )}

            {erroFeed && (
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
              videos.map((item) => {
                const id = String(
                  item.id ??
                  item.id_cloudinary ??
                  ""
                );

                const autor = obterAutorVideo(
                  item,
                  perfilAtual
                );

                const analise =
                  analisesPublicadas[id];

                const analisandoPublicacao =
                  analise?.status === "iniciando" ||
                  analise?.status === "processando";

                const resultadoPublicado =
                  analise?.status === "concluido"
                    ? analise.resultado
                    : null;

                const comentarios =
                  Array.isArray(item.comentarios)
                    ? item.comentarios
                    : [];

                return (
                  <div
                    key={id}
                    style={styles.publicacaoCard}
                  >
                    {/* AUTOR REAL */}
                    <div style={styles.usuario}>
                      <Avatar foto={autor.foto} />

                      <div>
                        <div
                          style={styles.nomeUsuario}
                        >
                          {autor.nome}
                        </div>

                        <div style={styles.agora}>
                          {item.criado_em
                            ? new Date(
                                Number(
                                  item.criado_em
                                )
                              ).toLocaleString(
                                "pt-BR"
                              )
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

                    {/* INTERAÇÕES */}
                    <div
                      style={styles.interacoesVideo}
                    >
                      <button
                        type="button"
                        style={styles.botaoCurtirAmei}
                        disabled={
                          !!atualizandoInteracao[
                            item.id
                          ]
                        }
                        onClick={() =>
                          atualizarInteracao(
                            item,
                            {
                              curtidas:
                                Number(
                                  item.curtidas ||
                                  0
                                ) + 1,
                            }
                          )
                        }
                      >
                        👍🏿 Curtir{" "}
                        {item.curtidas || 0}
                      </button>

                      <button
                        type="button"
                        style={styles.botaoCurtirAmei}
                        disabled={
                          !!atualizandoInteracao[
                            item.id
                          ]
                        }
                        onClick={() =>
                          atualizarInteracao(
                            item,
                            {
                              amei:
                                Number(
                                  item.amei || 0
                                ) + 1,
                            }
                          )
                        }
                      >
                        🖤 Amei{" "}
                        {item.amei || 0}
                      </button>

                      <button
                        type="button"
                        style={styles.botaoCurtirAmei}
                        onClick={() =>
                          setComentariosAbertos(
                            (anterior) => ({
                              ...anterior,
                              [item.id]:
                                !anterior[
                                  item.id
                                ],
                            })
                          )
                        }
                      >
                        💬 Comentários (
                        {comentarios.length})
                      </button>

                      <button
                        type="button"
                        style={styles.botaoAnalisarIA}
                        disabled={
                          analisandoPublicacao
                        }
                        onClick={() =>
                          analisarPublicacao(item)
                        }
                      >
                        {analisandoPublicacao
                          ? "✨ Analisando com IA..."
                          : "✨ Analisar com IA"}
                      </button>
                    </div>

                    {/* ANÁLISE EM ANDAMENTO */}
                    {analisandoPublicacao && (
                      <div
                        style={
                          styles.painelAnalisePublicada
                        }
                        role="status"
                      >
                        <h3
                          style={styles.tituloAnalise}
                        >
                          ✨ Análise com IA
                        </h3>

                        <p style={styles.mensagem}>
                          {analise.status ===
                          "iniciando"
                            ? "Iniciando uma nova análise deste vídeo..."
                            : "A inteligência artificial está analisando este vídeo. Aguarde o resultado..."}
                        </p>
                      </div>
                    )}

                    {/* ERRO DA ANÁLISE */}
                    {analise?.status === "erro" && (
                      <div
                        style={styles.erro}
                        role="alert"
                      >
                        <strong>
                          Não foi possível concluir
                          a análise.
                        </strong>
                        <p>{analise.erro}</p>
                      </div>
                    )}

                    {/* RESULTADO */}
                    {resultadoPublicado && (
                      <div>
                        <ResultadoAnaliseVideo
                          resultado={
                            resultadoPublicado
                          }
                          publicado={true}
                        />

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: 10,
                            marginBottom: 20,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              fecharAnalisePublicada(
                                id
                              )
                            }
                            style={
                              styles.botaoAnalisarIA
                            }
                          >
                            ✕ Fechar análise
                          </button>
                        </div>
                      </div>
                    )}

                    {/* COMENTÁRIOS */}
                    {comentariosAbertos[
                      item.id
                    ] && (
                      <div
                        style={styles.areaComentarios}
                      >
                        <div
                          style={
                            styles.listaComentarios
                          }
                        >
                          {comentarios.map(
                            (
                              comentario,
                              indice
                            ) => (
                              <div
                                key={indice}
                                style={
                                  styles.comentario
                                }
                              >
                                {typeof comentario ===
                                "string"
                                  ? comentario
                                  : comentario?.texto ??
                                    JSON.stringify(
                                      comentario
                                    )}
                              </div>
                            )
                          )}

                          {comentarios.length ===
                            0 && (
                            <p
                              style={
                                styles.mensagem
                              }
                            >
                              Ainda não há
                              comentários.
                            </p>
                          )}
                        </div>

                        <div
                          style={
                            styles.formComentario
                          }
                        >
                          <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            value={
                              novoComentario[
                                item.id
                              ] || ""
                            }
                            onChange={(event) =>
                              setNovoComentario(
                                (anterior) => ({
                                  ...anterior,
                                  [item.id]:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            style={
                              styles.inputComentario
                            }
                            disabled={
                              !!atualizandoInteracao[
                                item.id
                              ]
                            }
                          />

                          <button
                            type="button"
                            style={
                              styles.botaoEnviarComentario
                            }
                            onClick={() =>
                              enviarComentario(
                                item
                              )
                            }
                            disabled={
                              !!atualizandoInteracao[
                                item.id
                              ]
                            }
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ESTILOS
// =====================================================

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
    justifyContent: "flex-start",
    gap: 12,
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
    fontSize: 18,
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center",
    marginTop: 12,
  },

  logoutHover: {
    transform: "translateY(-2px)",
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
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

  avatarVazio: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: "#e9edf3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)",
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
  },

  legenda: {
    color: "#333",
    fontSize: 16,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    marginTop: 16,
  },

  interacoesVideo: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
    paddingTop: 14,
    borderTop: "1px solid #eee",
  },

  botaoCurtirAmei: {
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  },

  botaoAnalisarIA: {
    backgroundColor: "#111827",
    color: "#fff",
    border: "1px solid #111827",
    borderRadius: 10,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  },

  painelAnalisePublicada: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 22,
    marginTop: 18,
    marginBottom: 18,
  },

  areaComentarios: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },

  listaComentarios: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 14,
  },

  comentario: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    color: "#333",
    fontSize: 14,
    overflowWrap: "anywhere",
  },

  formComentario: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  inputComentario: {
    flex: 1,
    minWidth: 180,
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
  },

  botaoEnviarComentario: {
    backgroundColor: "#000",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  },

  mensagem: {
    color: "#666",
    fontSize: 16,
    lineHeight: 1.5,
  },

  painelAnalise: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
  },

  tituloAnalise: {
    fontSize: 22,
    color: "#222",
    marginTop: 0,
    marginBottom: 18,
  },

  blocoAnalise: {
    marginBottom: 18,
  },

  subtituloAnalise: {
    fontSize: 17,
    color: "#222",
    marginTop: 0,
    marginBottom: 8,
  },

  textoAnalise: {
    color: "#333",
    fontSize: 15,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    marginTop: 6,
    marginBottom: 6,
  },

  erro: {
    backgroundColor: "white",
    color: "#a12622",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
};
