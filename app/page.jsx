'use client'

import "@fontsource/inter"

export default function Perfil() {

  return (

    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>

        <div style={styles.logo}>
          🚀 Conrad
        </div>

        <div style={styles.menu}>

          <div style={styles.menuItem}>
            🏠 Home
          </div>

          <div style={styles.menuItem}>
            🤖 IA
          </div>

          <div style={styles.menuItem}>
            🔍 Explorar
          </div>

          <div style={styles.menuAtivo}>
            👤 Perfil
          </div>

          <div style={styles.menuItem}>
            ⚙️ Configurações
          </div>

        </div>

        <div style={styles.logout}>
          🚪 Sair
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

        {/* CARD PERFIL */}
        <div style={styles.card}>

          {/* BANNER */}
          <img
            src="/terra.jpg"
            alt="Banner"
            style={styles.banner}
          />

          {/* FOTO */}
          <div style={styles.avatarArea}>

            <img
              src="/usuario.png"
              alt="Usuário"
              style={styles.avatar}
            />

          </div>

          {/* INFO */}
          <div style={styles.info}>

            <div>

              <div style={styles.nome}>
                Usuário
              </div>

              <div style={styles.usuario}>
                @usuario
              </div>

            </div>

            <button style={styles.botao}>
              Editar perfil
            </button>

          </div>

          <div style={styles.bio}>
            Construindo uma rede social com IA 🚀
          </div>

          {/* ESTATÍSTICAS */}
          <div style={styles.stats}>

            <div style={styles.statBox}>
              <div style={styles.statNumero}>0</div>
              <div style={styles.statTexto}>Posts</div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statNumero}>0</div>
              <div style={styles.statTexto}>Seguidores</div>
            </div>

            <div style={styles.statBox}>
              <div style={styles.statNumero}>0</div>
              <div style={styles.statTexto}>Seguindo</div>
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
    fontSize: 18
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
    color: "red",
    fontSize: 18,
    cursor: "pointer"
  },

  content: {
    flex: 1,
    padding: 30
  },

  navbar: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30
  },

  search: {
    width: 300,
    padding: 12,
    borderRadius: 30,
    border: "1px solid #ddd",
    outline: "none"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    maxWidth: 900,
    margin: "0 auto"
  },

  banner: {
    width: "100%",
    height: 230,
    objectFit: "cover"
  },

  avatarArea: {
    marginTop: -60,
    marginLeft: 30
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    backgroundColor: "white",
    padding: 6,
    objectFit: "contain",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  },

  info: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px 0px 30px"
  },

  nome: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#222"
  },

  usuario: {
    fontSize: 22,
    color: "#666",
    marginTop: 5
  },

  botao: {
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer"
  },

  bio: {
    fontSize: 24,
    color: "#333",
    padding: "20px 30px"
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
  }
}