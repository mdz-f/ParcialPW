/**
 * ============================================================
 *  ChambeaSV - Agente Flotante Interactivo "Chambita AI"
 * ============================================================
 *  - Avatar interactivo con seguimiento ocular del ratón (pupilas móviles)
 *  - Ventana emergente con diseño Glassmorphism
 *  - Indicador de "escribiendo...", scroll automático y peticiones /api/chat
 * ============================================================
 */

const ChambitaChatbot = {
  activo: false,
  primeraVez: true,
  inicializado: false, // <-- Candado para evitar doble inicialización

  // Respuestas inteligentes locales de respaldo
  respuestasInteligentes: [
    {
      claves: ['cv', 'curriculum', 'currículum', 'hoja de vida', 'ats'],
      respuesta: '📄 <b>¡Claro! Consejos clave para tu CV en El Salvador:</b><br>1. Usa formato cronológico inverso o funcional.<br>2. Incluye palabras clave del puesto para pasar filtros ATS.<br>3. Destaca logros con métricas (ej. <i>"Aumenté ventas un 15%"</i>).<br>Puedes consultar nuestra guía completa en <a href="recursos.html" class="fw-semibold text-primary">Centro de Recursos</a>.'
    },
    {
      claves: ['remoto', 'teletrabajo', 'casa', 'home office'],
      respuesta: '💻 <b>¿Buscas empleo remoto?</b><br>En ChambeaSV tenemos vacantes 100% remotas e híbridas. Puedes ir a <a href="empleos.html" class="fw-semibold text-primary">Buscar Empleos</a> y en el filtro de <b>Modalidad</b> seleccionar <i>"Remoto"</i>.'
    },
    {
      claves: ['publicar', 'empresa', 'vacante', 'contratar', 'reclutador', 'talento'],
      respuesta: '🏢 <b>¿Representas a una empresa?</b><br>Puedes publicar tus ofertas en pocos minutos en el <a href="empresa.html" class="fw-semibold text-primary">Módulo Empresarial</a> para recibir candidaturas verificadas de profesionales salvadoreños.'
    },
    {
      claves: ['salario', 'sueldo', 'cuanto pagan', 'pago', 'dinero'],
      respuesta: '💵 <b>Transparencia salarial:</b><br>Todas las vacantes publicadas en ChambeaSV muestran un rango salarial mínimo y máximo estimado en USD para que apliques con total seguridad.'
    },
    {
      claves: ['registro', 'cuenta', 'login', 'iniciar sesion', 'entrar'],
      respuesta: '🔐 Puedes acceder a tu cuenta o crear una nueva en segundos desde nuestra página de <a href="login.html" class="fw-semibold text-primary">Acceso y Registro</a>. Es 100% gratuito para candidatos.'
    },
    {
      claves: ['hola', 'buenas', 'saludos', 'que tal', 'quien eres'],
      respuesta: '¡Hola! 👋 Soy <b>Chambita</b>, el asistente inteligente de ChambeaSV. ¿En qué te puedo apoyar hoy? Puedo ayudarte a buscar trabajo, mejorar tu CV o explicarte cómo funciona la plataforma.'
    }
  ],

  /**
   * Genera el HTML del widget e inyecta en el documento
   */
  render() {
    // Si ya existe en el DOM, no duplicar
    if (document.getElementById('chambita-widget-container')) return;

    const container = document.createElement('div');
    container.id = 'chambita-widget-container';
    container.innerHTML = `
      <!-- 1. Botón Flotante (Avatar con Ojos Móviles) -->
      <button class="chambita-fab" id="chambita-fab" aria-label="Abrir asistente virtual Chambita AI">
        <!-- Punto indicador en línea -->
        <span class="chambita-badge-online"></span>

        <!-- Tooltip que invita al clic -->
        <div class="chambita-tooltip-bubble">¿Necesitas chamba? ¡Pregúntame! 👋</div>

        <!-- SVG del Personaje Aislado del Logo -->
        <svg class="chambita-avatar-svg" id="chambita-avatar-svg" viewBox="32 30 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Brazo / Saludo en Verde Menta -->
          <path id="chambita-arm" d="M 39.5 44 C 38 53.5 43.5 62 53.5 62.5 C 61 63 66 57.5 67 51" 
                fill="none" stroke="#00D68F" stroke-width="7.5" stroke-linecap="round"/>
          
          <!-- Cabeza del Personaje -->
          <circle id="chambita-head" cx="53.5" cy="44.5" r="9.5" fill="#00D68F"/>
          
          <!-- Grupo de Ojos Móviles (Seguimiento del Ratón) -->
          <g id="chambita-eyes" class="chambita-eyes-group">
            <!-- Ojo Izquierdo -->
            <rect id="chambita-eye-l" x="50" y="42" width="2.4" height="4" rx="1.2" fill="#0B213F"/>
            <!-- Ojo Derecho -->
            <rect id="chambita-eye-r" x="54.6" y="42" width="2.4" height="4" rx="1.2" fill="#0B213F"/>
            <!-- Brillo de la mirada -->
            <circle cx="50.8" cy="42.8" r="0.45" fill="#FFFFFF"/>
            <circle cx="55.4" cy="42.8" r="0.45" fill="#FFFFFF"/>
          </g>
        </svg>
      </button>

      <!-- 2. Ventana de Chat Flotante (Glassmorphism) -->
      <div class="chambita-chat-window" id="chambita-chat-window" role="dialog" aria-labelledby="chambita-chat-title">
        <!-- Encabezado -->
        <div class="chambita-chat-header">
          <div class="chambita-header-info">
            <div class="chambita-avatar-small">
              <svg viewBox="32 30 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 39.5 44 C 38 53.5 43.5 62 53.5 62.5 C 61 63 66 57.5 67 51" fill="none" stroke="#00D68F" stroke-width="7.5" stroke-linecap="round"/>
                <circle cx="53.5" cy="44.5" r="9.5" fill="#00D68F"/>
                <rect x="50" y="42" width="2.4" height="4" rx="1.2" fill="#0B213F"/>
                <rect x="54.6" y="42" width="2.4" height="3.8" rx="1.2" fill="#0B213F"/>
              </svg>
            </div>
            <div class="chambita-header-text">
              <h6 id="chambita-chat-title">Chambita AI <span class="badge-ai">PRO</span></h6>
              <small><span class="dot-online"></span> En línea · Tu copiloto de empleo</small>
            </div>
          </div>
          <button class="chambita-btn-close" id="chambita-btn-close" aria-label="Cerrar chat">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Área de Mensajes con Scroll -->
        <div class="chambita-chat-messages" id="chambita-chat-messages">
          <!-- Tarjeta de Bienvenida Inicial -->
          <div class="chambita-welcome-card">
            <h6>¡Hola! Soy Chambita 👋</h6>
            <p>Tu asistente inteligente para guiarte en el mercado laboral salvadoreño.</p>
          </div>

          <!-- Mensaje inicial del Bot -->
          <div class="chambita-msg chambita-msg-bot">
            <div class="chambita-bubble">
              <p>¿En qué puedo ayudarte hoy? Elige una opción rápida o escribe tu consulta:</p>
              <div class="chambita-suggestions">
                <button type="button" class="chambita-chip-btn" data-query="¿Cómo buscar empleos remotos?">💻 Empleo remoto</button>
                <button type="button" class="chambita-chip-btn" data-query="Consejos para mi currículum">📄 Optimizar CV</button>
                <button type="button" class="chambita-chip-btn" data-query="¿Cómo publicar una vacante de empresa?">🏢 Publicar vacante</button>
                <button type="button" class="chambita-chip-btn" data-query="¿Cuáles son los salarios promedio?">💵 Salarios</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie de Entrada de Texto -->
        <div class="chambita-chat-footer">
          <form id="chambita-chat-form" class="chambita-input-wrapper">
            <input type="text" id="chambita-input" class="chambita-input-field" placeholder="Pregúntame lo que sea..." autocomplete="off">
            <button type="submit" class="chambita-btn-send" id="chambita-btn-send" aria-label="Enviar mensaje">
              <i class="bi bi-arrow-up-short" style="font-size: 1.5rem;"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  },

  /**
   * Conecta el evento mousemove para mover las pupilas según la posición del cursor
   */
  iniciarSeguimientoOcular() {
    const eyes = document.getElementById('chambita-eyes');
    const fab = document.getElementById('chambita-fab');
    if (!eyes || !fab) return;

    const maxEyeOffset = 3.2; // Máximo desplazamiento en píxeles SVG

    document.addEventListener('mousemove', (e) => {
      const rect = fab.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Intensidad graduada según la distancia al cursor
      const intensity = Math.min(distance / 250, 1);
      const offsetX = Math.cos(angle) * maxEyeOffset * intensity;
      const offsetY = Math.sin(angle) * maxEyeOffset * intensity;

      eyes.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    // Al salir el ratón de la ventana, regresa los ojos al centro
    document.addEventListener('mouseleave', () => {
      eyes.style.transform = 'translate(0px, 0px)';
    });

    // Efecto de parpadeo biológico cada 4.5 segundos
    setInterval(() => {
      eyes.classList.add('chambita-blink');
      setTimeout(() => {
        eyes.classList.remove('chambita-blink');
      }, 160);
    }, 4500);
  },

  /**
   * Alterna la visibilidad de la ventana del chat
   */
  toggleChat(abrir) {
    const ventana = document.getElementById('chambita-chat-window');
    if (!ventana) return;

    const debeAbrir = abrir !== undefined ? abrir : !this.activo;
    this.activo = debeAbrir;

    ventana.classList.toggle('active', this.activo);

    if (this.activo) {
      setTimeout(() => {
        document.getElementById('chambita-input')?.focus();
      }, 200);
    }
  },

  /**
   * Añade una burbuja de mensaje al historial
   */
  agregarMensaje(texto, remitente = 'bot') {
    const contenedor = document.getElementById('chambita-chat-messages');
    if (!contenedor) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chambita-msg chambita-msg-${remitente}`;
    msgDiv.innerHTML = `<div class="chambita-bubble">${texto}</div>`;

    contenedor.appendChild(msgDiv);
    contenedor.scrollTop = contenedor.scrollHeight;
  },

  /**
   * Muestra el indicador animado de "escribiendo..."
   */
  mostrarEscribiendo() {
    const contenedor = document.getElementById('chambita-chat-messages');
    if (!contenedor) return null;

    const indicador = document.createElement('div');
    indicador.id = 'chambita-typing';
    indicador.className = 'chambita-msg chambita-msg-bot';
    indicador.innerHTML = `
      <div class="chambita-typing-indicator">
        <span class="chambita-dot"></span>
        <span class="chambita-dot"></span>
        <span class="chambita-dot"></span>
      </div>
    `;

    contenedor.appendChild(indicador);
    contenedor.scrollTop = contenedor.scrollHeight;
    return indicador;
  },

  /**
   * Quita el indicador de "escribiendo..."
   */
  ocultarEscribiendo() {
    const indicador = document.getElementById('chambita-typing');
    if (indicador) indicador.remove();
  },

  /**
   * Procesa el mensaje del usuario enviándolo a la API con respaldo inteligente
   */
  async procesarMensaje(mensaje) {
    if (!mensaje || !mensaje.trim()) return;

    const textoLimpio = mensaje.trim();
    this.agregarMensaje(textoLimpio, 'user');

    const input = document.getElementById('chambita-input');
    const btnSend = document.getElementById('chambita-btn-send');
    if (input) input.value = '';
    if (btnSend) btnSend.disabled = true;

    this.mostrarEscribiendo();

    try {
      // 1. Intento de llamada al backend Express (POST /api/chat)
      let respuestaBot = null;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: textoLimpio })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.respuesta) {
            respuestaBot = data.respuesta;
          }
        }
      } catch (errApi) {
        // Si el endpoint aún no está implementado o falla, usamos el motor local
      }

      // 2. Si no hay respuesta del backend, resolver con el motor local inteligente
      if (!respuestaBot) {
        // Pausa natural de 750ms para simular razonamiento
        await new Promise((resolve) => setTimeout(resolve, 750));

        const queryLower = textoLimpio.toLowerCase();
        const coincidencia = this.respuestasInteligentes.find((item) =>
          item.claves.some((clave) => queryLower.includes(clave))
        );

        if (coincidencia) {
          respuestaBot = coincidencia.respuesta;
        } else {
          respuestaBot = `Entendido. Sobre <b>"${textoLimpio}"</b>, te sugiero explorar nuestra sección de <a href="empleos.html" class="fw-semibold text-primary">Búsqueda de Empleos</a> o registrarte en <a href="login.html" class="fw-semibold text-primary">ChambeaSV</a> para recibir alertas personalizadas. ¿Deseas que te oriente en algo más?`;
        }
      }

      this.ocultarEscribiendo();
      this.agregarMensaje(respuestaBot, 'bot');
    } catch (error) {
      this.ocultarEscribiendo();
      this.agregarMensaje('Disculpa, ocurrió un inconveniente temporal. Intenta de nuevo.', 'bot');
    } finally {
      if (btnSend) btnSend.disabled = false;
    }
  },

  /**
   * Inicialización del Chatbot
   */
  init() {
    // Si ya se inicializó antes, no hagas nada (evita clics dobles)
    if (this.inicializado) return;
    this.inicializado = true;

    this.render();
    this.iniciarSeguimientoOcular();

    // Delegación de eventos maestra para todos los clics del Chatbot
    document.addEventListener('click', (e) => {
      // 1. Clic en el botón flotante (incluyendo si hacen clic en el SVG interno)
      const fab = e.target.closest('#chambita-fab');
      if (fab) {
        this.toggleChat();
        return; // Detiene la ejecución para no evaluar lo demás
      }

      // 2. Clic en el botón de cerrar chat
      const btnClose = e.target.closest('#chambita-btn-close');
      if (btnClose) {
        this.toggleChat(false);
        return;
      }

      // 3. Clic en chips de preguntas sugeridas
      const chip = e.target.closest('.chambita-chip-btn');
      if (chip) {
        const query = chip.getAttribute('data-query');
        if (query) {
          this.procesarMensaje(query);
        }
      }
    });

    // Envío del formulario (Mantiene su propio listener)
    const form = document.getElementById('chambita-chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chambita-input');
        if (input && input.value.trim()) {
          this.procesarMensaje(input.value);
        }
      });
    }

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activo) {
        this.toggleChat(false);
      }
    });
  }
};

// Exponer globalmente en window
window.ChambitaChatbot = ChambitaChatbot;

// Autoarranque inmediato o al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ChambitaChatbot.init();
  });
} else {
  ChambitaChatbot.init();
}