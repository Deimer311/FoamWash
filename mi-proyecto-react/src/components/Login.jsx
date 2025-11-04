import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const crearToken = async () => {
    try {
      const response = await fetch("http://localhost:3001/usuarios");
      const data = await response.json();

      const usuario = data.find(
        (user) => user.email === email && user.password === password
      );

      if (usuario) {
        const nuevoToken = Math.random().toString(36).substring(2) + Date.now();
        setToken(nuevoToken);
        alert("✅ Token generado correctamente");
      } else {
        alert("❌ Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al generar token:", error);
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>

      <label>Email:</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Contraseña:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={crearToken}>Crear Token</button>

      {token && (
        <div style={{ marginTop: "20px" }}>
          <strong>Tu token:</strong>
          <p style={{ background: "#eee", padding: "10px" }}>{token}</p>

          {/* 👇 Este botón solo aparece cuando el token existe */}
          <a href="tercera.html">
            <button type="button">Iniciar sesión</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default Login;
