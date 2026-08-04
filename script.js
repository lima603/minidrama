/* ==========================================
   TVSéries V2
========================================== */

const tg = window.Telegram.WebApp;

tg.ready();

tg.expand();

/* ==========================================
   WEBHOOK MAKE
========================================== */

const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/s43owf5is3s5a9cfxaxpo7qw83o1f0rf";

let todasAsSeries = [];

/* ==========================================
   CARREGAR SÉRIES DO JSON
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    fetch('series.json')
        .then(response => response.json())
        .then(series => {
            todasAsSeries = series;
            exibirSeries(todasAsSeries);
        })
        .catch(error => console.error('Erro ao carregar as séries:', error));
});

/* ==========================================
   EXIBIR SÉRIES NA TELA
========================================== */

function exibirSeries(lista) {
    const container = document.querySelector('.catalogo-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; width:100%; padding:20px;">Nenhuma série encontrada.</p>';
        return;
    }

    lista.forEach(serie => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Define a classe CSS da tag com base no valor dela
        let classeTag = "";
        if (serie.tag === "VIP") classeTag = "vip";
        if (serie.tag === "NOVO") classeTag = "novo";

        card.innerHTML = `
            <img src="${serie.imagem}" alt="${serie.nome}">
            <div class="info">
                <span class="tag ${classeTag}">${serie.tag}</span>
                <h3 class="nome">${serie.nome}</h3>
                <div class="stars">★★★★★</div>
                <div class="preco">R$ ${serie.preco.toFixed(2).replace('.', ',')}</div>
                <button class="btn-comprar" onclick="comprarProduto(event, '${serie.nome}', ${serie.preco}, '${serie.chatId}')">
                    COMPRAR
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================
   PESQUISA
========================================== */

const pesquisa = document.getElementById("pesquisa");

if (pesquisa) {
    pesquisa.addEventListener("keyup", () => {
        const texto = pesquisa.value.toLowerCase();
        
        // Remove a seleção dos botões de categoria ao pesquisar
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));

        const filtradas = todasAsSeries.filter(serie => 
            serie.nome.toLowerCase().includes(texto)
        );
        exibirSeries(filtradas);
    });
}

/* ==========================================
   FILTRO POR CATEGORIA
========================================== */

function filtrarSeries(categoria, event) {
    // Limpa o campo de pesquisa por texto se usar o filtro
    if (pesquisa) pesquisa.value = "";

    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
    if (event && event.target) {
        event.target.classList.add('ativo');
    }

    if (categoria === 'todos') {
        exibirSeries(todasAsSeries);
    } else {
        const filtradas = todasAsSeries.filter(serie => serie.categoria === categoria);
        exibirSeries(filtradas);
    }
}

/* ==========================================
   BANNER AUTOMÁTICO
========================================== */

const banners = [
    "banner1.jpg",
    "banner2.jpg",
    "banner3.jpg"
];

let bannerAtual = 0;

const bannerImg = document.querySelector(".slide img");

if (bannerImg && banners.length > 0) {
    setInterval(() => {
        bannerAtual++;
        if (bannerAtual >= banners.length) {
            bannerAtual = 0;
        }
        bannerImg.src = banners[bannerAtual];
    }, 5000);
}

/* ==========================================
   FUNÇÃO COMPRAR
========================================== */

async function comprarProduto(
    event,
    nomeDrama,
    precoProduto,
    chatId
) {
    const userId = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user)
        ? tg.initDataUnsafe.user.id
        : "teste_web";

    const botao = event.target;
    const textoOriginal = botao.innerHTML;
    
    botao.innerHTML = "Gerando PIX...";
    botao.disabled = true;

    try {
        const resposta = await fetch(
            MAKE_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    drama: nomeDrama,
                    valor: precoProduto,
                    chat_id: chatId
                })
            }
        );

        if (resposta.ok) {
            botao.innerHTML = "PIX GERADO";
            setTimeout(() => {
                tg.close();
            }, 600);
        } else {
            alert("Erro ao gerar PIX.");
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
        }

    } catch (e) {
        console.error(e);
        alert("Falha de conexão.");
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
    }
}
