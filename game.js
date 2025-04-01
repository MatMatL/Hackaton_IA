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

// Configuration des particules
const particles = {
    items: [],
    createParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        const size = 5 + Math.random() * 5;
        
        this.items.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life: 1, // Durée de vie en secondes
            color: `hsl(${Math.random() * 360}, 100%, 50%)` // Couleur aléatoire
        });
    }
};

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

// Fonction pour vérifier la distance entre le joueur et un déchet
function checkDistance(player, trash) {
    const dx = player.x - trash.x;
    const dy = player.y - trash.y;
    return Math.sqrt(dx * dx + dy * dy);
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

            // Vérifier si le joueur est à portée
            const distance = checkDistance(player, item);
            if (distance < trash.collectRange) {
                // Dessiner le cercle d'indication
                ctx.save();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(item.x, item.y, trash.size, 0, Math.PI * 2);
                ctx.stroke();
                
                // Afficher le texte
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Appuyez sur E', item.x, item.y - trash.size - 5);
                ctx.restore();
            }
        }
    });
}

// Fonction pour mettre à jour les particules
function updateParticles() {
    particles.items = particles.items.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02; // Réduire la durée de vie
        return particle.life > 0;
    });
}

// Fonction pour dessiner les particules
function drawParticles() {
    particles.items.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Configuration des messages
const messages = {
    current: null,
    displayTime: 0,
    duration: 5000,
    isRequesting: false,
    serverAvailable: false,
    // Fonction pour obtenir un message selon le type de déchet
    getMessage(wasteItem) {
        // Messages par défaut selon le type de déchet
        const defaultMessages = {
            banana: [
                "Le gaspillage alimentaire représente environ un tiers de la production mondiale de nourriture, soit 1,3 milliard de tonnes par an. Chaque fruit que nous sauvons contribue à préserver les ressources naturelles et à limiter l'impact environnemental de notre consommation.",
                "Une seule banane jetée représente un gaspillage de 160 litres d'eau, soit l'équivalent d'une douche de 10 minutes. En jetant moins, nous réduisons aussi notre empreinte carbone et protégeons nos précieuses ressources.",
                "Le gaspillage alimentaire est responsable de près de 8% des émissions mondiales de gaz à effet de serre, un chiffre alarmant qui pourrait être réduit grâce à des gestes simples comme la réduction des déchets.",
                "Chaque année, en France, environ 10 millions de tonnes de nourriture sont jetées, ce qui représente une perte colossale en énergie, en eau et en main-d'œuvre. Adopter des habitudes anti-gaspillage est essentiel pour l'environnement.",
                "Les fruits trop mûrs ou abîmés peuvent être transformés en smoothies, compotes ou pâtisseries, évitant ainsi un gaspillage inutile. Il suffit d'un peu de créativité pour prolonger leur utilité !",
                "Saviez-vous que 45% des fruits et légumes produits dans le monde ne sont jamais consommés ? En consommant de manière plus responsable, nous pouvons réduire cette énorme perte alimentaire.",
                "Jeter une banane, ce n'est pas seulement gaspiller un fruit, c'est aussi gaspiller toute l'énergie nécessaire à sa culture, son transport et sa commercialisation. Préservons notre planète en limitant nos déchets !"
            ],
            apple: [
                "Une pomme jetée représente un gaspillage de 70 litres d'eau, une quantité précieuse dans un monde où la pénurie d'eau devient un problème croissant. Chaque petit geste compte pour préserver cette ressource vitale.",
                "Le gaspillage de fruits contribue directement à la déforestation, car produire toujours plus signifie abattre davantage d'arbres pour l'agriculture. Manger plutôt que jeter permet de préserver nos forêts.",
                "Le compostage des pommes et autres fruits permet de réduire les déchets organiques de 30% et de créer un engrais naturel, idéal pour nourrir les plantes sans produits chimiques.",
                "Les pommes sont riches en nutriments essentiels. Si elles commencent à se flétrir, elles peuvent être utilisées pour des compotes, des jus ou encore des gâteaux, évitant ainsi le gaspillage.",
                "Chaque année, des tonnes de fruits finissent dans les poubelles alors qu'ils sont encore comestibles. Une pomme légèrement abîmée peut être coupée et consommée sans problème.",
                "En France, près de 20 kg de nourriture par personne sont gaspillés chaque année, dont 7 kg encore emballés. Réduire ce gaspillage permettrait d'économiser de précieuses ressources naturelles.",
                "Les fruits invendus en supermarché sont souvent jetés, alors qu'ils pourraient être redistribués à des associations. Favoriser les circuits courts et le vrac réduit également ces pertes inutiles."
            ],
            apple2: [
                "Le gaspillage alimentaire est un facteur majeur du réchauffement climatique, car la décomposition des aliments en décharge produit du méthane, un gaz 25 fois plus nocif que le CO2.",
                "Chaque fruit que nous jetons a nécessité des ressources précieuses pour être produit : de l'eau, de l'énergie et du transport. Réduire le gaspillage, c'est préserver notre planète.",
                "Les fruits jetés en décharge peuvent être compostés et transformés en engrais naturels. Une alternative simple et écologique pour enrichir les sols et réduire notre empreinte carbone.",
                "En moyenne, un fruit met plusieurs mois à pousser, mais il peut être gaspillé en seulement quelques secondes. Chaque geste compte pour préserver ces efforts agricoles.",
                "Les déchets alimentaires jetés augmentent la production de gaz à effet de serre et accentuent la crise climatique. Adoptons des gestes simples pour limiter ce gaspillage.",
                "Des initiatives existent pour récupérer les fruits invendus ou abîmés et les redistribuer. S'informer sur ces solutions permet de lutter activement contre le gaspillage alimentaire.",
                "En France, 20% des fruits et légumes sont jetés avant même d'être consommés. Mieux organiser nos courses et consommer des fruits légèrement abîmés peut faire une grande différence."
            ],
            apple3: [
                "Chaque fruit gaspillé représente non seulement une perte alimentaire, mais aussi un gaspillage en eau, en engrais et en main-d'œuvre. Manger mieux, c'est aussi respecter ces ressources.",
                "Le transport des fruits représente environ 15% des émissions de CO2 du secteur alimentaire. Privilégier des produits locaux et de saison permet de réduire notre empreinte carbone.",
                "Acheter local et de saison diminue l'impact environnemental de près de 40%. Moins de transport signifie moins de pollution et une meilleure préservation de notre planète.",
                "Les circuits courts favorisent une agriculture durable et soutiennent les petits producteurs. En choisissant des fruits locaux, nous participons à une économie plus responsable.",
                "Une grande partie des fruits importés provient de l'agriculture intensive, qui appauvrit les sols et détruit les habitats naturels. Consommer responsable, c'est préserver la biodiversité.",
                "Les fruits trop mûrs peuvent être transformés en jus ou en confitures, évitant ainsi leur gaspillage. Une solution simple pour profiter pleinement de chaque aliment.",
                "Limiter le gaspillage alimentaire, c'est aussi réduire nos déchets ménagers et contribuer à une planète plus propre et plus saine pour tous."
            ],
            water_bottle: [
                "Une bouteille en plastique met en moyenne 400 ans à se dégrader dans la nature. Pendant ce temps, elle libère des microplastiques qui polluent nos sols, nos rivières et même nos organismes.",
                "Chaque année, près de 8 millions de tonnes de plastique finissent dans les océans, mettant en danger la faune marine. Tortues, oiseaux et poissons confondent parfois les déchets plastiques avec de la nourriture.",
                "Le recyclage d'une seule bouteille permet d'économiser l'énergie nécessaire pour alimenter une ampoule pendant trois heures. Recycler, c'est donc aussi économiser de l'énergie !",
                "En moyenne, un être humain ingère l'équivalent d'une carte de crédit en plastique chaque semaine à cause de la pollution environnementale. Réduire notre consommation de plastique est un enjeu majeur pour la santé.",
                "Seules 9% des bouteilles plastiques sont recyclées dans le monde. Le reste finit dans les décharges ou dans la nature, augmentant la pollution de manière irréversible.",
                "L'eau en bouteille coûte environ 300 fois plus cher que l'eau du robinet, sans être nécessairement plus pure. Adopter une gourde réutilisable permet de réduire la production de plastique tout en réalisant des économies.",
                "Le plastique n'est pas biodégradable, il se fragmente en microparticules qui contaminent les chaînes alimentaires. Chaque bouteille recyclée ou évitée est une victoire pour la nature."
            ],
            milk_bottle: [
                "Recycler le verre permet d'économiser 30% d'énergie par rapport à la fabrication de verre neuf. Un petit geste, un grand impact !",
                "Contrairement au plastique, le verre peut être recyclé à l'infini sans perdre en qualité. Chaque bouteille collectée est une ressource précieuse pour éviter le gaspillage de matières premières.",
                "Recycler une bouteille en verre réduit de 20% les émissions de CO2 générées par la production d'un nouvel emballage. Merci pour votre action en faveur de l'environnement !",
                "Une bouteille en verre jetée dans la nature met plus de 4 000 ans à se décomposer. En la recyclant, nous préservons nos paysages et notre biodiversité.",
                "Le recyclage d'une seule bouteille en verre permet de produire de nouveaux contenants sans avoir à extraire de nouvelles ressources naturelles comme le sable, dont l'exploitation massive menace nos écosystèmes."
            ],
            papercraft_bag: [
                "Chaque année, environ 100 000 mammifères et un million d'oiseaux meurent à cause de la pollution plastique. Merci de protéger la faune en ramassant ce sac !",
                "Un sac plastique met entre 100 et 400 ans à se dégrader, tout en libérant des microplastiques nocifs pour l'environnement et la santé.",
                "En France, environ 5 milliards de sacs plastiques sont distribués chaque année. Réduire leur utilisation et privilégier des alternatives réutilisables est essentiel pour préserver notre planète.",
                "Un sac plastique perdu en mer peut parcourir des milliers de kilomètres et menacer des espèces animales sur toute la planète.",
                "Recycler un sac plastique permet d'économiser environ 0,8 litre de pétrole. Chaque geste compte pour limiter notre dépendance aux énergies fossiles !"
            ],
            papercraft_bag2: [
                "Chaque année, environ 100 000 mammifères et un million d'oiseaux meurent à cause de la pollution plastique. Merci de protéger la faune en ramassant ce sac !",
                "Un sac plastique met entre 100 et 400 ans à se dégrader, tout en libérant des microplastiques nocifs pour l'environnement et la santé.",
                "En France, environ 5 milliards de sacs plastiques sont distribués chaque année. Réduire leur utilisation et privilégier des alternatives réutilisables est essentiel pour préserver notre planète.",
                "Un sac plastique perdu en mer peut parcourir des milliers de kilomètres et menacer des espèces animales sur toute la planète.",
                "Recycler un sac plastique permet d'économiser environ 0,8 litre de pétrole. Chaque geste compte pour limiter notre dépendance aux énergies fossiles !"
            ],
            tomato: [
                "Le gaspillage alimentaire représente un problème majeur pour l'environnement. Chaque tomate sauvée contribue à limiter le réchauffement climatique !",
                "Une tomate nécessite environ 13 litres d'eau pour pousser. Éviter de les jeter, c'est économiser une ressource précieuse !",
                "Les fruits et légumes gâtés peuvent être transformés en soupe, sauce ou compost. Donnons-leur une seconde vie !",
                "Le compostage des tomates permet de créer un engrais naturel qui enrichit la terre et réduit le besoin en fertilisants chimiques.",
                "La culture des tomates en serres chauffées a un impact écologique important. Privilégier les tomates de saison et locales réduit notre empreinte carbone."
            ],
            orange: [
                "Les agrumes jetés en décharge se décomposent et produisent du méthane, un gaz à effet de serre 25 fois plus puissant que le CO2.",
                "Une orange jetée, c'est environ 50 litres d'eau gaspillés. Préservons cette ressource en évitant le gaspillage alimentaire.",
                "Les zestes d'orange peuvent être utilisés pour fabriquer des produits ménagers naturels, comme des nettoyants écologiques ou des bougies parfumées.",
                "Plutôt que de jeter une orange trop mûre, on peut en faire du jus, de la confiture ou même la congeler pour plus tard !",
                "Chaque année, des tonnes de fruits sont perdues faute de consommation. Sensibiliser au gaspillage alimentaire permet d'agir pour la planète et pour la solidarité."
            ],
            avocado: [
                "Un seul avocat nécessite environ 1 000 litres d'eau pour pousser, soit l'équivalent de 10 douches. Réduire le gaspillage de ce fruit, c'est économiser une ressource précieuse.",
                "La culture intensive des avocats contribue à la déforestation et à l'assèchement des sols dans plusieurs régions du monde. Privilégier des alternatives locales est une solution durable.",
                "Le transport des avocats, souvent importés de pays lointains, génère une quantité importante de CO2. Acheter local et de saison permet de limiter cet impact environnemental.",
                "Les avocats trop mûrs peuvent être utilisés dans des recettes comme le guacamole, les smoothies ou même en masque capillaire ! Rien ne se perd, tout se transforme.",
                "En soutenant l'agriculture raisonnée et les circuits courts, nous favorisons une consommation plus respectueuse de l'environnement et des producteurs locaux."
            ]
        };
        
        // Si le type de déchet existe, choisir un message aléatoire parmi les variantes
        if (defaultMessages[wasteItem]) {
            const messages = defaultMessages[wasteItem];
            return messages[Math.floor(Math.random() * messages.length)];
        }
        
        // Message par défaut si le type de déchet n'est pas reconnu
        return "Merci d'avoir ramassé ce déchet ! Chaque petit geste compte pour notre planète.";
    }
};

// Fonction pour collecter les déchets
function collectTrash() {
    if (keys.e) {
        for (let i = trash.items.length - 1; i >= 0; i--) {
            const item = trash.items[i];
            const distance = checkDistance(player, item);
            if (distance < trash.collectRange) {
                score++;
                scoreElement.textContent = score;
                
                // Créer des particules
                for (let i = 0; i < 10; i++) {
                    particles.createParticle(item.x, item.y);
                }
                
                // Supprimer le déchet
                trash.items.splice(i, 1);
                
                // Afficher le message de sensibilisation
                const message = messages.getMessage(item.imageKey);
                if (message) {
                    messages.current = message;
                    messages.displayTime = Date.now();
                }
            }
        }
    }
}

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

    // Mettre à jour et dessiner les particules
    updateParticles();
    drawParticles();

    // Dessiner les déchets
    drawTrash();

    // Afficher le message de sensibilisation si présent
    if (messages.current && Date.now() - messages.displayTime < messages.duration) {
        const timeLeft = messages.duration - (Date.now() - messages.displayTime);
        const alpha = Math.min(1, timeLeft / 1000); // Fade out sur la dernière seconde
        
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
        ctx.fillRect(10, canvas.height - 100, canvas.width - 20, 80);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(messages.current, canvas.width / 2, canvas.height - 60);
        ctx.restore();
    } else if (messages.current) {
        messages.current = null;
    }

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