(function () {
  'use strict';

  var mounts = new WeakMap();
  var instance = 0;
  var scenes = [
    { title: 'Чай после дождя', description: 'Мечта о тихом вечере: дождь уже закончился, а чай ещё тёплый.', hint: 'Коснись чашек. На запотевшем окне можно рисовать пальцем.' },
    { title: 'Никуда не спешить', description: 'Мечта о прогулке, у которой нет ни расписания, ни последнего поворота.', hint: 'Проведи по дорожке — пусть впереди загорается свет.' },
    { title: 'Наш маленький сад', description: 'Мечта о чём-то хорошем, что мы сможем вырастить вместе.', hint: 'Коснись горшка или полей семечко. Хорошее растёт понемногу.' }
  ];

  function baseDefs(id) {
    return '<defs>' +
      '<linearGradient id="' + id + '-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#778a8d"/><stop offset="1" stop-color="#b8b6a0"/></linearGradient>' +
      '<linearGradient id="' + id + '-night" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#34495c"/><stop offset="1" stop-color="#a59091"/></linearGradient>' +
      '<radialGradient id="' + id + '-glow"><stop stop-color="#ffe3a4" stop-opacity=".7"/><stop offset="1" stop-color="#ffd68d" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + id + '-grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".035"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs>';
  }

  function teaArt(id) {
    return '<div class="dream-art dream-tea-scene">' +
      '<svg class="dream-illustration" viewBox="0 0 720 420" role="img" aria-label="Уютный стол с двумя чашками у окна, за которым закончился дождь">' + baseDefs(id) +
      '<path d="M0 0h720v420H0Z" fill="#ddc9aa"/>' +
      '<path d="M0 0h291v335H0Z" fill="#ccbaa0"/>' +
      '<path d="M18 0v329M52 0v329M85 0v329M119 0v329M152 0v329M186 0v329M220 0v329M253 0v329" stroke="#b29d84" stroke-opacity=".22" stroke-width="2"/>' +
      '<rect x="338" y="24" width="322" height="258" rx="19" fill="#8d725a" stroke="#776651" stroke-width="4"/>' +
      '<rect x="351" y="38" width="296" height="229" rx="10" fill="url(#' + id + '-sky)"/>' +
      '<path d="M351 218c57-47 97-20 141-25 54-7 93-57 155-19v93H351Z" fill="#7e8d7b"/>' +
      '<path d="M351 236c91-36 145 23 209-3 36-14 60-12 87-2v36H351Z" fill="#5f7b70"/>' +
      '<path d="M563 60v10m27 36v14m-181 20v10m43-72v15m160 63v13m-234-60v14" stroke="#e4e4ce" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M499 38v229M351 154h296" stroke="#9b8063" stroke-width="7"/>' +
      '<path d="M328 279h344v12H328Z" fill="#af8864"/><path d="M340 291h319v7H340Z" fill="#846b55"/>' +
      '<path d="M326 22c-9 91 5 187-20 271l44-4c-15-85 9-176 1-267Z" fill="#e6d7bc"/><path d="M335 24c-9 116 4 186-13 264m20-262c-2 116 6 181-7 263" stroke="#c4b69f" stroke-width="3"/>' +
      '<path d="M661 22c6 94-4 186 22 271l35-4c-23-94-13-185-18-267Z" fill="#e6d7bc"/><path d="M675 25c8 115-3 183 20 262m-8-261c10 111-1 181 20 261" stroke="#c4b69f" stroke-width="3"/>' +
      '<path d="M53 112h176v12H53Z" fill="#9d7959"/><path d="M65 79h17v32H65Z" fill="#ad7a65"/><path d="M86 71h14v40H86Z" fill="#788d85"/><path d="M104 76h20v35h-20Z" fill="#c6a16d"/>' +
      '<path d="M161 90h42l-6 22h-30Z" fill="#af7c5f"/><path d="M182 91V47m0 29c-26 1-31-21-16-28 15 1 21 14 16 28Zm1-13c24 0 27-22 13-28-17 4-20 17-13 28Z" fill="#6f8867" stroke="#5b7359" stroke-width="2"/>' +
      '<path d="M91 202c0-19 33-19 33 0v85H91Z" fill="#e6ceb0"/><path d="M96 204h23v31H96Z" fill="#c2a488"/>' +
      '<path d="M0 315h720v105H0Z" fill="#936c52"/><path d="M0 316h720" stroke="#bd9771" stroke-width="7"/>' +
      '<path d="M0 353h720M0 400h720M113 318v35m301 0v47m196 0v20" stroke="#6e5748" stroke-opacity=".36" stroke-width="2"/>' +
      '<path d="m132 321 331-15 74 114H93Z" fill="#d9c3a0"/><path d="m155 319-32 101m66-103-22 103m67-105-12 105m65-108-2 108m62-110 10 110m57-112 24 112" stroke="#bba383" stroke-opacity=".33" stroke-width="2"/>' +
      '<ellipse cx="267" cy="357" rx="70" ry="17" fill="#b59877"/><ellipse cx="443" cy="353" rx="70" ry="17" fill="#b59877"/>' +
      '<path d="M585 342c0-30 34-44 53-18 13 18-1 44-20 45-18 1-33-12-33-27Z" fill="#b17c59"/><path d="M600 324c11-10 23-7 30 6m-31 4c13-6 24-2 28 9" stroke="#d1a377" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M0 0h720v420H0Z" opacity=".5" filter="url(#' + id + '-grain)"/></svg>' +
      '<canvas class="dream-fog" aria-label="Запотевшее окно: рисуй пальцем или используй кнопку «Протереть окно»"></canvas>' +
      mug('left', 'Первая чашка', '#b98485') + mug('right', 'Вторая чашка', '#7b9185') +
      '</div><div class="dream-actions"><button type="button" class="dream-action" data-dream-action="clear-window">Протереть окно</button><button type="button" class="dream-action dream-action-quiet" data-dream-action="fog-window">Снова запотеть</button></div>';
  }

  function mug(side, label, color) {
    return '<button type="button" class="dream-mug dream-mug-' + side + '" data-dream-action="mug" data-mug-name="' + label + '" aria-label="' + label + ': согреть чай" aria-pressed="false">' +
      '<svg viewBox="0 0 130 140" aria-hidden="true"><g class="dream-steam" fill="none" stroke="#fff3d8" stroke-width="3" stroke-linecap="round"><path d="M44 65c-20-20 20-25 0-49"/><path d="M66 62c-18-20 17-28 0-48"/><path d="M86 64c-15-18 17-23 0-42"/></g><path d="M24 77h75v38c0 19-16 22-38 22s-37-5-37-22Z" fill="' + color + '" stroke="#755d4b" stroke-width="3"/><ellipse cx="61" cy="77" rx="37" ry="10" fill="#e0c5a0" stroke="#755d4b" stroke-width="3"/><ellipse cx="61" cy="78" rx="30" ry="6" fill="#795438"/><path d="M100 86c32-10 33 36-2 30" fill="none" stroke="' + color + '" stroke-width="11"/><path d="M34 93v19c0 8 7 12 15 13" fill="none" stroke="#f4ddbf" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/></svg></button>';
  }

  var lampPoints = [[102, 267], [238, 218], [373, 176], [508, 139], [630, 116]];
  function walkArt(id) {
    var lamps = lampPoints.map(function (p, i) {
      var x = p[0], y = p[1], s = 1 - i * .105;
      return '<g class="dream-lantern" data-lamp="' + i + '" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse class="dream-lamp-halo" cx="0" cy="-65" rx="72" ry="85" fill="url(#' + id + '-glow)"/><path d="M0-43V45m-11 0h22" stroke="#655c53" stroke-width="5" stroke-linecap="round"/><path d="m-16-74 4 31h24l4-31Z" fill="#788185" stroke="#5c5a53" stroke-width="3"/><path class="dream-lamp-light" d="m-11-70 3 23H8l3-23Z" fill="#ffe3a0"/><path d="M-19-76c3-15 35-15 38 0Z" fill="#5e625d"/><path d="M0-90v-6" stroke="#5c5a53" stroke-width="3"/></g>';
    }).join('');
    return '<div class="dream-art dream-walk-scene" aria-label="Проведи слева направо по дорожке, чтобы зажечь фонари">' +
      '<svg class="dream-illustration" viewBox="0 0 720 420" role="img" aria-label="Дорожка в вечернем парке и пять фонарей">' + baseDefs(id) +
      '<path d="M0 0h720v420H0Z" fill="url(#' + id + '-night)"/>' +
      '<circle cx="571" cy="57" r="22" fill="#dfd5b7"/><path d="M574 37c-15 18-4 36 15 35-22 15-44-5-35-24 4-7 11-11 20-11Z" fill="#8d948e" opacity=".38"/>' +
      '<g fill="#e6dfc5" opacity=".6"><circle cx="84" cy="40" r="1.5"/><circle cx="274" cy="38" r="1.5"/><circle cx="428" cy="69" r="1.5"/><circle cx="655" cy="34" r="1.5"/><circle cx="374" cy="22" r="1.3"/></g>' +
      '<path d="M0 176c92-71 142-24 219-52 117-41 136 15 233-14 88-27 182 12 268-7v317H0Z" fill="#657c75"/>' +
      '<path d="M0 237c108-72 173-10 265-72 74-49 158 4 232-15 91-22 151 7 223-1v271H0Z" fill="#536e63"/>' +
      '<path d="M80 420c38-112 139-137 252-186 127-54 187-67 388-115v36c-146 56-242 93-330 154-91 62-108 83-112 111Z" fill="#c0ab8e"/>' +
      '<path d="M97 420c37-95 120-125 245-181 119-53 194-72 378-116" stroke="#d7c2a0" stroke-opacity=".65" stroke-width="3"/>' +
      '<path d="M282 420c4-35 57-81 119-126 111-80 201-101 319-144" stroke="#8f9079" stroke-width="4"/>' +
      '<path d="M210 349c41-13 64-8 63 3-1 10-34 21-72 24-30 2-30-14 9-27Z" fill="#8c9f9d" opacity=".65"/>' +
      '<path d="M474 220c27-8 47-6 45 0-2 7-25 14-48 14-19 0-17-8 3-14Z" fill="#a0aba5" opacity=".55"/>' +
      '<g stroke="#445e54" stroke-width="5" fill="#49675a"><path d="M34 250V94m0 65c-64-6-36-89 1-82 39-10 67 71-1 82Z"/><path d="M666 245V102m0 38c-58-2-39-72 0-72 42-5 58 69 0 72Z"/></g>' +
      '<path d="M0 363c53-35 82-24 112-9m364 66c76-52 155-85 244-83" stroke="#3c5a4d" stroke-width="35" stroke-linecap="round"/>' +
      '<g stroke="#8d9b78" stroke-width="3" stroke-linecap="round"><path d="m35 345 6-19m8 20 12-13m-9 25 18-5m450 26 1-18m8 13 12-14m108-36 2-22m7 18 13-12"/></g>' +
      '<g transform="translate(408 257) rotate(-18)"><path d="M0 0h72v12H0Zm4 23h66v10H4Z" fill="#a57d58" stroke="#695f4d" stroke-width="2"/><path d="M11 9v41m48-41v41" stroke="#595e51" stroke-width="5"/></g>' + lamps +
      '<path d="M0 0h720v420H0Z" opacity=".5" filter="url(#' + id + '-grain)"/></svg>' +
      '<span class="dream-walk-prompt" aria-hidden="true">проведи по дорожке</span></div>' +
      '<div class="dream-actions"><button type="button" class="dream-action" data-dream-action="lamp-next">Зажечь следующий фонарь</button><button type="button" class="dream-action dream-action-quiet" data-dream-action="lamp-reset">Погасить</button></div>';
  }

  function gardenArt(id) {
    return '<div class="dream-art dream-garden-scene" data-growth="0">' +
      '<svg class="dream-illustration" viewBox="0 0 720 420" role="img" aria-label="Маленькое семечко в глиняном горшке">' + baseDefs(id) +
      '<path d="M0 0h720v420H0Z" fill="#e4d5b5"/>' +
      '<path d="M130 320V151C130-20 590-20 590 151v169Z" fill="#b1bc9a"/>' +
      '<path d="M150 320V153c0-147 420-147 420 0v167Z" fill="#d5d3b3"/>' +
      '<path d="M150 250c75-57 119-9 184-29 96-31 163-3 236-25v124H150Z" fill="#afba90"/>' +
      '<path d="M150 287c97-31 137 4 218-15 88-20 150 4 202-8v56H150Z" fill="#8d9f78"/>' +
      '<path d="M79 0c0 89 51 97 107 88 77-14 134-41 185-9 79 49 163 24 195-15 30-35 62-37 84-20" stroke="#8c9975" stroke-width="4"/>' +
      '<g fill="#82946c"><path d="M97 54c-29-4-33-32-19-40 21 4 23 21 19 40Zm31 28c-10-27 11-42 26-31 6 21-7 30-26 31Zm82 0c4-29 29-33 39-17-6 20-20 21-39 17Zm91-12c-16-25 1-45 19-36 12 18 4 31-19 36Zm87 24c-2-28 22-41 35-26-1 23-17 28-35 26Zm96-2c-6-29 16-42 32-27 0 23-15 29-32 27Zm81-23c-7-27 12-43 28-32 4 21-11 30-28 32Z"/></g>' +
      '<g fill="#f1dfac"><circle cx="189" cy="85" r="5"/><circle cx="365" cy="79" r="5"/><circle cx="541" cy="85" r="5"/></g>' +
      '<path d="M0 326h720v94H0Z" fill="#af8c69"/><path d="M0 327h720" stroke="#d0ac83" stroke-width="7"/>' +
      '<path d="M0 374h720M137 329v45m301 0v46" stroke="#866d55" stroke-opacity=".4" stroke-width="2"/>' +
      '<ellipse cx="363" cy="384" rx="119" ry="18" fill="#8d735b" opacity=".3"/>' +
      '<path d="m277 287 20 91c4 18 122 18 127 0l20-91Z" fill="#bc8262" stroke="#92684e" stroke-width="3"/>' +
      '<path d="m294 305 14 69c2 8 16 10 22 10" stroke="#deb18a" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M269 275h183v24c-37 13-145 13-183 0Z" fill="#cc9873" stroke="#956d52" stroke-width="3"/>' +
      '<ellipse cx="360" cy="276" rx="91" ry="17" fill="#8b6a50" stroke="#a67d5a" stroke-width="5"/>' +
      '<path d="M298 276c39-8 91-8 126 0" stroke="#675640" stroke-opacity=".4" stroke-width="2"/>' +
      '<ellipse class="dream-seed" cx="359" cy="273" rx="8" ry="5" transform="rotate(-24 359 273)" fill="#ddba7b"/>' +
      '<g class="dream-growth dream-growth-1"><path d="M359 274c-4-23-7-36-2-48" fill="none" stroke="#6b845b" stroke-width="6" stroke-linecap="round"/><path d="M356 241c-23 2-30-14-19-22 15 0 22 9 19 22Z" fill="#8da26d"/></g>' +
      '<g class="dream-growth dream-growth-2"><path d="M358 244c2-20 6-35 4-51" fill="none" stroke="#6b845b" stroke-width="6" stroke-linecap="round"/><path d="M361 218c27 3 38-16 26-28-18-1-29 12-26 28Z" fill="#7f9a64"/><path d="M361 202c-29 2-38-19-24-30 19 0 28 13 24 30Z" fill="#8fa673"/></g>' +
      '<g class="dream-growth dream-growth-3"><path d="M362 199c-2-28-1-46 4-68" fill="none" stroke="#6b845b" stroke-width="6" stroke-linecap="round"/><path d="M364 179c36 3 53-21 36-36-24 0-39 15-36 36Z" fill="#78925e"/><path d="M362 162c-34 0-44-22-28-36 21 1 32 16 28 36Z" fill="#91a776"/></g>' +
      '<g class="dream-growth dream-growth-4"><path d="M366 135c-20-5-22-31-7-37 18-3 30 16 7 37Z" fill="#cf8e80" stroke="#b67d70" stroke-width="2"/><path d="m354 126 12 10 11-11" fill="#7e965e"/></g>' +
      '<g transform="translate(366 111)"><g class="dream-growth dream-growth-5"><g fill="#e7a092" stroke="#c88b7e" stroke-width="1.5"><ellipse cy="-25" rx="14" ry="24"/><ellipse cy="-25" rx="14" ry="24" transform="rotate(60)"/><ellipse cy="-25" rx="14" ry="24" transform="rotate(120)"/><ellipse cy="-25" rx="14" ry="24" transform="rotate(180)"/><ellipse cy="-25" rx="14" ry="24" transform="rotate(240)"/><ellipse cy="-25" rx="14" ry="24" transform="rotate(300)"/></g><circle r="15" fill="#e9c77e" stroke="#c9a668" stroke-width="2"/><g fill="#bb945b"><circle cx="-5" cy="-4" r="1.6"/><circle cx="4" cy="-6" r="1.6"/><circle cx="7" cy="3" r="1.6"/><circle cx="-2" cy="6" r="1.6"/><circle cx="-8" cy="4" r="1.6"/></g></g></g>' +
      '<g class="dream-water-drops" fill="#8eafac"><path d="M426 176c-8 12-8 19 0 19s8-7 0-19Z"/><path d="M445 203c-7 10-7 16 0 16s7-6 0-16Z"/><path d="M410 221c-6 9-6 14 0 14s6-5 0-14Z"/></g>' +
      '<g transform="translate(84 291) rotate(-8)"><path d="M0 0h70v55H0Z" fill="#9da78b" stroke="#76856c" stroke-width="3"/><path d="M70 10 102-8l8 8-40 36Z" fill="#9da78b" stroke="#76856c" stroke-width="3"/><path d="M0 9c-34-20-35 37-1 27" stroke="#76856c" stroke-width="8"/><path d="M12-9h45v11H12Z" fill="#788b70"/></g>' +
      '<path d="M557 330h53l-8 41h-37Z" fill="#b78060"/><path d="M583 331v-47m0 28c-25 0-31-19-18-27 16 1 23 11 18 27Zm0-13c23 1 28-20 15-27-17 3-21 14-15 27Z" fill="#82966a" stroke="#6b815c" stroke-width="2"/>' +
      '<path d="M0 0h720v420H0Z" opacity=".5" filter="url(#' + id + '-grain)"/></svg>' +
      '<button type="button" class="dream-pot-touch" data-dream-action="water" aria-label="Полить семечко"></button></div>' +
      '<div class="dream-actions"><button type="button" class="dream-action" data-dream-action="water">Полить семечко</button><button type="button" class="dream-action dream-action-quiet" data-dream-action="garden-reset">Начать заново</button></div>';
  }

  function mount(container) {
    if (!container || typeof container.querySelector !== 'function') throw new TypeError('RoomDreams.mount needs an element');
    if (mounts.has(container)) mounts.get(container)();
    var id = 'room-dream-' + (++instance);
    var state = { scene: -1, lamps: 0, growth: 0 };
    var sceneElements = [];
    var sceneCleanups = [];
    var sceneStatus = ['Две чашки. И целый вечер впереди.', 'Пока горят 0 из 5 фонарей.', 'Всё начинается с маленького семечка.'];
    var wateringAnimation = null;
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var abort = new AbortController();
    container.innerHTML = '<section class="dreams" aria-label="Проектор маленьких мечт">' +
      '<p class="dream-eyebrow">Плёнка о том, что ещё может быть</p>' +
      '<div class="dream-tabs" role="tablist" aria-label="Выбери мечту">' + scenes.map(function (s, i) {
        return '<button type="button" class="dream-tab" role="tab" id="' + id + '-tab-' + i + '" aria-controls="' + id + '-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? '0' : '-1') + '" data-dream-tab="' + i + '"><span class="dream-tab-number">0' + (i + 1) + '</span><span>' + s.title + '</span></button>';
      }).join('') + '</div>' +
      '<div class="dream-panel" id="' + id + '-panel" role="tabpanel" aria-labelledby="' + id + '-tab-0"><p class="dream-description"></p><div class="dream-scene-content"></div><p class="dream-hint"></p><p class="dream-status" role="status" aria-live="polite"></p></div>' +
      '<label class="dream-film-label" for="' + id + '-film"><span>Прокрути плёнку</span><span class="dream-film-count" aria-hidden="true">01 / 03</span></label><input class="dream-film" id="' + id + '-film" type="range" min="0" max="2" step="1" value="0" aria-valuetext="Чай после дождя"/><p class="dream-note">Это маленькие мечты о будущем.</p></section>';

    var root = container.querySelector('.dreams');
    var panel = root.querySelector('.dream-panel');
    var content = root.querySelector('.dream-scene-content');
    var status = root.querySelector('.dream-status');
    var slider = root.querySelector('.dream-film');
    var tabs = Array.from(root.querySelectorAll('[data-dream-tab]'));
    var fog = null;

    function announce(message, index) {
      index = typeof index === 'number' ? index : state.scene;
      sceneStatus[index] = message;
      if (index === state.scene) status.textContent = message;
    }

    function show(index) {
      index = Math.max(0, Math.min(2, Number(index) || 0));
      if (index === state.scene) return;
      if (state.scene === 0 && fog) fog.stop();
      if (wateringAnimation) { wateringAnimation.cancel(); wateringAnimation = null; }
      var isNew = !sceneElements[index];
      state.scene = index;
      tabs.forEach(function (tab, i) { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
      panel.setAttribute('aria-labelledby', id + '-tab-' + index);
      root.querySelector('.dream-description').textContent = scenes[index].description;
      root.querySelector('.dream-hint').textContent = scenes[index].hint;
      root.querySelector('.dream-film-count').textContent = '0' + (index + 1) + ' / 03';
      slider.value = String(index);
      slider.setAttribute('aria-valuetext', scenes[index].title);
      if (isNew) {
        sceneElements[index] = document.createElement('div');
        sceneElements[index].className = 'dream-view';
        sceneElements[index].innerHTML = index === 0 ? teaArt(id + '-tea') : index === 1 ? walkArt(id + '-walk') : gardenArt(id + '-garden');
      }
      content.replaceChildren(sceneElements[index]);
      status.textContent = sceneStatus[index];
      if (index === 0 && isNew) setupFog();
      else if (index === 0 && fog) fog.resize();
      if (index === 1 && isNew) setupWalk();
    }

    function setupFog() {
      var canvas = content.querySelector('.dream-fog');
      var context = canvas.getContext('2d');
      if (!context) return;
      var drawing = false;
      var previous = null;
      var hasDrawn = false;
      var logicalWidth = 1;
      var logicalHeight = 1;
      var frame = 0;
      var points = [];

      function stop() {
        drawing = false;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        flush();
        previous = null;
      }

      function mist() {
        stop();
        canvas.classList.remove('is-clear');
        context.globalCompositeOperation = 'source-over';
        context.clearRect(0, 0, logicalWidth, logicalHeight);
        var gradient = context.createLinearGradient(0, 0, logicalWidth, logicalHeight);
        gradient.addColorStop(0, 'rgba(215,222,212,.86)');
        gradient.addColorStop(1, 'rgba(190,205,196,.76)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, logicalWidth, logicalHeight);
        context.fillStyle = 'rgba(83,109,99,.7)';
        context.textAlign = 'center';
        context.font = 'italic ' + Math.max(10, logicalWidth * .055) + 'px Georgia, serif';
        context.fillText('нарисуй здесь что-нибудь', logicalWidth / 2, logicalHeight * .54);
        hasDrawn = false;
      }

      function size() {
        var box = canvas.getBoundingClientRect();
        if (!canvas.isConnected || box.width < 1 || box.height < 1) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = Math.max(1, Math.round(box.width * dpr));
        var height = Math.max(1, Math.round(box.height * dpr));
        if (canvas.width === width && canvas.height === height) return;
        var old = null;
        if (logicalWidth > 1) {
          old = document.createElement('canvas');
          old.width = canvas.width; old.height = canvas.height;
          old.getContext('2d').drawImage(canvas, 0, 0);
        }
        canvas.width = width; canvas.height = height;
        logicalWidth = Math.max(1, box.width); logicalHeight = Math.max(1, box.height);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (old) context.drawImage(old, 0, 0, old.width, old.height, 0, 0, logicalWidth, logicalHeight);
        else mist();
      }

      function flush() {
        frame = 0;
        if (!points.length) return;
        if (!canvas.isConnected || root.classList.contains('dream-is-paused')) { points.length = 0; return; }
        var box = canvas.getBoundingClientRect();
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = Math.max(18, logicalWidth * .11);
        context.lineCap = 'round'; context.lineJoin = 'round';
        context.beginPath();
        points.forEach(function (point) {
          var current = { x: point.x - box.left, y: point.y - box.top };
          if (!previous) context.moveTo(current.x + .1, current.y);
          else context.lineTo(previous.x, previous.y);
          context.lineTo(current.x, current.y);
          previous = current;
        });
        context.stroke();
        points.length = 0;
        if (!hasDrawn) { announce('За окном становится светлее.', 0); hasDrawn = true; }
      }
      function erase(event) {
        var events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
        if (!events.length) events = [event];
        events.slice(-64).forEach(function (point) { points.push({ x: point.clientX, y: point.clientY }); });
        if (points.length > 256) points.splice(0, points.length - 256);
        if (!frame) frame = requestAnimationFrame(flush);
      }
      canvas.addEventListener('pointerdown', function (event) {
        if (event.isPrimary === false || (event.button && event.pointerType !== 'touch')) return;
        drawing = true; previous = null;
        try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
        erase(event);
      });
      canvas.addEventListener('pointermove', function (event) { if (drawing) erase(event); });
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
      canvas.addEventListener('lostpointercapture', stop);
      size();
      var observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
      if (observer) observer.observe(canvas);
      sceneCleanups.push(function () { stop(); if (observer) observer.disconnect(); });
      fog = {
        clear: function () { stop(); canvas.classList.add('is-clear'); announce('Теперь видно весь вечерний сад.', 0); },
        mist: mist,
        resize: size,
        stop: stop
      };
    }

    function setLamps(count) {
      state.lamps = Math.max(0, Math.min(5, count));
      content.querySelectorAll('[data-lamp]').forEach(function (lamp, i) { lamp.classList.toggle('is-lit', i < state.lamps); });
      var next = content.querySelector('[data-dream-action="lamp-next"]');
      next.setAttribute('aria-disabled', String(state.lamps === 5));
      next.textContent = state.lamps === 5 ? 'Дорожка освещена' : 'Зажечь следующий фонарь';
      content.querySelector('.dream-walk-prompt').classList.toggle('is-hidden', state.lamps > 0);
      announce(state.lamps === 5 ? 'Все пять горят. Можно идти сколько хочется.' : 'Горят ' + state.lamps + ' из 5 фонарей.', 1);
    }

    function setupWalk() {
      var surface = content.querySelector('.dream-walk-scene');
      var touching = false;
      function light(event) {
        var box = surface.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width * 720;
        var count = lampPoints.filter(function (point) { return point[0] <= x + 45; }).length;
        if (count > state.lamps) setLamps(count);
      }
      surface.addEventListener('pointerdown', function (event) {
        if (event.isPrimary === false || (event.button && event.pointerType !== 'touch')) return;
        touching = true;
        try { surface.setPointerCapture(event.pointerId); } catch (_) {}
        light(event);
      });
      surface.addEventListener('pointermove', function (event) { if (touching || event.pointerType === 'mouse') light(event); });
      surface.addEventListener('pointerup', function () { touching = false; });
      surface.addEventListener('pointercancel', function () { touching = false; });
      surface.addEventListener('lostpointercapture', function () { touching = false; });
    }

    var growthWords = ['Всё начинается с маленького семечка.', 'Первый росток. Совсем маленький, но уже живой.', 'Появились листочки. Забота работает.', 'Ещё немного света, воды и терпения.', 'Уже бутон. Хорошее не обязано случаться сразу.', 'Он расцвёл. Пусть хорошего впереди будет больше.'];
    function grow(reset) {
      state.growth = reset ? 0 : Math.min(5, state.growth + 1);
      var art = content.querySelector('.dream-garden-scene');
      if (!art) return;
      art.dataset.growth = String(state.growth);
      if (wateringAnimation) { wateringAnimation.cancel(); wateringAnimation = null; }
      var drops = art.querySelector('.dream-water-drops');
      if (!reset && !motionPreference.matches && !root.classList.contains('dream-is-paused') && typeof drops.animate === 'function') {
        wateringAnimation = drops.animate([
          { opacity: 0, transform: 'translateY(-18px)', offset: 0 },
          { opacity: .9, transform: 'translateY(-4px)', offset: .3 },
          { opacity: .7, transform: 'translateY(16px)', offset: .8 },
          { opacity: 0, transform: 'translateY(26px)', offset: 1 }
        ], { duration: 850, easing: 'ease-in' });
        var activeWatering = wateringAnimation;
        activeWatering.onfinish = function () { if (wateringAnimation === activeWatering) wateringAnimation = null; };
      }
      content.querySelectorAll('[data-dream-action="water"]').forEach(function (button) {
        button.setAttribute('aria-disabled', String(state.growth === 5));
        button.setAttribute('aria-label', state.growth === 5 ? 'Цветок расцвёл' : 'Полить растение');
        if (button.classList.contains('dream-action')) button.textContent = state.growth === 5 ? 'Цветок расцвёл' : state.growth === 0 ? 'Полить семечко' : 'Полить ещё немного';
      });
      content.querySelector('.dream-illustration').setAttribute('aria-label', state.growth === 5 ? 'Распустившийся розовый цветок в глиняном горшке' : 'Растение в горшке, этап роста ' + state.growth + ' из 5');
      announce(growthWords[state.growth], 2);
    }

    root.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-dream-tab]');
      if (tab && root.contains(tab)) { show(tab.dataset.dreamTab); return; }
      var button = event.target.closest('[data-dream-action]');
      if (!button || !root.contains(button) || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
      var action = button.dataset.dreamAction;
      if (action === 'mug') {
        var hot = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(hot));
        button.setAttribute('aria-label', button.dataset.mugName + (hot ? ': убрать пар' : ': согреть чай'));
        button.classList.toggle('is-hot', hot);
        var hotCount = content.querySelectorAll('.dream-mug.is-hot').length;
        announce(hotCount === 2 ? 'Чай тёплый. Обе чашки ждут.' : hotCount ? 'Одна чашка уже согрета.' : 'Две чашки. И целый вечер впереди.', 0);
      }
      if (action === 'clear-window' && fog) fog.clear();
      if (action === 'fog-window' && fog) { fog.mist(); announce('Можно нарисовать что-нибудь новое.', 0); }
      if (action === 'lamp-next') setLamps(state.lamps + 1);
      if (action === 'lamp-reset') setLamps(0);
      if (action === 'water') grow(false);
      if (action === 'garden-reset') grow(true);
    }, { signal: abort.signal });

    root.addEventListener('keydown', function (event) {
      var tab = event.target.closest('[data-dream-tab]');
      if (!tab) return;
      var index = Number(tab.dataset.dreamTab);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (index + 1) % 3;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (index + 2) % 3;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = 2;
      else return;
      event.preventDefault(); show(index); tabs[index].focus();
    }, { signal: abort.signal });

    slider.addEventListener('input', function () { show(slider.value); }, { signal: abort.signal });
    var visibilityObserver = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (entries) {
      var visible = entries.some(function (entry) { return entry.isIntersecting; });
      root.classList.toggle('dream-is-paused', !visible);
      if (!visible) {
        if (fog) fog.stop();
        if (wateringAnimation && wateringAnimation.playState === 'running') wateringAnimation.pause();
      } else if (wateringAnimation && wateringAnimation.playState === 'paused') wateringAnimation.play();
    }, { threshold: .01 }) : null;
    if (visibilityObserver) visibilityObserver.observe(root);
    mounts.set(container, function () {
      sceneCleanups.forEach(function (cleanup) { cleanup(); });
      if (visibilityObserver) visibilityObserver.disconnect();
      if (wateringAnimation) wateringAnimation.cancel();
      abort.abort();
    });
    show(0);
  }

  window.RoomDreams = { mount: mount };
})();
