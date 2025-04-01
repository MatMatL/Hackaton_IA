// Configuration du canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Chargement de l'image de fond
const backgroundImage = new Image();
backgroundImage.src = 'images/map.png';

// Chargement des images du joueur
const playerImages = {
    still: new Image(),
    walk: new Image(),
    run: new Image()
};

playerImages.still.src = 'images/player/player_still.png';
playerImages.walk.src = 'images/player/player_walk.png';
playerImages.run.src = 'images/player/player_run.png';

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
    size: 60,
    speed: 1.5,
    currentSpeed: 0,
    direction: 'right',
    state: 'still',
    animationFrame: 0,
    animationSpeed: 0.1
};

// Configuration des déchets
const trash = {
    items: [],
    spawnInterval: 2000, // Nouveau déchet toutes les 2 secondes
    size: 40, // Taille augmentée pour les images
    collectRange: 70, // Distance de collecte augmentée
    images: {
        papercraft_bag: new Image(),
        papercraft_bag2: new Image(),
        avocado: new Image(),
        apple: new Image(),
        apple2: new Image(),
        apple3: new Image(),
        tomato: new Image(),
        water_bottle: new Image(),
        milk_bottle: new Image(),
        orange: new Image(),
        banana: new Image()
    }
};

// Charger les images de déchets
trash.images.papercraft_bag.src = 'images/waste/papercraft_bag.png';
trash.images.papercraft_bag2.src = 'images/waste/papercraft_bag2.png';
trash.images.avocado.src = 'images/waste/avocado.png';
trash.images.apple.src = 'images/waste/apple.png';
trash.images.apple2.src = 'images/waste/apple2.png';
trash.images.apple3.src = 'images/waste/apple3.png';
trash.images.tomato.src = 'images/waste/tomato.png';
trash.images.water_bottle.src = 'images/waste/water_bottle.png';
trash.images.milk_bottle.src = 'images/waste/milk_bottle.png';
trash.images.orange.src = 'images/waste/orange.png';
trash.images.banana.src = 'images/waste/Banana.png';

// Score
let score = 0;
const scoreElement = document.getElementById('score');

// Gestion des touches
const keys = {
    z: false,
    q: false,
    s: false,
    d: false,
    e: false,
    shift: false // Pour la course
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
    const imageKeys = Object.keys(trash.images);
    const randomImageKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
    
    trash.items.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        imageKey: randomImageKey
    });
}

// Fonction pour vérifier la distance entre le joueur et un déchet
function checkDistance(player, trash) {
    const dx = player.x - trash.x;
    const dy = player.y - trash.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Fonction pour mettre à jour la position et l'état du joueur
function updatePlayer() {
    let dx = 0;
    let dy = 0;
    
    // Calculer le mouvement
    if (keys.z) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.q) dx -= 1;
    if (keys.d) dx += 1;
    
    // Normaliser le mouvement diagonal
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
    }
    
    // Mettre à jour la direction
    if (dx > 0) player.direction = 'right';
    else if (dx < 0) player.direction = 'left';
    
    // Calculer la vitesse en fonction du mouvement et de la touche shift
    const baseSpeed = player.speed;
    const runSpeed = baseSpeed * 2;
    player.currentSpeed = Math.sqrt(dx * dx + dy * dy) * (keys.shift ? runSpeed : baseSpeed);
    
    // Mettre à jour la position
    player.x += dx * player.currentSpeed;
    player.y += dy * player.currentSpeed;
    
    // Limites de l'écran
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
    
    // Mettre à jour l'état d'animation
    if (player.currentSpeed === 0) {
        player.state = 'still';
    } else if (keys.shift) {
        player.state = 'run';
    } else {
        player.state = 'walk';
    }
    
    // Mettre à jour la frame d'animation
    player.animationFrame += player.animationSpeed;
}

// Fonction pour dessiner le joueur
function drawPlayer() {
    const image = playerImages[player.state];
    if (!image.complete) return; // Attendre que l'image soit chargée
    
    ctx.save();
    
    // Calculer les dimensions en conservant le ratio d'aspect
    const playerWidth = player.size;
    const playerHeight = (image.height / image.width) * playerWidth;
    
    // Positionner le point de rotation au centre du joueur
    ctx.translate(player.x + playerWidth/2, player.y + playerHeight/2);
    
    // Inverser horizontalement si le joueur va vers la gauche
    if (player.direction === 'left') {
        ctx.scale(-1, 1);
    }
    
    // Dessiner l'image
    ctx.drawImage(
        image,
        -playerWidth/2,
        -playerHeight/2,
        playerWidth,
        playerHeight
    );
    
    ctx.restore();
}

// Fonction pour dessiner les déchets
function drawTrash() {
    trash.items.forEach(item => {
        const image = trash.images[item.imageKey];
        if (image.complete) { // Vérifier que l'image est chargée
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.drawImage(image, -trash.size/2, -trash.size/2, trash.size, trash.size);
            ctx.restore();
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

// Démarrer le jeu une fois que toutes les images sont chargées
let loadedImages = 0;
const totalImages = 4; // fond + 3 images du joueur

function checkAllImagesLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        // Positionner le joueur au centre de l'écran
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        
        // Démarrer le jeu
        setInterval(createTrash, trash.spawnInterval);
        gameLoop();
    }
}

backgroundImage.onload = checkAllImagesLoaded;
playerImages.still.onload = checkAllImagesLoaded;
playerImages.walk.onload = checkAllImagesLoaded;
playerImages.run.onload = checkAllImagesLoaded; 