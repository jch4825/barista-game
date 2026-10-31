/**
 * 기록 파일 저장·불러오기 (2026-10-17)
 *  - 웹판은 기록이 그 브라우저에만 남습니다(학교 PC 복원·자리 바뀜·인터넷 기록 지우기에 사라짐).
 *    그래서 기록을 파일로 내려받아 보관하고, 다른 컴퓨터에서 그 파일을 골라 이어 합니다. 서버에는 올리지 않습니다(사용자 결정: 서버 저장 보류).
 *  - 저장: 학생 한 명(저장·불러오기 화면, 선생님 모드) 또는 이 기기의 모든 학생(선생님 모드 [학급 전체 저장]). 브라우저는 다운로드 폴더에 바로 저장
 *  - 불러오기: 파일 열기 창 → 확인 → 같은 학생은 두 기록을 합치고(지워지는 기록 없음), 새 학생은 더함(store.importRecords)
 *  - 읽어 주는 말은 고정 문장만(별명은 화면에만, tools/export-lines.mjs 가 음성 파일로 만듦)
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { ov } from '../ui/overlays.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';

export const RECORD_SAY = {
  saved: '기록 파일로 저장했어요.',
  ask: '이 기록 파일을 불러올까요? 지워지는 기록은 없어요.',
  done: '기록을 불러왔어요.',
  bad: '기록 파일을 읽지 못했어요. 이 게임의 기록 파일인지 확인해요.',
  full: '저장 공간이 모자라 불러오지 못했어요. 선생님께 알려 주세요.',
  memory: '이 컴퓨터는 기록을 남기지 못해요. 끝날 때 기록 파일로 저장해요.',
};

export const recordLines = () => Object.values(RECORD_SAY);

const MAX_BYTES = 20 * 1024 * 1024;
const two = (n) => String(n).padStart(2, '0');
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}
/** 파일 이름에 못 쓰는 글자 빼기 */
const safe = (s) => String(s).replace(/[\\/:*?"<>|\s.]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20) || '학생';

/** 브라우저: 다운로드 폴더에 저장 · 설치용 앱: 저장할 곳을 묻는 창 */
export function downloadFile(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/** idList: 학생 id 목록(한 명이면 그 학생 이름의 파일). 없으면 이 기기의 모든 학생 */
export function saveRecordFile(idList) {
  const data = store.exportRecords(idList);
  if (!data.profiles.length) return false;
  const name = idList && data.profiles.length === 1
    ? `바리스타_기록_${safe(data.profiles[0].name)}_${today()}.json`
    : `바리스타_학급기록_${data.profiles.length}명_${today()}.json`;
  downloadFile(name, JSON.stringify(data));
  audio.sfx('stamp');
  ov.toast(RECORD_SAY.saved, 'file_save');
  tts.speak(RECORD_SAY.saved, 'sys', { force: true });
  return true;
}

let picking = null;
/** 파일 열기 창. 고르지 않고 닫으면 [] (cancel 이벤트가 없는 옛 브라우저는 다음에 다시 누를 때 정리) */
function pickFiles(multiple) {
  picking?.remove();
  return new Promise((resolve) => {
    const inp = h('input', { type: 'file', accept: '.json,application/json', multiple, hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
    picking = inp;
    let done = false;
    const end = (files) => {
      if (done) return;
      done = true;
      inp.remove();
      if (picking === inp) picking = null;
      resolve(files);
    };
    inp.addEventListener('change', () => end([...(inp.files || [])]));
    inp.addEventListener('cancel', () => end([]));
    document.body.append(inp);
    inp.click();
  });
}

function fail(text) {
  audio.sfx('hint');
  ov.toast(text, 'caution');
  tts.speak(text, 'sys', { force: true });
}

/**
 * 파일 고르기 → 확인 → 불러오기. 버튼을 누른 그 순간에 부르세요(파일 열기 창은 누른 직후에만 열림).
 * 결과 { added, merged, ids, memoryOnly } · 그만두거나 못 읽으면 null
 */
export async function loadRecordFiles({ multiple = false } = {}) {
  const files = await pickFiles(multiple);
  if (!files.length) return null;
  const profiles = [];
  for (const f of files) {
    let got = null;
    try {
      if (f.size <= MAX_BYTES) got = store.readRecords(JSON.parse(await f.text()));
    } catch (e) {
      got = null;
    }
    if (!got) { fail(RECORD_SAY.bad); return null; }
    profiles.push(...got);
  }
  const plan = store.importPlan(profiles);
  const names = (arr) => arr.map((p) => p.name).join(', ');
  const n = plan.add.length + plan.merge.length;
  const detail = n === 1
    ? `${(plan.add[0] || plan.merge[0]).name} 님 · ${plan.add.length ? '이 기기에 새로 더해요' : '이 기기에 있던 기록과 합쳐요'}`
    : [`학생 ${n}명`, plan.add.length ? `새로 더해요: ${names(plan.add)}` : '', plan.merge.length ? `기록을 합쳐요: ${names(plan.merge)}` : ''].filter(Boolean).join(' · ');
  if (!(await ov.confirm({ text: RECORD_SAY.ask, detail, yes: '불러오기', no: '그만두기' }))) return null;
  const r = store.importRecords(profiles);
  if (!r) { fail(RECORD_SAY.full); return null; }
  audio.sfx('stamp');
  ov.toast(RECORD_SAY.done, 'file_load');
  if (r.memoryOnly) tts.speakSeq([RECORD_SAY.done, RECORD_SAY.memory], 'sys', { force: true });
  else tts.speak(RECORD_SAY.done, 'sys', { force: true });
  return r;
}
