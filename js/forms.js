(function () {
  'use strict';

  var BACKEND_URL = 'http://localhost:3000';

  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var selectedPlan = null;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var MESSAGES = {
    demo: '¡Listo! Te contactamos en menos de 24 horas para agendar tu demo.',
    guia: '¡Listo! Revisa tu correo: la guía llega en los próximos minutos.',
    estandar: 'Excelente elección. Solicita tu demo y te mostramos el plan Estándar en vivo.',
    error: 'No pudimos enviar el formulario. Intenta de nuevo en un momento.'
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

  function submitLead(payload) {
    return fetch(BACKEND_URL + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  /* ---------- Formularios de solicitud de demo / guía ---------- */
  var demoForms = document.querySelectorAll('.demo-form');

  demoForms.forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="empresa"]');
    var submitBtn = form.querySelector('button[type="submit"]');

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
      if (submitBtn) submitBtn.disabled = true;

      var source = form.getAttribute('data-source') || 'cta';
      var plan = source === 'cta' ? selectedPlan : null;

      submitLead({
        email: value,
        source: plan ? 'precios' : source,
        plan: plan,
        empresa: honeypot ? honeypot.value : ''
      }).then(function () {
        var toastKey = form.getAttribute('data-toast') || 'demo';
        showToast(MESSAGES[toastKey] || MESSAGES.demo);
        form.reset();
        if (plan) {
          selectedPlan = null;
        }
      }).catch(function () {
        showToast(MESSAGES.error);
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  });

  /* ---------- Botones de planes de precios ---------- */
  var planButtons = document.querySelectorAll('.price-card__cta');
  var ctaForm = document.getElementById('cta-form');

  planButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var plan = button.getAttribute('data-plan');
      selectedPlan = plan;
      showToast(MESSAGES[plan] || MESSAGES.demo);
      if (ctaForm) {
        ctaForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var ctaEmail = ctaForm.querySelector('input[type="email"]');
        if (ctaEmail) ctaEmail.focus();
      }
    });
  });
})();
