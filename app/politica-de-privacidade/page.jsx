"use client";

import { useRouter } from "next/navigation";

export default function PoliticaDePrivacidade() {
  const router = useRouter();

  const secoes = [
    {
      titulo: "1. Introdução",
      texto: `Esta Política de Privacidade explica como o Conrad AI
      trata informações relacionadas ao uso da plataforma.
      Nosso objetivo é oferecer transparência sobre os dados
      utilizados no cadastro, nas publicações e nos recursos
      de inteligência artificial.`,
    },
    {
      titulo: "2. Dados de cadastro",
      texto: `Para criar uma conta, o usuário fornece e-mail e senha.
      O sistema também registra um identificador da conta e
      sua data de criação. Essas informações são utilizadas
      para identificação, autenticação e funcionamento da
      plataforma.`,
    },
    {
      titulo: "3. Publicações e interações",
      texto: `O Conrad AI permite a publicação de conteúdos, como
      textos, imagens e vídeos, além de interações como
      comentários e reações. As informações relacionadas
      a essas atividades podem ser registradas nos serviços
      utilizados pela plataforma. Conteúdos publicados em
      áreas públicas podem ser visualizados por outros usuários.`,
    },
    {
      titulo: "4. Inteligência artificial",
      texto: `O Conrad AI utiliza recursos de inteligência artificial
      para analisar conteúdos enviados pelos usuários.
      Dependendo da funcionalidade utilizada, textos, imagens
      e vídeos podem ser processados por serviços de terceiros,
      incluindo tecnologias do Google Cloud e Gemini.
      Os resultados das análises são automatizados e podem
      apresentar imprecisões. Eles não devem ser interpretados
      como avaliações definitivas sobre pessoas ou conteúdos.`,
    },
    {
      titulo: "5. Armazenamento e serviços externos",
      texto: `O funcionamento do Conrad AI envolve serviços como
      Xano, Cloudinary, Cloudflare e Google Cloud.
      Esses serviços podem participar do armazenamento,
      da disponibilização ou do processamento de informações,
      conforme a funcionalidade utilizada. Alguns tratamentos
      podem envolver infraestrutura localizada fora do Brasil.`,
    },
    {
      titulo: "6. Finalidades do tratamento",
      texto: `As informações são tratadas para permitir a criação
      e utilização de contas, disponibilizar publicações,
      executar funcionalidades solicitadas pelos usuários,
      processar análises de inteligência artificial e manter
      o funcionamento técnico da plataforma.`,
    },
    {
      titulo: "7. Segurança das informações",
      texto: `A proteção dos dados pessoais é uma preocupação
      importante para o Conrad AI. A plataforma busca
      adotar medidas técnicas e organizacionais adequadas
      aos riscos envolvidos. Entretanto, nenhum serviço
      conectado à internet pode garantir segurança absoluta.`,
    },
    {
      titulo: "8. Direitos dos usuários",
      texto: `Nos termos da Lei Geral de Proteção de Dados Pessoais
      (LGPD), os titulares podem exercer direitos previstos
      na legislação, incluindo solicitações de confirmação
      de tratamento, acesso, correção e eliminação de dados,
      quando aplicáveis. As solicitações serão avaliadas
      conforme os requisitos legais.`,
    },
    {
      titulo: "9. Conservação e exclusão de dados",
      texto: `Os períodos de conservação das informações dependem
      das finalidades do tratamento, das necessidades técnicas
      e de eventuais obrigações legais. Solicitações de exclusão
      serão analisadas considerando os direitos dos titulares
      e as hipóteses de conservação previstas na legislação.`,
    },
    {
      titulo: "10. Cookies e tecnologias semelhantes",
      texto: `A plataforma pode utilizar recursos técnicos do
      navegador necessários à autenticação, à manutenção
      de sessões e ao funcionamento de funcionalidades.
      O uso de outras tecnologias deverá ser informado
      conforme sua efetiva implementação.`,
    },
    {
      titulo: "11. Alterações desta política",
      texto: `Esta Política de Privacidade poderá ser atualizada
      para refletir mudanças no funcionamento do Conrad AI,
      nos serviços utilizados ou na legislação aplicável.
      A versão atualizada será disponibilizada nesta página.`,
    },
    {
      titulo: "12. Contato sobre dados pessoais",
      texto: `O canal específico para solicitações relacionadas
      à privacidade e à proteção de dados está em definição.
      Esta seção será atualizada com um meio de contato
      funcional antes da publicação definitiva da política.`,
    },
  ];

  return (
    <main style={styles.pagina}>
      <header style={styles.cabecalho}>
        <div style={styles.marca}>
          <div style={styles.simbolo}>C</div>
          <span>Conrad AI</span>
        </div>

        <button
          type="button"
          style={styles.botaoVoltar}
          onClick={() => router.back()}
        >
          ← Voltar ao site
        </button>
      </header>

      <div style={styles.conteudo}>
        <div style={styles.introducao}>
          <div style={styles.etiqueta}>
            PRIVACIDADE E PROTEÇÃO DE DADOS
          </div>

          <h1 style={styles.titulo}>
            Política de Privacidade
          </h1>

          <p style={styles.subtitulo}>
            Saiba como o Conrad AI trata informações
            relacionadas à sua conta, às publicações e
            às funcionalidades de inteligência artificial.
          </p>

          <p style={styles.data}>
            Versão preliminar — 18 de novembro de 2026
          </p>
        </div>

        <div style={styles.aviso}>
          <strong>Documento em preparação.</strong>{" "}
          Esta versão deve ser revisada antes da publicação
          definitiva, especialmente quanto ao contato para
          exercício de direitos, à segurança, aos prazos de
          retenção e às práticas reais de tratamento de dados.
        </div>

        <div style={styles.secoes}>
          {secoes.map((secao, indice) => (
            <section key={indice} style={styles.secao}>
              <h2 style={styles.tituloSecao}>
                {secao.titulo}
              </h2>

              <p style={styles.textoSecao}>
                {secao.texto}
              </p>
            </section>
          ))}
        </div>

        <footer style={styles.rodape}>
          <strong>Conrad AI</strong>
          <p>
            Privacidade, transparência e responsabilidade
            no uso da inteligência artificial.
          </p>
          <button
            type="button"
            style={styles.botaoRodape}
            onClick={() => router.back()}
          >
            Voltar ao site
          </button>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#172033",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  cabecalho: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  marca: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 21,
    fontWeight: 800,
  },
  simbolo: {
    width: 38,
    height: 38,
    backgroundColor: "#155eef",
    color: "#ffffff",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 900,
    fontSize: 23,
  },
  botaoVoltar: {
    backgroundColor: "#ffffff",
    color: "#172033",
    border: "1px solid #dce2eb",
    padding: "11px 17px",
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  conteudo: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "30px 24px 70px",
  },
  introducao: {
    marginBottom: 30,
  },
  etiqueta: {
    color: "#155eef",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  titulo: {
    fontSize: "clamp(30px, 5vw, 46px)",
    lineHeight: 1.2,
    letterSpacing: -1,
    margin: "0 0 18px",
  },
  subtitulo: {
    fontSize: 17,
    color: "#536174",
    lineHeight: 1.8,
    marginBottom: 18,
  },
  data: {
    fontSize: 13,
    color: "#758195",
  },
  aviso: {
    padding: 20,
    backgroundColor: "#fff8e8",
    border: "1px solid #f0dca7",
    borderRadius: 12,
    color: "#665122",
    fontSize: 14,
    lineHeight: 1.8,
    marginBottom: 24,
  },
  secoes: {
    backgroundColor: "#ffffff",
    border: "1px solid #e6eaf0",
    borderRadius: 16,
    padding: "10px 28px",
  },
  secao: {
    padding: "25px 0",
    borderBottom: "1px solid #edf0f4",
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: 750,
    margin: "0 0 13px",
  },
  textoSecao: {
    fontSize: 15,
    lineHeight: 1.9,
    color: "#4c596b",
    margin: 0,
    whiteSpace: "pre-line",
  },
  rodape: {
    textAlign: "center",
    padding: "40px 15px",
    color: "#536174",
    fontSize: 14,
  },
  botaoRodape: {
    marginTop: 12,
    padding: "12px 22px",
    backgroundColor: "#172033",
    color: "#ffffff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 700,
  },
};
