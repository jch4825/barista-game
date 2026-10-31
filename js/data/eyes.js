/**
 * 엔딩의 글(PRD 5.8 · docs/story.md 9장): 단골 앨범 · 사장의 눈 11컷 · 마지막 크레디트
 * 화면(js/ui/ending.js)과 음성 목록(tools/export-lines.mjs)이 같은 문장을 씁니다.
 *  - 사장의 눈: 같은 한 해를 사장님의 눈으로 다시 봄. 숨은 장면 번호(n)는 대본의 seen(n) · 둘러보기 spots 의 seen 과 같음
 *    보여 주는 차례는 날짜 차례(7번이 여름 4일이라 6번보다 앞). 본 장면은 보통 빠르기, 처음 보는 장면은 표시 + 천천히
 *  - 사장님의 손: 병명 없이 '손이 떨린다 · 손을 쉬게 한다'로만 말합니다(원칙 10)
 */

import { REGULARS } from './regulars.js';
import { CONFIG } from '../config.js';

/* ---------- 단골 앨범 ---------- */

export const ALBUM_ORDER = ['haesun', 'jian', 'do', 'kang', 'han', 'eunju', 'sumin', 'noh'];

export const ALBUM_SAY = {
  title: '단골 앨범',
  sub: '한 해 동안 카페에 온 단골 여덟 사람. 저마다 늘 마시던 한 잔이 있었어요.',
  closed: '아직 모르는 이야기',
  closedNote: '언젠가 이 사람이 먼저 이야기를 꺼낼지도 몰라요.',
  end: '여덟 사람 모두, 이 카페에서 자기 자리를 찾았어요.',
};

/** 늘 드시던 것: regulars.js usual.say 의 '이름: ' 뒤만 */
export const usualOf = (who) => String(REGULARS[who]?.usual?.say || '').replace(/^[^:]+:\s*/, '');

/** 액자 하나를 읽어 주는 문장(화면 · 음성 목록이 같은 문장을 씀) */
export function albumSpeech(who, open) {
  const r = REGULARS[who];
  if (!r) return '';
  return open ? `${r.name}. ${r.album.title}. ${r.album.line}` : `${r.name}. ${ALBUM_SAY.closed}.`;
}

/* ---------- 사장의 눈 ---------- */

export const EYES_INTRO = [
  '그해 봄부터 내 손이 조금씩 떨렸다. 이제는 손을 쉬게 해야 할 때였다.',
  '그래서 구인 글에 "서두르지 않는 사람"이라고 썼다. 가게를 맡길 사람은 빠른 사람이 아니라, 기다릴 줄 아는 사람이어야 했다.',
];

/** 11컷: n(숨은 장면 번호) · when(날) · title · cg · lines(사장님의 속마음, 한 칸 두 문장 이내) */
export const EYES = [
  { n: 1, when: '봄 2일', title: '컵을 깬 날', cg: 'eye_1', lines: [
    '둘째 날, 금 씨가 "빨리요" 하고 재촉하자 그 아이가 컵을 깼다.',
    '그 아이는 울지 않았다. 빗자루를 두 손으로 꼭 쥐고, 조각을 하나도 남기지 않고 쓸었다.',
    '실수한 뒤에 다시 하는 사람. 내가 기다리던 사람이 그런 사람이었다.',
  ] },
  { n: 2, when: '봄 3일', title: '한 칸 내린 컵 선반', cg: 'eye_2', lines: [
    '그 아이가 까치발을 하고 컵을 꺼내는 것을 보았다. 그날 새벽, 나는 선반을 한 칸 내려 두었다.',
    '말해 주지는 않았다. 일하기 편한 자리는, 말없이 만들어 두는 것이다.',
  ] },
  { n: 3, when: '봄 4일', title: '맛은 시간이 만든다', cg: 'eye_3', lines: [
    '줄 선 손님이 재촉하자, 그 아이의 손이 또 떨리기 시작했다. 나는 카운터 앞으로 나갔다.',
    '"맛은 시간이 만듭니다." 그 말은 손님보다, 그 아이에게 들려주고 싶었다.',
  ] },
  { n: 4, when: '봄 5일', title: '빈 컵만 놓아 준 날', cg: 'eye_4', lines: [
    '촬영 팀이 한꺼번에 주문을 했다. 내가 받았으면 금방 끝났을 것이다.',
    '그래도 나는 그 아이 뒤에서 빈 컵만 꺼내 놓았다. 오늘 내가 대신 하면, 내일도 내가 해야 하니까.',
  ] },
  { n: 5, when: '봄 6일', title: '칠판의 빈칸', cg: 'eye_5', lines: [
    '칠판 오른쪽 아래는 처음 칠판을 걸던 날부터 비워 두었다.',
    '언젠가 이 가게를 맡을 사람의 이름을 쓰려고. 그해 봄, 그 칸을 볼 때마다 한 사람이 떠올랐다.',
  ] },
  { n: 7, when: '여름 4일', title: '다시 매 준 앞치마 끈', cg: 'eye_7', lines: [
    '여름은 하루 종일 바빴다. 마감 때 보니, 그 아이의 앞치마 끈이 풀려 늘어져 있었다.',
    '나는 끈을 다시 매 주었다. 손은 느렸지만, 매듭만큼은 단단하게 묶어 주고 싶었다.',
  ] },
  { n: 6, when: '여름 6일', title: '오늘의 커피는 저 친구가', cg: 'eye_6', lines: [
    '줄이 골목 끝까지 선 날, 한 손님이 "사장님이 해 주세요" 하고 말했다.',
    '"오늘의 커피는 저 친구가 내립니다." 남 앞에서 그 아이를 그렇게 부른 것은 그날이 처음이었다.',
  ] },
  { n: 8, when: '여름 6일', title: '7시 전은 동네 시간', cg: 'eye_8', lines: [
    '그날 밤, 나는 선반에 놓인 단골들의 잔을 오래 보았다. 이 가게가 원래 누구의 것이었는지, 바쁜 여름에 잊고 있었다.',
    '칠판에 "7시 전은 동네 시간"이라고 썼다. 글씨는 떨렸지만, 그 아이가 옆에서 끝까지 지켜보았다.',
  ] },
  { n: 9, when: '가을 4일', title: '열쇠', cg: 'eye_9', lines: [
    '축제가 끝난 밤, 처음으로 그 아이 이름을 다정하게 불렀다. 그리고 주머니 속 열쇠를 건넸다.',
    '"손님은 평소대로 온다." 겁내지 말라는 뜻이었다. 너도 평소대로만 하면 된다고.',
  ] },
  { n: 10, when: '가을 6일', title: '서두르면 쏟는다', cg: 'eye_10', lines: [
    '열쇠를 건네던 밤, 마감 선반에 작은 메모를 붙여 두었다. "서두르면 쏟는다."',
    '내가 없는 날에도, 바쁜 손을 잠깐 멈추고 한 번 읽어 볼 수 있게.',
  ] },
  { n: 11, when: '겨울 7일', title: '컵 닦았냐', cg: 'eye_11', lines: [
    '정전 밤, 나는 우리 집 창가에서 카페의 불빛을 보았다. 깜깜한 마을에서 불이 켜진 곳은 그 창 하나뿐이었다.',
    '가지 않았다. 그 아이가 하고 있었으니까. 눈이 그친 아침, 내가 한 말은 "컵 닦았냐" 하나였다.',
  ] },
];

export const EYES_OUTRO = [
  '서두르지 않는 사람을 찾으려고 구인 글을 붙였다. 그런데 돌아보니, 그 아이가 이 가게를 찾아온 것이었다.',
  '칠판의 빈칸에 이름을 쓰던 날, 내 글씨는 삐뚤었다. 그래도 그 이름은 어느 때보다 반듯해 보였다.',
];

export const EYES_SAY = {
  title: '사장의 눈',
  sub: '같은 한 해를, 사장님의 눈으로 다시 봐요.',
  fresh: '처음 보는 장면',
};

/** 한 컷을 읽어 주는 문장(사장님 목소리): 날 · 제목은 화면에만, 속마음 줄은 하나씩 */
export const eyeLines = (cut) => cut.lines;

/* ---------- 마지막 크레디트 ---------- */

/** [제목, 이름들] (맨 끝에 '그리고 함께 일한 {player} 님'이 붙음) */
export const CREDIT_ROLL = [
  ['카페', '지은 · 사장님'],
  ['단골', '해순 할머니 · 지안 · 도 씨 · 강 씨 · 한 씨 · 은주 · 수민 · 노 씨'],
  ['마을 사람들', '금 씨 · 해순 할머니의 손녀 · 한 씨의 딸 · 젊은 어부들 · 처음 온 엄마'],
  ['잠깐 들른 손님들', '촬영 팀 · 바다를 보러 온 연우와 도현 · 그리고 이 카페에 온 모든 손님'],
];

export const CREDIT_THANKS = '서두르지 않아도 괜찮아요. 한 잔씩, 천천히.';

/** 크레디트 읽어 주기(이름이 들어가는 '함께 일한 사람'은 따로 브라우저 음성으로) */
export const creditSpeech = () => `${CONFIG.TITLE_SAY}. ${CREDIT_ROLL.map(([hd, n]) => `${hd}: ${n}`).join('. ')}. ${CREDIT_THANKS}`;

/** 음성 목록용(tools/export-lines.mjs): 화면이 읽어 주는 문장 [목소리, 문장] */
export function albumLines() {
  const out = [['sys', `${ALBUM_SAY.title}. ${ALBUM_SAY.sub}`]];
  for (const who of ALBUM_ORDER) out.push(['sys', albumSpeech(who, true)], ['sys', albumSpeech(who, false)]);
  out.push(['sys', ALBUM_SAY.end]);
  return out;
}

export function eyesLines() {
  return [...EYES_INTRO, ...EYES.flatMap(eyeLines), ...EYES_OUTRO].map((t) => ['owner', t]);
}
