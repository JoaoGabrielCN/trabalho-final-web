var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var backgroundImage = new Image();
backgroundImage.src = "imagens/fundo.png";

var personagem = new Image();
personagem.src = "imagens/mario-sprite.png";

var enemies = [
    {
        x: 1300,
        y: 502,
        width: 32,
        height: 48,
        alive: true
    }
];

var player = {
    x: 50,
    y: 50,
    width: 32,
    height: 48,
    speed: 5,
    jumpHeight: 15,
    gravity: 1,
    jumping: false,
    velocityY: 0,
    lives: 3,
    correctAnswers: 0,
    gameOver: false,
    gameWon: false
};

var npcs = [
    {
        x: 300,
        y: 502,
        width: 32,
        height: 48,
        quiz: {
            question: "Qual é a capital do Brasil?",
            options: ["Rio de Janeiro", "Brasília", "São Paulo", "Recife"],
            correctAnswer: "Brasília"
        }
    },
    {
        x: 900,
        y: 502,
        width: 32,
        height: 48,
        quiz: {
            question: "ONDE É O CLITORIS?",
            options: ["CLITORIS É MITO", "Marte", "Terra", "Vênus"],
            correctAnswer: "CLITORIS É MITO"
        }
    },
    {
        x: 1500,
        y: 502,
        width: 32,
        height: 48,
        quiz: {
            question: "Quantos lados tem um triângulo?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "3"
        }
    },
    {
        x: 2100,
        y: 502,
        width: 32,
        height: 48,
        quiz: {
            question: "Quem escreveu 'Romeu e Julieta'?",
            options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Homer"],
            correctAnswer: "William Shakespeare"
        }
    },
    {
        x: 2700,
        y: 502,
        width: 32,
        height: 48,
        quiz: {
            question: "Qual é o maior oceano do mundo?",
            options: ["Oceano Atlântico", "Oceano Pacífico", "Oceano Índico", "Oceano Ártico"],
            correctAnswer: "Oceano Pacífico"
        }
    }
];

var dialogBox = document.getElementById('dialogBox');
var dialogText = document.getElementById('dialogText');
var optionsList = document.getElementById('optionsList');



var keys = {};

var platforms = [
    { x: -600, y: 550, width: 200000, height: 700 }, // Largura do chão aumentada
    { x: 600, y: 400, width: 200, height: 20 },
    { x: 50, y: 250, width: 200, height: 20 },
    { x: 700, y: 220, width: 100, height: 20 },
    { x: 1000, y: 350, width: 200, height: 20 },
    { x: 1200, y: 200, width: 200, height: 20 },
    { x: 1600, y: 450, width: 200, height: 20 },
    { x: 1800, y: 300, width: 200, height: 20 }
];

var camera = {
    x: 0,
    y: 0
};

function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

function update() {
    // Impede a atualização se o jogo tiver terminado
    if (player.gameOver || player.gameWon) {
        return;
    }
    checkEnemyCollision();

    updateEnemies();


    // Movimento do jogador
    if (keys['a'] || keys['A']) {
        player.x -= player.speed;
    }

    if (keys['d'] || keys['D']) {
        player.x += player.speed;
    }

    // Aplica a gravidade
    player.y += player.velocityY;
    player.velocityY += player.gravity;

    // Verifica se o jogador está no chão
    var onGround = false;
    platforms.forEach(function(platform) {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height
        ) {
            // Colisão com a plataforma
            player.y = platform.y - player.height;
            player.jumping = false;
            player.velocityY = 0;
            onGround = true;
        }
    });

    // Ajusta a posição do jogador se estiver no chão
    if (!onGround) {
        player.jumping = true;
    }

    // Pulo
    // Pulo
if ((keys['w'] || keys['W']) && !player.jumping && onGround) {
    player.velocityY = -player.jumpHeight;
    player.jumping = true;
}



    // Verifica interação com os NPCs
    npcs.forEach(function(npc) {
        // Calcula a distância entre o jogador e o NPC
        var distance = Math.sqrt(Math.pow((player.x + player.width / 2) - (npc.x + npc.width / 2), 2) +
                                Math.pow((player.y + player.height / 2) - (npc.y + npc.height / 2), 2));

        // Define um raio de interação (ajuste conforme necessário)
        var interactionRadius = 100;

        // Verifica se o jogador está dentro do raio de interação
        if (distance < interactionRadius) {
            // Verifica se a tecla Enter foi pressionada para interagir
            if (keys['Enter']) {
                showDialog(npc.quiz.question, npc.quiz.options);
            }
        }
    });

    // Atualiza a posição da câmera para seguir o jogador
    camera.x = player.x - canvas.width / 4;
}

function drawEnemies() {
    ctx.fillStyle = "red";
    enemies.forEach(function(enemy) {
        if (enemy.alive) {
            ctx.fillRect(enemy.x - camera.x, enemy.y, enemy.width, enemy.height);
        }
    });


}

function checkEnemyCollision() {
    enemies.forEach(function(enemy) {
        if (checkCollision(player, enemy) && player.velocityY > 0 && player.y < enemy.y) {
            // O jogador está acima do inimigo e caindo, então mata o inimigo
            enemy.alive = false;
            player.velocityY = -player.jumpHeight; // Faz o jogador pular após matar o inimigo
        } else if (checkCollision(player, enemy) && enemy.alive) {
            // O jogador colidiu com um inimigo e o inimigo está vivo, então o jogador perde uma vida
            player.lives--;
            showDialog('Você colidiu com um inimigo! Vidas restantes: ' + player.lives);

            // Verifica se o jogador perdeu o jogo
            if (player.lives === 0) {
                endGame();
            }
        }
    });
}

function updateEnemies() {
    // Lógica do inimigo (pode ser expandida conforme necessário)
    enemies.forEach(function(enemy) {
        if (enemy.alive) {
            // Calcula a direção para o jogador
            var direction = player.x - enemy.x;

            // Move o inimigo em direção ao jogador com uma velocidade definida
            var enemySpeed = 2; // Ajuste conforme necessário
            if (direction > 0) {
                enemy.x += enemySpeed;
            } else {
                enemy.x -= enemySpeed;
            }
        }
    });
    
}

function draw() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);


    drawEnemies();

    // Desenha o jogador
    ctx.fillStyle = "white"
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);

    // Desenha os NPCs
    ctx.fillStyle = "blue";
    npcs.forEach(function(npc) {
        ctx.fillRect(npc.x - camera.x, npc.y, npc.width, npc.height);
    });

    // Desenha as plataformas
    ctx.fillStyle = "black";
    platforms.forEach(function(platform) {
        ctx.fillRect(platform.x - camera.x, platform.y, platform.width, platform.height);
    });

    // Exibe vidas e respostas corretas
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Vidas: " + player.lives, 20, 30);
    ctx.fillText("Respostas Corretas: " + player.correctAnswers, 20, 60);
}

function showDialog(question, options) {
    dialogText.innerHTML = question;

    // Limpa as opções existentes
    optionsList.innerHTML = "";

    // Adiciona as novas opções
    options.forEach(function(option, index) {
        var listItem = document.createElement('li');
        listItem.innerHTML = `<button onclick="checkAnswer(${index})">${option}</button>`;
        optionsList.appendChild(listItem);
    });

    // Adiciona o botão de fechar
    var closeButton = document.getElementById('closeButton');
    closeButton.style.display = 'block';

    dialogBox.style.display = 'block';
    // Desativa as teclas durante o diálogo
    keys = {};
}

function closeDialog() {
    var closeButton = document.getElementById('closeButton');
    closeButton.style.display = 'none';

    dialogBox.style.display = 'none';
    // Reativa as teclas após o diálogo
    keys = {};

    // Verifica se o jogador ganhou ou perdeu o jogo
    if (player.lives === 0 || player.correctAnswers === 3) {
        endGame();
    }
}

function endGame() {
    player.gameOver = true;

    // Mostra a mensagem final
    var endMessage = player.correctAnswers === 3 ? 'Parabéns! Você ganhou o jogo!' : 'Você perdeu o jogo!';
    showDialog(endMessage);

    // Adiciona o botão de retornar ao menu
    var returnToMenuButton = document.createElement('button');
    returnToMenuButton.innerText = 'Retornar ao Menu';
    returnToMenuButton.onclick = function() {
        window.location.href = 'menu.html';
    };
    optionsList.appendChild(returnToMenuButton);

    // ... (seu código existente)
}


function checkAnswer(index) {
    var interactingNPC = npcs.find(function(npc) {
        return checkCollision(player, npc);
    });

    if (interactingNPC && !interactingNPC.answered) {
        var selectedAnswer = interactingNPC.quiz.options[index];

        if (selectedAnswer === interactingNPC.quiz.correctAnswer) {
            console.log('Resposta correta!');

            // Incrementa respostas corretas
            player.correctAnswers++;
            
            console.log('Respostas corretas:', player.correctAnswers);

            interactingNPC.answered = true; // Marca o NPC como respondido

            // Verifica se o jogador ganhou o jogo
            if (player.correctAnswers === 3) {
                endGame();
            } else {
                showDialog('Resposta correta!');
            }
        } else {
            // Decrementa vidas
            player.lives--;

            console.log('Resposta incorreta. Vidas restantes:', player.lives);

            // Verifica se o jogador perdeu o jogo
            if (player.lives === 0) {
                endGame();
            } else {
                showDialog('Resposta incorreta! Vidas restantes: ' + player.lives);
            }
        }
    }
}





function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

window.addEventListener('click', function(e) {
    // Fecha o diálogo ao clicar fora da caixa de diálogo
    if (e.target === dialogBox) {
        closeDialog();
    }
});

// Inicializa o jogo
gameLoop();