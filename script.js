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

// URL do Webhook do Make para consultar os acessos (coloque aqui a URL específica do cenário de consulta se for diferente, ou use a mesma tratando por parâmetro)
const MAKE_WEBHOOK_MEUS_ACESSOS = "https://hook.us2.make.com/s43owf5is3s5a9cfxaxpo7qw83o1f0rf";

let todasAsSeries = [];

/* ==========================================
   CARREGAR SÉRIES DO JSON
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    fetch('series.json')
        .then(response => response.json())
        .then(series => {
            todasAsSeries = series;
            // Exibe a lista inicial ordenada de A a Z
            const ordenadas = [...todasAsSeries].sort((a, b) => a.nome.localeCompare(b.nome));
            exibirSeries(ordenadas);
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
        // Ordena também os resultados da pesquisa alfabeticamente
        const filtradasOrdenadas = [...filtradas].sort((a, b) => a.nome.localeCompare(b.nome));
        exibirSeries(filtradasOrdenadas);
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

    let listaParaExibir = [];

    if (categoria === 'todos') {
        listaParaExibir = [...todasAsSeries];
    } else {
        listaParaExibir = todAsAsSeries.filter(serie => serie.categoria === categoria);
    }

    // Aplica a ordem alfabética (A a Z) em qualquer filtro escolhido
    const listaOrdenada = listaParaExibir.sort((a, b) => a.nome.localeCompare(b.nome));
    exibirSeries(listaOrdenada);
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

/* ==========================================
   FUNÇÃO MEUS ACESSOS (MODAL & API)
========================================== */

async function abrirMeusAcessos() {
    const modal = document.getElementById('modal-acessos');
    const statusText = document.getElementById('status-carregando');
    const conteudo = document.getElementById('conteudo-acessos');
    
    modal.style.display = 'flex';
    statusText.style.display = 'block';
    statusText.innerText = "Verificando suas assinaturas...";
    conteudo.style.display = 'none';
    conteudo.innerHTML = '';

    const userId = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user)
        ? tg.initDataUnsafe.user.id
        : "teste_usuario";

    try {
        const resposta = await fetch(MAKE_WEBHOOK_MEUS_ACESSOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "verificar_acessos",
                user_id: userId
            })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            statusText.style.display = 'none';
            conteudo.style.display = 'flex';

            if (dados && dados.length > 0) {
                let htmlAcessos = '';
                dados.forEach(acesso => {
                    htmlAcessos += `
                        <div style="background: #1f1f1f; padding: 15px; border-radius: 12px; border-left: 4px solid #18d26e; margin-bottom: 10px;">
                            <h3 style="color: #18d26e; font-size: 16px; margin-bottom: 5px;">${acesso.nome_plano}</h3>
                            <p style="font-size: 13px; color: #ccc; margin-bottom: 10px;">Expira em: ${acesso.data_expiracao}</p>
                            <a href="${acesso.link_grupo}" target="_blank" style="display: block; text-align: center; background: #18d26e; color: #000; padding: 10px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Entrar no Grupo VIP</a>
                        </div>
                    `;
                });
                conteudo.innerHTML = htmlAcessos;
            } else {
                conteudo.innerHTML = `
                    <p style="text-align: center; color: #aaa; font-size: 14px; padding: 10px;">Nenhuma assinatura ativa encontrada para o seu usuário.</p>
                `;
            }
        } else {
            statusText.style.display = 'none';
            conteudo.style.display = 'flex';
            conteudo.innerHTML = `<p style="text-align: center; color: #ff4d4d; font-size: 14px;">Erro ao buscar acessos. Tente novamente mais tarde.</p>`;
        }
    } catch (e) {
        console.error(e);
        statusText.style.display = 'none';
        conteudo.style.display = 'flex';
        conteudo.innerHTML = `<p style="text-align: center; color: #ff4d4d; font-size: 14px;">Falha de conexão com o servidor.</p>`;
    }
}

function fecharMeusAcessos() {
    const modal = document.getElementById('modal-acessos');
    if (modal) modal.style.display = 'none';
}
