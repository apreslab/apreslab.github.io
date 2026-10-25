(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#mobile-nav');
  if (toggle && nav) {
    const closeMenu = () => {toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');nav.hidden=true;};
    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
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
      buttonLabel.textContent = 'Sending...';
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
          throw new Error('FormSubmit did not confirm submission');
        }
        contactForm.reset();
        contactForm.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (error) {
        feedback.hidden = false;
        feedback.textContent = "We couldn't send your message. Please try again, or email us directly below.";
      } finally {
        submit.disabled = false;
        buttonLabel.textContent = 'Send message';
      }
    });
  }
})();