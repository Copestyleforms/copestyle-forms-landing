(function () {
  'use strict';

  var BACKEND_URL = 'https://copestyle-leads-backend.up.railway.app';

  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var selectedPlan = null;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;

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
    var emailInput = form.querySelector('input[type="email"]');
    var phoneInput = form.querySelector('input[type="tel"]');
    var methodRadios = form.querySelectorAll('input[name="contactMethod"]');
    var honeypot = form.querySelector('input[name="empresa"]');
    var submitBtn = form.querySelector('button[type="submit"]');

    function currentMethod() {
      if (!methodRadios.length) return 'email';
      var checked = form.querySelector('input[name="contactMethod"]:checked');
      return checked ? checked.value : 'email';
    }

    function syncContactMethod() {
      if (!methodRadios.length) return;
      var method = currentMethod();

      methodRadios.forEach(function (radio) {
        var option = radio.closest('.contact-toggle__option');
        if (option) option.classList.toggle('is-active', radio.value === method);
      });

      if (emailInput) {
        emailInput.classList.toggle('is-hidden', method !== 'email');
        emailInput.required = method === 'email';
      }
      if (phoneInput) {
        phoneInput.classList.toggle('is-hidden', method !== 'whatsapp');
        phoneInput.required = method === 'whatsapp';
      }
    }

    methodRadios.forEach(function (radio) {
      radio.addEventListener('change', syncContactMethod);
    });
    syncContactMethod();

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        clearFieldError(emailInput);
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        clearFieldError(phoneInput);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var method = currentMethod();
      var activeInput = method === 'whatsapp' ? phoneInput : emailInput;
      if (!activeInput) return;

      var value = activeInput.value.trim();
      var isValid = method === 'whatsapp' ? PHONE_RE.test(value) : EMAIL_RE.test(value);

      if (!value || !isValid) {
        setFieldError(
          activeInput,
          method === 'whatsapp' ? 'Ingresa un número de WhatsApp válido.' : 'Ingresa un correo electrónico válido.'
        );
        activeInput.focus();
        return;
      }

      clearFieldError(activeInput);
      if (submitBtn) submitBtn.disabled = true;

      var source = form.getAttribute('data-source') || 'cta';
      var plan = source === 'cta' ? selectedPlan : null;

      submitLead({
        email: method === 'email' ? value : null,
        phone: method === 'whatsapp' ? value : null,
        contactMethod: method,
        source: plan ? 'precios' : source,
        plan: plan,
        empresa: honeypot ? honeypot.value : ''
      }).then(function () {
        var toastKey = form.getAttribute('data-toast') || 'demo';
        showToast(MESSAGES[toastKey] || MESSAGES.demo);
        form.reset();
        syncContactMethod();
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
        var checkedMethod = ctaForm.querySelector('input[name="contactMethod"]:checked');
        var activeSelector = checkedMethod && checkedMethod.value === 'whatsapp' ? 'input[type="tel"]' : 'input[type="email"]';
        var ctaActiveInput = ctaForm.querySelector(activeSelector);
        if (ctaActiveInput) ctaActiveInput.focus();
      }
    });
  });
})();
