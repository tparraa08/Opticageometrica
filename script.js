// Función para mostrar/ocultar contenido
function showContent(contentId) {
    // Ocultar todas las ventanas de contenido
    const contentWindows = document.querySelectorAll('.content-window');
    contentWindows.forEach(window => {
        window.classList.remove('active-content');
    });
    
    // Mostrar la ventana seleccionada
    if (contentId !== 'none') {
        const selectedContent = document.getElementById(contentId);
        selectedContent.classList.add('active-content');
        
        // Desplazar suavemente hacia el contenido
        selectedContent.scrollIntoView({ behavior: 'smooth' });
        
        // Si es el juego de palabras, configurarlo
        if (contentId === 'juego-palabras') {
            setTimeout(setupWordGame, 100);
        }
        // Si es el juego de plataformas, resetearlo
        else if (contentId === 'juego-plataformas') {
            resetPlatformGame();
        }
    } else {
        // Desplazar hacia las tarjetas de temas si se hace clic en "Volver"
        document.querySelector('.topics-grid').scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para verificar respuestas
function checkAnswer(button, questionId, result) {
    const feedbackElement = document.getElementById(`feedback-${questionId}`);
    
    // Deshabilitar todos los botones de esta pregunta
    const buttons = button.parentElement.querySelectorAll('.quiz-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
    });
    
    if (result === 'correct') {
        button.style.backgroundColor = '#4caf50';
        feedbackElement.textContent = '¡Correcto! Respuesta acertada.';
        feedbackElement.style.color = '#4caf50';
        feedbackElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    } else {
        button.style.backgroundColor = '#f44336';
        feedbackElement.textContent = 'Incorrecto. Intenta nuevamente.';
        feedbackElement.style.color = '#f44336';
        feedbackElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        
        // Encontrar la respuesta correcta y resaltarla
        const correctButton = Array.from(buttons).find(btn => 
            btn.getAttribute('onclick').includes("'correct'")
        );
        if (correctButton) {
            correctButton.style.backgroundColor = '#4caf50';
        }
    }
}

// Variables para el juego de palabras
let selectedWords = {};
let wordScore = 0;

// Función para el juego de palabras
function setupWordGame() {
    const wordOptions = document.querySelectorAll('.word-option');
    const wordDrops = document.querySelectorAll('.word-drop');
    
    // Resetear el juego
    resetWordGame();
    
    // Configurar eventos para las opciones de palabras
    wordOptions.forEach(option => {
        option.addEventListener('click', function() {
            const wordValue = this.getAttribute('data-value');
            const sentenceId = this.closest('.sentence').id;
            
            // Guardar la selección
            selectedWords[sentenceId] = wordValue;
            
            // Actualizar la visualización
            const wordDrop = this.closest('.sentence').querySelector('.word-drop');
            wordDrop.textContent = wordValue;
            wordDrop.classList.add('filled');
            
            // Marcar la opción como usada
            this.classList.add('used');
        });
    });
    
    // Configurar eventos para los espacios en blanco (para permitir cambiar la selección)
    wordDrops.forEach(drop => {
        drop.addEventListener('click', function() {
            const sentenceId = this.closest('.sentence').id;
            const selectedWord = selectedWords[sentenceId];
            
            if (selectedWord) {
                // Encontrar la opción seleccionada y restaurarla
                const options = this.closest('.sentence').querySelectorAll('.word-option');
                options.forEach(option => {
                    if (option.getAttribute('data-value') === selectedWord) {
                        option.classList.remove('used');
                    }
                });
                
                // Limpiar la selección
                this.textContent = '______';
                this.classList.remove('filled');
                delete selectedWords[sentenceId];
            }
        });
    });
}

// Función para comprobar las respuestas del juego de palabras
function checkWordAnswers() {
    const wordDrops = document.querySelectorAll('.word-drop');
    let correctAnswers = 0;
    
    wordDrops.forEach(drop => {
        const correctWord = drop.getAttribute('data-correct');
        const sentenceId = drop.closest('.sentence').id;
        const selectedWord = selectedWords[sentenceId];
        
        if (selectedWord === correctWord) {
            drop.style.color = '#4caf50';
            correctAnswers++;
        } else if (selectedWord) {
            drop.style.color = '#f44336';
        }
    });
    
    // Actualizar puntuación
    wordScore = correctAnswers;
    document.getElementById('word-score').textContent = wordScore;
    
    // Mostrar retroalimentación
    const feedbackElement = document.getElementById('word-feedback');
    if (correctAnswers === 3) {
        feedbackElement.textContent = '¡Perfecto! Has acertado todas las palabras.';
        feedbackElement.className = 'game-feedback correct';
    } else if (correctAnswers > 0) {
        feedbackElement.textContent = `¡Bien! Has acertado ${correctAnswers} de 3 palabras.`;
        feedbackElement.className = 'game-feedback';
    } else {
        feedbackElement.textContent = 'Intenta nuevamente. Revisa los conceptos de óptica.';
        feedbackElement.className = 'game-feedback incorrect';
    }
}

// Función para reiniciar el juego de palabras
function resetWordGame() {
    const wordOptions = document.querySelectorAll('.word-option');
    const wordDrops = document.querySelectorAll('.word-drop');
    const feedbackElement = document.getElementById('word-feedback');
    
    // Restablecer opciones de palabras
    wordOptions.forEach(option => {
        option.classList.remove('used');
    });
    
    // Restablecer espacios en blanco
    wordDrops.forEach(drop => {
        drop.textContent = '______';
        drop.classList.remove('filled');
        drop.style.color = '';
    });
    
    // Restablecer puntuación y selecciones
    selectedWords = {};
    wordScore = 0;
    document.getElementById('word-score').textContent = '0';
    
    // Limpiar retroalimentación
    feedbackElement.textContent = '';
    feedbackElement.className = 'game-feedback';
}

// Variables para el juego de plataformas (ARREGLADAS)
let gameRunning = false;
let playerX = 50;
let playerY = 300;
let playerWidth = 30;
let playerHeight = 50;
let playerVelocityX = 0;
let playerVelocityY = 0;
let gravity = 0.2;
let isJumping = false;
let platforms = [];
let chest = { x: 700, y: 150, width: 40, height: 40, opened: false };
let keys = {};

// Inicializar el juego de plataformas
function initPlatformGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Crear plataformas
    platforms = [
        { x: 0, y: 350, width: 200, height: 20 },
        { x: 250, y: 320, width: 100, height: 20 },
        { x: 400, y: 290, width: 100, height: 20 },
        { x: 550, y: 260, width: 100, height: 20 },
        { x: 700, y: 230, width: 100, height: 20 }
    ];
    
    // Configurar eventos de teclado
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    // Función de juego principal
    function gameLoop() {
        if (!gameRunning) return;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar fondo
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar plataformas
        ctx.fillStyle = '#ff1801';
        platforms.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Dibujar cofre
        ctx.fillStyle = chest.opened ? '#ffcc00' : '#ff1801';
        ctx.fillRect(chest.x, chest.y, chest.width, chest.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(chest.x + 10, chest.y + 10, 20, 20);
        
        // Dibujar jugador (científico)
        ctx.fillStyle = '#2a3f6eff';
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
        
        // Dibujar cabeza
        ctx.fillStyle = '#ffb6c1';
        ctx.beginPath();
        ctx.arc(playerX + playerWidth/2, playerY - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Aplicar gravedad
        playerVelocityY += gravity;
        
        // Movimiento horizontal 
        if (keys['ArrowLeft']) {
            playerVelocityX = -3;
        } else if (keys['ArrowRight']) {
            playerVelocityX = 3;
        } else {
            playerVelocityX *= 0.8;
        }
        
        // Salto 
        if (keys[' '] && !isJumping) {
            playerVelocityY = -5;
            isJumping = true;
        }
        
        // Actualizar posición
        playerX += playerVelocityX;
        playerY += playerVelocityY;
        
        // Limites de pantalla
        if (playerX < 0) playerX = 0;
        if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
        if (playerY + playerHeight > canvas.height) {
            playerY = canvas.height - playerHeight;
            playerVelocityY = 0;
            isJumping = false;
        }
        
        // Colisión con plataformas
        platforms.forEach(platform => {
            if (playerX + playerWidth > platform.x && 
                playerX < platform.x + platform.width &&
                playerY + playerHeight > platform.y &&
                playerY + playerHeight < platform.y + platform.height + playerVelocityY) {
                playerY = platform.y - playerHeight;
                playerVelocityY = 0;
                isJumping = false;
            }
        });
        
        // Colisión con cofre
        if (playerX + playerWidth > chest.x && 
            playerX < chest.x + chest.width &&
            playerY + playerHeight > chest.y &&
            playerY < chest.y + chest.height) {
            if (!chest.opened) {
                chest.opened = true;
                document.getElementById('chest-question').style.display = 'block';
            }
        }
        
        // Continuar el bucle
        requestAnimationFrame(gameLoop);
    }
    
    // Iniciar el bucle del juego
    gameLoop();
}

// Iniciar juego de plataformas
function startGame() {
    gameRunning = true;
    initPlatformGame();
}

// Reiniciar juego de plataformas 
function resetPlatformGame() {
    playerX = 50;
    playerY = 300;
    playerVelocityX = 0;
    playerVelocityY = 0;
    isJumping = false;
    chest.opened = false;
    chest.y = 150; // ARREGLADO: Resetear posición del cofre
    document.getElementById('chest-question').style.display = 'none';
    document.getElementById('chest-feedback').textContent = '';
    
    // Reiniciar botones de pregunta
    const buttons = document.querySelectorAll('#chest-question .quiz-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = '#333';
    });
    
    if (!gameRunning) {
        startGame();
    }
}

// Verificar respuesta del cofre
function checkChestAnswer(button, answer) {
    const feedbackElement = document.getElementById('chest-feedback');
    const buttons = button.parentElement.querySelectorAll('.quiz-btn');
    
    // Deshabilitar todos los botones
    buttons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Respuesta correcta: disminución de la velocidad de la luz
    if (answer === 'a') {
        button.style.backgroundColor = '#4caf50';
        feedbackElement.textContent = '¡Correcto! Se debe a la disminución de la velocidad de la luz.';
        feedbackElement.style.color = '#4caf50';
        feedbackElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    } else {
        button.style.backgroundColor = '#f44336';
        feedbackElement.textContent = 'Incorrecto. La respuesta correcta es: disminución de la velocidad de la luz..';
        feedbackElement.style.color = '#f44336';
        feedbackElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        
        // Resaltar respuesta correcta
        buttons[0].style.backgroundColor = '#4caf50';
    }
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que solo la introducción esté visible al cargar
    showContent('intro');
});