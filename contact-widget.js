(() => {
  const launcher = document.querySelector('#contactLauncher');
  const panel = document.querySelector('#contactPanel');
  const closeButton = document.querySelector('#contactClose');
  const formTab = document.querySelector('#contactTabForm');
  const chatTab = document.querySelector('#contactTabChat');
  const formPanel = document.querySelector('#contactFormPanel');
  const chatPanel = document.querySelector('#setterChatPanel');
  const contactForm = document.querySelector('#websiteContactForm');
  const contactStatus = document.querySelector('#contactFormStatus');
  const chatStartForm = document.querySelector('#setterStartForm');
  const chatMessageForm = document.querySelector('#setterMessageForm');
  const chatConversation = document.querySelector('#chatConversation');
  const chatStatus = document.querySelector('#chatStatus');
  const chatMessage = document.querySelector('#setterMessage');
  let sessionToken = '';
  let chatDisabled = false;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) closeButton.focus();
    else launcher.focus();
  }

  function selectTab(tab) {
    const showChat = tab === 'chat';
    formTab.classList.toggle('is-active', !showChat);
    chatTab.classList.toggle('is-active', showChat);
    formTab.setAttribute('aria-selected', String(!showChat));
    chatTab.setAttribute('aria-selected', String(showChat));
    formPanel.hidden = showChat;
    chatPanel.hidden = !showChat;
    (showChat ? chatStartForm : contactForm).querySelector('input,textarea')?.focus();
  }

  function appendMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'is-user' : 'is-assistant'}`;
    bubble.textContent = text;
    chatConversation.append(bubble);
    chatConversation.scrollTop = chatConversation.scrollHeight;
  }

  async function postJson(path, body) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
    return data;
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  closeButton.addEventListener('click', () => setOpen(false));
  formTab.addEventListener('click', () => selectTab('form'));
  chatTab.addEventListener('click', () => selectTab('chat'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = contactForm.querySelector('[type="submit"]');
    const values = Object.fromEntries(new FormData(contactForm).entries());
    submit.disabled = true;
    contactStatus.textContent = 'Enviando tu consulta…';
    try {
      await postJson('/api/site-contact', values);
      contactForm.reset();
      contactStatus.textContent = 'Gracias. Recibimos tu consulta y nos pondremos en contacto.';
    } catch (error) {
      contactStatus.textContent = 'No pudimos enviar el mensaje. Probá por WhatsApp o intentá nuevamente.';
    } finally {
      submit.disabled = false;
    }
  });

  chatStartForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(chatStartForm).entries());
    if (!values.email.trim() && !values.phone.trim()) {
      chatStatus.textContent = 'Dejanos un correo o un teléfono para poder identificar la conversación.';
      return;
    }
    const submit = chatStartForm.querySelector('[type="submit"]');
    submit.disabled = true;
    chatStatus.textContent = 'El asistente está preparando una respuesta…';
    try {
      const data = await postJson('/api/site-chat', values);
      sessionToken = data.sessionToken || '';
      appendMessage(values.message, 'user');
      chatStartForm.hidden = true;
      chatConversation.hidden = false;
      if (data.reply) {
        appendMessage(data.reply, 'assistant');
        chatMessageForm.hidden = false;
        chatStatus.textContent = '';
        chatMessage.focus();
      } else {
        chatDisabled = true;
        chatStatus.textContent = 'El asistente no está disponible en este momento. Podés dejarnos tus datos o continuar por WhatsApp.';
      }
    } catch (error) {
      chatStatus.textContent = 'No se pudo iniciar el chat. Probá por WhatsApp o intentá nuevamente.';
      submit.disabled = false;
    }
  });

  chatMessageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!sessionToken || chatDisabled) return;
    const message = chatMessage.value.trim();
    if (!message) return;
    const submit = chatMessageForm.querySelector('[type="submit"]');
    submit.disabled = true;
    appendMessage(message, 'user');
    chatMessage.value = '';
    chatStatus.textContent = 'El asistente está escribiendo…';
    try {
      const data = await postJson('/api/site-chat', { sessionToken, message });
      if (data.reply) {
        appendMessage(data.reply, 'assistant');
        chatStatus.textContent = '';
      } else {
        chatDisabled = true;
        chatMessageForm.hidden = true;
        chatStatus.textContent = 'El asistente no está disponible en este momento. Podés continuar por WhatsApp.';
      }
    } catch (error) {
      chatStatus.textContent = 'No se pudo enviar el mensaje. Intentá nuevamente.';
    } finally {
      submit.disabled = false;
    }
  });
})();
