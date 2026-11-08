import { Chess } from './lib/chess.js';
const $ = (id) => document.getElementById(id);
const LEVELS = { easy: { depth: 4, skill: 2 }, medium: { depth: 10, skill: 10 }, hard: { depth: 16, skill: 20 } };
const GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
const G = { chess: new Chess(), sel: null, flip: false, human: 'w', hint: true, ai: true, lvl: LEVELS.medium, hintMove: null };

// ---- engine (single Stockfish worker, latest request wins) ----
const sf = new Worker('lib/stockfish.js');
let cur = null, pend = null;
sf.postMessage('uci');
function run(j) {
  cur = j;
  sf.postMessage(`setoption name Skill Level value ${j.skill}`);
  sf.postMessage(`position fen ${j.fen}`);
  sf.postMessage(`go depth ${j.depth}`);
}
function ask(j) { if (cur) { pend = j; sf.postMessage('stop'); } else run(j); }
sf.onmessage = (e) => {
  const m = /^bestmove (\S+)/.exec(String(e.data)); if (!m) return;
  const j = cur; cur = null;
  if (pend) { const p = pend; pend = null; run(p); } else if (j && m[1].length >= 4) j.cb(m[1]);
};

function think() {
  const c = G.chess; if (c.isGameOver()) return;
  const fen = c.fen(), aiTurn = G.ai && c.turn() !== G.human;
  if (!aiTurn && !G.hint) return;
  ask({ fen, depth: aiTurn ? G.lvl.depth : 14, skill: aiTurn ? G.lvl.skill : 20, cb: (mv) => {
    if (G.chess.fen() !== fen) return;
    if (aiTurn) { G.chess.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: mv[4] }); G.sel = null; G.hintMove = null; render(); think(); }
    else { G.hintMove = mv; render(); }
  } });
}

// ---- UI ----
function render() {
  const c = G.chess, b = c.board(), el = $('board'); el.replaceChildren();
  const targets = G.sel ? c.moves({ square: G.sel, verbose: true }).map((m) => m.to) : [];
  const h = c.history({ verbose: true }), lm = h[h.length - 1];
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const rr = G.flip ? 7 - r : r, ff = G.flip ? 7 - f : f, name = 'abcdefgh'[ff] + (8 - rr), p = b[rr][ff];
    const d = document.createElement('div');
    d.className = 'sq ' + ((rr + ff) % 2 ? 'dark' : 'light') + (lm && (lm.from === name || lm.to === name) ? ' last' : '') +
      (G.sel === name ? ' sel' : '') + (targets.includes(name) ? ' target' : '');
    if (p) { const s = document.createElement('span'); s.className = p.color; s.textContent = GLYPH[p.type]; d.appendChild(s); }
    d.onclick = () => tap(name);
    el.appendChild(d);
  }
  drawArrow();
  $('status').textContent = c.isCheckmate() ? `Checkmate - ${c.turn() === 'w' ? 'Black' : 'White'} wins`
    : c.isDraw() ? 'Draw' : `${c.turn() === 'w' ? 'White' : 'Black'} to move${c.inCheck() ? ' (check)' : ''}`;
}
function drawArrow() {
  const mv = G.hintMove, s = $('arrows'); s.replaceChildren();
  if (!mv || !G.hint || G.chess.isGameOver()) return;
  const ctr = (sq) => { const f = sq.charCodeAt(0) - 97, rk = +sq[1] - 1; return [(G.flip ? 7 - f : f) + .5, (G.flip ? rk : 7 - rk) + .5]; };
  const [x1, y1] = ctr(mv.slice(0, 2)), [x2, y2] = ctr(mv.slice(2, 4));
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, bx = x2 - ux * .32, by = y2 - uy * .32;
  s.innerHTML = `<g opacity=".85"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="#22c55e" stroke-width=".16" stroke-linecap="round"/>` +
    `<polygon points="${x2 - ux * .05},${y2 - uy * .05} ${bx - uy * .21},${by + ux * .21} ${bx + uy * .21},${by - ux * .21}" fill="#22c55e"/></g>`;
}
function tap(sq) {
  const c = G.chess; if (c.isGameOver() || (G.ai && c.turn() !== G.human)) return;
  if (G.sel && c.moves({ square: G.sel, verbose: true }).some((m) => m.to === sq)) {
    c.move({ from: G.sel, to: sq, promotion: 'q' }); G.sel = null; G.hintMove = null; render(); think(); return;
  }
  const p = c.get(sq); G.sel = p && p.color === c.turn() ? sq : null; render();
}
function newGame() { G.chess.reset(); G.sel = null; G.hintMove = null; render(); think(); }

$('new').onclick = newGame;
$('undo').onclick = () => { const c = G.chess; c.undo(); if (G.ai && c.turn() !== G.human) c.undo(); G.sel = null; G.hintMove = null; render(); think(); };
$('flip').onclick = () => { G.flip = !G.flip; render(); };
$('hint').onchange = (e) => { G.hint = e.target.checked; G.hintMove = null; render(); think(); };
$('mode').onchange = (e) => { G.ai = e.target.value === 'ai'; G.hintMove = null; render(); think(); };
$('level').onchange = (e) => { G.lvl = LEVELS[e.target.value]; };
$('side').onchange = (e) => { G.human = e.target.value; G.flip = G.human === 'b'; newGame(); };
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js');
render(); think();
