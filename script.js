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

/* ==========================================
   PESQUISA
========================================== */

const pesquisa = document.getElementById("pesquisa");

pesquisa.addEventListener("keyup", () => {

const texto = pesquisa.value.toLowerCase();

const cards = document.querySelectorAll(".card");

cards.forEach(card=>{

const nome = card.innerText.toLowerCase();

if(nome.includes(texto)){

card.style.display="block";

}else{

card.style.display="none";

}

});

});

/* ==========================================
   BANNER AUTOMÁTICO
========================================== */

const banners=[

"banner1.jpg",

"banner2.jpg"

];

let bannerAtual=0;

const banner=document.querySelector(".slide img");

setInterval(()=>{

bannerAtual++;

if(bannerAtual>=banners.length){

bannerAtual=0;

}

banner.src=banners[bannerAtual];

},5000);

/* ==========================================
   FUNÇÃO COMPRAR
========================================== */

async function comprarProduto(

event,

nomeDrama,

precoProduto,

chatId

){

const userId=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)

?tg.initDataUnsafe.user.id

:"teste_web";

const botao=event.target;

botao.innerHTML="Gerando PIX...";

botao.disabled=true;

try{

const resposta=await fetch(

MAKE_WEBHOOK_URL,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

user_id:userId,

drama:nomeDrama,

valor:precoProduto,

chat_id:chatId

})

}

);

if(resposta.ok){

botao.innerHTML="PIX GERADO";

setTimeout(()=>{

tg.close();

},600);

}else{

alert("Erro ao gerar PIX.");

botao.innerHTML="COMPRAR";

botao.disabled=false;

}

}catch(e){

console.error(e);

alert("Falha de conexão.");

botao.innerHTML="COMPRAR";

botao.disabled=false;

}

}
