'use client'

import "@fontsource/inter"

export default function Perfil() {

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <img
          src="/terra.jpg"
          alt="Capa"
          style={styles.capa}
        />

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
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    textAlign: "center",
    paddingBottom: 40
  },

  capa: {
    width: "100%",
    height: 180,
    objectFit: "cover"
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: -40,
    marginBottom: 30
  },

  avatar: {
    width: 90,
    height: 90,
    objectFit: "contain",
    backgroundColor: "white",
    borderRadius: "50%",
    padding: 6
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
    marginBottom: 35,
    padding: "0 20px"
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