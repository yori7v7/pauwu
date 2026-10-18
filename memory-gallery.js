(() => {
  'use strict';

  const gallery = document.querySelector('.memory-gallery');
  const deck = document.querySelector('#memory-deck');
  const cards = [...deck.querySelectorAll('.memory-card')];
  const previous = document.querySelector('#memory-previous');
  const next = document.querySelector('#memory-next');
  const autoplay = document.querySelector('#memory-autoplay');
  const counter = document.querySelector('#memory-count');
  const hint = document.querySelector('#memory-hint');
  const note = document.querySelector('#memory-note');
  const status = document.querySelector('#memory-status');
  const video = document.querySelector('#paleta-video');
  const sound = document.querySelector('#video-sound');
  const song = document.querySelector('#birthday-song');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const last = cards.length - 1;
  let current = 0;
  let opened = false;
  let visible = false;
  let automatic = !reducedMotion.matches;
  let hovered = false;
  let transitioning = false;
  let advanceTimer;
  let transitionTimer;
  let resumeMusic = false;
  let videoPending = false;
  let videoSuspended = false;
  let pointer = null;

  video.muted = true;
  deck.querySelectorAll('img').forEach((image) => { image.draggable = false; });

  const restoreMusic = () => {
    if (!resumeMusic) return;
    resumeMusic = false;
    song.play().catch(() => {});
  };

  const balanceSound = () => {
    const hasSound = !video.muted && video.volume > 0;
    sound.setAttribute('aria-pressed', String(hasSound));
    sound.setAttribute('aria-label', hasSound ? 'Silenciar video' : 'Escuchar el video');
    sound.querySelector('span').textContent = hasSound ? 'silenciar recuerdo' : 'escuchar este recuerdo';
    if (hasSound && !video.paused && !video.ended) {
      if (!song.paused) {
        resumeMusic = true;
        song.pause();
      }
    } else {
      restoreMusic();
    }
  };

  const playVideo = () => {
    if (!opened || !visible || document.hidden || current !== last) return;
    videoPending = false;
    videoSuspended = false;
    video.play().catch(() => {
      // A muted inline video can autoplay on phones; native controls remain as a fallback.
      if (!video.muted) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });
  };

  const suspendVideo = () => {
    if (!video.paused && !video.ended) {
      videoSuspended = true;
      video.pause();
    }
  };

  const schedule = () => {
    window.clearTimeout(advanceTimer);
    const focused = gallery.contains(document.activeElement) && document.activeElement !== autoplay;
    if (!opened || !visible || document.hidden || !automatic || hovered || focused || current === last || transitioning || pointer) return;
    advanceTimer = window.setTimeout(() => show(current + 1, false), 6500);
  };

  const update = () => {
    cards.forEach((card, index) => {
      card.dataset.position = String((index - current + cards.length) % cards.length);
      card.inert = index !== current;
      if (index === current) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    });
    counter.innerHTML = `${String(current + 1).padStart(2, '0')} <span>/ ${String(cards.length).padStart(2, '0')}</span>`;
    previous.disabled = current === 0;
    next.setAttribute('aria-label', current === last ? 'Volver al primer recuerdo' : 'Siguiente recuerdo');
    autoplay.classList.toggle('is-paused', !automatic || current === last);
    autoplay.setAttribute('aria-pressed', String(automatic && current !== last));
    autoplay.setAttribute('aria-label', current === last ? 'Volver a ver los recuerdos' : automatic ? 'Pausar pase de recuerdos' : 'Reproducir pase de recuerdos');
    hint.textContent = current === last ? 'un recuerdo en movimiento' : 'desliza los recuerdos';
    note.classList.toggle('paleta-note', current === last);
    note.textContent = current === last
      ? 'y para la próxima que nos veamos o celebremos otro cumple, porfa no tires nuestra paleta otra vez JAJA 😭🍭'
      : 'y todavía nos faltan muchos más.';
  };

  const show = (index, manual = true) => {
    if (transitioning || index < 0 || index > last) return;
    if (index === current) { schedule(); return; }
    window.clearTimeout(advanceTimer);
    const outgoing = cards[current];
    const forward = index > current;
    if (manual) automatic = false;
    if (current === last) {
      videoPending = false;
      videoSuspended = false;
      video.pause();
      restoreMusic();
      video.currentTime = 0;
    }
    outgoing.style.setProperty('--exit-x', forward ? '-110%' : '110%');
    outgoing.style.setProperty('--exit-rotation', forward ? '-18deg' : '20deg');
    outgoing.classList.add('is-leaving');
    transitioning = true;
    current = index;
    update();
    if (manual) status.textContent = cards[current].getAttribute('aria-label');
    if (current === last) {
      video.currentTime = 0;
      videoPending = true;
      playVideo();
    }
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      outgoing.classList.remove('is-leaving');
      transitioning = false;
      schedule();
    }, reducedMotion.matches ? 0 : 740);
  };

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current === last ? 0 : current + 1));
  autoplay.addEventListener('click', () => {
    if (transitioning) return;
    if (current === last) {
      show(0, false);
      automatic = true;
    } else {
      automatic = !automatic;
    }
    if (automatic) hovered = false;
    update();
    schedule();
  });

  deck.addEventListener('keydown', (event) => {
    if (event.target.closest('video, button')) return;
    const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    show(destinations[event.key]);
  });

  deck.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || event.target.closest('video, button') || transitioning) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, drag: false };
    window.clearTimeout(advanceTimer);
  });
  deck.addEventListener('pointermove', (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!pointer.drag && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      pointer.drag = true;
      deck.setPointerCapture(event.pointerId);
      deck.classList.add('is-dragging');
    }
    if (!pointer.drag) return;
    const offset = Math.max(-130, Math.min(130, dx));
    cards[current].style.transform = `translate3d(${offset}px, 0, 35px) rotate(${5 + offset / 22}deg)`;
  });
  const finishDrag = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const advance = pointer.drag && Math.abs(dx) > 45 && event.type !== 'pointercancel';
    pointer = null;
    deck.classList.remove('is-dragging');
    cards[current].style.removeProperty('transform');
    if (deck.hasPointerCapture(event.pointerId)) deck.releasePointerCapture(event.pointerId);
    if (advance) show(dx < 0 ? Math.min(last, current + 1) : Math.max(0, current - 1));
    else schedule();
  };
  deck.addEventListener('pointerup', finishDrag);
  deck.addEventListener('pointercancel', finishDrag);
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);

  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
    if (video.paused || video.ended) video.play().catch(() => {});
    balanceSound();
  });
  video.addEventListener('volumechange', balanceSound);
  video.addEventListener('play', () => {
    videoPending = false;
    videoSuspended = false;
    balanceSound();
  });
  video.addEventListener('pause', restoreMusic);
  video.addEventListener('ended', restoreMusic);
  song.addEventListener('play', () => {
    if (!video.paused && !video.muted) {
      resumeMusic = false;
      video.muted = true;
    }
  });

  gallery.addEventListener('mouseenter', () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    hovered = true;
    window.clearTimeout(advanceTimer);
  });
  gallery.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  gallery.addEventListener('focusin', () => window.clearTimeout(advanceTimer));
  gallery.addEventListener('focusout', () => window.setTimeout(schedule, 0));

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
    if (!visible) suspendVideo();
    else if (current === last && (videoPending || videoSuspended)) playVideo();
    schedule();
  }, { threshold: 0.45 }).observe(deck);

  document.addEventListener('birthday:opened', () => { opened = true; schedule(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspendVideo();
    else if (current === last && (videoPending || videoSuspended)) playVideo();
    schedule();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) automatic = false;
    update();
    schedule();
  });

  update();
})();
