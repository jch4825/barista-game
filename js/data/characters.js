/**
 * 등장인물 정의
 *  - faces: 실제 일러스트(assets/portraits/{id}_{face}.jpg)가 있는 표정
 *  - alias: 없는 표정을 가까운 표정으로 바꿔 줌
 *  - svg: 일러스트가 아직 없는 인물의 임시 초상(portrait-svg.js) 설정
 *  - voice: 읽어 주기 목소리 ID (tts.js VOICE_PROFILE, tools/voice/voice_cast.json 과 같은 키)
 *  - 스탠딩: assets/stand/{id}_{face}.webp 가 있으면(최소 normal) 폴라로이드 대신 스탠딩으로 섭니다.
 *    standAlias: 스탠딩에 없는 표정을 가까운 표정으로 / look: 그림 속 인물이 바라보는 쪽(left·right) / standScale: 무대 크기 배율(손님 0.85)
 *    faceBox: 대화창 얼굴 아이콘을 스탠딩에서 잘라 낼 위치(크기 %, 가로 %, 세로 %)
 *  - card: 처음 만날 때 보여 주는 크루 카드(크루·가족만, 손님은 없음). 한 줄은 25자 안팎
 */

import { drawPortrait } from './portrait-svg.js';
import { img } from '../core/assets.js';
import { FACE_BOX, PORTRAIT_BOX } from './faceboxes.js';

export const CHARS = {
  /* ---------- 새 게임의 주인공급 인물(2026-10-28). 그림은 docs/image_requests.md 1장, 오기 전까지 임시 초상(svg) ---------- */
  jieun: {
    name: '지은', full: '지은', role: '새 바리스타', color: '#25844A', voice: 'jieun', // 앞치마 = 게임 메인 색(초록)
    look: 'left', // 2026-10-29 스탠딩(Flow)은 몸이 보는 사람의 왼쪽으로 살짝 돌아 있음 → 왼쪽 자리에서는 뒤집어 섬
    standAlias: { happy: 'smile', proud: 'smile', bright: 'smile', worried: 'nervous', scared: 'nervous', focus: 'determined', brave: 'determined', serious: 'determined', calm: 'normal', think: 'normal' },
    svg: { skin: '#F3D2B5', hair: '#1E1A18', style: 'ponytail', outfit: '#F3E9D8', apron: '#25844A', acc: [], bg: '#DFF0E4' },
    card: { seal: '크루', lines: ['스물한 살, 바닷가 마을 카페의 새 직원이에요.', '천천히, 정확하게 하는 일을 잘해요.', '서두르면 가끔 쏟을 때가 있어요.'] },
  },
  owner: {
    name: '사장님', full: '사장님', role: '카페 주인', color: '#5B3A29', voice: 'owner',
    look: 'left',
    standAlias: { happy: 'smile', warm: 'smile', serious: 'strict', worried: 'think', sad: 'think', surprised: 'think', teach: 'normal', front: 'normal' },
    svg: { skin: '#EBC6A6', hair: '#E8E6E1', style: 'short', outfit: '#4A4A4F', apron: '#5B3A29', acc: ['wrinkles'], bg: '#ECE6DC' },
    card: { seal: '크루', lines: ['이 카페를 30년 동안 지켜 왔어요.', '말이 적고, 커피를 천천히 내려요.', '마감 뒤에는 따뜻한 우유를 마셔요.'] },
  },
  haesun: {
    name: '해순 할머니', role: '단골손님', color: '#2E3A5C', voice: 'haesun',
    standScale: 0.85, // 단골도 손님: 무대에서 85% 크기
    look: 'left',
    standAlias: { sad: 'look', worried: 'look', think: 'look', happy: 'smile', warm: 'smile' },
    svg: { skin: '#EFC9A8', hair: '#E3E1DC', style: 'bob', outfit: '#2E3A5C', acc: ['wrinkles'], bg: '#E6EAF2' },
  },
  jian: {
    name: '지안', role: '단골손님', color: '#8A6A10', voice: 'jian', // 겨자색 카디건(지은의 초록 앞치마와 겹치지 않게)
    standScale: 0.85,
    look: 'left',
    standAlias: { nervous: 'shy', worried: 'shy', sad: 'shy', think: 'shy', happy: 'smile', surprised: 'smile' },
    svg: { skin: '#F2D0B4', hair: '#4A3528', style: 'long', outfit: '#D9B44A', acc: [], bg: '#F6EED6' },
  },
  granddaughter: {
    name: '손녀', role: '해순 할머니의 손녀', color: '#C77D8E', voice: 'customer_f',
    standScale: 0.85,
    svg: { skin: '#F6D5C0', hair: '#2E2420', style: 'ponytail', outfit: '#E8A9B8', acc: [], bg: '#FCE8EE' },
  },

  /* ---------- 단골 여섯 명 + 금 씨 + 조연(2026-10-31 풀 버전). 그림이 오기 전에는 임시 초상(svg, 대체 요망: docs/requests_full.md) ---------- */
  do: {
    name: '도 씨', role: '우체부', color: '#B0413E', voice: 'do', // 우체국 빨강(경고 빨강 --red 와 다른 짙은 벽돌색)
    standScale: 0.85,
    svg: { skin: '#E6BE98', hair: '#6E6A66', style: 'cap', outfit: '#2F5D8A', acc: ['wrinkles', 'mailbag'], bg: '#E4ECF4' },
  },
  kang: {
    name: '강 씨', role: '어부', color: '#3B5E6B', voice: 'kang',
    standScale: 0.85,
    svg: { skin: '#D2A07A', hair: '#3A3A3A', style: 'short', outfit: '#5E7154', acc: ['wrinkles', 'beanie', 'stubble'], bg: '#E2ECEE' },
  },
  han: {
    name: '한 씨', role: '버스 기사', color: '#4A5D8A', voice: 'han',
    standScale: 0.85,
    svg: { skin: '#EBC6A6', hair: '#2B2320', style: 'short', outfit: '#4A5D8A', acc: ['driver_cap', 'tie_loose'], bg: '#E6EAF4' },
  },
  eunju: {
    name: '은주', role: '아기 엄마', color: '#C2708A', voice: 'eunju',
    standScale: 0.85,
    svg: { skin: '#F2CDB1', hair: '#3A2A22', style: 'bun', outfit: '#E8B4C4', acc: ['baby_sling'], bg: '#FBE8EE' },
  },
  sumin: {
    name: '수민', role: '고3 학생', color: '#5B6BB0', voice: 'sumin',
    standScale: 0.85,
    svg: { skin: '#F4D2B8', hair: '#1E1A18', style: 'bob', outfit: '#3E4A7A', acc: ['earphones'], bg: '#E8EAF6' },
  },
  noh: {
    name: '노 씨', role: '철물점 주인', color: '#8A5A2B', voice: 'noh',
    standScale: 0.85,
    svg: { skin: '#E3B892', hair: '#A6A39E', style: 'short', outfit: '#7A6A55', acc: ['wrinkles', 'pencil_ear'], bg: '#F2E8DA' },
  },
  geum: {
    name: '금 씨', role: '늘 바쁜 손님', color: '#9A7A2A', voice: 'geum',
    standScale: 0.85,
    svg: { skin: '#EBC6A6', hair: '#2B2320', style: 'short', outfit: '#3A3A40', acc: ['tie_loose', 'phone'], bg: '#F2EEE2' },
  },
  actor: {
    name: '배우', role: '유명 배우', color: '#7A4AA0', voice: 'actor',
    standScale: 0.85,
    svg: { skin: '#F4D6C4', hair: '#3A2A22', style: 'long', outfit: '#EDE6F2', acc: ['sunglasses'], bg: '#EFE6F6' },
  },
  agent: {
    name: '매니저', role: '배우의 매니저', color: '#5A5F6A', voice: 'agent',
    standScale: 0.85,
    svg: { skin: '#EBC6A6', hair: '#1E1A18', style: 'messy', outfit: '#2F3A55', acc: ['headset'], bg: '#E6E8EE' },
  },
  mom2: {
    name: '처음 온 엄마', role: '손님', color: '#B08A5A', voice: 'mom2',
    standScale: 0.85,
    svg: { skin: '#F0C9A6', hair: '#4A3528', style: 'long', outfit: '#C9B79A', acc: ['baby_sling'], bg: '#F4EEE2' },
  },
  young_fisher: {
    name: '젊은 어부', role: '어부', color: '#4A7A8A', voice: 'young_fisher',
    standScale: 0.85,
    svg: { skin: '#DDAE86', hair: '#1E1A18', style: 'messy', outfit: '#E0A040', acc: ['beanie'], bg: '#E2EEF0' },
  },
  han_daughter: {
    name: '한 씨의 딸', role: '중학생', color: '#C77D8E', voice: 'han_daughter',
    standScale: 0.85,
    svg: { skin: '#F6D5C0', hair: '#2E2420', style: 'long', outfit: '#8FA7C9', acc: ['scarf'], bg: '#FCE8EE' },
  },

  /* ---------- 직업 마1스톤 인물: 새 게임에서는 손님으로만 나옴 ---------- */
  yeonwoo: {
    name: '연우', full: '정연우', role: '신입 크루', color: '#E3262E', voice: 'yeonwoo',
    faces: ['normal', 'smile', 'nervous', 'determined'],
    alias: { happy: 'smile', proud: 'smile', bright: 'smile', sad: 'nervous', scared: 'nervous', surprised: 'nervous', worried: 'nervous', focus: 'determined', brave: 'determined', serious: 'determined', calm: 'normal', think: 'normal' },
    look: 'right',
    card: { seal: '크루', lines: ['스무 살, 해솔학교 전공과 졸업반이에요.', '약속과 순서를 좋아하고, 이름을 잘 기억해요.', '갑자기 나는 큰 소리는 조금 힘들어요.'] },
  },
  dohyun: {
    name: '도현', full: '강도현', role: '선임 바리스타', color: '#7A1F2B', voice: 'dohyun',
    faces: ['normal', 'smile', 'teach', 'glasses'],
    alias: { happy: 'smile', proud: 'smile', warm: 'smile', worried: 'teach', serious: 'teach', surprised: 'teach', sad: 'teach', think: 'glasses', confident: 'glasses' },
    standAlias: { glasses: 'smile', confident: 'smile', think: 'teach', serious: 'teach', surprised: 'worried', sad: 'worried' },
    look: 'left',
    card: { seal: '크루', lines: ['이 가게에서 3년째 커피를 만들어요.', '연우에게 일을 가르쳐 주는 선배예요.', '자주 하는 말: "괜찮아요. 같이 해요."'] },
  },
  manager: {
    name: '점장님', full: '박건우', role: '점장', color: '#3E4B4F', voice: 'manager',
    faces: ['normal', 'strict', 'think', 'smile', 'front'],
    alias: { happy: 'smile', proud: 'smile', warm: 'front', serious: 'strict', angry: 'strict', worried: 'think', surprised: 'think', sad: 'think' },
    standAlias: { front: 'normal', warm: 'smile' },
    look: 'left',
    card: { seal: '크루', lines: ['카페 마일스톤을 만든 사람이에요.', '시간 약속, 위생, 안전을 꼭 지켜요.', '매일 아침 노란 메모를 써 둬요.'] },
  },
  sora: {
    name: '소라', full: '한소라', role: '계산대 크루', color: '#FF7A59', voice: 'sora',
    look: 'left',
    faceBox: [280, 50, 7],
    svg: { skin: '#F7D3B8', hair: '#3A2A22', style: 'ponytail', outfit: '#FFFFFF', apron: '#E3262E', acc: ['glasses_round', 'camera'], bg: '#FFE1D6' },
    card: { seal: '크루', lines: ['대학교에서 디자인을 공부해요.', '밝고, 말이 빨라요.', '그림 그리기와 사진 찍기를 좋아해요.'] },
  },
  minjae: {
    name: '민재', full: '오민재', role: '제빵 크루', color: '#B8864A', voice: 'minjae',
    look: 'left',
    faceBox: [280, 50, 6],
    svg: { skin: '#E9C29E', hair: '#2A211C', style: 'short', outfit: '#F5EFE4', acc: ['earmuffs', 'flour', 'baker_cap'], bg: '#F2E4CB' },
    card: { seal: '크루', lines: ['이 가게에서 5년째 빵을 구워요.', '해솔학교 전공과 선배예요.', '소리가 크면 파란 귀덮개를 껴요.'] },
  },
  mom: {
    name: '엄마', full: '이미정', role: '연우의 엄마', color: '#8C7AE6', voice: 'mom',
    look: 'left',
    faceBox: [280, 50, 8],
    svg: { skin: '#F2CDB1', hair: '#2E2420', style: 'bun', outfit: '#B7ACEF', acc: [], bg: '#ECE6FF' },
    card: { seal: '가족', lines: ['걱정이 많고, 연우를 늘 응원해요.', '무엇이든 대신 해 주고 싶어 해요.'] },
  },
  teacher: {
    name: '선생님', full: '김선영', role: '전공과 담임', color: '#3FA46A', voice: 'teacher',
    svg: { skin: '#F1CBAA', hair: '#3B2B24', style: 'long', outfit: '#7CC59A', acc: ['glasses_square'], bg: '#E2F4E8' },
  },
  jiho: {
    name: '지호', full: '유지호', role: '새 신입', color: '#3D8BD9', voice: 'jiho',
    svg: { skin: '#F0C9A6', hair: '#1F1A17', style: 'messy', outfit: '#FFFFFF', apron: '#E3262E', acc: [], bg: '#DCEBFF' },
    card: { seal: '크루', lines: ['오늘이 첫 출근 날이에요.', '열아홉 살이에요.'] },
  },
  grandma: {
    name: '봉순 할머니', full: '최봉순', role: '단골손님', color: '#9B7B5B', voice: 'grandma',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#EFC9A8', hair: '#D8D6D2', style: 'curly', outfit: '#C98B6B', acc: ['glasses_round', 'wrinkles'], bg: '#F6E7D8' },
  },
  student: {
    name: '대학생 손님', role: '손님', color: '#6C7A89', voice: 'student',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#F0C8A5', hair: '#2B2522', style: 'messy', outfit: '#7B8EA3', acc: ['hood', 'backpack'], bg: '#E4EBF2' },
  },
  seojin: {
    name: '서진', role: '손님', color: '#3F8F8B', voice: 'seojin',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#F2CFB3', hair: '#2C2420', style: 'bob', outfit: '#3F8F8B', acc: ['wheelchair'], bg: '#DDF1EF' },
  },
  daeri: {
    name: '최 대리', role: '손님', color: '#56607A', voice: 'daeri',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#EEC6A3', hair: '#1E1B1A', style: 'short', outfit: '#2F3A55', acc: ['tie_loose'], bg: '#E3E6EE' },
  },
  luna: {
    name: '루나', role: '손님', color: '#E07AA6', voice: 'luna',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    look: 'right',
    standAlias: { smile: 'normal', happy: 'normal', surprised: 'worried', sad: 'worried', angry: 'worried' }, // 그림 2장: 웃는 얼굴(normal) · 당황(worried)
    svg: { skin: '#F6D5C0', hair: '#7A4A33', style: 'long', outfit: '#F7C5D9', acc: ['beret', 'phone'], bg: '#FCE4EE' },
  },
  auntie: {
    name: '아주머니 손님', role: '손님', color: '#B8865B', voice: 'auntie',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#EDC4A0', hair: '#3A2C25', style: 'perm', outfit: '#C9A27E', acc: ['bags'], bg: '#F4E8DA' },
  },
  hiker: {
    name: '등산복 손님', role: '손님', color: '#D35400', voice: 'hiker',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#E6B994', hair: '#4A4542', style: 'cap', outfit: '#E67E22', acc: ['zip'], bg: '#FBE3CF' },
  },
  customer: {
    name: '손님', role: '손님', color: '#7D7D86', voice: 'customer',
    standScale: 0.85, // 손님: 무대에서 85% 크기(2026-10-15)
    svg: { skin: '#EEC9A8', hair: '#2F2723', style: 'short', outfit: '#9AA3AE', acc: [], bg: '#ECECEF' },
  },
};

/** 화면에 보일 이름 (나레이션·속마음 등 특수 화자 포함) */
export function speakerLabel(who, kind) {
  if (kind === 'narr') return '';
  if (kind === 'think') return '지은의 속마음';
  if (kind === 'sys') return '안내';
  return CHARS[who]?.name || who || '';
}

export function resolveFace(id, face = 'normal') {
  const c = CHARS[id];
  if (!c) return face;
  if (!c.faces) return face || 'normal';
  if (c.faces.includes(face)) return face;
  return c.alias?.[face] || 'normal';
}

/** 초상 HTML (실제 일러스트 또는 임시 SVG) */
export function portraitHTML(id, face = 'normal') {
  const c = CHARS[id];
  if (!c) return '';
  const f = resolveFace(id, face);
  if (c.faces) {
    return `<img class="pol-img" src="./assets/portraits/${id}_${f}.jpg" alt="${c.name}" draggable="false">`;
  }
  // 표정 초상이 없는 인물: 스탠딩 그림이 있으면 그 그림에서 머리·어깨를 잘라 씀(문자·수첩·손님 표시 등)
  if (hasStand(id)) {
    // 손으로 맞춘 값이 없으면 그림마다 잰 값(tools/face-boxes.py, 의상 그림도 따로)
    const [size, x, y] = c.portraitBox || PORTRAIT_BOX[`${standKey(id)}_${standFace(id, face)}`] || [230, 50, 4];
    return `<span class="pol-img pol-stand" role="img" aria-label="${c.name}" style="background-image:url('${standURL(id, face)}');background-size:${size}% auto;background-position:${x}% ${y}%"></span>`;
  }
  return drawPortrait(c.svg, face);
}

export function voiceOf(who, kind) {
  if (kind === 'narr') return 'narr';
  if (kind === 'think') return 'think';
  if (kind === 'sys') return 'sys';
  return costumeVoice(who, costumes) || CHARS[who]?.voice || 'narr';
}

/**
 * 의상(그림)에 따라 목소리가 다른 인물: 이름 없는 손님은 에피소드마다 다른 사람이라 여성 그림이면 여성 목소리.
 * 음성 목록 도구(export-lines)도 에피소드의 costume 으로 같은 규칙을 씀
 */
export const COSTUME_VOICE = {
  'customer-olive': 'customer_f', // 올리브 블라우스 여성 손님
  'customer-coffee': 'customer_f', // 커피를 든 여성 손님
  'customer-sporty': 'customer_f', // 물병을 든 운동복 여성 손님(여름 관광객)
  'customer-arms': 'customer_f', // 팔짱 낀 여성 손님
};
export function costumeVoice(who, map) {
  const c = map?.[who];
  return c ? COSTUME_VOICE[`${who}-${c}`] || null : null;
}

/* ---------- 스탠딩 (assets/stand/, 그림이 오면 자동으로 씀) ---------- */
const STAND_GENERIC = { happy: 'smile', proud: 'smile', bright: 'smile', warm: 'smile', scared: 'worried', nervous: 'worried', sad: 'worried', angry: 'worried', think: 'normal' };

/** 에피소드별 의상: { yeonwoo: 'interview' } → assets/stand/yeonwoo-interview_{face}.webp 가 있으면 그 그림 */
let costumes = {};
export function setCostumes(map) { costumes = { ...(map || {}) }; }
function standKey(id) {
  const c = costumes[id];
  return c && img.has('stand', `${id}-${c}_normal`) ? `${id}-${c}` : id;
}

export function hasStand(id) { return img.has('stand', `${standKey(id)}_normal`); }

/** 스탠딩 표정 고르기: 그 표정 → standAlias → alias → 공통 대체 → normal */
export function standFace(id, face = 'normal') {
  const c = CHARS[id] || {};
  const key = standKey(id);
  for (const f of [face, c.standAlias?.[face], c.alias?.[face], STAND_GENERIC[face]]) {
    if (f && img.has('stand', `${key}_${f}`)) return f;
  }
  return 'normal';
}

/** 스탠딩 그림 주소 (variant: '' | 'blink' | 'talk', 없으면 null) */
export function standURL(id, face = 'normal', variant = '') {
  const f = standFace(id, face);
  return img.url('stand', `${standKey(id)}_${f}${variant ? `_${variant}` : ''}`);
}

/** 대화창·크루 카드의 동그란 얼굴: 스탠딩이 있으면 얼굴 부분을 잘라 쓰고, 없으면 초상 */
export function faceHTML(id, face = 'normal') {
  const c = CHARS[id];
  if (!c) return '';
  if (hasStand(id)) {
    const [size, x, y] = c.faceBox || FACE_BOX[`${standKey(id)}_${standFace(id, face)}`] || [300, 50, 3];
    return `<span class="face-img" style="background-image:url('${standURL(id, face)}');background-size:${size}% auto;background-position:${x}% ${y}%"></span>`;
  }
  if (c.faces) return `<span class="face-img" style="background-image:url('./assets/portraits/${id}_${resolveFace(id, face)}.jpg');background-size:135% auto;background-position:50% 28%"></span>`;
  return `<span class="face-svg">${drawPortrait(c.svg, face)}</span>`;
}

/** 크루 카드가 있는 인물 (등장 순서) */
export const CARD_IDS = Object.keys(CHARS).filter((id) => CHARS[id].card);

/** 크루 카드 읽어 주기 문장 (overlays.crewCard 와 tools/export-lines.mjs 가 함께 씀) */
export function cardSpeech(id) {
  const c = CHARS[id];
  if (!c?.card) return '';
  return `${c.full || c.name}. ${c.role}. ${c.card.lines.join(' ')}`;
}
