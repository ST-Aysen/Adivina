let numeroSecreto;
let intentos = 0;
let tiempoInicio;
let temporizador;
let maximo = 100;

const niveles = [
  { max: 50, nombre: "🌱 Iniciación", desc: "Adivina un número del 1 al 50." },
  { max: 100, nombre: "🔥 Intermedio", desc: "El rango se amplía. 1 a 100." },
  { max: 200, nombre: "🚀 Experto", desc: "¡Desafío extremo! Hasta 200." }
];

let nivelActual = 0;

let canvas, ctx, slider, canvasMsg;

// Prevenir deslizamiento no deseado
document.addEventListener('touchstart', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

// Modo oscuro
const temaBtn = document.getElementById("boton-tema");
if (localStorage.getItem("modoOscuro") === "true") {
  document.body.classList.add("modo-oscuro");
  temaBtn.textContent = "☀️ Modo Claro";
}

function cambiarTema() {
  document.body.classList.toggle("modo-oscuro");
  const oscuro = document.body.classList.contains("modo-oscuro");
  temaBtn.textContent = oscuro ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
  localStorage.setItem("modoOscuro", oscuro);
}

// Cambiar versión
function cambiarVersion(version) {
  document.getElementById("version-texto").style.display = version === "texto" ? "block" : "none";
  document.getElementById("version-canvas").style.display = version === "canvas" ? "block" : "none";
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  if (version === "canvas") reiniciarCanvas();
  else reiniciar();
}

// --- VERSIÓN TEXTO ---
window.onload = function () {
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
    temaBtn.textContent = "☀️ Modo Claro";
  }
  cargarMejorPuntaje();
  configurarRango();
  reiniciar();
};

function configurarRango() {
  if (nivelActual >= niveles.length) return;
  maximo = niveles[nivelActual].max;
  document.getElementById("entrada").max = maximo;
  document.getElementById("rango").textContent = `1 y ${maximo}`;
  document.getElementById("dificultad").value = maximo;
  mostrarNivel();
}

function mostrarNivel() {
  const nivel = niveles[nivelActual];
  const intentosEl = document.getElementById("intentos");
  const p = document.createElement("p");
  p.innerHTML = `<strong>Nivel ${nivelActual + 1}: ${nivel.nombre}</strong><br>${nivel.desc}`;
  p.style.marginBottom = "10px";
  intentosEl.parentNode.insertBefore(p, intentosEl);
}

function generarNumero() {
  return Math.floor(Math.random() * maximo) + 1;
}

function verificar() {
  const entrada = document.getElementById("entrada");
  const mensaje = document.getElementById("mensaje");
  const valor = parseInt(entrada.value);

  if (isNaN(valor) || valor < 1 || valor > maximo) {
    mensaje.textContent = `Ingresa un número válido entre 1 y ${maximo}.`;
    reproducirSonido("incorrecto");
    return;
  }

  intentos++;
  document.getElementById("intentos").textContent = `Intentos: ${intentos}`;

  if (valor === numeroSecreto) {
    const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);
    document.getElementById("tiempo").textContent = `Tiempo: ${tiempoTotal}s`;
    mensaje.textContent = `🎉 ¡Correcto! Era ${numeroSecreto}.`;
    mensaje.style.color = "#27ae60";
    reproducirSonido("correcto");

    setTimeout(() => {
      nivelActual++;
      if (nivelActual < niveles.length) {
        reiniciar();
        mensaje.textContent = `✅ Pasaste al Nivel ${nivelActual + 1}!`;
        setTimeout(() => mensaje.textContent = "", 2000);
      } else {
        mensaje.textContent = "🏆 ¡Felicidades, Marcelo! Has completado todos los niveles.";
        entrada.disabled = true;
      }
    }, 1500);
  } else {
    mensaje.textContent = valor < numeroSecreto ? "📈 Más arriba" : "📉 Más abajo";
    mensaje.style.color = "#e74c3c";
    reproducirSonido("incorrecto");
  }

  entrada.value = "";
  entrada.focus();
}

function reproducirSonido(tipo) {
  const sonido = document.getElementById(`sonido-${tipo}`);
  sonido.currentTime = 0;
  sonido.play().catch(e => console.log("Error:", e));
}

function reiniciar() {
  clearInterval(temporizador);
  numeroSecreto = generarNumero();
  intentos = 0;
  tiempoInicio = Date.now();

  document.getElementById("mensaje").textContent = "";
  document.getElementById("intentos").textContent = "Intentos: 0";
  document.getElementById("tiempo").textContent = "Tiempo: 0s";
  document.getElementById("entrada").value = "";
  document.getElementById("entrada").disabled = false;
  document.getElementById("entrada").focus();

  temporizador = setInterval(() => {
    const segundos = Math.floor((Date.now() - tiempoInicio) / 1000);
    document.getElementById("tiempo").textContent = `Tiempo: ${segundos}s`;
  }, 1000);

  configurarRango();
}

function cargarMejorPuntaje() {
  const mejor = localStorage.getItem("mejorPuntaje");
  if (mejor) {
    const p = JSON.parse(mejor);
    document.getElementById("mejor-puntaje").textContent = 
      `Mejor: ${p.intentos} en ${p.tiempo}s (${p.fecha})`;
  } else {
    document.getElementById("mejor-puntaje").textContent = "Mejor puntaje: Aún no hay";
  }
}

// --- VERSIÓN CANVAS ---
function inicializarCanvas() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  slider = document.getElementById("slider");
  canvasMsg = document.getElementById("mensaje-canvas");
  actualizarCanvas();
}

function actualizarCanvas() {
  if (!ctx) inicializarCanvas();
  const valor = parseInt(slider.value);
  document.getElementById("valor-slider").textContent = valor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ecf0f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const distancia = Math.abs(valor - numeroSecreto);
  const maxDist = 100;
  const ancho = ((maxDist - distancia) / maxDist) * canvas.width;

  const r = Math.floor((distancia / maxDist) * 255);
  const g = Math.floor((1 - distancia / maxDist) * 255);
  ctx.fillStyle = `rgb(${r}, ${g}, 50)`;
  ctx.fillRect(0, 0, ancho, canvas.height);

  const x = (numeroSecreto / 100) * canvas.width;
  ctx.strokeStyle = "#000";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.lineTo(x, 0);
  ctx.lineTo(x, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function verificarCanvas() {
  const valor = parseInt(slider.value);
  if (valor === numeroSecreto) {
    canvasMsg.textContent = `🎉 ¡Correcto! Era ${numeroSecreto}.`;
    canvasMsg.style.color = "#27ae60";
    slider.disabled = true;
    reproducirSonido("correcto");
  } else {
    canvasMsg.textContent = valor < numeroSecreto ? "📈 Más arriba" : "📉 Más abajo";
    canvasMsg.style.color = "#e74c3c";
    reproducirSonido("incorrecto");
  }
}

function reiniciarCanvas() {
  numeroSecreto = Math.floor(Math.random() * 100) + 1;
  slider.value = 50;
  slider.disabled = false;
  canvasMsg.textContent = "";
  actualizarCanvas();
}