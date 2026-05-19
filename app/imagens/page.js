"use client";

export default function Imagens() {
  return (
    <div style={styles.page}>

      {/* SIDEBAR (igual Home) */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>📸 Conrad</div>

        <a href="/" style={styles.link}>🏠 Home</a>
        <a href="/feed" style={styles.link}>🤖 IA</a>
        <a href="/imagens" style={styles.active}>🖼 Feed</a>
        <a href="/perfil" style={styles.link}>👤 Perfil</a>

        <div style={styles.logout}>Sair</div>
      </div>

      {/* CONTEÚDO */}
      <div style={styles.content}>

        <h2>Feed de Imagens</h2>

        {/* POST VAZIO 1 */}
        <div style={styles.card}>
          <div style={styles.placeholder}>📷 Imagem vazia</div>
        </div>

        {/* POST VAZIO 2 */}
        <div style={styles.card}>
          <div style={styles.placeholder}>📷 Imagem vazia</div>
        </div>

        {/* POST VAZIO 3 */}
        <div style={styles.card}>
          <div style={styles.placeholder}>📷 Imagem vazia</div>
        </div>

      </div>

    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    fontFamily: "Arial",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
  },

  /* SIDEBAR */
  sidebar: {
    width: 220,
    backgroundColor: "white",
    height: "100vh",
    padding: 20,
    borderRight: "1px solid #ddd",
    position: "fixed",
  },

  logo: {
    fontWeight: "bold",
    marginBottom: 20,
  },

  link: {
    display: "block",
    padding: 10,
    color: "#333",
    textDecoration: "none",
    marginBottom: 5,
    borderRadius: 8,
  },

  active: {
    display: "block",
    padding: 10,
    backgroundColor: "#e7f3ff",
    color: "#1877f2",
    textDecoration: "none",
    marginBottom: 5,
    borderRadius: 8,
  },

  logout: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
    borderRadius: 8,
    cursor: "pointer",
  },

  /* CONTEÚDO */
  content: {
    marginLeft: 240,
    padding: 20,
    width: "100%",
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  placeholder: {
    height: 200,
    backgroundColor: "#eaeaea",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: 16,
  },
};