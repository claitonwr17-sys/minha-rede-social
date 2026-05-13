'use client'

export default function Perfil() {

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <img
          src="/avatar.png"
          style={styles.avatar}
        />

        <h1 style={styles.nome}>
          Claiton
        </h1>

        <p style={styles.username}>
          @claitonwr
        </p>

        <p style={styles.bio}>
          Construindo uma rede social com IA 🚀
        </p>

        <button style={styles.button}>
          Editar perfil
        </button>

      </div>

    </div>
  )
}

const styles = {

  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Inter, sans-serif'
  },

  card: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 20,
    width: 400,
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: 20
  },

  nome: {
    margin: 0,
    fontSize: 28
  },

  username: {
    color: '#666',
    marginTop: 5
  },

  bio: {
    marginTop: 20,
    lineHeight: 1.5
  },

  button: {
    marginTop: 25,
    backgroundColor: '#1877f2',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}