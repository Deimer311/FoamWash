import React, { useState } from "react";
import "./index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  // Función que genera un token en base64
  const crearToken = (user) => {
    const datos = {
      id: user.id,
      email: user.email,
      name: user.name,
      expira: Date.now() + 86400000, // 24 horas
    };
    return btoa(JSON.stringify(datos)); // genera token simple
  };

  // Cuando se hace clic en "Crear Token"
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/usuarios");
      const data = await res.json();

      const user = data.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        const nuevoToken = crearToken(user);
        setToken(nuevoToken);
        alert("✅ Token generado correctamente");
      } else {
        alert("❌ Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      <h2>Crear Token</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Crear Token</button>

      {token && (
        <div className="token-box">
          <h3>Tu Token:</h3>
          <textarea readOnly value={token} rows="4" cols="50" />
        </div>
      )}
    </div>
  );
}

export default Login;
