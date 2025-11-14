// ==================== ANIMACIONES DE BURBUJAS FLOTANTES ====================
        
        /**
         * Función que crea burbujas que suben desde la parte inferior de la pantalla
         * Las burbujas tienen tamaños, posiciones y velocidades aleatorias
         */
        function createBubbles() {
            const container = document.querySelector('.container'); // Obtener el contenedor principal
            const bubble = document.createElement('div'); // Crear un nuevo elemento div para la burbuja
            
            const size = Math.random() * 20 + 5; // Generar tamaño aleatorio entre 5 y 25 píxeles
            bubble.style.width = size + 'px'; // Establecer ancho de la burbuja
            bubble.style.height = size + 'px'; // Establecer alto de la burbuja (igual al ancho para que sea circular)
            bubble.style.position = 'absolute'; // Posición absoluta para poder moverla libremente
            bubble.style.borderRadius = '50%'; // Hacer la burbuja completamente circular
            bubble.style.background = 'rgba(255, 255, 255, 0.3)'; // Color blanco semi-transparente
            bubble.style.left = Math.random() * 100 + '%'; // Posición horizontal aleatoria (0% - 100%)
            bubble.style.bottom = '-50px'; // Iniciar desde debajo de la pantalla (fuera de vista)
            bubble.style.pointerEvents = 'none'; // No interferir con eventos del mouse
            bubble.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)'; // Sombra luminosa alrededor
            bubble.style.zIndex = '1'; // Colocar detrás del contenido principal
            
            container.appendChild(bubble); // Añadir la burbuja al DOM
            
            const duration = Math.random() * 4000 + 4000; // Duración aleatoria entre 4 y 8 segundos
            const drift = (Math.random() - 0.5) * 100; // Desplazamiento horizontal aleatorio (-50 a 50 píxeles)
            
            let start = null; // Variable para almacenar el timestamp de inicio
            
            /**
             * Función de animación que se ejecuta en cada frame
             * @param {number} timestamp - Timestamp actual del frame
             */
            function animate(timestamp) {
                if (!start) start = timestamp; // Guardar el timestamp de inicio en el primer frame
                const progress = timestamp - start; // Calcular cuánto tiempo ha pasado
                const percentage = progress / duration; // Convertir a porcentaje de completado (0 a 1)
                
                const yPos = -50 + (window.innerHeight + 100) * percentage; // Calcular posición Y (sube)
                const xDrift = drift * percentage; // Calcular desplazamiento horizontal gradual
                
                // Aplicar transformaciones para mover la burbuja
                bubble.style.transform = `translate(${xDrift}px, ${-yPos}px)`;
                // Variar opacidad para efecto de parpadeando
                bubble.style.opacity = 0.3 + Math.sin(progress / 200) * 0.2;
                
                // Si la animación no ha terminado, continuar en el siguiente frame
                if (percentage < 1) {
                    requestAnimationFrame(animate);
                } else {
                    bubble.remove(); // Eliminar la burbuja cuando llegue arriba
                }
            }
            
            requestAnimationFrame(animate); // Iniciar la animación
        }
        
        // Crear una nueva burbuja cada 300 milisegundos
        setInterval(createBubbles, 300);
        
        // ==================== PARTÍCULAS DE ESPUMA ====================
        
        /**
         * Función que crea pequeñas partículas de espuma flotantes
         * Estas partículas aparecen aleatoriamente y se desvanecen
         */
        function createFoamParticles() {
            const container = document.querySelector('.container'); // Obtener contenedor
            
            // Crear entre 3 y 8 partículas en cada llamada
            for (let i = 0; i < Math.random() * 5 + 3; i++) {
                const particle = document.createElement('div'); // Crear elemento de partícula
                
                const size = Math.random() * 4 + 2; // Tamaño pequeño (2 a 6 píxeles)
                particle.style.width = size + 'px'; // Establecer ancho
                particle.style.height = size + 'px'; // Establecer alto
                particle.style.position = 'absolute'; // Posición absoluta
                particle.style.borderRadius = '50%'; // Forma circular
                particle.style.background = 'white'; // Color blanco sólido
                particle.style.left = Math.random() * 100 + '%'; // Posición X aleatoria
                particle.style.top = Math.random() * 100 + '%'; // Posición Y aleatoria
                particle.style.pointerEvents = 'none'; // No interferir con eventos
                particle.style.opacity = Math.random() * 0.5 + 0.3; // Opacidad aleatoria (0.3 - 0.8)
                particle.style.zIndex = '2'; // Por encima de burbujas
                
                container.appendChild(particle); // Añadir al DOM
                
                const lifetime = Math.random() * 2000 + 1000; // Vida útil entre 1 y 3 segundos
                let startTime = null; // Timestamp de inicio
                
                /**
                 * Función de animación de partícula individual
                 * @param {number} timestamp - Timestamp del frame actual
                 */
                function animateParticle(timestamp) {
                    if (!startTime) startTime = timestamp; // Guardar inicio
                    const elapsed = timestamp - startTime; // Tiempo transcurrido
                    const progress = elapsed / lifetime; // Progreso (0 a 1)
                    
                    // Crear movimiento ondulante usando funciones seno y coseno
                    const x = Math.sin(elapsed / 200) * 20; // Movimiento horizontal
                    const y = Math.cos(elapsed / 300) * 20; // Movimiento vertical
                    particle.style.transform = `translate(${x}px, ${y}px)`; // Aplicar movimiento
                    
                    // Desvanecer progresivamente
                    particle.style.opacity = (1 - progress) * 0.5;
                    
                    // Continuar animación si no ha terminado
                    if (progress < 1) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        particle.remove(); // Eliminar partícula al terminar
                    }
                }
                
                requestAnimationFrame(animateParticle); // Iniciar animación
            }
        }
        
        // Crear partículas cada 500 milisegundos
        setInterval(createFoamParticles, 500);
        
        // ==================== EFECTO TYPEWRITER (MÁQUINA DE ESCRIBIR) ====================
        
        /**
         * Función que crea un efecto de escritura letra por letra en el subtítulo
         * Simula el efecto de una máquina de escribir antigua
         */
        function typeWriter() {
            // NOTA: El subtítulo original estaba dentro de la primera vista rotatoria.
            // Para el efecto, solo lo aplicamos al primer párrafo activo al inicio.
            const subtitle = document.querySelector('.dynamic-view.welcome-text .subtitle'); 
            if (!subtitle) return; // Salir si el elemento no existe
            
            const text = subtitle.innerHTML; // Guardar el texto original (puede incluir HTML)
            subtitle.innerHTML = ''; // Limpiar el contenido
            subtitle.style.opacity = '1'; // Asegurar que sea visible
            let index = 0; // Índice del carácter actual
            
            /**
             * Función recursiva que escribe un carácter a la vez
             */
            function type() {
                if (index < text.length) {
                    subtitle.innerHTML += text.charAt(index); // Añadir siguiente carácter
                    index++; // Incrementar índice
                    setTimeout(type, 30); // Esperar 30ms antes del siguiente carácter
                }
            }
            
            setTimeout(type, 500); // Iniciar después de medio segundo
        }
        
        // ==================== ANIMACIÓN DE APARICIÓN INICIAL ====================
        
        /**
         * Función que anima la aparición de los elementos principales al cargar la página
         * Los elementos aparecen con un efecto de fade-in y slide-up
         */
        function animateOnLoad() {
            // Array con todos los elementos principales a animar
            const elements = [
                document.querySelector('.left-section'),
                document.querySelector('.center-section'),
                document.querySelector('.right-section'),
                document.querySelector('.header')
            ];
            
            // Iterar sobre cada elemento
            elements.forEach((element, index) => {
                if (element) {
                    element.style.opacity = '0'; // Iniciar invisible
                    element.style.transform = 'translateY(30px)'; // Desplazar 30px hacia abajo
                    element.style.transition = 'all 0.8s ease'; // Transición suave de 0.8 segundos
                    
                    // Animar después de un delay escalonado (cada elemento espera 200ms más que el anterior)
                    setTimeout(() => {
                        element.style.opacity = '1'; // Hacer visible
                        element.style.transform = 'translateY(0)'; // Mover a posición original
                    }, index * 200); // Delay: 0ms, 200ms, 400ms, 600ms
                }
            });
        }
        
        // ==================== EFECTO RIPPLE (ONDA) EN BOTONES ====================
        
        /**
         * Función que añade un efecto de onda expansiva al hacer clic en botones
         * Similar al efecto Material Design
         */
        function addRippleEffect() {
            const buttons = document.querySelectorAll('button'); // Obtener todos los botones
            
            buttons.forEach(button => {
                // Añadir listener de clic a cada botón
                button.addEventListener('click', function(e) {
                    // Crear elemento de onda
                    const ripple = document.createElement('span');
                    ripple.style.position = 'absolute'; // Posición absoluta dentro del botón
                    ripple.style.borderRadius = '50%'; // Forma circular
                    ripple.style.background = 'rgba(255, 255, 255, 0.6)'; // Color blanco semi-transparente
                    ripple.style.width = '20px'; // Tamaño inicial
                    ripple.style.height = '20px'; // Tamaño inicial
                    ripple.style.pointerEvents = 'none'; // No interferir con eventos
                    
                    // Calcular posición del clic relativa al botón
                    const rect = button.getBoundingClientRect(); // Obtener dimensiones del botón
                    ripple.style.left = (e.clientX - rect.left - 10) + 'px'; // Centrar horizontalmente
                    ripple.style.top = (e.clientY - rect.top - 10) + 'px'; // Centrar verticalmente
                    
                    button.style.position = 'relative'; // Asegurar posición relativa
                    button.style.overflow = 'hidden'; // Ocultar partes de la onda fuera del botón
                    button.appendChild(ripple); // Añadir onda al botón
                    
                    // Animar expansión de la onda
                    let scale = 0; // Escala inicial
                    const interval = setInterval(() => {
                        scale += 0.1; // Incrementar escala gradualmente
                        ripple.style.transform = `scale(${scale})`; // Aplicar escala
                        ripple.style.opacity = 1 - scale / 10; // Desvanecer mientras crece
                        
                        // Detener cuando alcance tamaño máximo
                        if (scale >= 10) {
                            clearInterval(interval); // Detener intervalo
                            ripple.remove(); // Eliminar elemento de onda
                        }
                    }, 20); // Actualizar cada 20ms
                });
            });
        }
        
        // ==================== EFECTO DE BRILLO EN LOGO ====================
        
        /**
         * Función que crea un efecto de brillo que atraviesa el logo periódicamente
         * El brillo se mueve de izquierda a derecha
         */
        function addLogoShine() {
            const logo = document.querySelector('.logo'); // Obtener elemento del logo
            if (!logo) return; // Salir si no existe
            
            // Crear elemento de brillo
            const shine = document.createElement('div');
            shine.style.position = 'absolute'; // Posición absoluta dentro del logo
            shine.style.top = '0'; // Alineado arriba
            shine.style.left = '-100%'; // Iniciar fuera del logo (izquierda)
            shine.style.width = '50%'; // Ancho del brillo
            shine.style.height = '100%'; // Alto completo
            // Gradiente blanco transparente para efecto de brillo
            shine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
            shine.style.pointerEvents = 'none'; // No interferir con eventos
            shine.style.zIndex = '10'; // Por encima del texto
            
            logo.style.position = 'relative'; // Asegurar posición relativa
            logo.style.overflow = 'hidden'; // Ocultar partes del brillo fuera del logo
            logo.appendChild(shine); // Añadir brillo al logo
            
            /**
             * Función que anima el movimiento del brillo
             * Se repite cada 5 segundos
             */
            function animateShine() {
                shine.style.transition = 'none'; // Sin transición al reiniciar
                shine.style.left = '-100%'; // Reiniciar posición a la izquierda
                
                setTimeout(() => {
                    shine.style.transition = 'left 1.5s ease'; // Añadir transición suave
                    shine.style.left = '150%'; // Mover a la derecha (fuera del logo)
                }, 100); // Pequeño delay para que se note el reinicio
                
                setTimeout(animateShine, 5000); // Repetir cada 5 segundos
            }
            
            animateShine(); // Iniciar animación
        }
        
        // ==================== EFECTO DE FLOTACIÓN EN TARJETA DE RESEÑA ====================
        
        /**
         * Función que hace flotar suavemente la tarjeta de reseña
         * Usa funciones trigonométricas para movimiento natural
         */
        function floatingReviewCard() {
            const reviewCard = document.querySelector('.review-card'); // Obtener tarjeta
            if (!reviewCard) return; // Salir si no existe
            
            let angle = 0; // Ángulo inicial para cálculos trigonométricos
            
            /**
             * Función de animación continua
             */
            function float() {
                angle += 0.02; // Incrementar ángulo gradualmente
                
                // Calcular desplazamiento vertical usando función seno (movimiento suave arriba-abajo)
                const y = Math.sin(angle) * 10; // Amplitud de 10 píxeles
                // Calcular rotación sutil usando seno con frecuencia doble
                const rotation = Math.sin(angle * 2) * 2; // Rotación de ±2 grados
                
                // Aplicar transformaciones combinadas
                reviewCard.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
                
                requestAnimationFrame(float); // Continuar en siguiente frame
            }
            
            float(); // Iniciar flotación
        }
        
        // ==================== EFECTO DE PULSO EN BOTÓN DE SERVICIOS ====================
        
        /**
         * Función que crea un efecto de pulso continuo en el botón de servicios
         * El botón crece y se reduce ligeramente de forma continua
         */
        function pulseServiceButton() {
            const serviceBtn = document.querySelector('.service-btn'); // Obtener botón
            if (!serviceBtn) return; // Salir si no existe
            
            let scale = 1; // Escala inicial (tamaño normal)
            let growing = true; // Dirección del cambio (creciendo o decreciendo)
            
            /**
             * Función de animación de pulso
             */
            function pulse() {
                // Si está creciendo
                if (growing) {
                    scale += 0.001; // Incrementar escala muy gradualmente
                    if (scale >= 1.05) growing = false; // Cambiar a decrecer al alcanzar 105%
                } else {
                    scale -= 0.001; // Decrementar escala
                    if (scale <= 1) growing = true; // Cambiar a crecer al alcanzar 100%
                }
                
                // Aplicar transformación de escala
                serviceBtn.style.transform = `scale(${scale})`;
                
                requestAnimationFrame(pulse); // Continuar en siguiente frame
            }
            
            pulse(); // Iniciar pulso
        }
        
        // ==================== PARTÍCULAS QUE SIGUEN EL CURSOR ====================
        
        /**
         * Función que crea pequeñas partículas que aparecen al mover el mouse
         * Las partículas flotan hacia arriba y se desvanecen
         */
        function createCursorParticles() {
            // Listener para movimiento del mouse en todo el documento
            document.addEventListener('mousemove', function(e) {
                // Crear partícula solo aleatoriamente (20% de probabilidad en cada movimiento)
                if (Math.random() > 0.8) {
                    const particle = document.createElement('div'); // Crear elemento
                    
                    const size = Math.random() * 5 + 2; // Tamaño aleatorio (2 a 7 píxeles)
                    particle.style.width = size + 'px'; // Establecer ancho
                    particle.style.height = size + 'px'; // Establecer alto
                    particle.style.position = 'fixed'; // Posición fija respecto al viewport
                    particle.style.borderRadius = '50%'; // Forma circular
                    particle.style.background = 'rgba(91, 192, 222, 0.6)'; // Color azul claro
                    particle.style.left = e.clientX + 'px'; // Posición X del cursor
                    particle.style.top = e.clientY + 'px'; // Posición Y del cursor
                    particle.style.pointerEvents = 'none'; // No interferir con eventos
                    particle.style.zIndex = '1000'; // Por encima de todo
                    
                    document.body.appendChild(particle); // Añadir al body
                    
                    let opacity = 1; // Opacidad inicial
                    let posY = 0; // Desplazamiento vertical inicial
                    
                    /**
                     * Función de animación de partícula del cursor
                     */
                    function animateCursorParticle() {
                        opacity -= 0.02; // Reducir opacidad gradualmente
                        posY -= 2; // Mover hacia arriba 2 píxeles por frame
                        
                        particle.style.opacity = opacity; // Aplicar opacidad
                        particle.style.transform = `translateY(${posY}px)`; // Aplicar movimiento
                        
                        // Continuar si todavía es visible
                        if (opacity > 0) {
                            requestAnimationFrame(animateCursorParticle);
                        } else {
                            particle.remove(); // Eliminar cuando sea completamente transparente
                        }
                    }
                    
                    requestAnimationFrame(animateCursorParticle); // Iniciar animación
                }
            });
        }
        
        // ==================== EFECTO DE OLAS EN EL FONDO ====================
        
        /**
         * Función que crea capas de olas animadas en el fondo
         * Simula un efecto de agua con múltiples capas
         */
        function createWaves() {
            const container = document.querySelector('.container'); // Obtener contenedor
            
            // Crear 3 capas de olas con diferentes velocidades
            for (let i = 0; i < 3; i++) {
                const wave = document.createElement('div'); // Crear elemento de ola
                wave.style.position = 'absolute'; // Posición absoluta
                wave.style.bottom = '0'; // Anclar al fondo
                wave.style.left = '0'; // Anclar a la izquierda
                wave.style.width = '200%'; // Ancho doble para efecto de loop infinito
                wave.style.height = '100px'; // Alto de la ola
                // Opacidad creciente para cada capa (más visible cada vez)
                wave.style.background = `rgba(255, 255, 255, ${0.03 + i * 0.02})`;
                wave.style.borderRadius = '50%'; // Bordes redondeados
                wave.style.pointerEvents = 'none'; // No interferir con eventos
                wave.style.zIndex = '0'; // Detrás de todo el contenido
                
                container.appendChild(wave); // Añadir ola al contenedor
                
                let position = 0; // Posición horizontal inicial
                const speed = 0.2 + i * 0.1; // Velocidad diferente para cada capa
                
                /**
                 * Función de animación de ola individual
                 */
                function animateWave() {
                    position -= speed; // Mover hacia la izquierda
                    if (position <= -100) position = 0; // Reiniciar cuando salga de pantalla
                    
                    // Aplicar transformación con movimiento horizontal y escala vertical variable
                    // La escala Y varía con el tiempo para simular ondulación
                    wave.style.transform = `translateX(${position}%) scaleY(${1 + Math.sin(Date.now() / 1000 + i) * 0.3})`;
                    
                    requestAnimationFrame(animateWave); // Continuar animación
                }
                
                animateWave(); // Iniciar animación de esta ola
            }
        }
        
        // ==================== ANIMACIÓN DE AVATAR CON GRADIENTE ROTATIVO ====================
        
        /**
         * Función que anima el avatar con un efecto de brillo rotativo
         * El gradiente gira continuamente creando efecto de iluminación
         */
        function animateAvatar() {
            const avatar = document.querySelector('.avatar'); // Obtener avatar
            if (!avatar) return; // Salir si no existe
            
            let rotation = 0; // Rotación inicial del gradiente
            
            /**
             * Función de animación de rotación del gradiente
             */
            function rotate() {
                rotation += 0.5; // Incrementar rotación medio grado por frame
                
                // Aplicar gradiente lineal con ángulo rotativo
                avatar.style.background = `linear-gradient(${rotation}deg, #f5f5f5, #e0e0e0, #f5f5f5)`;
                
                requestAnimationFrame(rotate); // Continuar rotación
            }
            
            rotate(); // Iniciar rotación
        }
        
        // ==================== EFECTO DE DESTELLOS ALEATORIOS ====================
        
        /**
         * Función que crea destellos (sparkles) aleatorios en títulos importantes
         * Los destellos aparecen, giran y se desvanecen
         */
        function createSparkles() {
            // Seleccionar elementos donde aparecerán destellos
            const elements = document.querySelectorAll('.left-section h1, .reviews-title, .logo');
            
            elements.forEach(element => {
                // Crear destellos cada 3 segundos para cada elemento
                setInterval(() => {
                    const sparkle = document.createElement('span'); // Crear elemento de destello
                    sparkle.innerHTML = '✨'; // Emoji de estrella brillante
                    sparkle.style.position = 'absolute'; // Posición absoluta
                    sparkle.style.fontSize = '20px'; // Tamaño del emoji
                    sparkle.style.pointerEvents = 'none'; // No interferir con eventos
                    sparkle.style.zIndex = '100'; // Por encima del contenido
                    
                    // Obtener dimensiones del elemento padre
                    const rect = element.getBoundingClientRect();
                    // Posicionar aleatoriamente dentro del elemento
                    sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                    sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
                    sparkle.style.position = 'fixed'; // Posición fija en viewport
                    
                    document.body.appendChild(sparkle); // Añadir al body
                    
                    let opacity = 1; // Opacidad inicial
                    let scale = 0; // Escala inicial
                    
                    /**
                     * Función de animación del destello
                     */
                    function animateSparkle() {
                        opacity -= 0.02; // Reducir opacidad gradualmente
                        scale += 0.05; // Incrementar escala gradualmente
                        
                        sparkle.style.opacity = opacity; // Aplicar opacidad
                        // Aplicar escala y rotación (gira mientras crece)
                        sparkle.style.transform = `scale(${scale}) rotate(${scale * 50}deg)`;
                        
                        // Continuar si todavía es visible
                        if (opacity > 0) {
                            requestAnimationFrame(animateSparkle);
                        } else {
                            sparkle.remove(); // Eliminar cuando sea invisible
                        }
                    }
                    
                    requestAnimationFrame(animateSparkle); // Iniciar animación
                }, 3000); // Repetir cada 3 segundos
            });
        }
        
        // ==================== EFECTO MAGNÉTICO EN BOTONES ====================
        
        /**
         * Función que crea un efecto magnético en los botones
         * Los botones se mueven ligeramente hacia el cursor cuando el mouse está cerca
         */
        function magneticButtons() {
            const buttons = document.querySelectorAll('button'); // Obtener todos los botones
            
            buttons.forEach(button => {
                // Listener cuando el mouse entra en el área del botón
                button.addEventListener('mouseenter', function() {
                    button.style.transition = 'transform 0.3s ease'; // Transición suave
                });
                
                // Listener para movimiento del mouse sobre el botón
                button.addEventListener('mousemove', function(e) {
                    const rect = button.getBoundingClientRect(); // Obtener dimensiones del botón
                    // Calcular distancia del cursor al centro del botón (eje X)
                    const x = e.clientX - rect.left - rect.width / 2;
                    // Calcular distancia del cursor al centro del botón (eje Y)
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    // Mover botón hacia el cursor (20% de la distancia) y aumentar tamaño
                    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
                });
                
                // Listener cuando el mouse sale del botón
                button.addEventListener('mouseleave', function() {
                    button.style.transform = 'translate(0, 0) scale(1)'; // Restaurar posición y tamaño
                });
            });
        }
        
        // ==================== EFECTO DE ESTRELLAS EN EL FONDO ====================
        
        /**
         * Función que crea estrellas parpadeantes en el fondo
         * Simula un cielo nocturno con estrellas que brillan
         */
        function createStars() {
            const container = document.querySelector('.container'); // Obtener contenedor
            
            // Crear 50 estrellas
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div'); // Crear elemento de estrella
                
                const size = Math.random() * 3 + 1; // Tamaño aleatorio (1 a 4 píxeles)
                star.style.width = size + 'px'; // Establecer ancho
                star.style.height = size + 'px'; // Establecer alto
                star.style.position = 'absolute'; // Posición absoluta
                star.style.borderRadius = '50%'; // Forma circular
                star.style.background = 'white'; // Color blanco
                star.style.left = Math.random() * 100 + '%'; // Posición X aleatoria
                star.style.top = Math.random() * 100 + '%'; // Posición Y aleatoria
                star.style.pointerEvents = 'none'; // No interferir con eventos
                star.style.zIndex = '0'; // Detrás del contenido
                star.style.boxShadow = '0 0 3px white'; // Brillo alrededor de la estrella
                
                container.appendChild(star); // Añadir estrella al contenedor
                
                // Delay aleatorio para el parpadeo de cada estrella
                const delay = Math.random() * 3000;
                
                /**
                 * Función que anima el parpadeo de la estrella
                 */
                function twinkle() {
                    let opacity = 0; // Opacidad inicial
                    let increasing = true; // Dirección del cambio de opacidad
                    
                    /**
                     * Función de animación del parpadeo
                     */
                    function animate() {
                        if (increasing) {
                            opacity += 0.02; // Aumentar opacidad
                            if (opacity >= 1) increasing = false; // Cambiar dirección
                        } else {
                            opacity -= 0.02; // Reducir opacidad
                            if (opacity <= 0) increasing = true; // Cambiar dirección
                        }
                        
                        star.style.opacity = opacity; // Aplicar opacidad
                        requestAnimationFrame(animate); // Continuar animación
                    }
                    
                    animate(); // Iniciar animación de parpadeo
                }
                
                setTimeout(twinkle, delay); // Iniciar después del delay aleatorio
            }
        }
        
        // ==================== EFECTO DE PARTÍCULAS AL HACER CLIC ====================
        
        /**
         * Función que crea una explosión de partículas al hacer clic en cualquier parte
         * Las partículas salen en todas direcciones desde el punto de clic
         */
        function createClickExplosion() {
            document.addEventListener('click', function(e) {
                // Crear entre 8 y 15 partículas por clic
                const particleCount = Math.floor(Math.random() * 8) + 8;
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div'); // Crear partícula
                    
                    const size = Math.random() * 6 + 3; // Tamaño aleatorio (3 a 9 píxeles)
                    particle.style.width = size + 'px'; // Establecer ancho
                    particle.style.height = size + 'px'; // Establecer alto
                    particle.style.position = 'fixed'; // Posición fija
                    particle.style.borderRadius = '50%'; // Forma circular
                    particle.style.background = `hsl(${Math.random() * 60 + 180}, 70%, 70%)`; // Color azul aleatorio
                    particle.style.left = e.clientX + 'px'; // Posición X del clic
                    particle.style.top = e.clientY + 'px'; // Posición Y del clic
                    particle.style.pointerEvents = 'none'; // No interferir con eventos
                    particle.style.zIndex = '9999'; // Por encima de todo
                    
                    document.body.appendChild(particle); // Añadir al body
                    
                    // Calcular dirección aleatoria de movimiento (ángulo en radianes)
                    const angle = (Math.PI * 2 * i) / particleCount;
                    const velocity = Math.random() * 3 + 2; // Velocidad aleatoria
                    let vx = Math.cos(angle) * velocity; // Velocidad en X
                    let vy = Math.sin(angle) * velocity; // Velocidad en Y
                    let opacity = 1; // Opacidad inicial
                    
                    /**
                     * Función de animación de partícula de explosión
                     */
                    function animateExplosion() {
                        // Actualizar posición
                        const currentLeft = parseFloat(particle.style.left);
                        const currentTop = parseFloat(particle.style.top);
                        particle.style.left = (currentLeft + vx) + 'px';
                        particle.style.top = (currentTop + vy) + 'px';
                        
                        vy += 0.1; // Aplicar "gravedad" (acelerar hacia abajo)
                        opacity -= 0.02; // Reducir opacidad
                        particle.style.opacity = opacity; // Aplicar opacidad
                        
                        // Continuar si todavía es visible
                        if (opacity > 0) {
                            requestAnimationFrame(animateExplosion);
                        } else {
                            particle.remove(); // Eliminar cuando sea invisible
                        }
                    }
                    
                    requestAnimationFrame(animateExplosion); // Iniciar animación
                }
            });
        }
        
        // ==================== INICIALIZACIÓN DE TODAS LAS ANIMACIONES ====================
        
        /**
         * Event listener que espera a que el DOM esté completamente cargado
         * Luego inicializa todas las animaciones y efectos
         */
        window.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 Iniciando todas las animaciones de FoamWash...'); // Log informativo
            
            // Inicializar animaciones secuencialmente
            animateOnLoad(); // Animar aparición inicial de elementos
            setTimeout(typeWriter, 1000); // Iniciar efecto typewriter después de 1 segundo
            addRippleEffect(); // Añadir efecto ripple a todos los botones
            addLogoShine(); // Añadir brillo al logo
            floatingReviewCard(); // Iniciar flotación de tarjeta de reseña
            pulseServiceButton(); // Iniciar pulso del botón de servicios
            createCursorParticles(); // Crear partículas que siguen el cursor
            createWaves(); // Crear olas animadas en el fondo
            animateAvatar(); // Animar avatar con gradiente rotativo
            createSparkles(); // Crear destellos en títulos
            magneticButtons(); // Añadir efecto magnético a botones
            createStars(); // Crear estrellas parpadeantes
            createClickExplosion(); // Añadir explosión de partículas al hacer clic
            
            console.log('✅ Todas las animaciones iniciadas correctamente'); // Confirmación
            console.log('🚀 FoamWash está listo para usar'); // Mensaje final
        });
        
        // ==================== ANIMACIÓN DE HOVER EN TEXTO ====================
        
        /**
         * Función que añade efecto de escala al pasar el mouse sobre textos importantes
         */
        function addTextHoverEffect() {
            // Seleccionar elementos de texto importantes
            const textElements = document.querySelectorAll('.left-section h1, .reviews-title, .reviewer-name');
            
            textElements.forEach(element => {
                // Guardar escala original
                element.style.transition = 'transform 0.3s ease';
                
                // Listener para entrada del mouse
                element.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)'; // Aumentar 5%
                });
                
                // Listener para salida del mouse
                element.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)'; // Restaurar tamaño
                });
            });
        }
        
        // Inicializar efectos de hover cuando cargue el DOM
        window.addEventListener('DOMContentLoaded', addTextHoverEffect);
        
        // ==================== MENSAJE DE CONSOLA CREATIVO ====================
        
        /**
         * Mostrar mensaje de bienvenida en la consola del navegador
         */
        console.log('%c🧼 FoamWash - Lavados Gonzalez 🧼', 'color: #5BC0DE; font-size: 20px; font-weight: bold;');
        console.log('%c✨ Página web con animaciones avanzadas ✨', 'color: white; font-size: 14px;');
        console.log('%c💧 Desarrollado con HTML5, CSS3 y JavaScript puro 💧', 'color: #4a5280; font-size: 12px;');

// ==================== LÓGICA DE ROTACIÓN LOCALIZADA (Misión/Visión) ====================
// Se modifica la lógica para apuntar al nuevo contenedor dentro de la sección izquierda.

document.addEventListener('DOMContentLoaded', () => {
    // CAMBIO: Apunta al nuevo contenedor local de texto dinámico (#dynamic-text-area)
    const dynamicArea = document.getElementById('dynamic-text-area'); 
    
    // CAMBIO: Apunta a las nuevas vistas de rotación local (.dynamic-view)
    const views = document.querySelectorAll('#dynamic-text-area .dynamic-view');
    
    let currentIndex = 0;
    const intervalTime = 30000; // 30 segundos

    if (views.length === 0) return;

    /**
     * Muestra la vista en el índice especificado.
     * @param {number} index El índice de la vista a mostrar.
     */
    function showView(index) {
        // 1. Quitar la clase 'active' de todas las vistas
        views.forEach(view => {
            view.classList.remove('active');
        });

        // 2. Aplicar la clase 'active' a la vista actual
        views[index].classList.add('active');
        currentIndex = index;
    }

    /**
     * Rota a la siguiente vista.
     */
    function nextView() {
        const nextIndex = (currentIndex + 1) % views.length;
        showView(nextIndex);
    }

    // ==================== ROTACIÓN AUTOMÁTICA (Cada 30 segundos) ====================
    
    // Inicia la rotación automática
    let autoRotate = setInterval(nextView, intervalTime);

    // ==================== CAMBIO MANUAL (Al hacer click) ====================

    if (dynamicArea) {
        // Al hacer clic en el área de texto rotatorio, cambia de vista y reinicia el contador.
        dynamicArea.addEventListener('click', () => {
            // 1. Detener el temporizador
            clearInterval(autoRotate);
            
            // 2. Mover a la siguiente vista
            nextView();
            
            // 3. Reiniciar el temporizador
            autoRotate = setInterval(nextView, intervalTime);
        });
    }

    // Asegurar que la primera vista esté visible al cargar
    showView(0);
});