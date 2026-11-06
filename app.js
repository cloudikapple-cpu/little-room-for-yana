(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const stage = $('roomStage');
  const character = $('character');
  const characterImage = $('characterImage');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 620px)');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  let toastTimer, speechTimer, characterIndex = 0, seated = false, suppressCharClick = false;
  let lastFocused = null;
  let dreamsMounted = false;

  const characterLines = [
    'Пока репетировал речь, вырос букет.',
    'Можно меня на диван? Ноги затекли.',
    'Так. Главное — не уронить цветы.',
    'Баклан, я тут с цветами вообще-то.',
    'Нёс букет. Принёс целую клумбу.',
    'У меня тут всё очень волнительно.',
    'Кот, осторожно: я маленький, а чувства большие.'
  ];

  function toast(text) {
    clearTimeout(toastTimer);
    $('toast').textContent = text;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4300);
  }
  function speak(text) {
    clearTimeout(speechTimer);
    const bubble = $('characterBubble');
    bubble.textContent = text;
    const x = parseFloat(getComputedStyle(character).left) / stage.clientWidth * 100;
    bubble.style.left = x < 22 ? '100%' : x > 75 ? '0%' : '50%';
    $('characterAnnouncement').textContent = text;
    character.classList.add('speaking');
    speechTimer = setTimeout(() => character.classList.remove('speaking'), 4500);
  }
  function bounce() {
    character.classList.remove('bounce');
    void character.offsetWidth;
    character.classList.add('bounce');
    setTimeout(() => character.classList.remove('bounce'), 750);
  }
  function haptic(ms = 18) { if (navigator.vibrate) navigator.vibrate(ms); }

  function openDialog(id) {
    const dialog = $(id);
    const previous = document.querySelector('dialog[open]');
    if (previous) previous.close();
    if (!previous) lastFocused = document.activeElement;
    if (id === 'dreamsDialog') {
      if (window.RoomDreams && !dreamsMounted) { window.RoomDreams.mount($('dreamMount')); dreamsMounted = true; }
      else if (!window.RoomDreams) $('dreamMount').textContent = 'Проектор загружается. Попробуй открыть его ещё раз.';
    }
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    syncRain();
  }
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) {
        document.body.style.overflow = '';
        syncRain();
        if (lastFocused && lastFocused.isConnected) lastFocused.focus({ preventScroll: true });
      }
    });
  });
  $('helpOpen').addEventListener('click', () => openDialog('helpDialog'));
  $('letterOpen').addEventListener('click', () => openDialog('letterDialog'));
  $('projectorOpen').addEventListener('click', () => { openDialog('dreamsDialog'); chime(); });
  $('doorOpen').addEventListener('click', () => { openDialog('universeDialog'); chime(); });
  $('letterHug').addEventListener('click', () => openDialog('universeDialog'));
  document.querySelector('.brand').addEventListener('click', (event) => {
    event.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });
  $('enterRoom').addEventListener('click', () => {
    $('roomFrame').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    speak('Кот, ты пришла. Букет чуть не перевесил меня.');
  });
  document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.open;
    if (action === 'gift') openBox();
    else openDialog({ letter: 'letterDialog', dreams: 'dreamsDialog', universe: 'universeDialog' }[action]);
  }));

  let settleTimer, charFrame = 0, charDrag;
  function moveCharacter(x, y) {
    character.style.left = `${clamp(x, 9, 88)}%`;
    character.style.top = `${clamp(y, 35, 94)}%`;
  }
  function settleTo(x, y) {
    clearTimeout(settleTimer);
    character.classList.add('settling');
    moveCharacter(x, y);
    settleTimer = setTimeout(() => character.classList.remove('settling'), 600);
  }
  function sitDown() {
    seated = true;
    character.classList.remove('lying');
    character.classList.add('seated');
    $('placeOnSofa').setAttribute('aria-pressed', 'true');
    $('placeOnRug').setAttribute('aria-pressed', 'false');
    characterImage.src = 'assets/mini-you-seated.webp';
    if (mobile.matches) settleTo(21.7, 68);
    else settleTo(22.5, 73);
    speak('Всё. Присел. Цветы держу, ни одного не помял.');
    $('roomNote').textContent = 'теперь у кота есть свой букетный человек';
  }
  function standUp(reset = false) {
    seated = false;
    character.classList.remove('seated', 'lying');
    $('placeOnSofa').setAttribute('aria-pressed', 'false');
    $('placeOnRug').setAttribute('aria-pressed', 'true');
    characterImage.src = 'assets/mini-you.webp';
    if (reset) settleTo(mobile.matches ? 43.33 : 33.75, mobile.matches ? 82.22 : 83);
  }
  $('placeOnSofa').addEventListener('click', () => { sitDown(); haptic(); });
  $('placeOnRug').addEventListener('click', () => { standUp(true); speak('На ковре тоже хорошо. Главное, что ты рядом.'); });
  character.addEventListener('click', () => {
    if (suppressCharClick) { suppressCharClick = false; return; }
    speak(characterLines[characterIndex++ % characterLines.length]); bounce(); chime(440);
  });
  character.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') sitDown();
    else if (event.key === 'ArrowDown') { standUp(); character.classList.add('lying'); speak('Проверяю мягкость. Очень мягко.'); }
    else { standUp(true); speak('Я снова на ногах. Клумба тоже.'); }
  });
  function dragFrame() {
    charFrame = 0;
    if (!charDrag?.moved) return;
    const factor = reduceMotion.matches ? 1 : .42;
    charDrag.x += (charDrag.targetX - charDrag.x) * factor;
    charDrag.y += (charDrag.targetY - charDrag.y) * factor;
    moveCharacter(charDrag.x, charDrag.y);
    characterImage.style.setProperty('--lean', `${clamp((charDrag.targetX - charDrag.x) * 1.4, -9, 9)}deg`);
    if (Math.abs(charDrag.targetX - charDrag.x) + Math.abs(charDrag.targetY - charDrag.y) > .05) charFrame = requestAnimationFrame(dragFrame);
  }
  character.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const rect = stage.getBoundingClientRect(), css = getComputedStyle(character);
    const x = parseFloat(css.left) / rect.width * 100, y = parseFloat(css.top) / rect.height * 100;
    charDrag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false, rect, x, y, targetX:x, targetY:y,
      originalLeft:character.style.left, originalTop:character.style.top, originalSeated:seated,
      dx:parseFloat(css.left) - (event.clientX - rect.left), dy:parseFloat(css.top) - (event.clientY - rect.top) };
    character.setPointerCapture(event.pointerId);
  });
  character.addEventListener('pointermove', (event) => {
    if (!charDrag || event.pointerId !== charDrag.id) return;
    const distance = Math.hypot(event.clientX - charDrag.startX, event.clientY - charDrag.startY);
    if (distance < (event.pointerType === 'touch' ? 10 : 6) && !charDrag.moved) return;
    if (!charDrag.moved) { standUp(); character.classList.remove('speaking', 'bounce', 'settling'); }
    charDrag.moved = true;
    character.classList.add('dragging'); stage.classList.add('is-dragging');
    const rect = charDrag.rect;
    charDrag.targetX = clamp((event.clientX - rect.left + charDrag.dx) / rect.width * 100, 9, 88);
    charDrag.targetY = clamp((event.clientY - rect.top + charDrag.dy) / rect.height * 100, 35, 94);
    characterImage.style.setProperty('--lift', '-6px');
    if (!charFrame) charFrame = requestAnimationFrame(dragFrame);
  });
  function clearDrag() {
    if (charFrame) cancelAnimationFrame(charFrame);
    charFrame = 0; charDrag = null;
    character.classList.remove('dragging'); stage.classList.remove('is-dragging');
    characterImage.style.removeProperty('--lean'); characterImage.style.removeProperty('--lift');
  }
  character.addEventListener('pointerup', (event) => {
    if (!charDrag || event.pointerId !== charDrag.id) return;
    const drag = charDrag;
    if (drag.moved) {
      suppressCharClick = true; moveCharacter(drag.targetX, drag.targetY);
      clearDrag();
      if (drag.targetX < 39 && drag.targetY > 48 && drag.targetY < 81) sitDown();
      else { bounce(); speak('Посадка успешная. Кажется. Букет цел.'); }
      haptic();
    } else clearDrag();
  });
  character.addEventListener('pointercancel', () => {
    if (!charDrag) return;
    seated = charDrag.originalSeated;
    $('placeOnSofa').setAttribute('aria-pressed', String(seated));
    $('placeOnRug').setAttribute('aria-pressed', String(!seated));
    character.classList.toggle('seated', seated);
    characterImage.src = seated ? 'assets/mini-you-seated.webp' : 'assets/mini-you.webp';
    character.style.left = charDrag.originalLeft; character.style.top = charDrag.originalTop;
    suppressCharClick = false; clearDrag();
  });
  characterImage.addEventListener('error', () => {
    if (seated) { seated = false; characterImage.src = 'assets/mini-you.webp'; character.classList.remove('seated'); }
  });
  mobile.addEventListener('change', () => { if (seated) sitDown(); else standUp(true); });

  const fireflyWorld = window.RoomFireflies.mount({
    stage, container:$('fireflies'), gift:$('gift'), character,
    discovery:$('discovery'), note:$('roomNote'), controls:$('fireflyControls'),
    toast, speak, bounce, chime, haptic, reducedMotion:reduceMotion
  });
  function openBox() { fireflyWorld.open(); }

  const moon = $('moon');
  let moonDrag, suppressMoon = false, sunset = false;
  function setMoon(x, y) {
    moon.style.left = `${clamp(x, 12, 88)}%`; moon.style.top = `${clamp(y, 14, 75)}%`;
    const warm = clamp((80 - x) / 65, 0, 1);
    sunset = warm > .45;
    stage.style.setProperty('--warmth', (warm * .55).toFixed(3));
    stage.style.setProperty('--glasswarm', (warm * .82).toFixed(3));
    moon.setAttribute('aria-label', warm > .45 ? 'Сейчас закат. Нажми, чтобы вернуть вечер' : 'Сейчас вечер. Нажми, чтобы включить закат');
  }
  moon.addEventListener('click', () => { if (suppressMoon) { suppressMoon = false; return; } sunset = !sunset; setMoon(sunset ? 17 : 70, sunset ? 65 : 20); });
  moon.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); const x = parseFloat(moon.style.left) || 60, y = parseFloat(moon.style.top) || 15;
    setMoon(x + (event.key === 'ArrowLeft' ? -10 : event.key === 'ArrowRight' ? 10 : 0), y + (event.key === 'ArrowUp' ? -10 : event.key === 'ArrowDown' ? 10 : 0));
  });
  moon.addEventListener('pointerdown', (event) => { moonDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, originalX: parseFloat(moon.style.left) || 60, originalY: parseFloat(moon.style.top) || 15 }; moon.setPointerCapture(event.pointerId); });
  moon.addEventListener('pointermove', (event) => {
    if (!moonDrag || moonDrag.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - moonDrag.x, event.clientY - moonDrag.y) < 5 && !moonDrag.moved) return;
    moonDrag.moved = true; const rect = $('weatherWindow').getBoundingClientRect();
    setMoon((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100);
  });
  const finishMoon = () => { if (moonDrag?.moved) suppressMoon = true; moonDrag = null; };
  moon.addEventListener('pointerup', finishMoon);
  moon.addEventListener('pointercancel', () => { if (moonDrag) setMoon(moonDrag.originalX, moonDrag.originalY); moonDrag = null; suppressMoon = false; });

  const rain = $('rainCanvas'), fog = $('fogCanvas');
  const rainCtx = rain.getContext('2d'), fogCtx = fog.getContext('2d');
  let weatherWidth = 300, weatherHeight = 300, drawing = false, lastPoint, weatherVisible = false, lastRain = 0, rainFrame = 0;
  let fogStrokes = [], currentStroke;
  const rainDrops = Array.from({ length: mobile.matches ? 38 : 65 }, () => ({ x: Math.random(), y: Math.random(), speed: .14 + Math.random() * .23, size: 6 + Math.random() * 10 }));
  function paintFog() {
    if (!fogCtx) return;
    fogCtx.clearRect(0, 0, weatherWidth, weatherHeight);
    fogCtx.globalCompositeOperation = 'source-over';
    const gradient = fogCtx.createLinearGradient(0, 0, 0, weatherHeight);
    gradient.addColorStop(0, 'rgba(176,197,199,.03)'); gradient.addColorStop(1, 'rgba(176,197,199,.32)');
    fogCtx.fillStyle = gradient; fogCtx.fillRect(0, 0, weatherWidth, weatherHeight);
    fogCtx.globalCompositeOperation = 'destination-out';
    fogCtx.lineWidth = mobile.matches ? 13 : 19; fogCtx.lineCap = 'round'; fogCtx.lineJoin = 'round';
    fogStrokes.forEach((stroke) => {
      fogCtx.beginPath(); stroke.forEach(([x, y], i) => { if (!i) fogCtx.moveTo(x * weatherWidth, y * weatherHeight); else fogCtx.lineTo(x * weatherWidth, y * weatherHeight); }); fogCtx.stroke();
    });
  }
  function sizeWeather() {
    const rect = $('weatherWindow').getBoundingClientRect();
    weatherWidth = rect.width; weatherHeight = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, mobile.matches ? 1.5 : 2);
    [rain, fog].forEach((canvas) => { canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr); canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0); });
    paintFog(); drawRain(0);
  }
  function drawRain(time) {
    if (!rainCtx) return;
    rainCtx.clearRect(0, 0, weatherWidth, weatherHeight);
    rainCtx.strokeStyle = '#c5d7de55'; rainCtx.lineWidth = .7;
    rainDrops.forEach((drop) => {
      const y = ((drop.y + time * .00006 * drop.speed) % 1.1) * weatherHeight;
      const x = drop.x * weatherWidth;
      rainCtx.beginPath(); rainCtx.moveTo(x, y); rainCtx.lineTo(x - 2.5, y + drop.size); rainCtx.stroke();
    });
  }
  function shouldAnimateRain() { return weatherVisible && !document.hidden && !reduceMotion.matches && !document.querySelector('dialog[open]'); }
  function rainLoop(time) {
    rainFrame = 0;
    if (!shouldAnimateRain()) return;
    if (time - lastRain > 42) { drawRain(time); lastRain = time; }
    rainFrame = requestAnimationFrame(rainLoop);
  }
  function syncRain() {
    const active = shouldAnimateRain();
    stage.classList.toggle('is-offscreen', !weatherVisible || document.hidden);
    stage.classList.toggle('is-paused', !active);
    if (active && !rainFrame) rainFrame = requestAnimationFrame(rainLoop);
    else if (!active && rainFrame) { cancelAnimationFrame(rainFrame); rainFrame = 0; }
  }
  fog.addEventListener('pointerdown', (event) => {
    drawing = true; fog.setPointerCapture(event.pointerId); $('weatherWindow').classList.add('drawn');
    const rect = fog.getBoundingClientRect(); lastPoint = [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
    currentStroke = [lastPoint]; fogStrokes.push(currentStroke); if (fogStrokes.length > 120) fogStrokes.shift();
  });
  fog.addEventListener('pointermove', (event) => {
    if (!drawing || !fogCtx) return;
    const rect = fog.getBoundingClientRect(); const point = [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
    if (currentStroke.length > 300) currentStroke.splice(1, 1);
    currentStroke.push(point);
    fogCtx.globalCompositeOperation = 'destination-out'; fogCtx.lineWidth = mobile.matches ? 13 : 19; fogCtx.lineCap = 'round';
    fogCtx.beginPath(); fogCtx.moveTo(lastPoint[0] * weatherWidth, lastPoint[1] * weatherHeight); fogCtx.lineTo(point[0] * weatherWidth, point[1] * weatherHeight); fogCtx.stroke(); lastPoint = point;
  });
  fog.addEventListener('pointerup', () => { drawing = false; }); fog.addEventListener('pointercancel', () => { drawing = false; });
  new ResizeObserver(sizeWeather).observe($('weatherWindow'));
  new IntersectionObserver(([entry]) => { weatherVisible = entry.isIntersecting; syncRain(); }).observe(stage);
  reduceMotion.addEventListener('change', syncRain);
  document.addEventListener('visibilitychange', syncRain);
  sizeWeather(); syncRain();

  let audioContext, rainSource, rainGain, soundOn = false;
  async function toggleSound() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { toast('Этот браузер не поддерживает звук дождя. В комнате всё равно уютно.'); return; }
    try {
      if (!audioContext) {
        audioContext = new AudioCtx();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) { last = (last + (Math.random() * 2 - 1) * .045) / 1.045; data[i] = last * 4; }
        rainSource = audioContext.createBufferSource(); rainSource.buffer = buffer; rainSource.loop = true;
        const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1200;
        rainGain = audioContext.createGain(); rainGain.gain.value = 0;
        rainSource.connect(filter); filter.connect(rainGain); rainGain.connect(audioContext.destination); rainSource.start();
      }
      await audioContext.resume(); soundOn = !soundOn;
      rainGain.gain.setTargetAtTime(soundOn ? .28 : 0, audioContext.currentTime, .35);
      $('soundToggle').setAttribute('aria-pressed', String(soundOn));
      $('soundToggle').setAttribute('aria-label', soundOn ? 'Выключить звук дождя' : 'Включить звук дождя');
    } catch { toast('Звук не включился. Можно попробовать ещё раз.'); }
  }
  $('soundToggle').addEventListener('click', toggleSound);
  function chime(frequency = 580) {
    if (!soundOn || !audioContext || audioContext.state !== 'running') return;
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    osc.type = 'sine'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(.035, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .7);
    osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + .75);
  }
  document.addEventListener('visibilitychange', () => {
    if (!audioContext) return;
    if (document.hidden) audioContext.suspend().catch(() => {});
    else if (soundOn) audioContext.resume().catch(() => {});
  });

  $('hugButton').addEventListener('click', () => {
    $('universeDialog').classList.add('hugged');
    $('hugMessage').textContent = 'Обнимаю тебя, кот. Тихонько. И столько, сколько тебе хочется.';
    $('hugButton').querySelector('span').textContent = 'Ещё одно объятие';
    haptic(45); chime(740);
    if (!reduceMotion.matches) {
      for (let i = 0; i < 16; i++) {
        const heart = document.createElement('span'); heart.className = 'heart-particle';
        heart.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><use href="#i-heart"/></svg>';
        heart.style.left = `${12 + Math.random() * 76}%`; heart.style.top = `${55 + Math.random() * 35}%`; heart.style.animationDelay = `${Math.random() * .8}s`;
        $('heartParticles').appendChild(heart); setTimeout(() => heart.remove(), 3200);
      }
    }
  });
  $('needTime').addEventListener('click', () => {
    $('hugMessage').textContent = 'Конечно, любимая. Побудь здесь или возвращайся, когда захочешь. Я не тороплю.';
    $('universeDialog').classList.remove('hugged');
  });
})();
