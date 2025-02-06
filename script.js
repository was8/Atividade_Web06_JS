// Tabuleiro
let tabuleiro;
let larguraTabuleiro = 500;
let alturaTabuleiro = 500;
let contexto; 

// Jogador
let larguraJogador = 80; // 500 para testes, 80 normal
let alturaJogador = 10;
let velocidadeJogadorX = 10; // move 10 pixels a cada vez

let jogador = {
    x: larguraTabuleiro / 2 - larguraJogador / 2,
    y: alturaTabuleiro - alturaJogador - 5,
    largura: larguraJogador,
    altura: alturaJogador,
    velocidadeX: velocidadeJogadorX
}

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
}

// Blocos
let blocos = [];
let larguraBloco = 50;
let alturaBloco = 10;
let colunasBloco = 8; 
let linhasBloco = 3; // adiciona mais conforme o jogo avança
let maxLinhasBloco = 10; // limite de linhas
let contagemBloco = 0;

// Posição inicial do bloco (canto superior esquerdo)
let posicaoXBloco = 15;
let posicaoYBloco = 45;

let pontuacao = 0;
let jogoTerminado = false;

window.onload = function() {
    tabuleiro = document.getElementById("board");
    tabuleiro.height = alturaTabuleiro;
    tabuleiro.width = larguraTabuleiro;
    contexto = tabuleiro.getContext("2d"); // utilizado para desenhar no tabuleiro

    // Desenha o jogador inicial
    contexto.fillStyle = "skyblue";
    contexto.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    requestAnimationFrame(atualizar);
    document.addEventListener("keydown", moverJogador);

    // Cria os blocos
    criarBlocos();
}

function atualizar() {
    requestAnimationFrame(atualizar);
    // Para de desenhar se o jogo terminou
    if (jogoTerminado) {
        return;
    }
    contexto.clearRect(0, 0, tabuleiro.width, tabuleiro.height);

    // Desenha o Jogador
    contexto.fillStyle = "lightgreen";
    contexto.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

    // Atualiza e desenha a Bola
    contexto.fillStyle = "white";
    bola.x += bola.velocidadeX;
    bola.y += bola.velocidadeY;
    contexto.fillRect(bola.x, bola.y, bola.largura, bola.altura);

    // Rebater a bola na raquete do jogador
    if (colisaoSuperior(bola, jogador) || colisaoInferior(bola, jogador)) {
        bola.velocidadeY *= -1;   // inverte a direção vertical
    } else if (colisaoEsquerda(bola, jogador) || colisaoDireita(bola, jogador)) {
        bola.velocidadeX *= -1;   // inverte a direção horizontal
    }

    if (bola.y <= 0) { 
        // Se a bola tocar o topo do canvas
        bola.velocidadeY *= -1;
    } else if (bola.x <= 0 || (bola.x + bola.largura >= larguraTabuleiro)) {
        // Se a bola tocar as laterais do canvas
        bola.velocidadeX *= -1;
    } else if (bola.y + bola.altura >= alturaTabuleiro) {
        // Se a bola tocar a parte inferior do canvas
        contexto.font = "20px sans-serif";
        contexto.fillText("Game Over: Pressione 'Space' para Reiniciar", 80, 400);
        jogoTerminado = true;
    }

    // Processa os Blocos
    contexto.fillStyle = "skyblue";
    for (let i = 0; i < blocos.length; i++) {
        let bloco = blocos[i];
        if (!bloco.quebrado) {
            if (colisaoSuperior(bola, bloco) || colisaoInferior(bola, bloco)) {
                bloco.quebrado = true;     // bloco é destruído
                bola.velocidadeY *= -1;     // inverte a direção vertical
                pontuacao += 100;
                contagemBloco -= 1;
            } else if (colisaoEsquerda(bola, bloco) || colisaoDireita(bola, bloco)) {
                bloco.quebrado = true;     // bloco é destruído
                bola.velocidadeX *= -1;     // inverte a direção horizontal
                pontuacao += 100;
                contagemBloco -= 1;
            }
            contexto.fillRect(bloco.x, bloco.y, bloco.largura, bloco.altura);
        }
    }

    // Próximo nível se todos os blocos forem destruídos
    if (contagemBloco === 0) {
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
    return a.x < b.x + b.largura &&   // o canto superior esquerdo de "a" não alcança o canto superior direito de "b"
           a.x + a.largura > b.x &&     // o canto superior direito de "a" ultrapassa o canto superior esquerdo de "b"
           a.y < b.y + b.altura &&      // o canto superior esquerdo de "a" não alcança o canto inferior esquerdo de "b"
           a.y + a.altura > b.y;        // o canto inferior esquerdo de "a" ultrapassa o canto superior esquerdo de "b"
}

function colisaoSuperior(bola, objeto) {
    // Retorna true se a bola estiver colidindo na parte superior do objeto
    return detectarColisao(bola, objeto) && (bola.y + bola.altura) >= objeto.y;
}

function colisaoInferior(bola, objeto) {
    // Retorna true se a bola estiver colidindo na parte inferior do objeto
    return detectarColisao(bola, objeto) && (objeto.y + objeto.altura) >= bola.y;
}

function colisaoEsquerda(bola, objeto) {
    // Retorna true se a bola estiver colidindo pelo lado esquerdo do objeto
    return detectarColisao(bola, objeto) && (bola.x + bola.largura) >= objeto.x;
}

function colisaoDireita(bola, objeto) {
    // Retorna true se a bola estiver colidindo pelo lado direito do objeto
    return detectarColisao(bola, objeto) && (objeto.x + objeto.largura) >= bola.x;
}

function criarBlocos() {
    blocos = []; // limpa o array de blocos
    for (let c = 0; c < colunasBloco; c++) {
        for (let r = 0; r < linhasBloco; r++) {
            let bloco = {
                x: posicaoXBloco + c * larguraBloco + c * 10, // espaçamento de 10px entre colunas
                y: posicaoYBloco + r * alturaBloco + r * 10,   // espaçamento de 10px entre linhas
                largura: larguraBloco,
                altura: alturaBloco,
                quebrado: false
            }
            blocos.push(bloco);
        }
    }
    contagemBloco = blocos.length;
}

function reiniciarJogo() {
    jogoTerminado = false;
    jogador = {
        x: larguraTabuleiro / 2 - larguraJogador / 2,
        y: alturaTabuleiro - alturaJogador - 5,
        largura: larguraJogador,
        altura: alturaJogador,
        velocidadeX: velocidadeJogadorX
    }
    bola = {
        x: larguraTabuleiro / 2,
        y: alturaTabuleiro / 2,
        largura: larguraBola,
        altura: alturaBola,
        velocidadeX: velocidadeBolaX,
        velocidadeY: velocidadeBolaY
    }
    blocos = [];
    linhasBloco = 3;
    pontuacao = 0;
    criarBlocos();
}
