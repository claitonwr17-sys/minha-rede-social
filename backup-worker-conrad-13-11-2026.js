
const GOOGLE_API = "https://videointelligence.googleapis.com/v1";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GEMINI_FILES_URL =
  "https://generativelanguage.googleapis.com/v1beta";

const LANGUAGE_URL =
  "https://language.googleapis.com/v1/documents:analyzeSentiment";

const BUCKET = "videos-do-meu-app-2025";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

// --------------------------------------------------
// AUTENTICAÇÃO GOOGLE
// --------------------------------------------------

function base64UrlEncode(data) {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(pem) {
  const clean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function getAccessToken(env) {
  if (!env.SA_KEY || !env.TOKEN_KV) {
    throw new Error("Configuração de autenticação incompleta.");
  }

  const cached = await env.TOKEN_KV.get(
    "google_access_token",
    { type: "json" }
  ).catch(() => null);

  const now = Math.floor(Date.now() / 1000);

  if (cached?.access_token && cached?.expires_at > now + 60) {
    return cached.access_token;
  }

  const sa = JSON.parse(env.SA_KEY);

  if (!sa.client_email || !sa.private_key) {
    throw new Error("Dados da conta de serviço inválidos.");
  }

  const iat = now;

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: sa.token_uri || TOKEN_URL,
    iat,
    exp: iat + 3600
  };

  const unsigned =
    base64UrlEncode(JSON.stringify(header)) +
    "." +
    base64UrlEncode(JSON.stringify(claims));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const assertion =
    unsigned + "." + base64UrlEncode(signature);

  const tokenResponse = await fetch(
    sa.token_uri || TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type:
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion
      })
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("O Google recusou a autenticação.");
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error("O Google não retornou um token.");
  }

  const expiresIn = Number(tokenData.expires_in) || 3600;

  await env.TOKEN_KV.put(
    "google_access_token",
    JSON.stringify({
      access_token: tokenData.access_token,
      expires_at: now + expiresIn
    }),
    { expirationTtl: Math.max(60, expiresIn - 60) }
  );

  return tokenData.access_token;
}

// --------------------------------------------------
// RESPOSTAS E CORS
// --------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

// --------------------------------------------------
// IDENTIFICADOR DA OPERAÇÃO
// --------------------------------------------------

function obterIdentificadorOperacao(dados) {
  if (!dados || typeof dados !== "object") {
    return null;
  }

  const identificadores = [
    dados.operationName,
    dados.codigoDaOperacao,
    dados.codigo_da_operacao
  ];

  for (const valor of identificadores) {
    if (typeof valor === "string" && valor.trim()) {
      return valor.trim();
    }
  }

  return null;
}

// --------------------------------------------------
// LEITURA DA ENTRADA DO XANO
// --------------------------------------------------

async function parseVideoRequest(request) {
  const contentType = (
    request.headers.get("Content-Type") || ""
  ).toLowerCase();

  let body;

  if (contentType.includes("application/json")) {
    body = await request.json();

  } else if (
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const raw = await request.text();
    const params = new URLSearchParams(raw);

    body = Object.fromEntries(params.entries());

    if (!body.videoUri) {
      body.videoUri = [...params.values()].find(
        value => value.trim().startsWith("gs://")
      );
    }

    if (!body.videoUri) {
      body.videoUri = [...params.keys()].find(
        key => key.trim().startsWith("gs://")
      );
    }

    if (!body.videoUri && raw.trim()) {
      try {
        const decoded = decodeURIComponent(
          raw.replace(/\+/g, " ")
        );

        if (decoded.trim().startsWith("gs://")) {
          body.videoUri = decoded.trim();
        }
      } catch {}
    }

  } else if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    body = Object.fromEntries(form.entries());

  } else {
    const raw = await request.text();

    try {
      body = JSON.parse(raw);
    } catch {
      const decoded = raw.trim();

      if (decoded.startsWith("gs://")) {
        body = { videoUri: decoded };
      } else {
        const params = new URLSearchParams(raw);
        body = Object.fromEntries(params.entries());
      }
    }
  }

  if (!body || typeof body !== "object") {
    throw new Error("Corpo da requisição inválido.");
  }

  if (!body.videoUri) {
    body.videoUri = Object.values(body).find(
      value =>
        typeof value === "string" &&
        value.trim().startsWith("gs://")
    );
  }

  if (typeof body.videoUri === "string") {
    body.videoUri = body.videoUri.trim();
  }

  return body;
}

async function enviarVideoParaGemini(videoBuffer, env) {
  const inicio = await fetch(
    "https://generativelanguage.googleapis.com/upload/v1beta/files",
    {
      method: "POST",
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY,
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(videoBuffer.byteLength),
        "X-Goog-Upload-Header-Content-Type": "video/mp4",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file: {
          display_name: "conrad-video-" + Date.now()
        }
      })
    }
  );

  if (!inicio.ok) {
    const erro = await inicio.text();
    throw new Error("Erro ao iniciar upload no Gemini: " + erro);
  }

  // O endereço de upload vem no cabeçalho, não precisamos ler JSON aqui.
  const uploadUrl = inicio.headers.get("x-goog-upload-url");

  if (!uploadUrl) {
    throw new Error("O Gemini não retornou o endereço de upload.");
  }

  const envio = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(videoBuffer.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": "video/mp4"
    },
    body: videoBuffer
  });

  const resposta = await envio.text();

  if (!envio.ok) {
    throw new Error("Erro ao enviar vídeo ao Gemini: " + resposta);
  }

  if (!resposta.trim()) {
    throw new Error("O Gemini recebeu o upload, mas retornou uma resposta vazia.");
  }

  let data;

  try {
    data = JSON.parse(resposta);
  } catch {
    throw new Error("Resposta inválida do Gemini: " + resposta);
  }

  if (!data.file || !data.file.name || !data.file.uri) {
    throw new Error("O Gemini não retornou os dados esperados do arquivo.");
  }

  return data.file;
}
// --------------------------------------------------
// CONSULTA DO PROCESSAMENTO DO ARQUIVO NO GEMINI
// --------------------------------------------------

async function consultarArquivoGemini(geminiFile, env) {
  if (!geminiFile?.name) {
    throw new Error("Referência do arquivo Gemini inválida.");
  }

  const response = await fetch(
    `${GEMINI_FILES_URL}/${geminiFile.name}`,
    {
      method: "GET",
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      "Não foi possível consultar o arquivo no Gemini."
    );
  }

  if (data.state === "FAILED") {
    throw new Error(
      data.error?.message ||
      "O Gemini não conseguiu processar o vídeo."
    );
  }

  return data;
}

// --------------------------------------------------
// TRANSFERÊNCIA CLOUDINARY → GOOGLE STORAGE + GEMINI
// -

async function transferirCloudinaryParaGCS(videoUrl, token, env, somenteSalvar = false) {
  const bucket = BUCKET;

  let url;

  try {
    url = new URL(videoUrl);
  } catch {
    throw new Error("URL do Cloudinary inválida.");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com" ||
    !url.pathname.toLowerCase().endsWith(".mp4")
  ) {
    throw new Error(
      "Informe uma URL HTTPS de vídeo MP4 do Cloudinary."
    );
  }

  // Baixa o vídeo uma única vez.
  const respostaCloudinary = await fetch(videoUrl, {
    method: "GET",
    redirect: "manual"
  });

  if (!respostaCloudinary.ok) {
    throw new Error(
      `Falha ao baixar vídeo do Cloudinary: HTTP ${respostaCloudinary.status}`
    );
  }

  const contentLength = Number(
    respostaCloudinary.headers.get("content-length") || 0
  );

  if (contentLength > MAX_VIDEO_SIZE) {
    throw new Error("O vídeo ultrapassa o limite de 50 MB.");
  }

  const videoBuffer = await respostaCloudinary.arrayBuffer();

  if (videoBuffer.byteLength === 0) {
    throw new Error("O Cloudinary retornou um vídeo vazio.");
  }

  if (videoBuffer.byteLength > MAX_VIDEO_SIZE) {
    throw new Error("O vídeo ultrapassa o limite de 50 MB.");
  }

  const objectName =
    `conrad/${Date.now()}-${crypto.randomUUID()}.mp4`;

  // Primeiro salva no Google Cloud Storage.
  const uploadUrl =
    `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o` +
    `?uploadType=media&name=${encodeURIComponent(objectName)}`;

  const respostaGCS = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "video/mp4"
    },
    body: videoBuffer
  });

  if (!respostaGCS.ok) {
    const erroTexto = await respostaGCS.text();

    let mensagem = erroTexto;

    try {
      const erroJson = JSON.parse(erroTexto);
      mensagem = erroJson.error?.message || erroTexto;
    } catch {}

    throw new Error(
      `Falha ao enviar vídeo ao Google Storage: ${mensagem}`
    );
  }

  // Reutiliza o mesmo buffer para enviar ao Gemini.
  const geminiFile = await enviarVideoParaGemini(
    videoBuffer,
    env
  );

  return {
    videoUri: `gs://${bucket}/${objectName}`,
    geminiFile
  };
}

// --------------------------------------------------
// GOOGLE VIDEO INTELLIGENCE
// --------------------------------------------------

async function iniciarAnaliseVideo(videoUri, token) {
  const response = await fetch(
    `${GOOGLE_API}/videos:annotate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        inputUri: videoUri,
        features: [
          "LABEL_DETECTION",
          "SHOT_CHANGE_DETECTION",
          "EXPLICIT_CONTENT_DETECTION"
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      "O Google não conseguiu iniciar a análise do vídeo."
    );
  }

  if (!data.name) {
    throw new Error(
      "O Google não retornou o identificador da operação."
    );
  }

  return data.name;
}

// --------------------------------------------------
// RESUMO DOS RESULTADOS VISUAIS
// --------------------------------------------------

function resumirResultadosVideo(result) {
  const annotation = result?.annotationResults?.[0] || {};

  const rotulos = (
    annotation.segmentLabelAnnotations || []
  )
    .map(item => ({
      descricao: item.entity?.description || "Não identificado",
      confianca: item.segments?.[0]?.confidence ?? 0
    }))
    .sort((a, b) => b.confianca - a.confianca)
    .slice(0, 8)
    .map(item => ({
      descricao: item.descricao,
      confianca: Math.round(item.confianca * 1000) / 1000
    }));

  const cenas = annotation.shotAnnotations || [];
  const frames = annotation.explicitAnnotation?.frames || [];

  const ordem = {
    UNKNOWN: 0,
    VERY_UNLIKELY: 1,
    UNLIKELY: 2,
    POSSIBLE: 3,
    LIKELY: 4,
    VERY_LIKELY: 5
  };

  const classificacoes = frames.map(
    frame => frame.pornographyLikelihood || "UNKNOWN"
  );

  const maiorClassificacao = classificacoes.reduce(
    (maior, atual) =>
      (ordem[atual] ?? 0) > (ordem[maior] ?? 0)
        ? atual
        : maior,
    "UNKNOWN"
  );

  return {
    rotulosVisuais: rotulos,
    quantidadeDeCenas: cenas.length,
    conteudoExplicito: {
      quadrosAnalisados: frames.length,
      maiorClassificacao
    }
  };
}

// --------------------------------------------------
// GEMINI — ANÁLISE SOMENTE TEXTUAL (COMPATIBILIDADE)
// --------------------------------------------------

async function chamarGemini(prompt, env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Secret GEMINI_API_KEY não configurado.");
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Gemini: ${data.error?.message || "Falha na API."}`
    );
  }

  const text = (
    data.candidates?.[0]?.content?.parts || []
  )
    .map(part => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini não retornou texto.");
  }

  return text;
}

// --------------------------------------------------
// GEMINI — ANÁLISE DIRETA DO VÍDEO E DO ÁUDIO
// --------------------------------------------------

async function chamarGeminiComVideo(prompt, geminiFile, env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Secret GEMINI_API_KEY não configurado.");
  }

  if (!geminiFile?.uri) {
    throw new Error("Arquivo de vídeo do Gemini não encontrado.");
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [
          {
            file_data: {
              mime_type: geminiFile.mimeType || "video/mp4",
              file_uri: geminiFile.uri
            },
            media_processing: "AGENTIC"
          },
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000
      }
    })
  });

  const data = await response.json();

  console.log(
    "DIAGNÓSTICO GEMINI MULTIMODAL:",
    JSON.stringify(data)
  );

  if (!response.ok) {
    throw new Error(
      `Gemini: ${data.error?.message || "Falha na análise multimodal."}`
    );
  }

  const text = (
    data.candidates?.[0]?.content?.parts || []
  )
    .map(part => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error(
      "Gemini não retornou texto da análise do vídeo."
    );
  }

  return text;
}

// --------------------------------------------------
// GOOGLE NATURAL LANGUAGE — SENTIMENTO
// --------------------------------------------------

async function analisarSentimento(text, env) {
  if (!env.CHAVE_API_DE_SENTIMENTO) {
    throw new Error(
      "Secret CHAVE_API_DE_SENTIMENTO não configurado."
    );
  }

  const response = await fetch(LANGUAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.CHAVE_API_DE_SENTIMENTO
    },
    body: JSON.stringify({
      document: {
        type: "PLAIN_TEXT",
        content: text
      },
      encodingType: "UTF8"
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Natural Language: ${
        data.error?.message || "Falha na API."
      }`
    );
  }

  return data;
}

// --------------------------------------------------
// PIPELINE COMPLEMENTAR — INTERPRETAÇÃO DO CONTEÚDO
// --------------------------------------------------

async function executarAnaliseComplementar(
  videoIntelligence,
  operationName,
  env,
  geminiFile
) {
  const resumoVisual = resumirResultadosVideo(videoIntelligence);

  const prompt = `
Você é o Conrad AI, a inteligência artificial de uma rede social.

Assista ao vídeo fornecido e produza uma interpretação clara, humana e profissional, em português do Brasil.

Sua tarefa é compreender o conteúdo completo do vídeo, considerando tanto as imagens quanto o áudio disponível.

IDENTIFIQUE, QUANDO HOUVER EVIDÊNCIAS:

- Qual é o assunto principal do vídeo.
- O que está acontecendo e o que é apresentado.
- O que a pessoa está falando, explicando ou demonstrando.
- Qual é a mensagem central transmitida.
- Qual parece ser o objetivo do criador ao publicar esse conteúdo.
- Que conhecimento, informação ou reflexão o vídeo pretende transmitir.
- Qual é o contexto e para quem o conteúdo parece ser direcionado.
- Como as imagens complementam ou reforçam a mensagem falada.
- Se existe música, narração, diálogo ou outros sons relevantes.

REGRAS IMPORTANTES:

- Considere diretamente o conteúdo audiovisual do arquivo.
- Não se limite aos rótulos visuais fornecidos abaixo.
- Diferencie claramente o que foi observado daquilo que é uma interpretação.
- Nunca invente falas ou transcrições.
- Não confunda o objetivo aparente do vídeo com a intenção privada do criador.
- Se não houver fala, não invente narração ou diálogos.
- Se o áudio estiver ausente ou incompreensível, não invente conteúdo.
- Se houver fala, considere o que está sendo dito para compreender a mensagem.
- Não confunda música de fundo com fala.
- Não invente acontecimentos, pessoas ou informações.
- Quando houver incerteza, utilize expressões como "aparentemente" ou "o vídeo sugere".
- Não mencione nomes de APIs ou ferramentas técnicas.
- Escreva um único texto fluido, sem títulos ou listas.
- Utilize linguagem natural, simples e profissional.
- Evite descrições genéricas que não expliquem o conteúdo.
- Não faça afirmações sobre a intenção privada do criador.
- Procure explicar o que o vídeo comunica, não apenas descrever o que aparece nas imagens.

O resultado deve ter aproximadamente 100 a 160 palavras, quando houver informações suficientes.

INFORMAÇÕES VISUAIS COMPLEMENTARES:

${JSON.stringify(resumoVisual)}
`;

  let analiseFinal;

  if (geminiFile?.uri) {
    analiseFinal = await chamarGeminiComVideo(
      prompt,
      geminiFile,
      env
    );
  } else {
    analiseFinal = await chamarGemini(prompt, env);
  }

  const sentimentoCompleto = await analisarSentimento(
    analiseFinal,
    env
  );

  const sentimento = sentimentoCompleto.documentSentiment || {};
  const score = sentimento.score ?? 0;

  let classificacao = "Neutro";

  if (score > 0.25) {
    classificacao = "Positivo";
  } else if (score < -0.25) {
    classificacao = "Negativo";
  }

  return {
    resultado: resumoVisual,
    geminiAnaliseTextual: analiseFinal,
    geminiAnaliseFinal: analiseFinal,

    naturalLanguageSentimento: {
      classificacao,
      score: sentimento.score ?? null,
      magnitude: sentimento.magnitude ?? null
    },

    observacao: geminiFile?.uri
      ? "O vídeo foi analisado diretamente, considerando imagens e áudio disponível. A análise de sentimento foi aplicada ao texto produzido."
      : "O Gemini recebeu apenas informações textuais disponíveis, sem análise direta do arquivo de vídeo."
  };
}

// --------------------------------------------------
// CONSULTA DA OPERAÇÃO E RESPOSTA FINAL
// --------------------------------------------------

async function consultarOperacao(operationName, token, env) {
  if (
    typeof operationName !== "string" ||
    !/^projects\/[^/]+\/locations\/[^/]+\/operations\/[^/]+$/.test(
      operationName
    )
  ) {
    return json({
      erro: "Identificador de operação inválido.",
      exemplo:
        "projects/PROJECT_ID/locations/LOCATION/operations/OPERATION_ID"
    }, 400);
  }

  const cacheKey = `pipeline:${operationName}`;

  const cached = await env.TOKEN_KV.get(
    cacheKey,
    { type: "json" }
  ).catch(() => null);

  if (cached?.status === "concluido") {
    return json(cached);
  }

  // Consulta o Video Intelligence.
  const response = await fetch(
    `${GOOGLE_API}/${operationName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return json({
      erro: "Não foi possível consultar a análise.",
      detalhes: data.error?.message || "Erro da API."
    }, response.status);
  }

  if (!data.done) {
    return json({
      status: "processando",
      etapa: "video_intelligence",
      mensagem: "A análise visual ainda está em andamento.",
      operationName
    }, 202);
  }

  if (data.error) {
    return json({
      status: "erro",
      operationName,
      detalhes: data.error.message
    }, 502);
  }

  const resultadoVideo = data.response || {};

  try {
    // Recupera a referência do vídeo no Gemini.
const chaveGemini = `gemini:${operationName}`;

let geminiFile = null;

try {
  geminiFile = await env.TOKEN_KV.get(
    chaveGemini,
    { type: "json" }
  );

  console.log("DIAGNÓSTICO KV — LEITURA:", {
    chave: chaveGemini,
    encontrada: geminiFile !== null
  });

} catch (erroKV) {
  console.error(
    "DIAGNÓSTICO KV — ERRO REAL NA LEITURA:",
    erroKV.message
  );

  throw erroKV;
}

console.log("DIAGNÓSTICO KV — REFERÊNCIA RECUPERADA:", {
  chave: chaveGemini,
  encontrada: !!geminiFile,
  arquivo: geminiFile
});

    if (!geminiFile) {
      throw new Error(
        "A referência do vídeo no Gemini não foi encontrada no KV."
      );
    }

    // Verifica o estado real do arquivo.
    const arquivoAtual = await consultarArquivoGemini(
      geminiFile,
      env
    );

    if (arquivoAtual.state !== "ACTIVE") {
      return json({
        status: "processando",
        etapa: "gemini",
        estadoArquivo: arquivoAtual.state || "PROCESSING",
        mensagem:
          "A análise visual terminou. O Gemini ainda está preparando o vídeo para interpretação.",
        operationName
      }, 202);
    }

    // Atualiza a referência com os dados mais recentes.
    const arquivoPronto = {
      ...geminiFile,
      ...arquivoAtual
    };

    // Executa a interpretação multimodal.
    const complementares = await executarAnaliseComplementar(
      resultadoVideo,
      operationName,
      env,
      arquivoPronto
    );

    const respostaFinal = {
      status: "concluido",
      operationName,
      ...complementares
    };

    await env.TOKEN_KV.put(
      cacheKey,
      JSON.stringify(respostaFinal),
      { expirationTtl: 86400 }
    );

    return json(respostaFinal);

  } catch (error) {
    return json({
      status: "parcial",
      operationName,
      resultado: resumirResultadosVideo(resultadoVideo),
      etapaComplementar: "erro",
      detalhes: error.message,
      mensagem:
        "A análise visual terminou, mas a interpretação complementar falhou. Consulte novamente para tentar outra vez."
    }, 502);
  }
}

// --------------------------------------------------
// ENTRADA PRINCIPAL DO WORKER
// --------------------------------------------------

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    const url = new URL(request.url);

    // ----------------------------------------------
    // GET — CONSULTAR OPERAÇÃO EXISTENTE
    // ----------------------------------------------

    if (request.method === "GET") {
      const operationName =
        url.searchParams.get("operationName") ||
        url.searchParams.get("codigoDaOperacao") ||
        url.searchParams.get("codigo_da_operacao");

      if (!operationName) {
        return json({
          status: "online",
          service:
            "Conrad AI — Video Intelligence + Gemini + Natural Language",
          instrucoes:
            "Informe operationName, codigoDaOperacao ou codigo_da_operacao para consultar uma análise."
        });
      }

      try {
        const token = await getAccessToken(env);

        return await consultarOperacao(
          operationName,
          token,
          env
        );
      } catch (error) {
        return json({
          erro: "Falha ao consultar a operação.",
          detalhes: error.message
        }, 500);
      }
    }

    // ----------------------------------------------
    // VALIDAR MÉTODO
    // ----------------------------------------------

    if (request.method !== "POST") {
      return json({
        erro: "Método não permitido."
      }, 405);
    }

    try {
      const body = await parseVideoRequest(request);
      const token = await getAccessToken(env);

      // POST com identificador consulta operação existente.
      const operationNameRecebida =
        obterIdentificadorOperacao(body);

      if (operationNameRecebida) {
        return await consultarOperacao(
          operationNameRecebida,
          token,
          env
        );
      }

      // --------------------------------------------
      // RECEBER URL DO VÍDEO
      // --------------------------------------------

      let videoUri = body.videoUri;
      let geminiFile = null;

      if (
        typeof videoUri !== "string" ||
        !videoUri.trim()
      ) {
        return json({
          erro: "Informe videoUri com a URL do vídeo."
        }, 400);
      }

      videoUri = videoUri.trim();

      if (videoUri.startsWith("https://")) {
        const transferencia = await transferirCloudinaryParaGCS(
          videoUri,
          token,
          env
        );

        videoUri = transferencia.videoUri;
        geminiFile = transferencia.geminiFile;

      } else if (!videoUri.startsWith("gs://")) {
        return json({
          erro:
            "Envie uma URL HTTPS do Cloudinary ou um endereço gs:// válido."
        }, 400);
      }

      // --------------------------------------------
      // INICIAR VIDEO INTELLIGENCE
      // --------------------------------------------

      const operationName = await iniciarAnaliseVideo(
        videoUri,
        token
      );

      // Guarda referência do Gemini antes da consulta.
if (geminiFile) {
  await env.TOKEN_KV.put(
    `gemini:${operationName}`,
    JSON.stringify(geminiFile),
    { expirationTtl: 86400 }
  );

  console.log("DIAGNÓSTICO KV — REFERÊNCIA SALVA:", {
    chave: `gemini:${operationName}`,
    arquivo: geminiFile
  });

} else {
  console.log(
    "DIAGNÓSTICO KV — GEMINI FILE ESTÁ VAZIO."
  );
}
      return await consultarOperacao(
        operationName,
        token,
        env
      );

    } catch (error) {
      return json({
        erro: "Falha ao processar a solicitação.",
        detalhes: error.message
      }, 500);
    }
  }
};
