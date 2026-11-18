
"use client";

import { useRouter } from "next/navigation";

export default function TermosDeUso() {
  const router = useRouter();

  const secoes = [
    {
      titulo: "1. Apresentação",
      texto: `Bem-vindo ao Conrad AI!

      Estes Termos de Uso apresentam as regras e condições
      para utilização da plataforma Conrad AI, uma rede
      social que disponibiliza recursos de publicação,
      interação e análise de conteúdos por inteligência
      artificial.

      Ao utilizar a plataforma, o usuário deve respeitar
      as regras aqui apresentadas e a legislação aplicável.`,
    },
    {
      titulo: "2. Cadastro e responsabilidade pela conta",
      texto: `Para utilizar determinadas funcionalidades, o usuário
      precisa criar uma conta fornecendo e-mail e senha.

      O usuário é responsável por fornecer informações
      corretas, manter suas credenciais em segurança e
      evitar o compartilhamento indevido de sua conta.

      Caso identifique acesso não autorizado, deverá
      comunicar o problema ao responsável pela plataforma
      por meio do canal de atendimento disponibilizado.`,
    },
    {
      titulo: "3. Publicações e conteúdos",
      texto: `O Conrad AI permite que usuários publiquem textos,
      imagens e vídeos e interajam com conteúdos de
      outros participantes.

      O usuário é responsável pelos conteúdos que
      publica e deve possuir os direitos ou autorizações
      necessários para compartilhá-los.

      Publicações disponibilizadas em áreas públicas
      podem ser visualizadas por outras pessoas.`,
    },
    {
      titulo: "4. Regras de convivência",
      texto: `O Conrad AI busca proporcionar um ambiente de
      respeito e convivência responsável.

      Não são permitidas ameaças, perseguição,
      assédio, discriminação, incentivo à violência,
      golpes, fraudes ou outras práticas ilegais.

      Também não é permitido utilizar a plataforma
      para divulgar dados pessoais de terceiros
      sem autorização ou fundamento legal adequado.`,
    },
    {
      titulo: "5. Conteúdos proibidos",
      texto: `É proibido publicar ou distribuir conteúdos
      que violem a legislação aplicável, incluindo
      materiais de exploração sexual infantil,
      ameaças criminosas, fraudes e conteúdos
      que violem direitos de terceiros.

      A plataforma também poderá restringir conteúdos
      que contrariem as regras de convivência
      estabelecidas nestes Termos de Uso.`,
    },
    {
      titulo: "6. Inteligência artificial",
      texto: `O Conrad AI utiliza recursos de inteligência
      artificial para oferecer análises e interpretações
      de conteúdos, incluindo textos, imagens e vídeos.

      Os resultados são produzidos automaticamente
      e podem conter erros, imprecisões ou limitações.

      As análises não representam conclusões definitivas
      sobre pessoas, comportamentos ou acontecimentos
      e não substituem avaliações profissionais.

      O usuário deve considerar essas limitações ao
      interpretar ou utilizar os resultados.`,
    },
    {
      titulo: "7. Direitos autorais",
      texto: `O usuário deve respeitar os direitos autorais,
      direitos de imagem e demais direitos de terceiros.

      Não é permitido publicar materiais protegidos
      sem possuir autorização ou outra base legal
      que permita sua utilização.

      O envio de conteúdo à plataforma não transfere
      automaticamente sua propriedade ao Conrad AI.

      O usuário autoriza o tratamento técnico do
      conteúdo necessário para disponibilizar a
      publicação e executar as funcionalidades
      solicitadas, observada a legislação aplicável.`,
    },
    {
      titulo: "8. Uso indevido da plataforma",
      texto: `Não é permitido tentar acessar contas de
      terceiros sem autorização, explorar falhas de
      segurança, distribuir códigos maliciosos,
      comprometer os serviços ou utilizar mecanismos
      automatizados para prejudicar a plataforma.

      Também são proibidas tentativas de fraude,
      falsificação de identidade e utilização
      abusiva dos recursos disponibilizados.`,
    },
    {
      titulo: "9. Moderação e medidas de proteção",
      texto: `O Conrad AI poderá avaliar situações de
      descumprimento destes Termos e, quando
      tecnicamente disponível e juridicamente
      adequado, adotar medidas proporcionais,
      como restringir conteúdos ou contas.

      A adoção dessas medidas dependerá dos recursos
      efetivamente implementados na plataforma,
      das circunstâncias do caso e da legislação
      aplicável.

      O Conrad AI não garante a identificação
      imediata de todas as violações.`,
    },
    {
      titulo: "10. Disponibilidade do serviço",
      texto: `O Conrad AI está em desenvolvimento e
      aperfeiçoamento contínuo.

      Algumas funcionalidades poderão sofrer
      alterações, apresentar falhas temporárias
      ou ficar indisponíveis durante atividades
      de manutenção e atualização.

      A plataforma buscará manter o funcionamento
      adequado dos serviços, sem garantir
      disponibilidade ininterrupta.`,
    },
    {
      titulo: "11. Privacidade e proteção de dados",
      texto: `O tratamento de informações pessoais
      relacionadas ao uso do Conrad AI é descrito
      na Política de Privacidade da plataforma.

      Recomendamos que o usuário consulte esse
      documento para compreender as informações
      coletadas, suas finalidades e os direitos
      previstos na legislação de proteção de dados.`,
    },
    {
      titulo: "12. Responsabilidades e limitações",
      texto: `Cada usuário é responsável pelo uso que
      faz da plataforma e pelos conteúdos
      que publica, observada a legislação.

      O Conrad AI não garante a exatidão de
      todas as informações publicadas por usuários
      ou produzidas automaticamente por sistemas
      de inteligência artificial.

      Nenhuma disposição destes Termos afasta
      direitos ou responsabilidades que não
      possam ser excluídos pela legislação.`,
    },
    {
      titulo: "13. Alterações nos Termos de Uso",
      texto: `Estes Termos poderão ser atualizados
      para acompanhar mudanças nas funcionalidades,
      nas regras da plataforma e na legislação.

      A versão atualizada será disponibilizada
      nesta página, com a respectiva data
      de atualização.`,
    },
    {
      titulo: "14. Contato",
      texto: `O canal oficial de atendimento do Conrad AI
      está em definição.

      Antes da publicação definitiva destes Termos,
      será disponibilizado um meio de contato
      funcional para dúvidas, solicitações
      e comunicações relacionadas à plataforma.`,
    },
  ];

  return (
    <main style={styles.pagina}>
      <header style={styles.cabecalho}>
        <div style={styles.marca}>
          <img
            src="/logo/logo-simbolo.png"
            alt="Logo Conrad AI"
            style={{
              width: 38,
              height: 38,
              objectFit: "contain",
            }}
          />
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
            REGRAS E CONDIÇÕES DE UTILIZAÇÃO
          </div>

          <h1 style={styles.titulo}>
            Termos de Uso
          </h1>

          <p style={styles.subtitulo}>
            Conheça as regras para utilizar o Conrad AI,
            publicar conteúdos, interagir com outros
            usuários e utilizar os recursos de
            inteligência artificial.
          </p>

          <p style={styles.data}>
            Versão preliminar — 18 de novembro de 2026
          </p>
        </div>

        <div style={styles.aviso}>
          <strong>Documento em preparação.</strong>{" "}
          Estes Termos de Uso ainda precisam de revisão
          antes de sua publicação definitiva, especialmente
          quanto às regras de moderação, às funcionalidades
          efetivamente disponíveis e ao canal de contato.
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

          <section style={styles.secaoFinal}>
            <h2 style={styles.tituloSecao}>
              Política de Privacidade
            </h2>

            <p style={styles.textoSecao}>
              Para saber como seus dados pessoais são
              tratados, consulte nossa Política de
              Privacidade.
            </p>

            <button
              type="button"
              style={styles.botaoPolitica}
              onClick={() =>
                router.push("/politica-de-privacidade")
              }
            >
              🔒 Consultar Política de Privacidade
            </button>
          </section>
        </div>

        <footer style={styles.rodape}>
          <strong>Conrad AI</strong>

          <p>
            Uma rede social com inteligência artificial
            e compromisso com o uso responsável
            da tecnologia.
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
  secaoFinal: {
    padding: "25px 0",
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
  botaoPolitica: {
    marginTop: 18,
    padding: "12px 18px",
    backgroundColor: "#155eef",
    color: "#ffffff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
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
