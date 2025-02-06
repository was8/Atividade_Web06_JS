// Tabuleiro
let tabuleiro;
let larguraTabuleiro = 500;
let alturaTabuleiro = 500;
let contexto; 

// Jogador
let larguraJogador = 80; // 500 para testes, 80 normal
let alturaJogador = 10;
let velocidadeJogador = 10; // move 10 pixels a cada vez

let jogador = {
    x: larguraTabuleiro / 2 - larguraJogador / 2,
    y: alturaTabuleiro - alturaJogador - 5,
    largura: larguraJogador,
    altura: alturaJogador,
    velocidadeX: velocidadeJogador
};

// Bola
let larguraBola = 10;
let alturaBola = 10;
let velocidadeBolaX = 3; // 15 para testes, 3 normal
let velocidadeBolaY = 2; // 10 para testes, 2 normal

let bola = {
    x: larguraTabuleiro / 2,
    y: alturaTabuleiro / 2,
    largura: larguraBola,
    altura: alturaBola,
    velocidadeX: velocidadeBolaX,
    velocidadeY: velocidadeBolaY
};

// Blocos
let blocos = [];
let larguraBloco = 50;
let alturaBloco = 10;
let colunasBloco = 8; 
let linhasBloco = 3; // aumenta conforme o jogo avança
let maxLinhasBloco = 10; // limite máximo de linhas
let contagemBlocos = 0;

// Posição inicial dos blocos (canto superior esquerdo)
let posicaoXBloco = 15;
let posicaoYBloco = 45;

let pontuacao = 0;
let jogoTerminado = false;

window.onload = function() {
    tabuleiro = document.getElementById("board");
    tabuleiro.width = larguraTabuleiro;
    tabuleiro.height = alturaTabuleiro;
    contexto = tabuleiro.getContext("2d"); // usado para desenhar no tabuleiro

    // Desenha o jogador inicial
    contexto.fillStyle = "skyblue";
    contexto.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    requestAnimationFrame(atualizar);
    document.addEventListener("keydown", moverJogador);

    // Cria os blocos
    criarBlocos();
};

function atualizar() {
    requestAnimationFrame(atualizar);
    if (jogoTerminado) return;
    
    contexto.clearRect(0, 0, tabuleiro.width, tabuleiro.height);

    // Desenha o jogador
    contexto.fillStyle = "lightgreen";
    contexto.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Atualiza a posição da bola e a desenha
    bola.x += bola.velocidadeX;
    bola.y += bola.velocidadeY;
    contexto.fillStyle = "white";
    contexto.fillRect(bola.x, bola.y, bola.largura, bola.altura);

    // Rebater a bola na raquete (jogador)
    if (colisaoSuperior(bola, jogador) || colisaoInferior(bola, jogador)) {
        bola.velocidadeY *= -1; // inverte a direção vertical
    } else if (colisaoEsquerda(bola, jogador) || colisaoDireita(bola, jogador)) {
        bola.velocidadeX *= -1; // inverte a direção horizontal
    }

    // Colisão com as paredes
    if (bola.y <= 0) { 
        // Topo
        bola.velocidadeY *= -1;
    } else if (bola.x <= 0 || (bola.x + bola.largura >= larguraTabuleiro)) { 
        // Laterais
        bola.velocidadeX *= -1;
    } else if (bola.y + bola.altura >= alturaTabuleiro) { 
        // Fundo
        contexto.font = "20px sans-serif";
        contexto.fillText("Fim do jogo: Aperte 'espaço' para reiniciar", 80, 400);
        jogoTerminado = true;
    }

    // Processa os blocos
    contexto.fillStyle = "skyblue";
    for (let i = 0; i < blocos.length; i++) {
        let bloco = blocos[i];
        if (!bloco.quebrado) {
            if (colisaoSuperior(bola, bloco) || colisaoInferior(bola, bloco)) {
                bloco.quebrado = true;     // marca o bloco como quebrado
                bola.velocidadeY *= -1;     // inverte a direção vertical da bola
                pontuacao += 100;
                contagemBlocos--;
            } else if (colisaoEsquerda(bola, bloco) || colisaoDireita(bola, bloco)) {
                bloco.quebrado = true;
                bola.velocidadeX *= -1;
                pontuacao += 100;
                contagemBlocos--;
            }
            contexto.fillRect(bloco.x, bloco.y, bloco.largura, bloco.altura);
        }
    }

    // Próximo nível se todos os blocos forem destruídos
    if (contagemBlocos === 0) {
        pontuacao += 100 * linhasBloco * colunasBloco; // pontos bônus
        linhasBloco = Math.min(linhasBloco + 1, maxLinhasBloco);
        criarBlocos();
    }

    // Exibe a pontuação
    contexto.font = "20px sans-serif";
    contexto.fillText(pontuacao, 10, 25);
}

function foraDosLimites(posicaoX) {
    return (posicaoX < 0 || posicaoX + larguraJogador > larguraTabuleiro);
}

function moverJogador(e) {
    if (jogoTerminado) {
        if (e.code === "Space") {
            reiniciarJogo();
            console.log("REINICIAR");
        }
        return;
    }
    if (e.code === "ArrowLeft") {
        let proximoX = jogador.x - jogador.velocidadeX;
        if (!foraDosLimites(proximoX)) {
            jogador.x = proximoX;
        }
    } else if (e.code === "ArrowRight") {
        let proximoX = jogador.x + jogador.velocidadeX;
        if (!foraDosLimites(proximoX)) {
            jogador.x = proximoX;
        }
    }
}

function detectarColisao(a, b) {
    return a.x < b.x + b.largura &&  // O canto superior esquerdo de "a" não alcança o canto superior direito de "b"
           a.x + a.largura > b.x &&    // O canto superior direito de "a" ultrapassa o canto superior esquerdo de "b"
           a.y < b.y + b.altura &&     // O canto superior esquerdo de "a" não alcança o canto inferior esquerdo de "b"
           a.y + a.altura > b.y;       // O canto inferior esquerdo de "a" ultrapassa o canto superior esquerdo de "b"
}

function colisaoSuperior(bola, objeto) {
    return detectarColisao(bola, objeto) && (bola.y + bola.altura) >= objeto.y;
}

function colisaoInferior(bola, objeto) {
    return detectarColisao(bola, objeto) && (objeto.y + objeto.altura) >= bola.y;
}

function colisaoEsquerda(bola, objeto) {
    return detectarColisao(bola, objeto) && (bola.x + bola.largura) >= objeto.x;
}

function colisaoDireita(bola, objeto) {
    return detectarColisao(bola, objeto) && (objeto.x + objeto.largura) >= bola.x;
}

function criarBlocos() {
    blocos = []; // limpa o array de blocos
    for (let c = 0; c < colunasBloco; c++) {
        for (let r = 0; r < linhasBloco; r++) {
            let bloco = {
                x: posicaoXBloco + c * (larguraBloco + 10), // 10px de espaço entre colunas
                y: posicaoYBloco + r * (alturaBloco + 10),   // 10px de espaço entre linhas
                largura: larguraBloco,
                altura: alturaBloco,
                quebrado: false
            };
            blocos.push(bloco);
        }
    }
    contagemBlocos = blocos.length;
}

function reiniciarJogo() {
    jogoTerminado = false;
    jogador = {
        x: larguraTabuleiro / 2 - larguraJogador / 2,
        y: alturaTabuleiro - alturaJogador - 5,
        largura: larguraJogador,
        altura: alturaJogador,
        velocidadeX: velocidadeJogador
    };
    bola = {
        x: larguraTabuleiro / 2,
        y: alturaTabuleiro / 2,
        largura: larguraBola,
        altura: alturaBola,
        velocidadeX: velocidadeBolaX,
        velocidadeY: velocidadeBolaY
    };
    blocos = [];
    linhasBloco = 3;
    pontuacao = 0;
    criarBlocos();
}
