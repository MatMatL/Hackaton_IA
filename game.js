// Configuration du canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Chargement de l'image de fond
const backgroundImage = new Image();
backgroundImage.src = 'images/map.png';

// Fonction pour redimensionner le canvas en plein écran
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Appeler la fonction de redimensionnement au chargement et lors du redimensionnement de la fenêtre
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Configuration du joueur
const player = {
    x: 0,
    y: 0,
    size: 30,
    speed: 5,
    color: '#4CAF50'
};

// Configuration des déchets
const trash = {
    items: [],
    spawnInterval: 2000, // Nouveau déchet toutes les 2 secondes
    size: 20,
    colors: ['#FF0000', '#0000FF', '#FFFF00', '#800080'], // Différentes couleurs pour les déchets
    collectRange: 50 // Distance maximale pour collecter un déchet
};

// Score
let score = 0;
const scoreElement = document.getElementById('score');

// Gestion des touches
const keys = {
    z: false,
    q: false,
    s: false,
    d: false,
    e: false
};

// Écouteurs d'événements pour les touches
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

// Fonction pour créer un nouveau déchet
function createTrash() {
    const x = Math.random() * (canvas.width - trash.size);
    const y = Math.random() * (canvas.height - trash.size);
    const color = trash.colors[Math.floor(Math.random() * trash.colors.length)];
    
    trash.items.push({ x, y, color });
}

// Fonction pour vérifier la distance entre le joueur et un déchet
function checkDistance(player, trash) {
    const dx = player.x - trash.x;
    const dy = player.y - trash.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Fonction pour mettre à jour la position du joueur
function updatePlayer() {
    if (keys.z && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.q && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;
}

// Fonction pour dessiner le joueur
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Fonction pour dessiner les déchets
function drawTrash() {
    trash.items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, trash.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessiner un indicateur si le déchet est à portée
        const distance = checkDistance(player, item);
        if (distance < trash.collectRange) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(item.x, item.y, trash.size, 0, Math.PI * 2);
            ctx.stroke();
            
            // Afficher "Appuyez sur E"
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Appuyez sur E', item.x, item.y - trash.size - 5);
        }
    });
}

// Fonction pour collecter les déchets
function collectTrash() {
    if (keys.e) {
        trash.items = trash.items.filter(item => {
            const distance = checkDistance(player, item);
            if (distance < trash.collectRange) {
                score++;
                scoreElement.textContent = score;
                return false;
            }
            return true;
        });
    }
}

// Fonction principale du jeu
function gameLoop() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'image de fond
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Mettre à jour et dessiner le joueur
    updatePlayer();
    drawPlayer();

    // Collecter les déchets si E est pressé
    collectTrash();

    // Dessiner les déchets
    drawTrash();

    // Continuer la boucle de jeu
    requestAnimationFrame(gameLoop);
}

// Démarrer le jeu une fois que l'image de fond est chargée
backgroundImage.onload = () => {
    // Positionner le joueur au centre de l'écran
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Démarrer le jeu
    setInterval(createTrash, trash.spawnInterval);
    gameLoop();
}; 