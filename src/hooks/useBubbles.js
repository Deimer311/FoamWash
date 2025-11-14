import { useEffect } from 'react';

/**
 * Custom Hook para crear la animación de burbujas flotantes en un contenedor.
 * La lógica está refactorizada directamente de tu index.js original.
 */
const useBubbles = (containerSelector = '.container') => {
    useEffect(() => {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const createBubble = () => {
            const bubble = document.createElement('div');
            
            // Lógica de estilos y propiedades replicada de tu JS original:
            const size = Math.random() * 20 + 5;
            const duration = Math.random() * 8 + 7; // 7s-15s
            const delay = Math.random() * 5; // 0s-5s

            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.position = 'absolute';
            bubble.style.borderRadius = '50%';
            bubble.style.background = 'rgba(255, 255, 255, 0.3)';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.bottom = '-50px';
            bubble.style.pointerEvents = 'none';
            bubble.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            bubble.style.zIndex = '100'; 
            
            // Aplicar la animación de subida (transform) con un delay para que la transición funcione
            bubble.style.transition = `transform ${duration}s linear ${delay}s`;
            
            // Pequeño timeout para asegurar que el DOM ha cargado la burbuja antes de iniciar la animación
            setTimeout(() => {
                bubble.style.transform = `translateY(-110vh)`;
                
                // Limpieza: eliminar la burbuja una vez que haya terminado de subir
                setTimeout(() => {
                    bubble.remove();
                }, duration * 1000 + (delay * 1000));
            }, 50);

            container.appendChild(bubble);
        };

        // Generar burbujas cada 300ms (replicando la frecuencia del original)
        const creationInterval = setInterval(createBubble, 300);

        // Función de limpieza de useEffect (se ejecuta al desmontar el componente)
        return () => {
            clearInterval(creationInterval); // Detener la creación de burbujas
            // Opcional: limpiar burbujas existentes
            // document.querySelectorAll(containerSelector + ' > div').forEach(el => el.remove()); 
        };
    }, [containerSelector]); // Dependencia del selector por si cambia
};

export default useBubbles;