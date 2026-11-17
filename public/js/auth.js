/**
 * ============================================================
 *  ChambeaSV - Módulo de Autenticación y Registro (Vanilla JS)
 * ============================================================
 *  Punto único de autenticación para la página login.html.
 *  - Detección del parámetro ?mode=register
 *  - Transición fluida (slide/fade) entre Login y Registro
 *  - Llamadas a la API REST (/api/usuarios/login y /registro)
 *  - Manejo de sesión activa (tl_sesion) y redirección por rol
 * ============================================================
 */

const AuthModule = {
  /**
   * Cambia dinámicamente entre el formulario de Login y Registro
   * aplicando una transición suave y sincronizando la URL del navegador.
   *
   * @param {'login'|'register'} modo - El modo a activar
   * @param {boolean} actualizarUrl - Si debe actualizar el historial del navegador
   */
  setModo(modo, actualizarUrl = true) {
    const esRegistro = modo === 'register' || modo === 'registro';

    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegistro = document.getElementById('tab-registro-btn');
    const paneLogin = document.getElementById('pane-auth-login');
    const paneRegistro = document.getElementById('pane-auth-registro');
    const titleEl = document.getElementById('auth-page-title');
    const subtitleEl = document.getElementById('auth-page-subtitle');

    if (!paneLogin || !paneRegistro) return;

    // 1. Limpiar alertas activas
    AuthModule.ocultarAlerta('auth-login-alert');
    AuthModule.ocultarAlerta('auth-registro-alert');

    // 2. Actualizar estado de las pestañas
    if (tabLogin && tabRegistro) {
      tabLogin.classList.toggle('active', !esRegistro);
      tabRegistro.classList.toggle('active', esRegistro);
    }

    // 3. Transición fluida entre paneles
    if (esRegistro) {
      paneLogin.classList.remove('active');
      paneRegistro.classList.add('active');

      if (titleEl) titleEl.textContent = 'Crea tu cuenta en ChambeaSV';
      if (subtitleEl) subtitleEl.textContent = 'Únete a la mayor red de empleo de El Salvador y haz despegar tu futuro profesional.';
      document.title = 'Crear Cuenta | ChambeaSV - Tu Comunidad Profesional';

      if (actualizarUrl) {
        window.history.pushState({ mode: 'register' }, '', '?mode=register');
      }
    } else {
      paneRegistro.classList.remove('active');
      paneLogin.classList.add('active');

      if (titleEl) titleEl.textContent = '¡Te damos la bienvenida a tu comunidad profesional!';
      if (subtitleEl) subtitleEl.textContent = 'Conecta con oportunidades laborales de calidad o encuentra al mejor talento de El Salvador.';
      document.title = 'Iniciar Sesión | ChambeaSV - Tu Comunidad Profesional';

      if (actualizarUrl) {
        window.history.pushState({ mode: 'login' }, '', 'login.html');
      }
    }
  },

  /**
   * Lee la URL actual y activa el formulario correspondiente
   */
  sincronizarDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const mode = (params.get('mode') || '').toLowerCase();
    const esRegistro = mode === 'register' || mode === 'registro';
    AuthModule.setModo(esRegistro ? 'register' : 'login', false);
  },

  /**
   * Envía la solicitud de inicio de sesión al backend
   */
  async login(email, password) {
    const res = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'No fue posible iniciar sesión. Verifica tus credenciales.');
    }

    // Guardar sesión activa con formato compatible con el resto del portal
    const usuario = data.usuario;
    const sesion = {
      id: usuario.id,
      nombre: `${usuario.nombre} ${usuario.apellidos || ''}`.trim(),
      email: usuario.email,
      rol: usuario.rol
    };

    // Guardar token JWT y datos de sesión
    if (data.token) localStorage.setItem('tl_token', data.token);
    localStorage.setItem('tl_sesion', JSON.stringify(sesion));
    return sesion;
  },

  /**
   * Envía la solicitud de registro de nuevo usuario al backend
   */
  async registro(payload) {
    const res = await fetch('/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'No fue posible registrar la cuenta.');
    }

    // Iniciar sesión automáticamente tras el registro exitoso
    const usuario = data.usuario;
    const sesion = {
      id: usuario.id,
      nombre: `${usuario.nombre} ${usuario.apellidos || ''}`.trim(),
      email: usuario.email,
      rol: usuario.rol
    };

    // Guardar token JWT y datos de sesión
    if (data.token) localStorage.setItem('tl_token', data.token);
    localStorage.setItem('tl_sesion', JSON.stringify(sesion));
    return sesion;
  },

  /**
   * Redirecciona al usuario según su rol tras iniciar sesión
   */
  redireccionarPorRol(rol) {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }

    if (rol === 'admin') {
      window.location.href = 'admin.html';
    } else if (rol === 'empresa') {
      window.location.href = 'empresa.html';
    } else {
      window.location.href = 'perfil.html';
    }
  },

  /**
   * Muestra mensaje de alerta en el contenedor especificado
   */
  mostrarAlerta(containerId, mensaje, tipo = 'danger') {
    const contenedor = document.getElementById(containerId);
    if (!contenedor) return;

    contenedor.className = `auth-alert alert alert-${tipo} show`;
    const icono = tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    contenedor.innerHTML = `<i class="bi ${icono} fs-5"></i><span>${mensaje}</span>`;
  },

  /**
   * Oculta el mensaje de alerta
   */
  ocultarAlerta(containerId) {
    const contenedor = document.getElementById(containerId);
    if (contenedor) {
      contenedor.className = 'auth-alert';
      contenedor.innerHTML = '';
    }
  },

  /**
   * Alterna la visibilidad de una contraseña en el input
   */
  toggleVisibilidad(inputId, boton) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const esPassword = input.type === 'password';
    input.type = esPassword ? 'text' : 'password';
    boton.innerHTML = `<i class="bi ${esPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i>`;
  },

  /**
   * Autocompleta credenciales de demostración para evaluación rápida
   */
  autocompletar(email, password = '123456') {
    const inputEmail = document.getElementById('login-email-input');
    const inputPass = document.getElementById('login-pass-input');
    if (inputEmail && inputPass) {
      AuthModule.setModo('login', true);
      inputEmail.value = email;
      inputPass.value = password;
      inputEmail.focus();
    }
  },

  /**
   * Inicializa los escuchadores de eventos
   */
  init() {
    // 1. Sincronizar estado inicial según la URL (?mode=register)
    AuthModule.sincronizarDesdeURL();

    // 2. Soporte para botones de navegación del navegador (Atrás / Adelante)
    window.addEventListener('popstate', () => {
      AuthModule.sincronizarDesdeURL();
    });

    // 3. Conmutador de Pestañas
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegistro = document.getElementById('tab-registro-btn');
    if (tabLogin) {
      tabLogin.addEventListener('click', () => AuthModule.setModo('login'));
    }
    if (tabRegistro) {
      tabRegistro.addEventListener('click', () => AuthModule.setModo('register'));
    }

    // 4. Enlaces directos para alternar entre formularios
    const linkARegistro = document.getElementById('link-a-registro');
    if (linkARegistro) {
      linkARegistro.addEventListener('click', (e) => {
        e.preventDefault();
        AuthModule.setModo('register');
      });
    }

    const linkALogin = document.getElementById('link-a-login');
    if (linkALogin) {
      linkALogin.addEventListener('click', (e) => {
        e.preventDefault();
        AuthModule.setModo('login');
      });
    }

    // 5. Envío del Formulario de Inicio de Sesión
    const formLogin = document.getElementById('form-auth-login');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formLogin.querySelector('button[type="submit"]');
        const emailInput = document.getElementById('login-email-input');
        const passInput = document.getElementById('login-pass-input');

        AuthModule.ocultarAlerta('auth-login-alert');

        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!email || !password) {
          AuthModule.mostrarAlerta('auth-login-alert', 'Por favor, ingresa tu correo y contraseña.', 'warning');
          return;
        }

        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';

        try {
          const sesion = await AuthModule.login(email, password);
          AuthModule.mostrarAlerta('auth-login-alert', `¡Bienvenido(a), ${sesion.nombre}! Redirigiendo...`, 'success');
          setTimeout(() => AuthModule.redireccionarPorRol(sesion.rol), 700);
        } catch (err) {
          AuthModule.mostrarAlerta('auth-login-alert', err.message, 'danger');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      });
    }

    // 6. Envío del Formulario de Registro
    const formRegistro = document.getElementById('form-auth-registro');
    if (formRegistro) {
      formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formRegistro.querySelector('button[type="submit"]');
        AuthModule.ocultarAlerta('auth-registro-alert');

        const nombre = document.getElementById('reg-nombre-input').value.trim();
        const email = document.getElementById('reg-email-input').value.trim();
        const password = document.getElementById('reg-pass-input').value;
        const rolInput = document.querySelector('input[name="auth-reg-rol"]:checked');
        const rol = rolInput ? rolInput.value : 'candidato';

        if (!nombre || !email || !password) {
          AuthModule.mostrarAlerta('auth-registro-alert', 'Por favor, completa todos los campos requeridos.', 'warning');
          return;
        }

        if (password.length < 6) {
          AuthModule.mostrarAlerta('auth-registro-alert', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
          return;
        }

        const partes = nombre.split(' ');
        const primerNombre = partes[0] || '';
        const apellidos = partes.slice(1).join(' ');

        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';

        try {
          const sesion = await AuthModule.registro({
            nombre: primerNombre,
            apellidos,
            email,
            password,
            rol
          });

          AuthModule.mostrarAlerta('auth-registro-alert', '¡Tu cuenta ha sido creada con éxito! Redirigiendo...', 'success');
          setTimeout(() => AuthModule.redireccionarPorRol(sesion.rol), 700);
        } catch (err) {
          AuthModule.mostrarAlerta('auth-registro-alert', err.message, 'danger');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
        }
      });
    }

    // 7. Botones de Mostrar/Ocultar contraseña
    document.querySelectorAll('.auth-toggle-pass').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        AuthModule.toggleVisibilidad(targetId, btn);
      });
    });
  }
};

// Inicialización automática al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  AuthModule.init();
});
