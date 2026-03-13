    import { useEffect, useState } from 'react';

    function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        // Hacemos la petición al backend
        fetch('http://localhost:5000/api/usuarios')
        .then(res => res.json())
        .then(data => setUsuarios(data))
        .catch(err => console.error("Error:", err));
    }, []);

    return (
        <div>
        <h2>Lista de Usuarios (desde MySQL)</h2>
        <ul>
            {usuarios.map(usuario => (
            // Asumiendo que tu tabla tiene una columna 'id' y 'nombre'
            <li key={usuario.id}>{usuario.nombre}</li>
            ))}
        </ul>
        </div>
    );
    }

    export default ListaUsuarios;