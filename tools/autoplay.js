/**
 * 자동 플레이 테스트 (브라우저에서 실행)
 *   1) npm run web → http://localhost:5175/?debug 로 연 뒤
 *   2) 개발자 도구 콘솔에서:
 *        const { autoplay } = await import('/tools/autoplay.js');
 *        await autoplay({ episode: 'm1_spring', bad: true });
 * 에피소드를 처음부터 결과 화면까지 자동으로 진행하며, 실행 중 오류를 모아 돌려줍니다.
 * 에피소드 id 는 js/data/episodes/index.js 의 EPISODES 와 ENDING 에서 고릅니다.
 * bad: true 이면 판단 카드마다 나쁜 선택을 먼저 모두 골라 '결과 장면 → 아차! → 되감기'까지 검사합니다.
 * 엔딩(ENDING)은 결과 화면 대신 근무표에 닿으면 끝납니다.
 * timeout: true 이면 시간 제한 막대가 있는 판단·미니게임마다 한 번은 아무것도 누르지 않고 시간이 다 되게 둡니다(시간 초과 → 아차 → 되감기 검사).
 * respond: 단골 대응(respond 비트, 카드 순서는 볼 때마다 섞임)에서 고를 대응 'best'(맞음) · 'ok'(무난) · 'miss'(어긋남) · 'random'.
 *   hint: true 이면 대응마다 [힌트 다시 보기]를 한 번 누른 뒤 고릅니다. 결과의 touch 는 선택 기억 'touch'(단골 신뢰의 바탕).
 * 미니게임은 ?debug 일 때 미니게임이 열어 두는 고리로 풉니다: window.__mgAuto(끝까지 풀기) · window.__mgBad(실수 한 번, 아차 카드를 기다리지 않음).
 *   고리가 없는 미니게임을 만나면 errors 에 적고 멈춥니다.
 * 브라우저 패널이 숨겨져 있으면 requestAnimationFrame 이 멈춰 카드가 is-in 을 못 받습니다(멈춘 것처럼 보임, CLAUDE.md 1장).
 */

import { EPISODES, ENDING } from '/js/data/episodes/index.js';
import { touchOf } from '/js/data/regulars.js';
import { plain, fill } from '/js/core/text.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (s) => document.querySelector(s);

/**
 * 미니게임: bad 이면 종류마다 실수 한 번 먼저(__mgBad → 아차 → 되감기 검사), 그다음 자동 풀이(__mgAuto)
 * 돌려줌: false 면 고리(__mgAuto)가 없어 풀 수 없음
 */
async function solveMini(mg, { bad = false, tried = new Set() } = {}) {
  if (mg.dataset.auto) return true;
  // 종류: 틀(frame.js)에 준 class 그대로(모양 skin 이 다르면 다른 종류로 셈)
  const kind = [...mg.classList].filter((c) => !['mg', 'is-in', 'is-out', 'shake'].includes(c)).join('.') || 'mg';
  if (bad && !tried.has(kind) && window.__mgBad) {
    tried.add(kind);
    await window.__mgBad();
    await wait(300);
    return true;
  }
  if (!window.__mgAuto) return false;
  // 기다리지 않음: 자동 풀이 중에 아차 카드가 뜨면 바깥 고리가 닫아 줌(실시간 미니게임)
  if (!q('#layer-overlay .ov')) { mg.dataset.auto = '1'; window.__mgAuto(); }
  return true;
}

/** 단골 대응에서 고를 선택지: 점수 2 맞음 · 1 무난 · 0 어긋남 (없으면 맞음) */
function pickRespond(choices, mode) {
  if (mode === 'random') return choices[Math.floor(Math.random() * choices.length)];
  const score = { best: 2, ok: 1, miss: 0 }[mode] ?? 2;
  return choices.find((c) => c.score === score) || choices.find((c) => c.score === 2) || choices[0];
}

export async function autoplay({ episode = null, bad = false, timeout = false, respond = 'best', hint = false, delay = 40, maxSteps = 6000 } = {}) {
  const J = window.__jm;
  if (!J) throw new Error('?debug 로 열어 주세요');
  if (episode && !J.getEpisode(episode)) throw new Error(`없는 에피소드: ${episode} (쓸 수 있는 것: ${[...EPISODES, ENDING].map((e) => e.id).join(' ')})`);
  const errors = [];
  const onErr = (e) => errors.push(String(e.message || e.reason || e));
  window.addEventListener('error', onErr);
  window.addEventListener('unhandledrejection', onErr);
  const stats = { steps: 0, decides: 0, responds: 0, hints: 0, fails: 0, minis: 0, timeouts: 0, beatsSeen: new Set() };
  if (!J.store.hasProfile()) J.store.createProfile('자동테스트');
  J.store.setSettings({ textSpeed: 'instant', voice: 'off', motion: 'reduced', auto: 'off', selectMode: 'one' });
  if (episode) { J.nav.go('play', episode); await wait(300); }
  const triedAlt = new Set(); // 두 버튼 아차: 한 번 되감아 본 아차 제목
  const triedMini = new Set();
  const triedTimeout = new Set(); // 시간 초과를 해 본 판단·미니게임
  let noHook = 0; // 고리 없는 미니게임 앞에서 기다린 걸음
  const hinted = new Set(); // [힌트 다시 보기]를 눌러 본 대응 기회

  try {
    while (stats.steps++ < maxSteps) {
      await wait(delay);
      const beat = J.runner.currentBeat();
      if (beat) stats.beatsSeen.add(beat);

      if (q('#layer-screen .scr-result')) break;
      // 엔딩은 결과 화면 없이 (처음이면 엔딩 뒤 알림 다음) 근무표로 나감
      if (q('#layer-screen .scr-hub') && !J.runner.isRunning()) break;

      const ov = q('#layer-overlay .ov');
      if (ov) {
        if (ov.classList.contains('ov-oops')) stats.fails += 1;
        // 두 버튼 아차(ov.oops 의 alt): 처음엔 되감기, 같은 아차가 또 나오면 다른 쪽(예: 이대로 계속)
        const alt = ov.querySelector('.oops-btns .btn-soft');
        if (ov.classList.contains('ov-oops') && alt) {
          const title = ov.querySelector('.oops-title')?.textContent || '';
          if (!triedAlt.has(title)) { triedAlt.add(title); ov.querySelector('.btn-rewind').click(); } else alt.click();
          await wait(300);
          continue;
        }
        if (ov.classList.contains('ov-breathe')) {
          (ov.querySelector('.btn-big:not(.is-hidden)') || ov.querySelector('.br-btns .btn-small'))?.click();
          continue;
        }
        if (ov.classList.contains('ov-rewind')) continue;
        (ov.querySelector('.btn-rewind') || ov.querySelector('.act-btn') || ov.querySelector('.btn-big') || ov.querySelector('.ov-next') || ov.querySelector('button'))?.click();
        continue;
      }

      const mg = q('#layer-task .mg.is-in');
      if (mg) {
        // 시간 초과 검사: 막대가 있는 미니게임은 한 번 그냥 둠(막대가 다 줄 때까지)
        const tm = mg.querySelector('.tm');
        const key = `mini:${beat?.id || beat?.name || ''}`;
        if (timeout && tm && !tm.classList.contains('over') && (!triedTimeout.has(key) || mg.dataset.waiting === '1')) {
          if (!triedTimeout.has(key)) { triedTimeout.add(key); mg.dataset.waiting = '1'; stats.timeouts += 1; }
          continue;
        }
        stats.minis += 1;
        if (await solveMini(mg, { bad, tried: triedMini })) { noHook = 0; continue; }
        if (++noHook > 50) { errors.push(`미니게임 ${beat?.name || mg.className}에 자동 풀이 고리(window.__mgAuto)가 없어 멈춤`); break; }
        continue;
      }

      const wrap = q('#layer-task .cards-wrap.is-in');
      // 시간 초과 검사: 막대가 있는 판단은 한 번 그냥 둠(막대가 다 줄 때까지)
      if (wrap && timeout && beat?.t === 'decide' && beat.timer && wrap.querySelector('.tm') && (!triedTimeout.has(beat.id) || wrap.dataset.waiting === '1')) {
        if (!triedTimeout.has(beat.id)) { triedTimeout.add(beat.id); wrap.dataset.waiting = '1'; stats.timeouts += 1; }
        continue;
      }
      if (wrap && beat?.t === 'respond') {
        const key = `${beat.who}.${beat.touch}`;
        if (hint && !hinted.has(key)) {
          hinted.add(key);
          stats.hints += 1;
          wrap.querySelector('.btn-help')?.click();
          await wait(150);
          continue;
        }
        const want = plain(fill(pickRespond(touchOf(beat.who, beat.touch).choices, respond).label));
        stats.responds += 1;
        ([...wrap.querySelectorAll('.card')].find((c) => c.querySelector('.card-label')?.textContent === want) || wrap.querySelector('.card'))?.click();
        await wait(150);
        continue;
      }
      if (wrap) {
        const cards = [...wrap.querySelectorAll('.card')];
        let idx = 0; // 자유 선택(choose)은 첫 카드
        if (beat?.t === 'decide') {
          stats.decides += 1;
          idx = beat.choices.findIndex((c) => c.ok);
          if (bad) {
            const bi = beat.choices.findIndex((c, i) => !c.ok && !wrap.querySelector(`.card[data-i="${i}"]`)?.classList.contains('tried'));
            if (bi >= 0) idx = bi;
          }
        }
        (wrap.querySelector(`.card[data-i="${idx}"]`) || cards[idx])?.click();
        await wait(150);
        continue;
      }
      q('.dlg')?.click();
    }
  } finally {
    window.removeEventListener('error', onErr);
    window.removeEventListener('unhandledrejection', onErr);
  }
  const reachedResult = Boolean(q('#layer-screen .scr-result') || (episode === ENDING.id && q('#layer-screen .scr-hub')));
  return {
    reachedResult, steps: stats.steps, beats: stats.beatsSeen.size, decides: stats.decides, responds: stats.responds, hints: stats.hints,
    fails: stats.fails, minis: stats.minis, timeouts: stats.timeouts, oopsFound: J.store.oopsList().length, touch: J.store.flag('touch') || {}, errors,
  };
}

/** 결과 화면을 지나 다음 에피소드로 넘어가기 */
export async function passResult() {
  for (let i = 0; i < 40; i++) {
    await wait(120);
    const scr = q('#layer-screen .scr-result');
    if (!scr) return 'left';
    const feel = scr.querySelector('.rs-feel-btn');
    if (feel) { feel.click(); continue; }
    const btn = [...scr.querySelectorAll('button')].find((b) => /일기 쓰기|다음 이야기|처음 화면/.test(b.textContent));
    btn?.click();
  }
  return 'stuck';
}

/**
 * 음성 파일 확인: 에피소드를 자동으로 돌리며, 읽어 준 문장마다 미리 만든 음성 파일이 있는지 셉니다.
 *   const { voiceCoverage } = await import('/tools/autoplay.js');
 *   await voiceCoverage();                           // 전체(EPISODES + ENDING, 몇 분 걸릴 수 있음)
 *   await voiceCoverage({ episodes: ['m1_spring'] }); // 한 에피소드만
 * miss 에 나온 문장은 tools/export-lines.mjs(또는 미니게임 xxxLines)에 빠진 것입니다.
 * 이름({player})이 든 문장은 원래 브라우저 음성으로 읽으므로 miss 에 남습니다.
 */
export async function voiceCoverage({ episodes = [...EPISODES, ENDING].map((e) => e.id), bad = true } = {}) {
  const { tts, voiceKey } = await import('/js/av/tts.js');
  const manifest = await fetch('/assets/voice/manifest.json', { cache: 'no-store' }).then((r) => r.json()).then((m) => m.lines || {}).catch(() => ({}));
  const spoken = [];
  const rec = (text, who) => {
    const t = String(text ?? '');
    if (t.trim()) spoken.push({ who, text: t, ok: Boolean(manifest[voiceKey(who, t)]) });
  };
  const orig = { speak: tts.speak, speakSeq: tts.speakSeq };
  tts.speak = (text, who = 'narr') => { rec(text, who); return Promise.resolve(); };
  tts.speakSeq = async (parts, who = 'sys') => { for (const p of parts) rec(p, who); };
  const runs = [];
  try {
    for (const ep of episodes) {
      const r = await autoplay({ episode: ep, bad });
      runs.push({ ep, reachedResult: r.reachedResult, errors: r.errors });
      await passResult();
    }
  } finally {
    Object.assign(tts, orig);
  }
  const miss = [...new Map(spoken.filter((x) => !x.ok).map((x) => [`${x.who} | ${x.text}`, x])).keys()];
  return { files: Object.keys(manifest).length, spoken: spoken.length, withFile: spoken.filter((x) => x.ok).length, miss, runs };
}
