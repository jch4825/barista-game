/**
 * 단골의 '한 잔의 마음'(PRD.md 8장): 숨은 신뢰 점수 · 대응 기회 · 힌트
 * 대본에서는 respond('haesun', 'spring_cup2') 비트로 부릅니다(js/core/runner.js respondBeat).
 * 지금은 M1 시험판의 두 사람만 있습니다: 해순 할머니(기다림) · 지안(부드러운 질문). 나머지 여섯 명도 같은 꼴로 더합니다.
 *
 *  touch(대응 기회)
 *    season · nth: 그 사람의 몇 번째 기회인지(힌트 사다리: 1~2번째는 대사 힌트 + 행동, 3번째는 행동 둘, 4~5번째는 시선 둘)
 *    scene: 힌트 앞의 장면 · hints: 힌트 두 개([힌트 다시 보기]가 다시 보여 줌) · q: 고르기 전에 지은의 속마음
 *    choices: { id, score(2 맞음 · 1 무난 · 0 어긋남), kind(KINDS), icon, label(학생이 고르는 글), after(반응 뒤 장면) }
 *    why: 맞는 대응의 이유(힌트로 설명). 선생님 보고서와 돌아보기에 씀
 *  반응 연출은 점수로 정합니다: 0 = 작은 끄덕임 · 1 = 미소 · 2 = 오래 바라봄. 숫자는 학생 화면에 나오지 않습니다.
 *  신뢰 = 그 사람의 기회 점수 합(0~10). 같은 기회를 다시 하면 마지막 대응으로 바뀝니다(선택 기억 'touch').
 */

import { say, narr, enter, leave, cg } from '../core/dsl.js';

/** 대응 유형(선생님 화면에서 '사람에 맞게 바꾸는지' 봄) */
export const KINDS = { wait: '기다림', ask: '묻기', plain: '그대로', step: '나서기' };

/** 신뢰 단계: 1 평소 · 2 행동이 변함(4~6) · 3 비밀 장면(7~10) */
export const TIER_MIN = { 2: 4, 3: 7 };

export const REGULARS = {
  /* ---------- 해순 할머니: 기다림. 늘 따뜻한 우유 두 잔, 한 잔은 남편 자리의 몫 ---------- */
  haesun: {
    name: '해순 할머니', wants: 'wait', usual: 'warm_milk',
    touches: {
      spring_cup2: {
        season: 'spring', nth: 1, title: '우유 두 잔',
        scene: [narr('우유 두 잔을 쟁반에 담았다.'), cg('haesun_two_cups')],
        hints: [
          say('haesun', 'normal', '한 잔은 저기. 저기에 놓아 주세요.'),
          narr('할머니의 눈이 빈 의자로 간다. 손으로 의자 등을 한 번 쓸어 준다.'),
        ],
        q: '두 잔을 어디에 놓을까?',
        choices: [
          { id: 'put_at_chair', score: 2, kind: 'wait', icon: 'chair', label: '두 번째 잔을 빈 의자 앞에 놓는다.', after: [cg('haesun_cup_for_him'), narr('할머니가 의자 앞의 잔을 오래 바라본다.'), say('haesun', 'smile', '…고마워요.'), cg(null)] },
          { id: 'both_front', score: 1, kind: 'plain', icon: 'cup', label: '두 잔 모두 할머니 앞에 놓는다.', after: [say('haesun', 'smile', '고마워요.'), narr('할머니가 잔 하나를 빈 의자 앞으로 옮긴다.'), cg(null)] },
          { id: 'ask_company', score: 0, kind: 'ask', icon: 'question', label: '"일행이 오세요?" 하고 묻는다.', after: [say('haesun', 'normal', '아니에요. 괜찮아요.'), narr('할머니가 잔 하나를 빈 의자 앞으로 옮긴다.'), cg(null)] },
        ],
        why: '할머니가 놓을 곳을 직접 말했어요. 묻지 않고 말한 대로 놓아요.',
      },
      summer_tourist: {
        season: 'summer', nth: 2, title: '그 의자의 손님',
        scene: [
          narr('여름 오후. 가게에 관광객이 많다.'),
          narr('해순 할머니 앞에 우유 두 잔이 놓여 있다.'),
          enter('center', 'customer:smile'),
          say('customer', 'smile', '여기 비었죠? 앉을게요.'),
          narr('관광객이 빈 의자에 앉는다.'),
          cg('summer_tourist_chair'),
        ],
        hints: [
          say('haesun', 'look', '아, 거기는…'),
          narr('할머니가 의자 앞의 잔을 두 손으로 감싼다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'offer_seat', score: 2, kind: 'wait', icon: 'chair', label: '선풍기 앞의 다른 자리를 관광객에게 조용히 권한다.', after: [say('jieun', 'smile', '선풍기 앞자리가 비었어요. 거기가 더 시원해요.'), say('customer', 'smile', '오, 좋네요. 고마워요.'), leave('customer'), cg('haesun_small_bow'), narr('할머니가 지은을 오래 바라본다. 그리고 작게 고개를 숙인다.'), cg(null)] },
          { id: 'do_nothing', score: 1, kind: 'plain', icon: 'freeze', label: '아무것도 하지 않는다.', after: [say('haesun', 'smile', '괜찮아요. 잠깐인데요.'), narr('할머니가 잔을 자기 앞으로 당긴다.'), cg(null)] },
          { id: 'loud', score: 0, kind: 'step', icon: 'shout', label: '관광객에게 "거기 앉으시면 안 돼요!" 하고 크게 말한다.', after: [say('customer', 'surprised', '앗, 죄송해요!'), say('haesun', 'normal', '아이고, 괜찮아요. 앉아요.'), cg(null)] },
        ],
        why: '할머니는 말을 멈추고 잔을 감쌌어요. 그 자리는 지키고 싶지만 소란은 싫어요. 조용히 다른 자리를 권하면 모두 편해요.',
      },
      autumn_one_milk: {
        season: 'autumn', nth: 3, title: '한 잔 남은 우유',
        scene: [
          narr('가을 아침. 해순 할머니가 들어온다.'),
          say('haesun', 'normal', '우유 두 잔이요.'),
          narr('우유병이 가볍다. 한 잔만 나오겠다.'),
          say('jieun', 'normal', '할머니, 오늘은 우유가 한 잔뿐이에요.'),
          cg('autumn_window_haesun'),
        ],
        hints: [
          narr('할머니가 우유병을 보고 천천히 고개를 끄덕인다.'),
          narr('할머니가 창가에 앉아 두 손을 무릎에 모은다. 창밖을 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'warm_one_wait', score: 2, kind: 'wait', icon: 'milk', label: '한 잔만 데워 놓고, 할머니 말을 기다린다.', after: [cg('haesun_one_cup_wait'), narr('할머니가 잔을 두 손으로 감싸고 빈 의자를 오래 바라본다.'), say('haesun', 'smile', '오늘은 내가 마실게요. 기다려 줘서 고마워요.'), cg(null)] },
          { id: 'split_two', score: 1, kind: 'plain', icon: 'cup', label: '우유를 반씩 나눠 두 잔을 데운다.', after: [say('haesun', 'smile', '반씩 했네요. 고마워요.'), cg(null)] },
          { id: 'buy_more', score: 0, kind: 'step', icon: 'run', label: '"제가 우유 새로 사 올게요!" 하고 말한다.', after: [say('haesun', 'normal', '아니에요, 가지 마요. 괜찮아요.'), cg(null)] },
        ],
        why: '할머니는 우유가 적다는 말에 고개를 끄덕이고, 서두르지 않고 기다렸어요. 할머니가 정할 수 있게 한 잔을 데우고 기다려요.',
      },
      winter_blackout: {
        season: 'winter', nth: 4, title: '정전 밤의 의자',
        scene: [narr('담요를 나눠 드린다. 해순 할머니 차례다.'), cg('winter_blanket_chair')],
        hints: [
          narr('할머니의 눈이 옆의 빈 의자로 간다.'),
          narr('할머니가 내 손의 담요를 보고, 다시 빈 의자를 본다.'),
        ],
        q: '담요를 어떻게 할까?',
        choices: [
          { id: 'blanket_chair', score: 2, kind: 'wait', icon: 'chair', label: '담요 한 장을 빈 의자 위에 덮어 둔다.', after: [cg('haesun_blanket_chair_warm'), narr('할머니가 의자 위의 담요를 손으로 펴고, 오래 바라본다.'), say('haesun', 'smile', '이 의자도 따뜻하네요. 고마워요.'), cg(null)] },
          { id: 'blanket_her', score: 1, kind: 'plain', icon: 'cloth', label: '담요를 할머니에게 드린다.', after: [say('haesun', 'smile', '고마워요.'), narr('할머니가 담요 끝을 빈 의자에도 걸쳐 둔다.'), cg(null)] },
        ],
        why: '할머니는 담요를 보고 빈 의자를 봤어요. 할머니에게 그 의자는 늘 함께 앉는 자리예요.',
      },
      winter_granddaughter: {
        season: 'winter', nth: 5, title: '손녀가 온 날',
        scene: [
          narr('눈 오는 오후. 해순 할머니가 손녀와 함께 들어온다.'),
          say('haesun', 'smile', '우리 손녀예요.'),
          say('granddaughter', 'smile', '안녕하세요!'),
          narr('두 사람이 창가에 앉는다. 할머니가 나를 보고 고개를 끄덕인다. 늘 먹던 것이라는 뜻이다.'),
          cg('winter_granddaughter'),
        ],
        hints: [
          narr('할머니가 손녀를 보고, 빈 의자를 본다.'),
          narr('손녀도 할머니를 따라 빈 의자를 본다.'),
        ],
        q: '우유를 몇 잔 준비할까?',
        choices: [
          { id: 'three_cups', score: 2, kind: 'wait', icon: 'milk', label: '우유 세 잔을 준비한다.', after: [cg('haesun_three_cups'), narr('할머니가 세 번째 잔을 오래 바라본다.'), say('granddaughter', 'smile', '할아버지 것도 있네!'), say('haesun', 'smile', '여기서는 할아버지 자리도 있어.'), narr('할머니가 손녀의 손을 꼭 잡는다.'), cg(null)] },
          { id: 'two_cups', score: 1, kind: 'plain', icon: 'cup', label: '우유 두 잔을 준비한다.', after: [say('granddaughter', 'normal', '한 잔 더 주세요. 할아버지 거요.'), say('haesun', 'smile', '고마워요.'), cg(null)] },
          { id: 'wait_order', score: 0, kind: 'plain', icon: 'hourglass', label: '주문을 기다리며 아무것도 하지 않는다.', after: [say('haesun', 'normal', '늘 먹던 거요. 괜찮아요.'), cg(null)] },
        ],
        why: '할머니는 늘 빈 의자 몫까지 두 잔을 마셔요. 오늘은 손녀가 왔고, 두 사람의 눈이 빈 의자로 갔어요.',
      },
    },
  },

  /* ---------- 지안: 부드러운 질문. "아무거나요", 1년째 그림을 못 그림. 여름에 처음 옴 ---------- */
  jian: {
    name: '지안', wants: 'ask', usual: null,
    touches: {
      summer_anything: {
        season: 'summer', nth: 1, title: '아무거나요',
        scene: [
          narr('요즘 자주 오는 손님이 계산대 앞에 선다. 품에 스케치북을 안고 있다.'),
          say('jieun', 'normal', '어서 오세요. 뭐 드릴까요?'),
          say('jian', 'normal', '아무거나요.'),
          cg('jian_color_menu'),
        ],
        hints: [
          say('jian', 'shy', '오늘은 무슨 색을 마실지 모르겠어요.'),
          narr('지안이 빈 스케치북을 닫는다. 메뉴판의 색 동그라미를 하나씩 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '"오늘은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_yellow'), narr('지안이 메뉴판을 오래 바라본다.'), say('jian', 'smile', '…노란색이요. 유자차 주세요.'), cg(null)] },
          { id: 'pick_popular', score: 1, kind: 'plain', icon: 'coffee', label: '"제일 많이 팔리는 걸로 드릴게요." 하고 고른다.', after: [say('jian', 'smile', '네, 그거 좋아요.'), cg(null)] },
          { id: 'wait_silent', score: 0, kind: 'wait', icon: 'hourglass', label: '지안이 고를 때까지 말없이 기다린다.', after: [narr('지안이 한참 서 있다.'), say('jian', 'normal', '그냥 물 주세요. 괜찮아요.'), narr('지안의 눈이 메뉴판의 색으로 한 번 더 간다.'), cg(null)] },
        ],
        why: '지안은 무슨 색을 마실지 모르겠다며 메뉴판의 색을 봤어요. 부드럽게 물어 주면 스스로 고를 수 있어요.',
      },
      summer_cool: {
        season: 'summer', nth: 2, title: '시원한 거 아무거나',
        scene: [
          narr('관광객으로 가게가 붐빈다. 지안은 구석에서 스케치북을 펴 놓고 연필만 쥐고 있다.'),
          narr('지안이 계산대로 온다.'),
          say('jian', 'normal', '시원한 거 아무거나요.'),
          cg('jian_summer_corner'),
        ],
        hints: [
          say('jian', 'shy', '더워서 그런가, 색이 다 똑같아 보여요.'),
          narr('지안이 스케치북을 가슴에 꼭 안는다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_cool_color', score: 2, kind: 'ask', icon: 'question', label: '"시원한 것 중에, 오늘은 어떤 색이 좋아요?" 하고 묻는다.', after: [cg('jian_green_cold'), narr('지안이 냉장고 속 음료를 오래 바라본다.'), say('jian', 'smile', '음… 초록색이요. 녹차라테, 차갑게요.'), cg(null)] },
          { id: 'recommend_tea', score: 1, kind: 'plain', icon: 'icecup', label: '"아이스티가 제일 시원해요." 하고 아이스티를 준비한다.', after: [say('jian', 'smile', '네, 좋아요.'), cg(null)] },
          { id: 'pry_sketch', score: 0, kind: 'step', icon: 'book', label: '"그림 그리세요? 뭐 그렸는지 보여 주세요." 하고 묻는다.', after: [narr('지안이 스케치북을 등 뒤로 돌린다.'), say('jian', 'shy', '아… 괜찮아요. 아무거나 주세요.'), cg(null)] },
        ],
        why: '지안은 색이 다 똑같아 보인다며 스케치북을 꼭 안았어요. 그림 이야기 대신 색을 물어보면 돼요.',
      },
      autumn_leaves: {
        season: 'autumn', nth: 3, title: '창밖의 노란 잎',
        scene: [
          narr('가을 아침. 창밖 은행나무가 노랗다.'),
          narr('지안이 들어와 계산대 앞에 선다.'),
          say('jieun', 'normal', '어서 오세요. 뭐 드릴까요?'),
          say('jian', 'normal', '음…'),
          cg('jian_autumn_window'),
        ],
        hints: [
          narr('지안이 창밖의 노란 잎을 본다.'),
          narr('지안이 손가락으로 메뉴판의 색 동그라미를 천천히 짚는다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '"오늘은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_opens_sketchbook'), narr('지안이 창밖을 오래 바라본다.'), say('jian', 'smile', '창밖이랑 같은 색이요. 노란색.'), narr('지안이 자리에 앉아 스케치북을 편다.'), cg(null)] },
          { id: 'recommend_season', score: 1, kind: 'plain', icon: 'cup', label: '가을 메뉴 고구마라테를 권한다.', after: [say('jian', 'smile', '네, 그걸로요.'), cg(null)] },
          { id: 'wait_silent', score: 0, kind: 'wait', icon: 'hourglass', label: '지안이 고를 때까지 말없이 기다린다.', after: [narr('지안이 한참 서 있다.'), say('jian', 'normal', '…아메리카노요. 괜찮아요.'), cg(null)] },
        ],
        why: '지안은 말 대신 창밖의 노란 잎과 메뉴판의 색을 봤어요. 지안은 색으로 고르는 사람이에요. 물어 주면 고를 수 있어요.',
      },
      winter_candle: {
        season: 'winter', nth: 4, title: '촛불 아래',
        scene: [narr('지안은 구석에 앉아 있다. 무릎 위에 스케치북이 펴져 있고, 손에는 연필이 있다.'), cg('winter_candle_jian')],
        hints: [
          narr('지안이 촛불을 오래 본다.'),
          narr('지안이 빈 종이를 내려다본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_now_color', score: 2, kind: 'ask', icon: 'question', label: '다가가 "지금은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_first_line'), narr('지안이 촛불을 오래 바라본다.'), say('jian', 'smile', '주황색이요. 촛불 색.'), narr('지안이 종이에 첫 선을 긋는다.'), cg(null)] },
          { id: 'cocoa_quiet', score: 1, kind: 'wait', icon: 'cup', label: '말없이 따뜻한 코코아를 옆에 놓아 둔다.', after: [say('jian', 'smile', '고마워요.'), narr('지안이 컵을 두 손으로 감싼다.'), cg(null)] },
          { id: 'push_draw', score: 0, kind: 'step', icon: 'pen', label: '"다 같이 있는 거, 그림으로 그려 주세요!" 하고 조른다.', after: [narr('지안이 스케치북을 덮는다.'), say('jian', 'shy', '아… 오늘은 괜찮아요.'), cg(null)] },
        ],
        why: '지안은 촛불을 오래 보고 빈 종이를 내려다봤어요. 재촉하지 않고 색을 물으면 스스로 그리기 시작해요.',
      },
      winter_snow: {
        season: 'winter', nth: 5, title: '눈 오는 날',
        scene: [
          narr('눈 오는 아침. 지안이 들어온다. 스케치북이 전보다 두툼하다.'),
          say('jieun', 'normal', '어서 오세요.'),
          narr('지안은 인사만 하고, 스케치북을 두 손으로 꼭 쥐고 서 있다.'),
          cg('jian_snow_sketchbook'),
        ],
        hints: [
          narr('지안이 나를 봤다가, 스케치북을 본다.'),
          narr('지안이 창밖의 하얀 눈을 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '"오늘은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_many_colors'), narr('지안이 나를 오래 바라보다가 웃는다.'), say('jian', 'smile', '오늘은 여러 색이요. 따뜻한 우유 주세요.'), cg(null)] },
          { id: 'usual_yuja', score: 1, kind: 'plain', icon: 'tea', label: '늘 마시던 유자차를 준비한다.', after: [say('jian', 'smile', '네. 기억해 줘서 고마워요.'), cg(null)] },
          { id: 'pry_sketch', score: 0, kind: 'step', icon: 'book', label: '"그림 생겼어요? 스케치북 보여 주세요!" 하고 묻는다.', after: [narr('지안이 스케치북을 가방에 넣는다.'), say('jian', 'shy', '아… 다음에요. 괜찮아요.'), cg(null)] },
        ],
        why: '지안은 나와 스케치북을 번갈아 봤어요. 보여 줄지 아직 망설여요. 캐묻지 않고, 늘 하던 부드러운 질문으로 말할 틈을 줘요.',
      },
    },
  },
};

/** 대응 기회 하나 */
export function touchOf(who, id) {
  return REGULARS[who]?.touches?.[id] || null;
}

/** 선택 기억 'touch'({ '사람.기회': 점수 })에서 그 사람의 신뢰(0~10) */
export function trustOf(touchMap, who) {
  let sum = 0;
  for (const [k, v] of Object.entries(touchMap || {})) if (k.startsWith(`${who}.`)) sum += Number(v) || 0;
  return Math.min(10, sum);
}

/** 신뢰 → 단계(1~3) */
export function tierOf(trust) {
  return trust >= TIER_MIN[3] ? 3 : trust >= TIER_MIN[2] ? 2 : 1;
}

/**
 * 선생님 화면용 요약: 단골마다 신뢰·단계·맞음/무난/어긋남 수·유형 수
 * logs: store.logs() 중 type 'respond' (같은 기회를 여러 번 했으면 마지막 것만 셈)
 */
export function regularReport(touchMap, logs) {
  const last = new Map();
  for (const l of logs || []) if (l.type === 'respond') last.set(`${l.who}.${l.touch}`, l);
  return Object.entries(REGULARS).map(([who, r]) => {
    const rows = [...last.values()].filter((l) => l.who === who);
    const count = (score) => rows.filter((l) => l.score === score).length;
    const kinds = Object.fromEntries(Object.keys(KINDS).map((k) => [k, rows.filter((l) => l.kind === k).length]));
    const trust = trustOf(touchMap, who);
    return { who, name: r.name, wants: r.wants, trust, tier: tierOf(trust), done: rows.length, total: Object.keys(r.touches).length, best: count(2), ok: count(1), miss: count(0), kinds };
  });
}
