"use client";

export default function IA() {
  return (
    <div
      style={{
        backgroundColor: "#0f0f0f",
        color: "white",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <img
        src="/logo/logo-simbolo.png"
        alt="Conrad IA"
        style={{
          width: 140,
          height: 140,
          objectFit: "contain",
          marginBottom: 25,
        }}
      />

      <h1
        style={{
          fontSize: 48,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Olá Claiton
      </h1>

      <p
        style={{
          fontSize: 24,
          opacity: 0.8,
        }}
      >
        Eu sou o Conrad IA
      </p>
    </div>
  );
}