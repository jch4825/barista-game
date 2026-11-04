/**
 * 풀 버전 요청서 만들기: 아직 없는 그림 · 물건 · 블렌더 컷 · 소리 · 음성을 데이터에서 모아 docs/requests_full.md 로
 *   node tools/export-requests.mjs   (npm run requests)
 * 자료: js/data/cg.js(장면 그림) · characters.js(인물) · menu.js(물건 · 손 동작) · assets/(이미 있는 것) ·
 *       tools/requests/prompts_en.mjs(영어 프롬프트) · tools/audio/audio_map.mjs(없는 소리) · docs/추가 제작.md(이미 요청한 것)
 * 그림이 들어오면 다시 돌리면 목록에서 빠집니다. 이 파일이 만든 문서는 직접 고치지 않습니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { CGS } = await imp('js/data/cg.js');
const { CHARS } = await imp('js/data/characters.js');
const { HAND_SKILLS, RECIPES, LEVELS, SERVICE_CUP, CUPS, TEMPS, prepSteps, shotNames, TILT_SKILLS } = await imp('js/data/menu.js');
const { EPISODES, ENDING, getEpisode } = await imp('js/data/episodes/index.js');
const { REGULARS } = await imp('js/data/regulars.js');
const { freeDay } = await imp('js/data/episodes/free.js');
const { PEOPLE_EN, FACE_EN, CG_EN } = await imp('tools/requests/prompts_en.mjs');
const { MISSING } = await imp('tools/audio/audio_map.mjs');
const { BGM_VARIANTS } = await imp('js/av/audio.js');
// 곡 파일이 있는 분위기(2026-11-01 저작자가 AI 음악 모델 Suno로 만든 곡을 넣음): 요청서에서 뺌
let bgmFiles = {};
try { bgmFiles = JSON.parse(fs.readFileSync(path.join(root, 'assets/music/manifest.json'), 'utf8')).bgm || {}; } catch { /* 목록이 없으면 모두 요청 */ }
const bgmHas = (mood) => (BGM_VARIANTS[mood] || [mood]).some((id) => bgmFiles[id]);
const BGM_KO = {
  title: ['처음 화면', '밤바다, 잔잔한 피아노 + 어쿠스틱 기타, 그리움', '1~2분 루프'],
  morning: ['아침 · 새벽 장면', '맑고 느린 어쿠스틱 기타 + 첼레스타, 하루의 시작', '1~2분 루프'],
  cafe: ['가게 안 낮 장면', '부드러운 재즈 피아노 트리오(작게), 대화를 가리지 않게', '2분 루프'],
  warm: ['마감 · 정다운 장면', '따뜻한 피아노 + 현악 패드, 느림', '2분 루프'],
  tension: ['바쁜 날 · 폭설 전', '낮은 현악 스타카토 + 시계 같은 리듬, 무섭지 않게', '1분 루프'],
  peak: ['가을 축제', '아코디언 + 손뼉 + 작은 북, 흥겹지만 시끄럽지 않게', '1분 30초 루프'],
  home: ['도시를 떠나 마을에 오는 장면', '버스 창밖 같은 잔잔한 신스 패드 + 기타', '1분 루프'],
  ending: ['겨울 마지막 날 · 엔딩', '피아노 솔로에서 현악이 더해지는 감동적인 곡, 루프 없이 끝나도 됨', '3~4분'],
  celebrate: ['하루 끝 화면', '짧고 밝은 마무리(실로폰 + 기타)', '30초 루프'],
};

const ls = (dir) => { try { return fs.readdirSync(path.join(root, dir)); } catch { return []; } };
const haveCg = new Set(ls('assets/cg').map((f) => f.replace(/^cg_/, '').replace(/\.jpg$/, '')));
const haveStand = new Set(ls('assets/stand').map((f) => f.replace(/\.webp$/, '')));
const haveObj = new Set(ls('assets/objects').map((f) => f.replace(/\.webp$/, '')));
const shots = JSON.parse(fs.readFileSync(path.join(root, 'assets/shots/shots.json'), 'utf8'));
const extraDoc = fs.readFileSync(path.join(root, 'docs/추가 제작.md'), 'utf8');
const inExtra = new Set([...extraDoc.matchAll(/^\| \d+ \| `([a-z_0-9]+)`/gm)].map((m) => m[1]));

/* ---------- 대본에서: 인물마다 쓰인 표정 · 처음 나오는 날, 쓰인 소리 ---------- */
const faces = {};
const firstEp = {};
const sfxUse = {};
const bgmUse = {};
const ambUse = {};
const count = (map, k, ep) => { if (!k) return; (map[k] ||= new Set()).add(ep); };
function addFace(who, f, ep) {
  if (!who) return;
  (faces[who] ||= new Set()).add(f || 'normal');
  firstEp[who] ||= ep;
}
function walk(list, ep) {
  for (const b of list || []) {
    if (!b || typeof b !== 'object') continue;
    if (b.t === 'say') addFace(b.who, b.face, ep);
    if (b.t === 'show') for (const v of Object.values(b.cast || {})) if (typeof v === 'string') { const [w, f] = v.split(':'); addFace(w, f, ep); }
    if (b.t === 'enter') { const [w, f] = String(b.who).split(':'); addFace(w, f, ep); }
    if (b.t === 'face') addFace(b.who, b.face, ep);
    if (b.t === 'sfx') count(sfxUse, b.name, ep);
    if (b.t === 'bgm') count(bgmUse, b.mood, ep);
    if (b.t === 'amb') count(ambUse, b.kind, ep);
    if (b.t === 'branch') Object.values(b.cases || {}).forEach((l) => walk(l, ep));
    if (b.t === 'choose') (b.options || []).forEach((o) => walk(o.then, ep));
    if (b.t === 'respond') {
      const tc = REGULARS[b.who]?.touches?.[b.touch];
      if (tc) { walk(tc.scene, ep); walk(tc.hints, ep); tc.choices.forEach((c) => walk(c.after, ep)); }
    }
  }
}
for (const ep of [...EPISODES, ENDING]) walk(ep.script, ep.id);
for (let d = 1; d <= 28; d += 1) walk(freeDay(d).script, 'free');
const epLabel = (id) => (id === 'free' ? '자유 영업' : id === 'ending' ? '엔딩' : getEpisode(id)?.label || id);

/* ---------- 문서 ---------- */
const L = [];
const P = (...x) => L.push(...x);
const box = (text) => P('```', text, '```');
const STYLE = 'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution';
const AVOID_P = 'Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.';
const SCENE = 'Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.';
const AVOID_S = 'Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.';
const KNOWN = { jieun: 'JIEUN', owner: 'OWNER', haesun: 'HAESUN', jian: 'JIAN', granddaughter: 'GRANDDAUGHTER', yeonwoo: 'YEONWOO', dohyun: 'DOHYUN', customer: 'a tourist customer' };
const tagOf = (who) => KNOWN[who] || who.toUpperCase();

// 1) 새 인물
// 다른 인물의 스탠딩을 빌려 쓰는 인물(characters.js 의 stand)은 새로 그리지 않음
const newPeople = Object.keys(PEOPLE_EN).filter((id) => !CHARS[id]?.stand && faces[id] && ![...faces[id]].every((f) => haveStand.has(`${id}_${f}`)));
const standCount = newPeople.reduce((n, id) => n + 1 + faces[id].size, 0);
// 2) 장면 그림
const cgMissing = Object.keys(CGS).filter((id) => !haveCg.has(id));
const cgNew = cgMissing.filter((id) => !inExtra.has(id));
const cgOld = cgMissing.filter((id) => inExtra.has(id));
// 3) 물건
const SHEET_MORE = [
  ['obj_decaf', 'a glass jar of dark roasted decaf coffee beans with a plain forest green lid'],
  ['obj_drip_beans', 'a small kraft paper bag of whole coffee beans with a folded top'],
  ['obj_mix', 'three plain golden-yellow instant coffee mix stick packets fanned out'],
  ['obj_barley', 'a glass jar of roasted barley grains with a cork lid'],
  ['obj_yuja', 'a glass jar of bright yellow-orange citron (yuja) tea preserve with thin peel slices'],
  ['obj_strawberry', 'a glass jar of red strawberry preserve with small fruit pieces'],
  ['obj_matcha', 'a small open tin of bright green matcha powder with a small bamboo scoop'],
  ['obj_cocoa', 'a small open tin of dark brown cocoa powder with a small metal scoop'],
  ['obj_hand_grinder', 'a wooden manual hand coffee grinder with a metal crank handle'],
  ['obj_spoon', 'a long stainless steel bar spoon lying diagonally'],
  ['cup_plastic', 'a clear plastic takeaway cup with a flat clear lid and a paper straw, empty'],
];
const objMissing = SHEET_MORE.filter(([id]) => !haveObj.has(id));
// 4) 블렌더 컷: 메뉴 × 온도 × 매장/포장 × 단계마다 작업대가 고를 컷(menu.js 의 shotNames, 컵에 든 것은 brew.js 처럼 그 재료의 마지막 손 동작 뒤에 셈)
//    컷이 없음(임시 그림) · 비슷한 컷으로 대신(다른 잔이나 다른 음료의 컷) · 드래그 활용 그림(tilt · drag)이 없음 을 모음
const ACT = { hold: 'A 누르고 떼기', circle: 'B 원 그리기', beats: 'D 박자', wait: 'G 기다렸다 누르기' };
const shotWant = new Map(); // 있으면 꼭 맞는 컷 이름 → { skill, uses, standIn }
const dragMiss = new Map(); // 컷 이름 → { kind, uses }
const useOf = (r, made) => `${r.name}${r.temps.length > 1 ? ` · ${TEMPS[made.temp].name}` : ''} · ${CUPS[made.cup]?.name || made.cup}`;
const note = (map, key, init, use) => { const e = map.get(key) || init; e.uses.add(use); map.set(key, e); };
for (const r of Object.values(RECIPES)) for (const temp of r.temps) for (const service of Object.keys(SERVICE_CUP)) {
  const made = { cup: r.cup || SERVICE_CUP[service][temp], base: r.base, adds: [...r.adds], temp };
  for (const level of LEVELS) {
    const steps = prepSteps(made, level);
    const soFar = new Set();
    steps.forEach((st, i) => {
      const id = st.skill || (st.auto === 'water' ? 'water' : null); // 저절로 붓는 물도 컷으로 차오름(brew.js autoShot)
      if (id) {
        const { ids, fit } = shotNames(id, made, soFar);
        const at = ids.findIndex((x) => x && shots[x]);
        if (at < 0 || at >= fit) note(shotWant, ids.slice(0, fit).find(Boolean), { skill: id, uses: new Set(), standIn: at < 0 ? null : ids[at] }, useOf(r, made));
        const got = at < 0 ? null : ids[at];
        if (got && st.skill && HAND_SKILLS[id].act === 'hold' && TILT_SKILLS.has(id) && !shots[got].tilt?.patch) note(dragMiss, got, { kind: 'tilt', uses: new Set() }, useOf(r, made));
        if (got && st.skill === 'ice' && !shots[got].drag) note(dragMiss, got, { kind: 'drag_ice', uses: new Set() }, useOf(r, made));
      }
      if (st.auto) soFar.add(st.auto);
      else if (!steps.slice(i + 1).some((x) => x.ing === st.ing)) soFar.add(st.ing);
    });
  }
}
const shotNone = [...shotWant].filter(([, e]) => !e.standIn);
const shotStandIn = [...shotWant].filter(([, e]) => e.standIn);
// 5) 새 놀이의 그림(docs/image_requests.md 8장): 받은 그림을 assets/_src/play/{id}.jpg 로 옮겨 두면 목록에서 빠짐
const PLAY_ART = [
  ['sheet_play', '놀이 시트(그 갈매기 · 배 · 등대 · 물고기 · 자동차 · 버스 · 지은의 가방)', '1:1', '8.2'],
  ['bus_far', '버스 창밖 ① 먼 바다(가장 뒤, 좌우가 이어짐)', '16:9', '8.3'],
  ['bus_hills', '버스 창밖 ② 동산(가운데, 위쪽 절반은 초록 바탕)', '16:9', '8.3'],
  ['bus_window_frame', '버스 창밖 ③ 버스 창틀(맨 앞, 유리 자리는 초록 바탕)', '16:9', '8.3'],
  ['sheet_deco', '꾸미기 · 앞치마 시트', '1:1', '8.4'],
];
const havePlay = new Set(ls('assets/_src/play').map((f) => f.replace(/\.(jpe?g|png|webp)$/i, '')));
const playMissing = PLAY_ART.filter(([id]) => !havePlay.has(id));

P('# 요청서 · 풀 버전 (그림 · 물건 · 블렌더 컷 · 소리 · 음성)', '',
  '> 생성: `npm run requests`(`tools/export-requests.mjs`) · 이 파일은 직접 고치지 않습니다. 그림이 들어오면 다시 돌리면 목록에서 빠집니다.',
  '> 사용자(2026-10-31): "부족한 컴포넌트 예를 들어 이미지, 추가 효과음, 추가 음성 TTS 파일 등은 요청서를 만들면 내PC에서 제작하겠다. 필요 이미지들은 … 대체 요망이라고 적어두면 된다."',
  '> 지금 게임은 이 목록이 없어도 끝까지 돌아갑니다. 없는 그림은 임시 그림(SVG)에 **"임시 그림 · 대체 요망"** 표시가 붙고, 없는 소리는 조용히 넘어갑니다.',
  '> 그림 규칙은 `docs/image_requests.md` 0장 · 6.1과 같습니다(글자 없음 · 빛살 금지 · 사장님 손은 떨림 없이 차분하게 · 얼굴과 손은 위쪽 2/3).', '',
  '## 0. 한눈에', '',
  '| 무엇 | 남은 수 | 넣는 곳 | 그다음 |', '| :--- | :--- | :--- | :--- |',
  `| 인물 스탠딩(새 인물 ${newPeople.length}명) | 설정화 ${newPeople.length} + 표정 ${standCount - newPeople.length}장 | \`assets/_src/stand/{id}_{표정}.jpg\` | \`npm run images\` → \`python tools/face-boxes.py\` |`,
  `| 장면 그림(CG) | 새로 ${cgNew.length}장 + \`docs/추가 제작.md\`에 이미 있는 ${cgOld.length}장 | \`assets/cg/cg_{id}.jpg\` | \`npm run assets\` |`,
  `| 작업대 물건 시트 3 | ${objMissing.length}개를 시트 1장에 | \`assets/_src/objects/sheet_more.jpg\` | \`npm run objects\` |`,
  `| 새 놀이의 그림 | ${playMissing.length}장(${playMissing.map(([id]) => `\`${id}\``).join(' · ') || '없음'}) | \`assets/flow/\`에 두고 알려 주기 → \`assets/_src/play/{id}.jpg\` | 초록 바탕 지우기 · 자르기(그림이 오면 넣는 길을 만듦) |`,
  `| 블렌더 한 컷(손 동작) | 컷이 없는 손 동작 ${shotNone.length} · 🙋 있으면 더 맞는 컷 ${shotStandIn.length}(지금은 비슷한 컷이 나옴) · 드래그 활용 그림 ${dragMiss.size} | \`tools/blender/scene_bench.py\` | \`shots_post.py\` → \`npm run assets\` |`,
  `| 효과음 · 환경음 | 효과음 ${MISSING.sfx.length} · 환경음 ${MISSING.amb.length} | \`tools/audio/audio_map.mjs\` | \`npm run audio\` |`,
  `| 배경음악 | ${Object.keys(BGM_KO).filter((m) => !bgmHas(m)).length}곡(✅ 저작자가 AI 음악 모델 Suno로 만든 곡으로 채움, 2026-11-01) | \`BGM/\` → \`tools/audio/audio_map.mjs\` 의 bgm | \`npm run audio\` |`,
  '| 음성 | 바뀐 줄만 | `tools/voice/lines.json` | `npm run voices` |', '');

/* 1. 인물 */
P('## 1. 인물 스탠딩 (새 인물)', '',
  '만드는 순서는 `docs/image_requests.md` 1장과 같습니다: ① 설정화 → ② 보통(설정화를 참조) → ③ 나머지 표정(보통을 참조). 무대에서 오른쪽을 보고 섭니다.',
  '표정은 대본에 쓰인 것만 적었습니다. 그림이 오기 전에는 임시 초상(SVG)으로 섭니다.', '');
for (const id of newPeople) {
  const c = CHARS[id];
  const fl = [...faces[id]].filter((f) => f !== 'normal');
  P(`### 1.${newPeople.indexOf(id) + 1} ${c.name} — ${c.role} (id \`${id}\`)`, '',
    `- 처음 나오는 날: ${epLabel(firstEp[id])} · 표정: normal${fl.length ? ` + ${fl.join(' · ')}` : ''}`,
    `- 임시 초상 색: 옷 ${c.svg?.outfit || ''} · 강조 ${c.color}`, '',
    `**① 설정화** \`${id}_sheet\` · 1:1`);
  box(`${STYLE}, plain white background.\ncharacter design sheet of ${id.toUpperCase()}, ${PEOPLE_EN[id]}.\nfull-body front view and side view, three expression headshots on the right: calm, warm smile, ${fl.includes('surprised') ? 'surprised' : fl.includes('worried') ? 'worried' : 'thoughtful'}.\nAvoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.`);
  P('', `**② 보통** \`${id}_normal\` · 9:16 · 참조: \`${id}_sheet\``);
  box(`${STYLE}.\n${PEOPLE_EN[id]}.\nfull-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, ${FACE_EN.normal}.\nplain pure white background, whole body visible from head to feet with empty space above the head, single character centered.\nSame face and outfit as the reference image (character sheet).\n${AVOID_P}`);
  if (fl.length) {
    P('', `**③ 나머지 표정** · 9:16 · 참조: \`${id}_normal\` — \`docs/image_requests.md\` 1장 ③의 상자에 아래 문장을 넣습니다.`, '',
      '| id | 표정 | `[표정]`에 넣을 문장 |', '| :--- | :--- | :--- |',
      ...fl.map((f) => `| \`${id}_${f}\` | ${f} | ${FACE_EN[f] || f} |`));
  }
  P('');
}

/* 2. 장면 그림 */
P('## 2. 장면 그림 · 이벤트 CG', '',
  `- 새로 요청하는 ${cgNew.length}장입니다. 이 밖에 \`docs/추가 제작.md\`에 프롬프트가 이미 있는 ${cgOld.length}장(${cgOld.map((x) => `\`${x}\``).join(' · ')})도 아직 없습니다.`,
  '- 넣는 곳 `assets/cg/cg_{id}.jpg`(16:9, 2K) → `npm run assets`. 나오는 사람의 설정화와 그 장소의 배경을 **참조 이미지로 함께** 넣습니다.',
  '- 사장의 눈(`eye_*`)은 사장님 자리에서 본 그림입니다. 지은은 조금 멀리, 사장님의 손이 앞에 보이고, 기억처럼 조금 따뜻한 빛입니다.', '',
  '### 2.0 목록', '', '| # | id | 제목 | 나오는 날 | 참조 |', '| ---: | :--- | :--- | :--- | :--- |');
const refOf = (id) => {
  const ph = CGS[id].ph || {};
  const people = [...new Set((ph.cast || []).map((v) => String(v).split(':')[0]))].filter((w) => w !== 'customer');
  const bgRef = ph.bg ? `${ph.bg === 'hall' ? 'hall' : ph.bg}_${ph.v || 'morning'}` : '';
  return [...people.map((w) => (CHARS[w]?.stand ? `\`${CHARS[w].stand}_normal\`` : `\`${w}_sheet\``)), bgRef ? `\`${bgRef}\`` : ''].filter(Boolean).join(' · '); // 빌려 쓰는 인물은 그 스탠딩이 참조
};
cgNew.forEach((id, i) => P(`| ${i + 1} | \`${id}\` | ${CGS[id].title} | ${epLabel(CGS[id].ep)} | ${refOf(id)} |`));
P('', '### 2.1 프롬프트', '');
cgNew.forEach((id, i) => {
  const c = CGS[id];
  const ph = c.ph || {};
  const people = [...new Set((ph.cast || []).map((v) => String(v).split(':')[0]))];
  const castLine = people.filter((w) => PEOPLE_EN[w]).map((w) => `${tagOf(w)}: ${PEOPLE_EN[w]}`).join('; ');
  P(`#### ${i + 1}. \`${id}\` · ${c.title}`, '', `- 나오는 날: ${epLabel(c.ep)} · 장면: ${ph.desc || ''} · 참조: ${refOf(id)}`, '');
  box(`${SCENE}\n${castLine ? `New characters (match their character sheets): ${castLine}.\n` : ''}Scene: ${CG_EN[id] || `(${c.title}) ${ph.desc || ''}`}\n${AVOID_S}`);
  P('');
});

/* 3. 물건 */
P('## 3. 작업대 물건 시트 3 (`sheet_more`)', '',
  '- 풀 버전 메뉴(디카페인 · 핸드드립 · 믹스커피 · 보리차 · 유자차 · 딸기우유 · 녹차라테 · 코코아)와 포장 컵에 쓰는 물건입니다. 지금은 임시 그림(SVG)으로 섭니다.',
  '- 시트 규칙은 `docs/image_requests.md` 2장 ①·②와 같습니다(초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움). 참조: `sheet_tools`. 칸 순서는 `tools/import-objects.py`의 `sheet_more`와 같습니다.',
  `- 아직 없는 것: ${objMissing.map(([id]) => `\`${id}\``).join(' · ') || '없음'}`, '',
  '**sheet_more** · 1:1 · 참조: `sheet_tools`');
const rows = [SHEET_MORE.slice(0, 4), SHEET_MORE.slice(4, 8), SHEET_MORE.slice(8, 11)];
box(`Same art style, angle, lighting and rendering as the reference image (barista equipment sheet): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.\nThe square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; nothing touches or overlaps.\n${rows.map((r, i) => `Row ${i + 1}: ${r.map(([, d]) => d).join('; ')}${i === 2 ? '; the last cell (bottom right) completely empty' : ''}.`).join('\n')}\nFlat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.\nAvoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, black outlines.`);
P('', '- 얼음 통(`obj_ice_bucket`) · 레시피 수첩(`obj_recipe_book`)은 `docs/추가 제작.md` 27 · 28번에 있습니다.', '');

/* 4. 새 놀이의 그림 */
P('## 4. 새 놀이의 그림 (재미 개편)', '',
  '- 몰림 · 그 갈매기 쫓기 · 바닷가로 가는 버스 · 가게 꾸미기 · 앞치마의 그림입니다. 지금은 코드로 그린 임시 그림(SVG · 색 띠 · 아이콘)으로 섭니다.',
  '- 프롬프트 · 규칙은 `docs/image_requests.md` 8장에 있습니다(시트는 초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움, 버스 창밖은 좌우가 이어지는 그림).',
  '- 받은 그림은 `assets/flow/`에 두고 알려 주세요. `assets/_src/play/{id}.jpg`로 옮겨 넣으면 이 목록에서 빠집니다.', '');
if (playMissing.length) {
  P('| id | 무엇 | 비율 | 프롬프트 |', '| :--- | :--- | :--- | :--- |', ...playMissing.map(([id, what, ratio, sec]) => `| \`${id}\` | ${what} | ${ratio} | \`docs/image_requests.md\` ${sec} |`), '');
} else P('- 모두 있습니다.', '');

/* 5. 블렌더 */
P('## 5. 블렌더 한 컷 (손 동작)', '',
  `지금 컷이 있는 것: ${Object.keys(shots).map((k) => `\`${k}\``).join(' · ')}. 만드는 법은 \`docs/recipes.md\` 6장 · CLAUDE.md 7장(\`scene_bench.py … shots <id>\` → \`shots_post.py\` → \`npm run assets\`).`,
  '게임은 `shots.json`에 맞는 이름의 컷이 있으면 저절로 씁니다(`js/data/menu.js`의 `shotNames`, 작업대 `brew.js`의 `shotIdFor`). 손 동작 id 와 같은 이름이면 그 컷, 붓기 · 물 붓기 · 얼음 담기는 잔마다 `pour{잔}_{latte|milk|색}` · `water{잔}` · `ice{잔}`(잔 = 머그는 없음 · `_glass` · `_paper` · `_plastic`, `docs/recipes.md` 6.7), 컵에 넣기 · 젓기 · 우리기는 `{동작}[_iced]_{바탕}`(포장 컵은 `{동작}{잔}_{바탕}`, 6.10). 이름만 맞으면 코드를 고치지 않아도 됩니다.',
  '아래 목록은 메뉴마다 온도 · 매장/포장 · 단계를 모두 따라가며 작업대가 고를 컷을 셈한 것입니다.', '',
  '### 5.1 컷이 없는 손 동작 (임시 그림으로 섬)', '');
if (!shotNone.length) P('- 없습니다. 메뉴판의 모든 잔에서 손 동작마다 블렌더 컷이 나옵니다.', '');
else P('| 만들 컷 | 손 동작 | 동작 | 쓰는 잔 | 알맞아요 칸 | 제안 장면 |', '| :--- | :--- | :--- | :--- | :--- | :--- |');
const SCENE_KO = {
  grind: '그라인더 호퍼의 원두가 줄고, 아래 통에 가루가 쌓임(13단계)',
  tamp: '포터필터 위에서 탬퍼를 누름: 가루가 평평해지는 정도(13단계)',
  syrup: '시럽 펌프를 눌러 컵에 시럽이 들어감(두 번)',
  jam: '청 병에서 숟가락으로 떠서 컵에 넣음(두 번)',
  powder: '가루 통에서 숟가락으로 떠서 컵에 넣음(두 번)',
  whisk: '컵 속 말차를 차선으로 풂: 덩어리 → 고운 거품',
  stir: '컵 속을 숟가락으로 젓기: 가루가 풀리는 정도',
  milk_in: '우유병에서 피처에 찬 우유를 따름: 피처 눈금까지',
  boil: '버너 위 주전자의 물이 끓기 시작함: 김과 거품',
  bloom: '드리퍼의 커피 가루에 처음 조금 붓기',
  bloom_wait: '뜸: 커피 가루가 부풀었다가 가라앉음',
  spiral: '드리퍼 위로 주전자 물을 나선으로 세 바퀴',
  hand_grind: '손 그라인더 손잡이를 돌림',
  steep: '보리차가 우러남: 물 색이 진해짐',
};
const zoneOf = (sk) => (sk.zone ? sk.zone.join('~') : sk.laps ? `${sk.laps}바퀴` : sk.n ? `${sk.n}번` : '—');
for (const [want, e] of shotNone) { const sk = HAND_SKILLS[e.skill]; P(`| \`${want}\` | ${sk.name} | ${ACT[sk.act] || sk.act} | ${[...e.uses].join(' / ')} | ${zoneOf(sk)} | ${SCENE_KO[e.skill] || ''} |`); }
if (shotNone.length) P('');
P('### 5.2 있으면 더 맞는 컷 🙋 (지금은 비슷한 컷이 나옴)', '',
  '- 이 잔들도 지금 블렌더 컷이 나옵니다. 다만 다른 잔(포장 컵인데 머그 · 유리컵)이나 다른 음료(보리차 · 유자차인데 아메리카노)의 컷이라, 만들면 더 꼭 맞습니다. 급하지 않습니다(`docs/recipes.md` 6.10 🙋).',
  '- 만드는 법: 지금 나오는 컷과 같은 장면에서 잔만 바꿉니다. 종이컵은 `water_paper`, 플라스틱 컵은 `water_plastic`과 같은 카메라 · 빛(얼음 24개), 물 붓기는 음료 색만 그 바탕으로(보리차 = 호박색 · 티백, 유자차 = 청이 풀림).', '');
if (!shotStandIn.length) P('- 없습니다.', '');
else {
  P('| 만들 컷 | 손 동작 | 쓰는 잔 | 지금 나오는 컷 |', '| :--- | :--- | :--- | :--- |');
  for (const [want, e] of shotStandIn) P(`| \`${want}\` | ${HAND_SKILLS[e.skill].name} | ${[...e.uses].join(' / ')} | \`${e.standIn}\` |`);
  P('');
}
P('### 5.3 조작법 \'드래그 활용\'의 그림 (`docs/recipes.md` 6.11)', '',
  '- 붓는 컷에 덜 기운 그릇(`… tilt`)이 없으면 끌어 붓기는 되지만 그릇이 기울어 보이지 않고, 얼음 담기 컷에 얼음 통 · 국자(`… drag_ice`)가 없으면 터치 기반처럼 눌러서 담습니다.', '');
if (!dragMiss.size) P('- 모두 있습니다.', '');
else {
  P('| 컷 | 필요한 그림 | 쓰는 잔 |', '| :--- | :--- | :--- |');
  for (const [id, e] of dragMiss) P(`| \`${id}\` | ${e.kind === 'tilt' ? '`scene_bench.py … tilt` (덜 기운 그릇)' : '`scene_bench.py … drag_ice` (얼음 통 · 국자)'} | ${[...e.uses].join(' / ')} |`);
  P('');
}

/* 6. 소리 */
P('## 6. 소리', '', '### 6.1 효과음 · 환경음 (사서 쓰는 팩에서 잘라 넣기, `tools/audio/audio_map.mjs`)', '',
  '| 종류 | id | 쓰는 곳 | 바라는 소리 |', '| :--- | :--- | :--- | :--- |');
const SFX_KO = { snap: '사진 스냅 연출', bus: '버스가 서는 소리(브레이크 · 문 열림)', espresso: '에스프레소가 나오는 소리', steam: '스팀 노즐(쉬익)', mixer: '그라인더 가는 소리', shutter_phone: '휴대전화 사진 찍는 소리', mug: '머그를 내려놓는 소리', street: '바닷가 골목(갈매기 · 먼 파도 · 발소리)', kitchen: '주방', classroom: '교실' };
for (const id of MISSING.sfx) P(`| 효과음 | \`${id}\` | ${sfxUse[id] ? [...sfxUse[id]].map(epLabel).join(' · ') : '작업대 · 화면'} | ${SFX_KO[id] || ''} |`);
for (const id of MISSING.amb) P(`| 환경음 | \`${id}\` | ${ambUse[id] ? [...ambUse[id]].map(epLabel).slice(0, 8).join(' · ') + (ambUse[id].size > 8 ? ` 외 ${ambUse[id].size - 8}일` : '') : '지금 대본에는 없음'} | ${SFX_KO[id] || ''} |`);
P('', '### 6.2 배경음악 (✅ 새로 만듦: 직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음)', '',
  '| mood | 쓰는 곳 | 느낌 · 악기 | 길이 |', '| :--- | :--- | :--- | :--- |');
const bgmLeft = Object.entries(BGM_KO).filter(([mood]) => !bgmHas(mood));
if (!bgmLeft.length) P('| 모두 있음 | ✅ 저작자가 AI 음악 모델 Suno로 만든 곡(2026-11-01, 배정은 `js/av/audio.js` 의 BGM_VARIANTS · 검수 13.29) | | |');
for (const [mood, [where, feel, len]] of bgmLeft) P(`| \`${mood}\` | ${where}${bgmUse[mood] ? `(${bgmUse[mood].size}일)` : ''} | ${feel} | ${len} |`);
P('', '- 판매 페이지에 AI 관련 금지 조건이 있는 음악 팩은 쓰지 않습니다(CLAUDE.md 7장). 음악 파일이 없으면 게임은 조용히 넘어갑니다.', '');

/* 7. 음성 */
let lines = [];
try { lines = JSON.parse(fs.readFileSync(path.join(root, 'tools/voice/lines.json'), 'utf8')); } catch { /* 없음 */ }
const byVoice = {};
for (const l of lines) byVoice[l.voice] = (byVoice[l.voice] || 0) + 1;
P('## 7. 음성 (Supertonic, 내 PC)', '',
  `- 읽어 줄 문장 ${lines.length}줄(\`npm run lines\` → \`tools/voice/lines.json\`). \`npm run voices\`가 바뀐 줄만 만듭니다.`,
  '- 새 인물의 목소리 배정은 `tools/voice/voice_cast.json`에 있습니다(Supertonic 목소리가 10개뿐이라 빠르기로 구별, 들어 보고 정함).', '',
  '| 목소리 | 줄 수 |', '| :--- | ---: |', ...Object.entries(byVoice).sort((a, b) => b[1] - a[1]).map(([v, n]) => `| \`${v}\` | ${n} |`), '');

/* 8. 넣은 뒤 */
P('## 8. 넣은 뒤 할 일 (순서)', '',
  '1. 그림: `npm run images`(스탠딩) → `python tools/face-boxes.py` → `npm run objects`(물건 시트) → `npm run assets`(배경 · CG · 컷) → `npm run credits`',
  '2. 새 그림의 제작 프롬프트를 `tools/credits/image_prompts.mjs`에 한 줄씩(제작 · 저작권 정보)',
  '3. 소리: `tools/audio/audio_map.mjs`에 대응을 적고 `npm run audio` → `assets/audio` 안에서 커밋 · 푸시 → 바깥에서 `git add assets/audio`',
  '4. 음성: `npm run voices`',
  '5. `npm run validate` → 자동 플레이 → `npm run requests`(이 문서가 줄어듦)', '');

fs.writeFileSync(path.join(root, 'docs/requests_full.md'), `${L.join('\n')}\n`);
console.log(`요청서: 인물 ${newPeople.length}명 · 장면 그림 ${cgNew.length}장(+ 추가 제작 ${cgOld.length}) · 물건 ${objMissing.length} · 놀이 그림 ${playMissing.length} · 블렌더 없음 ${shotNone.length} / 대신 ${shotStandIn.length} / 드래그 ${dragMiss.size} → docs/requests_full.md`);
