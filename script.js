(() => {
  'use strict';

  const invitation = document.querySelector('#invitation');
  const page = document.querySelector('#page');
  const enterButton = document.querySelector('#enter-button');
  const song = document.querySelector('#birthday-song');
  const player = document.querySelector('#music-player');
  const musicToggle = document.querySelector('#music-toggle');
  const artist = document.querySelector('#music-artist');
  const progress = document.querySelector('#music-progress');
  const wishButton = document.querySelector('#wish-button');
  const wishCaption = document.querySelector('#wish-caption');
  const wishBurst = document.querySelector('#wish-burst');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let entered = false;
  let wishTimer;

  page.inert = true;
  song.volume = 0.65;

  const updatePlayer = () => {
    const playing = !song.paused;
    player.classList.toggle('is-playing', playing);
    musicToggle.setAttribute('aria-label', playing ? 'Pausar canción' : 'Reproducir canción');
    musicToggle.setAttribute('aria-pressed', String(playing));
    if (playing) artist.textContent = 'Adèle Castillon';
  };

  const playSong = () => {
    // Keep play() directly in the user's click: this unlocks sound on mobile browsers.
    const playback = song.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch((error) => {
        if (error.name === 'AbortError') return;
        artist.textContent = 'Toca para escuchar ♡';
        updatePlayer();
      });
    }
  };

  enterButton.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    playSong();
    player.hidden = false;
    page.inert = false;
    document.documentElement.classList.add('entered');
    invitation.inert = true;
    document.querySelector('#hero-title').focus({ preventScroll: true });
    invitation.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => { invitation.hidden = true; }, reducedMotion.matches ? 0 : 850);
  });

  musicToggle.addEventListener('click', () => {
    if (song.paused) playSong();
    else song.pause();
  });

  song.addEventListener('play', updatePlayer);
  song.addEventListener('pause', updatePlayer);
  song.addEventListener('error', () => {
    artist.textContent = 'La canción no pudo cargar';
    updatePlayer();
  });
  song.addEventListener('timeupdate', () => {
    if (Number.isFinite(song.duration) && song.duration > 0) {
      progress.style.width = `${(song.currentTime / song.duration) * 100}%`;
    }
  });

  wishButton.addEventListener('click', () => {
    wishButton.classList.add('wished');
    wishButton.setAttribute('aria-label', 'Volver a pedir un deseo');
    wishCaption.textContent = 'Que se te cumpla, Pau. Te lo mereces todo. ♡';
    window.clearTimeout(wishTimer);
    wishBurst.replaceChildren();
    if (reducedMotion.matches) return;

    // Anchor the little constellation to the star, at every screen size.
    const sectionBox = wishButton.closest('section').getBoundingClientRect();
    const buttonBox = wishButton.getBoundingClientRect();
    wishBurst.style.left = `${buttonBox.left - sectionBox.left + buttonBox.width / 2}px`;
    wishBurst.style.top = `${buttonBox.top - sectionBox.top + buttonBox.height / 2}px`;

    const colors = ['#e4bdda', '#c9b4eb', '#f5e1ba', '#f7e9f2'];
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 25; index += 1) {
      const angle = (index / 25) * Math.PI * 2;
      const distance = 65 + Math.random() * 150;
      const particle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#spark');
      particle.append(use);
      particle.classList.add('wish-particle');
      particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--size', `${5 + Math.random() * 12}px`);
      particle.style.setProperty('--color', colors[index % colors.length]);
      particle.style.setProperty('--rotation', `${Math.random() * 180}deg`);
      fragment.append(particle);
    }
    wishBurst.append(fragment);
    wishTimer = window.setTimeout(() => wishBurst.replaceChildren(), 1900);
  });

  // The modal has one action. Keep keyboard navigation inside it until it opens.
  invitation.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !entered) {
      event.preventDefault();
      enterButton.focus();
    }
  });

  window.addEventListener('pageshow', updatePlayer);
})();
