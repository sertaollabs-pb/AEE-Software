const TR = [
  {
    id: 'mouse',
    nome: 'Aprendendo a usar o mouse',
    ic: '🖱️',
    at: [
      { n: 'Clicar na estrela', k: 'click', o: ['⭐'], c: 0, i: 'Clique na estrela.' },
      { n: 'Clicar na cor', k: 'click', o: ['🔴', '🟢', '🔵'], c: 1, i: 'Clique no círculo verde.' },
      { n: 'Clicar no desenho', k: 'click', o: ['🐶', '🐱', '🐟'], c: 2, i: 'Clique no peixe.' },
      { n: 'Arrastar objetos', k: 'drag', i: 'Arraste a bola até a caixa.' }
    ]
  },
  {
    id: 'teclado',
    nome: 'Aprendendo a usar o teclado',
    ic: '⌨️',
    at: [
      { n: 'Conhecendo as teclas', k: 'key', c: 'a', i: 'Aperte a tecla A.' },
      { n: 'Usando o espaço', k: 'key', c: ' ', i: 'Aperte a barra de espaço.' },
      { n: 'Usando o Enter', k: 'key', c: 'enter', i: 'Aperte a tecla Enter.' },
      { n: 'Digitando uma palavra', k: 'type', c: 'BOLA', i: 'Digite a palavra BOLA.' }
    ]
  }
];

const S = { v: 'home', m: 'guiado', t: 0, a: 0, tent: 0, typed: '', done: false, help: false, hint: false };
let P = { nome: '', fs: 112, hc: 0 };

try {
  P = Object.assign(P, JSON.parse(localStorage.getItem('iw') || '{}'));
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem('iw', JSON.stringify(P));
  } catch (e) {}
};

const $ = s => document.querySelector(s);
const cur = () => TR[S.t].at[S.a];
const prog = t => TR[t].at.filter((_, i) => P['p' + t + i]).length;

function say(t) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'pt-BR';
    u.rate = .9;
    speechSynthesis.speak(u);
  } catch (e) {}
}

function style() {
  document.documentElement.style.fontSize = P.fs + '%';
  document.body.classList.toggle('hc', !!P.hc);
}

function go(v, x = {}) {
  Object.assign(S, { v }, x);
  render();
  scrollTo(0, 0);
}

function bar(n, t) {
  return `<div class="bar" role="progressbar" aria-valuenow="${n}" aria-valuemax="${t}"><i style="width:${(n / t) * 100}%"></i></div>`;
}

function render() {
  style();
  $('#nav').innerHTML = [['home', '🏠 Início'], ['prog', '📊 Progresso'], ['ajuda', '❓ Ajuda']]
    .map(([v, l]) => `<button data-go="${v}" class="${S.v == v ? 'on' : ''}">${l}</button>`)
    .join('');

  const A = $('#app');
  if (S.v == 'home') A.innerHTML = home();
  else if (S.v == 'prog') A.innerHTML = progView();
  else if (S.v == 'ajuda') A.innerHTML = ajuda();
  else {
    A.innerHTML = ativ();
    bindAtiv();
  }
}

function home() {
  return `
<h1>${P.nome ? 'Olá, ' + P.nome + '!' : 'Bem-vindo ao IncluiWeb'}</h1>
${P.nome ? '' : `<div class="card"><label for="nm"><b>Qual é o seu nome?</b></label><div class="row" style="margin-top:8px"><input id="nm" type="text" autocomplete="off"><button class="p" data-act="nome">Salvar</button></div></div>`}
<h2>Como você quer fazer?</h2>
<div class="row">
<button class="${S.m == 'guiado' ? 'p' : ''}" data-m="guiado">🧭 Modo Guiado<br><span class="mut" style="font-weight:400">Eu mostro o caminho</span></button>
<button class="${S.m == 'auto' ? 'p' : ''}" data-m="auto">🚀 Modo Autônomo<br><span class="mut" style="font-weight:400">Eu faço sozinho</span></button></div>
<h2>Escolha uma trilha</h2>
${TR.map((t, i) => `<div class="card"><div class="ins">${t.ic} ${t.nome}</div><p class="mut">${prog(i)} de ${t.at.length} atividades feitas</p>${bar(prog(i), t.at.length)}
<button class="p" style="width:100%;margin-top:12px" data-start="${i}">${prog(i) ? 'Continuar' : 'Começar'}</button></div>`).join('')}
<p class="mut">Versão beta. Trilhas de navegação, formulários, arquivos e segurança digital virão depois.</p>`;
}

function ativ() {
  const a = cur(), T = TR[S.t];
  return `
<div class="top"><button data-act="voltar">⬅ Voltar</button><button data-act="inicio">🏠 Início</button></div>
<h1 style="margin-top:14px">${a.n}</h1>
<p class="mut">${T.nome} · Atividade ${S.a + 1} de ${T.at.length} · ${S.m == 'guiado' ? 'Modo Guiado' : 'Modo Autônomo'}</p>
${bar(S.a, T.at.length)}
<div class="card">
${S.m == 'guiado' ? `<p class="mut"><b>Passo 1 de 2:</b> procure o que está brilhando.<br><b>Passo 2 de 2:</b> faça o que a instrução pede.</p>` : ''}
<p class="ins" id="ins">${a.i}</p>
<div class="row"><button data-act="ouvir">🔊 Ouvir instrução</button><button data-act="ajuda">🙋 Preciso de ajuda</button></div>
${S.help ? `<div class="row" style="margin-top:10px"><button data-h="n1">Não sei o que fazer</button><button data-h="n2">Não entendi</button><button data-h="n3">Repetir instrução</button><button data-h="n4">Voltar</button></div>` : ''}
</div>
<div class="card"><div class="stage" id="stage">${stage(a)}</div>
${a.k == 'type' ? `<div class="word" aria-live="polite">${[...a.c].map((_, i) => `<span>${S.typed[i] || '&nbsp;'}</span>`).join('')}</div>` : ''}
<div class="fb ${S.done ? 'ok' : ''}" id="fb" role="status"></div>
${S.done ? `<button class="p" style="width:100%" data-act="prox">${S.a + 1 < T.at.length ? 'Próxima atividade ➜' : 'Concluir trilha ✔'}</button>` : ''}
${(a.k == 'key' || a.k == 'type') && !S.done ? kb() : ''}</div>`;
}

function stage(a) {
  const hl = S.m == 'guiado' || S.hint;
  if (a.k == 'click') return a.o.map((o, i) => `<button class="t ${hl && i == a.c ? 'pulse' : ''}" data-opt="${i}" aria-label="opção ${i + 1}">${o}</button>`).join('');
  if (a.k == 'drag') return `<span class="ball ${hl ? 'pulse' : ''}" id="ball" tabindex="0" role="button" aria-label="bola">⚽</span><div class="box" id="box">📦 Caixa</div>`;
  return `<p class="mut" style="text-align:center">Use o teclado do aparelho ou o teclado abaixo.</p>`;
}

function kb() {
  const a = cur(), hl = (S.m == 'guiado' || S.hint);
  const want = a.k == 'key' ? a.c : a.c[S.typed.length]?.toLowerCase();
  const ks = 'abcdefghijklmnopqrstuvwxyz'.split('').map(l => `<button data-key="${l}" class="${hl && want == l ? 'pulse' : ''}">${l.toUpperCase()}</button>`).join('');
  return `<div class="kb">${ks}<button data-key="backspace">⌫</button><button class="w ${hl && want == ' ' ? 'pulse' : ''}" data-key=" ">Espaço</button><button class="w ${hl && want == 'enter' ? 'pulse' : ''}" data-key="enter">Enter</button></div>`;
}

function fb(t, ok) {
  const e = $('#fb');
  if (e) {
    e.textContent = t;
    e.className = 'fb' + (ok ? ' ok' : '');
  }
}

function win() {
  S.done = true;
  S.help = false;
  const k = 'p' + S.t + S.a;
  P[k] = 1;
  P['t' + S.t + S.a] = (P['t' + S.t + S.a] || 0) + S.tent + 1;
  save();
  render();
  fb('Muito bem! 🎉', 1);
  say('Muito bem!');
}

function miss() {
  S.tent++;
  fb('Quase! Tente de novo. 💪');
  say('Tente de novo.');
}

function keyIn(k) {
  const a = cur();
  if (S.done) return;
  k = k.toLowerCase();
  if (a.k == 'key') {
    k == a.c ? win() : miss();
  } else if (a.k == 'type') {
    if (k == 'backspace') {
      S.typed = S.typed.slice(0, -1);
      return render();
    }
    if (k.length != 1) return;
    const w = a.c.toLowerCase();
    if (k == w[S.typed.length]) {
      S.typed += k.toUpperCase();
      S.typed.length == w.length ? win() : render();
    } else miss();
  }
}

function bindAtiv() {
  const b = $('#ball');
  if (!b) return;
  let sx, sy, dr = 0;
  b.onpointerdown = e => {
    dr = 1;
    sx = e.clientX;
    sy = e.clientY;
    b.setPointerCapture(e.pointerId);
  };
  b.onpointermove = e => {
    if (dr) b.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px)`;
  };
  b.onpointerup = e => {
    if (!dr) return;
    dr = 0;
    const r = b.getBoundingClientRect(), x = $('#box').getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx > x.left && cx < x.right && cy > x.top && cy < x.bottom) {
      b.style.display = 'none';
      win();
    } else {
      b.style.transform = '';
      miss();
    }
  };
}

function progView() {
  return `<h1>Meu Progresso</h1>${TR.map((t, i) => `<div class="card"><div class="ins">${t.ic} ${t.nome}</div><p class="mut">${prog(i)} de ${t.at.length} concluídas · ${prog(i) == t.at.length ? 'Trilha concluída' : 'Em andamento'}</p>${bar(prog(i), t.at.length)}
<ul style="padding-left:1.2em">${t.at.map((a, j) => `<li>${P['p' + i + j] ? '✅' : '⬜'} ${a.n}${P['p' + i + j] ? ` <span class="mut">(${P['t' + i + j] || 1} tentativa${(P['t' + i + j] || 1) > 1 ? 's' : ''})</span>` : ''}</li>`).join('')}</ul></div>`).join('')}
<button data-act="reset">Apagar meu progresso</button>`;
}

function ajuda() {
  return `<h1>Ajuda</h1>
<div class="card"><h2 style="margin-top:0">Tamanho do texto</h2><div class="row"><button data-fs="-10">A−</button><button data-fs="10">A+</button></div>
<h2>Cores</h2><div class="row"><button data-act="hc">${P.hc ? 'Desligar' : 'Ligar'} alto contraste</button></div></div>
<div class="card"><h2 style="margin-top:0">Como usar</h2><p>1. Escolha o Modo Guiado ou Autônomo.<br>2. Escolha uma trilha.<br>3. Leia ou ouça a instrução.<br>4. Se precisar, toque em “Preciso de ajuda”.</p></div>`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button,[data-opt]');
  if (!b) return;
  const d = b.dataset;
  if (d.go) go(d.go);
  else if (d.m) {
    S.m = d.m;
    render();
  } else if (d.start !== undefined) {
    const t = +d.start, f = TR[t].at.findIndex((_, i) => !P['p' + t + i]);
    go('at', { t, a: f < 0 ? 0 : f, tent: 0, typed: '', done: false, help: false, hint: false });
    say(cur().i);
  } else if (d.opt !== undefined) {
    S.done || (+d.opt == cur().c ? win() : miss());
  } else if (d.key) keyIn(d.key);
  else if (d.fs) {
    P.fs = Math.min(160, Math.max(90, P.fs + +d.fs));
    save();
    render();
  } else if (d.h) {
    const h = d.h;
    if (h == 'n1') {
      S.hint = true;
      render();
      say('Olhe o que está brilhando. ' + cur().i);
    } else if (h == 'n2') {
      S.hint = true;
      render();
      say('Vamos de novo, com calma. ' + cur().i);
    } else if (h == 'n3') {
      say(cur().i);
    } else go('home');
  } else if (d.act) {
    const a = d.act;
    if (a == 'nome') {
      const v = $('#nm').value.trim();
      if (v) {
        P.nome = v;
        save();
        render();
      }
    } else if (a == 'ouvir') say(cur().i);
    else if (a == 'ajuda') {
      S.help = !S.help;
      render();
    } else if (a == 'voltar' || a == 'inicio') {
      if (S.done || confirm('Sair desta atividade?')) go('home');
    } else if (a == 'prox') {
      if (S.a + 1 < TR[S.t].at.length) go('at', { a: S.a + 1, tent: 0, typed: '', done: false, help: false, hint: false }), say(cur().i);
      else go('prog');
    } else if (a == 'hc') {
      P.hc = P.hc ? 0 : 1;
      save();
      render();
    } else if (a == 'reset') {
      if (confirm('Apagar todo o progresso?')) {
        P = { nome: P.nome, fs: P.fs, hc: P.hc };
        save();
        render();
      }
    }
  }
});

document.addEventListener('keydown', e => {
  if (S.v != 'at' || e.target.tagName == 'INPUT') return;
  const a = cur();
  if (a.k == 'type' || a.k == 'key') {
    if (e.key == 'Enter' && e.target.tagName == 'BUTTON' && a.c != 'enter') return;
    e.preventDefault();
    keyIn(e.key);
  }
});

render();
