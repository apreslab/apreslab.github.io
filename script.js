(() => {
  const isSpanish = document.documentElement.lang.toLowerCase().startsWith('es');

  // Keep the current section when switching between English and Spanish.
  document.querySelectorAll('.language-switch a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = window.location.hash;
      if (!hash || !/^#(?:home|about|services|contact)$/.test(hash)) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.location.assign(link.href.split('#')[0] + hash);
    });
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#mobile-nav');
  if (toggle && nav) {
    const closeMenu = () => {toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',isSpanish ? 'Abrir menú' : 'Open navigation');nav.hidden=true;};
    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.setAttribute('aria-label', willOpen ? (isSpanish ? 'Cerrar menú' : 'Close navigation') : (isSpanish ? 'Abrir menú' : 'Open navigation'));
      nav.hidden = !willOpen;
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if(event.key==='Escape') closeMenu(); });
    window.addEventListener('resize', () => { if(window.innerWidth > 640) closeMenu(); });
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // FormSubmit processes the inquiry; never show a success message based on HTTP 200
  // alone (the provider can return 200 with success: "false" for an unactivated form).
  const formCopy = isSpanish ? {
    sending: 'Enviando...',
    send: 'Enviar mensaje',
    error: 'No pudimos enviar tu mensaje. Volvé a intentarlo o escribinos directamente al correo que aparece debajo.',
    activation: 'Estamos activando el formulario. Por ahora, escribinos directamente al correo que aparece debajo.'
  } : {
    sending: 'Sending...',
    send: 'Send message',
    error: "We couldn't send your message. Please try again, or email us directly below.",
    activation: 'Our contact form is being activated. For now, please email us directly below.'
  };
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const submit = contactForm.querySelector('button[type="submit"]');
    const buttonLabel = contactForm.querySelector('.contact-form__button-label');
    const feedback = document.querySelector('#contact-form-error');
    const success = document.querySelector('#contact-form-success');
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      feedback.hidden = true;
      submit.disabled = true;
      buttonLabel.textContent = formCopy.sending;
      let failureMessage = formCopy.error;
      try {
        const data = Object.fromEntries(new FormData(contactForm).entries());
        const endpoint = new URL(contactForm.action);
        endpoint.pathname = '/ajax' + endpoint.pathname;
        const response = await fetch(endpoint.href, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok || (result.success !== true && result.success !== 'true')) {
          const providerMessage = typeof result.message === 'string' ? result.message : '';
          if (/activat(?:e|ion|ed)/i.test(providerMessage)) {
            failureMessage = formCopy.activation;
          }
          throw new Error('FormSubmit did not confirm submission');
        }
        contactForm.reset();
        contactForm.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (error) {
        feedback.hidden = false;
        feedback.textContent = failureMessage;
      } finally {
        submit.disabled = false;
        buttonLabel.textContent = formCopy.send;
      }
    });
  }
})();