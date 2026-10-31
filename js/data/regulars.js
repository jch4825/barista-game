/**
 * 단골의 '한 잔의 마음'(PRD.md 8장): 숨은 신뢰 점수 · 대응 기회 · 힌트
 * 대본에서는 respond('haesun', 'spring_cup2') 비트로 부릅니다(js/core/runner.js respondBeat).
 * 단골 8명 × 기회 5번 = 40번(배치는 docs/story.md 5장). 원하는 것: 해순 · 도 씨 · 강 씨 · 한 씨 · 수민 · 노 씨 = 기다림(말없이 살피기),
 * 지안 · 은주 = 묻기(말로 다가가기). 모든 기회에 기다림형과 묻기 · 나서기형 선택지를 함께 둡니다(PRD Q-11 제안).
 *  usual: 평소 주문(수첩의 단골 쪽 · 브루의 '늘 먹던 거' 주문) · album: 엔딩 앨범 액자(3단계 비밀 장면)
 *
 *  touch(대응 기회)
 *    season · nth: 그 사람의 몇 번째 기회인지(힌트 사다리: 1~2번째는 대사 힌트 + 행동, 3번째는 행동 둘, 4~5번째는 시선 둘)
 *    scene: 힌트 앞의 장면 · hints: 힌트 두 개([힌트 다시 보기]가 다시 보여 줌) · q: 고르기 전에 지은의 속마음
 *    choices: { id, score(2 맞음 · 1 무난 · 0 어긋남), kind(KINDS), icon, label(학생이 고르는 글), after(반응 뒤 장면) }
 *    why: 맞는 대응의 이유(힌트로 설명). 선생님 보고서와 돌아보기에 씀
 *  반응 연출은 점수로 정합니다: 0 = 작은 끄덕임 · 1 = 미소 · 2 = 오래 바라봄. 숫자는 학생 화면에 나오지 않습니다.
 *  신뢰 = 그 사람의 기회 점수 합(0~10). 같은 기회를 다시 하면 마지막 대응으로 바뀝니다(선택 기억 'touch').
 */

import { say, narr, think, enter, leave, cg, sfx, show, face, motion, emote } from '../core/dsl.js';

/** 대응 유형(선생님 화면에서 '사람에 맞게 바꾸는지' 봄) */
export const KINDS = { wait: '기다림', ask: '묻기', plain: '그대로', step: '나서기' };

/** 신뢰 단계: 1 평소 · 2 행동이 변함(4~6) · 3 비밀 장면(7~10) */
export const TIER_MIN = { 2: 4, 3: 7 };

export const REGULARS = {
  /* ---------- 해순 할머니: 기다림. 늘 따뜻한 우유 두 잔, 한 잔은 남편 자리의 몫 ---------- */
  haesun: {
    name: '해순 할머니', wants: 'wait',
    usual: { menu: 'warm_milk', temp: 'hot', togo: false, say: '해순 할머니: 따뜻한 우유 두 잔. 창가 자리. 한 잔은 빈 의자 앞에.' },
    album: { title: '남편의 마지막 주문', line: '"그 사람이 마지막으로 시킨 게 우유 두 잔이었어요."', cg: 'haesun_secret' },
    touches: {
      spring_cup2: {
        season: 'spring', nth: 1, title: '우유 두 잔',
        scene: [narr('창가 탁자에 쟁반을 내려놓는다. 할머니 옆에 빈 의자가 하나 있다.'), cg('haesun_two_cups')],
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
        scene: [narr('할머니가 아이들에게 담요를 다 나눠 주었다. 할머니 몫이 없다.'), narr('뒷방에서 사장님의 담요 두 장을 꺼내 온다.'), cg('winter_blanket_chair')],
        hints: [
          narr('할머니의 눈이 옆의 빈 의자로 간다.'),
          narr('할머니가 내 손의 담요를 보고, 다시 빈 의자를 본다.'),
        ],
        q: '담요를 어떻게 할까?',
        choices: [
          { id: 'blanket_chair', score: 2, kind: 'wait', icon: 'chair', label: '한 장은 할머니 무릎에, 한 장은 빈 의자 위에 덮어 둔다.', after: [cg('haesun_blanket_chair_warm'), narr('할머니가 의자 위의 담요를 손으로 펴고, 오래 바라본다.'), say('haesun', 'smile', '이 의자도 따뜻하네요. 고마워요.'), cg(null)] },
          { id: 'blanket_her', score: 1, kind: 'plain', icon: 'cloth', label: '담요 두 장을 모두 할머니께 드린다.', after: [say('haesun', 'smile', '고마워요.'), narr('할머니가 담요 끝을 빈 의자에도 걸쳐 둔다.'), cg(null)] },
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
    name: '지안', wants: 'ask',
    usual: { menu: null, say: '지안: 그날의 색. "오늘은 어떤 색이에요?" 하고 물어봐요.' },
    album: { title: '지은의 손', line: '"커피 내리는 손이요. 천천히 움직여서, 그리기 좋았어요."', cg: 'jian_secret' },
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
          { id: 'recommend_pink', score: 1, kind: 'plain', icon: 'icecup', label: '"딸기우유가 제일 시원해요." 하고 딸기우유를 권한다.', after: [say('jian', 'smile', '네, 그걸로 할게요.'), cg(null)] },
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
          { id: 'recommend_cocoa', score: 1, kind: 'plain', icon: 'cup', label: '"따뜻한 코코아는 어때요?" 하고 권한다.', after: [say('jian', 'smile', '네, 그걸로요.'), cg(null)] },
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

  /* ---------- 우체부 도 씨: 기다림. 아이스 아메리카노를 서서 마심. 퇴직이 가깝고 서른 해 동안 앉은 적이 없음 ---------- */
  do: {
    name: '도 씨', wants: 'wait',
    usual: { menu: 'americano', temp: 'iced', togo: false, say: '도 씨: 아이스 아메리카노. 비가 와도 아이스. 유리컵, 서서 마셔요.' },
    album: { title: '마지막 우편', line: '"서른 해 동안 남의 편지만 날랐어요. 마지막은 내 편지를 날라 보고 싶었어요."', cg: 'do_secret' },
    touches: {
      spring_stand: {
        season: 'spring', nth: 1, title: '서서 마시는 사람',
        scene: [narr('도 씨가 카운터 앞에 선 채로 커피를 마신다.'), narr('어깨에 멘 우편 가방이 무거워 보인다.'), cg('do_standing')],
        hints: [
          say('do', 'smile', '앉으면 다시 못 일어나요. 허허.'),
          narr('도 씨가 가방을 다른 어깨로 옮긴다. 눈이 카운터 옆 의자로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'pull_chair', score: 2, kind: 'wait', icon: 'chair', label: '권하지 않고, 카운터 옆 의자를 한 칸 빼 둔다.', after: [cg('do_chair_out'), narr('도 씨가 빼 둔 의자를 오래 바라본다.'), say('do', 'smile', '…다음에 앉을게요. 허허.'), narr('도 씨가 의자 등을 한 번 툭 치고 간다.'), cg(null)] },
          { id: 'say_bye', score: 1, kind: 'plain', icon: 'greet', label: '"천천히 드세요." 하고 인사만 한다.', after: [say('do', 'smile', '천천히는 못 해요. 편지가 기다려요.'), narr('도 씨가 나가면서 의자를 한 번 본다.'), cg(null)] },
          { id: 'push_sit', score: 0, kind: 'step', icon: 'chair', label: '"여기 앉으세요!" 하고 의자를 끌어다 드린다.', after: [say('do', 'surprised', '아이고, 괜찮아요. 괜찮아요.'), narr('도 씨가 서둘러 컵을 비운다. 나가면서 의자를 한 번 돌아본다.'), cg(null)] },
        ],
        why: '도 씨는 앉으면 못 일어난다며 웃었지만, 눈은 의자로 갔어요. 권하지 않고 앉을 수 있게 자리만 만들어 둬요.',
      },
      spring_rain: {
        season: 'spring', nth: 2, title: '젖은 편지',
        scene: [narr('오후에 비가 쏟아진다.'), sfx('door'), narr('도 씨가 흠뻑 젖어 들어온다. 우편 가방을 꼭 안고 있다.'), cg('do_rain_letters')],
        hints: [
          say('do', 'worried', '편지가 젖으면 안 되는데…'),
          narr('도 씨가 자기 얼굴보다 먼저, 소매로 편지를 닦는다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'towel', score: 2, kind: 'wait', icon: 'towel', label: '말없이 마른 수건 두 장을 카운터에 놓아 둔다.', after: [cg('do_towel'), narr('도 씨가 수건을 오래 바라본다.'), narr('한 장으로 편지를 닦고, 남은 한 장으로 얼굴을 닦는다.'), say('do', 'smile', '고마워요. 편지가 안 젖었네.'), cg(null)] },
          { id: 'coffee_first', score: 1, kind: 'plain', icon: 'cup', label: '"비가 많이 오네요." 하고 커피를 먼저 드린다.', after: [say('do', 'smile', '그러게요. 고마워요.'), narr('도 씨가 커피를 마시며 소매로 편지를 마저 닦는다.'), cg(null)] },
          { id: 'take_bag', score: 0, kind: 'step', icon: 'run', label: '"얼른 몸부터 말리세요!" 하고 가방을 받아 든다.', after: [say('do', 'surprised', '아, 가방은 괜찮아요. 괜찮아요.'), narr('도 씨가 가방을 다시 꼭 안고, 편지부터 닦는다.'), cg(null)] },
        ],
        why: '도 씨는 편지가 젖을까 걱정했고, 자기보다 편지를 먼저 닦았어요. 말없이 수건을 두면 편지부터 닦을 수 있어요.',
      },
      summer_hook: {
        season: 'summer', nth: 3, title: '무거운 가방',
        scene: [narr('한여름. 소포가 많은 계절이라 도 씨의 가방이 터질 듯하다.'), narr('도 씨가 가방을 젖은 바닥에 내려놓으려다 멈춘다.'), cg('do_heavy_bag')],
        hints: [
          narr('도 씨가 가방을 다시 끌어안고, 한 손으로 커피를 마신다.'),
          narr('도 씨의 눈이 문 옆의 빈 벽으로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'hook', score: 2, kind: 'wait', icon: 'hand', label: '다음 날 아침, 문 옆 벽에 가방 걸이 못을 하나 단다.', after: [narr('다음 날 아침, 사장님께 여쭙고 문 옆에 못을 하나 박았다.'), sfx('bell'), cg('do_hook'), narr('도 씨가 들어오다 멈춘다. 새 못을 오래 바라본다.'), narr('도 씨가 못에 가방을 걸고, 어깨를 크게 돌린다.'), say('do', 'smile', '허허. 어깨가 가볍네.'), cg(null)] },
          { id: 'on_counter', score: 1, kind: 'plain', icon: 'tray', label: '"가방은 카운터에 올려 두세요." 하고 자리를 비켜 준다.', after: [say('do', 'smile', '고마워요.'), narr('도 씨가 가방을 카운터에 올렸다가, 금방 다시 멘다.'), narr('나가면서 문 옆 벽을 한 번 본다.'), cg(null)] },
          { id: 'less_work', score: 0, kind: 'step', icon: 'speech', label: '"가방이 너무 무거워요. 배달을 좀 줄이세요." 하고 말한다.', after: [say('do', 'normal', '허허, 그게 내 마음대로 되나요. 괜찮아요.'), narr('도 씨가 가방을 고쳐 메고 나간다. 문 옆 벽을 한 번 본다.'), cg(null)] },
        ],
        why: '도 씨는 가방을 젖은 바닥에 못 내려놓고 안고 있었고, 문 옆 빈 벽을 봤어요. 말없이 걸 곳을 만들어 두면 돼요.',
      },
      autumn_notice: {
        season: 'autumn', nth: 4, title: '퇴직 소식',
        scene: [
          narr('도 씨가 들어와, 문 옆 못에 가방을 건다.'),
          narr('우편 한 묶음을 카운터에 놓는다. 맨 위에 우체국 소식지가 있다.'),
          narr('소식지에 도 씨의 사진과 "정년 퇴직"이라는 글자가 보인다.'),
          cg('do_notice'),
        ],
        hints: [
          narr('도 씨의 눈이 소식지로 갔다가, 얼른 창밖으로 간다.'),
          narr('도 씨의 눈이 카운터 옆 의자에 오래 머문다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'cup_by_chair', score: 2, kind: 'wait', icon: 'chair', label: '말없이 늘 그 잔을 카운터 옆 의자 앞에 놓아 둔다.', after: [cg('do_cup_chair'), narr('도 씨가 의자 앞의 잔을 오래 바라본다.'), say('do', 'smile', '…겨울이면 그만둬요. 서른 해 했으니까.'), say('jieun', 'normal', '…그러시구나.'), narr('그 말만 하고, 둘 다 더 말하지 않는다.'), cg(null)] },
          { id: 'as_usual', score: 1, kind: 'plain', icon: 'cup', label: '늘 하던 대로 잔을 카운터 위에 놓는다.', after: [say('do', 'smile', '고마워요.'), narr('도 씨가 소식지를 가방에 넣고, 의자를 한 번 본다.'), cg(null)] },
          { id: 'ask_after', score: 0, kind: 'ask', icon: 'question', label: '"퇴직하시면 뭐 하실 거예요?" 하고 묻는다.', after: [narr('도 씨가 잠깐 말이 없다.'), say('do', 'normal', '…글쎄요. 괜찮아요.'), narr('도 씨가 소식지를 가방 깊이 넣는다. 그리고 의자를 한 번 본다.'), cg(null)] },
        ],
        why: '도 씨는 퇴직 소식지에서 눈을 피했고, 의자를 오래 봤어요. 묻지 않고 앉을 자리를 내어 줘요.',
      },
      winter_last: {
        season: 'winter', nth: 5, title: '마지막 배달',
        scene: [narr('마감 무렵. 문 밖에 도 씨가 서 있다. 오늘이 마지막 배달 날이다.'), narr('가방이 납작하다. 다 배달해서 비었다.'), cg('do_last_day')],
        hints: [
          narr('도 씨의 눈이 문 옆 못으로 갔다가, "영업 끝" 팻말로 간다.'),
          narr('도 씨의 눈이 불 켜진 카운터 안쪽으로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'light_wait', score: 2, kind: 'wait', icon: 'light', label: '팻말은 그대로 두고, 불 하나를 켜 둔 채 문을 조금 열어 둔다.', after: [cg('do_last_hook'), narr('도 씨가 들어와 빈 가방을 못에 건다. 마지막으로.'), narr('도 씨가 카운터 옆 의자를 오래 바라보다가 앉는다.'), say('do', 'smile', '오늘이 마지막 배달이었어요. 서른 해.'), say('do', 'smile', '마지막에 여기 들르고 싶었어요.'), cg(null)] },
          { id: 'open_door', score: 1, kind: 'plain', icon: 'door', label: '"들어오세요." 하고 문을 열어 드린다.', after: [say('do', 'smile', '아, 닫았는데. 고마워요.'), narr('도 씨가 문 옆 못에 가방을 걸고, 서서 가게를 둘러본다.'), cg(null)] },
          { id: 'clap', score: 0, kind: 'step', icon: 'heart', label: '"오늘 마지막 날이시죠? 축하드려요!" 하고 크게 박수를 친다.', after: [say('do', 'surprised', '허허, 축하는 무슨. 괜찮아요.'), narr('도 씨가 머쓱하게 웃고 들어와, 문 옆 못을 한 번 본다.'), cg(null)] },
        ],
        why: '도 씨는 영업 끝 팻말과 불 켜진 카운터를 봤어요. 들어올지 스스로 정할 수 있게, 불을 켜 두고 기다려요.',
      },
    },
  },

  /* ---------- 어부 강 씨: 기다림. 새벽 블랙. 배를 팔았지만 아무에게도 말하지 않음 ---------- */
  kang: {
    name: '강 씨', wants: 'wait',
    usual: { menu: 'hand_drip', temp: 'hot', togo: false, say: '강 씨: 새벽 블랙(핸드드립). 머그컵. 창가에서 바다를 봐요.' },
    album: { title: '배를 판 날', line: '"그날 바다가 참 잔잔했어. 그래서 더 못 말했지."', cg: 'kang_secret' },
    touches: {
      spring_dawn: {
        season: 'spring', nth: 1, title: '불 꺼진 창',
        scene: [
          narr('새벽 여섯 시 전. 카페 불이 꺼져 있다.'),
          narr('사장님은 뒷방에서 원두를 고르고 있다. 문은 열려 있다.'),
          narr('문 앞에 아저씨 한 분이 서 있다. 안으로 들어오지 않는다.'),
          cg('kang_dark_window'),
        ],
        hints: [
          say('kang', 'normal', '불이 켜져 있으면… 들어가는데.'),
          narr('아저씨가 언 손을 비비며, 깜깜한 창을 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'light_on', score: 2, kind: 'wait', icon: 'light', label: '먼저 들어가 불을 켜고, 말없이 문을 열어 둔다.', after: [sfx('tap'), cg('kang_light_on'), narr('창에 불이 들어온다. 아저씨가 불 켜진 창을 오래 바라본다.'), narr('아저씨가 천천히 들어와 창가에 앉는다.'), say('kang', 'smile', '…고마워.'), cg(null)] },
          { id: 'greet_in', score: 1, kind: 'plain', icon: 'greet', label: '"안녕하세요. 들어오세요." 하고 인사한다.', after: [say('kang', 'normal', '…아, 그래.'), narr('아저씨가 꾸벅하고 들어와, 먼저 불 스위치를 켠다.'), cg(null)] },
          { id: 'ask_boat', score: 0, kind: 'ask', icon: 'question', label: '"오늘 배 나가세요? 날씨 좋죠?" 하고 묻는다.', after: [narr('아저씨가 대답 대신 바다 쪽을 본다.'), say('kang', 'normal', '…괜찮아요. 블랙이나 줘요.'), narr('아저씨가 들어와 불 스위치를 켠다.'), cg(null)] },
        ],
        why: '강 씨는 불이 켜져 있으면 들어온다고 했고, 깜깜한 창을 봤어요. 묻지 않고 불을 켜 두면 마음 편히 들어와요.',
      },
      spring_sea: {
        season: 'spring', nth: 2, title: '바다 안 나가요',
        scene: [narr('새벽. 강 씨가 블랙을 받아 들고 창가에 앉는다.'), narr('항구에서 배들이 나간다. 강 씨는 일어나지 않는다.'), cg('kang_window_sea')],
        hints: [
          say('kang', 'normal', '…오늘은 바다 안 나가요.'),
          narr('강 씨가 항구 끝의 빈자리 하나를 오래 본다. 커피가 식어 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'warm_cup', score: 2, kind: 'wait', icon: 'coffee', label: '아무것도 묻지 않고, 식은 잔을 따뜻한 잔으로 바꿔 둔다.', after: [cg('kang_warm_cup'), narr('강 씨가 새 잔을 두 손으로 감싸고, 오래 바라본다.'), say('kang', 'smile', '…따뜻하네.'), cg(null)] },
          { id: 'leave_be', score: 1, kind: 'plain', icon: 'freeze', label: '하던 일을 하며 그대로 둔다.', after: [narr('강 씨가 식은 커피를 다 마시고 일어난다.'), say('kang', 'normal', '잘 마셨어.'), narr('나가면서 강 씨가 빈 잔을 한 번 본다.'), cg(null)] },
          { id: 'ask_broken', score: 0, kind: 'ask', icon: 'question', label: '"배가 고장 났어요?" 하고 묻는다.', after: [narr('강 씨의 손이 잠깐 멈춘다.'), say('kang', 'normal', '…아니. 괜찮아요.'), narr('강 씨가 식은 잔을 두 손으로 감싸고, 다시 항구 끝을 본다.'), cg(null)] },
        ],
        why: '강 씨는 바다에 안 나간다고만 하고 항구의 빈자리를 봤어요. 묻지 않고 곁을 따뜻하게 해 줘요.',
      },
      summer_return: {
        season: 'summer', nth: 3, title: '며칠 만에 온 날',
        scene: [narr('사흘 동안 강 씨가 오지 않았다.'), narr('동네 시간의 새벽. 문이 열리고 강 씨가 들어온다.'), cg('kang_returns')],
        hints: [
          narr('강 씨가 늘 앉던 창가 자리에 앉는다. 두 손을 탁자 위에 가만히 둔다.'),
          narr('강 씨가 항구 쪽을 보다가, 고개를 돌린다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'as_usual', score: 2, kind: 'wait', icon: 'coffee', label: '늘 하던 대로, 아무것도 묻지 않고 블랙을 내드린다.', after: [narr('사장님이 내린 블랙을 늘 쓰던 잔에 담아 드린다.'), cg('kang_black_again'), narr('강 씨가 잔을 받아 들고 오래 바라본다.'), say('kang', 'smile', '…이 맛이지.'), cg(null)] },
          { id: 'welcome', score: 1, kind: 'plain', icon: 'greet', label: '"오랜만이에요! 보고 싶었어요." 하고 반긴다.', after: [say('kang', 'normal', '…허허. 그래.'), narr('강 씨가 쑥스럽게 모자를 고쳐 쓴다. 그리고 늘 그 잔을 기다린다.'), cg(null)] },
          { id: 'ask_why', score: 0, kind: 'ask', icon: 'question', label: '"왜 안 오셨어요? 무슨 일 있으셨어요?" 하고 묻는다.', after: [narr('강 씨가 잠깐 말이 없다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), narr('강 씨가 다시 항구에서 눈을 돌린다.'), cg(null)] },
        ],
        why: '강 씨는 늘 앉던 자리에 손을 가만히 두고, 항구에서 눈을 돌렸어요. 묻지 않고 늘 하던 대로 해 주는 것이 위로예요.',
      },
      autumn_suit: {
        season: 'autumn', nth: 4, title: '양복',
        scene: [narr('가을 새벽. 문이 열리고 강 씨가 들어온다.'), narr('작업복이 아니다. 낡은 양복에 넥타이를 맸다.'), cg('kang_suit')],
        hints: [
          narr('강 씨의 눈이 자기 손으로 간다. 거친 손이 양복 소매 밖으로 나와 있다.'),
          narr('강 씨의 눈이 늘 앉던 창가 자리로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'usual_cup', score: 2, kind: 'wait', icon: 'coffee', label: '양복 이야기는 하지 않고, 늘 그 잔에 블랙을 내드린다.', after: [cg('kang_suit_cup'), narr('강 씨가 늘 쓰던 잔을 오래 바라본다.'), narr('넥타이를 조금 느슨하게 푼다.'), say('kang', 'smile', '…역시 여기가 편하네.'), cg(null)] },
          { id: 'praise', score: 1, kind: 'plain', icon: 'greet', label: '"멋지세요!" 하고 칭찬한다.', after: [say('kang', 'normal', '…허허. 그런가.'), narr('강 씨가 넥타이를 만지작거리다, 늘 앉던 자리에 앉는다.'), cg(null)] },
          { id: 'ask_where', score: 0, kind: 'ask', icon: 'question', label: '"어디 가세요? 면접 보세요?" 하고 묻는다.', after: [narr('강 씨가 대답 없이 창밖을 본다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), cg(null)] },
        ],
        why: '강 씨는 낯선 양복 차림에 자기 손을 보고, 늘 앉던 자리를 봤어요. 늘 하던 대로가 강 씨를 편하게 해요.',
      },
      winter_snow: {
        season: 'winter', nth: 5, title: '첫눈과 소문',
        scene: [narr('첫눈이 내린 새벽. 강 씨가 어깨의 눈을 털며 들어온다.'), narr('어제 시장에서 들은 말이 떠오른다. "강 씨가 배를 팔았대."'), cg('kang_first_snow')],
        hints: [
          narr('강 씨의 눈이 창밖의 빈 항구로 간다.'),
          narr('강 씨의 눈이 언 손으로 간다. 손가락을 몇 번 쥐었다 편다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'warm_mug', score: 2, kind: 'wait', icon: 'coffee', label: '아무것도 묻지 않고, 잔을 뜨거운 물로 데워 두고 블랙을 내린다.', after: [cg('kang_warm_mug'), narr('강 씨가 데운 잔을 두 손으로 감싸고 오래 바라본다.'), say('kang', 'smile', '…잔까지 따뜻하네.'), cg(null)] },
          { id: 'first_snow', score: 1, kind: 'plain', icon: 'greet', label: '"첫눈이에요. 추우시죠?" 하고 인사한다.', after: [say('kang', 'normal', '…그래. 춥네.'), narr('강 씨가 손을 비비며 블랙을 기다린다.'), cg(null)] },
          { id: 'ask_rumor', score: 0, kind: 'ask', icon: 'question', label: '"배 파셨다면서요? 정말이에요?" 하고 묻는다.', after: [narr('강 씨의 손이 멈춘다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), narr('강 씨가 다시 빈 항구를 본다.'), cg(null)] },
        ],
        why: '강 씨는 빈 항구를 보고, 언 손을 쥐었다 폈어요. 소문을 묻지 않고, 손을 녹일 따뜻한 잔을 건네요.',
      },
    },
  },

  /* ---------- 버스 기사 한 씨: 기다림(살피기: 시간). 밤 버스를 몰고 새벽 6시 10분에 10분 쉼. 집에 가면 딸이 학교에 감 ---------- */
  han: {
    name: '한 씨', wants: 'wait',
    usual: { menu: 'vanilla_latte', temp: 'hot', togo: true, say: '한 씨: 달게 한 잔(바닐라 라테). 따뜻하게, 종이컵. 새벽 6시 10분, 10분만 쉬어요.' },
    album: { title: '컵 속의 쪽지', line: '"아빠가 먼저 갈게. 아침 꼭 먹어." 컵 받침에 쓴 쪽지.', cg: 'han_secret' },
    touches: {
      summer_first: {
        season: 'summer', nth: 1, title: '10분',
        scene: [narr('새벽 여섯 시 십 분. 종점에 마지막 밤 버스가 들어온다.'), sfx('bus'), narr('버스 기사님이 들어와 카운터 앞에 선다. 눈이 빨갛다.'), cg('han_watch')],
        hints: [
          say('han', 'normal', '10분 있어요. 버스 다시 넣으러 가야 해요.'),
          narr('기사님이 손목시계를 두 번 본다. 메뉴판은 보지 않는다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'quick', score: 2, kind: 'wait', icon: 'clock', label: '바로 만들기 시작하고, 꼭 필요한 것만 묻는다.', after: [cg('han_sits'), narr('기사님이 시계를 보고, 오랜만에 의자에 앉는다.'), narr('컵을 만드는 내 손을 오래 바라본다.'), say('han', 'smile', '덕분에 앉아서 마시겠네요.'), cg(null)] },
          { id: 'menu', score: 1, kind: 'plain', icon: 'menu', label: '"천천히 고르세요." 하고 메뉴판을 건넨다.', after: [narr('기사님이 메뉴판을 빠르게 넘긴다.'), say('han', 'normal', '…아무거나 달게요. 빨리 되는 걸로.'), cg(null)] },
          { id: 'chat', score: 0, kind: 'ask', icon: 'speech', label: '"버스 기사님이세요? 밤에 일하세요?" 하고 이야기를 건다.', after: [say('han', 'normal', '네, 네. 괜찮아요.'), narr('기사님이 대답하며 시계를 또 본다.'), cg(null)] },
        ],
        why: '한 씨는 10분밖에 없다며 시계를 두 번 봤어요. 기다리는 시간을 줄여 주는 것이 한 씨에게 맞는 친절이에요.',
      },
      summer_clock: {
        season: 'summer', nth: 2, title: '여섯 시 십 분',
        scene: [narr('동네 시간의 첫 새벽. 시계가 여섯 시 칠 분을 가리킨다.'), narr('지난번 한 씨의 말이 떠오른다.'), cg('han_clock')],
        hints: [
          say('han', 'normal', '…늘 이 시간이에요. 여섯 시 십 분.'),
          narr('창밖 종점에 밤 버스의 불빛이 들어온다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ready', score: 2, kind: 'wait', icon: 'clock', label: '버스가 들어오는 것을 보고, 달게 한 잔을 미리 만들어 둔다.', after: [cg('han_cup_ready'), sfx('bell'), narr('한 씨가 들어오다 멈춘다. 카운터 위의 컵을 오래 바라본다.'), say('han', 'surprised', '…내 거예요?'), say('jieun', 'smile', '네. 여섯 시 십 분이라서요.'), narr('한 씨가 의자에 앉아, 천천히 마신다.'), cg(null)] },
          { id: 'when_comes', score: 1, kind: 'plain', icon: 'hourglass', label: '한 씨가 들어오면 그때 바로 만든다.', after: [sfx('bell'), say('han', 'normal', '달게 한 잔이요.'), narr('한 씨가 시계를 보며 기다린다. 컵을 받자마자 일어난다.'), cg(null)] },
          { id: 'go_out', score: 0, kind: 'step', icon: 'walk', label: '버스 쪽으로 나가서 "뭐 드실 거예요?" 하고 물어본다.', after: [say('han', 'surprised', '아이고, 여기까지 나왔어요? 괜찮아요.'), narr('한 씨가 웃으며 들어온다. 그래도 시계를 본다.'), cg(null)] },
        ],
        why: '한 씨는 늘 여섯 시 십 분에 와서 10분만 쉬어요. 오는 시간에 맞춰 미리 만들어 두면 기다림이 없어요.',
      },
      autumn_note: {
        season: 'autumn', nth: 3, title: '딸 사진과 펜',
        scene: [narr('여섯 시 십 분. 한 씨가 컵을 받아 들고 앉는다.'), narr('한 씨가 휴대폰을 본다. 화면에 교복 입은 아이의 사진이 있다.'), cg('han_photo')],
        hints: [
          narr('한 씨가 주머니에서 펜을 꺼냈다가, 쓸 종이가 없어 다시 넣는다.'),
          narr('한 씨가 들고 갈 종이컵 옆면을 손가락으로 만진다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'memo_pen', score: 2, kind: 'wait', icon: 'pen', label: '말없이 작은 메모지와 펜을 컵 옆에 놓아 둔다.', after: [cg('han_memo'), narr('한 씨가 메모지를 오래 바라본다.'), narr('무언가를 천천히 쓴다. 그리고 접어서 가슴 주머니에 넣는다.'), say('han', 'smile', '고마워요. 딸한테요.'), cg(null)] },
          { id: 'say_pretty', score: 1, kind: 'ask', icon: 'speech', label: '"따님 사진이에요? 예쁘네요." 하고 말한다.', after: [say('han', 'smile', '네, 중학생이에요.'), narr('한 씨가 사진을 끄고 시계를 본다. 펜은 주머니에 그대로다.'), cg(null)] },
          { id: 'ask_fight', score: 0, kind: 'step', icon: 'question', label: '"따님이랑 사이가 안 좋으세요?" 하고 묻는다.', after: [say('han', 'surprised', '아니요, 그런 거 아니에요. 괜찮아요.'), narr('한 씨가 서둘러 일어난다.'), cg(null)] },
        ],
        why: '한 씨는 딸 사진을 보다가 펜을 꺼냈지만, 쓸 종이가 없었어요. 쓸 것을 놓아 두면 마음을 전할 수 있어요.',
      },
      autumn_fog: {
        season: 'autumn', nth: 4, title: '안개로 늦은 날',
        scene: [
          narr('짙은 안개. 6시 10분에 맞춰 달게 한 잔을 만들어 두었다.'),
          narr('그런데 버스가 오지 않는다. 6시 25분, 한 씨가 뛰어 들어온다.'),
          cg('han_fog'),
        ],
        hints: [
          narr('한 씨의 눈이 벽시계로 간다. 남은 시간은 3분.'),
          narr('한 씨의 눈이 카운터 위, 미리 만들어 둔 잔으로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'lid_hands', score: 2, kind: 'wait', icon: 'cup', label: '미리 만든 잔에 뚜껑을 덮어, 말없이 두 손으로 건넨다.', after: [cg('han_cup_hands'), narr('한 씨가 잔을 받아 들고, 나를 오래 바라본다.'), say('han', 'smile', '…고마워요. 오늘은 이 한 모금이면 돼요.'), narr('한 씨가 다시 안개 속으로 뛰어간다.'), cg(null)] },
          { id: 'mug_slow', score: 1, kind: 'plain', icon: 'chair', label: '"천천히 드세요." 하고 머그에 다시 담아 드린다.', after: [say('han', 'normal', '아, 시간이… 괜찮아요.'), narr('한 씨가 세 모금을 급히 마시고 일어난다.'), cg(null)] },
          { id: 'ask_late', score: 0, kind: 'ask', icon: 'question', label: '"왜 늦으셨어요? 안개 때문이에요?" 하고 묻는다.', after: [say('han', 'normal', '네, 네. 괜찮아요.'), narr('한 씨가 대답하는 사이 시계를 본다. 잔을 들고 뛰어간다.'), cg(null)] },
        ],
        why: '한 씨는 시계를 보고, 미리 만든 잔을 봤어요. 3분뿐일 때는 말보다 바로 건네는 잔이 필요해요.',
      },
      winter_daughter: {
        season: 'winter', nth: 5, title: '딸과 함께 온 새벽',
        scene: [narr('겨울 방학. 6시 10분, 한 씨 뒤에 패딩을 입은 아이가 있다.'), narr('딸이 아빠의 마지막 버스를 타고 같이 왔다고 한다.'), cg('han_with_daughter')],
        hints: [
          narr('한 씨의 눈이 딸을 보다가, 벽시계로 간다. 남은 시간은 10분.'),
          narr('딸의 눈이 메뉴판의 갈색 동그라미로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'cocoa_quiet', score: 2, kind: 'wait', icon: 'cup', label: '묻지 않고, 한 씨의 잔 옆에 따뜻한 코코아를 놓아 둔다.', after: [cg('han_two_cups'), narr('딸이 코코아를 보고 아빠를 본다. 한 씨가 나를 오래 바라본다.'), say('han_daughter', 'smile', '아빠, 이거 나 먹어도 돼?'), say('han', 'smile', '그럼. 천천히 마셔. 오늘은 아빠도 천천히야.'), cg(null)] },
          { id: 'ask_daughter', score: 1, kind: 'ask', icon: 'question', label: '"따님은 뭐 드실래요?" 하고 묻는다.', after: [narr('딸이 메뉴판을 한참 고른다. 한 씨가 시계를 본다.'), say('han_daughter', 'normal', '…코코아요.'), cg(null)] },
          { id: 'tell_dad', score: 0, kind: 'step', icon: 'speech', label: '"아빠가 매일 오세요! 따님 얘기 많이 해요." 하고 말한다.', after: [say('han', 'surprised', '아, 그런 얘기를… 허허. 괜찮아요.'), narr('딸이 쑥스러워 고개를 숙인다. 둘 다 말이 없어진다.'), cg(null)] },
        ],
        why: '한 씨는 딸과 남은 10분을 봤고, 딸은 갈색 동그라미를 봤어요. 묻는 시간도 아껴 주면 둘이 더 오래 이야기해요.',
      },
    },
  },

  /* ---------- 새내기 엄마 은주: 묻기(따뜻한 말). 디카페인 라테. 커피가 늘 식고, 말 걸 사람이 없음 ---------- */
  eunju: {
    name: '은주', wants: 'ask',
    usual: { menu: 'decaf_latte', temp: 'hot', togo: false, say: '은주: 디카페인 라테. 따뜻하게. 두꺼운 컵에 뚜껑을 덮으면 덜 식어요.' },
    album: { title: '일주일의 말', line: '"일주일 동안 어른이랑 말한 게 여기가 처음이었어요."', cg: 'eunju_secret' },
    touches: {
      summer_cold: {
        season: 'summer', nth: 1, title: '늘 식는 커피',
        scene: [narr('은주가 아기를 달래는 사이, 라테가 다 식었다.'), narr('삼십 분 동안 한 모금도 못 마셨다.'), cg('eunju_cold_cup')],
        hints: [
          say('eunju', 'sad', '커피는 늘 식어요. 끝까지 못 마셔요.'),
          narr('은주가 식은 컵을 만져 보고, 한숨을 쉰다. 눈은 아기에게 있다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'thick_cup', score: 2, kind: 'ask', icon: 'coffee', label: '두꺼운 컵에 새로 담고 뚜껑을 덮어 드리며 "이건 천천히 식어요." 하고 말한다.', after: [cg('eunju_thick_cup'), narr('은주가 두꺼운 컵을 두 손으로 감싸고, 오래 바라본다.'), say('eunju', 'smile', '…따뜻하다. 고마워요.'), say('eunju', 'smile', '누가 말 걸어 준 거, 오랜만이에요.'), cg(null)] },
          { id: 'reheat', score: 1, kind: 'wait', icon: 'milk', label: '말없이 식은 라테를 데워서 다시 놓아 둔다.', after: [say('eunju', 'smile', '아, 고마워요.'), narr('은주가 한 모금 마신다. 아기가 또 울어서 컵을 내려놓는다.'), cg(null)] },
          { id: 'take_baby', score: 0, kind: 'step', icon: 'run', label: '"아기 제가 좀 봐 드릴게요!" 하고 유모차를 민다.', after: [say('eunju', 'surprised', '아, 아니에요. 괜찮아요.'), narr('은주가 유모차 손잡이를 다시 잡는다. 눈이 식은 컵으로 간다.'), cg(null)] },
        ],
        why: '은주는 커피가 늘 식는다며 식은 컵에 한숨을 쉬었어요. 덜 식는 컵과 따뜻한 말 한마디가 은주에게 필요해요.',
      },
      summer_talk: {
        season: 'summer', nth: 2, title: '아기랑만 하는 이야기',
        scene: [narr('은주가 창가에 앉아 있다. 오늘은 두꺼운 컵이다.'), narr('옆 탁자에서 손님들이 웃으며 이야기한다.'), cg('eunju_listens')],
        hints: [
          say('eunju', 'normal', '요즘은 아기랑만 이야기해요. 하하.'),
          narr('은주가 옆 탁자의 웃음소리 쪽을 한참 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_baby', score: 2, kind: 'ask', icon: 'speech', label: '"아기가 몇 개월이에요?" 하고 부드럽게 말을 건다.', after: [cg('eunju_baby_talk'), narr('은주가 나를 오래 바라본다. 그리고 웃는다.'), say('eunju', 'smile', '여섯 달이요. 어제 처음 뒤집기를 했어요.'), say('eunju', 'smile', '이 얘기, 누구한테 꼭 하고 싶었어요.'), cg(null)] },
          { id: 'water', score: 1, kind: 'wait', icon: 'water', label: '말없이 물 한 잔을 놓아 둔다.', after: [say('eunju', 'smile', '고마워요.'), narr('은주가 다시 옆 탁자 쪽을 본다.'), cg(null)] },
          { id: 'my_story', score: 0, kind: 'step', icon: 'speech', label: '"저희 언니도 아기가 있는데요…" 하고 내 이야기를 길게 한다.', after: [say('eunju', 'normal', '아, 네…'), narr('은주가 고개만 끄덕인다. 아기가 깨서 일어난다.'), say('eunju', 'normal', '괜찮아요. 다음에 또 올게요.'), cg(null)] },
        ],
        why: '은주는 요즘 아기하고만 이야기한다며 다른 사람들의 웃음소리를 봤어요. 은주의 이야기를 들을 수 있게 물어봐요.',
      },
      autumn_space: {
        season: 'autumn', nth: 3, title: '걸리는 유모차',
        scene: [sfx('bell'), narr('은주 씨가 유모차를 밀고 들어오다, 의자에 걸린다.'), narr('가을이라 탁자를 늘렸더니 통로가 좁다.'), cg('eunju_door')],
        hints: [
          narr('은주 씨가 유모차를 뒤로 뺐다가 다시 민다. 의자 다리에 또 걸린다.'),
          narr('은주 씨가 창가 쪽 빈 곳을 본다. 그리고 입구에서 머뭇거린다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_where', score: 2, kind: 'ask', icon: 'chair', label: '"어디가 편하세요? 자리 만들어 드릴게요." 하고 물으며 의자를 옮긴다.', after: [cg('eunju_space'), say('eunju', 'smile', '창가요. 아기가 바다를 좋아해요.'), narr('의자 두 개를 옮기자 유모차가 쏙 들어간다.'), narr('은주 씨가 나를 오래 바라본다.'), say('eunju', 'smile', '물어봐 줘서 고마워요.'), cg(null)] },
          { id: 'move_one', score: 1, kind: 'wait', icon: 'door', label: '말없이 의자 하나를 옆으로 치워 둔다.', after: [narr('은주 씨가 겨우 유모차를 밀고 들어온다.'), say('eunju', 'smile', '고마워요.'), narr('은주 씨가 창가 쪽을 한 번 본다.'), cg(null)] },
          { id: 'hold_baby', score: 0, kind: 'step', icon: 'hand', label: '아기를 안아 들어 주려고 두 손을 내민다.', after: [say('eunju', 'surprised', '아, 괜찮아요. 아기가 낯을 가려서요.'), narr('은주 씨가 유모차를 입구에 세워 둔다. 창가 쪽을 한 번 본다.'), cg(null)] },
        ],
        why: '은주 씨는 유모차가 걸려 머뭇거리며 창가 쪽을 봤어요. 은주 씨에게는 "어디가 편하세요?" 하고 물어보는 것이 맞아요.',
      },
      winter_tired: {
        season: 'winter', nth: 4, title: '지친 얼굴',
        scene: [narr('첫눈 오는 오후. 은주 씨가 들어온다. 눈이 빨갛다.'), narr('아기가 감기에 걸려 밤새 깼다고 한다.'), cg('eunju_tired')],
        hints: [
          narr('은주 씨의 눈이 창밖의 눈으로 갔다가, 나에게 온다. 무언가 말하려다 멈춘다.'),
          narr('은주 씨의 눈이 늘 앉던 유모차 자리로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'ask_sleep', score: 2, kind: 'ask', icon: 'speech', label: '"어젯밤엔 좀 주무셨어요?" 하고 묻고, 유모차 자리로 안내한다.', after: [cg('eunju_heard'), narr('은주 씨가 나를 오래 바라본다.'), say('eunju', 'sad', '…한숨도 못 잤어요. 그걸 물어봐 준 사람, 지은 씨가 처음이에요.'), narr('은주 씨가 자리에 앉아 조금 운다. 그리고 웃는다.'), cg(null)] },
          { id: 'latte_quiet', score: 1, kind: 'wait', icon: 'coffee', label: '말없이 따뜻한 라테를 두꺼운 컵에 내 드린다.', after: [say('eunju', 'smile', '고마워요.'), narr('은주 씨가 컵을 감싸고 창밖을 본다.'), cg(null)] },
          { id: 'go_doctor', score: 0, kind: 'step', icon: 'caution', label: '"감기면 병원부터 가셔야죠!" 하고 말한다.', after: [say('eunju', 'normal', '…다녀왔어요. 괜찮아요.'), narr('은주 씨가 고개를 숙이고 유모차 쪽을 본다.'), cg(null)] },
        ],
        why: '은주 씨는 무언가 말하려다 멈췄어요. 묻기를 기다리는 사람에게는 먼저 부드럽게 물어봐 줘요.',
      },
      winter_friend: {
        season: 'winter', nth: 5, title: '처음 온 엄마',
        scene: [sfx('bell'), narr('은주 씨가 유모차를 밀고 들어온다. 뒤에 처음 보는 엄마가 서 있다.'), narr('처음 온 엄마는 문 앞에서 머뭇거린다. 유모차를 꼭 쥐고 있다.'), cg('eunju_friend')],
        hints: [
          narr('은주 씨의 눈이 처음 온 엄마로 갔다가, 나에게 온다.'),
          narr('처음 온 엄마의 눈이 유모차 자리로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'welcome_new', score: 2, kind: 'ask', icon: 'speech', label: '처음 온 엄마에게 "유모차는 여기 두세요. 따뜻한 걸로 드릴까요?" 하고 묻는다.', after: [cg('eunju_two_moms'), say('mom2', 'smile', '아… 네. 따뜻한 걸로요.'), narr('은주 씨가 나를 오래 바라본다. 그리고 작게 엄지를 든다.'), say('eunju', 'smile', '거봐요. 여기 좋다고 했죠.'), cg(null)] },
          { id: 'make_space', score: 1, kind: 'wait', icon: 'chair', label: '말없이 유모차 자리를 하나 더 만들어 둔다.', after: [narr('처음 온 엄마가 조심스럽게 들어와 앉는다.'), say('eunju', 'smile', '고마워요, 지은 씨.'), cg(null)] },
          { id: 'only_eunju', score: 0, kind: 'plain', icon: 'menu', label: '은주 씨에게만 "늘 먹던 거죠?" 하고 묻는다.', after: [say('eunju', 'normal', '네. 아, 이분은…'), narr('처음 온 엄마는 아직 문 앞에 서 있다.'), say('eunju', 'smile', '괜찮아요. 이리 와요.'), cg(null)] },
        ],
        why: '은주 씨는 처음 온 엄마와 나를 번갈아 봤어요. 은주 씨에게 그랬듯, 처음 온 사람에게도 먼저 따뜻하게 물어봐요.',
      },
    },
  },

  /* ---------- 고3 수민: 기다림(거리). 가장 싼 음료(보리차), 구석 자리, 이어폰. 합격하면 마을을 떠남 ---------- */
  sumin: {
    name: '수민', wants: 'wait',
    usual: { menu: 'barley_tea', temp: 'iced', togo: false, say: '수민: 보리차(가장 싼 음료). 구석 자리. 말 걸기보다 조용히.' },
    album: { title: '합격 통지서', line: '"여기서 열고 싶었어요. 혼자 열면 무서울 것 같아서."', cg: 'sumin_secret' },
    touches: {
      summer_corner: {
        season: 'summer', nth: 1, title: '구석의 이어폰',
        scene: [narr('수민이 구석 자리에 앉아 문제집을 편다. 이어폰을 다시 낀다.'), cg('sumin_corner')],
        hints: [
          say('sumin', 'normal', '…여기, 조용해서요.'),
          narr('수민이 의자를 벽 쪽으로 조금 돌려 앉는다.'),
        ],
        q: '보리차를 어떻게 드릴까?',
        choices: [
          { id: 'quiet_put', score: 2, kind: 'wait', icon: 'cup', label: '구석 자리에 말없이 놓고 돌아온다.', after: [cg('sumin_nod'), narr('수민이 컵을 보고, 나를 오래 바라본다. 작게 고개를 숙인다.'), narr('이어폰은 그대로다. 문제집 넘기는 소리만 난다.'), cg(null)] },
          { id: 'call_out', score: 1, kind: 'plain', icon: 'bell_call', label: '카운터에서 "보리차 나왔어요!" 하고 부른다.', after: [narr('수민이 이어폰을 빼고 컵을 가지러 온다.'), say('sumin', 'normal', '…네.'), narr('수민이 다시 구석으로 가서 이어폰을 낀다.'), cg(null)] },
          { id: 'ask_grade', score: 0, kind: 'ask', icon: 'question', label: '"공부하러 왔어요? 몇 학년이에요?" 하고 말을 건다.', after: [say('sumin', 'normal', '…고3이요. 괜찮아요.'), narr('수민이 이어폰 소리를 키운다. 의자를 벽 쪽으로 더 돌린다.'), cg(null)] },
        ],
        why: '수민은 조용해서 왔다며 의자를 벽 쪽으로 돌렸어요. 말을 걸기보다 조용히 두는 것이 수민에게 맞아요.',
      },
      summer_rain: {
        season: 'summer', nth: 2, title: '처마 밑의 비',
        scene: [narr('저녁, 비가 쏟아진다. 줄은 아직 길다.'), narr('처마 밑에 교복 입은 수민이 서 있다. 우산이 없다.'), cg('sumin_eave')],
        hints: [
          say('sumin', 'normal', '…비 그치면 갈게요.'),
          narr('수민이 휴대폰 시계를 보고, 다시 빗줄기를 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'umbrella', score: 2, kind: 'wait', icon: 'door', label: '말없이 가게 우산 하나를 수민 옆에 세워 둔다.', after: [cg('sumin_umbrella'), narr('수민이 우산을 오래 바라본다.'), narr('수민이 우산을 펴고, 나를 한 번 돌아본다. 작게 고개를 숙인다.'), cg(null)] },
          { id: 'stay', score: 1, kind: 'plain', icon: 'speech', label: '"비 그칠 때까지 있어도 돼요." 하고 말한다.', after: [say('sumin', 'normal', '…네. 고마워요.'), narr('수민이 처마 끝에 더 붙어 선다.'), cg(null)] },
          { id: 'walk_her', score: 0, kind: 'step', icon: 'walk', label: '"집이 어디예요? 같이 가 줄게요." 하고 따라나선다.', after: [say('sumin', 'surprised', '아, 괜찮아요. 혼자 갈 수 있어요.'), narr('수민이 가방을 머리에 이고 빗속으로 뛰어간다.'), cg(null)] },
        ],
        why: '수민은 비가 그치면 가겠다며 시계를 봤어요. 다가가지 않아도 우산 하나면 돼요. 수민에게는 거리가 편해요.',
      },
      autumn_brochure: {
        season: 'autumn', nth: 3, title: '떨어진 안내서',
        scene: [narr('수민이 계산대 앞에서 지갑을 꺼내다, 종이 한 장을 떨어뜨린다.'), narr('도시에 있는 대학교의 안내서다.'), cg('sumin_brochure')],
        hints: [
          narr('수민이 얼른 손을 뻗었다가, 멈춘다. 얼굴이 빨개진다.'),
          narr('수민이 창밖의 바다 쪽을 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'face_down', score: 2, kind: 'wait', icon: 'book', label: '안내서를 보지 않고, 뒤집어서 건넨다.', after: [cg('sumin_brochure_back'), narr('수민이 뒤집힌 종이를 오래 바라본다.'), narr('작게 고개를 숙이고, 안내서를 가방에 넣는다.'), say('sumin', 'normal', '…고맙습니다.'), cg(null)] },
          { id: 'just_give', score: 1, kind: 'plain', icon: 'hand', label: '그냥 주워서 건넨다.', after: [narr('수민이 안내서를 받아 들고 얼른 접는다.'), say('sumin', 'normal', '…네.'), cg(null)] },
          { id: 'say_city', score: 0, kind: 'ask', icon: 'speech', label: '"도시로 가요? 좋겠다!" 하고 말한다.', after: [say('sumin', 'normal', '…아직 몰라요. 괜찮아요.'), narr('수민이 이어폰을 다시 낀다.'), cg(null)] },
        ],
        why: '수민은 안내서를 주우려다 멈추고 얼굴이 빨개졌어요. 보지 않고 돌려주는 것이 수민의 마음을 지켜 줘요.',
      },
      autumn_exam: {
        season: 'autumn', nth: 4, title: '수능 날 아침',
        scene: [narr('따뜻한 보리차를 종이컵에 담았다. 슬리브를 끼울 차례다.'), narr('수민이 계산대 앞에 서서 기다린다. 오늘은 이어폰이 없다.'), cg('sumin_exam_morning')],
        hints: [
          narr('수민의 눈이 떨리는 자기 손으로 간다.'),
          narr('수민의 눈이 컵의 하얀 슬리브로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'draw_wave', score: 2, kind: 'wait', icon: 'pen', label: '슬리브에 작은 파도 그림을 그려, 말없이 건넨다.', after: [cg('sumin_sleeve'), narr('수민이 슬리브의 파도를 오래 바라본다.'), narr('손의 떨림이 조금 멎는다.'), say('sumin', 'smile', '…다녀올게요.'), cg(null)] },
          { id: 'cheer', score: 1, kind: 'plain', icon: 'speech', label: '"시험 잘 보세요!" 하고 말한다.', after: [say('sumin', 'normal', '…네. 고맙습니다.'), narr('수민이 컵을 들고 나간다. 손이 아직 떨린다.'), cg(null)] },
          { id: 'ask_score', score: 0, kind: 'ask', icon: 'question', label: '"긴장돼요? 몇 점 받고 싶어요?" 하고 묻는다.', after: [say('sumin', 'normal', '…모르겠어요. 괜찮아요.'), narr('수민이 컵을 꼭 쥐고 나간다.'), cg(null)] },
        ],
        why: '수민은 떨리는 손과 하얀 슬리브를 봤어요. 말 대신 작은 그림 하나가 수민에게 응원이 돼요.',
      },
      winter_letter: {
        season: 'winter', nth: 5, title: '봉투',
        scene: [narr('수민이 카운터 앞에 선다. 손에 하얀 봉투가 있다.'), narr('대학교 이름이 찍힌 봉투다. 아직 뜯지 않았다.'), cg('sumin_envelope')],
        hints: [
          narr('수민의 눈이 봉투로 갔다가, 나를 본다.'),
          narr('수민의 눈이 카운터 앞의 의자로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'wipe_wait', score: 2, kind: 'wait', icon: 'cloth', label: '아무것도 묻지 않고, 컵을 닦으며 수민이 말할 때까지 기다린다.', after: [cg('sumin_wait'), narr('수민이 카운터 앞 의자에 앉는다. 봉투를 오래 바라본다.'), say('sumin', 'normal', '…내일 열어 볼게요. 여기서요.'), cg(null)] },
          { id: 'usual_ask', score: 1, kind: 'plain', icon: 'cup', label: '"보리차요?" 하고 늘 하던 대로 묻는다.', after: [say('sumin', 'normal', '…네.'), narr('수민이 봉투를 가방에 넣는다.'), cg(null)] },
          { id: 'push_open', score: 0, kind: 'step', icon: 'hand', label: '"합격했어요? 열어 봐요!" 하고 재촉한다.', after: [say('sumin', 'surprised', '아… 아직요. 괜찮아요.'), narr('수민이 봉투를 가방 깊이 넣는다.'), cg(null)] },
        ],
        why: '수민은 봉투와 나를 번갈아 보고, 앞 의자를 봤어요. 재촉하지 않고 기다리면 수민이 스스로 말해요.',
      },
    },
  },

  /* ---------- 철물점 노 씨: 기다림(모른 척). 사장님이 타는 믹스커피. 사장님의 손떨림을 가장 먼저 앎 ---------- */
  noh: {
    name: '노 씨', wants: 'wait',
    usual: { menu: 'mix_coffee', temp: 'hot', togo: false, say: '노 씨: 믹스커피(사장님 방식). 종이컵, 물은 선까지, 열 바퀴.' },
    album: { title: '처음 떨린 날', line: '"그날 내가 옆에 있었어. 아무 말도 안 했지. 그게 그 사람 방식이니까."', cg: 'noh_secret' },
    touches: {
      summer_spoon: {
        season: 'summer', nth: 1, title: '떨리는 숟가락',
        scene: [
          narr('철물점 노 씨가 들어온다. 주문은 하지 않는다.'),
          narr('사장님이 종이컵에 믹스커피를 탄다. 서른 해 동안 그렇게 해 왔다고 한다.'),
          narr('컵 안에서 숟가락이 달그락, 조금 떨린다.'),
          cg('noh_spoon'),
        ],
        hints: [
          say('noh', 'normal', '오늘 바람이 좋네. 바다가 잔잔해.'),
          narr('노 씨가 사장님 손을 한 번 보고, 일부러 창밖으로 눈을 돌린다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'window_talk', score: 2, kind: 'wait', icon: 'window', label: '나도 못 본 척, 노 씨와 창밖 이야기를 한다.', after: [say('jieun', 'normal', '정말 잔잔하네요. 배들이 다 나갔어요.'), cg('noh_window_talk'), narr('노 씨가 나를 오래 바라본다. 그리고 작게 웃는다.'), say('noh', 'smile', '그래. 오늘 같은 날은 바다가 착하지.'), cg(null)] },
          { id: 'keep_work', score: 1, kind: 'plain', icon: 'freeze', label: '아무 말 없이 하던 일을 한다.', after: [narr('사장님이 컵을 노 씨 앞에 놓는다.'), say('noh', 'normal', '고맙네.'), narr('노 씨가 커피를 마시며 창밖만 본다.'), cg(null)] },
          { id: 'ask_hand', score: 0, kind: 'ask', icon: 'question', label: '"사장님, 손 괜찮으세요?" 하고 묻는다.', after: [say('owner', 'normal', '…괜찮아요.'), narr('사장님이 숟가락을 내려놓고, 손을 앞치마에 닦는다.'), say('noh', 'normal', '괜찮아요, 괜찮아. 바람이 좋네.'), narr('노 씨가 창밖을 보며 같은 말을 한 번 더 한다.'), cg(null)] },
        ],
        why: '노 씨는 사장님 손을 보고도 일부러 창밖 이야기를 했어요. 손님들 앞에서 사장님이 불편하지 않게 모른 척 함께해 줘요.',
      },
      autumn_shelf: {
        season: 'autumn', nth: 2, title: '낮아진 선반',
        scene: [narr('사장님이 은행에 간 사이, 노 씨가 공구 상자를 들고 온다.'), narr('노 씨가 컵 선반을 한 칸 낮추고, 문손잡이를 조인다.'), cg('noh_shelf')],
        hints: [
          say('noh', 'normal', '선반이 좀 높았어. 손이 닿기 편해야지.'),
          narr('노 씨가 입에 손가락을 대고, 사장님 자리를 한 번 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'say_nothing', score: 2, kind: 'wait', icon: 'freeze', label: '아무것도 묻지 않고, 사장님께도 말하지 않는다.', after: [cg('noh_wink'), narr('노 씨가 나를 오래 바라본다. 작게 고개를 끄덕인다.'), say('noh', 'smile', '눈치가 있구먼.'), narr('노 씨가 공구 상자를 들고 조용히 나간다.'), cg(null)] },
          { id: 'loud_thanks', score: 1, kind: 'plain', icon: 'greet', label: '"고맙습니다!" 하고 크게 인사한다.', after: [say('noh', 'normal', '쉿. 그냥 고장 난 거 고친 거야.'), narr('노 씨가 공구 상자를 들고 서둘러 나간다.'), cg(null)] },
          { id: 'ask_hand', score: 0, kind: 'ask', icon: 'question', label: '"사장님 손 때문에 고치시는 거죠?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…그냥 고장 난 거야. 괜찮아.'), narr('노 씨가 입에 손가락을 한 번 더 댄다.'), cg(null)] },
        ],
        why: '노 씨는 사장님이 없을 때 몰래 고치고, 입에 손가락을 댔어요. 모른 척해 주는 것이 노 씨의 방식이에요.',
      },
      autumn_empty: {
        season: 'autumn', nth: 3, title: '사장님의 빈 잔',
        scene: [narr('마감 무렵. 노 씨가 들어와 카운터 앞에 선다.'), narr('사장님이 없는 첫 가을 저녁이다.'), cg('noh_empty_mug')],
        hints: [
          narr('노 씨가 선반 위, 사장님의 하얀 잔을 오래 본다.'),
          narr('노 씨가 주머니에서 믹스커피 봉지를 꺼냈다가, 다시 넣는다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'newspaper', score: 2, kind: 'wait', icon: 'note', label: '사장님 이야기는 꺼내지 않고, 노 씨가 늘 보던 신문을 펴 놓아 둔다.', after: [cg('noh_newspaper'), narr('노 씨가 신문을 오래 바라본다. 그리고 의자에 앉는다.'), say('noh', 'normal', '…그 잔 줘.'), cg(null)] },
          { id: 'ask_order', score: 1, kind: 'plain', icon: 'question', label: '"오늘은 뭐 드릴까요?" 하고 묻는다.', after: [narr('노 씨가 잠깐 망설인다.'), say('noh', 'normal', '…그 잔 줘.'), cg(null)] },
          { id: 'ask_owner', score: 0, kind: 'ask', icon: 'speech', label: '"사장님 손은 많이 안 좋으세요?" 하고 묻는다.', after: [narr('노 씨가 한참 말이 없다.'), say('noh', 'normal', '…괜찮아질 거야. 그 잔 줘.'), cg(null)] },
        ],
        why: '노 씨는 사장님의 빈 잔을 보고, 믹스 봉지를 꺼냈다가 넣었어요. 걱정을 말하지 않는 사람이니 평소처럼 대해 줘요.',
      },
      winter_check: {
        season: 'winter', nth: 4, title: '지나가다 들른 아침',
        scene: [narr('눈 오는 아침. 노 씨가 "지나가다" 들른다. 오늘로 사흘째다.'), narr('노 씨가 들어오자마자 덜덜거리는 난로 쪽을 본다.'), cg('noh_heater')],
        hints: [
          narr('노 씨의 눈이 난로로 갔다가, 카운터 뒤 사장님 자리로 간다.'),
          narr('노 씨의 눈이 나에게 와서, 내 손을 잠깐 본다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'believe', score: 2, kind: 'wait', icon: 'coffee', label: '"지나가다"라는 말을 그대로 믿는 척, 늘 그 잔을 탄다.', after: [cg('noh_mix_winter'), narr('노 씨가 종이컵을 받아 들고, 나를 오래 바라본다.'), say('noh', 'smile', '…사장 맛이 나.'), cg(null)] },
          { id: 'thank_daily', score: 1, kind: 'plain', icon: 'greet', label: '"매일 와 주셔서 고맙습니다." 하고 인사한다.', after: [say('noh', 'normal', '허, 지나가다 들렀다니까.'), narr('노 씨가 헛기침을 한다.'), cg(null)] },
          { id: 'ask_owner_sent', score: 0, kind: 'ask', icon: 'question', label: '"사장님이 부탁하셨어요? 저 보러 오시는 거죠?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…아니. 괜찮아. 지나가다 들렀어.'), cg(null)] },
        ],
        why: '노 씨는 난로와 사장님 자리, 내 손을 살폈어요. 지나가다 들렀다는 말 뒤의 마음을 모른 척 받아 줘요.',
      },
      winter_lantern: {
        season: 'winter', nth: 5, title: '랜턴',
        scene: [narr('정전 밤. 노 씨가 커다란 랜턴을 들고 들어온다.'), narr('아주 오래된 랜턴이다. 손잡이가 닳아 반질반질하다.'), cg('noh_lantern')],
        hints: [
          narr('노 씨의 눈이 걸 곳을 찾다가, 사장님 자리 위의 못에 머문다.'),
          narr('노 씨의 눈이 나에게 잠깐 왔다가, 다시 그 못으로 간다.'),
        ],
        q: '어떻게 할까?',
        choices: [
          { id: 'step_aside', score: 2, kind: 'wait', icon: 'light', label: '아무것도 묻지 않고, 그 못에 걸 수 있게 자리를 비켜 준다.', after: [cg('noh_lantern_hung'), narr('노 씨가 사장님 자리 위에 랜턴을 건다. 가게가 환해진다.'), narr('노 씨가 불빛을 오래 바라본다.'), say('noh', 'smile', '…이 랜턴, 저기가 원래 자리야.'), cg(null)] },
          { id: 'hang_myself', score: 1, kind: 'plain', icon: 'hand', label: '"제가 걸게요." 하고 받아서 가까운 데 건다.', after: [say('noh', 'normal', '…그래, 고맙네.'), narr('노 씨가 랜턴을 사장님 자리 위의 못으로 옮겨 건다.'), cg(null)] },
          { id: 'ask_lantern', score: 0, kind: 'ask', icon: 'question', label: '"이거 사장님 거예요? 왜 갖고 계세요?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…나중에. 괜찮아. 일단 불부터.'), narr('노 씨가 사장님 자리 위의 못에 랜턴을 건다.'), cg(null)] },
        ],
        why: '노 씨는 랜턴을 걸 곳으로 사장님 자리의 못을 봤어요. 사연을 묻지 않고, 그 자리에 걸 수 있게 해 줘요.',
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
