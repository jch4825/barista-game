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
        scene: [
          narr('창가 탁자에 쟁반을 내려놓는다. 할머니 옆에는 아무도 앉지 않은 의자가 하나 있다.'),
          narr('그 의자 앞의 탁자도, 할머니 앞처럼 깨끗하게 닦여 있다.'),
          cg('haesun_two_cups'),
        ],
        hints: [
          say('haesun', 'normal', '한 잔은 내 앞에, 한 잔은 저기 놓아 줘요. 저 의자 앞에요.'),
          narr('할머니는 말하면서 빈 의자 쪽으로 손을 뻗어, 의자 등을 한 번 천천히 쓸어 준다.'),
        ],
        q: '혼자 오셨는데 우유는 두 잔이다. 두 번째 잔은 어디에 놓을까?',
        choices: [
          { id: 'put_at_chair', score: 2, kind: 'wait', icon: 'chair', label: '말씀하신 대로, 두 번째 잔을 빈 의자 앞에 놓는다.', after: [cg('haesun_cup_for_him'), narr('할머니가 의자 앞의 잔을 오래 바라본다. 잔에서 김이 천천히 오른다.'), say('haesun', 'smile', '…고마워요. 거기가 늘 그 자리예요.'), cg(null)] },
          { id: 'both_front', score: 1, kind: 'plain', icon: 'cup', label: '두 잔 모두 할머니 앞에 나란히 놓는다.', after: [say('haesun', 'smile', '고마워요.'), narr('할머니가 잔 하나를 들어, 빈 의자 앞으로 천천히 옮겨 놓는다.'), think('할머니는 저 의자 앞에 놓아 달라고 하셨는데. 다음에는 말씀하신 대로 해야겠다.'), cg(null)] },
          { id: 'ask_company', score: 0, kind: 'ask', icon: 'question', label: '"일행이 오세요?" 하고 묻는다.', after: [say('haesun', 'normal', '…아니에요, 올 사람은 없어요. 괜찮아요.'), narr('할머니가 잔 하나를 빈 의자 앞으로 옮기고, 한동안 창밖만 본다.'), think('할머니는 대답 대신 잔을 옮기셨다. 다음에는 할머니가 하시는 대로 따라 봐야겠다.'), cg(null)] },
        ],
        why: '할머니가 두 번째 잔을 놓을 곳을 말로 알려 주고, 손으로 의자를 쓸었어요. 묻지 않고 말한 대로 놓으면 돼요.',
      },
      summer_tourist: {
        season: 'summer', nth: 2, title: '그 의자의 손님',
        scene: [
          narr('여름 오후, 가게 안이 관광객으로 북적인다. 해순 할머니는 늘 그렇듯 창가에서 우유 두 잔을 앞에 두고 있다.'),
          enter('center', 'customer:smile'),
          say('customer', 'smile', '여기 의자 비었죠? 다리가 아파서 잠깐만 앉을게요.'),
          narr('관광객이 대답을 듣기도 전에, 빈 의자를 끌어당겨 앉는다.'),
          cg('summer_tourist_chair'),
        ],
        hints: [
          say('haesun', 'look', '아, 거기는… 아니, 아니에요. 괜찮아요.'),
          narr('할머니는 말을 멈추고, 의자 앞에 놓인 잔을 두 손으로 감싸 자기 쪽으로 조금 당긴다.'),
        ],
        q: '할머니는 말을 하다 마셨고, 관광객도 그저 쉬고 싶었을 뿐이다. 어떻게 할까?',
        choices: [
          { id: 'offer_seat', score: 2, kind: 'wait', icon: 'chair', label: '선풍기 앞의 빈자리를 관광객에게 조용히 권한다.', after: [say('jieun', 'smile', '손님, 선풍기 앞자리가 방금 비었어요. 거기가 훨씬 시원해요.'), say('customer', 'smile', '오, 정말이네요. 고마워요.'), leave('customer'), cg('haesun_small_bow'), narr('할머니가 잔을 다시 의자 앞에 놓는다. 그리고 나를 오래 바라보다가, 작게 고개를 숙인다.'), cg(null)] },
          { id: 'do_nothing', score: 1, kind: 'plain', icon: 'freeze', label: '아무 말도 하지 않고 지켜본다.', after: [say('haesun', 'smile', '괜찮아요. 잠깐 앉았다 갈 거예요.'), narr('관광객이 일어날 때까지, 할머니는 잔을 품에 안듯 감싸고 있다.'), think('괜찮다고 하셨지만, 할머니는 끝까지 잔을 놓지 못하셨다.'), cg(null)] },
          { id: 'loud', score: 0, kind: 'step', icon: 'shout', label: '관광객에게 "거기 앉으시면 안 돼요!" 하고 크게 말한다.', after: [say('customer', 'surprised', '앗, 죄송해요! 몰랐어요.'), narr('가게 안 사람들이 모두 이쪽을 본다. 할머니가 당황해서 손을 젓는다.'), say('haesun', 'normal', '아이고, 괜찮아요. 앉아요, 앉아요.'), think('할머니는 자리보다, 사람들이 쳐다보는 게 더 힘드셨나 보다.'), cg(null)] },
        ],
        why: '할머니는 "거기는…" 하다가 말을 멈추고 잔을 감쌌어요. 자리는 지키고 싶지만 소란은 싫으니, 다른 자리를 조용히 권해요.',
      },
      autumn_one_milk: {
        season: 'autumn', nth: 3, title: '한 잔 남은 우유',
        scene: [
          narr('가을 아침, 문을 열자마자 해순 할머니가 들어온다.'),
          say('haesun', 'normal', '늘 먹던 거요. 우유 두 잔.'),
          narr('그런데 냉장고의 우유병이 가볍다. 오늘은 우유 배달이 늦어서, 딱 한 잔만 나오겠다.'),
          say('jieun', 'normal', '할머니, 죄송해요. 우유가 늦게 와서, 지금은 한 잔만 만들 수 있어요.'),
          cg('autumn_window_haesun'),
        ],
        hints: [
          narr('할머니는 우유병을 한 번 보더니, 아무 말 없이 천천히 고개를 끄덕인다. 화난 얼굴이 아니다.'),
          narr('할머니는 창가에 앉아 두 손을 무릎에 모은다. 빈 의자를 한 번 보고, 무언가 생각하는 얼굴로 창밖을 본다.'),
        ],
        q: '할머니는 늘 두 잔을 드셨다. 한 잔뿐인 오늘, 할머니는 어떻게 하고 싶으실까?',
        choices: [
          { id: 'warm_one_wait', score: 2, kind: 'wait', icon: 'milk', label: '한 잔만 따뜻하게 데워 두고, 할머니가 정하실 때까지 기다린다.', after: [cg('haesun_one_cup_wait'), narr('할머니가 따뜻한 잔을 두 손으로 감싸고, 빈 의자를 오래 바라본다.'), say('haesun', 'smile', '오늘은 내가 마실게요. 그 사람도 그러라고 할 거예요.'), say('haesun', 'smile', '재촉하지 않고 기다려 줘서 고마워요.'), cg(null)] },
          { id: 'split_two', score: 1, kind: 'plain', icon: 'cup', label: '우유를 반씩 나눠 두 잔을 데운다.', after: [say('haesun', 'smile', '반씩 했네요. 고마워요.'), narr('할머니는 반 잔씩 담긴 두 잔을 나란히 놓고, 천천히 마신다.'), think('두 잔을 맞춰 드렸지만, 할머니가 어떻게 하고 싶으신지 먼저 기다려 볼 걸 그랬나.'), cg(null)] },
          { id: 'buy_more', score: 0, kind: 'step', icon: 'run', label: '"제가 얼른 우유 사 올게요!" 하고 뛰어나가려 한다.', after: [say('haesun', 'normal', '아니에요, 가지 마요. 가게를 비우면 안 돼요.'), say('haesun', 'normal', '괜찮아요. 오늘은 한 잔이면 돼요.'), think('할머니를 위해서였는데, 오히려 할머니 마음을 바쁘게 해 드렸다.'), cg(null)] },
        ],
        why: '할머니는 한 잔뿐이라는 말에 고개를 끄덕이고, 앉아서 생각했어요. 한 잔을 데워 두고 할머니가 정할 때까지 기다려요.',
      },
      winter_blackout: {
        season: 'winter', nth: 4, title: '정전 밤의 의자',
        scene: [
          narr('할머니는 집에서 가져온 담요를 아이들에게 다 나눠 주었다. 정작 할머니 몫은 남지 않았다.'),
          narr('나는 뒷방에서 사장님이 아껴 두던 담요 두 장을 꺼내 온다.'),
          cg('winter_blanket_chair'),
        ],
        hints: [
          narr('할머니는 담요를 받기 전에, 옆의 빈 의자부터 본다.'),
          narr('할머니의 눈이 내 손에 든 담요 두 장과 빈 의자 사이를 천천히 오간다.'),
        ],
        q: '담요는 두 장인데, 할머니 눈이 자꾸 빈 의자로 간다. 담요를 어떻게 놓을까?',
        choices: [
          { id: 'blanket_chair', score: 2, kind: 'wait', icon: 'chair', label: '한 장은 할머니 무릎에 덮어 드리고, 한 장은 빈 의자 위에 펴 둔다.', after: [cg('haesun_blanket_chair_warm'), narr('할머니가 의자 위의 담요를 손으로 곱게 편다. 그리고 오래 바라본다.'), say('haesun', 'smile', '이 의자도 따뜻하네요. 고마워요, 지은 씨.'), cg(null)] },
          { id: 'blanket_her', score: 1, kind: 'plain', icon: 'cloth', label: '담요 두 장을 모두 할머니께 덮어 드린다.', after: [say('haesun', 'smile', '고마워요. 따뜻하네요.'), narr('할머니가 담요 한 장을 빼서, 빈 의자 위에 살짝 걸쳐 둔다.'), think('할머니는 빈 의자까지 따뜻하게 해 두고 싶으셨구나.'), cg(null)] },
          { id: 'ask_need', score: 0, kind: 'ask', icon: 'question', label: '"할머니, 담요 몇 장 필요하세요?" 하고 묻는다.', after: [say('haesun', 'normal', '나는 괜찮아요. 아이들 먼저 줘요.'), narr('할머니는 담요를 받지 않고, 빈 의자 쪽으로 두 손을 모은다.'), think('묻는 대신, 할머니 눈이 가는 곳을 봤어야 했나 보다.'), cg(null)] },
        ],
        why: '할머니는 담요를 보고 빈 의자를 봤어요. 할머니에게 그 의자는 늘 함께 앉는 자리라서, 그 자리도 따뜻하게 해 두면 돼요.',
      },
      winter_granddaughter: {
        season: 'winter', nth: 5, title: '손녀가 온 날',
        scene: [
          narr('눈이 펑펑 오는 오후, 해순 할머니가 처음으로 누군가와 함께 들어온다.'),
          say('haesun', 'smile', '우리 손녀예요. 방학이라 놀러 왔어요.'),
          say('granddaughter', 'smile', '안녕하세요! 할머니가 여기 우유가 제일 맛있대요.'),
          narr('두 사람이 창가에 앉는다. 할머니가 나를 보고 고개를 끄덕이는데, 늘 먹던 것이라는 뜻이다.'),
          cg('winter_granddaughter'),
        ],
        hints: [
          narr('할머니가 손녀를 한 번 보고, 늘 비어 있던 의자를 한 번 본다.'),
          narr('손녀도 할머니를 따라 그 빈 의자를 본다. 오늘은 그 옆에 손녀의 의자가 하나 더 놓였다.'),
        ],
        q: '늘 먹던 것은 할머니의 잔과 빈 의자의 잔, 우유 두 잔이었다. 오늘은 몇 잔을 준비할까?',
        choices: [
          { id: 'three_cups', score: 2, kind: 'wait', icon: 'milk', label: '우유 세 잔을 준비한다. 할머니, 손녀, 그리고 빈 의자의 몫.', after: [cg('haesun_three_cups'), narr('할머니가 세 번째 잔을 오래 바라본다.'), say('granddaughter', 'smile', '할아버지 것도 있네!'), say('haesun', 'smile', '그래. 여기서는 할아버지 자리도 늘 있단다.'), narr('할머니가 손녀의 손을 꼭 잡는다.'), cg(null)] },
          { id: 'two_cups', score: 1, kind: 'plain', icon: 'cup', label: '늘 하던 대로 우유 두 잔을 준비한다.', after: [say('granddaughter', 'normal', '한 잔 더 주세요. 할아버지 거요.'), say('haesun', 'smile', '고마워요. 한 잔 더 부탁해요.'), think('오늘은 손녀가 있었다. 늘 먹던 것도, 사람이 늘면 달라지는구나.'), cg(null)] },
          { id: 'wait_order', score: 0, kind: 'plain', icon: 'hourglass', label: '주문을 다시 말해 주실 때까지 기다린다.', after: [say('haesun', 'normal', '늘 먹던 거요. 괜찮아요, 천천히 해요.'), think('할머니는 고개를 끄덕여 이미 알려 주셨는데. 오늘은 내가 먼저 알아챌 수 있었다.'), cg(null)] },
        ],
        why: '할머니는 늘 빈 의자의 몫까지 두 잔을 마셨어요. 오늘은 손녀가 왔으니, 두 사람과 빈 의자의 몫까지 세 잔이에요.',
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
          narr('요즘 오후마다 오는 손님이 계산대 앞에 선다. 물감 자국이 있는 셔츠를 입고, 품에 스케치북을 꼭 안고 있다.'),
          say('jieun', 'normal', '어서 오세요. 무엇으로 드릴까요?'),
          say('jian', 'normal', '…아무거나요.'),
          cg('jian_color_menu'),
        ],
        hints: [
          say('jian', 'shy', '요즘은 무슨 색을 마셔야 할지, 잘 모르겠어요.'),
          narr('지안은 스케치북을 꼭 닫은 채, 메뉴판에 그려진 음료의 색 동그라미를 손끝으로 하나씩 짚는다.'),
        ],
        q: '"아무거나"라고 하셨지만, 메뉴판의 색을 하나씩 보고 계신다. 어떻게 할까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '"오늘은 어떤 색이 끌려요?" 하고 부드럽게 묻는다.', after: [cg('jian_yellow'), narr('지안이 메뉴판을 오래 바라본다. 손가락이 노란 동그라미에서 멈춘다.'), say('jian', 'smile', '…노란색이요. 유자차 주세요.'), say('jian', 'smile', '색을 물어봐 준 사람은 처음이에요.'), cg(null)] },
          { id: 'pick_popular', score: 1, kind: 'plain', icon: 'coffee', label: '"제일 많이 팔리는 걸로 드릴게요." 하고 대신 고른다.', after: [say('jian', 'smile', '네, 그거 좋아요.'), narr('지안은 잔을 받아 들고, 메뉴판의 색 동그라미를 한 번 더 돌아본다.'), think('정말 아무거나 좋으셨을까. 계속 색을 보고 계셨는데.'), cg(null)] },
          { id: 'wait_silent', score: 0, kind: 'wait', icon: 'hourglass', label: '지안이 스스로 고를 때까지 말없이 기다린다.', after: [narr('지안이 한참 서 있다. 뒤에 다른 손님이 줄을 선다.'), say('jian', 'normal', '…그냥 물 주세요. 괜찮아요.'), narr('지안의 눈이 메뉴판의 색으로 한 번 더 간다.'), think('기다리기만 하니 더 고르기 힘드셨나 보다. 다음에는 먼저 물어봐야겠다.'), cg(null)] },
        ],
        why: '지안은 무슨 색을 마셔야 할지 모르겠다며 메뉴판의 색을 짚었어요. 색으로 부드럽게 물어 주면 스스로 고를 수 있어요.',
      },
      summer_cool: {
        season: 'summer', nth: 2, title: '시원한 거 아무거나',
        scene: [
          narr('관광객으로 붐비는 오후, 지안은 구석 자리에 스케치북을 펴 놓고 연필만 쥐고 있다.'),
          narr('종이는 오늘도 하얗게 비어 있다. 한참 뒤, 지안이 계산대로 온다.'),
          say('jian', 'normal', '시원한 거, 아무거나요.'),
          cg('jian_summer_corner'),
        ],
        hints: [
          say('jian', 'shy', '더워서 그런가, 오늘은 색이 다 똑같아 보여요.'),
          narr('지안은 빈 스케치북을 가슴에 꼭 안고, 냉장고 속 음료들의 색을 힐끔 본다.'),
        ],
        q: '시원한 것이라고만 하셨지만, 이번에도 음료의 색을 보고 계신다. 어떻게 할까?',
        choices: [
          { id: 'ask_cool_color', score: 2, kind: 'ask', icon: 'question', label: '"시원한 것 중에서는, 오늘 어떤 색이 좋아요?" 하고 묻는다.', after: [cg('jian_green_cold'), narr('지안이 냉장고 속 음료를 오래 바라본다.'), say('jian', 'smile', '음… 초록색이요. 녹차라테, 차갑게요.'), say('jian', 'smile', '초록색은 보기만 해도 좀 시원해요.'), cg(null)] },
          { id: 'recommend_pink', score: 1, kind: 'plain', icon: 'icecup', label: '"딸기우유가 제일 시원해요." 하고 딸기우유를 권한다.', after: [say('jian', 'smile', '네, 그걸로 할게요.'), narr('지안은 분홍색 잔을 받아 들고, 냉장고 쪽을 한 번 돌아본다.'), think('내가 고른 색이었다. 지안 씨가 고른 색은 아니었다.'), cg(null)] },
          { id: 'pry_sketch', score: 0, kind: 'step', icon: 'book', label: '"그림 그리세요? 뭐 그렸는지 보여 주세요." 하고 묻는다.', after: [narr('지안이 스케치북을 얼른 등 뒤로 돌린다.'), say('jian', 'shy', '아… 아직 아무것도 없어요. 괜찮아요, 아무거나 주세요.'), think('빈 종이를 보여 달라고 했구나. 그림 이야기는 지안 씨가 먼저 할 때까지 기다려야겠다.'), cg(null)] },
        ],
        why: '지안은 색이 다 똑같아 보인다며 빈 스케치북을 꼭 안았어요. 그림 이야기 대신 오늘의 색을 물어보면 돼요.',
      },
      autumn_leaves: {
        season: 'autumn', nth: 3, title: '창밖의 노란 잎',
        scene: [
          narr('가을 아침, 창밖 은행나무가 노랗게 물들었다.'),
          narr('지안이 들어와 계산대 앞에 서지만, 한참 동안 말이 없다.'),
          say('jieun', 'normal', '어서 오세요. 무엇으로 드릴까요?'),
          say('jian', 'normal', '음…'),
          cg('jian_autumn_window'),
        ],
        hints: [
          narr('지안이 창밖의 노란 은행잎을 한참 본다.'),
          narr('그다음 지안은 손가락으로 메뉴판의 색 동그라미를 천천히 짚는다. 손가락이 노란 동그라미에서 잠깐 멈춘다.'),
        ],
        q: '지안 씨는 말이 없지만, 창밖과 메뉴판의 색을 번갈아 보신다. 어떻게 할까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '"오늘은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_opens_sketchbook'), narr('지안이 창밖을 오래 바라본다.'), say('jian', 'smile', '창밖이랑 같은 색이요. 노란색.'), narr('지안은 자리에 앉아, 처음으로 스케치북을 펼쳐 놓는다.'), cg(null)] },
          { id: 'recommend_cocoa', score: 1, kind: 'plain', icon: 'cup', label: '"따뜻한 코코아는 어때요?" 하고 권한다.', after: [say('jian', 'smile', '네, 그걸로요.'), narr('지안은 자리에 앉아, 창밖의 노란 잎을 다시 본다.'), think('코코아도 좋아하셨지만, 오늘 보고 계신 색은 노란색이었다.'), cg(null)] },
          { id: 'wait_silent', score: 0, kind: 'wait', icon: 'hourglass', label: '지안이 스스로 고를 때까지 말없이 기다린다.', after: [narr('지안이 한참 서 있다.'), say('jian', 'normal', '…아메리카노요. 괜찮아요.'), think('지안 씨는 색으로 고르는 사람이다. 기다리기보다, 색을 먼저 물어봐 드려야 했다.'), cg(null)] },
        ],
        why: '지안은 말 대신 창밖의 노란 잎과 메뉴판의 색을 봤어요. 지안은 색으로 고르는 사람이라, 색을 물어 주면 고를 수 있어요.',
      },
      winter_candle: {
        season: 'winter', nth: 4, title: '촛불 아래',
        scene: [
          narr('정전 밤, 지안은 촛불 옆 구석에 앉아 있다. 무릎 위에 빈 스케치북이 펴져 있고, 손에는 연필이 들려 있다.'),
          cg('winter_candle_jian'),
        ],
        hints: [
          narr('지안이 흔들리는 촛불을 오래 본다. 연필 끝이 종이 위에서 머뭇거린다.'),
          narr('지안의 눈이 빈 종이와 촛불 사이를 몇 번 오간다.'),
        ],
        q: '지안 씨는 그리고 싶은데, 첫 선을 긋지 못하고 계신 것 같다. 어떻게 할까?',
        choices: [
          { id: 'ask_now_color', score: 2, kind: 'ask', icon: 'question', label: '조용히 다가가 "지금은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_first_line'), narr('지안이 촛불을 오래 바라본다.'), say('jian', 'smile', '주황색이요. 촛불 색.'), narr('지안이 종이에 천천히 첫 선을 긋는다.'), think('지안 씨가 그림을 그리는 모습은 처음 본다.'), cg(null)] },
          { id: 'cocoa_quiet', score: 1, kind: 'wait', icon: 'cup', label: '말없이 따뜻한 코코아를 옆에 놓아 둔다.', after: [say('jian', 'smile', '고마워요.'), narr('지안은 컵을 두 손으로 감싸고, 다시 빈 종이를 내려다본다.'), think('몸은 따뜻해지셨지만, 종이는 아직 비어 있다. 색을 묻는 말이 필요하셨을까.'), cg(null)] },
          { id: 'push_draw', score: 0, kind: 'step', icon: 'pen', label: '"다 같이 있는 거, 그림으로 그려 주세요!" 하고 조른다.', after: [narr('지안이 스케치북을 덮는다.'), say('jian', 'shy', '아… 오늘은 괜찮아요.'), think('그려 달라고 하니, 오히려 더 그리기 어려워지셨나 보다.'), cg(null)] },
        ],
        why: '지안은 촛불을 오래 보고 빈 종이를 내려다봤어요. 재촉하지 않고 지금의 색을 물으면, 스스로 그리기 시작해요.',
      },
      winter_snow: {
        season: 'winter', nth: 5, title: '눈 오는 날',
        scene: [
          narr('눈 오는 아침, 지안이 들어온다. 품에 안은 스케치북이 전보다 훨씬 두툼하다.'),
          say('jieun', 'normal', '어서 오세요. 눈 오는데 오셨네요.'),
          narr('지안은 인사만 하고, 스케치북을 두 손으로 꼭 쥔 채 서 있다. 종이 끝으로 여러 색이 삐져나와 있다.'),
          cg('jian_snow_sketchbook'),
        ],
        hints: [
          narr('지안이 나를 한 번 보고, 스케치북을 한 번 본다. 무언가 말하려다 입을 다문다.'),
          narr('지안이 창밖의 하얀 눈을 보고, 다시 메뉴판의 색 동그라미를 본다.'),
        ],
        q: '지안 씨는 무언가 말하고 싶어 보인다. 어떻게 하면 편하게 말할 수 있을까?',
        choices: [
          { id: 'ask_color', score: 2, kind: 'ask', icon: 'question', label: '늘 하던 대로 "오늘은 어떤 색이에요?" 하고 묻는다.', after: [cg('jian_many_colors'), narr('지안이 나를 오래 바라보다가 웃는다.'), say('jian', 'smile', '오늘은 여러 색이요. 그래서 하얀 걸로 할래요.'), cg(null)] },
          { id: 'usual_yuja', score: 1, kind: 'plain', icon: 'tea', label: '늘 마시던 노란 유자차를 준비한다.', after: [say('jian', 'smile', '네. 기억해 줘서 고마워요.'), narr('지안은 유자차를 받아 들고, 스케치북을 가방에 넣는다.'), think('기억해 드려서 기뻐하셨다. 그런데 오늘은 하고 싶은 말이 있으신 것 같았는데.'), cg(null)] },
          { id: 'pry_sketch', score: 0, kind: 'step', icon: 'book', label: '"그림 생겼어요? 스케치북 보여 주세요!" 하고 묻는다.', after: [narr('지안이 스케치북을 가방에 넣는다.'), say('jian', 'shy', '아… 다음에요. 괜찮아요.'), think('보여 줄지는 지안 씨가 정할 일이었다. 늘 하던 대로 색을 물어볼 걸.'), cg(null)] },
        ],
        why: '지안은 나와 스케치북을 번갈아 보며 망설였어요. 캐묻지 않고, 늘 하던 부드러운 질문으로 말할 틈을 줘요.',
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
        scene: [
          narr('도 씨는 카운터 앞에 선 채로 커피를 마신다. 바로 옆에 의자가 있는데도 쳐다보지 않는다.'),
          narr('어깨에 멘 우편 가방이 무거워서, 도 씨는 가방을 자꾸 고쳐 멘다.'),
          cg('do_standing'),
        ],
        hints: [
          say('do', 'smile', '허허, 앉으면 다시 못 일어나요. 오늘 돌릴 편지가 산더미거든요.'),
          narr('도 씨가 가방을 다른 어깨로 옮긴다. 그 순간, 눈이 카운터 옆 의자에 잠깐 머문다.'),
        ],
        q: '도 씨는 웃으며 서 계시지만, 눈은 의자로 갔다. 어떻게 할까?',
        choices: [
          { id: 'pull_chair', score: 2, kind: 'wait', icon: 'chair', label: '앉으라고 권하지는 않고, 카운터 옆 의자를 한 칸 빼 둔다.', after: [cg('do_chair_out'), narr('도 씨가 빼 둔 의자를 오래 바라본다.'), say('do', 'smile', '…다음에 앉을게요. 허허.'), narr('도 씨가 나가면서 의자 등을 한 번 툭 친다. 싫지 않은 얼굴이다.'), cg(null)] },
          { id: 'say_bye', score: 1, kind: 'plain', icon: 'greet', label: '"천천히 드세요." 하고 인사만 한다.', after: [say('do', 'smile', '천천히는 못 해요. 편지가 기다리거든요.'), narr('도 씨가 컵을 비우고 나가면서, 의자를 한 번 본다.'), think('도 씨는 의자를 보셨다. 앉을 자리를 준비해 둘 걸 그랬나.'), cg(null)] },
          { id: 'push_sit', score: 0, kind: 'step', icon: 'chair', label: '"여기 앉으세요!" 하고 의자를 끌어다 드린다.', after: [say('do', 'surprised', '아이고, 괜찮아요. 괜찮아요.'), narr('도 씨가 서둘러 컵을 비우고 나간다. 나가면서 의자를 한 번 돌아본다.'), think('앉으라고 하니 오히려 서두르셨다. 도 씨가 앉고 싶을 때까지 기다려야 하나 보다.'), cg(null)] },
        ],
        why: '도 씨는 앉으면 못 일어난다며 웃었지만, 눈은 의자로 갔어요. 권하지 않고 앉을 수 있게 자리만 만들어 둬요.',
      },
      spring_rain: {
        season: 'spring', nth: 2, title: '젖은 편지',
        scene: [
          narr('오후에 갑자기 비가 쏟아진다. 골목이 금방 물웅덩이로 가득 찬다.'),
          sfx('door'),
          narr('도 씨가 흠뻑 젖어 들어온다. 비옷도 없이, 우편 가방만 품에 꼭 안고 있다.'),
          cg('do_rain_letters'),
        ],
        hints: [
          say('do', 'worried', '편지가 젖으면 안 되는데… 오늘은 중요한 등기도 있는데.'),
          narr('도 씨는 머리에서 물이 뚝뚝 떨어지는데도, 자기 얼굴보다 먼저 소매로 편지를 닦는다.'),
        ],
        q: '도 씨는 자기보다 편지를 먼저 걱정하신다. 무엇을 해 드리면 좋을까?',
        choices: [
          { id: 'towel', score: 2, kind: 'wait', icon: 'towel', label: '말없이 마른 수건 두 장을 카운터에 놓아 둔다.', after: [cg('do_towel'), narr('도 씨가 수건을 오래 바라본다.'), narr('도 씨는 한 장으로 편지를 하나하나 닦고, 남은 한 장으로 얼굴을 닦는다.'), say('do', 'smile', '고마워요. 편지가 하나도 안 젖었네.'), cg(null)] },
          { id: 'coffee_first', score: 1, kind: 'plain', icon: 'cup', label: '"비가 많이 오네요." 하고 따뜻한 커피를 먼저 드린다.', after: [say('do', 'smile', '그러게요. 고마워요.'), narr('도 씨는 커피에 손도 대지 않고, 소매로 편지부터 마저 닦는다.'), think('도 씨에게는 커피보다 편지가 먼저였다. 닦을 것을 드릴 걸 그랬다.'), cg(null)] },
          { id: 'take_bag', score: 0, kind: 'step', icon: 'run', label: '"얼른 몸부터 말리세요!" 하고 가방을 받아 든다.', after: [say('do', 'surprised', '아, 가방은 괜찮아요. 괜찮아요.'), narr('도 씨가 가방을 다시 꼭 안고, 편지부터 닦는다.'), think('남의 편지가 든 가방이다. 도 씨는 그 가방을 남의 손에 맡기지 않으신다.'), cg(null)] },
        ],
        why: '도 씨는 편지가 젖을까 걱정했고, 자기보다 편지를 먼저 닦았어요. 말없이 수건을 두면 도 씨가 편지부터 닦을 수 있어요.',
      },
      summer_hook: {
        season: 'summer', nth: 3, title: '무거운 가방',
        scene: [
          narr('한여름은 소포가 많은 계절이다. 도 씨의 가방이 터질 듯이 불룩하다.'),
          narr('도 씨가 커피를 받으려고 가방을 내려놓으려다, 물기 있는 바닥을 보고 멈춘다.'),
          cg('do_heavy_bag'),
        ],
        hints: [
          narr('도 씨는 가방을 다시 끌어안고, 한 손으로 불편하게 커피를 마신다.'),
          narr('커피를 마시는 동안, 도 씨의 눈이 문 옆의 빈 벽으로 몇 번 간다.'),
        ],
        q: '도 씨는 무거운 가방을 내려놓을 곳이 없다. 어떻게 할까?',
        choices: [
          { id: 'hook', score: 2, kind: 'wait', icon: 'hand', label: '다음 날 아침, 사장님께 여쭙고 문 옆 벽에 가방 걸이 못을 단다.', after: [narr('다음 날 아침, 사장님께 여쭙고 문 옆 벽에 튼튼한 못을 하나 박았다.'), sfx('bell'), cg('do_hook'), narr('도 씨가 들어오다 멈춘다. 새 못을 오래 바라본다.'), narr('도 씨가 못에 가방을 걸고, 어깨를 크게 한 바퀴 돌린다.'), say('do', 'smile', '허허, 어깨가 다 가볍네. 고마워요.'), cg(null)] },
          { id: 'on_counter', score: 1, kind: 'plain', icon: 'tray', label: '"가방은 카운터에 올려 두세요." 하고 자리를 비켜 드린다.', after: [say('do', 'smile', '고마워요.'), narr('도 씨가 가방을 카운터에 올렸다가, 다른 손님이 오자 금방 다시 멘다.'), think('카운터는 손님 자리라서 마음이 불편하셨나 보다. 걸어 둘 곳이 따로 있으면 좋을 텐데.'), cg(null)] },
          { id: 'less_work', score: 0, kind: 'step', icon: 'speech', label: '"가방이 너무 무거워요. 배달을 좀 줄이세요." 하고 말한다.', after: [say('do', 'normal', '허허, 그게 내 마음대로 되나요. 괜찮아요.'), narr('도 씨가 가방을 고쳐 메고 나간다. 나가면서 문 옆 벽을 한 번 본다.'), think('도 씨의 일을 내가 바꿀 수는 없다. 대신 내가 할 수 있는 일을 찾아야겠다.'), cg(null)] },
        ],
        why: '도 씨는 가방을 젖은 바닥에 못 내려놓고 안고 있었고, 문 옆 빈 벽을 봤어요. 말없이 걸 곳을 만들어 두면 돼요.',
      },
      autumn_notice: {
        season: 'autumn', nth: 4, title: '퇴직 소식',
        scene: [
          narr('가을 아침, 도 씨가 들어와 문 옆 못에 가방을 건다.'),
          narr('도 씨가 우편 한 묶음을 카운터에 놓는다. 맨 위에 우체국 소식지가 있다.'),
          narr('소식지에 도 씨의 사진과 "정년 퇴직"이라는 큰 글자가 보인다.'),
          cg('do_notice'),
        ],
        hints: [
          narr('도 씨의 눈이 소식지로 갔다가, 얼른 창밖으로 간다.'),
          narr('그다음 도 씨의 눈이 카운터 옆 의자에 오래 머문다. 도 씨가 한 번도 앉지 않은 의자다.'),
        ],
        q: '도 씨는 퇴직 이야기를 피하고 싶어 보이지만, 의자는 오래 보신다. 어떻게 할까?',
        choices: [
          { id: 'cup_by_chair', score: 2, kind: 'wait', icon: 'chair', label: '말없이 늘 그 잔을 카운터 옆 의자 앞에 놓아 둔다.', after: [cg('do_cup_chair'), narr('도 씨가 의자 앞에 놓인 잔을 오래 바라본다.'), say('do', 'smile', '…겨울이면 그만둬요. 서른 해 했으니까.'), say('jieun', 'normal', '…그러시구나. 그동안 정말 수고 많으셨어요.'), narr('그 말만 하고, 둘 다 더 말하지 않는다. 도 씨는 잔을 들고 한참 서 있다.'), cg(null)] },
          { id: 'as_usual', score: 1, kind: 'plain', icon: 'cup', label: '늘 하던 대로 잔을 카운터 위에 놓는다.', after: [say('do', 'smile', '고마워요.'), narr('도 씨가 소식지를 가방에 넣고, 의자를 한 번 본다.'), think('도 씨는 의자를 한참 보셨다. 잔을 그 앞에 놓아 드릴 걸 그랬나.'), cg(null)] },
          { id: 'ask_after', score: 0, kind: 'ask', icon: 'question', label: '"퇴직하시면 뭐 하실 거예요?" 하고 묻는다.', after: [narr('도 씨가 잠깐 말이 없다.'), say('do', 'normal', '…글쎄요. 괜찮아요.'), narr('도 씨가 소식지를 가방 깊이 넣는다. 그리고 의자를 한 번 본다.'), think('도 씨도 아직 모르시는 일이었다. 묻지 말고 쉴 자리를 드릴 걸.'), cg(null)] },
        ],
        why: '도 씨는 퇴직 소식지에서 눈을 피했고, 의자를 오래 봤어요. 묻지 않고 앉을 자리를 내어 줘요.',
      },
      winter_last: {
        season: 'winter', nth: 5, title: '마지막 배달',
        scene: [
          narr('마감 무렵, 문에 "오늘 영업 끝" 팻말을 걸었다. 그런데 문밖에 도 씨가 서 있다.'),
          narr('오늘은 도 씨의 마지막 배달 날이다. 편지를 다 나눠 주어서, 우편 가방이 납작하게 비었다.'),
          cg('do_last_day'),
        ],
        hints: [
          narr('도 씨의 눈이 문 옆 못으로 갔다가, "영업 끝" 팻말로 간다.'),
          narr('도 씨는 문을 두드리지 않는다. 불 켜진 카운터 안쪽만 조용히 바라본다.'),
        ],
        q: '가게는 이미 닫았고, 도 씨는 들어와도 될지 망설이신다. 어떻게 할까?',
        choices: [
          { id: 'light_wait', score: 2, kind: 'wait', icon: 'light', label: '팻말은 그대로 두고, 불 하나를 켜 둔 채 문을 조금 열어 둔다.', after: [cg('do_last_hook'), narr('도 씨가 천천히 들어와, 빈 가방을 못에 건다. 마지막으로.'), narr('도 씨가 카운터 옆 의자를 오래 바라보다가, 천천히 앉는다.'), say('do', 'smile', '오늘이 마지막 배달이었어요. 서른 해 동안 매일.'), say('do', 'smile', '마지막에는 여기 들르고 싶었어요. 문이 열려 있어서 다행이네요.'), cg(null)] },
          { id: 'open_door', score: 1, kind: 'plain', icon: 'door', label: '"들어오세요." 하고 문을 열어 드린다.', after: [say('do', 'smile', '아, 닫았는데. 고마워요.'), narr('도 씨는 문 옆 못에 가방을 걸고, 서서 가게를 둘러본다.'), think('들어오시라고 하니 반가워하셨다. 그래도 도 씨는 끝까지 서 계셨다.'), cg(null)] },
          { id: 'clap', score: 0, kind: 'step', icon: 'heart', label: '"오늘 마지막 날이시죠? 축하드려요!" 하고 크게 박수를 친다.', after: [say('do', 'surprised', '허허, 축하는 무슨. 괜찮아요.'), narr('도 씨가 머쓱하게 웃으며 들어와, 문 옆 못을 한 번 본다.'), think('도 씨에게는 축하보다, 조용히 하루를 끝낼 자리가 필요하셨나 보다.'), cg(null)] },
        ],
        why: '도 씨는 영업 끝 팻말과 불 켜진 카운터를 봤어요. 들어올지 스스로 정할 수 있게, 불을 켜 두고 문을 열어 둬요.',
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
          narr('새벽 다섯 시 오십 분, 카페 문은 열려 있지만 불은 아직 꺼져 있다.'),
          narr('사장님은 뒷방에서 오늘 쓸 원두를 고르고 있다. 문 앞에는 털모자를 쓴 아저씨 한 분이 서 있다.'),
          narr('아저씨는 문 앞에 서 있기만 하고, 안으로 들어오지 않는다.'),
          cg('kang_dark_window'),
        ],
        hints: [
          say('kang', 'normal', '…아직 불이 안 켜졌네. 불이 켜져 있으면, 들어가는데.'),
          narr('아저씨는 언 손을 입김으로 녹이며, 깜깜한 창만 바라본다. 문 손잡이에는 손을 대지 않는다.'),
        ],
        q: '아저씨는 문 앞에서 기다리고 계신다. 어떻게 하면 마음 편히 들어오실까?',
        choices: [
          { id: 'light_on', score: 2, kind: 'wait', icon: 'light', label: '먼저 들어가 불을 켜고, 말없이 문을 활짝 열어 둔다.', after: [sfx('tap'), cg('kang_light_on'), narr('창에 노란 불이 들어온다. 아저씨가 불 켜진 창을 오래 바라본다.'), narr('아저씨가 천천히 들어와, 바다가 보이는 창가에 앉는다.'), say('kang', 'smile', '…고마워. 불 켜진 걸 보니 좋네.'), cg(null)] },
          { id: 'greet_in', score: 1, kind: 'plain', icon: 'greet', label: '"안녕하세요. 들어오세요." 하고 인사한다.', after: [say('kang', 'normal', '…아, 그래.'), narr('아저씨는 꾸벅 인사하고 들어오더니, 자기 손으로 먼저 불 스위치를 켠다.'), think('아저씨는 불부터 켜셨다. 불이 켜져 있어야 마음이 놓이시나 보다.'), cg(null)] },
          { id: 'ask_boat', score: 0, kind: 'ask', icon: 'question', label: '"오늘 배 나가세요? 날씨 좋죠?" 하고 묻는다.', after: [narr('아저씨는 대답 대신 바다 쪽을 한 번 본다.'), say('kang', 'normal', '…괜찮아요. 블랙이나 줘요.'), narr('아저씨가 들어와, 말없이 불 스위치를 켠다.'), think('새벽에는 말보다 불빛이 먼저였나 보다.'), cg(null)] },
        ],
        why: '강 씨는 불이 켜져 있으면 들어간다고 말하고, 깜깜한 창을 봤어요. 묻지 않고 불을 켜 두면 마음 편히 들어와요.',
      },
      spring_sea: {
        season: 'spring', nth: 2, title: '바다 안 나가요',
        scene: [
          narr('새벽, 강 씨가 블랙을 받아 들고 늘 앉는 창가에 앉는다.'),
          narr('항구에서 배들이 하나둘 바다로 나간다. 그런데 오늘은 강 씨가 일어나지 않는다.'),
          cg('kang_window_sea'),
        ],
        hints: [
          say('kang', 'normal', '…오늘은 바다 안 나가요.'),
          narr('강 씨는 항구 끝에 비어 있는 배 자리 하나를 오래 본다. 손에 든 커피가 식어 가는데도 마시지 않는다.'),
        ],
        q: '강 씨는 바다에 안 나간다는 말만 하셨다. 무슨 일인지 몰라도, 지금 강 씨에게 필요한 것은 무엇일까?',
        choices: [
          { id: 'warm_cup', score: 2, kind: 'wait', icon: 'coffee', label: '아무것도 묻지 않고, 식은 잔을 따뜻한 새 잔으로 바꿔 둔다.', after: [cg('kang_warm_cup'), narr('강 씨가 새 잔을 두 손으로 감싸고, 김이 오르는 것을 오래 바라본다.'), say('kang', 'smile', '…따뜻하네. 고마워.'), cg(null)] },
          { id: 'leave_be', score: 1, kind: 'plain', icon: 'freeze', label: '하던 일을 하며 그대로 둔다.', after: [narr('강 씨는 식은 커피를 다 마시고 천천히 일어난다.'), say('kang', 'normal', '잘 마셨어.'), narr('나가면서 강 씨가 빈 잔을 한 번 돌아본다.'), think('커피가 다 식어 있었다. 따뜻한 잔으로 바꿔 드릴 걸 그랬나.'), cg(null)] },
          { id: 'ask_broken', score: 0, kind: 'ask', icon: 'question', label: '"배가 고장 났어요?" 하고 묻는다.', after: [narr('강 씨의 손이 잠깐 멈춘다.'), say('kang', 'normal', '…아니. 괜찮아요.'), narr('강 씨는 식은 잔을 두 손으로 감싸고, 다시 항구 끝만 본다.'), think('말하고 싶지 않은 일이었나 보다. 묻는 대신 곁을 따뜻하게 해 드릴 걸.'), cg(null)] },
        ],
        why: '강 씨는 바다에 안 나간다고만 하고, 항구의 빈자리를 보며 커피를 식혔어요. 묻지 않고 따뜻한 잔으로 곁을 지켜요.',
      },
      summer_return: {
        season: 'summer', nth: 3, title: '며칠 만에 온 날',
        scene: [
          narr('사흘 동안 강 씨가 오지 않았다. 새벽마다 창가 자리가 비어 있었다.'),
          narr('"7시 전은 동네 시간"이 된 새벽, 문이 열리고 강 씨가 들어온다.'),
          cg('kang_returns'),
        ],
        hints: [
          narr('강 씨가 늘 앉던 창가 자리에 앉는다. 두 손을 탁자 위에 가만히 올려 둔다.'),
          narr('강 씨는 항구 쪽을 보다가, 무언가를 피하듯 고개를 돌린다.'),
        ],
        q: '며칠 만에 오신 강 씨에게 무슨 일이 있으셨던 것 같다. 어떻게 맞이할까?',
        choices: [
          { id: 'as_usual', score: 2, kind: 'wait', icon: 'coffee', label: '늘 하던 대로, 아무것도 묻지 않고 새벽 블랙을 내드린다.', after: [narr('사장님이 내린 블랙을, 강 씨가 늘 쓰던 머그잔에 담아 드린다.'), cg('kang_black_again'), narr('강 씨가 잔을 받아 들고 오래 바라본다.'), say('kang', 'smile', '…이 맛이지. 며칠 동안 이 맛이 생각났어.'), cg(null)] },
          { id: 'welcome', score: 1, kind: 'plain', icon: 'greet', label: '"오랜만이에요! 걱정했어요." 하고 반긴다.', after: [say('kang', 'normal', '…허허. 그래.'), narr('강 씨가 쑥스러운 듯 모자를 고쳐 쓰고, 말없이 늘 그 잔을 기다린다.'), think('반가웠지만, 강 씨는 조용히 있고 싶으셨나 보다.'), cg(null)] },
          { id: 'ask_why', score: 0, kind: 'ask', icon: 'question', label: '"왜 안 오셨어요? 무슨 일 있으셨어요?" 하고 묻는다.', after: [narr('강 씨가 잠깐 말이 없다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), narr('강 씨는 다시 항구에서 눈을 돌린다.'), think('강 씨는 대답하지 않으셨다. 묻지 않아도 되는 일이었다.'), cg(null)] },
        ],
        why: '강 씨는 늘 앉던 자리에 손을 가만히 두고, 항구에서 눈을 돌렸어요. 묻지 않고 늘 하던 대로 해 주는 것이 위로예요.',
      },
      autumn_suit: {
        season: 'autumn', nth: 4, title: '양복',
        scene: [
          narr('가을 새벽, 문이 열리고 강 씨가 들어온다.'),
          narr('그런데 늘 입던 작업복이 아니다. 낡은 양복에 넥타이를 맸는데, 넥타이가 조금 삐뚤다.'),
          cg('kang_suit'),
        ],
        hints: [
          narr('강 씨의 눈이 자기 손으로 간다. 그물을 오래 만진 거친 손이, 양복 소매 밖으로 나와 있다.'),
          narr('강 씨의 눈이 늘 앉던 창가 자리와, 선반 위의 머그잔으로 간다.'),
        ],
        q: '처음 보는 양복 차림의 강 씨가 어색해 보이신다. 어떻게 할까?',
        choices: [
          { id: 'usual_cup', score: 2, kind: 'wait', icon: 'coffee', label: '양복 이야기는 하지 않고, 늘 쓰던 머그잔에 블랙을 내드린다.', after: [cg('kang_suit_cup'), narr('강 씨가 늘 쓰던 잔을 오래 바라본다. 그리고 넥타이를 조금 느슨하게 푼다.'), say('kang', 'smile', '…역시 여기가 편하네. 오늘 좀 낯선 데를 가야 해서.'), cg(null)] },
          { id: 'praise', score: 1, kind: 'plain', icon: 'greet', label: '"양복 멋지세요!" 하고 칭찬한다.', after: [say('kang', 'normal', '…허허. 그런가.'), narr('강 씨가 넥타이를 만지작거리다, 어색한 얼굴로 늘 앉던 자리에 앉는다.'), think('칭찬해 드렸는데 더 어색해 보이신다. 평소처럼 해 드릴 걸 그랬나.'), cg(null)] },
          { id: 'ask_where', score: 0, kind: 'ask', icon: 'question', label: '"어디 가세요? 면접 보세요?" 하고 묻는다.', after: [narr('강 씨가 대답 없이 창밖을 본다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), think('강 씨는 늘 앉던 자리부터 보셨다. 평소처럼 해 드리는 게 나았겠다.'), cg(null)] },
        ],
        why: '강 씨는 낯선 양복 차림에 자기 손을 보고, 늘 앉던 자리와 잔을 봤어요. 늘 하던 대로 해 드리면 강 씨가 편해져요.',
      },
      winter_snow: {
        season: 'winter', nth: 5, title: '첫눈과 소문',
        scene: [
          narr('첫눈이 내린 새벽, 강 씨가 어깨의 눈을 털며 들어온다.'),
          narr('어제 시장에서 들은 말이 떠오른다. "강 씨가 배를 팔았대. 아무한테도 말 안 하고."'),
          cg('kang_first_snow'),
        ],
        hints: [
          narr('강 씨의 눈이 창밖의 항구로 간다. 강 씨의 배가 늘 있던 자리가 비어 있다.'),
          narr('강 씨의 눈이 꽁꽁 언 자기 손으로 간다. 손가락을 몇 번 쥐었다 편다.'),
        ],
        q: '소문이 정말인지, 강 씨는 아무 말도 하지 않으신다. 지금 강 씨에게 필요한 것은 무엇일까?',
        choices: [
          { id: 'warm_mug', score: 2, kind: 'wait', icon: 'coffee', label: '아무것도 묻지 않고, 뜨거운 물로 잔을 데워 두고 블랙을 내린다.', after: [cg('kang_warm_mug'), narr('강 씨가 데운 잔을 두 손으로 감싸고 오래 바라본다. 언 손이 천천히 녹는다.'), say('kang', 'smile', '…잔까지 따뜻하네.'), cg(null)] },
          { id: 'first_snow', score: 1, kind: 'plain', icon: 'greet', label: '"첫눈이에요. 많이 추우시죠?" 하고 인사한다.', after: [say('kang', 'normal', '…그래. 춥네.'), narr('강 씨는 손을 비비며 블랙을 기다린다.'), think('강 씨의 손이 많이 얼어 있었다. 말보다 따뜻한 잔이 먼저였을까.'), cg(null)] },
          { id: 'ask_rumor', score: 0, kind: 'ask', icon: 'question', label: '"배 파셨다면서요? 정말이에요?" 하고 묻는다.', after: [narr('강 씨의 손이 멈춘다.'), say('kang', 'normal', '…괜찮아요. 블랙.'), narr('강 씨는 다시 빈 항구를 본다.'), think('강 씨가 직접 말하지 않은 이야기였다. 소문으로 묻지 말 걸.'), cg(null)] },
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
        scene: [
          narr('새벽 여섯 시 십 분, 종점에 마지막 밤 버스가 들어온다.'),
          sfx('bus'),
          narr('버스 기사님이 들어와 카운터 앞에 선다. 밤새 운전을 해서 눈이 빨갛다.'),
          cg('han_watch'),
        ],
        hints: [
          say('han', 'normal', '10분 있어요. 이 차를 차고에 다시 넣으러 가야 해서요.'),
          narr('기사님은 메뉴판은 보지도 않고, 손목시계만 두 번 본다.'),
        ],
        q: '기사님에게는 10분밖에 없다. 어떻게 해 드리면 좋을까?',
        choices: [
          { id: 'quick', score: 2, kind: 'wait', icon: 'clock', label: '바로 만들 준비를 하고, 꼭 필요한 것만 짧게 묻는다.', after: [cg('han_sits'), narr('기사님이 시계를 한 번 보고, 오랜만에 의자에 앉는다.'), narr('기사님은 컵을 만드는 내 손을 오래 바라본다.'), say('han', 'smile', '덕분에 앉아서 마시겠네요. 10분이 길게 느껴져요.'), cg(null)] },
          { id: 'menu', score: 1, kind: 'plain', icon: 'menu', label: '"천천히 고르세요." 하고 메뉴판을 건넨다.', after: [narr('기사님이 메뉴판을 빠르게 넘기며 시계를 본다.'), say('han', 'normal', '…아무거나 달게요. 빨리 되는 걸로.'), think('천천히 고를 시간이 없으셨구나. 기사님에게는 시간이 제일 귀하다.'), cg(null)] },
          { id: 'chat', score: 0, kind: 'ask', icon: 'speech', label: '"버스 기사님이세요? 밤에 일하세요?" 하고 이야기를 건다.', after: [say('han', 'normal', '네, 네. 괜찮아요.'), narr('기사님은 대답하면서도 시계를 또 본다.'), think('이야기하는 사이에 10분이 줄어들었다. 오늘은 말보다 빠른 손이 필요했다.'), cg(null)] },
        ],
        why: '한 씨는 10분밖에 없다며 시계를 두 번 봤어요. 기다리는 시간을 줄여 주는 것이 한 씨에게 맞는 친절이에요.',
      },
      summer_clock: {
        season: 'summer', nth: 2, title: '여섯 시 십 분',
        scene: [
          narr('"7시 전은 동네 시간"이 된 첫 새벽, 벽시계가 여섯 시 칠 분을 가리킨다.'),
          narr('며칠 전 한 씨가 나가면서 한 말이 떠오른다.'),
          cg('han_clock'),
        ],
        hints: [
          say('han', 'normal', '내일도 이 시간에 와요. 여섯 시 십 분.'),
          narr('창밖 종점으로, 밤 버스의 불빛이 천천히 들어온다.'),
        ],
        q: '버스가 들어오고, 한 씨가 오시기까지 3분 남았다. 무엇을 할까?',
        choices: [
          { id: 'ready', score: 2, kind: 'wait', icon: 'clock', label: '늘 드시는 달게 한 잔을 미리 만들어 둔다.', after: [cg('han_cup_ready'), sfx('bell'), narr('한 씨가 들어오다 멈춘다. 카운터 위의 종이컵을 오래 바라본다.'), say('han', 'surprised', '…이거, 내 거예요?'), say('jieun', 'smile', '네. 여섯 시 십 분이라서요.'), narr('한 씨는 의자에 앉아, 처음으로 10분을 다 쉬며 천천히 마신다.'), cg(null)] },
          { id: 'when_comes', score: 1, kind: 'plain', icon: 'hourglass', label: '한 씨가 들어오면 그때 바로 만든다.', after: [sfx('bell'), say('han', 'normal', '달게 한 잔이요.'), narr('한 씨는 시계를 보며 기다리다가, 컵을 받자마자 일어난다.'), think('만드는 동안 쉬는 시간이 줄었다. 오시는 시간을 아니까, 미리 해 둘 수도 있었는데.'), cg(null)] },
          { id: 'go_out', score: 0, kind: 'step', icon: 'walk', label: '버스 쪽으로 뛰어나가 "뭐 드실 거예요?" 하고 묻는다.', after: [say('han', 'surprised', '아이고, 여기까지 나왔어요? 괜찮아요.'), narr('한 씨가 웃으며 들어온다. 그래도 시계를 본다.'), think('쫓아가지 않아도 됐다. 한 씨는 늘 같은 시간에, 같은 것을 드신다.'), cg(null)] },
        ],
        why: '한 씨는 늘 여섯 시 십 분에 와서 10분만 쉬어요. 오는 시간에 맞춰 미리 만들어 두면 기다림 없이 쉴 수 있어요.',
      },
      autumn_note: {
        season: 'autumn', nth: 3, title: '딸 사진과 펜',
        scene: [
          narr('가을 새벽 여섯 시 십 분, 한 씨가 컵을 받아 들고 의자에 앉는다.'),
          narr('한 씨가 휴대전화 속 교복 입은 아이의 사진을 본다. 한 씨가 집에 가면 이미 학교에 가 있는 딸이다.'),
          cg('han_photo'),
        ],
        hints: [
          narr('한 씨가 주머니에서 펜을 꺼낸다. 무언가 쓰려다가, 쓸 종이가 없어 다시 넣는다.'),
          narr('한 씨는 들고 갈 종이컵의 옆면을 손가락으로 만지작거린다. 거기에라도 쓰고 싶은 얼굴이다.'),
        ],
        q: '한 씨는 딸에게 무언가 남기고 싶으신 것 같다. 어떻게 할까?',
        choices: [
          { id: 'memo_pen', score: 2, kind: 'wait', icon: 'pen', label: '말없이 작은 메모지와 펜을 컵 옆에 놓아 둔다.', after: [cg('han_memo'), narr('한 씨가 메모지를 오래 바라본다.'), narr('한 씨는 무언가를 천천히 쓰고, 접어서 가슴 주머니에 넣는다.'), say('han', 'smile', '고마워요. 딸한테 쓸 말이 있었어요.'), cg(null)] },
          { id: 'say_pretty', score: 1, kind: 'ask', icon: 'speech', label: '"따님 사진이에요? 예쁘네요." 하고 말한다.', after: [say('han', 'smile', '네, 중학생이에요.'), narr('한 씨가 사진을 끄고 시계를 본다. 펜은 주머니에 그대로다.'), think('사진 이야기는 좋아하셨다. 그런데 꺼내신 펜은 끝내 쓰지 못하셨다.'), cg(null)] },
          { id: 'ask_fight', score: 0, kind: 'step', icon: 'question', label: '"따님이랑 사이가 안 좋으세요?" 하고 묻는다.', after: [say('han', 'surprised', '아니요, 그런 거 아니에요. 괜찮아요.'), narr('한 씨가 서둘러 일어난다.'), think('짐작으로 물어서 당황하게 해 드렸다. 한 씨는 그저 쓸 종이가 필요하셨던 것 같은데.'), cg(null)] },
        ],
        why: '한 씨는 딸 사진을 보다가 펜을 꺼냈지만, 쓸 종이가 없었어요. 쓸 것을 놓아 두면 마음을 전할 수 있어요.',
      },
      autumn_fog: {
        season: 'autumn', nth: 4, title: '안개로 늦은 날',
        scene: [
          narr('짙은 안개가 낀 새벽, 여섯 시 십 분에 맞춰 달게 한 잔을 만들어 두었다.'),
          narr('그런데 버스가 오지 않는다. 여섯 시 이십오 분이 되어서야, 한 씨가 숨을 몰아쉬며 뛰어 들어온다.'),
          cg('han_fog'),
        ],
        hints: [
          narr('한 씨의 눈이 벽시계로 간다. 버스를 다시 넣으러 갈 때까지 3분밖에 없다.'),
          narr('한 씨의 눈이 카운터 위에 미리 만들어 둔 잔으로 간다.'),
        ],
        q: '오늘은 3분뿐이다. 한 씨에게 지금 가장 필요한 것은 무엇일까?',
        choices: [
          { id: 'lid_hands', score: 2, kind: 'wait', icon: 'cup', label: '미리 만든 잔에 뚜껑을 덮어, 말없이 두 손으로 건넨다.', after: [cg('han_cup_hands'), narr('한 씨가 잔을 받아 들고, 나를 오래 바라본다.'), say('han', 'smile', '…고마워요. 오늘은 이 한 모금이면 돼요.'), narr('한 씨가 따뜻한 잔을 들고, 다시 안개 속으로 뛰어간다.'), cg(null)] },
          { id: 'mug_slow', score: 1, kind: 'plain', icon: 'chair', label: '"천천히 드세요." 하고 머그에 다시 담아 드린다.', after: [say('han', 'normal', '아, 시간이… 괜찮아요.'), narr('한 씨는 세 모금을 급하게 마시고 일어난다.'), think('천천히 드시라고 했지만, 오늘은 천천히 할 시간이 없으셨다.'), cg(null)] },
          { id: 'ask_late', score: 0, kind: 'ask', icon: 'question', label: '"왜 늦으셨어요? 안개 때문이에요?" 하고 묻는다.', after: [say('han', 'normal', '네, 네. 괜찮아요.'), narr('한 씨는 대답하는 사이에도 시계를 보고, 잔을 들고 뛰어간다.'), think('3분 가운데 1분을 내 질문이 써 버렸다.'), cg(null)] },
        ],
        why: '한 씨는 시계를 보고, 미리 만든 잔을 봤어요. 3분뿐일 때는 말보다 바로 들고 갈 수 있는 잔이 필요해요.',
      },
      winter_daughter: {
        season: 'winter', nth: 5, title: '딸과 함께 온 새벽',
        scene: [
          narr('겨울 방학, 여섯 시 십 분에 들어온 한 씨 뒤로 패딩을 입은 아이가 따라 들어온다.'),
          narr('딸이 아빠와 함께 있고 싶어서, 아빠의 마지막 버스를 타고 같이 왔다고 한다.'),
          cg('han_with_daughter'),
        ],
        hints: [
          narr('한 씨의 눈이 딸을 보다가 벽시계로 간다. 함께 있을 수 있는 시간은 10분이다.'),
          narr('딸의 눈이 메뉴판의 갈색 동그라미, 코코아로 간다. 그런데 아빠에게 말은 하지 않는다.'),
        ],
        q: '두 사람에게는 10분뿐이다. 그 10분을 어떻게 아껴 드릴까?',
        choices: [
          { id: 'cocoa_quiet', score: 2, kind: 'wait', icon: 'cup', label: '묻지 않고, 한 씨의 잔 옆에 따뜻한 코코아를 놓아 둔다.', after: [cg('han_two_cups'), narr('딸이 코코아를 보고 아빠를 본다. 한 씨가 나를 오래 바라본다.'), say('han_daughter', 'smile', '아빠, 이거 나 먹어도 돼?'), say('han', 'smile', '그럼, 천천히 마셔. 오늘은 아빠도 천천히야.'), cg(null)] },
          { id: 'ask_daughter', score: 1, kind: 'ask', icon: 'question', label: '"따님은 뭐 드실래요?" 하고 묻는다.', after: [narr('딸이 메뉴판을 한참 고르는 동안, 한 씨가 시계를 본다.'), say('han_daughter', 'normal', '…코코아요.'), think('딸은 이미 코코아를 보고 있었다. 묻는 동안 10분이 조금 줄었다.'), cg(null)] },
          { id: 'tell_dad', score: 0, kind: 'step', icon: 'speech', label: '"아빠가 매일 오세요! 따님 얘기 많이 해요." 하고 말한다.', after: [say('han', 'surprised', '아, 그런 얘기를… 허허. 괜찮아요.'), narr('딸이 쑥스러워 고개를 숙이고, 둘 다 말이 없어진다.'), think('두 사람이 나눌 이야기를, 내가 먼저 해 버렸다.'), cg(null)] },
        ],
        why: '한 씨는 딸과 남은 10분을 봤고, 딸은 코코아의 갈색 동그라미를 봤어요. 묻는 시간도 아껴 주면 둘이 더 오래 이야기해요.',
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
        scene: [
          narr('아기 엄마가 아기를 달래는 사이, 라테가 다 식어 버렸다.'),
          narr('삼십 분 동안 한 모금도 마시지 못했다. 컵 위의 우유 거품도 다 꺼져 있다.'),
          cg('eunju_cold_cup'),
        ],
        hints: [
          say('eunju', 'sad', '커피는 늘 식어요. 아기 낳고 나서는, 끝까지 마셔 본 적이 없어요.'),
          narr('아기 엄마는 식은 컵을 만져 보고 한숨을 쉰다. 그러다 나와 눈이 마주치자, 무언가 말하고 싶은 얼굴로 머뭇거린다.'),
        ],
        q: '커피는 식었고, 아기 엄마는 누군가와 이야기하고 싶은 얼굴이다. 어떻게 할까?',
        choices: [
          { id: 'thick_cup', score: 2, kind: 'ask', icon: 'coffee', label: '두꺼운 컵에 새로 담아 뚜껑을 덮어 드리며, "이 컵은 천천히 식어요." 하고 말을 건넨다.', after: [cg('eunju_thick_cup'), narr('아기 엄마가 두꺼운 컵을 두 손으로 감싸고, 오래 바라본다.'), say('eunju', 'smile', '…따뜻하다. 고마워요.'), say('eunju', 'smile', '누가 나한테 말 걸어 준 거, 정말 오랜만이에요.'), cg(null)] },
          { id: 'reheat', score: 1, kind: 'wait', icon: 'milk', label: '말없이 식은 라테를 데워서 다시 놓아 둔다.', after: [say('eunju', 'smile', '아, 고마워요.'), narr('한 모금 마시자마자 아기가 또 울어서, 아기 엄마는 컵을 내려놓는다.'), think('데워 드렸지만 또 식겠다. 그리고 무언가 말하고 싶어 하셨는데.'), cg(null)] },
          { id: 'take_baby', score: 0, kind: 'step', icon: 'run', label: '"아기 제가 좀 봐 드릴게요!" 하고 유모차를 민다.', after: [say('eunju', 'surprised', '아, 아니에요. 괜찮아요.'), narr('아기 엄마가 유모차 손잡이를 다시 꼭 잡는다. 눈이 식은 컵으로 간다.'), think('처음 보는 사람이 아기를 데려가려 하니 놀라셨겠다.'), cg(null)] },
        ],
        why: '은주는 커피가 늘 식는다며 한숨을 쉬고, 말하고 싶은 얼굴로 머뭇거렸어요. 덜 식는 컵과 따뜻한 말 한마디가 필요해요.',
      },
      summer_talk: {
        season: 'summer', nth: 2, title: '아기랑만 하는 이야기',
        scene: [
          narr('은주 씨가 아기를 재우고, 창가에서 라테를 마신다.'),
          narr('옆 탁자에서는 친구끼리 온 손님들이 깔깔 웃으며 이야기한다.'),
          cg('eunju_listens'),
        ],
        hints: [
          say('eunju', 'normal', '요즘은 아기랑만 이야기해요. 아기는 대답을 안 하지만요, 하하.'),
          narr('은주 씨는 웃으며 말했지만, 옆 탁자의 웃음소리 쪽을 한참 바라본다.'),
        ],
        q: '은주 씨는 웃으셨지만, 다른 사람들의 이야기 소리를 부러운 듯 보신다. 어떻게 할까?',
        choices: [
          { id: 'ask_baby', score: 2, kind: 'ask', icon: 'speech', label: '"아기가 몇 개월이에요?" 하고 부드럽게 물어본다.', after: [cg('eunju_baby_talk'), narr('은주 씨가 나를 오래 바라본다. 그리고 환하게 웃는다.'), say('eunju', 'smile', '여섯 달이요. 어제 처음으로 뒤집기를 했어요.'), say('eunju', 'smile', '이 얘기, 누구한테 꼭 하고 싶었어요.'), cg(null)] },
          { id: 'water', score: 1, kind: 'wait', icon: 'water', label: '말없이 시원한 물 한 잔을 놓아 둔다.', after: [say('eunju', 'smile', '고마워요.'), narr('은주 씨는 물을 마시고, 다시 옆 탁자 쪽을 본다.'), think('물보다, 이야기를 나눌 사람이 필요하셨던 것 같다.'), cg(null)] },
          { id: 'my_story', score: 0, kind: 'step', icon: 'speech', label: '"제 친구도 아기가 있는데요…" 하고 내 이야기를 길게 한다.', after: [say('eunju', 'normal', '아, 네…'), narr('은주 씨는 고개만 끄덕인다. 그러다 아기가 깨서 일어난다.'), say('eunju', 'normal', '괜찮아요. 다음에 또 올게요.'), think('은주 씨의 이야기를 들어야 했는데, 내 이야기만 했다.'), cg(null)] },
        ],
        why: '은주는 요즘 아기하고만 이야기한다며 다른 사람들의 웃음소리를 봤어요. 은주의 이야기를 들을 수 있게 먼저 물어봐요.',
      },
      autumn_space: {
        season: 'autumn', nth: 3, title: '걸리는 유모차',
        scene: [
          sfx('bell'),
          narr('은주 씨가 유모차를 밀고 들어오다, 의자 다리에 걸린다.'),
          narr('가을이 되어 손님이 늘자 탁자를 몇 개 더 놓았더니, 통로가 좁아졌다.'),
          cg('eunju_door'),
        ],
        hints: [
          narr('은주 씨가 유모차를 뒤로 뺐다가 다시 민다. 이번에도 의자 다리에 걸린다.'),
          narr('은주 씨는 창가 쪽 빈 곳을 바라보다가, 입구에서 머뭇거리며 서 있다.'),
        ],
        q: '유모차가 들어갈 길이 없어서, 은주 씨는 입구에서 머뭇거리신다. 어떻게 할까?',
        choices: [
          { id: 'ask_where', score: 2, kind: 'ask', icon: 'chair', label: '"어디가 편하세요? 자리 만들어 드릴게요." 하고 물으며 의자를 옮긴다.', after: [cg('eunju_space'), say('eunju', 'smile', '창가요. 아기가 바다 보는 걸 좋아해요.'), narr('창가의 의자 두 개를 옮기자, 유모차가 쏙 들어간다.'), narr('은주 씨가 나를 오래 바라본다.'), say('eunju', 'smile', '물어봐 줘서 고마워요. 어디가 편한지 묻는 사람, 잘 없거든요.'), cg(null)] },
          { id: 'move_one', score: 1, kind: 'wait', icon: 'door', label: '말없이 입구 옆 의자 하나를 치워 둔다.', after: [narr('은주 씨가 겨우 유모차를 밀고 들어와, 입구 옆에 앉는다.'), say('eunju', 'smile', '고마워요.'), narr('은주 씨는 앉아서도 창가 쪽을 한 번 본다.'), think('은주 씨가 앉고 싶으셨던 곳은 창가였구나. 물어볼 걸 그랬다.'), cg(null)] },
          { id: 'hold_baby', score: 0, kind: 'step', icon: 'hand', label: '아기를 안아 들어 주려고 두 손을 내민다.', after: [say('eunju', 'surprised', '아, 괜찮아요. 아기가 낯을 가려서요.'), narr('은주 씨가 유모차를 입구에 세워 두고, 창가 쪽을 한 번 본다.'), think('도와드리고 싶었는데, 은주 씨가 바라신 건 아기를 맡기는 일이 아니었다.'), cg(null)] },
        ],
        why: '은주 씨는 유모차가 걸려 머뭇거리며 창가 쪽을 봤어요. 은주 씨에게는 "어디가 편하세요?" 하고 물어보는 것이 맞아요.',
      },
      winter_tired: {
        season: 'winter', nth: 4, title: '지친 얼굴',
        scene: [
          narr('첫눈 오는 오후, 은주 씨가 들어온다. 눈이 빨갛고, 머리도 대충 묶었다.'),
          narr('유모차 안의 아기는 감기에 걸렸는지, 자꾸 콧물을 훌쩍인다.'),
          cg('eunju_tired'),
        ],
        hints: [
          narr('은주 씨의 눈이 창밖의 눈으로 갔다가, 나에게 온다. 무언가 말하려다가 입을 다문다.'),
          narr('은주 씨의 눈이 늘 앉던 창가의 유모차 자리로 간다.'),
        ],
        q: '은주 씨는 무언가 말하고 싶은데, 먼저 꺼내지 못하시는 것 같다. 어떻게 할까?',
        choices: [
          { id: 'ask_sleep', score: 2, kind: 'ask', icon: 'speech', label: '"어젯밤엔 좀 주무셨어요?" 하고 묻고, 창가 유모차 자리로 안내한다.', after: [cg('eunju_heard'), narr('은주 씨가 나를 오래 바라본다.'), say('eunju', 'sad', '…아기가 아파서 한숨도 못 잤어요. 그걸 물어봐 준 사람, 지은 씨가 처음이에요.'), narr('은주 씨는 자리에 앉아 조금 울다가, 이내 웃는다.'), cg(null)] },
          { id: 'latte_quiet', score: 1, kind: 'wait', icon: 'coffee', label: '말없이 따뜻한 라테를 두꺼운 컵에 내 드린다.', after: [say('eunju', 'smile', '고마워요.'), narr('은주 씨는 컵을 감싸고 창밖을 본다. 하려던 말은 끝내 하지 않는다.'), think('따뜻한 잔은 드렸지만, 하고 싶으셨던 말은 듣지 못했다.'), cg(null)] },
          { id: 'go_doctor', score: 0, kind: 'step', icon: 'caution', label: '"아기 감기면 병원부터 가셔야죠!" 하고 말한다.', after: [say('eunju', 'normal', '…다녀왔어요. 괜찮아요.'), narr('은주 씨가 고개를 숙이고 유모차 쪽을 본다.'), think('은주 씨도 이미 다 하셨을 텐데. 지친 마음부터 물어봐 드릴 걸.'), cg(null)] },
        ],
        why: '은주 씨는 무언가 말하려다 멈췄어요. 묻기를 기다리는 사람에게는 먼저 부드럽게 물어봐 줘요.',
      },
      winter_friend: {
        season: 'winter', nth: 5, title: '처음 온 엄마',
        scene: [
          sfx('bell'),
          narr('은주 씨가 유모차를 밀고 들어온다. 그 뒤에 처음 보는 엄마가 서 있다.'),
          narr('처음 온 엄마는 문 앞에서 머뭇거린다. 유모차 손잡이를 꼭 쥐고, 가게 안을 조심스럽게 둘러본다.'),
          cg('eunju_friend'),
        ],
        hints: [
          narr('은주 씨의 눈이 처음 온 엄마로 갔다가, 나에게 온다. 부탁하는 눈빛이다.'),
          narr('처음 온 엄마의 눈이 창가의 유모차 자리로 간다. 그래도 선뜻 들어오지는 못한다.'),
        ],
        q: '여름의 은주 씨처럼, 처음 온 엄마도 문 앞에서 머뭇거린다. 어떻게 할까?',
        choices: [
          { id: 'welcome_new', score: 2, kind: 'ask', icon: 'speech', label: '처음 온 엄마에게 "유모차는 창가에 두세요. 따뜻한 걸로 드릴까요?" 하고 먼저 묻는다.', after: [cg('eunju_two_moms'), say('mom2', 'smile', '아… 네. 따뜻한 걸로요.'), narr('은주 씨가 나를 오래 바라본다. 그리고 작게 엄지를 든다.'), say('eunju', 'smile', '거봐요. 여기 좋다고 했죠?'), cg(null)] },
          { id: 'make_space', score: 1, kind: 'wait', icon: 'chair', label: '말없이 창가에 유모차 자리를 하나 더 만들어 둔다.', after: [narr('처음 온 엄마가 조심스럽게 들어와 앉는다. 그래도 아직 말이 없다.'), say('eunju', 'smile', '고마워요, 지은 씨.'), think('자리는 생겼지만, 처음 온 엄마에게 아직 아무도 말을 걸지 않았다.'), cg(null)] },
          { id: 'only_eunju', score: 0, kind: 'plain', icon: 'menu', label: '은주 씨에게만 "늘 드시던 거죠?" 하고 묻는다.', after: [say('eunju', 'normal', '네. 아, 이분은…'), narr('처음 온 엄마는 아직 문 앞에 서 있다.'), say('eunju', 'smile', '괜찮아요. 이리 와요, 같이 앉아요.'), think('은주 씨가 대신 불러 주셨다. 처음 온 사람에게는 내가 먼저 말을 걸었어야 했다.'), cg(null)] },
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
        scene: [
          narr('보리차를 다 만들었다. 학생은 벌써 가게에서 가장 구석진 자리에 앉아 문제집을 펴 놓았다.'),
          narr('학생은 이어폰을 다시 끼고, 문제집에 고개를 묻는다.'),
          cg('sumin_corner'),
        ],
        hints: [
          say('sumin', 'normal', '…여기, 조용해서 좋아요.'),
          narr('학생은 의자를 벽 쪽으로 조금 돌려 앉는다. 다른 사람과 눈이 마주치지 않게.'),
        ],
        q: '보리차가 다 됐다. 구석에서 공부하는 학생에게 어떻게 드릴까?',
        choices: [
          { id: 'quiet_put', score: 2, kind: 'wait', icon: 'cup', label: '구석 자리에 말없이 컵을 놓고 돌아온다.', after: [cg('sumin_nod'), narr('학생이 컵을 보고, 나를 오래 바라본다. 그리고 작게 고개를 숙인다.'), narr('이어폰은 그대로다. 문제집 넘기는 소리만 조용히 들린다.'), cg(null)] },
          { id: 'call_out', score: 1, kind: 'plain', icon: 'bell_call', label: '카운터에서 "보리차 나왔어요!" 하고 부른다.', after: [narr('학생이 이어폰을 빼고, 일어나서 컵을 가지러 온다.'), say('sumin', 'normal', '…네.'), narr('학생은 다시 구석으로 가서 이어폰을 낀다.'), think('공부하던 흐름을 끊어 버렸다. 가져다 드려도 됐는데.'), cg(null)] },
          { id: 'ask_grade', score: 0, kind: 'ask', icon: 'question', label: '"공부하러 왔어요? 몇 학년이에요?" 하고 말을 건다.', after: [say('sumin', 'normal', '…고3이요. 괜찮아요.'), narr('학생은 이어폰 소리를 키우고, 의자를 벽 쪽으로 더 돌린다.'), think('조용해서 온 사람에게 말을 걸어 버렸다.'), cg(null)] },
        ],
        why: '수민은 조용해서 좋다며 의자를 벽 쪽으로 돌렸어요. 말을 걸기보다 조용히 두는 것이 수민에게 맞아요.',
      },
      summer_rain: {
        season: 'summer', nth: 2, title: '처마 밑의 비',
        scene: [
          narr('줄이 골목 끝까지 섰던 날 저녁, 갑자기 비가 쏟아진다.'),
          narr('처마 밑에 교복 입은 수민이 서 있다. 우산이 없는지, 가방을 가슴에 꼭 안고 있다.'),
          cg('sumin_eave'),
        ],
        hints: [
          say('sumin', 'normal', '…비 그치면 갈게요. 여기 잠깐만 서 있을게요.'),
          narr('수민은 휴대전화 시계를 보고, 다시 빗줄기를 본다. 늦을까 봐 걱정하는 얼굴이다.'),
        ],
        q: '수민은 비가 그치기를 기다리지만, 시간에 쫓기는 것 같다. 어떻게 할까?',
        choices: [
          { id: 'umbrella', score: 2, kind: 'wait', icon: 'door', label: '말없이 가게 우산 하나를 수민 옆에 세워 둔다.', after: [cg('sumin_umbrella'), narr('수민이 우산을 오래 바라본다.'), narr('수민은 우산을 펴고 나를 한 번 돌아본다. 그리고 작게 고개를 숙이고 빗속으로 걸어간다.'), cg(null)] },
          { id: 'stay', score: 1, kind: 'plain', icon: 'speech', label: '"비 그칠 때까지 안에 있어도 돼요." 하고 말한다.', after: [say('sumin', 'normal', '…네. 고마워요.'), narr('수민은 안으로 들어오지 않고, 처마 끝에 더 붙어 선다. 그리고 계속 시계를 본다.'), think('기다릴 시간이 없어 보였다. 기다리라는 말보다 우산이 필요했을까.'), cg(null)] },
          { id: 'walk_her', score: 0, kind: 'step', icon: 'walk', label: '"집이 어디예요? 같이 가 줄게요." 하고 따라나선다.', after: [say('sumin', 'surprised', '아, 괜찮아요. 혼자 갈 수 있어요.'), narr('수민은 가방을 머리에 이고 빗속으로 뛰어간다.'), think('따라나서니 오히려 뛰어가 버렸다. 수민에게는 거리가 필요했다.'), cg(null)] },
        ],
        why: '수민은 비가 그치면 가겠다며 시계를 봤어요. 다가가지 않고 우산 하나만 건네도 충분해요.',
      },
      autumn_brochure: {
        season: 'autumn', nth: 3, title: '떨어진 안내서',
        scene: [
          narr('수민이 계산대 앞에서 지갑을 꺼내다가, 접힌 종이 한 장을 떨어뜨린다.'),
          narr('바닥에 펼쳐진 종이는, 바다가 없는 먼 도시에 있는 대학교의 입학 안내서다.'),
          cg('sumin_brochure'),
        ],
        hints: [
          narr('수민이 얼른 손을 뻗었다가, 그대로 멈춘다. 얼굴이 빨개진다.'),
          narr('수민은 안내서 대신, 창밖의 바다 쪽을 본다.'),
        ],
        q: '수민은 안내서를 들킨 게 부끄러운 것 같다. 어떻게 돌려줄까?',
        choices: [
          { id: 'face_down', score: 2, kind: 'wait', icon: 'book', label: '안내서의 글을 보지 않고, 뒤집어서 건넨다.', after: [cg('sumin_brochure_back'), narr('수민이 뒤집힌 종이를 오래 바라본다.'), narr('수민은 작게 고개를 숙이고, 안내서를 가방 안쪽에 넣는다.'), say('sumin', 'normal', '…고맙습니다.'), cg(null)] },
          { id: 'just_give', score: 1, kind: 'plain', icon: 'hand', label: '그냥 주워서 건넨다.', after: [narr('수민은 안내서를 받아 들고, 얼른 반으로 접는다.'), say('sumin', 'normal', '…네.'), think('내가 안내서를 본 걸 아셨을까. 보지 않은 척 돌려드릴 걸 그랬다.'), cg(null)] },
          { id: 'say_city', score: 0, kind: 'ask', icon: 'speech', label: '"도시로 가요? 좋겠다!" 하고 말한다.', after: [say('sumin', 'normal', '…아직 몰라요. 괜찮아요.'), narr('수민은 이어폰을 다시 낀다.'), think('수민이 아직 정하지 못한 일이었다. 내가 먼저 말할 일이 아니었다.'), cg(null)] },
        ],
        why: '수민은 안내서를 주우려다 멈추고 얼굴이 빨개졌어요. 보지 않고 돌려주는 것이 수민의 마음을 지켜 줘요.',
      },
      autumn_exam: {
        season: 'autumn', nth: 4, title: '수능 날 아침',
        scene: [
          narr('{{수능}} 날 아침, 따뜻한 보리차를 종이컵에 담았다. 이제 컵에 슬리브를 끼울 차례다.'),
          narr('수민은 계산대 앞에 서서 기다린다. 오늘은 이어폰도 끼지 않았다.'),
          cg('sumin_exam_morning'),
        ],
        hints: [
          narr('수민의 눈이 떨리는 자기 손으로 간다. 수험표를 쥔 손끝이 하얗다.'),
          narr('수민의 눈이 컵에 끼울 하얀 슬리브로 간다. 아무것도 쓰여 있지 않은 하얀 종이다.'),
        ],
        q: '오늘은 수민에게 아주 큰 날이다. 말없이 응원할 방법이 있을까?',
        choices: [
          { id: 'draw_wave', score: 2, kind: 'wait', icon: 'pen', label: '슬리브에 작은 파도 그림을 그려, 말없이 건넨다.', after: [cg('sumin_sleeve'), narr('수민이 슬리브의 파도를 오래 바라본다.'), narr('컵을 쥔 손의 떨림이 조금 멎는다.'), say('sumin', 'smile', '…다녀올게요.'), cg(null)] },
          { id: 'cheer', score: 1, kind: 'plain', icon: 'speech', label: '"시험 잘 보세요! 힘내요!" 하고 말한다.', after: [say('sumin', 'normal', '…네. 고맙습니다.'), narr('수민은 컵을 들고 나간다. 손이 아직 떨린다.'), think('응원은 했지만, 오늘 아침 수민에게는 말이 조금 무거웠을지도 모른다.'), cg(null)] },
          { id: 'ask_score', score: 0, kind: 'ask', icon: 'question', label: '"긴장돼요? 몇 점 받고 싶어요?" 하고 묻는다.', after: [say('sumin', 'normal', '…모르겠어요. 괜찮아요.'), narr('수민은 컵을 꼭 쥐고 나간다.'), think('시험 날 아침에 점수를 물었다. 걱정만 더해 드렸다.'), cg(null)] },
        ],
        why: '수민은 떨리는 손과 하얀 슬리브를 봤어요. 말 대신 작은 그림 하나가 수민에게 응원이 돼요.',
      },
      winter_letter: {
        season: 'winter', nth: 5, title: '봉투',
        scene: [
          narr('수민이 카운터 앞에 선다. 손에 하얀 봉투가 들려 있다.'),
          narr('대학교 이름이 찍힌 봉투인데, 아직 뜯지 않았다.'),
          cg('sumin_envelope'),
        ],
        hints: [
          narr('수민의 눈이 봉투로 갔다가, 나를 본다. 무언가 부탁하고 싶은 눈이다.'),
          narr('수민의 눈이 카운터 바로 앞의 의자로 간다. 늘 앉던 구석 자리가 아니다.'),
        ],
        q: '수민은 봉투를 혼자 열기 무서운 것 같다. 어떻게 할까?',
        choices: [
          { id: 'wipe_wait', score: 2, kind: 'wait', icon: 'cloth', label: '아무것도 묻지 않고, 컵을 닦으며 수민이 말할 때까지 곁에서 기다린다.', after: [cg('sumin_wait'), narr('수민이 카운터 앞 의자에 앉는다. 봉투를 오래 바라본다.'), say('sumin', 'normal', '…내일, 여기서 열어 볼게요. 그때도 여기 계셔 주세요.'), cg(null)] },
          { id: 'usual_ask', score: 1, kind: 'plain', icon: 'cup', label: '"보리차 드릴까요?" 하고 늘 하던 대로 묻는다.', after: [say('sumin', 'normal', '…네.'), narr('수민은 봉투를 가방에 넣고, 늘 앉던 구석으로 간다.'), think('수민은 오늘 구석이 아니라 카운터 앞을 보고 있었는데.'), cg(null)] },
          { id: 'push_open', score: 0, kind: 'step', icon: 'hand', label: '"합격했어요? 열어 봐요!" 하고 재촉한다.', after: [say('sumin', 'surprised', '아… 아직요. 괜찮아요.'), narr('수민은 봉투를 가방 깊이 넣는다.'), think('언제 열지는 수민이 정할 일이었다. 재촉하지 말 걸.'), cg(null)] },
        ],
        why: '수민은 봉투와 나를 번갈아 보고, 카운터 앞 의자를 봤어요. 재촉하지 않고 곁에서 기다리면 수민이 스스로 말해요.',
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
          narr('철물점 노 씨가 들어와 카운터 앞 의자에 앉는다. 주문은 하지 않는다.'),
          narr('사장님이 말없이 종이컵에 믹스커피를 탄다. 서른 해 동안 그렇게 해 왔다고 한다.'),
          narr('그런데 컵 안에서 숟가락이 달그락달그락, 조금 떨린다.'),
          cg('noh_spoon'),
        ],
        hints: [
          say('noh', 'normal', '오늘 바람이 좋네. 바다가 아주 잔잔해.'),
          narr('노 씨는 사장님 손을 한 번 보더니, 일부러 창밖으로 눈을 돌린다. 숟가락 소리가 안 들리는 척한다.'),
        ],
        q: '사장님의 숟가락이 떨리는데, 노 씨는 못 본 척 창밖 이야기를 하신다. 어떻게 할까?',
        choices: [
          { id: 'window_talk', score: 2, kind: 'wait', icon: 'window', label: '나도 못 본 척하며, 노 씨와 창밖 이야기를 한다.', after: [say('jieun', 'normal', '정말 잔잔하네요. 배들이 벌써 다 나갔어요.'), cg('noh_window_talk'), narr('노 씨가 나를 오래 바라본다. 그리고 작게 웃는다.'), say('noh', 'smile', '그래. 오늘 같은 날은 바다가 착하지.'), narr('그사이 사장님이 커피를 다 타서, 노 씨 앞에 조용히 놓는다.'), cg(null)] },
          { id: 'keep_work', score: 1, kind: 'plain', icon: 'freeze', label: '아무 말 없이 하던 일을 계속한다.', after: [narr('사장님이 커피를 다 타서 노 씨 앞에 놓는다.'), say('noh', 'normal', '고맙네.'), narr('노 씨는 커피를 마시며 창밖만 본다. 가게 안에 숟가락 소리만 남았다.'), think('노 씨는 일부러 다른 이야기를 하셨다. 나도 함께 이야기했으면 사장님이 덜 불편하셨을까.'), cg(null)] },
          { id: 'ask_hand', score: 0, kind: 'ask', icon: 'question', label: '"사장님, 손 괜찮으세요?" 하고 묻는다.', after: [say('owner', 'normal', '…괜찮아요.'), narr('사장님이 숟가락을 내려놓고, 손을 앞치마에 닦는다.'), say('noh', 'normal', '괜찮아요, 괜찮아. 바람이 참 좋네.'), narr('노 씨는 창밖을 보며 같은 말을 한 번 더 한다.'), think('손님 앞에서 사장님 손 이야기를 꺼내 버렸다. 노 씨가 왜 창밖 이야기를 하셨는지 알 것 같다.'), cg(null)] },
        ],
        why: '노 씨는 사장님 손을 보고도 일부러 창밖 이야기를 했어요. 사장님이 불편하지 않게 모른 척 함께해 줘요.',
      },
      autumn_shelf: {
        season: 'autumn', nth: 2, title: '낮아진 선반',
        scene: [
          narr('사장님이 은행에 간 사이, 노 씨가 공구 상자를 들고 온다.'),
          narr('노 씨는 원두 통을 올려 두는 높은 선반을 한 칸 낮추고, 뻑뻑한 수도꼭지를 돌리기 쉬운 손잡이로 바꾼다.'),
          cg('noh_shelf'),
        ],
        hints: [
          say('noh', 'normal', '높은 데서 무거운 통 내리다가 떨어뜨리면 큰일이야. 손이 편해야지.'),
          narr('노 씨는 입에 손가락을 대고, 카운터 뒤 사장님 자리를 한 번 본다.'),
        ],
        q: '노 씨는 사장님이 안 계실 때 몰래 고치시며, 입에 손가락을 대셨다. 어떻게 할까?',
        choices: [
          { id: 'say_nothing', score: 2, kind: 'wait', icon: 'freeze', label: '아무것도 묻지 않고, 사장님께도 말하지 않기로 한다.', after: [cg('noh_wink'), narr('노 씨가 나를 오래 바라본다. 그리고 작게 고개를 끄덕인다.'), say('noh', 'smile', '눈치가 있구먼.'), narr('노 씨는 공구 상자를 들고 조용히 나간다.'), cg(null)] },
          { id: 'loud_thanks', score: 1, kind: 'plain', icon: 'greet', label: '"고맙습니다!" 하고 크게 인사한다.', after: [say('noh', 'normal', '쉿. 그냥 고장 난 거 고친 거야.'), narr('노 씨는 공구 상자를 들고 서둘러 나간다.'), think('고마운 마음은 맞았지만, 노 씨는 조용히 하고 싶으셨다.'), cg(null)] },
          { id: 'ask_hand', score: 0, kind: 'ask', icon: 'question', label: '"사장님 손 때문에 고치시는 거죠?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…그냥 고장 난 거야. 괜찮아.'), narr('노 씨가 입에 손가락을 한 번 더 댄다.'), think('노 씨가 말하지 않는 데는 이유가 있었다. 나도 모른 척해 드려야 했다.'), cg(null)] },
        ],
        why: '노 씨는 사장님이 없을 때 몰래 고치고, 입에 손가락을 댔어요. 모른 척해 주는 것이 노 씨의 방식이에요.',
      },
      autumn_empty: {
        season: 'autumn', nth: 3, title: '사장님의 빈 잔',
        scene: [
          narr('마감 무렵, 노 씨가 들어와 카운터 앞에 선다.'),
          narr('사장님이 손을 쉬러 가신 뒤, 처음 맞는 가을 저녁이다.'),
          cg('noh_empty_mug'),
        ],
        hints: [
          narr('노 씨는 선반 위에 놓인 사장님의 하얀 잔을 오래 본다.'),
          narr('노 씨가 주머니에서 믹스커피 봉지를 꺼냈다가, 망설이다 다시 넣는다. 늘 사장님이 타 주던 커피다.'),
        ],
        q: '사장님이 없는 가게에서, 노 씨는 무엇을 마셔야 할지 망설이신다. 어떻게 할까?',
        choices: [
          { id: 'newspaper', score: 2, kind: 'wait', icon: 'note', label: '사장님 이야기는 꺼내지 않고, 노 씨가 늘 보던 신문을 펴서 자리에 놓아 둔다.', after: [cg('noh_newspaper'), narr('노 씨가 펴 놓은 신문을 오래 바라본다. 그리고 늘 앉던 의자에 앉는다.'), say('noh', 'normal', '…그 잔 줘. 네가 타 봐.'), cg(null)] },
          { id: 'ask_order', score: 1, kind: 'plain', icon: 'question', label: '"오늘은 뭐 드릴까요?" 하고 묻는다.', after: [narr('노 씨가 잠깐 망설인다.'), say('noh', 'normal', '…그 잔 줘.'), think('노 씨에게는 고를 것이 없었다. 늘 마시던 그 잔뿐이었다.'), cg(null)] },
          { id: 'ask_owner', score: 0, kind: 'ask', icon: 'speech', label: '"사장님 손은 많이 안 좋으세요?" 하고 묻는다.', after: [narr('노 씨가 한참 말이 없다.'), say('noh', 'normal', '…괜찮아질 거야. 그 잔 줘.'), think('노 씨도 걱정하고 계셨다. 그 걱정을 내가 먼저 꺼내 버렸다.'), cg(null)] },
        ],
        why: '노 씨는 사장님의 빈 잔을 보고, 믹스 봉지를 꺼냈다가 넣었어요. 걱정을 말하지 않는 사람이니 평소처럼 대해 줘요.',
      },
      winter_check: {
        season: 'winter', nth: 4, title: '지나가다 들른 아침',
        scene: [
          narr('눈 오는 아침, 노 씨가 "지나가다 들렀다"며 또 들어온다. 오늘로 사흘째다.'),
          narr('노 씨는 들어오자마자, 덜덜 소리를 내는 난로 쪽을 본다.'),
          cg('noh_heater'),
        ],
        hints: [
          narr('노 씨의 눈이 난로로 갔다가, 카운터 뒤의 비어 있는 사장님 자리로 간다.'),
          narr('노 씨의 눈이 나에게 와서, 컵을 쥔 내 손을 잠깐 살핀다.'),
        ],
        q: '"지나가다"라고 하시지만, 노 씨는 가게와 나를 살피러 오신 것 같다. 어떻게 할까?',
        choices: [
          { id: 'believe', score: 2, kind: 'wait', icon: 'coffee', label: '"지나가다"라는 말을 그대로 믿는 척, 늘 그 잔을 탄다.', after: [cg('noh_mix_winter'), narr('노 씨가 종이컵을 받아 들고, 나를 오래 바라본다.'), say('noh', 'smile', '…사장 맛이 나.'), cg(null)] },
          { id: 'thank_daily', score: 1, kind: 'plain', icon: 'greet', label: '"매일 와 주셔서 고맙습니다." 하고 인사한다.', after: [say('noh', 'normal', '허, 지나가다 들렀다니까.'), narr('노 씨가 헛기침을 하고, 난로만 본다.'), think('고마운 건 맞지만, 노 씨는 그 마음을 들키고 싶지 않으셨나 보다.'), cg(null)] },
          { id: 'ask_owner_sent', score: 0, kind: 'ask', icon: 'question', label: '"사장님이 부탁하셨어요? 저 보러 오시는 거죠?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…아니. 괜찮아, 지나가다 들렀어.'), think('노 씨는 말하지 않는 방식으로 챙겨 주신다. 그걸 굳이 확인할 필요는 없었다.'), cg(null)] },
        ],
        why: '노 씨는 난로와 사장님 자리, 내 손을 살폈어요. 지나가다 들렀다는 말 뒤의 마음을 모른 척 받아 줘요.',
      },
      winter_lantern: {
        season: 'winter', nth: 5, title: '랜턴',
        scene: [
          narr('정전 밤, 노 씨가 커다란 랜턴을 들고 들어온다.'),
          narr('아주 오래된 랜턴이다. 손잡이가 닳아서 반질반질하다.'),
          cg('noh_lantern'),
        ],
        hints: [
          narr('노 씨의 눈이 랜턴을 걸 곳을 찾다가, 카운터 뒤 사장님 자리 위의 못에 머문다.'),
          narr('노 씨의 눈이 나에게 잠깐 왔다가, 다시 그 못으로 간다. 꼭 그 자리여야 한다는 눈빛이다.'),
        ],
        q: '노 씨는 랜턴을 꼭 사장님 자리 위에 걸고 싶으신 것 같다. 어떻게 할까?',
        choices: [
          { id: 'step_aside', score: 2, kind: 'wait', icon: 'light', label: '아무것도 묻지 않고, 그 못에 걸 수 있게 길을 비켜 드린다.', after: [cg('noh_lantern_hung'), narr('노 씨가 사장님 자리 위에 랜턴을 건다. 깜깜하던 가게가 환해진다.'), narr('노 씨가 불빛을 오래 바라본다.'), say('noh', 'smile', '…이 랜턴, 저기가 원래 자리야.'), cg(null)] },
          { id: 'hang_myself', score: 1, kind: 'plain', icon: 'hand', label: '"제가 걸게요." 하고 받아서 가까운 곳에 건다.', after: [say('noh', 'normal', '…그래, 고맙네.'), narr('노 씨는 랜턴을 사장님 자리 위의 못으로 옮겨 건다.'), think('노 씨에게는 걸어 둘 자리가 따로 정해져 있었구나.'), cg(null)] },
          { id: 'ask_lantern', score: 0, kind: 'ask', icon: 'question', label: '"이거 사장님 거예요? 왜 갖고 계세요?" 하고 묻는다.', after: [narr('노 씨가 잠깐 말이 없다.'), say('noh', 'normal', '…나중에 얘기하자. 괜찮아, 일단 불부터.'), narr('노 씨가 사장님 자리 위의 못에 랜턴을 건다.'), think('사연은 나중에 들어도 된다. 지금은 불이 먼저였다.'), cg(null)] },
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
