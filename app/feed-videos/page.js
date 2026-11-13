
'use client'

import "@fontsource/inter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const XANO_POST_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/publicacoes_videos"

const XANO_GET_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/listar-publicacoes-videos"

const XANO_INICIAR_ANALISE_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/iniciar_analise_video"

const XANO_CONSULTAR_ANALISE_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3/consultar_analise_video"

// Converte o resultado técnico do sentimento em linguagem humana.
function descreverSentimento(sentimento) {
  if (!sentimento || typeof sentimento !== "object") {
    return null
  }

  const classificacao = String(
    sentimento.classificacao || ""
  ).trim().toLowerCase()

  const score = sentimento.score
  const magnitude = sentimento.magnitude

  let descricao =
    "A análise não apresentou uma classificação emocional definida."

  if (classificacao.includes("neutr")) {
    descricao =
      "O texto analisado apresenta um tom predominantemente neutro, sem uma tendência claramente positiva ou negativa."
  } else if (classificacao.includes("positiv")) {
    descricao =
      "O texto analisado apresenta uma tendência positiva."
  } else if (classificacao.includes("negativ")) {
    descricao =
      "O texto analisado apresenta uma tendência negativa."
  } else if (
    classificacao.includes("mist") ||
    classificacao.includes("mixed")
  ) {
    descricao =
      "O texto analisado reúne sinais de sentimentos positivos e negativos."
  } else if (classificacao) {
    descricao =
      `O sentimento do texto foi classificado como ${sentimento.classificacao}.`
  } else if (
    typeof score === "number" &&
    Number.isFinite(score)
  ) {
    if (score > 0.25) {
      descricao =
        "O texto analisado apresenta uma tendência positiva."
    } else if (score < -0.25) {
      descricao =
        "O texto analisado apresenta uma tendência negativa."
    } else {
      descricao =
        "O texto analisado não apresenta uma tendência emocional claramente positiva ou negativa."
    }
  }

  // A magnitude depende também da quantidade de texto analisado.
  // Por isso não atribuímos uma intensidade emocional sem contexto.
  if (
    typeof magnitude === "number" &&
    Number.isFinite(magnitude) &&
    magnitude > 0
  ) {
    return (
      descricao +
      " A ferramenta também identificou sinais de emoção ao longo do conteúdo, mas essa medida, isoladamente, não determina a intensidade percebida por quem assiste."
    )
  }

  return descricao
}

// Converte os dados visuais em explicações compreensíveis.
function descreverInformacoesVisuais(resultado) {
  if (!resultado || typeof resultado !== "object") {
    return null
  }

  const cenas = resultado.quantidadeDeCenas
  const quadros =
    resultado.conteudoExplicito?.quadrosAnalisados

  const partes = []

  if (
    typeof cenas === "number" &&
    Number.isFinite(cenas)
  ) {
    if (cenas === 0) {
      partes.push(
        "A análise não identificou divisões de cena no vídeo."
      )
    } else if (cenas === 1) {
      partes.push(
        "A análise identificou uma única cena no vídeo."
      )
    } else {
      partes.push(
        "A análise identificou diferentes cenas ao longo do vídeo, indicando mudanças na sequência visual."
      )
    }
  }

  if (
    typeof quadros === "number" &&
    Number.isFinite(quadros) &&
    quadros > 0
  ) {
    partes.push(
      "A inteligência artificial também examinou imagens do vídeo para complementar a avaliação visual."
    )
  }

  if (partes.length === 0) {
    return (
      "O processamento visual foi realizado, mas não há detalhes suficientes para descrever a estrutura das cenas."
    )
  }

  return partes.join(" ")
}

// Identifica o resultado devolvido pelas diferentes estruturas do Xano.
function extrairResultadoAnalise(dados) {
  return (
    dados?.api1?.response?.result ||
    dados?.api1?.result ||
    dados?.response?.result ||
    dados?.result ||
    dados
  )
}

// Identifica a operação retornada pelo Xano.
function extrairNomeOperacao(dados) {
  return (
    dados?.operationName ||
    dados?.nome_da_operacao ||
    dados?.result?.operationName ||
    dados?.response?.result?.operationName ||
    dados?.api1?.response?.result?.operationName ||
    ""
  )
}

// Componente para mostrar a análise de forma compreensível.
function ResultadoAnaliseVideo({ resultado, publicado = false }) {
  if (!resultado) return null

  const interpretacao =
    resultado.geminiAnaliseFinal ||
    resultado.geminiAnaliseTextual

  const sentimento =
    resultado.naturalLanguageSentimento

  const informacoesVisuais =
    resultado.resultado

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

      {interpretacao && (
        <div style={styles.blocoAnalise}>
          <h4 style={styles.subtituloAnalise}>
            Interpretação do Gemini
          </h4>

          <p style={styles.textoAnalise}>
            {interpretacao}
          </p>
        </div>
      )}

      {sentimento && (
        <div style={styles.blocoAnalise}>
          <h4 style={styles.subtituloAnalise}>
            Sentimento identificado
          </h4>

          <p style={styles.textoAnalise}>
            {descreverSentimento(sentimento)}
          </p>
        </div>
      )}

      {informacoesVisuais && (
        <div style={styles.blocoAnalise}>
          <h4 style={styles.subtituloAnalise}>
            Informações visuais
          </h4>

          <p style={styles.textoAnalise}>
            {descreverInformacoesVisuais(informacoesVisuais)}
          </p>
        </div>
      )}

      {resultado.observacao && (
        <p style={styles.observacaoAnalise}>
          {resultado.observacao}
        </p>
      )}

      {!interpretacao &&
        !sentimento &&
        !informacoesVisuais &&
        !resultado.observacao && (
          <p style={styles.mensagem}>
            A análise foi concluída, mas não foram
            retornadas informações para exibição.
          </p>
        )}
    </div>
  )
}

export default function FeedVideos() {
  const router = useRouter()

  const [hoverItem, setHoverItem] = useState("")
  const [videoSelecionado, setVideoSelecionado] = useState(null)
  const [arquivoVideo, setArquivoVideo] = useState(null)

  const [publicando, setPublicando] = useState(false)
  const [enviandoVideo, setEnviandoVideo] = useState(false)
  const [analisandoVideo, setAnalisandoVideo] = useState(false)
  const [analiseConcluida, setAnaliseConcluida] = useState(false)
  const [resultadoAnalise, setResultadoAnalise] = useState(null)
  const [erroAnalise, setErroAnalise] = useState("")
  const [operationName, setOperationName] = useState("")
  const [urlVideoCloudinary, setUrlVideoCloudinary] = useState("")
  const [idCloudinary, setIdCloudinary] = useState("")

  const [videos, setVideos] = useState([])
  const [carregandoVideos, setCarregandoVideos] = useState(true)
  const [erroFeed, setErroFeed] = useState("")

  const [comentariosAbertos, setComentariosAbertos] = useState({})
  const [novoComentario, setNovoComentario] = useState({})
  const [atualizandoInteracao, setAtualizandoInteracao] = useState({})

  // NOVO: análises independentes para vídeos publicados.
  const [analisesPublicadas, setAnalisesPublicadas] = useState({})

  // Guarda o upload para evitar enviar o mesmo vídeo duas vezes.
  const uploadEmAndamentoRef = useRef(null)
  const arquivoAtualRef = useRef(null)
  const dadosUploadRef = useRef(null)

  // Impede que a análise antiga seja aplicada a outro vídeo.
  const versaoVideoRef = useRef(0)

  // NOVO: impede consultas simultâneas duplicadas.
  const consultasPublicadasRef = useRef(new Set())

  // NOVO: impede dois cliques simultâneos no mesmo vídeo.
  const iniciandoPublicadasRef = useRef(new Set())

  // GET: carregar publicações salvas no Xano.
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
      setErroFeed(
        erro.message || "Erro ao carregar as publicações."
      )
    } finally {
      setCarregandoVideos(false)
    }
  }

  useEffect(() => {
    carregarVideos()
  }, [])

  // Consultar automaticamente a análise antes da publicação.
  useEffect(() => {
    if (!analisandoVideo || !operationName) return

    const intervalo = setInterval(() => {
      consultarResultadoAnalise()
    }, 3000)

    return () => clearInterval(intervalo)
  }, [analisandoVideo, operationName])

  // Fecha apenas a análise do vídeo selecionado.
  function fecharAnalisePublicada(id) {
    setAnalisesPublicadas((anterior) => {
      const atualizadas = { ...anterior }
      delete atualizadas[String(id)]
      return atualizadas
    })
  }

  // NOVO: iniciar uma nova análise para um vídeo publicado.
  async function analisarPublicacao(item) {
    const id = String(
      item.id ?? item.id_cloudinary ?? ""
    )

    const videoUri = item.url_do_video

    if (!id || !videoUri) {
      alert(
        "Esta publicação não possui um vídeo válido para análise."
      )
      return
    }

    if (iniciandoPublicadasRef.current.has(id)) {
      return
    }

    if (
      analisesPublicadas[id]?.status === "iniciando" ||
      analisesPublicadas[id]?.status === "processando"
    ) {
      return
    }

    iniciandoPublicadasRef.current.add(id)

    // Limpa a análise anterior para solicitar uma nova.
    setAnalisesPublicadas((anterior) => ({
      ...anterior,
      [id]: {
        status: "iniciando",
        operationName: "",
        resultado: null,
        erro: "",
      },
    }))

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
      )

      const texto = await resposta.text()
      let dados = null

      try {
        dados = texto ? JSON.parse(texto) : null
      } catch {
        dados = texto
      }

      console.log(
        "Início da análise da publicação:",
        id,
        resposta.status,
        dados
      )

      if (!resposta.ok) {
        throw new Error(
          "O Xano não conseguiu iniciar a análise desta publicação."
        )
      }

      const nomeOperacao = extrairNomeOperacao(dados)

      if (!nomeOperacao) {
        throw new Error(
          "A análise foi solicitada, mas o Xano não retornou o identificador da operação."
        )
      }

      setAnalisesPublicadas((anterior) => ({
        ...anterior,
        [id]: {
          status: "processando",
          operationName: nomeOperacao,
          resultado: null,
          erro: "",
        },
      }))
    } catch (erro) {
      console.error(
        "Erro ao analisar publicação:",
        erro
      )

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
      }))
    } finally {
      iniciandoPublicadasRef.current.delete(id)
    }
  }

  // NOVO: consultar a análise de uma publicação.
  async function consultarAnalisePublicada(
    id,
    nomeOperacao
  ) {
    const chaveConsulta = `${id}:${nomeOperacao}`

    if (
      consultasPublicadasRef.current.has(chaveConsulta)
    ) {
      return
    }

    consultasPublicadasRef.current.add(chaveConsulta)

    try {
      const resposta = await fetch(
        `${XANO_CONSULTAR_ANALISE_URL}?operation_name=${encodeURIComponent(nomeOperacao)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      const texto = await resposta.text()
      let dados = null

      try {
        dados = texto ? JSON.parse(texto) : null
      } catch {
        throw new Error(
          "O Xano retornou uma resposta inválida."
        )
      }

      const resultado = extrairResultadoAnalise(dados)

      if (!resposta.ok) {
        throw new Error(
          resultado?.mensagem ||
          resultado?.detalhes ||
          "Erro ao consultar a análise."
        )
      }

      if (resultado?.status === "concluido") {
        setAnalisesPublicadas((anterior) => {
          if (
            anterior[id]?.operationName !== nomeOperacao
          ) {
            return anterior
          }

          return {
            ...anterior,
            [id]: {
              status: "concluido",
              operationName: nomeOperacao,
              resultado,
              erro: "",
            },
          }
        })
      } else if (
        resultado?.status === "parcial" ||
        resultado?.status === "erro"
      ) {
        setAnalisesPublicadas((anterior) => {
          if (
            anterior[id]?.operationName !== nomeOperacao
          ) {
            return anterior
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
          }
        })
      }
    } catch (erro) {
      console.error(
        "Erro ao consultar análise publicada:",
        erro
      )

      setAnalisesPublicadas((anterior) => {
        if (
          anterior[id]?.operationName !== nomeOperacao
        ) {
          return anterior
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
        }
      })
    } finally {
      consultasPublicadasRef.current.delete(
        chaveConsulta
      )
    }
  }

  // NOVO: acompanha todas as análises publicadas.
  useEffect(() => {
    const pendentes = Object.entries(
      analisesPublicadas
    ).filter(
      ([, analise]) =>
        analise.status === "processando" &&
        analise.operationName
    )

    if (pendentes.length === 0) return

    const intervalo = setInterval(() => {
      pendentes.forEach(([id, analise]) => {
        consultarAnalisePublicada(
          id,
          analise.operationName
        )
      })
    }, 3000)

    return () => clearInterval(intervalo)
  }, [analisesPublicadas])

  // Atualizar curtidas, amei e comentários no Xano.
  async function atualizarInteracao(item, alteracoes) {
    const id = item.id

    if (atualizandoInteracao[id]) return

    setAtualizandoInteracao((anterior) => ({
      ...anterior,
      [id]: true,
    }))

    try {
      const dados = {
        post_id: Number(item.id),
        url_do_video: item.url_do_video ?? "",
        id_cloudinary: item.id_cloudinary ?? "",
        legenda: item.legenda ?? null,
        usuario_id: item.usuario_id ?? 10,
        status: item.status ?? "publicado",

        curtidas: Number(
          alteracoes.curtidas ?? item.curtidas ?? 0
        ),

        amei: Number(
          alteracoes.amei ?? item.amei ?? 0
        ),

        comentarios: Array.isArray(
          alteracoes.comentarios
        )
          ? alteracoes.comentarios
          : Array.isArray(item.comentarios)
            ? item.comentarios
            : [],
      }

      const resposta = await fetch(XANO_POST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      })

      const texto = await resposta.text()

      if (!resposta.ok) {
        throw new Error(
          texto || "Erro ao atualizar interação."
        )
      }

      await carregarVideos()
    } catch (erro) {
      console.error("Erro na interação:", erro)
      alert(
        "Não foi possível atualizar. Tente novamente."
      )
    } finally {
      setAtualizandoInteracao((anterior) => ({
        ...anterior,
        [id]: false,
      }))
    }
  }

  async function enviarComentario(item) {
    const texto = (
      novoComentario[item.id] || ""
    ).trim()

    if (!texto) {
      alert("Digite um comentário primeiro.")
      return
    }

    const comentarios = Array.isArray(
      item.comentarios
    )
      ? item.comentarios
      : []

    await atualizarInteracao(item, {
      comentarios: [...comentarios, texto],
    })

    setNovoComentario((anterior) => ({
      ...anterior,
      [item.id]: "",
    }))
  }

  function logout() {
    router.push("/feed")
  }

  // Selecionar um vídeo.
  function escolherVideo(event) {
    const arquivo = event.target.files?.[0]

    if (!arquivo) return

    if (
      publicando ||
      enviandoVideo ||
      analisandoVideo
    ) {
      alert("Aguarde a operação atual terminar.")
      return
    }

    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado)
    }

    versaoVideoRef.current += 1
    arquivoAtualRef.current = arquivo
    dadosUploadRef.current = null
    uploadEmAndamentoRef.current = null

    setArquivoVideo(arquivo)
    setVideoSelecionado(
      URL.createObjectURL(arquivo)
    )

    setAnaliseConcluida(false)
    setResultadoAnalise(null)
    setErroAnalise("")
    setOperationName("")
    setUrlVideoCloudinary("")
    setIdCloudinary("")
    setAnalisandoVideo(false)
    setEnviandoVideo(false)

    event.target.value = ""
  }

  function cancelarVideo() {
    if (
      publicando ||
      enviandoVideo ||
      analisandoVideo
    ) {
      return
    }

    if (videoSelecionado) {
      URL.revokeObjectURL(videoSelecionado)
    }

    versaoVideoRef.current += 1
    arquivoAtualRef.current = null
    dadosUploadRef.current = null
    uploadEmAndamentoRef.current = null

    setArquivoVideo(null)
    setVideoSelecionado(null)
    setAnaliseConcluida(false)
    setResultadoAnalise(null)
    setErroAnalise("")
    setOperationName("")
    setUrlVideoCloudinary("")
    setIdCloudinary("")
    setAnalisandoVideo(false)
    setEnviandoVideo(false)
  }

  // Upload independente da análise.
  // Tanto Publicar quanto Analisar podem usar esta função.
  async function garantirUploadCloudinary() {
    if (!arquivoVideo) {
      throw new Error(
        "Selecione um vídeo primeiro."
      )
    }

    if (
      dadosUploadRef.current &&
      arquivoAtualRef.current === arquivoVideo
    ) {
      return dadosUploadRef.current
    }

    if (uploadEmAndamentoRef.current) {
      return uploadEmAndamentoRef.current
    }

    const arquivoDestaOperacao = arquivoVideo
    const versaoDestaOperacao =
      versaoVideoRef.current

    const promessa = (async () => {
      // 1. Obter assinatura do upload.
      const respostaAssinatura = await fetch(
        "/api/upload-video-signature",
        { method: "POST" }
      )

      const dadosAssinatura =
        await respostaAssinatura.json()

      if (!respostaAssinatura.ok) {
        throw new Error(
          dadosAssinatura.error ||
          "Não foi possível preparar o envio do vídeo."
        )
      }

      // 2. Enviar arquivo ao Cloudinary.
      const formulario = new FormData()

      formulario.append(
        "file",
        arquivoDestaOperacao
      )
      formulario.append(
        "api_key",
        dadosAssinatura.apiKey
      )
      formulario.append(
        "timestamp",
        String(dadosAssinatura.timestamp)
      )
      formulario.append(
        "signature",
        dadosAssinatura.signature
      )
      formulario.append(
        "folder",
        dadosAssinatura.folder
      )

      const respostaUpload = await fetch(
        `https://api.cloudinary.com/v1_1/${dadosAssinatura.cloudName}/video/upload`,
        {
          method: "POST",
          body: formulario,
        }
      )

      const resultado =
        await respostaUpload.json()

      if (!respostaUpload.ok) {
        throw new Error(
          resultado.error?.message ||
          "Não foi possível enviar o vídeo ao Cloudinary."
        )
      }

      if (
        !resultado.secure_url ||
        !resultado.public_id
      ) {
        throw new Error(
          "O Cloudinary não retornou os dados do vídeo."
        )
      }

      if (
        versaoVideoRef.current !==
          versaoDestaOperacao ||
        arquivoAtualRef.current !==
          arquivoDestaOperacao
      ) {
        throw new Error(
          "O vídeo selecionado mudou durante o envio."
        )
      }

      const dados = {
        secure_url: resultado.secure_url,
        public_id: resultado.public_id,
      }

      dadosUploadRef.current = dados
      setUrlVideoCloudinary(
        dados.secure_url
      )
      setIdCloudinary(dados.public_id)

      return dados
    })()

    uploadEmAndamentoRef.current = promessa
    setEnviandoVideo(true)

    try {
      return await promessa
    } finally {
      if (
        uploadEmAndamentoRef.current === promessa
      ) {
        uploadEmAndamentoRef.current = null
      }

      setEnviandoVideo(false)
    }
  }

  // Análise opcional antes da publicação.
  async function enviarVideoParaAnalise() {
    if (!arquivoVideo) {
      alert("Selecione um vídeo primeiro.")
      return
    }

    if (
      enviandoVideo ||
      publicando ||
      analisandoVideo
    ) {
      return
    }

    try {
      setErroAnalise("")
      setAnaliseConcluida(false)
      setResultadoAnalise(null)
      setOperationName("")

      const resultado =
        await garantirUploadCloudinary()

      const respostaAnalise = await fetch(
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
      )

      const textoResposta =
        await respostaAnalise.text()

      let dadosAnalise = null

      try {
        dadosAnalise = textoResposta
          ? JSON.parse(textoResposta)
          : null
      } catch {
        dadosAnalise = textoResposta
      }

      console.log(
        "Resposta do início da análise no Xano:",
        respostaAnalise.status,
        dadosAnalise
      )

      if (!respostaAnalise.ok) {
        throw new Error(
          "O Xano não conseguiu iniciar a análise."
        )
      }

      const nomeOperacao =
        extrairNomeOperacao(dadosAnalise)

      if (!nomeOperacao) {
        throw new Error(
          "A análise foi solicitada, mas não encontramos o identificador da operação. Verifique o console."
        )
      }

      setOperationName(nomeOperacao)
      setAnalisandoVideo(true)

      alert("Análise iniciada com sucesso!")
    } catch (erro) {
      console.error(
        "Erro ao iniciar análise:",
        erro
      )
      setErroAnalise(
        erro.message ||
        "Erro ao iniciar análise."
      )
      alert(
        erro.message ||
        "Erro ao iniciar análise."
      )
    }
  }

  // Consultar o resultado da análise antes da publicação.
  async function consultarResultadoAnalise() {
    if (!operationName) return

    try {
      const resposta = await fetch(
        `${XANO_CONSULTAR_ANALISE_URL}?operation_name=${encodeURIComponent(operationName)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      const texto = await resposta.text()
      const dados = texto
        ? JSON.parse(texto)
        : null

      console.log(
        "Resultado da consulta da análise:",
        dados
      )

      const resultado =
        extrairResultadoAnalise(dados)

      console.log(
        "Resultado identificado:",
        resultado
      )

      if (
        resultado?.status === "concluido"
      ) {
        setResultadoAnalise(resultado)
        setAnaliseConcluida(true)
        setAnalisandoVideo(false)
        setErroAnalise("")
      } else if (
        resultado?.status === "parcial" ||
        resultado?.status === "erro"
      ) {
        setErroAnalise(
          resultado.detalhes ||
          resultado.mensagem ||
          "A análise não foi concluída."
        )

        setAnalisandoVideo(false)
        setAnaliseConcluida(false)
      } else if (!resposta.ok) {
        throw new Error(
          "Erro ao consultar o resultado da análise."
        )
      }
    } catch (erro) {
      console.error(
        "Erro ao consultar análise:",
        erro
      )
      setErroAnalise(
        erro.message ||
        "Erro ao consultar análise."
      )
      setAnalisandoVideo(false)
    }
  }

  // Publicação independente da análise.
  async function publicarVideo() {
    if (!arquivoVideo) {
      alert("Selecione um vídeo primeiro.")
      return
    }

    if (
      publicando ||
      enviandoVideo
    ) {
      return
    }

    try {
      setPublicando(true)

      // Upload, se ainda não foi realizado.
      const dadosCloudinary =
        await garantirUploadCloudinary()

      // Salvar a publicação no Xano.
      const respostaXano = await fetch(
        XANO_POST_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: null,
            url_do_video:
              dadosCloudinary.secure_url,
            id_cloudinary:
              dadosCloudinary.public_id,
            legenda: null,
            usuario_id: 10,
            status: "publicado",
            curtidas: 0,
            amei: 0,
            comentarios: [],
          }),
        }
      )

      const textoResposta =
        await respostaXano.text()

      let dadosXano = null

      try {
        dadosXano = textoResposta
          ? JSON.parse(textoResposta)
          : null
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
          typeof dadosXano === "object" &&
          dadosXano
            ? dadosXano.message ||
              dadosXano.mensagem ||
              dadosXano.error ||
              `O Xano não salvou a publicação. HTTP ${respostaXano.status}`
            : `O Xano não salvou a publicação. HTTP ${respostaXano.status}`
        )
      }

      // Salvar uma cópia no Google Cloud Storage.
      try {
        const respostaStorage = await fetch(
          "https://sentiment-gemini-vision-video.claitonwr17.workers.dev/",
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
        )

        const dadosStorage =
          await respostaStorage.json()

        if (
          !respostaStorage.ok ||
          dadosStorage.status !== "salvo"
        ) {
          throw new Error(
            dadosStorage.detalhes ||
            dadosStorage.erro ||
            "O Google Storage não confirmou a gravação."
          )
        }

        console.log(
          "Vídeo salvo no Google Storage:",
          dadosStorage.videoUri
        )
      } catch (erroStorage) {
        console.error(
          "Falha ao salvar vídeo no Google Storage:",
          erroStorage
        )
      }

      // Atualizar o feed.
      await carregarVideos()

      if (!analisandoVideo) {
        cancelarVideo()
      }

      alert(
        "Vídeo publicado e salvo no Xano com sucesso!"
      )
    } catch (erro) {
      console.error(
        "Erro ao publicar vídeo:",
        erro
      )
      alert(
        erro.message ||
        "Erro ao publicar vídeo."
      )
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
            <Link
              href="/feed"
              style={{
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  ...styles.menuItem,
                  ...(hoverItem === "home"
                    ? styles.menuHover
                    : {}),
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
                ...(hoverItem === "ia"
                  ? styles.menuHover
                  : {}),
                display: "flex",
                alignItems: "center",
                gap: 12,
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
                  objectFit: "contain",
                }}
              />
              <span>IA</span>
            </div>

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "feed"
                  ? styles.menuHover
                  : {}),
              }}
              onMouseEnter={() =>
                setHoverItem("feed")
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

            <div
              style={{
                ...styles.menuItem,
                ...(hoverItem === "perfil"
                  ? styles.menuHover
                  : {}),
              }}
              onMouseEnter={() =>
                setHoverItem("perfil")
              }
              onMouseLeave={() =>
                setHoverItem("")
              }
              onClick={() =>
                router.push("/perfil")
              }
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
                style={{
                  display: "none",
                }}
                disabled={
                  publicando ||
                  enviandoVideo ||
                  analisandoVideo
                }
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
                {/* ANÁLISE OPCIONAL */}
                <button
                  type="button"
                  style={styles.botaoPublicar}
                  onClick={
                    enviarVideoParaAnalise
                  }
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

                {/* PUBLICAÇÃO SEM ANÁLISE OBRIGATÓRIA */}
                <button
                  type="button"
                  style={styles.botaoPublicar}
                  onClick={publicarVideo}
                  disabled={
                    publicando ||
                    enviandoVideo
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

              {/* RESULTADO DA ANÁLISE ANTES DA PUBLICAÇÃO */}
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
                    resultado={
                      resultadoAnalise
                    }
                  />
                )}
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

            {!carregandoVideos &&
              erroFeed && (
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
                    Ainda não há vídeos
                    publicados.
                  </p>
                </div>
              )}

            {!erroFeed &&
              videos.map((item) => {
                const id = String(
                  item.id ??
                  item.id_cloudinary ??
                  ""
                )

                const analise =
                  analisesPublicadas[id]

                const analisandoPublicacao =
                  analise?.status ===
                    "iniciando" ||
                  analise?.status ===
                    "processando"

                const resultadoPublicado =
                  analise?.status ===
                  "concluido"
                    ? analise.resultado
                    : null

                return (
                  <div
                    key={id}
                    style={
                      styles.publicacaoCard
                    }
                  >
                    <div style={styles.usuario}>
                      <img
                        src="/insta.png"
                        alt="Conrad"
                        style={
                          styles.avatarImage
                        }
                      />

                      <div>
                        <div
                          style={
                            styles.nomeUsuario
                          }
                        >
                          Claiton Wroblewski
                        </div>

                        <div
                          style={styles.agora}
                        >
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
                      src={
                        item.url_do_video
                      }
                      controls
                      playsInline
                      preload="metadata"
                      style={styles.video}
                    />

                    {item.legenda && (
                      <p
                        style={
                          styles.legenda
                        }
                      >
                        {item.legenda}
                      </p>
                    )}

                    {/* BOTÕES DE INTERAÇÃO */}
                    <div
                      style={
                        styles.interacoesVideo
                      }
                    >
                      <button
                        type="button"
                        style={
                          styles.botaoCurtirAmei
                        }
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
                        <span>👍🏿</span>
                        {" "}Curtir{" "}
                        {item.curtidas || 0}
                      </button>

                      <button
                        type="button"
                        style={
                          styles.botaoCurtirAmei
                        }
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
                                  item.amei ||
                                  0
                                ) + 1,
                            }
                          )
                        }
                      >
                        <span>🖤</span>
                        {" "}Amei{" "}
                        {item.amei || 0}
                      </button>

                      <button
                        type="button"
                        style={
                          styles.botaoCurtirAmei
                        }
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
                        {Array.isArray(
                          item.comentarios
                        )
                          ? item.comentarios
                              .length
                          : 0}
                        )
                      </button>

                      {/* NOVO BOTÃO: ANÁLISE DE VÍDEO PUBLICADO */}
                      <button
                        type="button"
                        style={
                          styles.botaoAnalisarIA
                        }
                        disabled={
                          analisandoPublicacao
                        }
                        onClick={() =>
                          analisarPublicacao(
                            item
                          )
                        }
                      >
                        {analisandoPublicacao
                          ? "✨ Analisando com IA..."
                          : "✨ Analisar com IA"}
                      </button>
                    </div>

                    {/* NOVO: ACOMPANHAMENTO DA ANÁLISE */}
                    {analisandoPublicacao && (
                      <div
                        style={
                          styles.painelAnalisePublicada
                        }
                        role="status"
                      >
                        <h3
                          style={
                            styles.tituloAnalise
                          }
                        >
                          ✨ Análise com IA
                        </h3>

                        <p
                          style={
                            styles.mensagem
                          }
                        >
                          {analise.status ===
                          "iniciando"
                            ? "Iniciando uma nova análise deste vídeo..."
                            : "A inteligência artificial está analisando este vídeo. Aguarde o resultado..."}
                        </p>
                      </div>
                    )}

                    {/* NOVO: ERRO DA ANÁLISE */}
                    {analise?.status ===
                      "erro" && (
                      <div
                        style={styles.erro}
                        role="alert"
                      >
                        <strong>
                          Não foi possível
                          concluir a análise.
                        </strong>

                        <p>
                          {analise.erro}
                        </p>
                      </div>
                    )}

                    
                    {resultadoPublicado && (
                      <div>
                        <ResultadoAnaliseVideo
                          resultado={resultadoPublicado}
                          publicado={true}
                        />

                        <div style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: 10,
                          marginBottom: 20,
                        }}>
                          <button
                            type="button"
                            onClick={() => fecharAnalisePublicada(id)}
                            style={{
                              backgroundColor: "#111827",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              padding: "12px 22px",
                              fontSize: 15,
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            ✕ Fechar análise
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ÁREA DE COMENTÁRIOS */}
                    {comentariosAbertos[
                      item.id
                    ] && (
                      <div
                        style={
                          styles.areaComentarios
                        }
                      >
                        <div
                          style={
                            styles.listaComentarios
                          }
                        >
                          {Array.isArray(
                            item.comentarios
                          ) &&
                            item.comentarios.map(
                              (
                                comentario,
                                indice
                              ) => (
                                <div
                                  key={
                                    indice
                                  }
                                  style={
                                    styles.comentario
                                  }
                                >
                                  {
                                    comentario
                                  }
                                </div>
                              )
                            )}

                          {(!Array.isArray(
                            item.comentarios
                          ) ||
                            item.comentarios
                              .length ===
                              0) && (
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
                            onChange={(
                              event
                            ) =>
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
                )
              })}
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

  menuItem: {
    padding: "14px 18px",
    borderRadius: 12,
    cursor: "pointer",
    color: "#444",
    fontSize: 18,
    transition: "0.2s",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
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

  interacoesVideo: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
    paddingTop: 14,
    borderTop: "1px solid #eee",
  },

  botaoCurtirAmei: {
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #dddddd",
    borderRadius: 10,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  },

  // NOVO: botão de análise dos vídeos publicados.
  botaoAnalisarIA: {
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "1px solid #111827",
    borderRadius: 10,
    padding: "11px 16px",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
  },

  // NOVO: resultado exibido abaixo da publicação.
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
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
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

  observacaoAnalise: {
    color: "#666",
    fontSize: 14,
    lineHeight: 1.6,
    borderTop: "1px solid #eee",
    paddingTop: 12,
  },

  erro: {
    backgroundColor: "white",
    color: "#a12622",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
}
