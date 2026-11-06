(() => {
  'use strict';

  const WORDS = [
    ['Тёплый', 'Кот, ты мне очень дорога.'],
    ['Тихоня', 'Мне важно услышать тебя.'],
    ['Румянец', 'Моей любимой носатой — самый тёплый свет.'],
    ['Облачко', 'Здесь можно просто побыть.'],
    ['Искра', 'Этот маленький огонёк — тебе.'],
    ['Нежность', 'Обнимаю, если тебе хочется.']
  ];
  const HOMES = [[.17, .32], [.73, .24], [.85, .55], [.48, .47], [.71, .82], [.19, .73]];
  const HEART_POINTS = [[-.4, -.17], [-.24, -.39], [0, -.22], [.24, -.39], [.4, -.17], [0, .43]];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const noop = () => {};

  function mount(options) {
    const { stage, container, gift, character, discovery, note, controls } = options;
    if (![stage, container, gift, character, discovery, note, controls].every(Boolean)) {
      throw new Error('RoomFireflies needs the room, its controls and the six supplied DOM hosts.');
    }
    const toast = options.toast || noop;
    const speak = options.speak || noop;
    const bounce = options.bounce || noop;
    const chime = options.chime || noop;
    const haptic = options.haptic || noop;
    const reducedMotion = options.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const signal = controller.signal;
    const listen = (node, type, handler, settings = {}) => node.addEventListener(type, handler, { ...settings, signal });
    const found = new Set();
    const flies = [];
    let opened = false, destroyed = false, visible = true, modal = false;
    let width = 1, height = 1, clock = 0, lastFrame = 0;
    let frame = 0, frameTimer = 0, modeTimer = 0, mode = 'free', modeEnd = 0;
    let modeTimerStarted = 0;
    let heartCenter = { x: .5, y: .5 }, heartWidth = 150;
    let lastHeartMeasure = -Infinity, lastCharacterRect = null;
    let heart = null;
    const originalGiftLabel = gift.getAttribute('aria-label');
    const originalDiscoveryRole = discovery.getAttribute('role');
    const originalDiscoveryLive = discovery.getAttribute('aria-live');
    const buttons = [];
    controls.classList.add('firefly-controls');
    controls.hidden = true;
    container.classList.add('rf-world');
    stage.classList.add('rf-ready');
    discovery.setAttribute('role', 'status');
    discovery.setAttribute('aria-live', 'polite');
    discovery.setAttribute('aria-atomic', 'true');

    function active() {
      return opened && !destroyed && visible && !document.hidden && !modal && !reducedMotion.matches;
    }

    function stopFrames() {
      cancelAnimationFrame(frame);
      clearTimeout(frameTimer);
      frame = frameTimer = 0;
      lastFrame = 0;
    }

    function schedule() {
      if (!active() || frame || frameTimer) return;
      frameTimer = setTimeout(() => {
        frameTimer = 0;
        if (active()) frame = requestAnimationFrame(tick);
      }, 34);
    }

    function syncMotion() {
      if (modeTimer) {
        clearTimeout(modeTimer);
        modeEnd = Math.max(clock, modeEnd - (performance.now() - modeTimerStarted));
        modeTimer = 0;
      }
      if (opened && !destroyed && visible && !document.hidden && !modal && reducedMotion.matches && mode !== 'free') {
        modeTimerStarted = performance.now();
        modeTimer = setTimeout(endMode, Math.max(0, modeEnd - clock));
      }
      const running = active();
      container.classList.toggle('rf-paused', !running);
      container.classList.toggle('rf-reduced', reducedMotion.matches);
      if (running) schedule(); else stopFrames();
    }

    function bounded(fly) {
      const marginX = Math.min(.12, 27 / width);
      const marginY = Math.min(.12, 27 / height);
      fly.x = clamp(fly.x, marginX, 1 - marginX);
      fly.y = clamp(fly.y, Math.max(.08, marginY), .89);
    }

    function render(fly) {
      bounded(fly);
      fly.el.style.transform = `translate3d(${(fly.x * width).toFixed(2)}px,${(fly.y * height).toFixed(2)}px,0) translate(-50%,-50%)`;
    }

    function measureCharacter(force = false) {
      if (destroyed) return;
      const room = stage.getBoundingClientRect();
      const person = character.getBoundingClientRect();
      const local = [person.left - room.left, person.top - room.top, person.width, person.height, room.width, room.height];
      if (!force && lastCharacterRect && local.every((value, index) => Math.abs(value - lastCharacterRect[index]) < .15)) return;
      lastCharacterRect = local;
      heartWidth = clamp(room.width * .24, 128, 186);
      const half = heartWidth / 2;
      heartCenter = {
        x: clamp(local[0] + person.width * .94, half + 6, room.width - half - 6) / (room.width || 1),
        y: clamp(local[1] + person.height * .64, half + 8, room.height * .84) / (room.height || 1)
      };
      if (heart) {
        heart.style.width = `${heartWidth}px`;
        heart.style.height = `${heartWidth * .875}px`;
        heart.style.transform = `translate(${heartCenter.x * width}px,${heartCenter.y * height}px) translate(-50%,-50%)`;
      }
    }

    function resize() {
      const rect = stage.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      measureCharacter();
      flies.forEach(render);
      if (opened && reducedMotion.matches) settle();
    }

    function targetFor(fly) {
      const angle = fly.index * Math.PI / 3 + clock * .0002;
      if (mode === 'gather') return {
        x: .5 + Math.cos(angle) * .23,
        y: .43 + Math.sin(angle) * .13
      };
      if (mode === 'heart') {
        const point = HEART_POINTS[fly.index];
        return {
          x: heartCenter.x + point[0] * heartWidth / width,
          y: heartCenter.y + point[1] * heartWidth / height
        };
      }
      const time = clock * (.00025 + fly.index * .000022);
      return {
        x: fly.homeX + Math.sin(time + fly.phase) * .037 + Math.sin(time * .63 + fly.phase) * .018,
        y: fly.homeY + Math.cos(time * 1.13 + fly.phase) * .032
      };
    }

    function frozen(fly) { return fly.hover || fly.focus || fly.pressed || fly.drag; }

    function tick(time) {
      frame = 0;
      if (!active()) { syncMotion(); return; }
      const dt = lastFrame ? Math.min(time - lastFrame, 90) : 34;
      lastFrame = time;
      clock += dt;
      if (mode !== 'free' && clock >= modeEnd) endMode();
      if (mode === 'heart' && time - lastHeartMeasure >= 100) {
        measureCharacter();
        lastHeartMeasure = time;
      }
      for (const fly of flies) {
        if (frozen(fly)) continue;
        if (fly.releaseTime !== null) {
          fly.releaseTime += dt;
          const progress = clamp((fly.releaseTime - fly.index * 115) / 1550, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          fly.x = fly.originX + (fly.homeX - fly.originX) * eased;
          fly.y = fly.originY + (fly.homeY - fly.originY) * eased - Math.sin(progress * Math.PI) * .11;
          fly.el.style.opacity = String(clamp(progress * 5, .12, 1));
          if (progress === 1) { fly.releaseTime = null; fly.el.style.opacity = ''; }
        } else {
          const target = targetFor(fly);
          const response = 1 - Math.exp(-dt / (mode === 'free' ? 620 : 440));
          fly.x += (target.x - fly.x) * response;
          fly.y += (target.y - fly.y) * response;
        }
        render(fly);
      }
      schedule();
    }

    function settle() {
      for (const fly of flies) {
        if (fly.drag) continue;
        fly.releaseTime = null;
        fly.el.style.opacity = '';
        const target = targetFor(fly);
        fly.x = target.x; fly.y = target.y;
        render(fly);
      }
    }

    function setHeld(fly) {
      fly.el.classList.toggle('rf-held', !!frozen(fly));
    }

    function collect(fly) {
      const first = !found.has(fly.index);
      found.add(fly.index);
      fly.el.classList.add('rf-touched');
      fly.el.setAttribute('aria-label', `Огонёк «${fly.name}». ${fly.words}`);
      discovery.textContent = `${found.size} / 6 тёплых слов`;
      toast(fly.words);
      chime(520 + fly.index * 78);
      if (first) haptic(15);
      if (found.size === 6) note.textContent = 'все слова нашлись. можно просто побыть вместе';
    }

    function endMode() {
      mode = 'free'; modeEnd = 0;
      clearTimeout(modeTimer);
      modeTimer = 0;
      container.classList.remove('rf-gathering', 'rf-giving');
      character.classList.remove('rf-lit');
      heart?.classList.remove('rf-heart-visible');
      buttons.forEach((button) => { if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', 'false'); });
      if (reducedMotion.matches) settle();
    }

    function chooseMode(next, duration) {
      endMode();
      mode = next; modeEnd = clock + duration;
      flies.forEach((fly) => { fly.releaseTime = null; fly.el.style.opacity = ''; });
      if (reducedMotion.matches) {
        settle();
      }
      syncMotion();
    }

    function gather() {
      if (!opened) { open(); return; }
      chooseMode('gather', 8500);
      container.classList.add('rf-gathering');
      buttons[0]?.setAttribute('aria-pressed', 'true');
      note.textContent = 'позвала — и они собрались в маленький хоровод';
      toast('Все здесь. Можно коснуться любого огонька.');
      chime(650); haptic(12);
    }

    function giveLight() {
      if (!opened) open();
      measureCharacter(true);
      lastHeartMeasure = -Infinity;
      chooseMode('heart', 7000);
      container.classList.add('rf-giving');
      character.classList.add('rf-lit');
      heart?.classList.add('rf-heart-visible');
      buttons[1]?.setAttribute('aria-pressed', 'true');
      note.textContent = 'маленькое созвездие. большое спасибо за свет';
      speak('Кот, смотри! Даже букет теперь светится. Берегу твой огонёк.');
      bounce(); chime(790); haptic(22);
    }

    function scatter() {
      if (!opened) open();
      endMode();
      flies.forEach((fly, index) => {
        fly.releaseTime = null;
        fly.homeX = HOMES[index][0];
        fly.homeY = HOMES[index][1];
        fly.el.style.opacity = '';
      });
      if (reducedMotion.matches) settle();
      note.textContent = 'разлетелись по комнате. каждый помнит твоё прикосновение';
      toast('Летите, маленькие. Ваши слова остаются здесь.');
      syncMotion();
    }

    function nearCharacter(event) {
      const person = character.getBoundingClientRect();
      return event.clientX >= person.left - 28 && event.clientX <= person.right + 28 &&
        event.clientY >= person.top - 24 && event.clientY <= person.bottom + 30;
    }

    function cancelDrag(fly) {
      const drag = fly.drag;
      if (!drag) return;
      fly.x = drag.originalX; fly.y = drag.originalY;
      fly.homeX = drag.originalHomeX; fly.homeY = drag.originalHomeY;
      fly.releaseTime = drag.originalReleaseTime;
      fly.drag = null; fly.pressed = false;
      fly.suppressUntil = performance.now() + 450;
      fly.el.classList.remove('rf-dragging');
      try { if (fly.el.hasPointerCapture(drag.id)) fly.el.releasePointerCapture(drag.id); } catch {}
      setHeld(fly); render(fly);
    }

    function bindFly(fly) {
      const element = fly.el;
      listen(element, 'pointerenter', (event) => {
        if (event.pointerType === 'touch') return;
        fly.hover = true; setHeld(fly);
      });
      listen(element, 'pointerleave', () => { fly.hover = false; setHeld(fly); });
      listen(element, 'focus', () => { fly.focus = true; setHeld(fly); });
      listen(element, 'blur', () => { fly.focus = false; setHeld(fly); });
      listen(element, 'click', (event) => {
        if (event.detail > 0 && performance.now() < fly.suppressUntil) return;
        collect(fly);
      });
      listen(element, 'pointerdown', (event) => {
        if (event.button !== 0 || event.isPrimary === false || fly.drag) return;
        fly.pressed = true;
        fly.drag = {
          id: event.pointerId, startX: event.clientX, startY: event.clientY,
          originalX: fly.x, originalY: fly.y,
          originalHomeX: fly.homeX, originalHomeY: fly.homeY,
          originalReleaseTime: fly.releaseTime, moved: false
        };
        element.setPointerCapture(event.pointerId);
        setHeld(fly);
      });
      listen(element, 'pointermove', (event) => {
        const drag = fly.drag;
        if (!drag || drag.id !== event.pointerId) return;
        if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 7) return;
        event.preventDefault();
        drag.moved = true;
        fly.releaseTime = null;
        element.style.opacity = '';
        element.classList.add('rf-dragging');
        fly.x = drag.originalX + (event.clientX - drag.startX) / width;
        fly.y = drag.originalY + (event.clientY - drag.startY) / height;
        render(fly);
      });
      listen(element, 'pointerup', (event) => {
        const drag = fly.drag;
        if (!drag || drag.id !== event.pointerId) return;
        fly.drag = null; fly.pressed = false;
        if (drag.moved) {
          fly.suppressUntil = performance.now() + 500;
          fly.homeX = fly.x; fly.homeY = fly.y;
          collect(fly);
          if (nearCharacter(event)) giveLight();
        }
        element.classList.remove('rf-dragging');
        setHeld(fly);
        try { if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId); } catch {}
      });
      listen(element, 'pointercancel', (event) => { if (fly.drag?.id === event.pointerId) cancelDrag(fly); });
      listen(element, 'lostpointercapture', (event) => { if (fly.drag?.id === event.pointerId) cancelDrag(fly); });
      listen(element, 'keydown', (event) => {
        if (event.key === 'Escape' && fly.drag) { event.preventDefault(); cancelDrag(fly); }
        if (event.key === 'ArrowDown') { event.preventDefault(); collect(fly); giveLight(); }
      });
    }

    function createHeart() {
      heart = document.createElement('div');
      heart.className = 'rf-heart-constellation';
      heart.setAttribute('aria-hidden', 'true');
      heart.innerHTML = '<svg viewBox="0 0 160 140"><path d="M80 124C53 105 15 80 15 48 15 17 56 9 80 39 104 9 145 17 145 48 145 80 107 105 80 124Z"/><circle cx="80" cy="124" r="2"/><circle cx="17" cy="48" r="2"/><circle cx="143" cy="48" r="2"/><circle cx="80" cy="39" r="2"/></svg>';
      container.appendChild(heart);
      measureCharacter(true);
    }

    function open() {
      if (destroyed) return;
      if (opened) { gather(); return; }
      opened = true;
      resize();
      gift.classList.add('opened');
      gift.setAttribute('aria-label', 'Коробка открыта. Позвать огоньки');
      const roomRect = stage.getBoundingClientRect();
      const giftRect = gift.getBoundingClientRect();
      const originX = (giftRect.left - roomRect.left + giftRect.width * .5) / width;
      const originY = (giftRect.top - roomRect.top + giftRect.height * .24) / height;
      createHeart();
      WORDS.forEach(([name, words], index) => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = `rf-firefly rf-kind-${index}${index === 2 || index === 5 ? ' rf-rose' : ''}`;
        element.setAttribute('aria-label', `Огонёк «${name}». Коснуться и прочитать тёплые слова`);
        element.title = `${name}: нажми или принеси мне`;
        element.innerHTML = '<span class="rf-wing rf-wing-left" aria-hidden="true"></span><span class="rf-wing rf-wing-right" aria-hidden="true"></span><span class="rf-body" aria-hidden="true"><span class="rf-eyes"></span></span><span class="rf-touch-mark" aria-hidden="true">✧</span>';
        const fly = {
          index, name, words, el: element, x: originX, y: originY,
          originX, originY, homeX: HOMES[index][0], homeY: HOMES[index][1],
          phase: index * 1.71, releaseTime: 0, suppressUntil: 0,
          hover: false, focus: false, pressed: false, drag: null
        };
        flies.push(fly); container.appendChild(element); bindFly(fly); render(fly);
      });
      [['Позвать огоньки', gather], ['Подарить свет', giveLight], ['Разлетайтесь', scatter]].forEach(([label, action], index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'rf-control';
        button.textContent = label;
        if (index < 2) button.setAttribute('aria-pressed', 'false');
        button.dataset.fireflyAction = ['gather', 'give', 'scatter'][index];
        listen(button, 'click', action);
        buttons.push(button); controls.appendChild(button);
      });
      controls.hidden = false;
      discovery.textContent = '0 / 6 тёплых слов';
      note.textContent = 'коснись огонька. или подари мне немного света';
      toast('Осторожно: нежность разлетелась по комнате. Каждый огонёк принёс тебе слова.');
      chime(660); haptic(18);
      if (reducedMotion.matches) settle();
      syncMotion();
    }

    listen(gift, 'click', open);
    listen(document, 'visibilitychange', () => {
      if (document.hidden) flies.forEach(cancelDrag);
      syncMotion();
    });
    listen(reducedMotion, 'change', () => {
      if (reducedMotion.matches) {
        if (opened) settle();
      }
      syncMotion();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) flies.forEach(cancelDrag);
      syncMotion();
    }, { threshold: .02 });
    intersection.observe(stage);
    const sizes = new ResizeObserver(resize);
    sizes.observe(stage); sizes.observe(character);
    const personChanges = new MutationObserver(() => {
      if (destroyed || mode !== 'heart') return;
      if (reducedMotion.matches) {
        measureCharacter();
        settle();
      }
    });
    personChanges.observe(character, { attributes: true, attributeFilter: ['style', 'class'] });
    function checkDialog() {
      const next = !!document.querySelector('dialog[open]');
      if (next === modal) return;
      modal = next;
      if (modal) flies.forEach(cancelDrag);
      syncMotion();
    }
    const dialogs = new MutationObserver(checkDialog);
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    checkDialog(); resize(); syncMotion();

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrames(); clearTimeout(modeTimer);
      flies.forEach(cancelDrag);
      controller.abort();
      intersection.disconnect(); sizes.disconnect(); personChanges.disconnect(); dialogs.disconnect();
      flies.forEach((fly) => fly.el.remove());
      buttons.forEach((button) => button.remove());
      heart?.remove();
      character.classList.remove('rf-lit');
      container.classList.remove('rf-world', 'rf-paused', 'rf-reduced', 'rf-gathering', 'rf-giving');
      stage.classList.remove('rf-ready');
      gift.classList.remove('opened');
      if (originalGiftLabel === null) gift.removeAttribute('aria-label'); else gift.setAttribute('aria-label', originalGiftLabel);
      if (originalDiscoveryRole === null) discovery.removeAttribute('role'); else discovery.setAttribute('role', originalDiscoveryRole);
      if (originalDiscoveryLive === null) discovery.removeAttribute('aria-live'); else discovery.setAttribute('aria-live', originalDiscoveryLive);
      controls.hidden = true;
    }
    return { open, destroy };
  }

  window.RoomFireflies = { mount };
})();
