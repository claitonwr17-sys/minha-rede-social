
"use client";

import "@fontsource/inter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const XANO_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:Pg6r9BN3";

// =====================================================
// CONTROLE DE CONSULTAS AO XANO
// =====================================================

// Evita consultar repetidamente o próprio perfil.
// O cache é separado por token e permanece somente
// na memória desta página, sem usar localStorage.

let cacheMeuPerfil = null;
let cachePublicacoes = null;

function limparCacheMeuPerfil() {
  cacheMeuPerfil = null;
}

function limparCaches() {
  cacheMeuPerfil = null;
  cachePublicacoes = null;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function obterMensagemHttp(status, nome) {
  if (status === 429) {
    return (
      "O Xano está limitando temporariamente as " +
      "requisições. Aguarde alguns instantes e tente novamente."
    );
  }

  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  return `Não foi possível consultar ${nome}. Código: ${status}`;
}

async function consultarJson(url, opcoes = {}, nome = "o Xano") {
  const resposta = await fetch(url, {
    cache: "no-store",
    ...opcoes,
  });

  if (!resposta.ok) {
    const erro = new Error(
      obterMensagemHttp(resposta.status, nome)
    );
    erro.status = resposta.status;
    throw erro;
  }

  return resposta.json();
}

function consultarMeuPerfil(token, forcar = false) {
  const agora = Date.now();

  if (
    !forcar &&
    cacheMeuPerfil &&
    cacheMeuPerfil.token === token &&
    cacheMeuPerfil.expiraEm > agora
  ) {
    return cacheMeuPerfil.promise;
  }

  const promise = consultarJson(
    `${XANO_BASE}/meu_perfil`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
    "seu perfil"
  );

  const entrada = {
    token,
    promise,
    expiraEm: agora + 30000,
  };

  cacheMeuPerfil = entrada;

  promise.catch(() => {
    if (cacheMeuPerfil === entrada) {
      cacheMeuPerfil = null;
    }
  });

  return promise;
}

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.items)) return dados.items;
  if (Array.isArray(dados?.result)) return dados.result;
  return [];
}

async function consultarPublicacoes() {
  const agora = Date.now();

  if (
    cachePublicacoes &&
    cachePublicacoes.expiraEm > agora
  ) {
    return cachePublicacoes.promise;
  }

  // Consultas sequenciais, com pequeno intervalo.
  // Isso reduz o pico de requisições simultâneas.

  const promise = (async () => {
    const endpoints = [
      ["posts", `${XANO_BASE}/posts`],
      ["imagens", `${XANO_BASE}/get_imagens`],
      ["videos", `${XANO_BASE}/listar-publicacoes-videos`],
    ];

    const resultado = {
      posts: [],
      imagens: [],
      videos: [],
      falhas: [],
    };

    for (let i = 0; i < endpoints.length; i++) {
      const [nome, url] = endpoints[i];

      if (i > 0) {
        await esperar(350);
      }

      try {
        const dados = await consultarJson(
          url,
          {},
          `publicações de ${nome}`
        );

        resultado[nome] = extrairLista(dados);
      } catch (erro) {
        console.warn(`Falha em ${nome}:`, erro);
        resultado.falhas.push(nome);
      }
    }

    return resultado;
  })();

  const entrada = {
    promise,
    expiraEm: agora + 30000,
  };

  cachePublicacoes = entrada;

  promise
    .then((resultado) => {
      if (
        cachePublicacoes === entrada &&
        resultado.falhas.length > 0
      ) {
        cachePublicacoes = null;
      }
    })
    .catch(() => {
      if (cachePublicacoes === entrada) {
        cachePublicacoes = null;
      }
    });

  return promise;
}

function obterUrlImagem(valor, fallback = "") {
  if (!valor) return fallback;

  if (typeof valor === "string") {
    return valor.trim() || fallback;
  }

  if (typeof valor === "object") {
    return (
      valor.url ||
      valor.path ||
      valor.image_url ||
      fallback
    );
  }

  return fallback;
}

// =====================================================
// PESQUISA DE USUÁRIOS
// =====================================================

function PesquisaUsuariosPerfil() {
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarResultados, setMostrarResultados] =
    useState(false);

  const areaRef = useRef(null);

  useEffect(() => {
    const termo = busca.trim();

    if (termo.length < 2) {
      setUsuarios([]);
      setCarregando(false);
      setErro("");
      return;
    }

    const controller = new AbortController();

    setCarregando(true);
    setErro("");

    // Aguarda o usuário parar de digitar.
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Faça login para pesquisar usuários."
          );
        }

        const url = new URL(
          `${XANO_BASE}/pesquisar_usuarios`
        );
        url.searchParams.set("busca", termo);

        const dados = await consultarJson(
          url.toString(),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          },
          "a pesquisa de usuários"
        );

        if (controller.signal.aborted) return;

        setUsuarios(
          Array.isArray(dados?.usuarios?.items)
            ? dados.usuarios.items
            : []
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Erro na pesquisa:", error);
        setUsuarios([]);
        setErro(
          error.message ||
            "Não foi possível pesquisar usuários."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }, 650);

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
      document.removeEventListener(
        "mousedown",
        clicarFora
      );
    };
  }, []);

  return (
    <div ref={areaRef} style={styles.pesquisaArea}>
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
        style={styles.search}
      />

      {mostrarResultados && busca.trim() !== "" && (
        <div style={styles.resultadosPesquisa}>
          {busca.trim().length < 2 ? (
            <div style={styles.mensagemPesquisa}>
              Digite pelo menos 2 caracteres.
            </div>
          ) : carregando ? (
            <div style={styles.mensagemPesquisa}>
              Pesquisando...
            </div>
          ) : erro ? (
            <div
              style={{
                ...styles.mensagemPesquisa,
                color: "#b42318",
              }}
            >
              {erro}
            </div>
          ) : usuarios.length === 0 ? (
            <div style={styles.mensagemPesquisa}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            usuarios.map((usuario) => (
              <a
                key={usuario.id ?? usuario.users_id}
                href={`/perfil?users_id=${encodeURIComponent(
                  usuario.users_id
                )}`}
                style={styles.usuarioPesquisa}
              >
                {obterUrlImagem(usuario.foto_perfil) ? (
                  <img
                    src={obterUrlImagem(
                      usuario.foto_perfil
                    )}
                    alt="Foto do usuário"
                    style={styles.fotoPesquisa}
                  />
                ) : (
                  <div style={styles.semFotoPesquisa}>
                    👤
                  </div>
                )}

                <div>
                  <div style={styles.nomePesquisa}>
                    {usuario.nome || "Usuário"}
                  </div>

                  <div style={styles.usernamePesquisa}>
                    @{usuario.username || "sem-username"}
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// BOTÃO DE AMIZADE
// =====================================================

function BotaoAmizadePerfil({ usuarioVisitadoId }) {
  const [situacao, setSituacao] = useState("carregando");
  const [solicitacaoRecebidaId, setSolicitacaoRecebidaId] =
    useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [meuUsuarioId, setMeuUsuarioId] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!usuarioVisitadoId) return;

    let ativo = true;
    const controller = new AbortController();

    async function consultarAmizade() {
      setSituacao("carregando");
      setSolicitacaoRecebidaId(null);
      setErro("");
      setMeuUsuarioId(null);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Faça login para continuar."
          );
        }

        // Reaproveita /meu_perfil quando já consultado.
        const dadosMeuPerfil =
          await consultarMeuPerfil(token);

        if (!ativo) return;

        const meuId = Number(
          dadosMeuPerfil?.users_id ??
            dadosMeuPerfil?.perfil?.users_id
        );

        if (!Number.isInteger(meuId) || meuId <= 0) {
          throw new Error(
            "Não foi possível identificar sua conta."
          );
        }

        const visitadoId = Number(usuarioVisitadoId);

        setMeuUsuarioId(meuId);

        if (meuId === visitadoId) {
          setSituacao("proprio");
          return;
        }

        // Consulta amizade somente depois de
        // identificar a conta autenticada.
        const dadosAmizade = await consultarJson(
          `${XANO_BASE}/consultar_status_amizade?destinatario_id=${encodeURIComponent(
            usuarioVisitadoId
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          },
          "a situação da amizade"
        );

        if (!ativo || controller.signal.aborted) return;

        const lista = Array.isArray(
          dadosAmizade?.solicitacoes
        )
          ? dadosAmizade.solicitacoes
          : [];

        const registros = lista.filter(
          (solicitacao) => {
            const solicitante = Number(
              solicitacao.solicitante_id
            );

            const destinatario = Number(
              solicitacao.destinatario_id
            );

            return (
              (solicitante === meuId &&
                destinatario === visitadoId) ||
              (solicitante === visitadoId &&
                destinatario === meuId)
            );
          }
        );

        // Amizade aceita tem prioridade,
        // mesmo que existam registros antigos recusados.
        const amizadeAceita = registros.find(
          (item) => item.status === "aceita"
        );

        if (amizadeAceita) {
          setSituacao("amigos");
          return;
        }

        const pendente = registros.find(
          (item) => item.status === "pendente"
        );

        if (pendente) {
          const fuiEuQueEnviei =
            Number(pendente.solicitante_id) === meuId;

          setSolicitacaoRecebidaId(
            fuiEuQueEnviei ? null : Number(pendente.id)
          );

          setSituacao(
            fuiEuQueEnviei ? "enviada" : "recebida"
          );

          return;
        }

        setSituacao("disponivel");
      } catch (error) {
        if (!ativo || controller.signal.aborted) return;

        console.error(
          "Erro ao consultar amizade:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível consultar a amizade."
        );

        setSituacao("erro");
      }
    }

    consultarAmizade();

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [usuarioVisitadoId, tentativa]);

  async function adicionarAmigo() {
    if (
      enviando ||
      situacao !== "disponivel" ||
      !meuUsuarioId
    ) {
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Faça login para continuar."
        );
      }

      const dados = await consultarJson(
        `${XANO_BASE}/_enviar_solicitacao_amizade`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            destinatario_id: Number(usuarioVisitadoId),
          }),
        },
        "o envio da solicitação"
      );

      console.log("Solicitação enviada:", dados);

      setSituacao("enviada");
    } catch (error) {
      console.error(
        "Erro ao adicionar amigo:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível enviar a solicitação."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function responderSolicitacao(acao) {
    if (
      enviando ||
      situacao !== "recebida" ||
      !solicitacaoRecebidaId ||
      !["aceitar", "recusar"].includes(acao)
    ) {
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Faça login para continuar."
        );
      }

      await consultarJson(
        `${XANO_BASE}/responder_solicitacao_amizade`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            solicitacao_id: solicitacaoRecebidaId,
            acao,
          }),
        },
        "a resposta da solicitação"
      );

      setSolicitacaoRecebidaId(null);

      setSituacao(
        acao === "aceitar" ? "amigos" : "disponivel"
      );
    } catch (error) {
      console.error(
        "Erro ao responder solicitação:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível responder à solicitação."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!usuarioVisitadoId || situacao === "proprio") {
    return null;
  }

  const carregando = situacao === "carregando";
  const disponivel = situacao === "disponivel";

  const textoBotao = enviando
    ? "Enviando..."
    : carregando
    ? "Verificando amizade..."
    : situacao === "enviada"
    ? "✓ Solicitação enviada"
    : situacao === "amigos"
    ? "✓ Amigos"
    : situacao === "erro"
    ? "Amizade indisponível"
    : "＋ Adicionar amigo";

  return (
    <div style={styles.areaAmizade}>
      {situacao === "recebida" ? (
        <div style={styles.botoesAmizade}>
          <button
            type="button"
            onClick={() =>
              responderSolicitacao("aceitar")
            }
            disabled={enviando}
            style={{
              ...styles.botao,
              fontSize: 16,
              opacity: enviando ? 0.6 : 1,
            }}
          >
            {enviando
              ? "Processando..."
              : "✓ Aceitar"}
          </button>

          <button
            type="button"
            onClick={() =>
              responderSolicitacao("recusar")
            }
            disabled={enviando}
            style={{
              ...styles.botao,
              ...styles.botaoCinza,
              opacity: enviando ? 0.6 : 1,
            }}
          >
            Recusar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={adicionarAmigo}
          disabled={!disponivel || enviando}
          style={{
            ...styles.botao,
            backgroundColor: disponivel
              ? "#000"
              : "#e5e7eb",
            color: disponivel ? "#fff" : "#374151",
            cursor: disponivel
              ? "pointer"
              : "default",
            fontSize: 16,
          }}
        >
          {textoBotao}
        </button>
      )}

      {erro && (
        <div style={styles.erroAmizade}>
          <span role="alert">{erro}</span>

          {situacao === "erro" && (
            <button
              type="button"
              style={styles.botaoTentarNovamente}
              onClick={() =>
                setTentativa((atual) => atual + 1)
              }
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// PÁGINA PERFIL
// =====================================================

function SolicitacoesRecebidasPerfil() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [processandoId, setProcessandoId] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarSolicitacoes() {
      try {
        setCarregando(true);
        setErro("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Faça login novamente.");
        }

        const resposta = await fetch(
          `${XANO_BASE}/listar_solicitacoes_recebidas`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!resposta.ok) {
          throw new Error(
            resposta.status === 429
              ? "O Xano está limitando temporariamente as consultas."
              : `Erro ao consultar solicitações: ${resposta.status}`
          );
        }

        const dados = await resposta.json();

        if (controller.signal.aborted) return;

        const lista = Array.isArray(dados)
          ? dados
          : Array.isArray(dados?.items)
          ? dados.items
          : [];

        setSolicitacoes(lista);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Erro nas solicitações:", error);
        setErro(error.message || "Erro ao carregar solicitações.");
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarSolicitacoes();

    return () => controller.abort();
  }, [tentativa]);

  async function responderSolicitacao(solicitacao, acao) {
    if (processandoId !== null) return;

    try {
      setProcessandoId(solicitacao.id);
      setErro("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Faça login novamente.");
      }

      const resposta = await fetch(
        `${XANO_BASE}/responder_solicitacao_amizade`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            solicitacao_id: Number(solicitacao.id),
            acao,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error(
          resposta.status === 429
            ? "O Xano está limitando as requisições. Tente novamente mais tarde."
            : `Não foi possível responder à solicitação. Código: ${resposta.status}`
        );
      }

      // Remove da lista apenas depois da confirmação do Xano.
      setSolicitacoes((atual) =>
        atual.filter(
          (item) => Number(item.id) !== Number(solicitacao.id)
        )
      );
    } catch (error) {
      console.error("Erro ao responder amizade:", error);
      setErro(error.message || "Não foi possível responder.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <section
      style={{
        padding: 24,
        borderTop: "1px solid #eee",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 24,
          color: "#222",
        }}
      >
        🤝 Solicitações de amizade
      </h2>

      {carregando ? (
        <p>Carregando solicitações...</p>
      ) : erro && solicitacoes.length === 0 ? null : (
        <>
          {solicitacoes.length === 0 ? (
            <p style={{ color: "#666" }}>
              Nenhuma solicitação de amizade pendente.
            </p>
          ) : (
            solicitacoes.map((solicitacao) => (
              <div
                key={solicitacao.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid #eee",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <a
                    href={`/perfil?users_id=${encodeURIComponent(
                      solicitacao.solicitante_id
                    )}`}
                    style={{
                      color: "#222",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    👤 Usuário #{solicitacao.solicitante_id}
                  </a>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#666",
                      fontSize: 14,
                    }}
                  >
                    Enviou uma solicitação de amizade
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    disabled={processandoId !== null}
                    onClick={() =>
                      responderSolicitacao(solicitacao, "aceitar")
                    }
                    style={{
                      padding: "10px 16px",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    {processandoId === solicitacao.id
                      ? "Processando..."
                      : "✓ Aceitar"}
                  </button>

                  <button
                    type="button"
                    disabled={processandoId !== null}
                    onClick={() =>
                      responderSolicitacao(solicitacao, "recusar")
                    }
                    style={{
                      padding: "10px 16px",
                      background: "#e5e7eb",
                      color: "#333",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {erro && (
        <div style={{ marginTop: 12, color: "#b42318" }}>
          <p>{erro}</p>
          <button
            type="button"
            onClick={() => setTentativa((valor) => valor + 1)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              background: "white",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
    </section>
  );
}

function ListaAmigosPerfil({ usuarioId }) {
  const [amigos, setAmigos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAmigos() {
      try {
        setCarregando(true);
        setErro("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Faça login novamente.");
        }

        const resposta = await fetch(
          `${XANO_BASE}/listar_amigos_perfil?usuario_id=${encodeURIComponent(usuarioId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!resposta.ok) {
          throw new Error(
            resposta.status === 429
              ? "O Xano está limitando temporariamente as consultas."
              : `Erro ao carregar amigos: ${resposta.status}`
          );
        }

        const dados = await resposta.json();

        if (controller.signal.aborted) return;

        if (!Array.isArray(dados)) {
          throw new Error("O Xano não retornou uma lista válida.");
        }

        // Aceita tanto [17] quanto [[17]].
        const ids = [
          ...new Set(
            dados
              .flat(Infinity)
              .map(Number)
              .filter((id) => Number.isInteger(id) && id > 0)
          ),
        ];

        setAmigos(ids);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Erro ao listar amigos:", error);
        setErro(
          error.message || "Não foi possível carregar os amigos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    if (usuarioId) {
      carregarAmigos();
    }

    return () => controller.abort();
  }, [usuarioId, tentativa]);

  return (
    <div style={{ padding: "16px 0" }}>
      {carregando ? (
        <p>Carregando amigos...</p>
      ) : (
        <>
          {!erro && amigos.length === 0 && (
            <p style={{ color: "#666" }}>Nenhum amigo encontrado.</p>
          )}

          {amigos.map((amigoId) => (
            <a
              key={amigoId}
              href={`/perfil?users_id=${amigoId}`}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#222",
                textDecoration: "none",
                borderBottom: "1px solid #eee",
              }}
            >
              👤 Usuário #{amigoId}
            </a>
          ))}
        </>
      )}

      {erro && (
        <div style={{ color: "#b42318" }}>
          <p>{erro}</p>
          <button
            type="button"
            onClick={() => setTentativa((atual) => atual + 1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}

export default function Perfil() {
  const router = useRouter();

  const [hoverItem, setHoverItem] = useState("");
  const [perfil, setPerfil] = useState(null);
  const [visualizandoOutroPerfil, setVisualizandoOutroPerfil] =
    useState(false);

  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);
  const [erroPerfil, setErroPerfil] = useState("");

  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerfil, setPostsPerfil] = useState([]);
  const [totalAmigos, setTotalAmigos] = useState(null);
const [erroAmigos, setErroAmigos] = useState("");
const [mostrarListaAmigos, setMostrarListaAmigos] = useState(false);
  const [carregandoPosts, setCarregandoPosts] =
    useState(true);
  const [erroPosts, setErroPosts] = useState("");

  const [fotoPerfil, setFotoPerfil] = useState("");
  const [fotoCapa, setFotoCapa] = useState("");

  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [salvandoCapa, setSalvandoCapa] = useState(false);

  const [editandoPerfil, setEditandoPerfil] =
    useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const [bioEditada, setBioEditada] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] =
    useState(false);
  const [erroEdicao, setErroEdicao] = useState("");

  const carregamentoIdRef = useRef(0);

  const operacaoEmAndamento =
    salvandoFoto || salvandoCapa || salvandoPerfil;

  function logout() {
    limparCaches();
    localStorage.removeItem("token");
    router.push("/");
  }

  // =====================================================
  // BUSCAR PERFIL
  // =====================================================

  async function buscarPerfil() {
    const carregamentoId = ++carregamentoIdRef.current;

    try {
      setCarregandoPerfil(true);
      setErroPerfil("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const parametros = new URLSearchParams(
        window.location.search
      );

      const idNaUrl = parametros.get("users_id");

      const idSolicitado =
        idNaUrl && /^[1-9]\d*$/.test(idNaUrl)
          ? Number(idNaUrl)
          : null;

      const visualizandoOutro =
        idSolicitado !== null;

      let dadosPerfil;

      if (visualizandoOutro) {
        const dados = await consultarJson(
          `${XANO_BASE}/perfil_publico?users_id=${idSolicitado}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
          "o perfil público"
        );

        dadosPerfil = dados?.perfil;
      } else {
        dadosPerfil =
          await consultarMeuPerfil(token);
      }

      if (
        !dadosPerfil ||
        typeof dadosPerfil !== "object" ||
        !dadosPerfil.users_id
      ) {
        throw new Error(
          "O Xano não retornou um perfil válido."
        );
      }

      if (carregamentoId !== carregamentoIdRef.current) {
        return;
      }

      setVisualizandoOutroPerfil(visualizandoOutro);
      setPerfil(dadosPerfil);

      setFotoPerfil(
        obterUrlImagem(dadosPerfil.foto_perfil)
      );

      setFotoCapa(
        obterUrlImagem(dadosPerfil.foto_capa)
      );

      // Carrega publicações separadamente.
// A falha nas publicações não impede
// a exibição do perfil.
buscarTotalPosts(
  dadosPerfil.users_id,
  carregamentoId
);

// Consultar a quantidade real de amigos
buscarTotalAmigos(dadosPerfil.users_id);
    } catch (erro) {
      if (carregamentoId !== carregamentoIdRef.current) {
        return;
      }

      console.error(
        "Erro ao buscar perfil:",
        erro
      );

      setErroPerfil(
        erro.message || "Erro ao carregar perfil."
      );

      setCarregandoPosts(false);
    } finally {
      if (carregamentoId === carregamentoIdRef.current) {
        setCarregandoPerfil(false);
      }
    }
  }
   
async function buscarTotalAmigos(usuarioId) {
  try {
    setTotalAmigos(null);
    setErroAmigos("");

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Faça login novamente.");
    }

    const resposta = await fetch(
      `${XANO_BASE}/contar_amigos_perfil?usuario_id=${encodeURIComponent(usuarioId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!resposta.ok) {
      throw new Error(
        resposta.status === 429
          ? "O Xano está limitando temporariamente as consultas."
          : `Erro ao consultar amigos: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // O endpoint retorna diretamente um número.
    const quantidade = Number(dados);

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new Error(
        "O Xano não retornou uma quantidade válida de amigos."
      );
    }

    setTotalAmigos(quantidade);
  } catch (erro) {
    console.error("Erro ao contar amigos:", erro);

    setErroAmigos(
      erro.message || "Não foi possível contar os amigos."
    );

    // Mantém null para não mostrar zero incorretamente.
    setTotalAmigos(null);
  }
}

  // =====================================================
  // BUSCAR PUBLICAÇÕES
  // =====================================================

  async function buscarTotalPosts(
    usuarioId,
    carregamentoId = carregamentoIdRef.current
  ) {
    try {
      setCarregandoPosts(true);
      setErroPosts("");

      // Pequena espera para não disputar imediatamente
      // com as consultas de perfil e amizade.
      await esperar(900);

      if (
        carregamentoId !== carregamentoIdRef.current
      ) {
        return;
      }

      const resultado = await consultarPublicacoes();

      if (
        carregamentoId !== carregamentoIdRef.current
      ) {
        return;
      }

      const postsTexto = resultado.posts;
      const postsImagens = resultado.imagens;
      const postsVideos = resultado.videos;

      const textosDoUsuario = postsTexto.filter(
        (post) =>
          Number(post._usuario_id) === Number(usuarioId)
      );

      const imagensDoUsuario = postsImagens.filter(
        (post) =>
          Number(post.usuario_id) === Number(usuarioId)
      );

      const videosDoUsuario = postsVideos.filter(
        (post) =>
          Number(post.usuario_id) === Number(usuarioId)
      );

      const publicacoesTexto = textosDoUsuario.map(
        (post) => ({
          tipo: "texto",
          id: post.id,
          texto: post.texto,
          data: post.id,
        })
      );

      const publicacoesImagem = imagensDoUsuario.map(
        (post) => ({
          tipo: "imagem",
          id: post.id,
          imagem: post.image_url,
          data: post.id,
        })
      );

      const publicacoesVideo = videosDoUsuario.map(
        (post) => ({
          tipo: "video",
          id: post.id,
          video: post.url_do_video,
          legenda: post.legenda || "",
          data: post.id,
        })
      );

      const todasPublicacoes = [
        ...publicacoesTexto,
        ...publicacoesImagem,
        ...publicacoesVideo,
      ].sort(
        (a, b) => Number(b.data) - Number(a.data)
      );

      setPostsPerfil(todasPublicacoes);
      setTotalPosts(todasPublicacoes.length);

      if (resultado.falhas.length > 0) {
        setErroPosts(
          "Algumas publicações não puderam ser carregadas. " +
            "A contagem exibida pode estar incompleta."
        );
      }

      if (resultado.falhas.length === 3) {
        setErroPosts(
          "Não foi possível carregar as publicações. " +
            "Tente novamente em alguns instantes."
        );
      }
    } catch (erro) {
      if (
        carregamentoId !== carregamentoIdRef.current
      ) {
        return;
      }

      console.error(
        "Erro ao buscar publicações:",
        erro
      );

      // Mantém os dados já exibidos numa falha.
      setErroPosts(
        erro.message ||
          "Não foi possível carregar as publicações."
      );
    } finally {
      if (
        carregamentoId === carregamentoIdRef.current
      ) {
        setCarregandoPosts(false);
      }
    }
  }

  useEffect(() => {
    buscarPerfil();

    return () => {
      carregamentoIdRef.current += 1;
    };
  }, []);

  // =====================================================
  // EDITAR PERFIL
  // =====================================================

  function abrirEdicaoPerfil() {
    if (
      !perfil ||
      visualizandoOutroPerfil ||
      operacaoEmAndamento
    ) {
      return;
    }

    setNomeEditado(perfil.nome || "");
    setBioEditada(perfil.bio || "");
    setErroEdicao("");
    setEditandoPerfil(true);
  }

  async function atualizarPerfilXano(campos) {
    if (visualizandoOutroPerfil) {
      throw new Error(
        "Você não tem permissão para editar este perfil."
      );
    }

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Sua sessão expirou. Entre novamente."
      );
    }

    const atualizado = await consultarJson(
      `${XANO_BASE}/meu_perfil`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(campos),
      },
      "a atualização do perfil"
    );

    if (
      !atualizado ||
      Number(atualizado.users_id) !==
        Number(perfil.users_id)
    ) {
      throw new Error(
        "O Xano não confirmou a atualização do perfil."
      );
    }

    limparCacheMeuPerfil();

    return atualizado;
  }

  function montarDadosPerfil(alteracoes = {}) {
    return {
      nome: perfil.nome || "",
      username: perfil.username || "",
      bio: perfil.bio || "",
      foto_perfil: perfil.foto_perfil || "",
      foto_capa: perfil.foto_capa || "",
      ...alteracoes,
    };
  }

  function aplicarPerfilAtualizado(atualizado) {
    setPerfil(atualizado);

    setFotoPerfil(
      obterUrlImagem(atualizado.foto_perfil)
    );

    setFotoCapa(
      obterUrlImagem(atualizado.foto_capa)
    );
  }

  async function salvarEdicaoPerfil(evento) {
    evento.preventDefault();

    if (!perfil || operacaoEmAndamento) return;

    const nome = nomeEditado.trim();
    const bio = bioEditada.trim();

    if (!nome) {
      setErroEdicao(
        "Informe um nome para o perfil."
      );
      return;
    }

    try {
      setSalvandoPerfil(true);
      setErroEdicao("");

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          nome,
          bio,
        })
      );

      aplicarPerfilAtualizado(atualizado);
      setEditandoPerfil(false);
    } catch (erro) {
      console.error(
        "Erro ao salvar perfil:",
        erro
      );

      setErroEdicao(
        erro.message ||
          "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // =====================================================
  // UPLOAD DE IMAGENS
  // =====================================================

  async function enviarImagem(arquivo) {
    if (!arquivo.type.startsWith("image/")) {
      throw new Error(
        "Selecione um arquivo de imagem."
      );
    }

    const formData = new FormData();
    formData.append("file", arquivo);

    const respostaUpload = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!respostaUpload.ok) {
      throw new Error(
        `Falha no envio da imagem. Código: ${respostaUpload.status}`
      );
    }

    const dadosUpload =
      await respostaUpload.json();

    const urlImagem = dadosUpload?.url;

    if (
      typeof urlImagem !== "string" ||
      !/^https?:\/\//i.test(urlImagem)
    ) {
      throw new Error(
        "O upload não retornou um endereço válido para a imagem."
      );
    }

    return urlImagem;
  }

  async function alterarFotoPerfil(evento) {
    const arquivo = evento.target.files?.[0];

    if (
      !arquivo ||
      !perfil ||
      operacaoEmAndamento
    ) {
      return;
    }

    try {
      setSalvandoFoto(true);

      const urlFoto = await enviarImagem(arquivo);

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          foto_perfil: urlFoto,
        })
      );

      if (
        obterUrlImagem(atualizado.foto_perfil) !==
        urlFoto
      ) {
        throw new Error(
          "O Xano não confirmou o salvamento da fotografia."
        );
      }

      aplicarPerfilAtualizado(atualizado);

      alert(
        "Foto de perfil salva com sucesso!"
      );
    } catch (erro) {
      console.error(
        "Erro ao salvar foto de perfil:",
        erro
      );

      alert(
        erro.message ||
          "Não foi possível salvar a foto de perfil."
      );
    } finally {
      setSalvandoFoto(false);
      evento.target.value = "";
    }
  }

  async function alterarFotoCapa(evento) {
    const arquivo = evento.target.files?.[0];

    if (
      !arquivo ||
      !perfil ||
      operacaoEmAndamento
    ) {
      return;
    }

    try {
      setSalvandoCapa(true);

      const urlCapa = await enviarImagem(arquivo);

      const atualizado = await atualizarPerfilXano(
        montarDadosPerfil({
          foto_capa: urlCapa,
        })
      );

      if (
        obterUrlImagem(atualizado.foto_capa) !==
        urlCapa
      ) {
        throw new Error(
          "O Xano não confirmou o salvamento da foto de capa."
        );
      }

      aplicarPerfilAtualizado(atualizado);

      alert(
        "Foto de capa salva com sucesso!"
      );
    } catch (erro) {
      console.error(
        "Erro ao salvar foto de capa:",
        erro
      );

      alert(
        erro.message ||
          "Não foi possível salvar a foto de capa."
      );
    } finally {
      setSalvandoCapa(false);
      evento.target.value = "";
    }
  }

  // =====================================================
  // MENU LATERAL
  // =====================================================

  const itensMenu = [
    {
      id: "home",
      texto: "🏠 Home",
      rota: "/feed",
    },
    {
      id: "ia",
      texto: "IA",
      rota: "/IA",
    },
    {
      id: "explorar",
      texto: "📰 Feed",
      rota: "/imagens",
    },
    {
      id: "videos",
      texto: "🎬 Feed de vídeos",
      rota: "/feed-videos",
    },
    {
      id: "privacidade",
      texto: "🔒 Política de Privacidade",
      rota: "/politica-de-privacidade",
    },
    {
      id: "termos",
      texto: "📜 Termos de Uso",
      rota: "/termos-de-uso",
    },
  ];

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
    );
  }

  // =====================================================
  // INTERFACE DO PERFIL
  // =====================================================

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logo}>
            Conrad
          </div>

          <nav style={styles.menu}>
            {itensMenu.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={item.rota}
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
                      alt=""
                      style={styles.logoIA}
                    />
                  )}
                  {item.texto}
                </div>
              </Link>
            ))}

            <div style={styles.menuAtivo}>
              👤 Perfil
            </div>

            {itensMenu.slice(3).map((item) => (
              <Link
                key={item.id}
                href={item.rota}
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
          </nav>
        </div>

        <button
          type="button"
          style={styles.logout}
          onClick={logout}
        >
          Sair
        </button>
      </aside>

      <main style={styles.content}>
        <div style={styles.navbar}>
          <PesquisaUsuariosPerfil />
        </div>

        {carregandoPerfil ? (
          <div style={styles.estadoPerfil}>
            Carregando perfil...
          </div>
        ) : erroPerfil ? (
          <div style={styles.estadoPerfil}>
            <p>{erroPerfil}</p>

            <button
              type="button"
              style={styles.botao}
              onClick={buscarPerfil}
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
                <div style={styles.bannerVazio}>
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
                    opacity: operacaoEmAndamento
                      ? 0.65
                      : 1,
                    cursor: operacaoEmAndamento
                      ? "wait"
                      : "pointer",
                  }}
                >
                  {salvandoCapa
                    ? "Salvando capa..."
                    : "Alterar capa"}

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

            {/* FOTO DO PERFIL */}
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
                    opacity: operacaoEmAndamento
                      ? 0.65
                      : 1,
                    cursor: operacaoEmAndamento
                      ? "wait"
                      : "pointer",
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
                    {salvandoFoto
                      ? "Salvando foto..."
                      : "Alterar foto"}
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

              {!visualizandoOutroPerfil ? (
                <button
                  type="button"
                  style={styles.botao}
                  onClick={abrirEdicaoPerfil}
                  disabled={operacaoEmAndamento}
                >
                  Editar perfil
                </button>
              ) : (
                <BotaoAmizadePerfil
                  usuarioVisitadoId={perfil.users_id}
                />
              )}
            </div>

            <div style={styles.bio}>
              {perfil.bio?.trim() ||
                "Nenhuma biografia adicionada."}
            </div>
            {/* SOLICITAÇÕES DE AMIZADE RECEBIDAS */}
{!visualizandoOutroPerfil && (
  <SolicitacoesRecebidasPerfil />
)}
      
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
    <button
      type="button"
      onClick={() =>
        setMostrarListaAmigos((atual) => !atual)
      }
      aria-expanded={mostrarListaAmigos}
      disabled={totalAmigos === null}
      style={{
        background: "transparent",
        border: "none",
        cursor:
          totalAmigos === null ? "default" : "pointer",
        font: "inherit",
        padding: 0,
        color: "inherit",
      }}
    >
      <div style={styles.statNumero}>
        {totalAmigos === null ? "—" : totalAmigos}
      </div>

      <div style={styles.statTexto}>
        Amigos
      </div>
    </button>

    {erroAmigos && (
      <div
        style={{
          color: "#b42318",
          fontSize: 12,
          marginTop: 6,
          maxWidth: 180,
        }}
      >
        {erroAmigos}
      </div>
    )}
  </div>
</div>

{/* LISTA DE AMIGOS */}
{mostrarListaAmigos && perfil && (
  <section
    style={{
      padding: "20px 30px",
      borderTop: "1px solid #eee",
    }}
  >
    <h2 style={{ fontSize: 24, marginBottom: 12 }}>
      🤝 Amigos
    </h2>

    <ListaAmigosPerfil usuarioId={perfil.users_id} />
  </section>
)}

{/* PUBLICAÇÕES */}


            {/* PUBLICAÇÕES */}
            <div style={styles.publicacoes}>
              <div style={styles.tituloPublicacoes}>
                Publicações
              </div>

              {erroPosts && (
                <div style={styles.avisoPosts}>
                  {erroPosts}

                  <button
                    type="button"
                    style={styles.botaoTentarNovamente}
                    onClick={() => {
                      cachePublicacoes = null;
                      buscarTotalPosts(perfil.users_id);
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {carregandoPosts ? (
                <div style={styles.mensagemPosts}>
                  Carregando publicações...
                </div>
              ) : postsPerfil.length === 0 ? (
                <div style={styles.mensagemPosts}>
                  {erroPosts
                    ? "Publicações temporariamente indisponíveis."
                    : "Nenhuma publicação ainda."}
                </div>
              ) : (
                postsPerfil.map(renderizarPublicacao)
              )}
            </div>
          </div>
        ) : null}

        {/* JANELA DE EDIÇÃO */}
        {editandoPerfil && (
          <div
            style={styles.modalOverlay}
            onClick={() => {
              if (!salvandoPerfil) {
                setEditandoPerfil(false);
              }
            }}
          >
            <form
              style={styles.modal}
              onClick={(evento) =>
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
                onChange={(evento) =>
                  setNomeEditado(evento.target.value)
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
                onChange={(evento) =>
                  setBioEditada(evento.target.value)
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
      </main>
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
    justifyContent: "space-between",
    borderRight: "1px solid #ddd",
  },

  logo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },

  logoIA: {
    width: 32,
    height: 32,
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
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  menuHover: {
    backgroundColor: "#edf3ff",
    color: "#1877f2",
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
    color: "#fff",
    border: "none",
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 18,
    cursor: "pointer",
    textAlign: "center",
  },

  content: {
    flex: 1,
    padding: 10,
    minWidth: 0,
  },

  navbar: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
  },

  pesquisaArea: {
    position: "relative",
    width: 350,
    maxWidth: "100%",
    zIndex: 100,
  },

  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    borderRadius: 30,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 15,
    backgroundColor: "white",
  },

  resultadosPesquisa: {
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
    zIndex: 101,
  },

  usuarioPesquisa: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottom: "1px solid #f0f0f0",
    color: "#222",
    textDecoration: "none",
    cursor: "pointer",
  },

  fotoPesquisa: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },

  semFotoPesquisa: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  nomePesquisa: {
    fontSize: 14,
    fontWeight: "bold",
    overflowWrap: "anywhere",
  },

  usernamePesquisa: {
    fontSize: 13,
    color: "#777",
    overflowWrap: "anywhere",
  },

  mensagemPesquisa: {
    padding: 15,
    fontSize: 14,
    color: "#666",
  },

  estadoPerfil: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 40,
    textAlign: "center",
    color: "#444",
    maxWidth: 900,
    margin: "0 auto",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    maxWidth: 900,
    margin: "0 auto",
  },

  bannerContainer: {
    position: "relative",
  },

  banner: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    display: "block",
  },

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
    textAlign: "center",
  },

  iconeCapa: {
    fontSize: 42,
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
    fontWeight: "bold",
  },

  avatarArea: {
    marginTop: -40,
    marginLeft: 30,
    position: "relative",
    zIndex: 10,
  },

  avatarLabel: {
    display: "inline-block",
    position: "relative",
    cursor: "pointer",
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    backgroundColor: "white",
    padding: 6,
    objectFit: "cover",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },

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
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },

  avatarHint: {
    display: "block",
    textAlign: "center",
    color: "#555",
    fontSize: 13,
  },

  info: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px 0px 30px",
    gap: 16,
    flexWrap: "wrap",
  },

  nome: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#222",
    overflowWrap: "anywhere",
  },

  usuario: {
    fontSize: 22,
    color: "#666",
    marginTop: 5,
  },

  botao: {
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },

  botaoCinza: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontSize: 16,
  },

  areaAmizade: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },

  botoesAmizade: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  erroAmizade: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "#b42318",
    fontSize: 13,
    maxWidth: 280,
  },

  botaoTentarNovamente: {
    backgroundColor: "transparent",
    border: "1px solid #bbb",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#333",
    cursor: "pointer",
    alignSelf: "flex-start",
    fontSize: 13,
  },

  bio: {
    fontSize: 24,
    color: "#333",
    padding: "20px 30px",
    overflowWrap: "anywhere",
  },

  stats: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid #eee",
    marginTop: 10,
    padding: 30,
  },

  statBox: {
    textAlign: "center",
  },

  statNumero: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
  },

  statTexto: {
    marginTop: 5,
    color: "#666",
    fontSize: 18,
  },

  publicacoes: {
    borderTop: "1px solid #eee",
    padding: 30,
  },

  tituloPublicacoes: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  avisoPosts: {
    color: "#92400e",
    fontSize: 14,
    marginBottom: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },

  mensagemPosts: {
    textAlign: "center",
    color: "#666",
    fontSize: 18,
    padding: 30,
  },

  postCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    border: "1px solid #eee",
  },

  postTexto: {
    fontSize: 20,
    color: "#222",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },

  postImagem: {
    width: "100%",
    maxHeight: 600,
    objectFit: "cover",
    borderRadius: 12,
    display: "block",
  },

  postVideo: {
    width: "100%",
    maxHeight: 600,
    objectFit: "contain",
    borderRadius: 12,
    display: "block",
    backgroundColor: "#000",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 16,
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
    boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
  },

  modalTitulo: {
    margin: "0 0 10px",
    fontSize: 26,
  },

  campoLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },

  campoInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 10,
    font: "inherit",
  },

  erroEdicao: {
    color: "#b42318",
    margin: 0,
  },

  modalBotoes: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },

  botaoCancelar: {
    backgroundColor: "#eee",
    color: "#222",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: 18,
    cursor: "pointer",
  },
};
