(function () {
  'use strict';

  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var MESSAGES = {
    demo: '¡Listo! Te contactamos en menos de 24 horas para agendar tu demo.',
    guia: '¡Listo! Revisa tu correo: la guía llega en los próximos minutos.',
    estandar: 'Excelente elección. Solicita tu demo y te mostramos el plan Estándar en vivo.'
  };

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 4200);
  }

  function clearFieldError(input) {
    var wrapper = input.closest('form');
    if (!wrapper) return;
    var errorEl = wrapper.querySelector('.field-error');
    if (errorEl) errorEl.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function setFieldError(input, message) {
    var wrapper = input.closest('form');
    if (!wrapper) return;
    var errorEl = wrapper.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      wrapper.appendChild(errorEl);
    }
    errorEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  /* ---------- Formularios de solicitud de demo / guía ---------- */
  var demoForms = document.querySelectorAll('.demo-form');

  demoForms.forEach(function (form) {
    var input = form.querySelector('input[type="email"]');

    if (input) {
      input.addEventListener('input', function () {
        clearFieldError(input);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!input) return;

      var value = input.value.trim();

      if (!value || !EMAIL_RE.test(value)) {
        setFieldError(input, 'Ingresa un correo electrónico válido.');
        input.focus();
        return;
      }

      clearFieldError(input);
      var toastKey = form.getAttribute('data-toast') || 'demo';
      showToast(MESSAGES[toastKey] || MESSAGES.demo);
      form.reset();
    });
  });

  /* ---------- Botones de planes de precios ---------- */
  var planButtons = document.querySelectorAll('.price-card__cta');

  planButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var plan = button.getAttribute('data-plan');
      showToast(MESSAGES[plan] || MESSAGES.demo);
    });
  });
})();
