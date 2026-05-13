'use client'

import "@fontsource/inter"

export default function Perfil() {

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <div style={styles.profileArea}>

          <img
            src="/usuario.png"
            alt="Usuário"
            style={styles.avatar}
          />

          <div>

            <div style={styles.nome}>
              Usuário
            </div>

            <div style={styles.usuario}>
              @usuario
            </div>

          </div>

        </div>

        <div style={styles.bio}>
          Construindo uma rede social com IA 🚀
        </div>

        <button style={styles.botao}>
          Editar perfil
        </button>

      </div>

    </div>
  )
}

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif"
  },

  card: {
    backgroundColor: "white",
    width: 500,
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    textAlign: "center"
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30
  },

  avatar: {
    width: 80,
    height: 80,
    objectFit: "contain"
  },

  nome: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#222"
  },

  usuario: {
    fontSize: 20,
    color: "#666",
    marginTop: 5
  },

  bio: {
    fontSize: 20,
    color: "#333",
    marginBottom: 35
  },

  botao: {
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer"
  }
}