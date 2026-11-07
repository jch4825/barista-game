/**
 * 미니게임: 커피 만들기 (바리스타 작업대) — PRD.md 6장 · docs/recipes.md
 *
 * 흐름(손님 한 명마다): 주문 받기 → 레시피 고르기(카운터에서 컵 · 재료 · 온도) → 손 동작 → [드리기] → 손님 반응
 *  - 주문 받기(2026-10-31 사용자 "종이컵인지 머그컵인지, 테이크아웃인지 대화가 없다"): 손님 말 아래 주문 메모(메뉴 · 온도 · 매장/포장).
 *    손님이 말하지 않은 칸은 '?'이고, 학생이 묻는 말 단추를 누르면 지은이 묻고 손님이 대답함. 다 채우면 [주문 확인] = 지은이 주문을 되풀이
 *    컵은 매장/포장 × 온도(menu.js 의 SERVICE_CUP): 드시고 가요 = 머그컵 · 유리컵, 가져가요 = 종이컵 · 플라스틱 컵
 *  - 손님은 왼쪽 위 말풍선, 작업대는 카운터 한 장면. 대화창은 가려 둠(body.brew-open)
 *  - 레시피와 다르게 고르면 손 동작 없이: 휘리릭 고른 대로 만든 잔 → 무엇이 다른지 + [버리기] → 버리는 장면 → 처음부터 다시(실수로 셈, 2026-11-04 사용자).
 *    손 동작(블렌더 한 컷)은 레시피대로 고른 잔에만: 틀린 잔에 쓰면 고른 컵과 다른 장면이 나왔음(흰 머그를 골랐는데 아이스 유리컵)
 *  - 손님이 마음을 바꿈(orders[].change, 2026-11-04 사용자): [드리기] 순간 "가져갈게요" → 가져가는 컵을 고름(틀리면 컵 규칙 · 다시) → 옮겨 담는 장면 → 그 컵으로 [드리기].
 *    음료는 같아 버리지 않고 옮김: 옮겨 담기는 '내 실수 고치기'가 아니라 '손님 요청에 맞추기'(검수 13.43 · 13.45)
 *  - 손 동작이 칸을 벗어나면 그 자리에서 학생이 고름: [다시 하기](그 동작만 다시) / [이대로 하기]
 *  - 감점·실패 화면·무서운 소리 없음. [레시피 수첩](오픈북: 컵 고르기 규칙 · 메뉴 · 단골의 평소 주문)은 언제든 열 수 있고, 열려 있는 동안 멈춤
 * 손 동작(menu.js 의 HAND_SKILLS.act, docs/recipes.md 2장):
 *  - hold(A): [누르고 있기](또는 장면 그림)를 누르는 동안만 띠가 차오르고, 손을 떼면 그 칸으로 정함. 아주 짧게 누르면 처음부터
 *  - 모든 손 동작에서 장면 그림 = 단추: 꾹 = [누르고 있기] · 톡 = [지금!] · [톡] · [담기] … · 턴 방식은 톡 = [한 칸] · [기다리기]. [시작!] 창은 카드 밖을 눌러도 시작
 *  - wait(G): 띠가 저절로 차오름. [지금!]을 누르면 정함(일찍 = 낮은 칸 · 늦게 = 높은 칸). 끝까지 기다리면 높은 칸
 *  - circle(B): [누르고 있기](저절로 돎) 또는 장면 위에 손가락으로 원을 그리면 바퀴가 돎. 알맞은 바퀴(laps)에서 떼면 알맞아요
 *  - beats(D): 동그라미가 줄어들어 가운데 원과 겹칠 때 누르기를 n 번. 빠르면 높은 칸 · 늦으면 낮은 칸
 *  - 띠에 글자 칸(연해요 · 알맞아요 · 써요)이 있어 색만으로 알리지 않음. 알맞아요 칸 가운데에서 정하면 '딱 좋아요!'(반짝임·소리만)
 *  - 빠르기는 설정 '시간 제한'(arcade.pace): 보통 · 넉넉히(2배 천천히) · 두 번 눌러 고르기(1.5배). 끄기·자동 스캔은 턴 방식([한 칸] · [기다리기] + [멈추기] · [지금!])
 *  - [시작!]을 눌러야 움직임. 언제든 [보기]: 저절로 알맞게 해 줌(보기로 기록, 실수 아님)
 *  - 단계(opts.level): easy = 손 동작을 모두 보기로 · normal = 직접 · barista = 거품까지 직접 + 라테아트(하트) + 알맞아요 칸이 조금 좁음
 * 옵션: { title, orders: [{ who, say, menu, temp?, togo?, ask?: ['temp','togo'], reply?, cup?, usual?, ticket?, count?, more?, thanks?, miss? }], level, quit, book?: [메뉴 id], pantry?, maker?, setOut? }
 *  - setOut: 'owner' = 사장님이 컵을 꺼내 둔 장면(봄 5일 촬영 팀 주문): 주문마다 그 주문에 맞는 컵이 금색 둥근 테두리 + '사장님이 꺼내 둠' 표로 보임(그 컵을 받침에 놓으면 사라짐, 다른 컵을 골라도 남음).
 *    대본이 '사장님이 컵을 꺼내 주셨다'고 하는데 카운터에 아무 표시가 없었음(2026-11-07 사용자, 검수 13.75). 읽어 줄 이름에도 '사장님이 꺼내 둔 컵'(원칙 11)
 *  - maker: 'owner' = 사장님이 내리는 장면(학생은 도구만 챙김). [만들기 시작]에서 사장님이 먼저 살펴, 레시피가 다르면 만들지 않고 부드럽게 일러 줌
 *    ("재료가 조금 부족하네요." 등, 2026-11-01 사용자: 잘못 고른 재료로 사장님이 무언가를 만드는 건 이상함). 손 띠에 빠진 재료 · 빼요 표시가 고칠 때까지 남음
 *  - usual: 단골의 '늘 먹던 거'(메뉴를 말하지 않음. 수첩의 단골 쪽에 평소 주문) · ticket: 말로 설명한 주문(주문 메모에 메뉴 이름 대신, 예 '달게 한 잔')
 *  - count: 손님이 말한 잔 수(주문 확인이 '두 잔'으로) · more: 앞 주문의 다음 잔(주문 확인이 '한 잔 더'로). 잔은 한 주문에 하나씩 만듦
 *  - miss: 손 동작이 벗어난 잔을 받을 때 그 손님만의 말
 *  - change: { say, thanks?, sfx? } 매장(togo: false)으로 받은 주문을 드리려는 순간 가져가기로 바꿈(say = 손님이 바꾸는 말, thanks = 받을 때 말, sfx = 그 말 바로 앞의 소리: 버스가 들어옴 등)
 * 돌려줌: { ok, attempts(엔진 약속: 늘 1), served(드린 잔), mistakes(레시피가 틀린 잔), remakes, kept, ms, made: [메뉴 id], cups: [{ who, menu, temp }], watched, skills, art, level, turn, asked(물어본 수) }
 *  - 도중에 정리되면(되감기·나가기) { ok: false, aborted: true, … } · [그만하기]면 { ok: false, quit: true, … }
 * 그림: 물건 그림(assets/objects)이 있으면 쓰고, 없으면 아래 임시 그림(SVG, 대체 요망: docs/requests_full.md). 작업대 배경은 bg/workbench_morning
 *  - 손 동작의 한 컷(Q-R9): assets/shots/ 에 그 손 동작의 배경판·프레임이 있으면 작업대 칸을 그 장면으로 채우고(shotView),
 *    띠 값에 맞는 단계의 프레임(줄기·김 있음/없음)을 겹침. 지금은 샷 내리기(extract: 잔이 참)·우유 데우기(steam: 피처 속 우유 + 온도계 바늘 + 김)·
 *    붓기(pour_milk 빈 머그에 우유 · pour_latte 에스프레소에 우유, 바리스타 단계에서 알맞으면 하트)·거품 내기(foam: 피처 속 우유가 부풀어 오름)·
 *    물 붓기(water: 에스프레소가 든 머그에 드립 주전자로 뜨거운 물, 크레마가 흩어짐). 물 붓기는 이 브랜치에서 손 동작(누르고 떼기)이라
 *    띠와 함께 차오르고, 저절로 붓는 경우(autoStep)에는 띠 · 단추 없는 확대 창에서 저절로 차오름(autoShot). 컷이 없으면 임시 그림
 *    유리컵(매장 · 아이스)은 얼음 담기(ice: 박자마다 얼음이 쌓임) · 찬물 붓기(water_glass) · 찬 우유 붓기(pour_glass_milk · pour_glass_latte).
 *    어떤 컷을 쓸지는 shotIdFor(잔 · 온도 · 안에 든 것, 이름 규칙은 menu.js 의 shotNames 주석과 docs/recipes.md 6.7)
 *    만드는 법은 tools/blender/scene_bench.py(shots) → shots_post.py
 * 자동 플레이(?debug): window.__mgAuto(모두 알맞게, { miss: n } 이면 손 동작을 n 번 넘치게 → [다시 하기], keep: true 면 [이대로 하기], stopAt: 단계 이름이면 거기서 멈춤)
 *  · window.__mgBad(레시피를 한 번 틀리게: 바탕 재료를 바꿈)
 * 데이터(메뉴·재료·손 동작·손님 반응)는 js/data/menu.js
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio, SFX_NAMES } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { img } from '../../core/assets.js';
import { input } from '../../core/input.js';
import { bus } from '../../core/bus.js';
import { store } from '../../core/store.js';
import { CHARS, faceHTML, voiceOf } from '../../data/characters.js';
import { vfx, centerOf } from '../../ui/vfx.js';
import { frame, line, abortGeneration, abortMinigame, timingOf } from './frame.js';
import { pace, loop, isDebug } from './arcade.js';
import {
  LEVELS, CUPS, INGREDIENTS, TEMPS, HAND_SKILLS, RECIPES, LATTE_ART, STARTER_BOOK, PANTRY, STEP_NAMES, MAX_ADDS,
  SERVICES, COLORS, ASK_SAY, CUP_RULE,
  orderTarget, findMenu, compareRecipe, prepSteps, recipeSpeech, orderProblems, skillInLevel, sameSet,
  orderTemp, orderService, orderAsk, cupFor, POURIN_SAY, replyOf, repeatBack, drinkName, skillFor,
  ODD_DRINKS, ODD_ANY, ODD_FIRST, findOdd,
  TODAY_SAY, todayTags, lackOf, todayLines, shotNames, TILT_SKILLS, KID_CUP,
} from '../../data/menu.js';
import { REGULARS } from '../../data/regulars.js';
import * as grow from '../../core/grow.js';
import { josa } from '../../core/text.js';

const TITLE = '커피 만들기';
const HOWTO = '주문을 듣고 레시피대로 만들어요. 다 만들면 손님에게 드려요.';
const STEPS = 8;        // 턴 방식: 띠 한 칸 = 1/8 (알맞아요 칸에 두 칸이 들어감, menu.js 의 zone)
const RUN_MS = 4800;    // 실시간: 띠가 끝까지 가는 시간(보통). 알맞아요 칸(1/4)을 지나는 데 약 1.2초 · 넉넉히는 2배
const WAIT_MS = 4400;   // 기다렸다 누르기(wait): 띠가 저절로 끝까지 가는 시간(손 동작마다 ms)
const LAP_MS = 640;     // 원 그리기(circle): 누르고 있을 때 한 바퀴 시간
const DRAW_START = 0.5; // 원 그리기: 장면을 누른 손가락이 이만큼(라디안) 돌면 그리기, 그 전에는 꾹 누르기(저절로 돎)
const BEAT_MS = 1500;   // 박자(beats): 동그라미 하나가 줄어드는 시간(가운데 원과 겹치는 때 = BEAT_HIT)
const BEAT_HIT = 0.72;  // 박자: 겹치는 때(0~1) · 판정 칸은 ±BEAT_WIN
const BEAT_WIN = 0.1;
const WATCH_MS = 2000;  // [보기]: 띠가 처음부터 끝까지 가는 빠르기(알맞아요 칸 가운데에서 멈춤)
const HOLD_MIN = 0.06;  // 실시간: 이보다 짧게 누르고 떼면 실수로 톡 누른 것으로 봄(보통 약 0.3초)
const NARROW = 0.8;     // 바리스타 단계: 알맞아요 칸을 가운데로 80%(docs/recipes.md '판정 칸 좁게')
/** 재료를 컵에 넣는 손 동작(그 뒤부터 컵에 있음): 샷 내리기 · 붓기 · 물 붓기 · 청 떠 넣기 · 가루 떠 넣기 · 시럽. 데우기 · 젓기 같은 것은 넣지 않음 */
const PUT_IN = new Set(['extract', 'pour', 'water', 'jam', 'powder', 'syrup']);

/** 단계마다 읽어 주는 말 */
const PROMPT = {
  order: '주문을 다 들었나요? 모르는 것은 손님에게 물어봐요.',
  orderDone: '주문을 다 들었어요. 주문 확인을 눌러 한 번 더 말해요.',
  cup: '카운터에서 알맞은 컵을 찾아 눌러요.',
  base: '컵에 넣을 재료를 찾아 눌러요.',
  adds: '더 넣을 재료가 있으면 눌러요. 다 넣었으면 [만들기 시작]을 눌러요.',
  temp: '온도를 바꾸려면 [따뜻하게]를 눌러요. 얼음을 눌러도 차갑게 돼요.',
  confirm: '레시피를 다 골랐어요. 이대로 만들까요?',
  serve: '다 만들었어요. 손님에게 드려요.',
  mild: '다시 만들어도 되고, 그대로 드려도 돼요.',
};
/** 손님 말 (주문마다 orders[].thanks · miss, 메뉴마다 menu.js 의 thanks · artThanks) */
const SAY = {
  wrong: '이건 제가 주문한 게 아니네요.',
  usualWrong: '이건 제가 늘 먹던 게 아니네요.',
  wait: '네, 기다릴게요.',
  accept: '괜찮아요. 잘 마실게요.',
  thanks: '맛있어요. 고마워요.',
  yes: '네, 맞아요.',
};
/** 레시피가 틀렸을 때 다시 볼 곳 */
const HINT = {
  cup: '컵을 다시 봐요.',
  base: '컵에 넣은 재료를 다시 봐요.',
  adds: '컵에 넣은 재료를 다시 봐요.',
  temp: '온도를 다시 봐요.',
  book: '레시피 수첩을 봐도 좋아요.',
  usual: '단골의 평소 주문은 레시피 수첩의 단골 쪽에 있어요.',
};
/** 컵이 틀렸을 때: 매장/포장 × 온도의 규칙을 한 줄로 */
const CUP_HINT = {
  'here|hot': '드시고 가는 따뜻한 음료는 머그컵에 담아요.',
  'here|iced': '드시고 가는 차가운 음료는 유리컵에 담아요.',
  'togo|hot': '가져가는 따뜻한 음료는 종이컵에 담아요.',
  'togo|iced': '가져가는 차가운 음료는 플라스틱 컵에 담아요.',
  fixed: '이 손님에게는 정해진 컵이 있어요.',
};
const TEMP_HINT = { hot: '손님은 따뜻한 걸 주문했어요.', iced: '손님은 아이스를 주문했어요.' };
const SYS = {
  book: '레시피 수첩이에요. 메뉴를 누르면 읽어 줘요.',
  watch: '잘 봐요. 알맞아요 칸에서 멈춰요.', // [보기]: 띠가 보일 때(턴 방식 · 도움 많이 · 쉬운 길)
  watchCue: '잘 봐요. 화면에 "지금!"이 뜨면 멈춰요.', // 띠가 숨겨져 있을 때(실시간 기본, 2026-11-05 사용자 "설명이 게이지가 나오는 것처럼")
  watchBeat: '잘 봐요. 동그라미가 가운데 원에 겹칠 때 눌러요.', // 박자(얼음 · 시럽 · 청 · 가루 · 톡톡)
  watchScoop: '잘 봐요. 얼음을 떠서 컵 위에 놓아요.', // 드래그 활용의 얼음 담기
  turn: '[한 칸]을 누르면 띠가 한 칸 움직여요.',
  turnWait: '[기다리기]를 누르면 띠가 한 칸 움직여요.',
  full: '재료는 세 가지까지 넣을 수 있어요.',
  art: '하트가 생겼어요!',
  done: '주문을 모두 만들었어요!',
  holdShort: '조금 더 꾹 누르고 있어요.',
  perfect: '딱 좋아요!',
  temp: '따뜻하게 할까요, 차갑게 할까요?',
  retry: '다시 해 볼까요? 이대로 해도 괜찮아요.',
  again: '좋아요. 다시 해 봐요.',
  early: '빨라요',
  late: '늦어요',
  beatGood: '좋아요',
  drag: '손가락으로 원을 그려도 돼요.',
  dragTilt: '그릇을 누른 채 아래로 끌어요. 많이 끌수록 많이 기울어요.',
  dragPress: '탬퍼를 누른 채 아래로 끌어요.',
  scoopHere: '얼음 통을 눌러 얼음을 떠요.',
  scoopDrop: '얼음은 컵 위에 놓아요. 다시 해 봐요.',
  seeFirst: '처음 하는 일이면 [보기]로 먼저 봐도 좋아요.',
  // 지은의 성장(재미 개편 6장): 익숙해진 손 기술 맡기기 · 완벽한 한 잔 · 한 번에 묻기 · 늘 드시던 거
  handoff: '익숙한 일이라 손이 알아서 해요.',
  perfectCup: '완벽한 한 잔이에요! 메뉴 도감에 금빛 별이 붙었어요.',
  usualFill: '늘 드시던 걸로 담았어요.',
  taste: '사장님이 한 모금 맛보세요.',
  odd: '엉뚱한 잔 도감에 올렸어요.',
  oddAgain: '이 잔은 전에도 맛보셨어요.',
  // 레시피와 다르게 골랐을 때(2026-11-04 사용자): 휘리릭 만든 뒤 버리고 다시
  making: '고른 대로 만들어요.',
  wrongMade: '앗, 주문과 다르게 만들었어요.',
  toss: '이 잔은 버리고 다시 만들어요. [버리기]를 눌러요.',
  tossWash: '개수대에 쏟고, 컵은 씻어요.',
  tossBin: '개수대에 쏟고, 다 쓴 컵은 쓰레기통에 버려요.',
  remake: '이제 다시 만들어요. 주문 메모를 보고 컵부터 골라요.',
  // 손님이 마음을 바꿈: 매장 → 가져가기(2026-11-04 사용자 "Add that scene")
  changeTell: '손님이 가져가신대요. 가져가는 컵을 골라 옮겨 담아요.',
  move: '새 컵에 옮겨 담고 뚜껑을 덮어요. 쓴 컵은 씻어요.',
  moveServe: '다 옮겨 담았어요. 손님에게 드려요.',
};
/** 휘리릭 글자(화면에만, 소리는 효과음) · 버리는 장면의 컵 종류(영상 assets/movies/discard_{종류}) */
const WHIRL_WORD = '휘리릭!';
const TOSS_KIND = { mug: 'mug', thick: 'mug', shot: 'glass', glass: 'glass', paper: 'paper', plastic: 'plastic' };
/**
 * 버리는 영상의 효과음 때(초): 블렌더 장면에서 잰 것(tools/blender/scene_bench.py discard 가 '사건(초)'로 알려 줌, 검수 13.67).
 * 영상을 다시 만들면 그 숫자로 맞춤. 쏟기 pour · 얼음이 개수대 바닥에 ice · 뚜껑이 쓰레기통에 tap · 잔이 건조대에 clink · 쓰레기통에 stack
 */
const TOSS_CUES = {
  mug: [[0.9, 'pour'], [1.5, 'water'], [4.6, 'clink']],
  glass: [[1.0, 'pour'], [1.6, 'water'], [2.2, 'ice'], [4.6, 'clink']],
  paper: [[1.6, 'tap'], [1.95, 'pour'], [2.6, 'water'], [4.8, 'stack']],
  plastic: [[1.6, 'tap'], [2.0, 'pour'], [2.6, 'water'], [3.05, 'ice'], [4.8, 'stack']],
};
/**
 * 옮겨 담는 영상(assets/movies/move_{매장 잔}_{포장 컵}, 블렌더 tools/blender/scene_bench.py … move, 검수 13.79): 이야기의 두 장면만 있음 →
 * 음료(drink: 주문 메뉴)가 같을 때만 틀고, 아니면 그림 움직임. cues: 효과음 때(초, 렌더가 알려 주는 '사건(초)')
 */
const MOVE_MOVIES = {
  glass_plastic: { drink: 'americano', cues: [[1.1, 'pour'], [2.4, 'ice'], [4.15, 'clink'], [4.9, 'tap'], [5.4, 'tap']] }, // 봄 6일 아아
  mug_paper: { drink: 'latte', cues: [[0.95, 'pour'], [4.15, 'clink'], [4.9, 'tap']] }, // 겨울 1일 따뜻한 라테
};
/** 손 기술에 처음 익숙해졌을 때 지은의 말(재미 개편 6.2) */
const mastered = (sk) => `이제 ${josa(sk.name, '은/는')} 눈 감고도 할 수 있겠다.`;
/** 박자 동작의 단추 이름 */
const BEAT_BTN = { ice: '담기', syrup: '펌프', jam: '떠 넣기', powder: '떠 넣기', tap: '톡' };

/** 옵션이 없을 때(자유 영업 시험·음성 목록) */
export const DEFAULT_ORDERS = [
  { who: 'customer', say: '아메리카노 한 잔 주세요.', menu: 'americano', temp: 'iced', togo: true, ask: ['temp', 'togo'] },
  { who: 'grandma', say: '따뜻한 우유 한 잔 줄래요?', menu: 'warm_milk', temp: 'hot', ask: ['togo'] },
  { who: 'student', say: '라테 한 잔 주세요.', menu: 'latte', temp: 'hot', ask: ['temp', 'togo'] },
];

const ordersOf = (opts) => (Array.isArray(opts.orders) && opts.orders.length ? opts.orders : DEFAULT_ORDERS);
const levelOf = (opts) => (LEVELS.includes(opts.level) ? opts.level : 'normal');
const speechOf = (opts) => opts.speech || `${opts.title || TITLE}. ${HOWTO}`;
const thanksOf = (o) => o.thanks || RECIPES[o.menu]?.thanks || SAY.thanks;
/** 손 동작 설명: 실시간은 누르고 떼기(howto), 턴 방식은 [한 칸]·[멈추기](howtoTurn), 조작법 '드래그 활용'은 끌기(howtoDrag) */
// cue: 실시간 손 기술의 띠가 숨겨져 있음(기본). 그때는 띠의 '알맞아요 칸' 대신 화면에 뜨는 "지금!"을 말함(menu.js 의 howtoCue, 검수 13.39 17번)
const howtoOf = (sk, turn, drag = false, cue = false) => (turn && sk.howtoTurn) || (drag && ((cue && sk.howtoDragCue) || sk.howtoDrag)) || (cue && sk.howtoCue) || sk.howto;
const skillSpeech = (sk, turn = false, drag = false, cue = false) => `${sk.name}. ${howtoOf(sk, turn, drag, cue)}`;
/** 아이 잔(orders[].kid, menu.js KID_CUP): 우유 데우기의 알맞아요 칸을 낮추고, 설명마다 앞에 '아이가 마시는 잔이에요…' 한 줄 */
function kidSkill(s) {
  const pre = (t) => (t ? `${KID_CUP.note} ${t}` : t);
  return { ...s, zone: KID_CUP.zone, react: KID_CUP.react, howto: pre(s.howto), howtoTurn: pre(s.howtoTurn), howtoCue: pre(s.howtoCue), howtoDrag: pre(s.howtoDrag), howtoDragCue: pre(s.howtoDragCue) };
}
// 조작법 '드래그 활용'(설정 control, 2026-11-02 사용자 "물건을 직접 끌어 다루는 조작부터, 블랜더도 활용하라"). 끌어 붓는 손 동작은 menu.js 의 TILT_SKILLS
const POUR_AT = 0.42;   // 끌어 붓기: 이만큼(장면 높이의 TILT_PULL 에 대한 비율) 끌면 붓기 시작, 더 끌수록 빨리
const TILT_PULL = 0.5;  // 끌어 붓기: 장면 높이의 이만큼 끌면 가장 많이 기욺
const PRESS_PULL = 0.55; // 끌어 누르기(탬핑): 장면 높이의 이만큼 끌면 끝까지 눌림
/** 주문 메모의 메뉴 칸: 단골의 '늘 먹던 거'는 메뉴 이름을 보이지 않음 */
const menuLabel = (o) => (o.usual ? '늘 드시던 것' : drinkName(o.menu, orderTemp(o)));
/** 컵이 틀렸을 때 읽어 줄 말 */
const cupHintOf = (o) => (o.cup || RECIPES[o.menu]?.cup ? CUP_HINT.fixed : CUP_HINT[`${orderService(o)}|${orderTemp(o)}`]);
/** 이 주문을 만들 때 하는 손 동작(손님 반응 말을 모으려고) */
const orderSkills = (o, level) => {
  const t = orderTarget(o);
  return t ? prepSteps(t, level).filter((x) => x.skill).map((x) => x.skill) : [];
};

/** 레시피 수첩의 메뉴: 정한 목록(없으면 처음 메뉴) + 주문에 나오는 메뉴 */
function bookOf(opts) {
  const ids = [...(opts.book || STARTER_BOOK), ...ordersOf(opts).map((o) => o.menu)];
  return [...new Set(ids)].filter((id) => RECIPES[id]);
}

/** 작업대에 놓을 것: 기본(또는 opts.pantry) + 주문을 만들 수 있게 주문 레시피에 든 것 */
function pantryOf(opts) {
  const src = { ...PANTRY, ...(opts.pantry || {}) };
  const p = { cups: [...src.cups], bases: [...src.bases], adds: [...src.adds], temps: [...src.temps] };
  const put = (list, id) => { if (!list.includes(id)) list.push(id); };
  // 오늘의 칠판(얼음 · 우유가 모자람): 떨어지면 손님에게 권하는 메뉴의 재료 · 컵도 미리 놓아 둠
  // (2026-11-05: 우유가 떨어져 코코아 대신 유자차를 권했는데 카운터에 유자청이 없어 만들 수 없었음)
  const t0 = opts.today;
  const swaps = (o) => (!t0 ? [] : [
    t0.milk !== undefined && lackOf(o, { milk: 0 }),
    t0.ice !== undefined && lackOf(o, { ice: 0 }),
    t0.milk !== undefined && t0.ice !== undefined && lackOf(o, { milk: 0, ice: 0 }),
  ].filter(Boolean).map((l) => l.order));
  for (const o of ordersOf(opts).flatMap((x) => [x, ...swaps(x)])) {
    const t = orderTarget(o);
    if (!t) continue;
    put(p.cups, t.cup);
    if (o.change) put(p.cups, orderTarget({ ...o, togo: true }).cup); // 가져가기로 바뀌는 주문의 포장 컵
    put(p.bases, t.base);
    t.adds.forEach((a) => put(p.adds, a));
    put(p.temps, t.temp);
  }
  p.cups = p.cups.filter((id) => CUPS[id]);
  p.bases = p.bases.filter((id) => INGREDIENTS[id]?.roles.includes('base'));
  p.adds = p.adds.filter((id) => INGREDIENTS[id]?.roles.includes('add'));
  p.temps = p.temps.filter((id) => TEMPS[id]);
  return p;
}

/** 읽어 주는 문장 목록 (tools/export-lines.mjs 가 mini('brew', 옵션) 비트마다 부름. 옵션 없이 부르면 기본 주문) */
export function brewLines(opts = {}) {
  const orders = ordersOf(opts);
  const level = levelOf(opts);
  const pantry = pantryOf(opts);
  const out = [line.sys(speechOf(opts)), line.sys(HOWTO)];
  for (const t of [...Object.values(PROMPT), ...Object.values(HINT), ...Object.values(SYS), ...Object.values(CUP_HINT), ...Object.values(TEMP_HINT), CUP_RULE]) out.push(line.sys(t));
  // 고를 때 읽어 주는 이름
  for (const id of pantry.cups) out.push(line.sys(CUPS[id].name));
  for (const id of new Set([...pantry.bases, ...pantry.adds])) out.push(line.sys(INGREDIENTS[id].name));
  for (const id of pantry.temps) out.push(line.sys(TEMPS[id].name));
  // 레시피 수첩: 메뉴 · 사장님 메모 · 단골의 평소 주문
  for (const id of bookOf(opts)) {
    out.push(line.sys(recipeSpeech(id)));
    if (RECIPES[id].note) out.push(line.sys(RECIPES[id].note));
  }
  for (const r of Object.values(REGULARS)) if (r.usual?.say) out.push(line.sys(r.usual.say));
  // 손 동작: 시작 설명 · 안전 · 띠 글자, 손 동작 없이 넣는 재료
  for (const sk of Object.values(HAND_SKILLS)) {
    out.push(line.sys(skillSpeech(sk)), line.sys(skillSpeech(sk, true)));
    if (sk.howtoDrag) out.push(line.sys(skillSpeech(sk, false, true)));
    if (sk.howtoCue) out.push(line.sys(skillSpeech(sk, false, false, true)));
    if (sk.howtoDragCue) out.push(line.sys(skillSpeech(sk, false, true, true)));
    if (sk.safety) out.push(line.sys(sk.safety));
    for (const t of Object.values(sk.labels)) out.push(line.sys(t));
  }
  // 아이 잔(자유 영업 칠판 '아이 손님'): 우유 데우기 설명 · 손님 반응 · 주문 메모
  if (opts.orders?.some((o) => o.kid)) {
    const kid = kidSkill(HAND_SKILLS.steam);
    out.push(line.sys(skillSpeech(kid)), line.sys(skillSpeech(kid, true)), line.sys(skillSpeech(kid, false, false, true)), line.sys(KID_CUP.ticket), line.sys(KID_CUP.ticketValue));
    for (const t of Object.values(KID_CUP.react)) out.push(line.say('customer', t));
  }
  // 레시피와 다를 때 다시 볼 곳(wrongHint 의 ingSay)과 사장님이 살펴 일러 주는 말(ownerCheck): 문장마다 따로 음성 파일.
  // 두 문장을 이어 읽어도 tts 가 문장마다 나눠 이 파일들로 읽음(검수 13.63: 통째로는 파일이 없어 브라우저 음성이었음)
  for (const id of new Set([...pantry.bases, ...pantry.adds])) {
    const name = INGREDIENTS[id].name;
    out.push(line.sys(`${josa(name, '이/가')} 빠졌어요.`), line.sys(`${josa(name, '은/는')} 빼요.`));
  }
  if (opts.maker === 'owner') {
    for (const t of ['재료가 조금 다르네요.', '재료가 조금 부족하네요.', '재료가 좀 많네요.', '차갑게 드신답니다.', '따뜻하게 드신답니다.', '손님은 가져가신답니다.', '손님은 여기서 드시고 가신답니다.']) out.push(line.say('owner', t));
    for (const id of pantry.cups) out.push(line.say('owner', `이건 ${CUPS[id].name}에 내요.`));
  }
  for (const ing of Object.values(INGREDIENTS)) for (const t of Object.values(ing.auto || {})) out.push(line.sys(t));
  for (const t of Object.values(TEMPS)) if (t.auto) out.push(line.sys(t.auto));
  for (const t of Object.values(POURIN_SAY)) out.push(line.sys(t)); // 옮겨 붓기(검수 13.81)
  // 지은의 성장: 처음 익숙해진 손 기술의 한마디 · 엉뚱한 잔(사장님의 맛보기)
  for (const sk of Object.values(HAND_SKILLS)) out.push(line.say('jieun', mastered(sk)));
  out.push(line.say('owner', ODD_FIRST.owner), line.say('jieun', ODD_FIRST.jieun), line.say('owner', ODD_FIRST.joke));
  for (const o of [...ODD_DRINKS, ODD_ANY]) out.push(line.say('owner', o.say), line.sys(`「${o.name}」 ${SYS.odd}`));
  // 오늘의 칠판(today): 떨어졌다는 알림 · 지은이 사정을 말하고 권하는 말(손님 대답은 주문마다 아래)
  for (const t of todayLines()) out.push(t.startsWith('죄송해요') ? line.say('jieun', t) : line.sys(t));
  // 주문 받기: 지은이 묻는 말 · 손님의 대답 · 주문 확인(되풀이) · "네, 맞아요."
  // 손님 말: 주문 · 고마움 · 레시피가 틀렸을 때 · 다시 만들 때 · 그대로 받을 때 · 손 동작이 칸을 벗어났을 때
  for (const o of orders) {
    const r = RECIPES[o.menu];
    out.push(line.say(o.who, o.say), line.say(o.who, thanksOf(o)), line.say(o.who, o.usual ? SAY.usualWrong : SAY.wrong), line.say(o.who, SAY.wait), line.say(o.who, SAY.accept), line.say(o.who, SAY.yes));
    out.push(line.say(o.who, TODAY_SAY.okHot), line.say(o.who, TODAY_SAY.okSwap));
    for (const k of orderAsk(o)) out.push(line.say('jieun', ASK_SAY[k]), line.say(o.who, replyOf(o, k)));
    out.push(line.say('jieun', repeatBack(o)), line.sys(cupHintOf(o)), line.sys(TEMP_HINT[orderTemp(o)]));
    if (o.miss) out.push(line.say(o.who, o.miss));
    if (o.change) out.push(line.say(o.who, o.change.say), line.say(o.who, o.change.thanks || thanksOf(o)), line.sys(cupHintOf({ ...o, togo: true })));
    if (!r) continue;
    if (level === 'barista' && r.artThanks) out.push(line.say(o.who, r.artThanks));
    for (const s of orderSkills(o, level)) for (const t of Object.values(HAND_SKILLS[s].react)) out.push(line.say(o.who, t));
  }
  const seen = new Set();
  return out.filter((l) => {
    const k = `${l.t}|${l.who || ''}|${l.text}`;
    if (!l.text || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** mini('brew', 옵션) 검사(시나리오 검사 도구용): 문제 글 목록, 없으면 빈 목록 */
export function brewProblems(opts = {}) {
  const errs = [];
  if (opts.level !== undefined && !LEVELS.includes(opts.level)) errs.push(`level 은 ${LEVELS.join(' · ')} 가운데 하나`);
  if (opts.maker !== undefined && opts.maker !== 'owner') errs.push("maker 는 'owner'(사장님이 내리는 장면)만");
  if (opts.setOut !== undefined && opts.setOut !== 'owner') errs.push("setOut 은 'owner'(사장님이 컵을 꺼내 둔 장면)만");
  if (!Array.isArray(opts.orders) || !opts.orders.length) errs.push('orders(주문 목록)가 비어 있음');
  (opts.orders || []).forEach((o, i) => {
    for (const e of orderProblems(o)) errs.push(`orders[${i}] ${e}`);
    if (o.who && !CHARS[o.who]) errs.push(`orders[${i}] 없는 인물: ${o.who} (js/data/characters.js)`);
    if (o.usual && REGULARS[o.who]?.usual?.menu !== o.menu) errs.push(`orders[${i}] usual: ${o.who} 의 평소 주문(regulars.js usual.menu)과 메뉴가 다름`);
    if (o.change && !o.change.say) errs.push(`orders[${i}] change: say(손님이 가져가기로 바꾸는 말)가 없음`);
    if (o.change?.sfx && !SFX_NAMES.includes(o.change.sfx)) errs.push(`orders[${i}] change: 없는 효과음 ${o.change.sfx} (js/av/audio.js SFX_NAMES)`);
    if (o.change && (o.togo !== false || o.cup || RECIPES[o.menu]?.cup || o.count > 1 || o.more)) errs.push(`orders[${i}] change: 매장(togo: false)에서 받은 한 잔에만(정해진 컵 · 여러 잔은 안 됨)`);
  });
  for (const id of opts.book || []) if (!RECIPES[id]) errs.push(`book: 없는 메뉴 ${id}`);
  const table = { cups: CUPS, bases: INGREDIENTS, adds: INGREDIENTS, temps: TEMPS };
  for (const [k, list] of Object.entries(opts.pantry || {})) {
    if (!table[k]) errs.push(`pantry: 모르는 칸 ${k} (cups · bases · adds · temps)`);
    else for (const id of list || []) if (!table[k][id]) errs.push(`pantry.${k}: 없는 것 ${id}`);
  }
  return errs;
}

/* ================================================================== */
/* 임시 그림 (SVG): 물건 그림(assets/objects)이 오면 저절로 바뀜              */
/* 같은 시점(앞에서 조금 위)·같은 빛(왼쪽 위)으로 그린 단순한 모양               */
/* ================================================================== */
let gidN = 0;
const gid = (p) => `bw${p}${(gidN += 1)}`; // 그림마다 다른 그라데이션 id(같은 id 가 여러 개면 지워진 그림을 따라가 깨짐)
const SHADOW = '<ellipse cx="60" cy="109" rx="34" ry="6" fill="#3B2A1A" opacity=".18"/>';
const svgBox = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
const svg = (body) => svgBox('0 0 120 120', body);
/** 둘레 여백을 줄인 그림(작은 병 · 통 · 플라스틱 컵): 그림 파일처럼 물건이 칸을 꽉 채움 */
const svgT = (body) => svgBox('24 2 72 110', body);
const grad = (id, [a, b, c], vertical = false) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
const EYE = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 32q26-30 52 0-26 30-52 0z"/><circle cx="32" cy="32" r="9"/></svg>';

/** 두 색 섞기(#RRGGBB) */
function mix(a, b, t) {
  const p = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** 김(따뜻함): 물결선 n 개(0~3). 움직이지 않음 */
function steamLines(n, cx, top) {
  return [-13, 0, 13].slice(0, n).map((dx) => `<path d="M${cx + dx} ${top} q-5 -6 0 -11 t0 -11" fill="none" stroke="#A9A096" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('');
}

function mugSVG({ color = null, level = 0.86, foam = null, foamSize = 0.9, art = null, steam = 0, spill = false, thick = false } = {}) {
  const g = gid('m');
  const c = gid('c');
  const body = thick ? ['#FFF6E6', '#EFDFC4', '#C9B28C'] : ['#FFFFFF', '#EEEAE3', '#C6BEB2'];
  const edge = thick ? '#977F5C' : '#8C8478';
  const y = 41 + (1 - level) * 20;
  const rx = 26 - (1 - level) * 3;
  const liquid = color ? `<g clip-path="url(#${c})">
    <ellipse cx="60" cy="${y}" rx="${rx}" ry="7.2" fill="${color}"/>
    ${foam ? `<ellipse cx="60" cy="${y}" rx="${Math.min(rx, (rx - 3) * foamSize)}" ry="${Math.min(7, 5.4 * foamSize)}" fill="${foam}"/>` : ''}
    ${art === 'heart' ? `<path d="M60 ${y + 4.4} C52 ${y}, 53 ${y - 5}, 60 ${y - 1.6} C67 ${y - 5}, 68 ${y}, 60 ${y + 4.4} Z" fill="#FFFDF8"/>` : ''}
  </g>` : '';
  return svg(`<defs>${grad(g, body)}<clipPath id="${c}"><ellipse cx="60" cy="40" rx="${thick ? 24 : 27}" ry="${thick ? 6.5 : 7.5}"/></clipPath></defs>
    ${spill ? `<ellipse cx="64" cy="108" rx="46" ry="7.5" fill="${color || '#C79A6B'}" opacity=".6"/>` : SHADOW}
    <path d="M86 52 C104 50 106 82 84 86" fill="none" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
    <path d="M86 52 C104 50 106 82 84 86" fill="none" stroke="url(#${g})" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 40 L33 96 Q34 106 60 106 Q86 106 87 96 L90 40 Z" fill="url(#${g})" stroke="${edge}" stroke-width="2.5"/>
    <ellipse cx="60" cy="40" rx="30" ry="9" fill="#FBF9F5" stroke="${edge}" stroke-width="2.5"/>
    <ellipse cx="60" cy="40" rx="${thick ? 24 : 27}" ry="${thick ? 6.5 : 7.5}" fill="#E4DCCF"/>
    ${liquid}
    <path d="M38 50 Q39 74 42 94" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${spill ? `<path d="M88 44 q3 10 0 22" stroke="${color || '#C79A6B'}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>` : ''}
    ${steamLines(steam, 60, 28)}`);
}

function glassSVG({ color = null, level = 0.78, ice = false, foam = null } = {}) {
  const c = gid('g');
  const yl = 104 - level * 80;
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 7} ${y + 7})"><rect x="${x}" y="${y}" width="15" height="15" rx="3" fill="rgba(255,255,255,.62)" stroke="#8DB9D0" stroke-width="2"/></g>`;
  return svg(`<defs><clipPath id="${c}"><path d="M37 18 L41 102 Q42 107 60 107 Q78 107 79 102 L83 18 Z"/></clipPath></defs>
    ${SHADOW}
    <g clip-path="url(#${c})">
      ${color ? `<rect x="30" y="${yl}" width="60" height="${110 - yl}" fill="${color}" opacity=".93"/>` : ''}
      ${color && foam ? `<rect x="30" y="${yl - 6}" width="60" height="8" fill="${foam}"/>` : ''}
      ${ice ? `${cube(44, yl - 6, -12)}${cube(60, yl - 2, 10)}${cube(50, yl + 12, 4)}` : ''}
    </g>
    <path d="M37 18 L41 102 Q42 107 60 107 Q78 107 79 102 L83 18" fill="rgba(214,236,248,.3)" stroke="#86A9BD" stroke-width="2.5"/>
    <ellipse cx="60" cy="18" rx="23" ry="5.5" fill="rgba(235,247,255,.55)" stroke="#86A9BD" stroke-width="2.5"/>
    <path d="M45 26 L48 96" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>`);
}

function paperSVG({ steam = 0 } = {}) {
  const g = gid('p');
  return svg(`<defs>${grad(g, ['#FFFFFF', '#F1EEE8', '#CFC8BC'])}</defs>${SHADOW}
    <path d="M36 34 L44 102 Q45 107 60 107 Q75 107 76 102 L84 34 Z" fill="url(#${g})" stroke="#9D958A" stroke-width="2.5"/>
    <path d="M38.6 56 L81.4 56 L79 82 L41 82 Z" fill="#C9A47A" stroke="#A88458" stroke-width="2"/>
    <rect x="32" y="27" width="56" height="9" rx="4" fill="#FAF9F6" stroke="#9D958A" stroke-width="2.5"/>
    <ellipse cx="60" cy="27" rx="25" ry="5" fill="#FFFFFF" stroke="#9D958A" stroke-width="2"/>
    <ellipse cx="69" cy="26" rx="4" ry="1.6" fill="#8C8478"/>
    <path d="M42 40 L47 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    ${steamLines(steam, 60, 18)}`);
}

/**
 * 뚜껑을 연 포장 컵(옮겨 담기 · 버리기 장면, 2026-11-05): 닫힌 뚜껑에 붓거나 쏟지 않게. 그림은 paperSVG · plasticSVG 에서 뚜껑만 뺀 것(자리가 같아 뚜껑을 덮으면 그대로 이어짐)
 * drink: { color, level, ice, foam, steam } 든 음료(없으면 빈 컵)
 */
function openCupSVG(cup, drink = null) {
  const color = drink?.color || null;
  if (cup === 'plastic') {
    const c = gid('po');
    const yl = 104 - (drink?.level || 0.74) * 70;
    return svgT(`<defs><clipPath id="${c}"><path d="M38 36 L44 102 Q45 107 60 107 Q75 107 76 102 L82 36 Z"/></clipPath></defs>${SHADOW}
      <g clip-path="url(#${c})">${color ? `<rect x="30" y="${yl}" width="60" height="${110 - yl}" fill="${color}" opacity=".9"/>` : ''}
        ${color && drink.ice ? `${iceCube(46, yl - 4, -12)}${iceCube(61, yl + 2, 10)}${iceCube(50, yl + 16, 4)}` : ''}</g>
      <path d="M38 36 L44 102 Q45 107 60 107 Q75 107 76 102 L82 36" fill="rgba(226,240,248,.32)" stroke="#8FB3C7" stroke-width="2.5"/>
      <ellipse cx="60" cy="36" rx="22" ry="3.6" fill="none" stroke="#8FB3C7" stroke-width="2.5"/>
      <path d="M44 44 L48 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
  }
  const g = gid('po');
  return svg(`<defs>${grad(g, ['#FFFFFF', '#F1EEE8', '#CFC8BC'])}</defs>${SHADOW}
    <path d="M36 34 L44 102 Q45 107 60 107 Q75 107 76 102 L84 34 Z" fill="url(#${g})" stroke="#9D958A" stroke-width="2.5"/>
    <path d="M38.6 56 L81.4 56 L79 82 L41 82 Z" fill="#C9A47A" stroke="#A88458" stroke-width="2"/>
    <ellipse cx="60" cy="34" rx="24" ry="4.6" fill="${color ? drink.foam || color : '#6E5A48'}" stroke="#9D958A" stroke-width="2.5"/>
    <path d="M42 40 L47 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    ${steamLines(color ? drink.steam || 0 : 0, 60, 24)}`);
}
/** 포장 컵의 뚜껑만(옮겨 담은 뒤 위에서 내려와 덮음): paperSVG · plasticSVG 의 뚜껑과 같은 자리 */
function lidSVG(cup) {
  if (cup === 'plastic') return svgT(`<path d="M36 35 Q60 8 84 35 Z" fill="rgba(235,247,255,.55)" stroke="#8FB3C7" stroke-width="2.5"/>
    <rect x="33" y="32" width="54" height="7" rx="3" fill="rgba(240,250,255,.85)" stroke="#8FB3C7" stroke-width="2"/>
    <path d="M65 24 L77 2" stroke="#2E8B57" stroke-width="5" stroke-linecap="round"/>`);
  return svg(`<rect x="32" y="27" width="56" height="9" rx="4" fill="#FAF9F6" stroke="#9D958A" stroke-width="2.5"/>
    <ellipse cx="60" cy="27" rx="25" ry="5" fill="#FFFFFF" stroke="#9D958A" stroke-width="2"/>
    <ellipse cx="69" cy="26" rx="4" ry="1.6" fill="#8C8478"/>`);
}

function shotSVG({ color = INGREDIENTS.espresso.color, level = 0.8 } = {}) {
  const g = gid('s');
  const c = gid('sc');
  const y = 63 + (1 - level) * 9;
  return svg(`<defs>${grad(g, ['#FFFFFF', '#EDE8E1', '#C5BCAF'])}<clipPath id="${c}"><ellipse cx="60" cy="62" rx="19" ry="5.5"/></clipPath></defs>
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#3B2A1A" opacity=".16"/>
    <path d="M78 70 C90 70 90 86 76 88" fill="none" stroke="#8C8478" stroke-width="9" stroke-linecap="round"/>
    <path d="M78 70 C90 70 90 86 76 88" fill="none" stroke="url(#${g})" stroke-width="5" stroke-linecap="round"/>
    <path d="M39 62 L43 92 Q44 100 60 100 Q76 100 77 92 L81 62 Z" fill="url(#${g})" stroke="#8C8478" stroke-width="2.5"/>
    <ellipse cx="60" cy="62" rx="21" ry="6.5" fill="#FBF9F5" stroke="#8C8478" stroke-width="2.5"/>
    <ellipse cx="60" cy="62" rx="19" ry="5.5" fill="#E4DCCF"/>
    ${color ? `<g clip-path="url(#${c})"><ellipse cx="60" cy="${y}" rx="19" ry="5.5" fill="${color}"/><ellipse cx="60" cy="${y}" rx="14" ry="3.6" fill="#B87A43"/></g>` : ''}
    <path d="M45 70 Q46 82 48 92" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`);
}

function bottleSVG() {
  const g = gid('b');
  return svg(`<defs>${grad(g, ['#FFFFFF', '#F4F1EA', '#D6D0C4'])}</defs>${SHADOW}
    <path d="M48 24 L72 24 L72 32 Q84 40 84 56 L84 100 Q84 106 78 106 L42 106 Q36 106 36 100 L36 56 Q36 40 48 32 Z" fill="url(#${g})" stroke="#98A3AD" stroke-width="2.5"/>
    <rect x="46" y="14" width="28" height="11" rx="3" fill="#3E7CB1" stroke="#2C5D86" stroke-width="2"/>
    <rect x="44" y="64" width="32" height="22" rx="4" fill="#E3EEF7" stroke="#B9CCDC" stroke-width="1.5"/>
    <path d="M42 58 L42 98" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`);
}

function kettleSVG() {
  const g = gid('k');
  return svg(`<defs>${grad(g, ['#F4F7F9', '#C9D1D7', '#8D989F'])}</defs>${SHADOW}
    <path d="M38 96 C26 94 20 70 12 48" fill="none" stroke="#7C868D" stroke-width="8" stroke-linecap="round"/>
    <path d="M38 96 C26 94 20 70 12 48" fill="none" stroke="#DDE3E7" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M34 56 Q34 40 60 40 Q86 40 86 56 L88 98 Q88 106 80 106 L40 106 Q32 106 32 98 Z" fill="url(#${g})" stroke="#7C868D" stroke-width="2.5"/>
    <ellipse cx="60" cy="41" rx="20" ry="5" fill="#E8EDF0" stroke="#7C868D" stroke-width="2"/>
    <circle cx="60" cy="34" r="5" fill="#3A2E26"/>
    <path d="M86 52 C104 52 106 84 88 90" fill="none" stroke="#3A2E26" stroke-width="7" stroke-linecap="round"/>
    <path d="M42 56 Q42 80 44 98" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

function syrupSVG() {
  const g = gid('y');
  return svg(`<defs>${grad(g, ['#EBC072', '#C98A2E', '#8E5A17'])}</defs>${SHADOW}
    <path d="M42 46 Q42 40 48 38 L72 38 Q78 40 78 46 L78 100 Q78 106 72 106 L48 106 Q42 106 42 100 Z" fill="url(#${g})" stroke="#7A4E14" stroke-width="2.5"/>
    <rect x="52" y="27" width="16" height="12" rx="2" fill="#2F2A26"/>
    <rect x="56" y="13" width="8" height="15" rx="2" fill="#2F2A26"/>
    <path d="M58 15 L37 15 L37 21" fill="none" stroke="#2F2A26" stroke-width="5" stroke-linecap="round"/>
    <path d="M48 50 L48 96" stroke="#FCE7BF" stroke-width="4" stroke-linecap="round" opacity=".75"/>`);
}

function machineSVG({ active = false } = {}) {
  const g = gid('mc');
  return svgBox('0 0 160 120', `<defs>${grad(g, ['#F2F5F7', '#C7CFD5', '#8A949B'])}</defs>
    <ellipse cx="80" cy="112" rx="64" ry="6" fill="#3B2A1A" opacity=".18"/>
    <rect x="22" y="14" width="116" height="94" rx="10" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <rect x="22" y="14" width="116" height="15" rx="7" fill="#B5BEC4" stroke="#6F7980" stroke-width="2"/>
    <rect x="34" y="37" width="40" height="11" rx="3" fill="#2E3438"/>
    <circle cx="96" cy="42" r="5" fill="#2E3438"/><circle cx="112" cy="42" r="5" fill="#2E3438"/>
    <rect x="56" y="56" width="36" height="12" rx="4" fill="#5E676D"/>
    <rect x="62" y="68" width="24" height="7" rx="2" fill="#3A4045"/>
    <path d="M86 71 L118 77" stroke="#7A5232" stroke-width="7" stroke-linecap="round"/>
    <rect x="30" y="94" width="100" height="10" rx="3" fill="#5E676D"/>
    <path d="M129 52 L133 86" stroke="#8A949B" stroke-width="4" stroke-linecap="round"/>
    ${active ? '<path d="M70 77 L70 93 M78 77 L78 93" stroke="#4A2C1B" stroke-width="3" stroke-linecap="round"/>' : ''}
    <path d="M30 22 L30 100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>`);
}

function pitcherSVG({ milk = false } = {}) {
  const g = gid('pt');
  return svg(`<defs>${grad(g, ['#F5F7F8', '#C5CDD3', '#87929A'])}</defs>${SHADOW}
    <path d="M84 50 C102 52 102 84 84 88" fill="none" stroke="#6F7980" stroke-width="8" stroke-linecap="round"/>
    <path d="M38 40 L26 32 L46 36 L74 36 L82 40 L86 98 Q86 106 78 106 L42 106 Q34 106 34 98 Z" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <ellipse cx="58" cy="38" rx="23" ry="4.8" fill="${milk ? '#FFFDF8' : '#9BA6AD'}" stroke="#6F7980" stroke-width="2"/>
    <path d="M42 46 L44 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

function traySVG() {
  const g = gid('t');
  return svgBox('0 0 160 60', `<defs>${grad(g, ['#E8BE86', '#C08A52', '#9A6634'], true)}</defs>
    <path d="M12 16 L148 16 L156 44 L4 44 Z" fill="url(#${g})" stroke="#7A4E25" stroke-width="2.5"/>
    <path d="M18 20 L142 20" stroke="#F6DAB0" stroke-width="2" opacity=".75"/>`);
}

function hotSVG() {
  return svg(`${SHADOW}<path d="M38 98 L82 98" stroke="#B4532A" stroke-width="5" stroke-linecap="round"/>
    ${[44, 60, 76].map((x) => `<path d="M${x} 88 q-9 -10 0 -20 t0 -20 t0 -20" fill="none" stroke="#E07B45" stroke-width="6" stroke-linecap="round"/>`).join('')}`);
}

function icedSVG() {
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 15} ${y + 15})"><rect x="${x}" y="${y}" width="30" height="30" rx="6" fill="#DDF2FC" stroke="#5F9CBE" stroke-width="2.5"/><path d="M${x + 7} ${y + 8} l9 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
  return svg(`${SHADOW}${cube(28, 56, -10)}${cube(62, 48, 12)}${cube(45, 74, 4)}`);
}

/* ---- 새 재료 · 새 동작의 임시 그림(2026-10-31, 대체 요망: docs/requests_full.md 의 물건 그림 · 블렌더 한 컷) ---- */
const iceCube = (x, y, r, s = 15) => `<g transform="rotate(${r} ${x + s / 2} ${y + s / 2})"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" fill="rgba(255,255,255,.62)" stroke="#8DB9D0" stroke-width="2"/></g>`;

/** 플라스틱 컵(아이스 포장): 투명한 컵 + 둥근 뚜껑 + 빨대 */
function plasticSVG({ color = null, level = 0.74, ice = false } = {}) {
  const c = gid('pl');
  const yl = 104 - level * 70;
  return svgT(`<defs><clipPath id="${c}"><path d="M38 36 L44 102 Q45 107 60 107 Q75 107 76 102 L82 36 Z"/></clipPath></defs>${SHADOW}
    <g clip-path="url(#${c})">${color ? `<rect x="30" y="${yl}" width="60" height="${110 - yl}" fill="${color}" opacity=".9"/>` : ''}
      ${ice ? `${iceCube(46, yl - 4, -12)}${iceCube(61, yl + 2, 10)}${iceCube(50, yl + 16, 4)}` : ''}</g>
    <path d="M38 36 L44 102 Q45 107 60 107 Q75 107 76 102 L82 36" fill="rgba(226,240,248,.32)" stroke="#8FB3C7" stroke-width="2.5"/>
    <path d="M36 35 Q60 8 84 35 Z" fill="rgba(235,247,255,.55)" stroke="#8FB3C7" stroke-width="2.5"/>
    <rect x="33" y="32" width="54" height="7" rx="3" fill="rgba(240,250,255,.85)" stroke="#8FB3C7" stroke-width="2"/>
    <path d="M65 24 L77 2" stroke="#2E8B57" stroke-width="5" stroke-linecap="round"/>
    <path d="M44 44 L48 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
}
/** 청이 든 유리병(유자청 · 딸기청) */
function jarSVG(fill, lid) {
  const g = gid('jr');
  return svgT(`<defs>${grad(g, [mix(fill, '#FFFFFF', 0.25), fill, mix(fill, '#000000', 0.25)])}</defs>${SHADOW}
    <path d="M38 40 Q36 46 36 54 L36 98 Q36 106 44 106 L76 106 Q84 106 84 98 L84 54 Q84 46 82 40 Z" fill="rgba(230,244,250,.45)" stroke="#8FA8B5" stroke-width="2.5"/>
    <path d="M39 58 L81 58 L81 98 Q81 103 76 103 L44 103 Q39 103 39 98 Z" fill="url(#${g})" opacity=".92"/>
    <circle cx="52" cy="76" r="5" fill="${mix(fill, '#FFFFFF', 0.4)}" opacity=".8"/><circle cx="66" cy="88" r="4" fill="${mix(fill, '#FFFFFF', 0.4)}" opacity=".8"/>
    <rect x="36" y="28" width="48" height="14" rx="4" fill="${lid}" stroke="${mix(lid, '#000000', 0.35)}" stroke-width="2"/>
    <path d="M44 50 L45 96" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
}
/** 가루 · 원두 통(말차 · 코코아 · 디카페인) */
function tinSVG(body, band) {
  const g = gid('tn');
  return svgT(`<defs>${grad(g, [mix(body, '#FFFFFF', 0.3), body, mix(body, '#000000', 0.3)])}</defs>${SHADOW}
    <path d="M36 36 L36 100 Q36 106 60 106 Q84 106 84 100 L84 36 Z" fill="url(#${g})" stroke="${mix(body, '#000000', 0.45)}" stroke-width="2.5"/>
    <ellipse cx="60" cy="36" rx="24" ry="6" fill="${mix(body, '#FFFFFF', 0.45)}" stroke="${mix(body, '#000000', 0.45)}" stroke-width="2.5"/>
    <rect x="36" y="58" width="48" height="20" fill="${band}" opacity=".9"/>
    <circle cx="60" cy="68" r="6" fill="${mix(band, '#FFFFFF', 0.6)}"/>
    <path d="M42 42 L42 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`);
}
/** 상자(보리차 티백 · 믹스커피): 위로 티백 꼬리 · 봉지 끝이 나옴 */
function boxSVG(color, tip) {
  const g = gid('bx');
  return svgT(`<defs>${grad(g, [mix(color, '#FFFFFF', 0.3), color, mix(color, '#000000', 0.25)])}</defs>${SHADOW}
    <path d="M44 30 L48 52 M58 26 L58 52 M72 30 L68 52" stroke="${tip}" stroke-width="7" stroke-linecap="round"/>
    <path d="M28 50 L92 50 L92 102 Q92 106 88 106 L32 106 Q28 106 28 102 Z" fill="url(#${g})" stroke="${mix(color, '#000000', 0.4)}" stroke-width="2.5"/>
    <path d="M28 50 L92 50 L86 44 L34 44 Z" fill="${mix(color, '#FFFFFF', 0.4)}" stroke="${mix(color, '#000000', 0.4)}" stroke-width="2"/>
    <rect x="38" y="66" width="44" height="22" rx="5" fill="#FFF8EA" opacity=".85"/>`);
}
/** 드립 원두 봉지 */
function beanBagSVG() {
  const g = gid('bb');
  return svgT(`<defs>${grad(g, ['#D9B98C', '#B48A58', '#8A6236'])}</defs>${SHADOW}
    <path d="M38 30 L82 30 L88 100 Q88 106 82 106 L38 106 Q32 106 32 100 Z" fill="url(#${g})" stroke="#6E4A24" stroke-width="2.5"/>
    <path d="M36 30 L84 30 L84 38 L36 38 Z" fill="#9C7442" stroke="#6E4A24" stroke-width="2"/>
    <ellipse cx="60" cy="72" rx="13" ry="16" fill="#3A2214"/><path d="M60 58 Q54 72 60 86" stroke="#7A5232" stroke-width="2.5" fill="none"/>`);
}
/** 드리퍼(옆에서 본 깔때기 + 유리 서버). bloom: 뜸이 부푼 정도 0~1 · wet: 젖은 정도 0~1 · drip: 서버에 내려온 양 0~1 */
function dripperSVG({ bloom = 0, wet = 0, drip = 0, stream = false } = {}) {
  const g = gid('dp');
  const lv = 104 - drip * 26;
  return svg(`<defs>${grad(g, ['#FFFFFF', '#E9E4DC', '#BDB3A5'])}</defs>${SHADOW}
    <path d="M40 74 L42 102 Q43 107 60 107 Q77 107 78 102 L80 74 Z" fill="rgba(226,240,248,.35)" stroke="#8FA8B5" stroke-width="2.5"/>
    ${drip ? `<path d="M41.5 ${lv} L42.5 102 Q43 106 60 106 Q77 106 77.5 102 L78.5 ${lv} Z" fill="#3A2214" opacity=".9"/>` : ''}
    <path d="M30 26 L90 26 L68 70 L52 70 Z" fill="url(#${g})" stroke="#8C8478" stroke-width="2.5"/>
    <path d="M36 30 L84 30 L66 64 L54 64 Z" fill="#F4E9D6"/>
    <path d="M40 ${36 - bloom * 6} Q60 ${30 - bloom * 14} 80 ${36 - bloom * 6} L66 60 L54 60 Z" fill="${mix('#8A5A34', '#3A2214', wet)}" opacity=".95"/>
    ${stream ? '<path d="M60 4 Q62 16 60 30" stroke="#C9E4F0" stroke-width="4" fill="none" stroke-linecap="round"/>' : ''}
    ${drip > 0.02 ? '<path d="M60 70 L60 80" stroke="#3A2214" stroke-width="3" stroke-linecap="round"/>' : ''}`);
}
/** 손 그라인더 */
function handGrinderSVG(angle = 0) {
  const g = gid('hg');
  return svg(`<defs>${grad(g, ['#C8925C', '#9A6634', '#6E4524'])}</defs>${SHADOW}
    <rect x="34" y="56" width="52" height="50" rx="6" fill="url(#${g})" stroke="#4E2F14" stroke-width="2.5"/>
    <rect x="48" y="84" width="24" height="10" rx="3" fill="#3A2214"/>
    <path d="M42 56 L44 40 L76 40 L78 56 Z" fill="#B5BEC4" stroke="#6F7980" stroke-width="2.5"/>
    <g transform="rotate(${angle} 60 36)"><path d="M60 36 L60 12 L84 12" fill="none" stroke="#3A3F44" stroke-width="5" stroke-linecap="round"/><circle cx="86" cy="12" r="6" fill="#2F2A26"/></g>
    <circle cx="60" cy="36" r="5" fill="#3A3F44"/>`);
}
/** 위에서 본 컵 · 드리퍼(원 그리기): 안의 색 + 소용돌이 + 도는 도구(숟가락 · 거품기 · 주전자 물줄기 · 손잡이) */
function topViewSVG({ color = '#C79A6B', angle = 0, tool = 'spoon', rim = '#E9E2D6' } = {}) {
  const swirl = `<g transform="rotate(${angle} 60 60)" opacity=".55"><path d="M60 60 m-22 0 a22 22 0 1 1 44 0" fill="none" stroke="${mix(color, '#FFFFFF', 0.45)}" stroke-width="4" stroke-linecap="round"/><path d="M60 60 m-11 0 a11 11 0 1 0 22 0" fill="none" stroke="${mix(color, '#FFFFFF', 0.45)}" stroke-width="3" stroke-linecap="round"/></g>`;
  const toolG = {
    spoon: '<rect x="57" y="12" width="6" height="44" rx="3" fill="#C9CED3" stroke="#7C868D" stroke-width="1.5"/><ellipse cx="60" cy="58" rx="8" ry="10" fill="#DDE2E6" stroke="#7C868D" stroke-width="1.5"/>',
    whisk: '<rect x="57" y="8" width="6" height="30" rx="3" fill="#9A6634"/><path d="M60 38 Q48 52 60 66 Q72 52 60 38 M60 38 Q54 54 60 66 M60 38 Q66 54 60 66" fill="none" stroke="#C9CED3" stroke-width="2.5"/>',
    kettle: '<circle cx="60" cy="30" r="6" fill="#C9E4F0" stroke="#5F9CBE" stroke-width="2"/><path d="M60 30 L60 4" stroke="#7C868D" stroke-width="5" stroke-linecap="round"/>',
    crank: '<path d="M60 60 L60 22 L88 22" fill="none" stroke="#3A3F44" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="22" r="8" fill="#2F2A26"/>',
  }[tool] || '';
  return svg(`<circle cx="60" cy="60" r="50" fill="${rim}" stroke="#8C8478" stroke-width="3"/>
    <circle cx="60" cy="60" r="41" fill="${color}"/>${swirl}
    <g transform="rotate(${angle} 60 60)">${toolG}</g>`);
}
/** 끓는 주전자: heat 0~1 (거품 · 김이 늘어남) */
function kettleBoilSVG(heat = 0) {
  const n = Math.round(heat * 6);
  const bubbles = Array.from({ length: n }, (_, i) => `<circle cx="${44 + (i * 7) % 32}" cy="${96 - (i * 11) % 30}" r="${2 + (i % 3)}" fill="rgba(255,255,255,.85)" stroke="#9FC6D9" stroke-width="1"/>`).join('');
  return svg(`${SHADOW}<path d="M34 56 Q34 40 60 40 Q86 40 86 56 L88 98 Q88 106 80 106 L40 106 Q32 106 32 98 Z" fill="rgba(214,232,240,.55)" stroke="#7C868D" stroke-width="2.5"/>
    <path d="M36 66 L84 66 L86 98 Q86 103 80 103 L40 103 Q34 103 34 98 Z" fill="rgba(170,210,232,.55)"/>${bubbles}
    <path d="M38 96 C26 94 20 70 12 48" fill="none" stroke="#7C868D" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="60" cy="41" rx="20" ry="5" fill="#E8EDF0" stroke="#7C868D" stroke-width="2"/><circle cx="60" cy="34" r="5" fill="#3A2E26"/>
    ${steamLines(Math.min(3, Math.round(heat * 3)), 60, 26)}`);
}
/** 티백이 든 컵(우리기): steep 0~1 (색이 진해짐) */
function teaCupSVG(steep = 0, base = '#C98E4E') {
  return mugSVG({ color: mix('#EFE6D2', base, Math.min(1, 0.15 + steep)), level: 0.82, steam: 1 }).replace('</svg>',
    '<path d="M72 18 L66 44" stroke="#E9E2D6" stroke-width="2"/><rect x="68" y="10" width="12" height="10" rx="2" fill="#C98E4E" stroke="#8A5A34" stroke-width="1.5"/></svg>');
}
/** 그라인더(원두가 갈려 담김): dose 0~1 */
function grinderSVG(dose = 0) {
  const g = gid('gr');
  return svg(`<defs>${grad(g, ['#F2F5F7', '#C7CFD5', '#8A949B'])}</defs>${SHADOW}
    <path d="M44 8 L76 8 L70 30 L50 30 Z" fill="rgba(120,80,50,.35)" stroke="#6F7980" stroke-width="2"/>
    <rect x="40" y="30" width="40" height="48" rx="6" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <rect x="30" y="86" width="60" height="10" rx="4" fill="#5E676D"/>
    <path d="M42 86 Q60 ${86 - dose * 16} 78 86 Z" fill="#5A3A22"/>
    <rect x="52" y="78" width="16" height="6" rx="2" fill="#3A4045"/>`);
}
/** 탬퍼로 누르기: press 0~1 */
function tampSVG(press = 0) {
  const y = press * 14;
  return svg(`${SHADOW}<rect x="30" y="80" width="60" height="16" rx="5" fill="#6F7980" stroke="#3A4045" stroke-width="2.5"/>
    <path d="M90 88 L112 92" stroke="#2F2A26" stroke-width="8" stroke-linecap="round"/>
    <rect x="36" y="76" width="48" height="6" fill="#5A3A22"/>
    <g transform="translate(0 ${y})"><rect x="38" y="${52 - 14}" width="44" height="12" rx="3" fill="#B5BEC4" stroke="#6F7980" stroke-width="2"/>
    <path d="M60 ${38} L60 14" stroke="#7A4E25" stroke-width="12" stroke-linecap="round"/></g>`);
}
/** 숟가락(젓기 물건) */
function spoonSVG() {
  return svg(`${SHADOW}<path d="M40 100 L78 30" stroke="#B5BEC4" stroke-width="6" stroke-linecap="round"/><ellipse cx="82" cy="24" rx="9" ry="13" transform="rotate(30 82 24)" fill="#DDE2E6" stroke="#7C868D" stroke-width="2"/>`);
}

/** 그림 ID → 임시 그림 (물건 그림 ID 와 같은 이름 + 시트에 없는 것: hot · iced) */
const ART = {
  cup_mug_empty: () => mugSVG(),
  cup_thick: () => mugSVG({ thick: true }),
  cup_paper: () => paperSVG(),
  cup_shot: () => shotSVG(),
  cup_glass_empty: () => glassSVG(),
  cup_glass_ice: () => glassSVG({ color: RECIPES.americano.color, level: 0.74, ice: true }),
  cup_mug_americano: () => mugSVG({ color: RECIPES.americano.color }),
  cup_mug_milk: () => mugSVG({ color: RECIPES.warm_milk.color, foam: RECIPES.warm_milk.foam, foamSize: 0.8 }),
  cup_mug_latte: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam }),
  cup_mug_heart: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  cup_mug_tulip: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  cup_mug_leaf: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  obj_machine: () => machineSVG(),
  obj_pitcher: () => pitcherSVG(),
  obj_pitcher_milk: () => pitcherSVG({ milk: true }),
  obj_milk_bottle: () => bottleSVG(),
  obj_kettle: () => kettleSVG(),
  obj_syrup: () => syrupSVG(),
  obj_tray: () => traySVG(),
  hot: () => hotSVG(),
  iced: () => icedSVG(),
  obj_ice_bucket: () => iceBucketSVG(),
  obj_recipe_book: () => bookSVG(),
  cup_plastic: () => plasticSVG(),
  obj_decaf: () => tinSVG('#5B3A29', '#E9D9B8'),
  obj_drip_beans: () => beanBagSVG(),
  obj_mix: () => boxSVG('#E0A63A', '#C8462F'),
  obj_barley: () => boxSVG('#B98A4E', '#F4E3C2'),
  obj_yuja: () => jarSVG(INGREDIENTS.yuja.color, '#2E6E4C'),
  obj_strawberry: () => jarSVG(INGREDIENTS.strawberry.color, '#C8462F'),
  obj_matcha: () => tinSVG('#3F6B2F', '#BFD9A4'),
  obj_cocoa: () => tinSVG('#6B3E26', '#E9C9A6'),
  obj_dripper: () => dripperSVG(),
  obj_hand_grinder: () => handGrinderSVG(),
  obj_grinder: () => grinderSVG(0.3),
  obj_tamper: () => tampSVG(0),
  obj_spoon: () => spoonSVG(),
};

/** 얼음 통(그림 파일 obj_ice_bucket 이 오기 전 임시) */
/* 버리는 장면(2026-11-04): 개수대 · 식기 건조대 · 쓰레기통 */
function sinkSVG() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true">
    <defs><linearGradient id="bwSinkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E878D"/><stop offset="1" stop-color="#DCE1E4"/></linearGradient></defs>
    <rect x="4" y="18" width="352" height="20" rx="6" fill="#C5CBCF" stroke="#2A1D12" stroke-width="4"/>
    <path d="M34 38 H326 L308 150 Q306 160 296 160 H64 Q54 160 52 150 Z" fill="url(#bwSinkG)" stroke="#2A1D12" stroke-width="4"/>
    <ellipse cx="180" cy="142" rx="24" ry="8" fill="#4F575D" stroke="#2A1D12" stroke-width="3"/>
    <path d="M168 142 h24 M180 136 v12" stroke="#2A1D12" stroke-width="2.5"/>
    <path d="M300 18 V-8 Q300 -24 284 -24 H262 V-14" fill="none" stroke="#2A1D12" stroke-width="12" stroke-linecap="round"/>
    <path d="M300 18 V-8 Q300 -24 284 -24 H262 V-14" fill="none" stroke="#C5CBCF" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}
function rackSVG() {
  return `<svg viewBox="0 0 220 150" aria-hidden="true">
    <rect x="10" y="118" width="200" height="22" rx="8" fill="#E8E3D8" stroke="#2A1D12" stroke-width="4"/>
    <path d="M24 118 V40 M52 118 V40 M80 118 V40 M108 118 V40 M136 118 V40 M164 118 V40 M192 118 V40" stroke="#8C949A" stroke-width="5" stroke-linecap="round"/>
    <path d="M18 70 H202 M18 100 H202" stroke="#2A1D12" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function binSVG() {
  return `<svg viewBox="0 0 170 210" aria-hidden="true">
    <rect x="20" y="30" width="130" height="20" rx="8" fill="#3F7A57" stroke="#2A1D12" stroke-width="4"/>
    <path d="M70 30 Q85 14 100 30" fill="none" stroke="#2A1D12" stroke-width="5"/>
    <path d="M28 50 H142 L132 196 Q131 204 122 204 H48 Q39 204 38 196 Z" fill="#4E8F68" stroke="#2A1D12" stroke-width="4"/>
    <path d="M62 74 V182 M85 74 V182 M108 74 V182" stroke="#3B7253" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

function iceBucketSVG() {
  const g = gid('ib');
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 9} ${y + 9})"><rect x="${x}" y="${y}" width="18" height="18" rx="4" fill="#E8F6FD" stroke="#6FA7C6" stroke-width="2"/><path d="M${x + 4} ${y + 5} l6 0" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
  return svg(`<defs>${grad(g, ['#F4F7F9', '#C9D1D7', '#8D989F'])}</defs>${SHADOW}
    ${cube(36, 30, -12)}${cube(56, 26, 8)}${cube(70, 34, -4)}${cube(46, 38, 14)}
    <path d="M26 44 L94 44 L88 100 Q87 106 80 106 L40 106 Q33 106 32 100 Z" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <ellipse cx="60" cy="44" rx="34" ry="7" fill="#DDE3E7" stroke="#6F7980" stroke-width="2.5"/>
    <path d="M30 56 L90 56" stroke="#8D989F" stroke-width="2"/>
    <path d="M38 52 L42 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

/** 레시피 수첩(카운터 위 공책): 가죽 표지 + 책갈피 끈 */
function bookSVG() {
  const g = gid('bk');
  return svg(`<defs>${grad(g, ['#2E6E4C', '#1F5A3B', '#153F29'], true)}</defs>
    <ellipse cx="60" cy="104" rx="46" ry="6" fill="#3B2A1A" opacity=".2"/>
    <path d="M18 70 L64 54 L104 72 L58 92 Z" fill="#F6EEDC" stroke="#8E6C33" stroke-width="2"/>
    <path d="M14 76 L60 96 L60 102 L14 82 Z" fill="url(#${g})" stroke="#0F2E1E" stroke-width="2"/>
    <path d="M60 96 L106 76 L106 82 L60 102 Z" fill="#1A4A31" stroke="#0F2E1E" stroke-width="2"/>
    <path d="M14 76 L60 56 L106 76 L60 96 Z" fill="url(#${g})" stroke="#0F2E1E" stroke-width="2.4"/>
    <path d="M30 76 L60 63 L90 76 L60 89 Z" fill="none" stroke="#D4AE62" stroke-width="1.6" opacity=".9"/>
    <path d="M60 70 l4 4 -4 4 -4 -4 z" fill="#F0D9A2"/>
    <path d="M78 88 L80 104 L84 99 L88 102 L86 86" fill="#D4AE62"/>`);
}

/** 물건 그림 하나: 그림 파일이 있으면 <img>, 없으면 임시 그림. 꾸밈이라 읽어 주지 않음(이름은 글자로 따로) */
function objArt(id, cls = '') {
  const el = h('span', { class: `bw-art ${cls}`.trim(), 'data-art': id || '' });
  if (id && img.has('objects', id)) {
    el.classList.add('is-img');
    el.append(h('img', { src: img.url('objects', id), alt: '', draggable: 'false' }));
  } else {
    el.innerHTML = ART[id]?.() || `<span class="bw-pict">${ICON('cup')}</span>`;
  }
  return el;
}

const cupArtId = (id) => CUPS[id]?.obj || id;
/** 레시피 칸(컵·바탕·더하기·온도)의 그림과 이름 */
const artOf = (k, id, cls = '') => objArt(k === 'cup' ? cupArtId(id) : k === 'temp' ? id : INGREDIENTS[id]?.obj, cls);
const nameOf = (k, id) => (k === 'cup' ? CUPS[id]?.name : k === 'temp' ? TEMPS[id]?.name : INGREDIENTS[id]?.name) || id;

/*
 * 카운터의 물건 자리(카운터 그림 workbench_morning 의 16:9 판에 대한 %): [가운데 x, 아래 끝 bottom, 너비]
 * 크기는 실제 크기 비율(2026-10-31 사용자 의견 "크기를 제대로 반영하지 않아 중구난방"): 머그 높이 10cm = 판 높이의 9.6%를 잣대로,
 * 그림 파일의 가로·세로 비율에서 너비를 셈(머신 36cm · 주전자 17cm · 우유병 22cm · 시럽병 24cm · 종이컵 12cm · 유리컵 13cm).
 * bottom 은 물건 바닥(이름표는 그 아래에 매달림). 카운터 판은 그림 아래에서 12.3%(앞 끝) ~ 32.4%(벽과 만나는 뒤 끝)이고 손 띠가 아래 15%쯤을 가림.
 * 서 있는 물건은 모두 판 위 같은 줄(BACK 25%, 뒤 끝에서 판 깊이의 3분의 1쯤 앞)에, 컵은 왼쪽 나무판 · 우유 · 시럽 · 얼음은 오른쪽 나무판 위에.
 * 수첩은 앞줄(17.5%, 손 띠 바로 위), 받침은 조금 뒤(19.5%)에 넓게. 2026-10-31 사용자 "테이블보다 위쪽에 물건들이 다 놓여있네" ·
 * "컵 놓는 곳을 더 크게 하고 위치도 약간 올려야" · "에스프레소는 살짝 떠 있다" → "머신은 더 아래로"(뒷줄보다 3.5% 앞, 크고 무거운 물건이라 판 앞쪽에)
 */
const BACK = 25;
const FRONT = 17.5;
const HOT_POS = {
  book: [6.2, FRONT, 9],
  mat: [40.5, 19.5, 13.5],
  espresso: [55.5, BACK - 3.5, 16.8],
  water: [71, BACK, 12.4],
  milk: [81, BACK, 5.4],
  syrup: [86, BACK, 4.9],
  iced: [92.5, BACK, 8.5],
};
/* 벽 선반(2026-10-31): 청 · 가루 · 티백 · 원두처럼 작은 병 · 통은 카운터 뒤 벽의 선반 한 줄에(그날 주문에 든 것만 보임). 자리는 늘 같음 */
const SHELF = 44;
const SHELF_X = { decaf: 10, drip: 14.8, mix: 19.6, barley: 24.4, yuja: 29.2, strawberry: 34, matcha: 38.8, cocoa: 43.6 };
for (const [id, x] of Object.entries(SHELF_X)) HOT_POS[id] = [x, SHELF, 4.2];
const CUP_ROW = { x: 13, step: 5.4, bottom: BACK };
const CUP_W = { mug: 4.84, thick: 4.95, paper: 4.38, glass: 4.27, plastic: 4.3, shot: 3.7 };
const BOARD_BOTTLES = [77, 98]; // 오른쪽 나무판(왼쪽 끝 · 오른쪽 끝 %)
const BOARD_SHELF = [7, 46.2]; // 벽 선반
/** 재료를 꺼내는 물건(수첩 · 넣은 것 칸의 그림은 menu.js 의 obj 그대로): 에스프레소는 머신, 물은 주전자 */
const HOT_ART = { espresso: 'obj_machine', decaf: 'obj_decaf', milk: 'obj_milk_bottle', water: 'obj_kettle', syrup: 'obj_syrup', iced: 'obj_ice_bucket' };
const hotStyle = ([x, b, w]) => ({ left: `${x}%`, bottom: `${b}%`, width: `${w}%` });

/**
 * 음료 모양(임시 그림): 재료 → 색, 손 기술 결과 → 진하기·양·거품·김·넘침
 * soFar: 만드는 도중(지금까지 넣은 재료) · res.checks: 손 기술 결과
 */
function drinkSpec(made, res = {}, soFar = null) {
  const ings = soFar || new Set([made.base, ...made.adds]);
  const has = (x) => ings.has(x);
  const zone = (s) => res.checks?.find((c) => c.skill === s)?.zone || 'good';
  const shot = has('espresso') || has('decaf');
  let color = null;
  // 바탕 재료의 색 → 우유 · 물과 섞임
  const tint = ['drip', 'mix', 'barley', 'yuja', 'strawberry', 'matcha', 'cocoa'].find(has);
  if (tint) color = has('milk') ? mix(INGREDIENTS[tint].color, '#FBF7EF', 0.45) : has('water') ? mix(INGREDIENTS[tint].color, '#E9DCC6', tint === 'drip' ? 0.05 : 0.25) : INGREDIENTS[tint].color;
  else if (shot && has('milk')) color = RECIPES.latte.color;
  else if (shot && has('water')) color = RECIPES.americano.color;
  else if (shot) color = INGREDIENTS.espresso.color;
  else if (has('milk')) color = INGREDIENTS.milk.color;
  else if (has('water')) color = INGREDIENTS.water.color;
  else if (has('syrup')) color = INGREDIENTS.syrup.color;
  if (color && shot) {
    if (zone('extract') === 'low' || zone('grind') === 'low' || zone('tamp') === 'low') color = mix(color, '#E3C9A2', 0.38);
    if (zone('extract') === 'high' || zone('grind') === 'high' || zone('tamp') === 'high') color = mix(color, '#140A04', 0.4);
  }
  if (color && tint && (zone('steep') === 'low' || zone('powder') === 'low' || zone('jam') === 'low')) color = mix(color, '#F4EEE2', 0.4);
  if (color && tint && (zone('steep') === 'high' || zone('powder') === 'high')) color = mix(color, '#2A160A', 0.25);
  if (color && has('syrup') && ings.size > 1) color = mix(color, INGREDIENTS.syrup.color, 0.2);
  let level = !color ? 0 : has('water') || has('milk') ? 0.86 : 0.42;
  if ((has('milk') && zone('pour') === 'low') || (has('water') && zone('water') === 'low')) level = 0.58;
  const hot = made.temp === 'hot';
  const foam = has('milk') && hot ? (shot ? RECIPES.latte.foam : tint ? null : RECIPES.warm_milk.foam) : null;
  const foamSize = { low: 0.5, good: 0.9, high: 1.18 }[zone('foam')];
  const steam = !color || !hot ? 0 : has('milk') ? { low: 0, good: 2, high: 3 }[zone('steam')] : 2;
  const spill = (has('milk') && zone('pour') === 'high') || zone('stir') === 'high' || (has('water') && zone('water') === 'high');
  return { cup: made.cup, color, level, foam, foamSize, art: res.art || null, ice: made.temp === 'iced', steam, spill };
}

function drinkSVG(s) {
  if (s.cup === 'glass') return glassSVG({ color: s.color, level: s.level, ice: s.ice, foam: s.foam });
  if (s.cup === 'plastic') return plasticSVG({ color: s.color, level: s.level, ice: s.ice });
  if (s.cup === 'paper') return paperSVG({ steam: s.steam });
  return mugSVG({ color: s.color, level: s.level, foam: s.foam, foamSize: s.foamSize, art: s.art, steam: s.steam, spill: s.spill, thick: s.cup === 'thick' });
}

/** 음료 그림: 다 만든 아는 메뉴는 그림 파일(있으면) + 김·넘침 표시, 아니면 임시 그림 */
function drinkArt(made, res = {}, soFar = null, cls = '') {
  const spec = drinkSpec(made, res, soFar);
  const menu = soFar ? null : findMenu(made);
  const r = menu ? RECIPES[menu] : null;
  // 라테아트 그림(cup_mug_heart 등)은 머그 그림이라 머그일 때만(종이컵에 하트를 그려도 드릴 때는 종이컵)
  // 종이컵은 뚜껑이 덮여 안이 보이지 않아, 무슨 음료든(엉뚱한 잔도) 다 만들면 종이컵 그림 그대로(2026-11-06, 검수 13.62)
  const look = (r ? (made.cup === 'mug' && res.art && r.art?.[res.art]) || r.look?.[made.cup] : null) || (!soFar && made.cup === 'paper' ? cupArtId('paper') : null);
  if (look && img.has('objects', look)) {
    const el = objArt(look, `bw-drink ${cls}`);
    if (spec.spill) el.append(h('i', { class: 'bw-spill', 'aria-hidden': 'true' }));
    if (spec.steam) el.append(h('i', { class: `bw-wisp n${spec.steam}`, 'aria-hidden': 'true' }));
    return el;
  }
  // 레시피에 없는 잔(엉뚱한 잔 · 컵이 다른 잔): 그 컵의 잔 그림 가운데 넣은 것이 가장 비슷한 것, 겹치는 것이 없으면 빈 컵 그림(임시 그림을 쓰지 않음, 검수 13.79)
  if (!soFar) {
    const near = nearLook(made);
    if (near) {
      const el = objArt(near, `bw-drink ${cls}`);
      if (spec.spill) el.append(h('i', { class: 'bw-spill', 'aria-hidden': 'true' }));
      if (spec.steam) el.append(h('i', { class: `bw-wisp n${spec.steam}`, 'aria-hidden': 'true' }));
      return el;
    }
  }
  // 만드는 도중: 빈 컵이거나 컵 그림 파일이 있으면 그 컵(만드는 중의 그림은 시트에 없어 그림체를 섞지 않음)
  if (soFar && (!spec.color || img.has('objects', cupArtId(made.cup)))) return objArt(cupArtId(made.cup), `bw-drink ${cls}`);
  const el = h('span', { class: `bw-art bw-drink ${cls}`.trim(), 'data-art': 'drink' });
  el.innerHTML = drinkSVG(spec);
  return el;
}

/** 레시피에 없는 잔의 그림: 그 컵의 잔 그림(RECIPES.look) 가운데 넣은 재료가 가장 많이 겹치는 것(넣은 것 +2, 더 넣은 것 · 빠진 것 -1), 겹치는 것이 없으면 빈 컵 그림 */
function nearLook(made) {
  const have = new Set([made.base, ...(made.adds || [])].filter(Boolean));
  let best = null;
  let score = 0;
  for (const r of Object.values(RECIPES)) {
    const id = r.look?.[made.cup];
    if (!id || !img.has('objects', id)) continue;
    const want = new Set([r.base, ...(r.adds || [])].filter(Boolean));
    let n = 0;
    for (const x of have) n += want.has(x) ? 2 : -1;
    for (const x of want) if (!have.has(x)) n -= 1;
    if (n > score) { score = n; best = id; }
  }
  const empty = cupArtId(made.cup);
  return best || (img.has('objects', empty) ? empty : null);
}

/** 뚜껑이 있는 포장 컵(종이컵 · 플라스틱 컵) */
const LIDDED = new Set(['paper', 'plastic']);
/** 뚜껑을 연 포장 컵 그림(drink 가 있으면 그 음료가 든 모습) */
const openArt = (cup, drink = null, cls = 'toss') => h('span', { class: `bw-art bw-drink ${cls}`.trim(), 'data-art': `open_${cup}`, html: openCupSVG(cup, drink) });

/* ================================================================== */
/* 레시피 수첩: 작업대 안의 [레시피 수첩]과 위쪽 띠·멈춤의 [레시피]가 같은 칸을 씀  */
/* ================================================================== */
const bookPart = (k, art, name) => h('span', { class: 'bk-part' }, h('small', { text: k }), art, h('em', { text: name }));

/** 메뉴 한 줄(그림 · 바탕 · 더하기 · 온도 · 손 동작 · 사장님 메모). 누르면 읽어 줌 */
function bookRow(id, level) {
  const r = RECIPES[id];
  const t0 = r.temps[0];
  const sample = { cup: r.cup || (t0 === 'iced' ? 'glass' : 'mug'), base: r.base, adds: [...r.adds], temp: t0 };
  const skills = prepSteps(sample, level).filter((x) => x.skill).map((x) => x.skill);
  const speech = [recipeSpeech(id), r.note].filter(Boolean).join(' ');
  const b = h('button', { class: 'bk-row', 'aria-label': speech },
    h('span', { class: 'bk-pic' }, drinkArt(sample, {}, null, 'bk-drink')),
    h('span', { class: 'bk-main' },
      h('b', { class: 'bk-name' }, r.tag ? h('i', { class: 'bk-color', style: { background: COLORS[r.tag].hex }, title: COLORS[r.tag].name }) : null, r.name),
      h('span', { class: 'bk-parts' },
        bookPart(STEP_NAMES.base, artOf('base', r.base, 'small'), INGREDIENTS[r.base].name),
        ...(r.adds.length ? r.adds.map((a) => bookPart(STEP_NAMES.adds, artOf('adds', a, 'small'), INGREDIENTS[a].name)) : [bookPart(STEP_NAMES.adds, h('span', { class: 'bw-art small bk-none', text: '−' }), '없음')]),
        bookPart(STEP_NAMES.temp, artOf('temp', t0, 'small'), r.temps.map((t) => TEMPS[t].name).join(' · ')),
        r.cup ? bookPart(STEP_NAMES.cup, artOf('cup', r.cup, 'small'), CUPS[r.cup].name) : null),
      r.note ? h('span', { class: 'bk-note', text: r.note }) : null,
      h('span', { class: 'bk-skills' }, h('small', { text: '손 동작' }), ...skills.map((s) => h('em', { text: HAND_SKILLS[s].name })))));
  b.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speak(speech, 'sys', { force: true }); });
  return b;
}

/** 컵 고르기 규칙(수첩 맨 위): 매장/포장 × 온도 → 컵 */
function cupRuleCard() {
  const cell = (svc, t) => h('span', { class: 'bk-cup' }, artOf('cup', ({ here: { hot: 'mug', iced: 'glass' }, togo: { hot: 'paper', iced: 'plastic' } })[svc][t], 'small'), h('em', { text: `${TEMPS[t].name} → ${CUPS[({ here: { hot: 'mug', iced: 'glass' }, togo: { hot: 'paper', iced: 'plastic' } })[svc][t]].name}` }));
  const b = h('button', { class: 'bk-rule', 'aria-label': CUP_RULE },
    h('b', { class: 'bk-rule-t' }, h('i', { html: ICON('cup') }), '컵 고르기'),
    h('span', { class: 'bk-rule-row' }, h('small', { text: SERVICES.here.name }), cell('here', 'hot'), cell('here', 'iced')),
    h('span', { class: 'bk-rule-row' }, h('small', { text: SERVICES.togo.name }), cell('togo', 'hot'), cell('togo', 'iced')));
  b.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speak(CUP_RULE, 'sys', { force: true }); });
  return b;
}

/** 단골 수첩: 평소 주문을 한 번 맞게 낸 단골(store 의 선택 기억 'usuals')만 보임 */
function regularRows() {
  const known = store.flag('usuals') || {};
  const rows = Object.entries(REGULARS).filter(([who, r]) => known[who] && r.usual?.say).map(([who, r]) => {
    const c = CHARS[who];
    const b = h('button', { class: 'bk-reg', 'aria-label': r.usual.say },
      h('span', { class: 'bk-reg-face', html: faceHTML(who, 'normal'), style: { '--accent': c?.color || '#7D7D86' } }),
      h('span', { class: 'bk-main' }, h('b', { class: 'bk-name', text: r.name }), h('span', { class: 'bk-note', text: r.usual.say })));
    b.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speak(r.usual.say, 'sys', { force: true }); });
    return b;
  });
  return rows.length ? [h('h3', { class: 'bk-sec', text: '단골 수첩' }), ...rows] : [];
}

/** 수첩 한 장(두 쪽): 컵 고르기 규칙 + 메뉴(rows) + 단골 수첩. close = [다 봤어요] 단추 */
function bookSheet(rows, close) {
  return h('section', { class: 'ov ov-brew-book', role: 'dialog', 'aria-label': '레시피 수첩' },
    h('div', { class: 'bk-card' },
      h('header', { class: 'bk-head' }, h('i', { class: 'bk-ico', html: ICON('book') }), h('div', {}, h('h2', { text: '레시피 수첩' }), h('p', { text: '메뉴를 누르면 읽어 줘요.' })), close),
      h('div', { class: 'bk-pages' }, cupRuleCard(), ...rows, ...regularRows())));
}

let looseBook = null; // 작업대 밖에서 연 수첩 { el, off }

/**
 * 위쪽 띠·멈춤 메뉴의 [레시피](2026-10-28, '숨 고르기' 대신): 이야기 어디서나 여는 레시피 수첩(읽기만, 보통 단계의 손 기술).
 * 작업대가 열려 있으면 작업대 안의 [레시피 수첩]을 눌러 그쪽 수첩을 엶(띠가 멈추도록)
 */
export function showRecipeBook() {
  const inBrew = document.querySelector('.mg-brew .bw-book-btn');
  if (inBrew) { if (!inBrew.disabled) inBrew.click(); return; }
  if (looseBook?.el.isConnected) return;
  looseBook?.off(); // 되감기·나가기(ov.clearAll)로 지워진 수첩의 뒷정리
  const focusBack = document.activeElement;
  const close = h('button', { class: 'btn btn-big btn-main bk-close' }, h('i', { html: ICON('check') }), h('span', { text: '다 봤어요' }));
  const known = store.flag('menuBook') || STARTER_BOOK;
  const el = bookSheet(Object.keys(RECIPES).filter((id) => known.includes(id)).map((id) => bookRow(id, 'normal')), close);
  const done = () => {
    off();
    if (looseBook?.el === el) looseBook = null;
    if (!el.isConnected) return; // 이미 지워짐: 소리·초점 없이
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(200));
    tts.stop();
    audio.sfx('close');
    if (focusBack?.isConnected) setTimeout(() => focusBack.focus({ preventScroll: true }), 40);
  };
  const off = bus.on('escape', done);
  looseBook = { el, off };
  close.addEventListener('click', (e) => { e.stopPropagation(); done(); });
  document.getElementById('layer-overlay').append(el);
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  audio.sfx('page');
  tts.speak(SYS.book, 'sys');
  setTimeout(() => { if (close.isConnected) close.focus({ preventScroll: true }); }, 40);
}

/* ================================================================== */
/* 미니게임                                                             */
/* ================================================================== */
/*
 * 동작마다 한 컷(Q-R9, docs/recipes.md 6.1): 블렌더로 미리 렌더한 장면(배경판) + 띠 값에 맞는 프레임(assets/shots/)
 * shots.json: { 손 기술 id: { size: [W, H], rect: [x, y, w, h](프레임 자리), levels(단계 수) } } · tools/blender/shots_post.py 가 만듦
 * 그림(images.json 'shots'): {id}_plate · {id}_l00…(줄기·김 없음) · {id}_s00…(있음: 누르는 동안 · [보기] · [한 칸] 직후). 컷이 없는 손 기술은 물건 그림으로
 */
const shotsP = typeof window === 'undefined' ? Promise.resolve({})
  : fetch('./assets/shots/shots.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));

export async function brew(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration(); // 이 번호가 바뀌면 도중에 정리된 것: 남은 손님 말·버튼 없이 끝냄
  const stopped = () => abortGeneration() !== gen;
  const shots = await shotsP; // 보통 앱을 켤 때 이미 받아 둠
  if (stopped()) return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms: 0 };
  const orders = ordersOf(opts).map((o) => ({ ...o })); // 오늘의 칠판으로 주문이 바뀔 수 있어 옮겨 씀
  // 학생마다 길(선생님 화면 · store.path): 쉬운 길은 바리스타 단계도 보통으로, 깊은 길은 보통도 바리스타 단계로(칸 좁게 · 라테아트). 사장님 시연은 그대로
  const path = store.path();
  const level0 = levelOf(opts);
  const level = opts.maker === 'owner' ? level0 : path === 'easy' && level0 === 'barista' ? 'normal' : path === 'deep' && level0 === 'normal' ? 'barista' : level0;
  // 오늘의 칠판(runner 가 넣음, menu.js TODAY_KEYS): 남은 얼음 · 우유는 같은 날의 다음 작업대로 이어짐(같은 물건을 고침)
  const today = opts.today || null;
  const book = bookOf(opts);
  const pantry = pantryOf(opts);
  const title = opts.title || TITLE;
  const debug = isDebug();

  const f = frame({ title, instruction: HOWTO, icon: 'coffee', cls: 'mg-brew', speech: speechOf(opts), quit: Boolean(opts.quit) });
  // 레시피 수첩에 들어온 메뉴(위쪽 띠의 [레시피] · 자유 영업 · 메뉴 도감이 씀)
  const knownBook = store.flag('menuBook') || [];
  if (book.some((id) => !knownBook.includes(id))) store.setFlag('menuBook', [...new Set([...knownBook, ...book])]);
  document.body.classList.add('brew-open');

  /* ---- 기록 ---- */
  const R = { attempts: 0, mistakes: 0, remakes: 0, kept: 0, watched: 0, art: 0, asked: 0, made: [], cups: [], skills: {}, adapted: [], moved: 0, moveMiss: 0, kid: { n: 0, good: 0 } };
  const result = (extra = {}) => ({
    ok: !extra.aborted && !extra.quit,
    attempts: 1, served: R.attempts, mistakes: R.mistakes, remakes: R.remakes, kept: R.kept, // runner 의 별·선생님 화면의 되감기는 attempts 로 셈
    ms: performance.now() - t0, made: [...R.made], cups: [...R.cups], watched: R.watched, skills: R.skills, art: R.art, asked: R.asked,
    adapted: [...R.adapted], moved: R.moved ? { n: R.moved, miss: R.moveMiss } : undefined, kid: R.kid.n ? { ...R.kid } : undefined, level, turn: pace().turn, ...extra,
  });

  /* ---- 도중 정리(되감기·나가기·[그만하기]) ---- */
  const STOP = Symbol('stop');
  let abortRes;
  const abortP = new Promise((r) => { abortRes = r; });
  /** 기다리기: 정리되면 STOP 을 던져 남은 일(손님 말·다음 장면)을 하지 않음 */
  const w = async (p) => {
    const r = await Promise.race([p, abortP]);
    if (r === STOP || stopped()) throw STOP;
    return r;
  };
  let over = false;
  let cleaned = false;
  let quitted = false;
  let curLoop = null;
  let talkNo = 0;
  let doneRes;
  const doneP = new Promise((r) => { doneRes = r; });
  const offQuit = opts.quit ? bus.on('mg:quit', () => { quitted = true; abortMinigame(); }) : null;

  /* ---- 화면: 손님 창 ---- */
  const btn = (icon, label, cls = '') => h('button', { class: `btn ${cls}`.trim() }, h('i', { html: icon.startsWith('<svg') ? icon : ICON(icon) }), h('span', { text: label }));
  const onTap = (el, fn) => el?.addEventListener('click', (e) => { e.stopPropagation(); fn(e); });
  const waitTap = (...els) => new Promise((resolve) => els.forEach((b, i) => b?.addEventListener('click', (e) => { e.stopPropagation(); resolve(i); }, { once: true })));
  const focusLater = (el) => setTimeout(() => { if (el?.isConnected && !el.disabled) el.focus({ preventScroll: true }); }, 40);

  const faceEl = h('div', { class: 'bw-face', 'aria-hidden': 'true' });
  const nameEl = h('p', { class: 'bw-name' });
  const orderText = h('p', { class: 'bw-order-text' });
  const relisten = btn('volume', '다시 듣기', 'btn-soft bw-relisten');
  const reactText = h('p', { class: 'bw-react-text' });
  const reactSay = h('button', { class: 'bw-ico-btn', 'aria-label': '손님 말 다시 듣기', html: ICON('volume') });
  const reactEl = h('div', { class: 'bw-react is-hidden', role: 'status' }, reactText, reactSay);
  const progress = h('div', { class: 'bw-progress', 'aria-hidden': 'true' });
  const progressText = h('p', { class: 'bw-progress-text' });
  // 레시피 수첩: 카운터 왼쪽 끝에 놓인 공책(누르면 열림). showRecipeBook() 이 .bw-book-btn 을 찾음
  const bookBtn = h('button', { class: 'bw-hot bw-book-btn', 'aria-label': '레시피 수첩 보기', style: hotStyle(HOT_POS.book) },
    objArt('obj_recipe_book'), h('span', { class: 'bw-hot-name', text: '레시피 수첩' }));
  // 주문 메모(2026-10-31 사용자): 메뉴 · 온도 · 매장/포장. 모르는 칸은 '?' → 물어보면 채워짐. 레시피를 고르는 동안에도 보임
  const ticket = h('div', { class: 'bw-ticket', role: 'group', 'aria-label': '주문 메모' });
  const guest = h('aside', { class: 'bw-guest', 'aria-label': '손님' },
    faceEl,
    h('div', { class: 'bw-talk' },
      nameEl,
      h('div', { class: 'bw-order' }, orderText, relisten),
      ticket,
      reactEl,
      h('div', { class: 'bw-queue' }, progressText, progress)));

  /* ---- 화면: 카운터 한 장면(포인트 앤 클릭, 2026-10-31 사용자 의견) ----
   * set: 16:9 카운터 그림(workbench_morning)을 칸에 꽉 채우고, 그 위에 물건(누르는 단추)을 그림과 같은 자리에 놓음
   * mat: 가운데 받침(고른 컵 + 넣은 재료) · panel: 아래 '손' 띠(넣은 것 · 할 일 · 단추). 손 기술 때는 한 컷이 장면을 덮음 */
  const spots = { left: h('div', { class: 'bw-spot s-left' }), center: h('div', { class: 'bw-spot s-center' }), right: h('div', { class: 'bw-spot s-right' }) };
  const tube = h('div', { class: 'bw-tube is-hidden' }, h('i', { class: 'bw-tube-zone' }), h('i', { class: 'bw-tube-fill' }));
  const hots = h('div', { class: 'bw-hots', role: 'group', 'aria-label': '카운터의 물건' });
  const mat = h('div', { class: 'bw-mat', 'aria-hidden': 'true', style: hotStyle(HOT_POS.mat) });
  // 나무판(꾸밈): 컵 줄 아래 · 우유 · 시럽 · 얼음 아래. 물건이 같은 줄에 정돈되어 보이게
  const cupEnds = [CUP_ROW.x - 3.4, CUP_ROW.x + (pantry.cups.length - 1) * CUP_ROW.step + 3.4];
  const board = ([a, b], bottom = BACK) => h('i', { class: 'bw-board', style: { left: `${a}%`, width: `${b - a}%`, bottom: `${bottom - 1.2}%` } }); // 물건 바닥이 판 윗면 가운데에
  const onShelf = [...pantry.bases, ...pantry.adds].some((id) => INGREDIENTS[id]?.shelf);
  const boards = h('div', { class: 'bw-boards', 'aria-hidden': 'true' }, ...[board(cupEnds), pantry.temps.includes('iced') || pantry.adds.includes('syrup') ? board(BOARD_BOTTLES) : null, onShelf ? board(BOARD_SHELF, SHELF) : null].filter(Boolean));
  const set = h('div', { class: 'bw-set' }, boards, mat, hots, bookBtn);
  const scene = h('div', { class: 'bw-scene' }, set, spots.left, spots.center, tube, spots.right);
  const panel = h('div', { class: 'bw-panel' });
  // 오늘의 칠판(작은 칠판, 카운터 오른쪽 위): 남은 얼음 · 우유 · 머신 · 사장님. 깊은 길은 '오늘의 도전'도(다른 학생과 견주지 않는 혼자의 목표)
  const todayEl = h('div', { class: 'bw-today', role: 'status', 'aria-label': '오늘의 칠판' });
  const showToday = () => {
    const tags = todayTags(today);
    const goal = path === 'deep' && opts.maker !== 'owner' ? '도전: 손 동작 모두 「딱 좋아요」' : null;
    todayEl.replaceChildren(...[
      tags.length ? h('b', { text: '오늘의 칠판' }) : null,
      ...tags.map((t) => h('span', { text: t })),
      goal ? h('span', { class: 'is-goal' }, h('i', { html: ICON('star') }), goal) : null,
    ].filter(Boolean));
    todayEl.hidden = !tags.length && !goal;
  };
  showToday();
  const bench = h('section', { class: 'bw-bench', 'aria-label': '작업대' }, scene, guest, todayEl, panel);
  if (img.has('bg', 'workbench_morning')) set.style.backgroundImage = `url('${img.url('bg', 'workbench_morning')}')`;
  f.body.append(bench);

  /* ---- 상태 ---- */
  let cur = null;          // 지금 손님(주문)
  let curIndex = 0;
  let phase = 'busy';      // recipe · gate · skill · serve · wrong · mild · good · busy (자동 플레이가 봄)
  const warmTemp = pantry.temps.includes('hot') ? 'hot' : pantry.temps[0];
  let made = { cup: null, base: null, adds: [], temp: warmTemp };
  let ings = [];           // 컵에 넣을 재료(누른 차례). 바탕·더하기는 arrange() 가 레시피에 맞춰 나눔
  let recipeDone = null;   // [만들기 시작] → 고른 레시피
  let fix = null;          // maker: 'owner' — 사장님이 만들기 전에 일러 준 것 { target, say }(고칠 때까지 손 띠에 표시)
  let armed = null;        // '두 번 눌러 고르기': 한 번 눌러 읽어 준 버튼
  let safetySaid = false;
  const ui = {};           // 자동 플레이가 누를 버튼

  /* ---- 읽어 주기: 여러 말을 차례로(새 말이 오면 앞의 차례는 그만) ---- */
  const sysV = (t) => [t, 'sys'];
  const guestV = (t) => [t, voiceOf(cur?.who, 'say')];
  let talking = Promise.resolve(); // 지금 읽는 한 문장
  async function talk(...parts) {
    const my = (talkNo += 1);
    for (const p of parts) {
      if (!p || !p[0]) continue;
      if (my !== talkNo || stopped() || over) return;
      talking = tts.speak(p[0], p[1]);
      await talking;
    }
  }
  /** 게임이 스스로 다음 단계로 넘어갈 때: 지금 읽는 한 문장(손 기술 결과 등)은 끝까지 듣고 시작. 학생이 누른 것에 답할 때는 talk(2026-10-31 고침: 결과 말이 다음 안내에 잘림) */
  async function talkAfter(...parts) {
    const my = (talkNo += 1);
    await talking;
    if (my !== talkNo || stopped() || over) return;
    await talk(...parts);
  }
  const sayBtn = (text, voice = 'sys') => {
    const b = h('button', { class: 'bw-ico-btn', 'aria-label': '다시 듣기', html: ICON('volume') });
    onTap(b, () => tts.speak(text, voice, { force: true }));
    return b;
  };
  /** 할 일 한 줄: 번호 · 글 · [다시 듣기](say: 읽어 줄 말, null 이면 버튼 없음) */
  const askRow = (badge, text, { say = text } = {}) => h('div', { class: 'bw-ask' },
    badge ? h('b', { class: 'bw-ask-n', text: badge }) : null,
    h('p', { class: 'bw-ask-t', text }),
    say ? sayBtn(say) : null);
  const setPanel = (...kids) => { panel.replaceChildren(...kids.filter(Boolean)); panel.dataset.kind = ''; };
  /** 결과를 읽을 시간(움직임 줄이기와 상관없이 그대로. dur() 는 애니메이션 시간에만) */
  const pauseMs = (ms) => sleep(robot ? Math.max(60, ms / 4) : ms);

  /* ---- 손님 창 ---- */
  function showGuest(face = 'normal') {
    const c = CHARS[cur.who];
    faceEl.innerHTML = c ? faceHTML(cur.who, face) : `<span class="bw-face-blank">${ICON('smile')}</span>`;
    faceEl.style.setProperty('--accent', c?.color || '#7D7D86');
    nameEl.textContent = c?.name || '손님';
  }
  function setReact(text) {
    reactText.textContent = text || '';
    reactEl.classList.toggle('is-hidden', !text);
  }
  /**
   * 엉뚱한 잔 맛보기(재미 개편 3.2): 손님 자리에 잠깐 사장님. 처음 한 번은 긴 침묵 → 얼굴 확대 → "…새 메뉴로 하자." "네?!" "농담이다."
   * 그다음은 그 잔의 한마디 → 엉뚱한 잔 도감(지은의 성장 odd). 실수로 세지 않고 단골 신뢰와도 관계없음
   */
  async function ownerTaste() {
    phase = 'busy';
    const odd = findOdd(made);
    const firstEver = !store.grow().odd.length;
    const isNew = grow.addOdd(odd.id);
    const say = (...parts) => w(robot ? sleep(60) : talk(...parts));
    faceEl.innerHTML = faceHTML('owner', 'normal');
    faceEl.style.setProperty('--accent', CHARS.owner?.color || '#7D7D86');
    nameEl.textContent = CHARS.owner?.name || '사장님';
    setReact(SYS.taste);
    audio.sfx('nom');
    await say(sysV(SYS.taste));
    if (firstEver) {
      setReact(ODD_FIRST.pause);
      faceEl.classList.add('is-zoom');
      await w(sleep(robot ? 60 : 1400));
      setReact(ODD_FIRST.owner);
      await say([ODD_FIRST.owner, 'owner']);
      faceEl.classList.remove('is-zoom');
      setReact(`${CHARS.jieun?.name || '지은'}: ${ODD_FIRST.jieun}`);
      audio.sfx('miss_high');
      await say([ODD_FIRST.jieun, 'jieun']);
      setReact(ODD_FIRST.joke);
      audio.sfx('sad_trombone');
      await say([ODD_FIRST.joke, 'owner']);
    }
    setReact(odd.say);
    await say([odd.say, 'owner']);
    const note = isNew ? `「${odd.name}」 ${SYS.odd}` : SYS.oddAgain;
    setReact(note);
    audio.sfx(isNew ? 'jingle_unlock' : 'tap');
    await say(sysV(note));
  }
  function showProgress() {
    progressText.textContent = orders.length > 1 ? `손님 ${curIndex + 1} / ${orders.length}` : '손님';
    progress.replaceChildren(...orders.map((_, i) => h('i', { class: i < curIndex ? 'done' : i === curIndex ? 'now' : '', html: ICON('coffee') })));
  }
  onTap(relisten, () => tts.speak(cur.say, voiceOf(cur.who, 'say'), { force: true }));
  onTap(reactSay, () => tts.speak(reactText.textContent, voiceOf(cur.who, 'say'), { force: true }));

  /* ---- 레시피 수첩(오픈북): 열려 있는 동안 띠가 멈춤 ---- */
  let bookEl = null;
  let offEsc = null;
  let focusBack = null;
  function openBook() {
    if (bookEl || over) return;
    focusBack = document.activeElement;
    const close = btn('check', '다 봤어요', 'btn-big btn-main bk-close');
    bookEl = bookSheet(book.map((id) => bookRow(id, level)), close);
    document.getElementById('layer-overlay').append(bookEl);
    input.pushScope(bookEl);
    const el = bookEl;
    requestAnimationFrame(() => el.classList.add('is-in'));
    audio.sfx('page');
    tts.speak(SYS.book, 'sys');
    onTap(close, () => closeBook());
    offEsc = bus.on('escape', () => closeBook());
    focusLater(close);
  }
  function closeBook(silent = false) {
    if (!bookEl) return;
    const el = bookEl;
    bookEl = null;
    offEsc?.();
    offEsc = null;
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(200));
    if (silent) return;
    tts.stop();
    audio.sfx('close');
    focusLater(focusBack?.isConnected ? focusBack : bookBtn);
  }
  onTap(bookBtn, openBook);

  /* ---- 작업대: 손 기술의 한 컷(있으면) ---- */
  /**
   * 배경판을 작업대 칸에 꽉 채우고(cover), 띠 값에 맞는 프레임을 그 자리에 겹침. 컷 그림이 없으면 null(물건 그림으로)
   * shots.json 의 plate: 다른 컷과 같은 배경판(붓기 두 가지) · art: 라테아트 프레임이 있는 단계
   */
  function shotView(id, { drag = false } = {}) {
    const m = shots[id];
    const plateId0 = m?.plate || `${id}_plate`;
    if (!m || !img.has('shots', plateId0)) return null;
    // 조작법 '드래그 활용'(2026-11-02 사용자): 끌어 붓기는 붓기 전의 덜 기운 그릇(tilt), 얼음 담기는 얼음 통이 있는 배경판 + 국자(ice)
    const iceDrag = drag && m.drag && img.has('shots', m.drag.plate) && img.has('shots', `${id}_scoop`) ? m.drag : null;
    const tiltM = drag && m.tilt?.patch && img.has('shots', `${plateId0}_bare`) && img.has('shots', `${plateId0}_v0`) ? m.tilt : null;
    const plateId = iceDrag ? iceDrag.plate : plateId0;
    const [W, H] = m.size;
    const [x, y, rw, rh] = m.rect;
    const nn = (k) => String(k).padStart(2, '0');
    const urls = { l: [], s: [], a: [], p: [], v: [] };
    for (let k = 0; k < m.levels; k++) {
      for (const kind of ['l', 's']) urls[kind].push(img.url('shots', `${id}_${kind}${nn(k)}`));
      if (tiltM) urls.p.push(img.url('shots', `${id}_p${nn(k)}`));
    }
    for (const k of m.art || []) urls.a[k] = img.url('shots', `${id}_a${nn(k)}`);
    for (let i = 0; tiltM && i < tiltM.n; i++) urls.v.push(img.url('shots', `${plateId0}_v${i}`));
    const pct = (a, b) => `${(a / b) * 100}%`;
    const at = (el, [ax, ay, aw, ah]) => Object.assign(el.style, { left: pct(ax, W), top: pct(ay, H), width: pct(aw, W), height: pct(ah, H) });
    const frameEl = h('img', { class: 'bw-shot-frame', alt: '', draggable: 'false', style: { left: pct(x, W), top: pct(y, H), width: pct(rw, W), height: pct(rh, H) } });
    const plateEl = h('img', { class: 'bw-shot-plate', src: img.url('shots', plateId), alt: '', draggable: 'false' });
    const box = h('div', { class: 'bw-shot-box' }, plateEl, frameEl);
    // 덜 기운 그릇: 그릇 없는 배경판 + 프레임 + 굳은 그릇 자리만 그릇 없는 조각(단계마다) + 덜 기운 그릇 그림
    const patchEl = tiltM ? h('img', { class: 'bw-shot-frame bw-shot-patch', alt: '', draggable: 'false', hidden: true }) : null;
    const vesselEl = tiltM ? h('img', { class: 'bw-shot-frame bw-shot-vessel', alt: '', draggable: 'false', hidden: true }) : null;
    if (tiltM) {
      at(patchEl, tiltM.patch);
      at(vesselEl, tiltM.vessel);
      box.append(patchEl, vesselEl);
    }
    const el = h('div', { class: 'bw-shot', 'data-shot': id }, box);
    const bareUrl = tiltM ? img.url('shots', `${plateId0}_bare`) : null;
    let keep = [...urls.l, ...urls.s, ...urls.a, ...urls.p, ...urls.v, bareUrl].filter(Boolean).map((u) => Object.assign(new Image(), { src: u })); // 바뀔 때 깜빡이지 않게 미리 받기
    const fit = () => { // 칸 크기가 조금 달라져도(아래 손 띠의 높이에 따라) 빈틈 없이
      const s = Math.max(el.clientWidth / W, el.clientHeight / H) || 1;
      box.style.width = `${W * s}px`;
      box.style.height = `${H * s}px`;
    };
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    let last = '';
    let tiltI = null; // 붓지 않을 때 보일 덜 기운 그릇(0 = 가장 덜 기욺), null = 원래 컷(굳은 그릇)
    let now = [0, false, false];
    const swap = (im, u) => { if (u && im.getAttribute('src') !== u) im.src = u; };
    return {
      el,
      /** 끌어 붓기 그림이 있는지: 덜 기운 그릇 수 · 얼음 끌기 정보 */
      tiltN: tiltM ? tiltM.n : 0,
      ice: iceDrag,
      size: [W, H],
      start() { fit(); ro?.observe(el); },
      /** v: 띠 값 0~1 · flow: 줄기(누르는 동안 · [보기]로 차는 동안 · [한 칸] 바로 뒤) · art: 라테아트(가장 가까운 단계의 그림) */
      set(v, flow, art = false) {
        now = [v, flow, art];
        const k = Math.max(0, Math.min(m.levels - 1, Math.round(v * (m.levels - 1))));
        const ka = art && m.art?.length ? m.art.reduce((b, a) => (Math.abs(a - k) < Math.abs(b - k) ? a : b), m.art[0]) : -1;
        const u = ka >= 0 ? urls.a[ka] : (flow ? urls.s : urls.l)[k];
        if (u && u !== last) {
          frameEl.src = u;
          last = u;
        }
        if (!tiltM) return;
        const bare = tiltI !== null && !flow && ka < 0; // 붓는 동안 · 라테아트는 원래 컷(굳은 그릇)
        swap(plateEl, bare ? bareUrl : img.url('shots', plateId));
        patchEl.hidden = !bare;
        vesselEl.hidden = !bare;
        if (bare) {
          swap(patchEl, urls.p[k]);
          swap(vesselEl, urls.v[tiltI]);
        }
      },
      /** 덜 기운 그릇(i = 0 ~ tiltN-1), null 이면 원래 컷 */
      tilt(i) {
        if (!tiltM) return;
        tiltI = i === null ? null : Math.max(0, Math.min(tiltM.n - 1, i));
        this.set(...now);
      },
      /** 장면 위에 얹는 것(국자 · 안내 손): 배경판 좌표 [x, y, w, h] 로 자리 */
      put(node, rect) {
        at(node, rect);
        if (node.parentNode !== box) box.append(node);
      },
      /** 화면 좌표 → 배경판 좌표 */
      toPlate(cx, cy) {
        const r = box.getBoundingClientRect();
        return [((cx - r.left) / (r.width || 1)) * W, ((cy - r.top) / (r.height || 1)) * H];
      },
      /** 배경판 좌표 → 화면 좌표 */
      toClient(px, py) {
        const r = box.getBoundingClientRect();
        return [r.left + (px / W) * r.width, r.top + (py / H) * r.height];
      },
      stop() { ro?.disconnect(); keep = []; },
    };
  }

  /** 손 동작 → 블렌더 한 컷 id(이름 규칙은 menu.js 의 shotNames). 맞는 컷이 없으면 null(임시 그림) */
  function shotIdFor(id, soFar) {
    if (id === 'steam' && cur?.kid && shots.steam_kid) return 'steam_kid'; // 아이 잔: 온도계의 초록 칸이 낮은 컷
    return shotNames(id, made, soFar).ids.find((x) => x && shots[x]) || null;
  }

  /* ---- 작업대 물건 ---- */
  let curShot = null;
  let closeEl = null; // 손 기술의 확대 창(그 손 기술이 끝나도 다음 단계까지 남음)
  function closeUpOff() {
    if (!closeEl) return;
    input.popScope(closeEl);
    closeEl.remove();
    closeEl = null;
    bench.classList.remove('is-close');
  }
  /** host: 한 컷을 넣을 곳(확대 창 안). keep: 확대 창을 그대로 둠(손 기술 안에서 부를 때) */
  function setScene({ left = null, center = null, right = null, mode = '', tubeFor = null, shot = null, host = null, keep = false } = {}) {
    if (!keep) closeUpOff();
    spots.left.replaceChildren(...[left].flat().filter(Boolean));
    spots.center.replaceChildren(...[center].flat().filter(Boolean));
    spots.right.replaceChildren(...[right].flat().filter(Boolean));
    if (curShot !== shot) {
      curShot?.stop();
      curShot?.el.remove();
      curShot = shot;
      if (shot) {
        (host || scene).append(shot.el);
        shot.start();
      }
    }
    scene.classList.toggle('is-shot', Boolean(shot) && !host);
    scene.dataset.mode = mode;
    tube.classList.toggle('is-hidden', !tubeFor);
    if (tubeFor) {
      const sk = HAND_SKILLS[tubeFor];
      tube.className = `bw-tube t-${tubeFor}`;
      tube.style.setProperty('--z0', sk.zone[0]);
      tube.style.setProperty('--z1', sk.zone[1]);
    }
  }
  /* ---- 레시피 고르기: 카운터의 물건을 눌러 담기(포인트 앤 클릭, 2026-10-31) ----
   * 컵을 누르면 가운데 받침에 놓이고(다른 컵이면 바꿈, 같은 컵이면 제자리로), 재료 물건을 누르면 컵에 넣을 것에 들어감(다시 누르면 뺌).
   * 얼음 통을 누르면 차갑게(다시 누르면 따뜻하게). 컵과 재료 하나가 있으면 [만들기 시작]. 차례는 자유롭고, 바탕·더하기는 arrange() 가 나눔 */
  const ingList = () => [...new Set([...pantry.bases, ...pantry.adds])];
  /** 넣은 재료(차례 상관없이)를 바탕·더하기로: 주문 레시피 → 다른 레시피 → 바탕이 될 수 있는 첫 재료 */
  function arrange() {
    const fits = (r) => (r && sameSet([r.base, ...r.adds], ings) ? r : null);
    const r = fits(orderTarget(cur)) || Object.values(RECIPES).map(fits).find(Boolean);
    if (r) {
      made.base = r.base;
      made.adds = [...r.adds];
      return;
    }
    made.base = ings.find((id) => INGREDIENTS[id].roles.includes('base')) || null;
    made.adds = ings.filter((id) => id !== made.base);
  }
  const ready = () => Boolean(made.cup && ings.length);
  const promptNow = () => (!made.cup ? PROMPT.cup : !ings.length ? PROMPT.base : PROMPT.adds);

  /**
   * 물건 단추 하나: 그림 + 이름(늘 보임) + 고른 표시
   * out: 오늘의 칠판에서 다 떨어진 것(우유 · 얼음, 2026-11-06 사용자 "Yes, add it", 검수 13.62): 빈 그릇 그림(RUN_OUT)이 있으면 그 그림,
   *      없으면 가득 찬 그림을 흐리게. 이름표는 '우유 없음', 읽어 줄 이름에 '다 떨어졌어요'(글자로도 알림, 원칙 11)
   */
  function hotBtn(key, art, name, pos, on, cls = '', out = null) {
    const empty = out && img.has('objects', out) ? out : null;
    const b = h('button', {
      class: `bw-hot ${cls} ${on ? 'is-on' : ''} ${out ? `is-runout${empty ? '' : ' is-runout-dim'}` : ''}`.trim().replace(/\s+/g, ' '), 'data-hot': key, style: hotStyle(pos),
      'aria-pressed': String(on), 'aria-label': `${name}${out ? ', 다 떨어졌어요' : ''}${on ? ', 골랐어요' : ''}`,
    }, objArt(empty || art), h('span', { class: 'bw-hot-name', text: name }), out ? h('b', { class: 'bw-hot-out', text: '없음' }) : null, on ? h('i', { class: 'bw-hot-on', html: ICON('check') }) : null);
    return b;
  }
  /** 오늘의 칠판에서 다 떨어졌으면 빈 그릇 그림 ID(그림이 아직 없어도 ID 를 돌려줌: hotBtn 이 흐리게 함), 아니면 null */
  const RUN_OUT = { milk: ['milk', 'obj_milk_bottle_empty'], iced: ['ice', 'obj_ice_bucket_empty'] };
  const runOut = (k) => {
    const [field, id] = RUN_OUT[k] || [];
    return field && today?.[field] !== undefined && today[field] <= 0 ? id : null;
  };

  function renderHots() {
    const map = new Map();
    const kids = [];
    const outCup = opts.setOut && cur ? cupFor(cur) : null; // 사장님이 꺼내 둔 컵(setOut): 그 컵을 받침에 놓으면 사라짐, 다른 컵을 골라도 남아 있음
    pantry.cups.forEach((id, i) => {
      const onMat = made.cup === id;
      const setOut = id === outCup && !onMat;
      const b = hotBtn(`cup:${id}`, cupArtId(id), CUPS[id].name, [CUP_ROW.x + i * CUP_ROW.step, CUP_ROW.bottom, CUP_W[id] || 4.8], onMat, `is-cup${onMat ? ' is-away' : ''}${setOut ? ' is-setout' : ''}`);
      if (setOut) {
        b.append(h('b', { class: 'bw-hot-setout', text: '사장님이 꺼내 둠' }));
        b.setAttribute('aria-label', `${CUPS[id].name}, 사장님이 꺼내 둔 컵`);
      }
      onTap(b, () => press(b, CUPS[id].name, () => pickCup(id)));
      map.set(`cup:${id}`, b);
      kids.push(b);
    });
    for (const id of ingList()) {
      const pos = HOT_POS[id];
      if (!pos) continue;
      const on = ings.includes(id);
      const b = hotBtn(`ing:${id}`, HOT_ART[id] || INGREDIENTS[id].obj, INGREDIENTS[id].name, pos, on, id === 'espresso' ? 'is-machine' : '', runOut(id));
      onTap(b, () => press(b, INGREDIENTS[id].name, () => pickIng(id)));
      map.set(`ing:${id}`, b);
      kids.push(b);
    }
    if (pantry.temps.includes('iced')) {
      const on = made.temp === 'iced';
      const b = hotBtn('temp:iced', HOT_ART.iced, '얼음', HOT_POS.iced, on, '', runOut('iced'));
      onTap(b, () => press(b, '얼음', () => pickIce()));
      map.set('temp:iced', b);
      kids.push(b);
    }
    hots.replaceChildren(...kids);
    ui.hot = map;
    // 가운데 받침: 고른 컵 + 넣을 재료(작게)
    mat.replaceChildren(...[ // replaceChildren 은 null 을 글자 'null' 로 넣음
      made.cup ? Object.assign(objArt(cupArtId(made.cup), 'bw-mat-cup'), { style: `width: ${((CUP_W[made.cup] || 4.8) * 1.1 / HOT_POS.mat[2]) * 100}%` }) : h('span', { class: 'bw-mat-empty', text: '컵을 놓는 곳' }),
      ings.length || made.temp === 'iced' ? h('span', { class: 'bw-mat-ings' }, ...ings.map((id) => objArt(INGREDIENTS[id].obj, 'small')), made.temp === 'iced' ? objArt('iced', 'small') : null) : null,
    ].filter(Boolean));
  }

  /** 아래 '손' 띠: 할 일 · 넣은 것(누르면 뺌) · [처음부터 다시] · [만들기 시작]. hint: 손님이 다시 보라고 한 곳 · lock: 보기만
   *  miss: 레시피가 틀렸을 때 재료 { missing: 빠진 것(빈 칸을 더해 그 이름 + '빠진 재료'), extra: 넘치는 것('빼요') }. 맞게 넣은 재료에는 표시 없음
   *  (2026-11-01 사용자: 물이 빠졌는데 원두가 잘못되었다고 표시됨 → 원두가 아니라 빈 칸이 더해지며 빠진 재료로) */
  function handRow({ hint = [], lock = false, miss = null } = {}) {
    const chip = (label, art, onClick, isHint, tag = '다시 봐요') => {
      const b = h('button', { class: `bw-chip ${isHint ? 'is-hint' : ''}`.trim(), disabled: lock, 'aria-label': `${label}${isHint ? `, ${tag}` : ''}${lock ? '' : ', 누르면 빼요'}` },
        art, h('em', { text: label }), isHint ? h('span', { class: 'bw-chip-hint', text: tag }) : null);
      if (!lock) onTap(b, onClick);
      return b;
    };
    const slots = [];
    slots.push(made.cup ? chip(CUPS[made.cup].name, objArt(cupArtId(made.cup), 'small'), () => pickCup(made.cup), hint.includes('cup'))
      : h('span', { class: `bw-chip is-empty ${hint.includes('cup') ? 'is-hint' : ''}`.trim() }, h('i', { html: ICON('cup') }), h('em', { text: '컵' })));
    const ingHint = hint.includes('base') || hint.includes('adds');
    for (const id of ings) {
      slots.push(miss ? chip(INGREDIENTS[id].name, objArt(INGREDIENTS[id].obj, 'small'), () => pickIng(id), miss.extra.includes(id), '빼요')
        : chip(INGREDIENTS[id].name, objArt(INGREDIENTS[id].obj, 'small'), () => pickIng(id), ingHint));
    }
    for (const id of miss?.missing || []) { // 빠진 재료: 빈 칸에 그 이름
      slots.push(h('span', { class: 'bw-chip is-empty is-hint is-missing', role: 'note', 'aria-label': `빠진 재료: ${INGREDIENTS[id].name}` },
        objArt(INGREDIENTS[id].obj, 'small'), h('em', { text: INGREDIENTS[id].name }), h('span', { class: 'bw-chip-hint', text: '빠진 재료' })));
    }
    if (!ings.length && !miss?.missing.length) slots.push(h('span', { class: `bw-chip is-empty ${ingHint ? 'is-hint' : ''}`.trim() }, h('i', { html: ICON('milk') }), h('em', { text: '재료' })));
    ui.tempChip = null;
    if (pantry.temps.length > 1) {
      // 온도: 누르면 따뜻하게 · 차갑게를 고르는 작은 창(openTemp)
      const t = made.temp;
      const isHint = hint.includes('temp');
      const b = h('button', {
        class: `bw-chip is-temp t-${t}${isHint ? ' is-hint' : ''}`, disabled: lock, 'aria-haspopup': 'dialog',
        'aria-label': `${TEMPS[t]?.name || ''}${lock ? '' : ', 누르면 온도를 골라요'}`,
      }, t === 'iced' ? objArt('iced', 'small') : h('i', { html: ICON(TEMPS[t]?.icon || 'coffee') }), h('em', { text: TEMPS[t]?.name || '' }),
      isHint ? h('span', { class: 'bw-chip-hint', text: '다시 봐요' }) : null);
      if (!lock) onTap(b, () => openTemp(b));
      ui.tempChip = b;
      slots.push(b);
    }
    // 칸이 다섯 개 넘으면 조금 작게 해서 한 줄에(2026-11-07 사용자 '재료가 5개 이상부터는 이렇게 아래로 버튼이 내려오는데, 매우 보기 싫다', 검수 13.85)
    return h('div', { class: `bw-hand${slots.length >= 5 ? ' is-many' : ''}`, role: 'group', 'aria-label': '컵에 넣을 것' }, ...slots);
  }

  /** 기억(지은의 성장)이 오르면 단골의 '늘 먹던 거'를 한 번에 담음(재미 개편 6.1) */
  function fillUsual() {
    if (phase !== 'recipe') return;
    const t = orderTarget(cur);
    made.cup = t.cup;
    made.temp = t.temp;
    ings = [t.base, ...(t.adds || [])].filter(Boolean);
    audio.sfx('pickup');
    renderRecipe();
    focusLater(ui.make);
    talk(sysV(SYS.usualFill), sysV(PROMPT.confirm));
  }

  function renderRecipe() {
    renderHots();
    const foot = [];
    // '한 잔 더'(more)도 앞 주문이 늘 먹던 것이면 같은 단추(2026-11-07 사용자 "해순 할머니 두 번째 우유잔 … 늘 시키는 대로 버튼이 없네", 검수 13.84)
    const usualLike = (i) => Boolean(orders[i]?.usual || (orders[i]?.more && i > 0 && usualLike(i - 1)));
    if (usualLike(curIndex) && !fix && opts.maker !== 'owner' && grow.level('memory') >= grow.UNLOCK.memoryUsual) {
      const usualB = btn('book', '늘 드시던 거', 'btn-soft bw-usual');
      onTap(usualB, fillUsual);
      ui.usual = usualB;
      foot.push(usualB);
    } else ui.usual = null;
    if (made.cup || ings.length || made.temp !== warmTemp) {
      const reset = btn('repeat', '처음부터 다시', 'btn-soft bw-reset');
      onTap(reset, resetRecipe);
      ui.reset = reset;
      foot.push(reset);
    } else ui.reset = null;
    const go = btn('play', '만들기 시작', 'btn-big btn-main bw-make');
    go.disabled = !ready();
    onTap(go, () => {
      if (phase !== 'recipe' || !recipeDone || !ready()) return;
      audio.sfx('tap');
      arrange();
      const r = recipeDone;
      recipeDone = null;
      phase = 'busy';
      r({ ...made, adds: [...made.adds] });
    });
    ui.make = go;
    foot.push(go);
    const fx = fixNow();
    // 사장님이 일러 준 뒤에는 할 일 줄 자리에 사장님의 말(띠 높이는 그대로). 다 고치면 "이제 됐어요."
    setPanel(fx ? ownerAsk(fx.done ? '이제 됐어요. [만들기 시작]을 눌러요.' : fx.say) : askRow('', promptNow()), handRow(fx || {}), h('div', { class: 'bw-row' }, ...foot));
    panel.dataset.kind = 'hand';
  }

  /** '두 번 눌러 고르기' 설정이면 처음 누를 때 이름만 읽어 줌 */
  function press(b, label, fn) {
    if (phase !== 'recipe') return;
    if (store.settings().selectMode === 'two' && armed !== b) {
      armed?.classList.remove('is-armed');
      armed = b;
      b.classList.add('is-armed');
      audio.sfx('focus');
      talk(sysV(label));
      return;
    }
    armed?.classList.remove('is-armed');
    armed = null;
    fn();
  }

  /** 다시 그린 뒤 같은 물건에 초점(키보드·스캔이 자리를 잃지 않게) */
  function keepFocus(key) {
    renderRecipe();
    focusLater(ui.hot.get(key) || (ready() ? ui.make : null));
  }

  function pickCup(id) {
    if (phase !== 'recipe') return;
    const back = made.cup === id;
    made.cup = back ? null : id;
    audio.sfx(back ? 'tap' : 'clink');
    keepFocus(`cup:${id}`);
    if (!back) talk(sysV(CUPS[id].name), sysV(promptNow()));
  }

  function pickIng(id) {
    if (phase !== 'recipe') return;
    const i = ings.indexOf(id);
    if (i >= 0) {
      ings.splice(i, 1);
      audio.sfx('tap');
    } else if (ings.length >= 1 + MAX_ADDS) {
      audio.sfx('tap');
      talk(sysV(SYS.full));
      return;
    } else {
      ings.push(id);
      audio.sfx('pickup');
      talk(sysV(INGREDIENTS[id].name), ings.length === 1 && made.cup ? sysV(PROMPT.adds) : null);
    }
    keepFocus(`ing:${id}`);
  }

  function pickIce() {
    if (phase !== 'recipe') return;
    made.temp = made.temp === 'iced' ? warmTemp : 'iced';
    audio.sfx(made.temp === 'iced' ? 'ice' : 'tap');
    keepFocus('temp:iced');
    talk(sysV(TEMPS[made.temp].name));
  }

  /* ---- 온도 고르기 창(2026-10-31 사용자 "따뜻하게 버튼을 누르면 팝업이 뜨면서 따뜻하게와 차갑게를 고를 수 있게") ----
   * 손 띠의 온도 칩 바로 위에 뜸. 카운터의 얼음을 눌러도 차갑게(같은 값). 창 밖을 누르거나 Esc 면 바꾸지 않고 닫음 */
  let tempEl = null;
  let offTempEsc = null;
  function openTemp(anchor) {
    if (phase !== 'recipe' || tempEl || over) return;
    armed?.classList.remove('is-armed');
    armed = null;
    const opts = pantry.temps.map((t) => {
      const on = made.temp === t;
      const b = h('button', { class: `bw-temp-opt t-${t}${on ? ' is-on' : ''}`, 'aria-pressed': String(on), 'aria-label': `${TEMPS[t].name}${on ? ', 지금 골랐어요' : ''}` },
        t === 'iced' ? objArt('iced', 'small') : h('i', { html: ICON(TEMPS[t].icon || 'coffee') }),
        h('b', { text: TEMPS[t].name }),
        on ? h('i', { class: 'bw-temp-on', html: ICON('check') }) : null);
      onTap(b, () => chooseTemp(t));
      return b;
    });
    const pop = h('div', { class: 'bw-temp-pop' }, h('p', { text: SYS.temp }), h('div', { class: 'bw-temp-opts' }, ...opts));
    const el = h('section', { class: 'ov ov-brew-temp', role: 'dialog', 'aria-label': '온도 고르기' }, pop);
    el.addEventListener('click', (e) => { if (e.target === el) { e.stopPropagation(); closeTemp(); } });
    const layer = document.getElementById('layer-overlay');
    layer.append(el);
    // 칩 바로 위에(무대가 화면에 맞춰 줄어 있어 화면 좌표를 무대 좌표로 바꿈)
    const lr = layer.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    const k = lr.width / (layer.offsetWidth || lr.width) || 1;
    pop.style.left = `${(ar.left + ar.width / 2 - lr.left) / k}px`;
    pop.style.bottom = `${(lr.bottom - ar.top) / k + 18}px`;
    tempEl = el;
    ui.tempOpts = new Map(pantry.temps.map((t, i) => [t, opts[i]]));
    input.pushScope(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    offTempEsc = bus.on('escape', () => closeTemp());
    audio.sfx('open');
    talk(sysV(SYS.temp));
    focusLater(opts[pantry.temps.indexOf(made.temp)] || opts[0]);
  }
  function closeTemp(focus = true) {
    if (!tempEl) return;
    const el = tempEl;
    tempEl = null;
    ui.tempOpts = null;
    offTempEsc?.();
    offTempEsc = null;
    input.popScope(el);
    el.remove();
    if (focus) focusLater(ui.tempChip);
  }
  function chooseTemp(t) {
    if (phase !== 'recipe') return;
    closeTemp(false);
    const was = made.temp;
    made.temp = t;
    audio.sfx(t === 'iced' && was !== 'iced' ? 'ice' : 'tap');
    renderRecipe();
    focusLater(ui.tempChip);
    talk(sysV(TEMPS[t].name));
  }

  function pickRecipe(keep) {
    phase = 'recipe';
    armed = null;
    if (!keep) {
      made = { cup: null, base: null, adds: [], temp: warmTemp };
      ings = [];
    }
    setScene({ mode: 'recipe' });
    renderRecipe();
    focusLater(keep ? ui.make : ui.hot.values().next().value);
    return new Promise((r) => { recipeDone = r; });
  }

  function resetRecipe() {
    audio.sfx('tap');
    made = { cup: null, base: null, adds: [], temp: warmTemp };
    ings = [];
    renderRecipe();
    focusLater(ui.hot.values().next().value);
    talk(sysV(PROMPT.cup));
  }

  /* ---- 손 기술이 모자라거나 넘쳤을 때(2026-10-31 사용자 "더 화려하게 · 주인공의 시무룩한 표정 · 효과음도 더 극적이게") ----
   * 확대 창이 살짝 흔들리고, 큰 글자 도장(앗, 연해요!) + 시무룩한 지은(넘침 = 식은땀, 모자람 = 그늘 줄) + 튀는 방울(넘침) · 빠지는 김(모자람).
   * 효과음: 넘침 = 철퍽 → 깜짝 → 식은땀, 모자람 = 쪼그라듦 → 축 처짐. 장난스러운 과장이고 감점 · 실패 화면은 없음(원칙 2).
   * 움직임 줄이기 · 차분 모드: 흔들림 · 튀는 것 없이 도장과 얼굴만 그대로 보임 */
  const later = (ms, fn) => setTimeout(() => { if (!over && !stopped()) fn(); }, ms);
  let missNo = 0; // [다시 하기]를 빨리 누르면 늦게 오는 효과음을 내지 않음
  function missShow(view, sk, zone) {
    const high = zone === 'high';
    const kind = high ? 'm-high' : 'm-low';
    const no = ++missNo;
    const after = (ms, fn) => later(ms, () => { if (no === missNo) fn(); });
    closeEl?.classList.add('is-miss', kind);
    view.append(
      h('div', { class: `bw-miss-stamp ${kind}`, 'aria-hidden': 'true' }, h('i', { html: ICON(high ? 'caution' : 'think') }), h('b', { text: `앗, ${sk.labels[zone]}!` })),
      h('div', { class: `bw-miss-face ${kind}`, 'aria-hidden': 'true' },
        h('span', { class: 'bw-miss-pic', html: faceHTML('jieun', 'sad') }),
        h('i', { class: 'bw-miss-mark' })));
    const c = centerOf(view);
    if (high) {
      audio.sfx('spill');
      vfx.burst('drop', c.x, c.y + 60, { n: 16, dist: [140, 320], size: [22, 46], gravity: 180, spin: false });
      after(160, () => audio.sfx('miss_high'));
      after(800, () => audio.sfx('sweat'));
    } else {
      audio.sfx('miss_low');
      vfx.burst('puff', c.x, c.y + 30, { n: 7, dist: [40, 140], size: [60, 120], gravity: -60 });
      after(600, () => audio.sfx('miss_sulk'));
    }
  }
  function missClear(view) {
    missNo += 1;
    closeEl?.classList.remove('is-miss', 'm-high', 'm-low');
    view.querySelectorAll('.bw-miss-stamp, .bw-miss-face').forEach((el) => el.remove());
  }

  /* ---- 손 기술: 띠 ---- */
  function gate(sk, turn, canHand = false, drag = false, cue = false) {
    phase = 'gate';
    // 쉬운 길(선생님이 정함): 아직 두 번도 안 해 본 손 기술은 [보기]를 앞에(먼저 보고 따라 하게). [시작!]도 그대로 있음
    const seeFirst = path === 'easy' && !turn && grow.skillCount(sk.id || '') < 2;
    const go = btn('play', '시작!', `btn-big ${seeFirst ? 'btn-soft' : 'btn-main'} mg-go`);
    const see = btn(EYE, '보기', `btn-big ${seeFirst ? 'btn-main' : 'btn-soft'} bw-gate-watch`);
    // 익숙해진 손 기술(10번 넘게 함): [맡기기]를 누르면 손이 알아서 알맞게(재미 개편 6.2 · Q-41). 직접 할지는 학생이 고름
    const hand = canHand ? btn('sparkle', '맡기기', 'btn-big btn-soft bw-gate-hand') : null;
    const wrap = h('div', { class: 'bw-gate', role: 'group', 'aria-label': `${sk.name} 시작` },
      h('div', { class: 'bw-gate-card' },
        h('h3', {}, h('i', { html: ICON(sk.icon) }), sk.name),
        h('p', { text: howtoOf(sk, turn, drag, cue) }),
        sk.safety ? h('p', { class: 'bw-safety' }, h('i', { html: ICON('caution') }), sk.safety) : null,
        turn ? h('p', { class: 'bw-turn-note', text: SYS.turn }) : null,
        seeFirst ? h('p', { class: 'bw-hand-note' }, h('i', { html: EYE }), SYS.seeFirst) : null,
        hand ? h('p', { class: 'bw-hand-note' }, h('i', { html: ICON('sparkle') }), `익숙해진 일이에요(${grow.skillCount(sk.id || '') || grow.MASTER_AT}번 했어요). [맡기기]를 누르면 손이 알아서 해요.`) : null,
        h('div', { class: 'bw-row' }, see, hand, go)));
    (closeEl || bench).append(wrap);
    ui.gateGo = go;
    ui.gateSee = see;
    ui.gateSkill = sk.id;
    // 카드 밖을 눌러 시작하는 것은 설명을 다 들은 뒤부터(대사를 넘기듯 누르던 손에 설명이 끊기지 않게, 검수 13.39 17번). [시작!]은 늘 됨
    const shownAt = performance.now();
    let told = false;
    talkAfter(sysV(skillSpeech(sk, turn, drag, cue)), sk.safety && !safetySaid ? sysV(sk.safety) : null, turn ? sysV(SYS.turn) : seeFirst ? sysV(SYS.seeFirst) : null)
      .then(() => { told = true; });
    if (sk.safety) safetySaid = true;
    focusLater(seeFirst ? see : go);
    return new Promise((resolve) => {
      let gone = false;
      const done = (how) => {
        if (gone) return;
        gone = true;
        audio.sfx('tap');
        tts.stop();
        phase = 'busy';
        wrap.classList.add('is-out');
        setTimeout(() => wrap.remove(), dur(200));
        resolve(how);
      };
      onTap(go, () => done('play'));
      onTap(see, () => done('watch'));
      if (hand) onTap(hand, () => done('hand'));
      // 카드 밖 장면을 눌러도 [시작!](2026-10-31 사용자 "화면을 눌러도"). 설명 중이면 [시작!]만 살짝 흔들어 알려 줌
      wrap.addEventListener('click', (e) => {
        if (e.target !== wrap) return;
        if (told && performance.now() - shownAt > 1200) { done('play'); return; }
        go.classList.remove('is-nudge');
        void go.offsetWidth;
        go.classList.add('is-nudge');
        go.focus({ preventScroll: true });
      });
    });
  }

  /**
   * 손 동작 하나(menu.js 의 act): hold · wait · circle 은 띠 하나(위치 p), beats 는 박자 n 번. 판정 뒤 [다시 하기] / [이대로 하기]는 같음
   * menu: 이 잔의 메뉴(메뉴마다 다른 칸 · 바퀴 수, skillFor) · ing: 이 동작이 다루는 재료
   */
  async function runSkill(id, n, total, soFar, res, menu) {
    const base = id === 'steam' && cur?.kid ? kidSkill(skillFor(id, menu)) : skillFor(id, menu); // 아이 잔은 덜 데움
    const act = base.act || 'hold';
    const tm = timingOf(opts); // 계절 손맛 단계: 봄 · 여름은 박자 띠 2배, 가을 · 겨울은 띠가 1.5 · 2배 빠르게
    const st = (R.skills[id] ||= { tries: 0, good: 0, low: 0, high: 0, watched: 0 });
    st.tries += 1;
    const { turn, k } = pace();
    const narrow = level === 'barista' ? NARROW : 1;
    // 원 그리기: 바퀴 수 → 띠 위치(알맞은 바퀴 ± 반 바퀴 · 열 바퀴처럼 많으면 ± 3/4 바퀴)
    const laps = act === 'circle' ? base.laps : 0;
    const lapsMax = act === 'circle' ? Math.max(laps + 2, Math.ceil(laps * 1.5)) : 0;
    const tol = (laps >= 5 ? 0.75 : 0.5) * (turn ? 1 : narrow);
    let zoneSpan = act === 'circle' ? [(laps - tol) / lapsMax, (laps + tol) / lapsMax] : base.zone || [0.44, 0.69];
    if (act !== 'circle' && narrow < 1 && !turn) {
      const c0 = (zoneSpan[0] + zoneSpan[1]) / 2;
      const half = ((zoneSpan[1] - zoneSpan[0]) / 2) * narrow;
      zoneSpan = [c0 - half, c0 + half];
    }
    // 손맛(지은의 성장)이 오르면 알맞아요 칸이 조금씩 넓어짐(설정 growHelp 로 끌 수 있음). 턴 방식 · 원 그리기는 그대로
    if (act !== 'circle' && !turn && store.settings().growHelp !== false) {
      const wide = Math.min(0.06, (grow.level('hand') - 1) * 0.0075);
      zoneSpan = [Math.max(0.04, zoneSpan[0] - wide), Math.min(0.98, zoneSpan[1] + wide)];
    }
    // 쉬운 길(선생님이 정함): 알맞아요 칸을 가운데에서 1.35배 넓게(원 그리기는 바퀴 오차가 그만큼)
    if (path === 'easy' && !turn) {
      const c0 = (zoneSpan[0] + zoneSpan[1]) / 2;
      const half = ((zoneSpan[1] - zoneSpan[0]) / 2) * 1.35;
      zoneSpan = [Math.max(0.04, c0 - half), Math.min(0.98, c0 + half)];
    }
    const sk = { ...base, id, zone: zoneSpan };
    // 조작법 '드래그 활용'(설정 control): 물건을 직접 끎. 턴 방식이면 터치 기반. 단추 · 키보드 · 스캔 길은 그대로(원칙 11)
    //  tilt = 붓는 그릇을 끌어 내려 기울이기 · press = 탬퍼를 누른 채 끌어 내리기 · scoop = 얼음 통에서 국자로 떠 컵까지(블렌더 그림이 있을 때) · draw = 원 그리기
    const dragOn = store.settings().control === 'drag' && !turn;
    const shotId = shotIdFor(id, soFar);
    const shot = shotId ? shotView(shotId, { drag: dragOn }) : null;
    const dk = !dragOn ? null
      : act === 'hold' && TILT_SKILLS.has(id) ? 'tilt'
        : id === 'tamp' ? 'press'
          : id === 'ice' && shot?.ice ? 'scoop'
            : act === 'circle' ? 'draw' : null;
    const [z0, z1] = sk.zone;
    const center = (z0 + z1) / 2;
    const zoneOf = (p) => (p < z0 - 1e-6 ? 'low' : p > z1 + 1e-6 ? 'high' : 'good');
    // '딱 좋아요' 칸: 알맞아요 칸 가운데 36%(직접 했을 때만). 턴 방식은 가운데에 가장 가까운 눈금 하나
    const unit = act === 'circle' ? 0.5 / lapsMax : 1 / STEPS; // 턴 방식 한 칸(원 그리기는 반 바퀴)
    const sweetStep = Math.round(center / unit) * unit;
    const sweet = turn ? [sweetStep, sweetStep] : [center - (z1 - z0) * 0.18, center + (z1 - z0) * 0.18];
    const markHalf = turn ? 0.035 : 0;
    const sweetMark = {
      bottom: `${((sweet[0] - markHalf - z0) / (z1 - z0)) * 100}%`,
      top: `${((z1 - sweet[1] - markHalf) / (z1 - z0)) * 100}%`,
    };

    const needle = h('i', { class: 'bw-needle' });
    const gauge = h('div', {
      class: `bw-gauge g-${id} a-${act}`, role: 'meter', 'aria-label': sk.name, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0',
      style: { '--z0': String(z0), '--z1': String(z1), '--p': '0' },
    },
    h('span', { class: 'bw-seg low', style: { height: `${z0 * 100}%` } }, h('span', { text: sk.labels.low })),
    h('span', { class: 'bw-seg good', style: { height: `${(z1 - z0) * 100}%` } }, h('i', { class: 'bw-sweet', 'aria-hidden': 'true', style: sweetMark }), h('i', { html: ICON('check') }), h('span', { text: sk.labels.good })),
    h('span', { class: 'bw-seg high', style: { height: `${(1 - z1) * 100}%` } }, h('span', { text: sk.labels.high })),
    h('i', { class: 'bw-gauge-fill' }),
    turn && act !== 'circle' ? h('span', { class: 'bw-ticks' }, ...Array.from({ length: STEPS - 1 }, (_, i) => h('i', { style: { bottom: `${((i + 1) / STEPS) * 100}%` } }))) : null,
    needle);
    // 띠는 도움 표시(재미 개편 4.2 · Q-38): 실시간에서는 기본으로 숨기고, 잔(한 컷)이 알맞게 차면 확대 창이 반짝 + 소리.
    // 도움 많이 · 설정 helpBar · 턴 방식 · 박자는 띠를 그대로 보임
    const showBar = turn || act === 'beats' || store.settings().help === 'many' || store.settings().helpBar === true || path === 'easy'; // 쉬운 길은 띠를 늘 보임
    if (!showBar) gauge.classList.add('is-quiet');
    const saysNow = !showBar; // 설명도 띠 대신 "지금!"으로(howtoOf 의 cue)
    const watchLine = dk === 'scoop' ? SYS.watchScoop : act === 'beats' ? SYS.watchBeat : saysNow ? SYS.watchCue : SYS.watch; // [보기]의 말도 보이는 것에 맞춤
    const status = h('p', { class: 'bw-status', 'aria-live': 'polite' });
    // 단추: 한 번 해 볼 때마다 새로 만듦([다시 하기] 때 앞의 손잡이가 남지 않게)
    // hold · circle: [누르고 있기](턴 방식 [한 칸] + [멈추기]) · wait: [지금!](턴 방식 [기다리기] + [지금!]) · beats: [담기] 같은 이름(턴 방식 [한 칸] + 그 단추)
    const ctrl = h('div', { class: 'bw-ctrl' });
    let stepB;
    let stopB;
    let watchB;
    const goName = act === 'beats' ? BEAT_BTN[id] || '누르기' : act === 'wait' ? '지금!' : turn ? '멈추기' : '누르고 있기';
    const makeCtrl = () => {
      stepB = turn ? btn(act === 'wait' ? 'hourglass' : 'arrow_right', act === 'wait' ? '기다리기' : '한 칸', 'btn-big btn-soft bw-step') : null;
      stopB = act === 'hold' || act === 'circle'
        ? (turn ? btn('stop', '멈추기', 'btn-big btn-main bw-stop') : btn('hand', '누르고 있기', 'btn-big btn-main bw-hold'))
        : btn(act === 'wait' ? 'bell_call' : 'hand', goName, 'btn-big btn-main bw-stop bw-now');
      watchB = btn(EYE, '보기', 'btn-big btn-soft bw-watch');
      [stepB, stopB, watchB].forEach((b) => { if (b) b.disabled = true; });
      ctrl.replaceChildren(...[stepB, stopB, watchB].filter(Boolean));
    };
    makeCtrl();
    setPanel();
    const bookMini = h('button', { class: 'bw-ico-btn bw-close-book', 'aria-label': '레시피 수첩 보기', html: ICON('book') });
    onTap(bookMini, openBook);
    const view = h('div', { class: 'bw-close-view' });
    const card = h('section', { class: `bw-close c-${id} a-${act}`, role: 'group', 'aria-label': sk.name },
      h('header', { class: 'bw-close-head' },
        total > 1 ? h('b', { class: 'bw-close-n', text: `${n}/${total}` }) : null,
        h('h3', { text: sk.name }),
        h('p', { text: howtoOf(sk, turn, Boolean(dk), saysNow) }),
        sayBtn(skillSpeech(sk, turn, Boolean(dk), saysNow)), bookMini),
      h('div', { class: 'bw-close-body' }, view, gauge),
      h('footer', { class: 'bw-close-foot' }, status, ctrl));
    closeUpOff();
    closeEl = card;
    bench.append(card);
    bench.classList.add('is-close');
    input.pushScope(card); // 자동 스캔은 확대 창 안의 단추만 돎(시작 창 · [한 칸] · 결과 단추). 닫으면 작업대 전체로(검수 13.39 28번)

    // 장면: 블렌더 한 컷이 있으면 그것(샷 · 데우기 · 거품 · 붓기 · 물 붓기 · 얼음 담기), 없으면 동작에 맞는 임시 그림(움직임은 set 으로)
    const art = shot ? null : actView(id, act, soFar, res);
    if (shot) setScene({ mode: id, shot, host: view, keep: true });
    else {
      setScene({ mode: id, keep: true });
      view.append(art.el);
    }
    if (dk === 'tilt') shot?.tilt(0); // 끌어 붓기: 처음엔 덜 기운 그릇(아직 붓지 않음)
    card.classList.toggle('is-drag', Boolean(dk));
    if (dk) card.dataset.drag = dk;
    // 끌기 안내: 처음 끌 때까지 손이 아래로(붓기 · 누르기) · 얼음 통에서 컵으로(얼음) 움직임
    const hint = dk && dk !== 'draw' ? h('div', { class: `bw-drag-hint k-${dk}`, 'aria-hidden': 'true' }, h('i', { html: ICON('hand') })) : null;
    if (hint) view.append(hint);
    const hintOff = () => hint?.classList.add('is-off');
    const hintOn = () => {
      if (!hint) return;
      hint.classList.remove('is-off');
      if (dk !== 'scoop' || !shot?.ice) return;
      // 얼음 통 가운데에서 컵 위로(장면 크기에 따라 그때그때 셈)
      requestAnimationFrame(() => {
        const vr = view.getBoundingClientRect();
        const [bx, by, bw, bh] = shot.ice.bucket;
        const [ax, ay] = shot.toClient(bx + bw / 2, by + bh * 0.3);
        const [mx, my, mr] = shot.ice.mouth;
        const [cx, cy] = shot.toClient(mx, my - mr * 0.7);
        hint.style.left = `${ax - vr.left}px`;
        hint.style.top = `${ay - vr.top}px`;
        hint.style.setProperty('--dx', `${cx - ax}px`);
        hint.style.setProperty('--dy', `${cy - ay}px`);
      });
    };
    // 원 그리기: 바퀴 수 표시(지금 / 알맞은 바퀴)
    const lapEl = act === 'circle' ? h('b', { class: 'bw-laps', 'aria-hidden': 'true' }) : null;
    if (lapEl) view.append(lapEl);

    let p = 0;
    let lastZone = null;
    let playing = false;
    let flow = false; // 한 컷의 줄기: 누르는 동안 · [보기]로 차는 동안 · [한 칸] 바로 뒤
    let flowTok = 0;
    // 성공 타이밍을 확실하게(2026-11-02 사용자 "게이지가 없으니까 어느 상황이 성공 타이밍인지 알기 어렵다. 배경이 초록색으로 뜬다고 해서 이해할 수 있는게 아니야"):
    // 알맞아요 칸에 들면 장면 위에 큰 표시("지금 떼요!")가 뜨고, 누르는 단추의 글자도 바뀜(넘치면 "넘쳐요!"). 박자(beats)는 원래의 원 표시
    // 2026-11-02 사용자: "지금 글자가 랜덤한 위치에 뜨면 그게 큐가 될 거 같은데!" · "만화나 웹툰의 효과음처럼 디자인" →
    // 알맞아요 칸에 들 때마다 장면 안 아무 곳에 웹툰 효과음 글자 "지금!"이 툭 튀어나옴(글자마다 통통, 반짝이 조금). 넘치면 "넘쳐!"
    const nowSign = act === 'beats' ? null : h('div', { class: 'bw-pow', 'aria-hidden': 'true' });
    if (nowSign) view.append(nowSign);
    const SIGN = { good: turn ? '멈춰!' : '지금!', high: act === 'wait' ? '늦었어!' : '넘쳐!' };
    const letters = (text) => [...text].map((ch, i) => h('span', { class: 'bw-pow-ch', style: { '--i': String(i) }, text: ch }));
    const CUE = turn ? { good: act === 'wait' ? '지금!' : '지금 멈춰요!', high: '넘쳤어요' }
      : act === 'wait' ? { low: '기다려요…', good: '지금!', high: '늦었어요' }
      : { good: '지금 떼요!', high: '넘쳤어요' };
    const cue = (z) => {
      if (!nowSign) return;
      if (z === 'good' || z === 'high') {
        // 자리 · 기울기는 그때그때 다르게(같은 자리를 외우지 않고 글자를 보고 떼게). 글자가 커서(2026-11-04 사용자 "2배") 기운 글자 전체가 장면 안에 드는 범위에서 고름
        const rnd = (a, b) => (a < b ? a + Math.random() * (b - a) : (a + b) / 2);
        nowSign.replaceChildren(...letters(SIGN[z]));
        nowSign.classList.remove('is-on', 'is-over');
        nowSign.classList.add(z === 'good' ? 'is-on' : 'is-over');
        const rot = rnd(-14, 14);
        const t = (Math.abs(rot) * Math.PI) / 180;
        const sw = nowSign.offsetWidth * 1.08; // 흔들림(1.07배)까지
        const sh = (nowSign.offsetHeight + 40) * 1.08; // 글자마다 위로 올라간 만큼
        const bw = sw * Math.cos(t) + sh * Math.sin(t);
        const bh = sw * Math.sin(t) + sh * Math.cos(t);
        const vw = view.clientWidth || 1;
        const vh = view.clientHeight || 1;
        const fit = Math.min(1, (vw * 0.94) / bw, (vh * 0.94) / bh); // 아주 작은 창에서만 줄임
        const hx = Math.min(50, ((bw * fit) / 2 + 10) / vw * 100);
        const hy = Math.min(50, ((bh * fit) / 2 + 10) / vh * 100);
        nowSign.style.setProperty('--x', `${rnd(hx, 100 - hx).toFixed(1)}%`);
        nowSign.style.setProperty('--y', `${rnd(hy, 100 - hy).toFixed(1)}%`);
        nowSign.style.setProperty('--rot', `${rot.toFixed(1)}deg`);
        nowSign.style.setProperty('--fit', fit.toFixed(3));
        nowSign.classList.remove('is-on', 'is-over');
        void nowSign.offsetWidth;
        nowSign.classList.add(z === 'good' ? 'is-on' : 'is-over');
        if (z === 'good') requestAnimationFrame(() => { const c = centerOf(nowSign); vfx.burst('sparkle', c.x, c.y, { n: 7, dist: [60, 150], size: [18, 34], ms: [380, 620], colors: ['#FFFFFF', '#FFE14D', '#FFB347'] }); });
      } else nowSign.classList.remove('is-on', 'is-over');
      const label = stopB?.querySelector('span');
      if (label && CUE[z]) label.textContent = CUE[z];
      stopB?.classList.toggle('is-cue', z === 'good');
    };
    const draw = () => {
      const v = p.toFixed(4);
      gauge.style.setProperty('--p', v);
      tube.style.setProperty('--p', v);
      if (act !== 'beats') shot?.set(p, flow); // 박자(얼음 담기)는 누른 수만큼 쌓임(attemptBeats)
      art?.set(p, { flow, laps: p * lapsMax });
      if (lapEl) lapEl.textContent = `${Math.floor(p * lapsMax + 1e-6)} / ${laps}바퀴`;
      gauge.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      const z = zoneOf(p);
      if (z === lastZone) return;
      const first = lastZone === null;
      lastZone = z;
      card.classList.toggle('is-in-zone', z === 'good' && !first);
      cue(first ? (act === 'wait' && !turn ? 'low' : null) : z);
      gauge.dataset.zone = z;
      gauge.setAttribute('aria-valuetext', sk.labels[z]);
      status.textContent = `지금: ${sk.labels[z]}`;
      if (first || !playing) return;
      if (z === 'good') audio.sfx('focus');
      if (turn || z === 'good') talk(sysV(sk.labels[z]));
    };
    draw();

    /* ---- 띠 하나(hold · wait · circle) ---- */
    const attempt = (how) => new Promise((resolve) => {
      phase = 'skill';
      if (turn || how === 'watch' || act === 'wait') audio.sfx(sk.sfx);
      focusLater(turn ? stepB : stopB);
      if (how === 'watch') talk(sysV(watchLine));
      else if (act === 'circle' && !turn) talk(sysV(SYS.drag));
      let mode = how;
      let finished = false;
      let tick = 0;
      let holding = false; // hold · circle: 누르고 있는 동안만 차오름
      let dragging = null; // circle: 손가락으로 원 그리기 { a: 지난 각도 } · 끌어 붓기 · 끌어 누르기: { y0: 누른 높이, h: 장면 높이 }
      let pull = 0; // 끌어 붓기: 아래로 끈 만큼(0~1, POUR_AT 부터 부음)
      playing = mode === 'play';
      if (act === 'wait' && !turn && mode === 'play') flow = true; // 기다리는 동안 한 컷이 움직임(갈리는 가루 · 끓는 김 …), 정하면 멈춘 프레임
      const runMs = ((act === 'circle' ? lapsMax * LAP_MS : act === 'wait' ? sk.ms || WAIT_MS : sk.ms || RUN_MS) * k) / tm.speed;
      if (how === 'play') hintOn();
      // 끌어 붓기: 끈 만큼 그릇이 기울고(덜 기운 그릇 그림), POUR_AT 을 넘으면 붓기 시작(원래 컷 + 줄기)
      const setPull = (d) => {
        pull = d;
        const pour = pull >= POUR_AT;
        if (pour && !flow) audio.sfx(sk.sfx);
        flow = pour || holding;
        shot?.tilt(Math.floor((pull / POUR_AT) * (shot?.tiltN || 1)));
        card.classList.toggle('is-pouring', pour);
        draw();
      };
      const end = (zone, watched) => {
        if (finished) return;
        finished = true;
        playing = false;
        holding = false;
        dragging = null;
        flow = false;
        if (dk === 'tilt') {
          pull = 0;
          card.classList.remove('is-pouring');
          shot?.tilt(0); // 다 부으면 그릇을 다시 세움
        }
        hintOff();
        draw();
        stopB.classList.remove('is-holding');
        curLoop?.stop();
        curLoop = null;
        resolve({ zone, watched, perfect: !watched && zone === 'good' && p >= sweet[0] - 1e-6 && p <= sweet[1] + 1e-6 });
      };
      const setButtons = () => {
        stopB.disabled = mode !== 'play';
        if (stepB) stepB.disabled = mode !== 'play' || p >= 1;
        watchB.disabled = mode !== 'play';
      };
      const press = () => {
        if (turn || mode !== 'play' || finished || holding || act === 'wait') return;
        holding = true;
        flow = true;
        draw();
        stopB.classList.add('is-holding');
        audio.sfx(sk.sfx);
      };
      const release = () => {
        if (!holding || finished) return;
        holding = false;
        flow = false;
        stopB.classList.remove('is-holding');
        if (p < HOLD_MIN) { p = 0; draw(); status.textContent = SYS.holdShort; talk(sysV(SYS.holdShort)); return; }
        end(zoneOf(p), false);
      };
      const pauseHold = () => {
        if (!holding || finished) return;
        holding = false;
        flow = false;
        draw();
        stopB.classList.remove('is-holding');
      };
      if (turn || act === 'wait') {
        // 턴 방식 · 기다렸다 누르기: [멈추기] · [지금!] 한 번 누르면 정함
        onTap(stopB, () => { if (mode === 'play') end(zoneOf(p), false); });
      } else {
        stopB.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); stopB.setPointerCapture?.(e.pointerId); press(); });
        stopB.addEventListener('pointerup', (e) => { e.stopPropagation(); release(); });
        stopB.addEventListener('pointercancel', pauseHold);
        stopB.addEventListener('lostpointercapture', pauseHold);
        stopB.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) press(); } });
        stopB.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); release(); } });
        stopB.addEventListener('blur', pauseHold);
        stopB.addEventListener('click', (e) => e.stopPropagation());
        stopB.addEventListener('contextmenu', (e) => e.preventDefault());
      }
      // 장면 그림 = 단추(2026-10-31 사용자 "버튼 말고 화면의 그림을 터치해도", "화면을 눌러도 되도록 모두"). 단추는 그대로(키보드 · 스캔)
      //  턴 방식: 그림을 톡 = [한 칸] · [기다리기](정하는 [멈추기] · [지금!]은 단추만: 잘못 톡 해서 끝나지 않게)
      //  실시간: 누르고 떼기 = 그림을 꾹 · 기다렸다 누르기 = 그림을 톡 = [지금!] · 원 그리기 = 그림을 꾹(저절로 돎) 또는 그림 위에 원을 그림
      view.oncontextmenu = (e) => e.preventDefault();
      if (turn) {
        view.onpointerdown = (e) => { if (mode !== 'play' || finished) return; e.preventDefault(); stepB?.click(); };
      } else if (act === 'wait') {
        view.onpointerdown = (e) => { if (mode !== 'play' || finished) return; e.preventDefault(); end(zoneOf(p), false); };
      } else if (dk === 'tilt' || dk === 'press') {
        // 끌어 붓기: 장면을 누른 채 아래로 끌수록 그릇이 기울고, 많이 끌면 붓기 시작(더 끌수록 빨리, 위로 되돌리면 멈춤). 손을 떼면 정함
        // 끌어 누르기(탬핑): 누른 채 아래로 끈 만큼 탬퍼가 내려가 가루가 눌림(눌린 가루는 다시 부풀지 않음). 손을 떼면 정함
        const again = dk === 'tilt' ? SYS.dragTilt : SYS.dragPress;
        view.onpointerdown = (e) => {
          if (mode !== 'play' || finished || holding) return;
          e.preventDefault();
          view.setPointerCapture?.(e.pointerId);
          dragging = { y0: e.clientY, h: view.clientHeight || 1 };
          hintOff();
          if (dk === 'press') {
            flow = true;
            stopB.classList.add('is-holding');
            audio.sfx(sk.sfx);
            draw();
          }
        };
        view.onpointermove = (e) => {
          if (!dragging || finished) return;
          const d = Math.max(0, Math.min(1, (e.clientY - dragging.y0) / (dragging.h * (dk === 'tilt' ? TILT_PULL : PRESS_PULL))));
          if (dk === 'tilt') { setPull(d); return; }
          if (d > p) { p = d; draw(); }
          if (p >= 1) end('high', false);
        };
        view.onpointerup = () => {
          if (!dragging || finished) return;
          dragging = null;
          if (dk === 'tilt') setPull(0);
          flow = false;
          stopB.classList.remove('is-holding');
          if (p < HOLD_MIN) { p = 0; draw(); status.textContent = again; talk(sysV(again)); hintOn(); return; }
          end(zoneOf(p), false);
        };
        view.onpointercancel = () => {
          if (!dragging || finished) return;
          dragging = null;
          if (dk === 'tilt') setPull(0);
          flow = false;
          stopB.classList.remove('is-holding');
          draw();
        };
        view.onlostpointercapture = null;
      } else if (act === 'hold') {
        view.onpointerdown = (e) => {
          if (mode !== 'play' || finished) return;
          e.preventDefault();
          view.setPointerCapture?.(e.pointerId);
          press();
        };
        view.onpointerup = () => release();
        view.onpointercancel = pauseHold;
        view.onlostpointercapture = pauseHold;
      } else if (act === 'circle') {
        // 원 그리기: 장면 위에서 손가락 · 마우스로 원을 그리면 그만큼 돎. 손가락이 거의 그대로면 [누르고 있기]처럼 저절로 돎. 손을 떼면 정함
        const angleAt = (e) => {
          const r = view.getBoundingClientRect();
          return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
        };
        view.onpointerdown = (e) => {
          if (mode !== 'play' || finished) return;
          e.preventDefault();
          view.setPointerCapture?.(e.pointerId);
          dragging = { a: angleAt(e), moved: 0 };
          holding = true;
          flow = true;
          stopB.classList.add('is-holding');
          audio.sfx(sk.sfx);
        };
        view.onpointermove = (e) => {
          if (!dragging || finished) return;
          const a2 = angleAt(e);
          let d = a2 - dragging.a;
          if (d > Math.PI) d -= 2 * Math.PI;
          if (d < -Math.PI) d += 2 * Math.PI;
          dragging.a = a2;
          if (dragging.moved < DRAW_START) { dragging.moved += Math.abs(d); return; } // 아직 꾹 누르기(저절로 돎)
          p = Math.min(1, p + Math.abs(d) / (2 * Math.PI) / lapsMax);
          draw();
          if (p >= 1) end('high', false);
        };
        view.onpointerup = () => { if (dragging) { dragging = null; release(); } };
        view.onpointercancel = () => { if (dragging) { dragging = null; pauseHold(); } };
      }
      onTap(stepB, () => {
        if (mode !== 'play' || p >= 1) return;
        p = Math.min(1, (Math.round(p / unit) + 1) * unit);
        audio.sfx('focus');
        flow = true;
        const tok = ++flowTok;
        setTimeout(() => { if (tok === flowTok && !finished) { flow = false; draw(); } }, 450);
        draw();
        setButtons();
        if (act === 'wait' && p >= 1) end('high', false); // 끝까지 기다림: 늦어요
      });
      onTap(watchB, () => {
        if (mode !== 'play') return;
        mode = 'watch';
        playing = false;
        holding = false;
        dragging = null;
        flow = false;
        stopB.classList.remove('is-holding');
        if (p > center) p = 0;
        talk(sysV(watchLine));
        setButtons();
        draw();
      });
      setButtons();
      curLoop = loop((dt) => {
        if (finished) return;
        if (mode === 'watch') {
          p = Math.min(center, p + dt / WATCH_MS);
          flow = p < center - 1e-6;
          draw();
          if (p >= center - 1e-6) end('good', true);
          return;
        }
        if (dk === 'tilt' && dragging && pull >= POUR_AT && !holding) {
          // 끌어 붓기: 조금 기울이면 천천히(0.55배), 끝까지 기울이면 빨리(1.8배)
          p = Math.min(1, p + (dt / runMs) * (0.55 + 1.25 * ((pull - POUR_AT) / (1 - POUR_AT))));
          draw();
          if (p >= 1) { end('high', false); return; }
        }
        if (!turn && (act === 'wait' || (holding && !(dragging && dragging.moved >= DRAW_START)))) { // 원을 그리기 시작하면 손가락만큼만
          p = Math.min(1, p + dt / runMs);
          draw();
          if (p >= 1) { end('high', false); return; } // 끝까지: 쓴 샷 · 뜨거운 우유 · 넘친 잔 · 늦음 · 너무 저음
        }
        // 자동 플레이: 알맞아요 칸 가운데쯤에서 정함(턴 방식은 [한 칸]으로). 일부러 넘치게 할 때(robotMiss)는 끝까지
        if (robot) {
          if (!turn) {
            if (act === 'wait') { if (!robotMiss && zoneOf(p) === 'good' && p >= center - 0.03) stopB.click(); return; }
            if (!holding) press(); else if (!robotMiss && zoneOf(p) === 'good' && p >= center - 0.03) release();
            return;
          }
          tick += dt;
          if (tick < 90) return;
          tick = 0;
          if (robotMiss ? p >= 1 : zoneOf(p) === 'good' && Math.abs(p - sweetStep) < unit / 2 + 1e-6) stopB.click();
          else if (!(act === 'wait' && p >= 1)) stepB?.click();
        }
      }, () => speed);
    });

    /* ---- 박자(beats): 동그라미가 줄어들어 가운데 원과 겹칠 때 누르기 n 번 ---- */
    const ringEl = act === 'beats' ? h('i', { class: 'bw-ring' }) : null;
    const dotsEl = act === 'beats' ? h('span', { class: 'bw-beat-dots', 'aria-hidden': 'true' }) : null;
    const beatWord = act === 'beats' ? h('b', { class: 'bw-beat-word', 'aria-hidden': 'true' }) : null;
    if (act === 'beats') view.append(dk === 'scoop' ? '' : h('div', { class: 'bw-beat', 'aria-hidden': 'true', style: { '--band': `${8 * tm.beatWin}px` } }, h('i', { class: 'bw-target' }), ringEl), dotsEl, beatWord); // 판정 띠 굵기 = 판정 칸 배율
    let iceTimer = 0; // 얼음 담기 컷: 떨어지는 프레임 → 멈춘 프레임(다시 하기를 빨리 눌러도 앞 시도의 프레임이 늦게 덮지 않게 시도마다 지움)
    const attemptBeats = (how) => new Promise((resolve) => {
      phase = 'skill';
      const N = sk.n || 2;
      const win = BEAT_WIN * tm.beatWin * (turn ? 1 : narrow);
      const hitStep = Math.round(BEAT_HIT * STEPS) / STEPS;
      const marks = [];
      let beat = 0;
      let q = 0;
      let gap = 0;
      let mode = how;
      let finished = false;
      let tick = 0;
      const drawBeat = () => {
        // 동그라미 크기: q = BEAT_HIT 에서 가운데 원(1)과 겹침
        ringEl.style.transform = `translate(-50%, -50%) scale(${Math.max(0.3, 2.2 - (1.2 / BEAT_HIT) * q).toFixed(3)})`;
        ringEl.classList.toggle('is-near', Math.abs(q - (turn ? hitStep : BEAT_HIT)) <= (turn ? 1e-6 : win));
        dotsEl.replaceChildren(...Array.from({ length: N }, (_, i) => h('i', { class: marks[i] ? `m-${marks[i]}` : i === beat ? 'now' : '' })));
        status.textContent = `${Math.min(beat + 1, N)} / ${N}`;
        art?.set(beat / N, { flow: false });
      };
      const say = (w) => { beatWord.textContent = w; beatWord.classList.remove('is-pop'); void beatWord.offsetWidth; beatWord.classList.add('is-pop'); };
      // 판정: 모두 맞으면 알맞아요, 빠른 것이 늦은 것보다 많으면 높은 칸(많아요), 아니면 낮은 칸(적어요)
      const beatZone = () => {
        const good = marks.filter((x) => x === 'good' || x === 'perfect').length;
        const early = marks.filter((x) => x === 'early').length;
        const late = marks.filter((x) => x === 'late').length;
        return good === N ? 'good' : early > late ? 'high' : 'low';
      };
      // 한 컷(얼음 담기): 누를 때마다 얼음이 떨어져 쌓임. 늦게 누르면(놓치면) 한 개만.
      //  가운데 박자까지는 절반쯤(few)에서 멈추고, 끝에 알맞아요 · 많아요면 가득, 적어요면 절반쯤 그대로(9단계 · 3번이면 0 → 3 → 5 → 8개).
      //  그래서 판정과 그림이 어긋나지 않고, 쌓인 얼음이 줄어드는 일도 없음
      const top = Math.max(1, ((shotId && shots[shotId]?.levels) || 0) - 1);
      const few = Math.max(1, Math.round(top * 0.6));
      let got = 0;
      const shotBeat = (m) => {
        if (!shot || top < 2) return;
        got += m === 'late' ? 1 : top / N;
        let n = Math.min(few, Math.ceil(got - 1e-6));
        if (beat >= N && beatZone() !== 'low') n = top;
        shot.set(n / top, true); // 떨어지는 얼음
        clearTimeout(iceTimer);
        iceTimer = later(dur(360), () => shot.set(n / top, false));
      };
      clearTimeout(iceTimer);
      shot?.set(0, false); // 빈 컵부터
      const judge = (qq) => {
        if (finished || gap > 0) return;
        const d = qq - (turn ? hitStep : BEAT_HIT);
        const m = Math.abs(d) <= (turn ? 1e-6 : win) ? (Math.abs(d) <= win * 0.45 || turn ? 'perfect' : 'good') : d < 0 ? 'early' : 'late';
        marks[beat] = m;
        audio.sfx(m === 'early' || m === 'late' ? 'tap' : sk.sfx);
        say(m === 'early' ? SYS.early : m === 'late' ? SYS.late : SYS.beatGood);
        if (turn) talk(sysV(m === 'early' ? SYS.early : m === 'late' ? SYS.late : SYS.beatGood));
        beat += 1;
        q = 0;
        shotBeat(m);
        if (beat >= N) {
          finished = true;
          curLoop?.stop();
          curLoop = null;
          drawBeat();
          const zone = beatZone();
          p = zone === 'good' ? center : zone === 'high' ? 1 : 0;
          draw();
          resolve({ zone, watched: mode === 'watch', perfect: mode !== 'watch' && !turn && marks.every((x) => x === 'perfect') });
          return;
        }
        gap = turn ? 0 : 380;
        drawBeat();
      };
      const setButtons = () => {
        stopB.disabled = mode !== 'play';
        if (stepB) stepB.disabled = mode !== 'play';
        watchB.disabled = mode !== 'play';
      };
      onTap(stopB, () => { if (mode === 'play') judge(q); });
      view.onpointerdown = (e) => { if (mode !== 'play' || finished) return; e.preventDefault(); if (turn) stepB?.click(); else judge(q); }; // 장면 그림을 톡 = 그 단추(턴 방식은 [한 칸])
      onTap(stepB, () => {
        if (mode !== 'play' || finished) return;
        q = Math.min(1, q + 1 / STEPS);
        audio.sfx('focus');
        drawBeat();
        if (q >= 1 - 1e-6) judge(1.5); // 지나쳐 버림: 늦어요
      });
      onTap(watchB, () => {
        if (mode !== 'play') return;
        mode = 'watch';
        talk(sysV(watchLine));
        setButtons();
      });
      setButtons();
      focusLater(turn ? stepB : stopB);
      if (how === 'watch') talk(sysV(watchLine));
      drawBeat();
      curLoop = loop((dt) => {
        if (finished) return;
        if (gap > 0) { gap -= dt; return; }
        if (mode === 'watch') {
          q = Math.min(BEAT_HIT, q + dt / (BEAT_MS * 0.8));
          drawBeat();
          if (q >= BEAT_HIT - 1e-6) judge(BEAT_HIT);
          return;
        }
        if (!turn) {
          q += dt / (BEAT_MS * k);
          drawBeat();
          if (q >= 1) { judge(1.5); return; }
          if (robot && !robotMiss && q >= BEAT_HIT - 0.01) judge(q);
          return;
        }
        if (robot) {
          tick += dt;
          if (tick < 90) return;
          tick = 0;
          if (!robotMiss && Math.abs(q - hitStep) < 1e-6) stopB.click();
          else stepB?.click();
        }
      }, () => speed);
    });

    /* ---- 얼음 옮기기(조작법 '드래그 활용' · scoop): 얼음 통을 눌러 국자로 뜨고, 컵 위까지 끌어다 놓기 n 번 ----
     * 컵 밖에 놓으면 세지 않고 다시(감점 없음). 컵 바로 위에 가까울수록 '딱 좋아요'. [담기] · [보기] · 자동 플레이는 국자가 저절로 옮겨 감 */
    const attemptScoop = (how) => new Promise((resolve) => {
      phase = 'skill';
      const N = sk.n || 2;
      const ice = shot.ice;
      const marks = [];
      let beat = 0;
      let mode = how;
      let finished = false;
      let busy = false; // 국자가 저절로 옮겨 가거나 얼음이 떨어지는 동안
      let carry = null;
      let tick = 0;
      const top = Math.max(1, (shots[shotId]?.levels || 0) - 1);
      const [sx, sy, sw, sh] = ice.scoop;
      const [gx, gy] = ice.grip;
      const [bx, by, bw, bh] = ice.bucket;
      const [mx, my, mr] = ice.mouth;
      const [tx, ty] = [mx, my - mr * 0.7]; // 놓으면 국자가 가는 곳: 컵 입구 바로 위
      view.querySelectorAll('.bw-scoop, .bw-bucket-ring').forEach((el) => el.remove());
      const scoop = h('img', { class: 'bw-scoop', alt: '', draggable: 'false', src: img.url('shots', `${shotId}_scoop`), hidden: true });
      scoop.style.transformOrigin = `${((gx - sx) / sw) * 100}% ${((gy - sy) / sh) * 100}%`; // 기울 때 얼음 가운데를 축으로
      const ring = h('i', { class: 'bw-bucket-ring', 'aria-hidden': 'true' });
      shot.put(ring, [bx - 20, by - 20, bw + 40, bh + 40]);
      const place = (px, py) => shot.put(scoop, [sx + (px - gx), sy + (py - gy), sw, sh]); // 쥐는 곳(얼음 가운데)이 px, py 에
      const onBucket = ([px, py]) => px >= bx - 50 && px <= bx + bw + 50 && py >= by - 80 && py <= by + bh + 30;
      // 놓은 자리: 컵 입구 가운데 위에 가까울수록 좋음(가로는 입구 반지름으로 잼, 세로는 입구보다 위면 어디든 · 아래는 컵 몸 위쪽까지)
      const judgeAt = ([px, py]) => {
        const ax = Math.abs(px - mx) / mr;
        if (ax > 1.5 || py > my + mr * 2.5) return null;
        return ax <= 0.55 ? 'perfect' : 'good';
      };
      const drawDots = () => {
        dotsEl.replaceChildren(...Array.from({ length: N }, (_, i) => h('i', { class: marks[i] ? `m-${marks[i]}` : i === beat ? 'now' : '' })));
        status.textContent = `${Math.min(beat + 1, N)} / ${N}`;
      };
      const pop = (t) => { beatWord.textContent = t; beatWord.classList.remove('is-pop'); void beatWord.offsetWidth; beatWord.classList.add('is-pop'); };
      let hideTok = 0; // 사라지는 동안 다시 뜨면 늦은 숨기기가 새 국자를 숨기지 않게
      const hide = () => {
        const t = ++hideTok;
        scoop.classList.add('is-gone');
        later(dur(260), () => { if (t === hideTok) { scoop.hidden = true; scoop.classList.remove('is-gone', 'is-drop', 'is-auto'); } });
      };
      const finish = () => {
        finished = true;
        curLoop?.stop();
        curLoop = null;
        hintOff();
        p = center;
        draw();
        resolve({ zone: 'good', watched: mode === 'watch', perfect: mode !== 'watch' && marks.every((x) => x === 'perfect') });
      };
      // 컵 위에서 얼음을 떨굼: 국자가 그 자리로 살짝 끌려가 기울고, 얼음이 떨어져 쌓임(얼음 담기 컷의 떨어지는 프레임)
      const drop = (m) => {
        busy = true;
        scoop.classList.add('is-drop');
        place(tx, ty);
        later(dur(170), () => {
          if (finished) return;
          marks[beat] = m;
          beat += 1;
          audio.sfx(sk.sfx);
          pop(m === 'perfect' ? SYS.perfect : SYS.beatGood);
          const n = beat >= N ? top : Math.min(top, Math.round((top * beat) / N));
          shot.set(n / top, true);
          clearTimeout(iceTimer);
          iceTimer = later(dur(360), () => shot.set(n / top, false));
          drawDots();
          hide();
          later(dur(420), () => {
            busy = false;
            if (!finished && beat >= N) finish();
          });
        });
      };
      // 저절로 옮김([담기] · [보기] · 자동 플레이): 얼음 통에서 컵 위로
      const autoCarry = () => {
        if (busy || finished || carry) return;
        busy = true;
        hideTok += 1;
        hintOff();
        audio.sfx('ice');
        scoop.hidden = false;
        scoop.classList.remove('is-gone', 'is-drop', 'is-auto');
        place(bx + bw / 2, by + bh * 0.25);
        void scoop.offsetWidth;
        scoop.classList.add('is-auto');
        place(tx, ty);
        later(dur(560), () => { if (!finished) drop('good'); });
      };
      view.onpointerdown = (e) => {
        if (mode !== 'play' || finished || busy) return;
        e.preventDefault();
        const pt = shot.toPlate(e.clientX, e.clientY);
        if (!onBucket(pt)) {
          talk(sysV(SYS.scoopHere));
          ring.classList.remove('is-ping');
          void ring.offsetWidth;
          ring.classList.add('is-ping');
          return;
        }
        view.setPointerCapture?.(e.pointerId);
        carry = true;
        hideTok += 1;
        hintOff();
        audio.sfx('ice');
        scoop.hidden = false;
        scoop.classList.remove('is-gone', 'is-drop', 'is-auto');
        place(...pt);
      };
      view.onpointermove = (e) => { if (carry && !finished) place(...shot.toPlate(e.clientX, e.clientY)); };
      view.onpointerup = (e) => {
        if (!carry || finished) return;
        carry = null;
        const m = judgeAt(shot.toPlate(e.clientX, e.clientY));
        if (m) { drop(m); return; }
        hide();
        status.textContent = SYS.scoopDrop;
        talk(sysV(SYS.scoopDrop));
      };
      view.onpointercancel = () => { if (carry) { carry = null; hide(); } };
      onTap(stopB, () => { if (mode === 'play') autoCarry(); });
      onTap(watchB, () => {
        if (mode !== 'play') return;
        mode = 'watch';
        talk(sysV(watchLine));
        stopB.disabled = true;
        watchB.disabled = true;
      });
      stopB.disabled = false;
      watchB.disabled = false;
      focusLater(stopB);
      clearTimeout(iceTimer);
      shot.set(0, false); // 빈 컵부터
      if (how === 'watch') talk(sysV(watchLine));
      else hintOn();
      drawDots();
      curLoop = loop((dt) => {
        if (finished) return;
        tick += dt;
        if ((mode === 'watch' || robot) && tick > 300 && !busy && !carry) { tick = 0; autoCarry(); }
      }, () => speed);
    });

    const askRetry = () => {
      phase = 'retry';
      const again = btn('repeat', '다시 하기', 'btn-big btn-main bw-again');
      const goOn = btn('arrow_right', '이대로 하기', 'btn-big btn-soft bw-go-on');
      ui.retry = again;
      ui.goOn = goOn;
      ctrl.replaceChildren(again, goOn);
      focusLater(again);
      return waitTap(again, goOn).then((i) => {
        phase = 'busy';
        audio.sfx('tap');
        tts.stop();
        return i === 0;
      });
    };

    // 한 번 한 손 기술을 셈(지은의 성장: 손맛 · 익숙함). 처음 익숙해지면 지은의 한마디
    const noteSkill = () => {
      if (!grow.addSkill(id)) return;
      status.append(h('em', { class: 'bw-mastered' }, h('i', { html: ICON('sparkle') }), '익숙해졌어요!'));
      talkAfter([mastered(sk), 'jieun']);
    };
    let how = 'watch';
    if (level !== 'easy') how = await w(gate(sk, turn, act !== 'beats' && grow.isMastered(id), Boolean(dk), saysNow));
    if (how === 'hand') {
      // 맡기기: 손이 알아서 알맞아요 칸 가운데까지(실패 없음, '딱 좋아요'는 직접 했을 때만)
      talk(sysV(SYS.handoff));
      phase = 'skill';
      flow = true;
      await w(new Promise((resolve) => {
        let t = 0;
        curLoop = loop((dt) => {
          t += dt;
          p = Math.min(center, (t / 1100) * center);
          draw();
          if (p >= center - 1e-6) { curLoop?.stop(); curLoop = null; resolve(); }
        }, () => speed);
      }));
      flow = false;
      draw();
      phase = 'busy';
      st.good += 1;
      gauge.classList.add('is-done');
      [stepB, stopB, watchB].forEach((b) => { if (b) b.disabled = true; });
      status.replaceChildren(h('b', { class: 'bw-verdict z-good' }, h('i', { html: ICON('check') }), `${sk.labels.good}!`));
      audio.sfx('good');
      noteSkill();
      return { skill: id, zone: 'good', watched: false, art: null, handed: true };
    }
    for (;;) {
      const { zone, watched, perfect } = await w(act === 'beats' ? (dk === 'scoop' ? attemptScoop(how) : attemptBeats(how)) : attempt(how));
      phase = 'busy';
      cue(null);
      st[zone] += 1;
      if (perfect) st.perfect = (st.perfect || 0) + 1;
      if (watched) { st.watched += 1; R.watched += 1; }
      const artShape = id === 'pour' && zone === 'good' && level === 'barista' && sk.art && soFar.has('espresso') && made.temp === 'hot' ? sk.art : null;
      if (artShape) shot?.set(p, false, true);
      gauge.classList.add('is-done');
      [stepB, stopB, watchB].forEach((b) => { if (b) b.disabled = true; });
      status.replaceChildren(...[
        h('b', { class: `bw-verdict z-${zone}${perfect ? ' is-perfect' : ''}` }, zone === 'good' ? h('i', { html: ICON(perfect ? 'sparkle' : 'check') }) : null, perfect ? SYS.perfect : `${sk.labels[zone]}${zone === 'good' ? '!' : ''}`),
        watched ? h('em', { class: 'bw-watched', text: '보기로 했어요' }) : null,
        artShape ? h('b', { class: 'bw-verdict z-art' }, h('i', { html: ICON('heart') }), SYS.art) : null,
        zone !== 'good' ? h('span', { class: 'bw-retry-q', text: SYS.retry }) : null,
      ].filter(Boolean));
      if (perfect) gauge.classList.add('is-perfect');
      if (zone === 'good') {
        // 성공은 경쾌하게 "빵!"(2026-11-02 사용자) + 반짝이. 딱 좋아요 · 하트는 그 위에 한 번 더
        audio.sfx('pang');
        if (artShape || perfect) setTimeout(() => audio.sfx(artShape ? 'heart' : 'great'), 200);
        { const c = centerOf(view); vfx.burst('sparkle', c.x, c.y, { n: 12, dist: [80, 240], size: [22, 46], colors: ['#FFFFFF', '#FFE14D', '#7FD8A4'] }); }
        talk(sysV(perfect ? SYS.perfect : sk.labels[zone]), artShape ? sysV(SYS.art) : null);
        noteSkill();
        return { skill: id, zone, watched, art: artShape, perfect: Boolean(perfect) };
      }
      missShow(view, sk, zone);
      talk(sysV(sk.labels[zone]), sysV(SYS.retry));
      if (!(await w(askRetry()))) { noteSkill(); return { skill: id, zone, watched, art: null }; }
      missClear(view);
      st.tries += 1;
      p = 0;
      lastZone = null;
      gauge.classList.remove('is-done', 'is-perfect');
      makeCtrl();
      draw();
      talk(sysV(SYS.again));
      how = 'play';
    }
  }

  /** 한 컷이 없는 손 동작의 임시 그림(대체 요망): 동작에 맞는 물건 + 지금 상태(set(p)) */
  function actView(id, act, soFar, res) {
    const box = h('div', { class: `bw-close-objs v-${id}` });
    const cupNow = () => drinkArt(made, res, soFar, 'big');
    const one = (fn) => { const el = h('span', { class: 'bw-art big bw-live' }); el.innerHTML = fn(0, 0); box.append(el); return el; };
    let live = null;
    let liveFn = null;
    const ingBase = INGREDIENTS[made.base] ? made.base : null;
    switch (id) {
      case 'tamp': liveFn = (p) => tampSVG(p); break;
      case 'grind': liveFn = (p) => grinderSVG(p); break;
      case 'boil': liveFn = (p) => kettleBoilSVG(p); break;
      case 'steep': liveFn = (p) => teaCupSVG(p, INGREDIENTS.barley.color); break;
      case 'bloom': liveFn = (p, f) => dripperSVG({ wet: p, stream: f.flow }); break;
      case 'bloom_wait': liveFn = (p) => dripperSVG({ wet: 1, bloom: p < 0.7 ? p / 0.7 : Math.max(0, 1 - (p - 0.7) / 0.3), drip: p * 0.3 }); break;
      case 'spiral': liveFn = (p, f) => topViewSVG({ color: '#3A2214', angle: (f.laps || 0) * 360, tool: 'kettle', rim: '#F4E9D6' }); break;
      case 'hand_grind': liveFn = (p, f) => handGrinderSVG((f.laps || 0) * 360); break;
      case 'stir': liveFn = (p, f) => topViewSVG({ color: drinkSpec(made, res, soFar).color || '#B07F52', angle: (f.laps || 0) * 360, tool: 'spoon' }); break;
      case 'whisk': liveFn = (p, f) => topViewSVG({ color: INGREDIENTS.matcha.color, angle: (f.laps || 0) * 360, tool: 'whisk' }); break;
      default: break;
    }
    if (liveFn) {
      live = one((p) => liveFn(p, {}));
      if (['grind', 'tamp', 'steep'].includes(id) === false && act !== 'circle') box.append(cupNow());
    } else if (act === 'beats') {
      const obj = id === 'jam' ? (ingBase === 'strawberry' ? 'obj_strawberry' : 'obj_yuja') : id === 'powder' ? (ingBase === 'matcha' ? 'obj_matcha' : 'obj_cocoa') : HAND_SKILLS[id].obj;
      box.append(objArt(obj, 'mid is-on'), id === 'tap' ? objArt('obj_pitcher_milk', 'mid') : cupNow());
    } else {
      // 누르고 떼기(한 컷이 없을 때): 하는 일에 맞는 물건 + 컵
      const arts = id === 'extract' ? [objArt('obj_machine', 'machine is-on'), objArt('cup_shot', 'mid')]
        : id === 'pour' ? [objArt('obj_pitcher_milk', 'mid is-on tilt'), cupNow()]
          : id === 'water' ? [objArt('obj_kettle', 'mid is-on tilt'), cupNow()]
            : id === 'milk_in' ? [objArt('obj_milk_bottle', 'mid is-on tilt'), objArt('obj_pitcher', 'mid')]
              : [objArt(HAND_SKILLS[id].obj || 'obj_pitcher_milk', 'mid is-on'), cupNow()];
      box.append(...arts);
    }
    let last = '';
    return {
      el: box,
      set(p, f = {}) {
        if (!live || !liveFn) return;
        const key = `${p.toFixed(3)}|${f.flow ? 1 : 0}|${(f.laps || 0).toFixed(2)}`;
        if (key === last) return;
        last = key;
        live.innerHTML = liveFn(p, f);
      },
    };
  }

  /** 손 동작 없이 넣는 것(얼음 · 믹스 가루 등). 에스프레소가 든 잔에 물을 저절로 부을 때는 블렌더 한 컷(물 붓기 water · water_glass)이 있으면 그것으로 */
  async function autoStep(id, soFar, res) {
    const text = id === 'ice' ? TEMPS.iced.auto : INGREDIENTS[id]?.auto?.[made.temp] || INGREDIENTS[id]?.auto?.hot || `${INGREDIENTS[id]?.name || ''}을 넣었어요.`;
    const autoSid = id === 'water' ? shotIdFor('water', soFar) : null;
    const shot = autoSid ? shotView(autoSid) : null;
    soFar.add(id);
    if (shot) {
      await autoShot(shot, `${INGREDIENTS[id].name} 붓기`, text);
      return;
    }
    setPanel(askRow('', text));
    setScene({ center: drinkArt(made, res, soFar, 'big'), right: id === 'ice' ? objArt('iced', 'mid is-on') : objArt(INGREDIENTS[id]?.obj, 'mid is-on'), mode: 'auto' });
    audio.sfx(id === 'ice' ? 'ice' : id === 'syrup' ? 'stack' : 'pour');
    talkAfter(sysV(text));
    await w(pauseMs(1300));
  }

  /** 옮겨 붓기(손 동작 없이, 검수 13.81): 샷잔에 내린 에스프레소 · 피처에 녹인 청을 컵에. 블렌더 컷(pourin_{잔}_{음료})이 저절로 차오름 */
  async function pourinStep(x, soFar, res) {
    const text = POURIN_SAY[x] || POURIN_SAY.espresso;
    const sid = shotIdFor('pourin', soFar);
    const shot = sid ? shotView(sid) : null;
    soFar.add(x);
    if (shot) {
      await autoShot(shot, '옮겨 붓기', text);
      return;
    }
    setPanel(askRow('', text));
    setScene({ center: drinkArt(made, res, soFar, 'big'), right: objArt(x === 'yuja' ? 'obj_pitcher_milk' : 'cup_shot', 'mid is-on'), mode: 'auto' });
    audio.sfx('pour');
    talkAfter(sysV(text));
    await w(pauseMs(1300));
  }

  /** 저절로 하는 일의 한 컷: 손 기술처럼 확대 창에 띄우되 띠 · 단추 없이 잔이 차오름(붓기와 같은 단계 수라 알맞아요 칸 가운데까지) */
  async function autoShot(shot, name, text) {
    setPanel();
    const view = h('div', { class: 'bw-close-view' });
    const card = h('section', { class: 'bw-close is-auto', role: 'group', 'aria-label': name },
      h('header', { class: 'bw-close-head' }, h('h3', { text: name }), h('p', { text })),
      h('div', { class: 'bw-close-body' }, view));
    closeUpOff();
    closeEl = card;
    bench.append(card);
    bench.classList.add('is-close');
    setScene({ mode: 'water', shot, host: view, keep: true });
    audio.sfx('pour');
    talkAfter(sysV(text));
    const end = 0.8125;
    for (let i = 0; i <= 12; i++) {
      shot.set((end * i) / 12, true);
      await w(pauseMs(110));
    }
    shot.set(end, false);
    await w(pauseMs(900));
  }

  /** 고른 레시피대로 만들기(틀린 레시피도 고른 대로) */
  /** 레시피가 다를 때 다시 볼 곳: 컵 규칙 · 온도 · 빠진 재료와 뺄 재료의 이름(다른 곳이 여럿이면 앞의 둘) + 수첩(단골의 평소 주문이면 단골 쪽) */
  function wrongHint(target, diff) {
    const want = [target.base, ...(target.adds || [])].filter(Boolean);
    const have = [made.base, ...(made.adds || [])].filter(Boolean);
    const miss = { missing: want.filter((x) => !have.includes(x)), extra: have.filter((x) => !want.includes(x)) };
    const names = (ids) => ids.map((x) => INGREDIENTS[x]?.name || x).join(' · ');
    const ingSay = [miss.missing.length ? `${josa(names(miss.missing), '이/가')} 빠졌어요.` : '', miss.extra.length ? `${josa(names(miss.extra), '은/는')} 빼요.` : ''].filter(Boolean).join(' ');
    const hintOf = (d) => (d === 'cup' ? cupHintOf(cur) : d === 'temp' ? TEMP_HINT[orderTemp(cur)] : ingSay || HINT[d]);
    const hint = [...new Set(diff.map(hintOf))].slice(0, 2).join(' ');
    const hint2 = cur.usual && diff.some((d) => d === 'base' || d === 'adds') ? HINT.usual : HINT.book;
    return { hint, hint2, miss: miss.missing.length || miss.extra.length ? miss : null };
  }

  /* ---- 레시피와 다르게 골랐을 때(2026-11-04 사용자 "휘리릭 무언가 만드는 듯한 애니메이션 → 잘못 만들었다고 버리고 다시 하라는 요청 → 버리는 장면") ----
   * 손 동작 · 블렌더 한 컷은 쓰지 않음(고른 컵과 다른 장면이 나왔음). 휘리릭(고른 빈 컵 + 회오리 · 퐁) → 고른 대로 만든 잔 →
   * 무엇이 다른지(손 띠에 표시) + [버리기](레시피에 없는 엉뚱한 잔이면 [사장님께 맛보이기]도) → 버리는 장면 → 처음부터 다시. 감점 · 실패 화면 없음(원칙 2) */
  async function wrongMade(target, diff) {
    phase = 'busy';
    R.mistakes += 1;
    showGuest('normal');
    setReact('');
    await whirl();
    const { hint, hint2, miss } = wrongHint(target, diff);
    const toss = btn('trash', '버리기', 'btn-big btn-main bw-toss-btn');
    ui.toss = toss;
    const odd = !findMenu(made) && opts.maker !== 'owner' && today?.owner !== false ? btn('coffee', '사장님께 맛보이기', 'btn-big btn-soft bw-taste') : null; // 엉뚱한 잔 도감(재미 개편 3.2)
    ui.taste = odd;
    const more = cur.usual && hint2 === HINT.usual ? hint2 : '';
    setScene({ center: h('div', { class: 'bw-made-wrong' }, drinkArt(made, {}, null, 'big')), mode: 'wrong' });
    setPanel(askRow('', `${SYS.wrongMade} ${hint}${more ? ` ${more}` : ''}`), handRow({ hint: diff, lock: true, miss }), resultBox({ checks: [] }),
      askRow('', SYS.toss), h('div', { class: 'bw-row' }, odd, toss));
    phase = 'wrong';
    audio.sfx('miss_sulk');
    talk(sysV(SYS.wrongMade), sysV(hint), more ? sysV(more) : null, sysV(SYS.toss));
    focusLater(toss);
    if (odd && (await w(waitTap(toss, odd))) === 1) {
      odd.remove();
      ui.taste = null;
      toss.disabled = true;
      await ownerTaste();
      toss.disabled = false;
      setReact('');
      phase = 'wrong';
      focusLater(toss);
      await w(waitTap(toss));
    } else if (!odd) await w(waitTap(toss));
    phase = 'busy';
    audio.sfx('tap');
    await tossScene();
    R.remakes += 1;
  }

  /** 휘리릭: 고른 빈 컵 둘레에 회오리 · 웹툰 글자, 끝에 퐁 하고 고른 대로 만든 잔으로 바뀜 */
  async function whirl() {
    const cupEl = objArt(cupArtId(made.cup), 'big');
    const word = h('div', { class: 'bw-pow bw-whirl-word', 'aria-hidden': 'true' },
      ...[...WHIRL_WORD].map((ch, i) => h('span', { class: 'bw-pow-ch', style: { '--i': String(i) }, text: ch })));
    const box = h('div', { class: 'bw-whirl' }, h('i', { class: 'bw-whirl-ring r1' }), h('i', { class: 'bw-whirl-ring r2' }), h('i', { class: 'bw-whirl-ring r3' }), cupEl, word);
    setScene({ center: box, mode: 'whirl' });
    setPanel(askRow('', SYS.making));
    audio.sfx('whoosh');
    await w(pauseMs(1150));
    audio.sfx('poof');
    cupEl.replaceWith(drinkArt(made, {}, null, 'big'));
    box.classList.add('is-done');
    await w(pauseMs(700));
  }

  /**
   * 버리는 장면: 개수대 위로 → 기울여 쏟음(얼음이면 얼음도) → 머그 · 유리컵은 식기 건조대에 엎어 둠, 종이컵 · 플라스틱 컵은 쓰레기통에.
   * 영상(assets/movies/discard_{mug|glass|paper|plastic}, 요청서 docs/image_requests.md 9장)이 오면 그 영상을 틀고, 움직임 줄이기면 마지막 장면만
   */
  /** 확대 창의 영상: 움직임 줄이기가 아니면 영상(효과음은 그 순간에), 움직임 줄이기면 마지막 장면만. 영상이 없으면 false */
  async function sceneMovie(view, id, cues) {
    const movie = id ? img.url('movies', id) : null;
    if (!movie) return false;
    if (!document.body.classList.contains('reduce-motion')) {
      const v = h('video', { class: 'bw-toss-movie', src: movie, muted: '', playsinline: '', autoplay: '', preload: 'auto' });
      v.muted = true;
      view.append(v);
      const left = (cues || [[0, 'pour']]).slice();
      const tick = setInterval(() => {
        if (!v.isConnected || stopped() || over) { clearInterval(tick); return; }
        while (left.length && v.currentTime >= left[0][0]) audio.sfx(left.shift()[1]);
      }, 40);
      await w(Promise.race([new Promise((r) => { v.addEventListener('ended', r, { once: true }); v.addEventListener('error', r, { once: true }); }), sleep(robot ? 300 : 12000)]));
      clearInterval(tick);
      await w(pauseMs(300));
      return true;
    }
    const end = img.url('movies', `${id}_end`);
    if (!end) return false;
    view.append(h('img', { class: 'bw-toss-movie', src: end, alt: '' }));
    await w(pauseMs(2200));
    return true;
  }

  async function tossScene() {
    const kind = TOSS_KIND[made.cup] || 'mug';
    const wash = kind === 'mug' || kind === 'glass';
    const text = wash ? SYS.tossWash : SYS.tossBin;
    setPanel();
    const view = h('div', { class: 'bw-close-view bw-toss-view' });
    const card = h('section', { class: 'bw-close is-auto is-toss', role: 'group', 'aria-label': '잔 버리기' },
      h('header', { class: 'bw-close-head' }, h('h3', { text: '잔 버리기' }), h('p', { text })),
      h('div', { class: 'bw-close-body' }, view));
    closeUpOff();
    closeEl = card;
    bench.append(card);
    bench.classList.add('is-close');
    setScene({ mode: 'toss', keep: true });
    talkAfter(sysV(text));
    // 효과음은 영상의 그 순간에(블렌더 영상, 검수 13.67): 쏟기 · 얼음이 개수대에 · 뚜껑 · 잔이 건조대 · 쓰레기통에
    if (await sceneMovie(view, `discard_${kind}`, TOSS_CUES[kind])) {
      closeUpOff();
      return;
    }
    // 그림 움직임: 단계 class(s1 ~ s5)마다 CSS 전환
    const spec = drinkSpec(made);
    const lidded = LIDDED.has(made.cup); // 포장 컵은 뚜껑을 열고 쏟음(닫힌 뚜껑으로 쏟지 않게)
    const cupBox = h('div', { class: 'bw-toss-cup' }, lidded ? openArt(made.cup, spec) : drinkArt(made, {}, null, 'toss'));
    const stream = h('i', { class: 'bw-toss-stream', style: { '--c': spec.color || '#B98A5E' } });
    const ice = spec.ice ? h('i', { class: 'bw-toss-ice' }, h('b'), h('b'), h('b')) : null;
    // 개수대 · 건조대 · 쓰레기통: 물건 그림(obj_sink · obj_rack · obj_bin, sheet_drinks · sheet_drinks_blue)이 오면 그림, 없으면 임시 그림
    const tossArt = (id, make) => (img.has('objects', id) ? `<img src="${img.url('objects', id)}" alt="" draggable="false">` : make());
    const sink = h('span', { class: 'bw-toss-sink', html: tossArt('obj_sink', sinkSVG) }, h('i', { class: 'bw-toss-drain' }));
    const dest = h('span', { class: `bw-toss-dest ${wash ? 'is-rack' : 'is-bin'}`, html: wash ? tossArt('obj_rack', rackSVG) : tossArt('obj_bin', binSVG) });
    const stage = h('div', { class: `bw-toss k-${kind}` }, sink, dest, stream, ice, cupBox);
    view.append(stage);
    await w(pauseMs(350));
    stage.classList.add('s1'); // 개수대 위로
    await w(pauseMs(650));
    stage.classList.add('s2'); // 기울여 쏟음
    audio.sfx('pour');
    await w(pauseMs(900));
    audio.sfx('water');
    cupBox.replaceChildren(lidded ? openArt(made.cup) : objArt(cupArtId(made.cup), 'toss'));
    await w(pauseMs(700));
    stage.classList.add('s3'); // 세움
    await w(pauseMs(500));
    stage.classList.add('s4'); // 건조대 · 쓰레기통 쪽으로
    await w(pauseMs(650));
    stage.classList.add('s5');
    audio.sfx(wash ? 'clink' : 'stack');
    await w(pauseMs(900));
    closeUpOff();
  }

  async function makeDrink() {
    phase = 'busy';
    const menu = findMenu(made);
    const steps = prepSteps(made, level);
    const res = { checks: [], art: null };
    // 컵에 이미 든 것: 그 재료를 컵에 넣는 손 동작(PUT_IN) 뒤, 아니면 그 재료의 마지막 손 동작 뒤(우유는 데우기가 아니라 붓기 뒤).
    //  딸기청 · 코코아는 떠 넣은 뒤부터 컵에 있음(젓기는 섞기만): 붓기 컷이 그 색(pour_glass_strawberry 등)을 고르고, 임시 그림도 그 색
    const soFar = new Set();
    const skillSteps = steps.filter((x) => x.skill);
    let n = 0;
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (st.auto) { await autoStep(st.auto, soFar, res); continue; }
      if (st.pourin) { await pourinStep(st.pourin, soFar, res); continue; }
      n += 1;
      const c = await runSkill(st.skill, n, skillSteps.length, soFar, res, menu);
      res.checks.push(c);
      if (c.art) res.art = c.art;
      if (PUT_IN.has(st.skill) || !steps.slice(i + 1).some((x) => x.ing === st.ing)) soFar.add(st.ing);
      await w(pauseMs(c.zone === 'good' ? 1100 : 400));
    }
    return res;
  }

  /** 만든 것 보여 주기(드리기 전·반응 때) */
  function resultBox(res) {
    const menu = findMenu(made);
    return h('div', { class: 'bw-result' },
      h('p', { class: 'bw-made' }, h('span', { text: '만든 음료' }), h('b', { text: menu ? RECIPES[menu].name : '레시피에 없는 음료' })),
      res.checks.length || res.art ? h('ul', { class: 'bw-checks' },
        ...res.checks.map((c) => {
          const sk = HAND_SKILLS[c.skill];
          return h('li', { class: `z-${c.zone}` }, h('i', { html: ICON(c.zone === 'good' ? 'check' : 'think') }), h('span', { text: sk.name }), h('b', { text: sk.labels[c.zone] }), c.watched ? h('em', { text: '보기' }) : null);
        }),
        res.art ? h('li', { class: 'z-good z-art' }, h('i', { html: ICON('heart') }), h('span', { text: '라테아트' }), h('b', { text: LATTE_ART[res.art]?.name || '' })) : null) : null);
  }

  async function serve(res, { again = false } = {}) {
    phase = 'serve';
    setScene({ center: h('div', { class: 'bw-served' }, drinkArt(made, res, null, 'big'), objArt('obj_tray', 'tray')), mode: 'serve' });
    const give = btn('tray', '드리기', 'btn-big btn-main bw-serve');
    ui.serve = give;
    const say = again ? SYS.moveServe : PROMPT.serve;
    setPanel(askRow('', say), resultBox(res), h('div', { class: 'bw-row' }, give));
    talkAfter(sysV(say));
    focusLater(give);
    await w(waitTap(give));
    phase = 'busy';
    audio.sfx('tray');
    if (!again) R.attempts += 1; // 옮겨 담고 다시 드린 것은 같은 잔
  }

  /* ---- 손님이 마음을 바꿈: 매장 → 가져가기(2026-11-04 사용자 "Add that scene", 검수 13.43 🙋 · 13.45) ----
   * [드리기]를 누르는 순간 손님이 "가져갈게요" → 가져가는 컵을 고름(틀리면 컵 규칙 한 줄 · 그 컵은 흐리게 · 다시) → 옮겨 담는 장면 → 그 컵으로 [드리기].
   * 음료는 같으니 버리지 않고 옮김. 감점 없음(잘못 고른 컵은 선생님 기록에만) */
  async function changeToGo(res) {
    const ch = cur.change;
    cur = { ...cur, togo: true, change: null, thanks: ch.thanks || cur.thanks }; // 주문을 고치지 않고 새로(되감기 · 다시 하기에서 처음 주문 그대로)
    const want = orderTarget(cur).cup;
    phase = 'busy';
    setPanel();
    if (ch.sfx) { // 바꾸는 까닭이 먼저 들림(버스가 들어옴 등)
      audio.sfx(ch.sfx);
      await w(pauseMs(700));
    }
    showGuest('surprised');
    setReact(ch.say);
    renderTicket(new Set(['temp', 'togo']), 'togo'); // 주문 메모도 '가져가요'로
    await w(robot ? sleep(60) : talk(guestV(ch.say)));
    showGuest('normal');
    const cups = pantry.cups.filter((id) => id !== made.cup);
    const picks = cups.map((id) => h('button', { class: 'btn btn-soft bw-cup-pick', 'data-cup': id }, objArt(cupArtId(id), 'pick'), h('span', { text: CUPS[id].name })));
    ui.movePicks = new Map(cups.map((id, i) => [id, picks[i]]));
    ui.moveWant = want;
    let note = SYS.changeTell;
    for (;;) {
      setPanel(askRow('', note), h('div', { class: 'bw-row bw-cup-picks' }, ...picks));
      phase = 'change';
      talk(sysV(note));
      focusLater(picks.find((b) => !b.disabled));
      const i = await w(waitTap(...picks));
      audio.sfx('tap');
      if (cups[i] === want) break;
      // 다른 컵: 컵 규칙 한 줄(가져가는 차가운 음료는 플라스틱 컵 …) + 그 컵은 흐리게
      R.moveMiss += 1;
      picks[i].disabled = true;
      picks[i].classList.add('is-wrong');
      note = cupHintOf(cur);
    }
    phase = 'busy';
    R.moved += 1;
    setReact(SAY.wait); // 옮겨 담는 동안 손님은 "네, 기다릴게요."
    await moveScene(want, res);
    made.cup = want;
    await serve(res, { again: true });
  }

  /** 옮겨 담는 장면: 든 잔을 새 컵 위로 → 기울여 부음(얼음도) → 새 컵이 참 → 뚜껑을 덮음(가져가는 컵) → 쓴 컵은 식기 건조대에 엎어 둠 */
  async function moveScene(toCup, res) {
    setPanel();
    const view = h('div', { class: 'bw-close-view bw-toss-view' });
    const card = h('section', { class: 'bw-close is-auto is-toss', role: 'group', 'aria-label': '옮겨 담기' },
      h('header', { class: 'bw-close-head' }, h('h3', { text: '옮겨 담기' }), h('p', { text: SYS.move })),
      h('div', { class: 'bw-close-body' }, view));
    closeUpOff();
    closeEl = card;
    bench.append(card);
    bench.classList.add('is-close');
    setScene({ mode: 'toss', keep: true });
    talkAfter(sysV(SYS.move));
    const mk = `${TOSS_KIND[made.cup] || 'mug'}_${toCup}`;
    const mv = MOVE_MOVIES[mk];
    if (mv && mv.drink === cur.menu && (await sceneMovie(view, `move_${mk}`, mv.cues))) {
      closeUpOff();
      return;
    }
    const spec = drinkSpec(made, res);
    const lidded = LIDDED.has(toCup); // 가져가는 컵: 뚜껑을 연 채로 붓고, 다 부으면 뚜껑을 덮음
    const fromBox = h('div', { class: 'bw-move-from' }, drinkArt(made, res, null, 'toss'));
    const lid = lidded ? h('span', { class: 'bw-art bw-move-lid', html: lidSVG(toCup) }) : null;
    const toBox = h('div', { class: 'bw-move-to' }, lidded ? openArt(toCup) : objArt(cupArtId(toCup), 'toss'), lid);
    const stream = h('i', { class: 'bw-move-stream', style: { '--c': spec.color || '#B98A5E' } });
    const ice = spec.ice ? h('i', { class: 'bw-move-ice' }, h('b'), h('b'), h('b')) : null;
    const rack = h('span', { class: 'bw-toss-dest is-rack', html: img.has('objects', 'obj_rack') ? `<img src="${img.url('objects', 'obj_rack')}" alt="" draggable="false">` : rackSVG() });
    const stage = h('div', { class: 'bw-move' }, rack, toBox, stream, ice, fromBox);
    view.append(stage);
    await w(pauseMs(350));
    stage.classList.add('s1'); // 새 컵 위로
    await w(pauseMs(650));
    stage.classList.add('s2'); // 기울여 부음
    audio.sfx('pour');
    await w(pauseMs(900));
    const full = drinkArt({ ...made, cup: toCup }, res, null, 'toss');
    toBox.replaceChildren(...[lidded ? openArt(toCup, spec) : full, lid].filter(Boolean));
    fromBox.replaceChildren(objArt(cupArtId(made.cup), 'toss'));
    await w(pauseMs(600));
    stage.classList.add('s3'); // 세움
    await w(pauseMs(450));
    if (lidded) { // 뚜껑을 덮음 → 뚜껑이 있는 그림으로(같은 자리라 그대로 이어짐)
      stage.classList.add('is-lid');
      audio.sfx('tap');
      await w(pauseMs(650));
      toBox.replaceChildren(full);
    }
    stage.classList.add('s4'); // 건조대 쪽으로
    await w(pauseMs(650));
    stage.classList.add('s5');
    audio.sfx('clink');
    await w(pauseMs(800));
    closeUpOff();
  }

  /** 손님 반응 → 'next'(다음 주문) · 'fresh'(처음부터 다시) · 'keep'(같은 레시피로 다시) */
  async function react(target, res) {
    const diff = compareRecipe(made, target);
    const last = curIndex === orders.length - 1;
    if (diff.length) {
      // 레시피가 다름: 차분한 말 + 다시 볼 곳(컵 = 매장/포장 규칙, 온도 = 주문한 온도, 단골의 평소 주문 = 수첩) → [다시 만들기]만(실수로 셈)
      R.mistakes += 1;
      showGuest('surprised');
      const wrongSay = cur.usual ? SAY.usualWrong : SAY.wrong;
      setReact(wrongSay);
      const { hint, hint2, miss } = wrongHint(target, diff);
      const again = btn('repeat', '다시 만들기', 'btn-big btn-main bw-remake');
      ui.remake = again;
      // 레시피에 없는 엉뚱한 잔이면 [사장님께 맛보이기](재미 개편 3.2): 사장님의 한마디 + 엉뚱한 잔 도감. 손님 잔은 그다음에 다시 만듦
      const odd = !findMenu(made) && opts.maker !== 'owner' && today?.owner !== false ? btn('coffee', '사장님께 맛보이기', 'btn-big btn-soft bw-taste') : null; // 사장님이 자리를 비운 날은 맛보기 없음
      ui.taste = odd;
      const rowEl = h('div', { class: 'bw-row' }, odd, again);
      setPanel(askRow('', `${hint} ${hint2}`), handRow({ hint: diff, lock: true, miss }), resultBox(res), rowEl);
      phase = 'wrong';
      talk(guestV(wrongSay), sysV(hint), sysV(hint2));
      focusLater(again);
      if (odd && (await w(waitTap(again, odd))) === 1) {
        odd.remove();
        ui.taste = null;
        again.disabled = true;
        await ownerTaste();
        again.disabled = false;
        showGuest('normal');
        setReact(wrongSay);
        phase = 'wrong';
        focusLater(again);
        await w(waitTap(again));
      } else if (!odd) await w(waitTap(again));
      phase = 'busy';
      R.remakes += 1;
      audio.sfx('tap');
      showGuest('normal');
      setReact(SAY.wait);
      return 'fresh';
    }
    const miss = res.checks.find((c) => c.zone !== 'good');
    let words;
    if (miss) {
      // 레시피는 맞고 손 동작이 칸을 벗어남: 그 잔의 결과로 말함(그 손님만의 말 orders[].miss) → [다시 만들기] / [그대로 드리기]
      words = cur.miss || (cur.kid && miss.skill === 'steam' ? KID_CUP.react[miss.zone] : null) || HAND_SKILLS[miss.skill].react[miss.zone];
      showGuest('normal');
      setReact(words);
      const again = btn('repeat', '다시 만들기', 'btn-big btn-soft bw-remake');
      const keep = btn('greet', '그대로 드리기', 'btn-big btn-soft bw-keep');
      ui.remake = again;
      ui.keep = keep;
      setPanel(askRow('', PROMPT.mild), resultBox(res), h('div', { class: 'bw-row' }, again, keep));
      phase = 'mild';
      talk(guestV(words), sysV(PROMPT.mild));
      focusLater(again);
      const i = await w(waitTap(again, keep));
      phase = 'busy';
      audio.sfx('tap');
      if (i === 0) {
        R.remakes += 1;
        setReact(SAY.wait);
        return 'keep';
      }
      R.kept += 1;
      words = SAY.accept;
    } else {
      words = res.art && RECIPES[cur.menu]?.artThanks ? RECIPES[cur.menu].artThanks : thanksOf(cur);
      if (res.art) R.art += 1;
    }
    // 손님이 받음(알맞게 만들었거나 그대로 드림). 단골의 평소 주문이면 수첩의 단골 쪽에 남음(PRD 6.3)
    R.made.push(cur.menu);
    R.cups.push({ who: cur.who, menu: cur.menu, temp: orderTemp(cur) }); // 하루 끝 화면의 '오늘 만든 잔'
    store.addBook([cur.menu]); // 메뉴 도감(해가 바뀌어도 남음)
    // 지은의 성장: 드린 잔 · 늘 먹던 것 · 완벽한 한 잔(손 동작을 모두 '딱 좋아요'로 직접 했을 때 → 도감에 금빛 별)
    grow.add('cups');
    if (cur.usual) grow.add('usual');
    const perfectNew = !miss && opts.maker !== 'owner' && res.checks.length > 0 && res.checks.every((c) => c.perfect) && grow.addPerfect(cur.menu);
    if (perfectNew) R.perfect = (R.perfect || 0) + 1;
    const usual = REGULARS[cur.who]?.usual;
    if (usual && (!usual.menu || usual.menu === cur.menu)) store.setFlag('usuals', { ...(store.flag('usuals') || {}), [cur.who]: true });
    showGuest('smile');
    setReact(words);
    audio.sfx(miss ? 'good' : 'great');
    const next = btn(last ? 'check' : 'arrow_right', last ? '다 했어요' : '다음 주문', 'btn-big btn-main bw-next'); // 같은 손님의 다음 잔일 때도 있어 '주문'(2026-10-31 사용자)
    ui.next = next;
    setPanel(last ? askRow('', SYS.done, { say: null }) : null,
      perfectNew ? h('p', { class: 'bw-perfect-cup' }, h('i', { html: ICON('star') }), SYS.perfectCup) : null,
      resultBox(res), h('div', { class: 'bw-row' }, next));
    phase = 'good';
    if (perfectNew) audio.sfx('jingle_unlock');
    talk(guestV(words), perfectNew ? sysV(SYS.perfectCup) : null, last ? sysV(SYS.done) : null);
    focusLater(next);
    await w(waitTap(next));
    phase = 'busy';
    audio.sfx('tap');
    return 'next';
  }

  /* ---- 주문 받기(2026-10-31 사용자 "라테를 주문하면서 종이컵인지 머그컵인지 말하지 않는다 · 테이크아웃 대화가 없다") ----
   * 손님이 말하지 않은 것(orders[].ask)은 주문 메모에 '?'. 학생이 묻는 말 단추를 누르면 지은이 묻고 손님이 대답 → 메모가 채워짐.
   * 다 채우면 [주문 확인]: 지은이 주문을 되풀이하고("아이스 아메리카노 한 잔, 가져가시는 거죠?") 손님이 "네, 맞아요." */
  const hasTempChoice = (o) => (RECIPES[o.menu]?.temps.length || 0) > 1;
  const fixedCup = (o) => o.cup || RECIPES[o.menu]?.cup || null;
  function renderTicket(know, fresh = null) { // fresh: 방금 바뀐 칸('togo' = 손님이 가져가기로 바꿈)을 잠깐 밝게
    const o = cur;
    const row = (label, value, icon, key) => h('span', { class: ['bw-tk', value ? '' : 'is-q', key && key === fresh ? 'is-new' : ''].filter(Boolean).join(' ') },
      h('i', { html: ICON(icon) }), h('small', { text: label }), h('b', { text: value || '?' }));
    const t = orderTemp(o);
    ticket.replaceChildren(...[
      h('b', { class: 'bw-tk-t', text: '주문 메모' }),
      row('메뉴', o.usual ? '늘 드시던 것' : o.ticket || RECIPES[o.menu]?.name || '', 'menu'), // ticket: 손님이 말로 설명한 주문("달게 한 잔")
      hasTempChoice(o) || o.usual ? row('온도', know.has('temp') && !o.usual ? TEMPS[t].name : o.usual ? '늘 드시던 대로' : null, t === 'iced' && know.has('temp') ? 'ice' : 'coffee') : null,
      fixedCup(o) ? row('컵', CUPS[fixedCup(o)].name, 'cup') : row('매장/포장', know.has('togo') ? SERVICES[orderService(o)].name : null, o.togo && know.has('togo') ? 'bag' : 'chair', 'togo'),
      o.kid ? row(KID_CUP.ticket, KID_CUP.ticketValue, 'milk') : null, // 아이 잔: 우유를 덜 데움
    ].filter(Boolean));
  }
  /** 지은이 하는 말(아래 띠 위쪽 한 줄 + 지은 목소리) */
  const meLine = (text) => h('p', { class: 'bw-me' }, h('b', { text: CHARS.jieun?.name || '지은' }), h('span', { text }));
  /** 사장님이 하는 말(사장님이 내리는 장면에서 만들기 전에 일러 줌): 할 일 줄과 같은 자리 · 앞에 이름 */
  const ownerAsk = (text) => h('div', { class: 'bw-ask is-owner' }, h('p', { class: 'bw-ask-t' }, h('b', { class: 'bw-ask-who', text: CHARS.owner?.name || '사장님' }), text), sayBtn(text));

  /** maker: 'owner' — 고른 것을 레시피와 견줌: 사장님의 말 + 손 띠 표시(컵 · 온도 · 빠진 재료 · 빼요). 같으면 null */
  function ownerCheck(target) {
    const want = [target.base, ...(target.adds || [])].filter(Boolean);
    const missing = want.filter((x) => !ings.includes(x));
    const extra = ings.filter((x) => !want.includes(x));
    const says = [];
    const fixedCup = cur.cup || RECIPES[cur.menu]?.cup; // 믹스커피처럼 컵이 정해진 메뉴
    if (made.cup !== target.cup) says.push(fixedCup ? `이건 ${CUPS[target.cup]?.name || ''}에 내요.` : orderService(cur) === 'togo' ? '손님은 가져가신답니다.' : '손님은 여기서 드시고 가신답니다.');
    if (missing.length && extra.length) says.push('재료가 조금 다르네요.');
    else if (missing.length) says.push('재료가 조금 부족하네요.');
    else if (extra.length) says.push('재료가 좀 많네요.');
    if (made.temp !== target.temp) says.push(target.temp === 'iced' ? '차갑게 드신답니다.' : '따뜻하게 드신답니다.');
    return says.length ? says.slice(0, 2).join(' ') : null;
  }
  /** 사장님이 일러 준 뒤: 지금 고른 것으로 남은 고칠 곳(고치면 표시가 사라짐) */
  function fixNow() {
    if (!fix) return null;
    const t = fix.target;
    const want = [t.base, ...(t.adds || [])].filter(Boolean);
    const miss = { missing: want.filter((x) => !ings.includes(x)), extra: ings.filter((x) => !want.includes(x)) };
    const hint = [made.cup !== t.cup && 'cup', made.temp !== t.temp && 'temp'].filter(Boolean);
    const left = miss.missing.length || miss.extra.length;
    return { say: fix.say, hint, miss: left ? miss : null, done: !hint.length && !left };
  }
  function takeOrder() {
    phase = 'order';
    const need = orderAsk(cur);
    const know = new Set(['temp', 'togo'].filter((k) => !need.includes(k)));
    let busy = false;
    let said = null;
    return new Promise((resolve) => {
      const render = () => {
        renderTicket(know);
        const left = need.filter((k) => !know.has(k));
        ui.asks = left.map((k) => {
          const b = btn(k === 'temp' ? 'ice' : 'bag', ASK_SAY[k], 'btn-big btn-soft bw-askq');
          b.disabled = busy;
          onTap(b, () => ask(k));
          return b;
        });
        const ok = btn('check', '주문 확인', 'btn-big btn-main bw-confirm');
        ok.disabled = busy || left.length > 0;
        onTap(ok, confirm);
        ui.confirm = ok;
        // 응대(지은의 성장)가 오르면 온도와 매장 · 포장을 한 번에(재미 개편 6.1)
        const all = left.length >= 2 && grow.level('service') >= grow.UNLOCK.serviceAsk ? btn('speech', '한 번에 묻기', 'btn-big btn-main bw-askall') : null;
        if (all) {
          all.disabled = busy;
          onTap(all, async () => {
            for (const k of [...left]) {
              if (know.has(k)) continue;
              await ask(k);
              await w(robot ? sleep(60) : talking);
            }
          });
        }
        setPanel(said ? meLine(said) : null, askRow('', left.length ? PROMPT.order : PROMPT.orderDone), h('div', { class: 'bw-row bw-asks' }, all, ...ui.asks, ok));
        panel.dataset.kind = 'order';
        if (!busy) focusLater(ui.asks[0] || ok);
      };
      const speak = async (parts) => { // 자동 플레이는 기다리지 않음
        const t = talk(...parts);
        await w(robot ? sleep(60) : t);
      };
      const ask = async (k) => {
        if (busy || phase !== 'order') return;
        busy = true;
        R.asked += 1;
        grow.add('asks');
        audio.sfx('tap');
        said = ASK_SAY[k];
        render();
        await speak([[ASK_SAY[k], 'jieun']]);
        const reply = replyOf(cur, k);
        know.add(k);
        showGuest('smile');
        setReact(reply);
        busy = false;
        render();
        talk(guestV(reply));
      };
      // 오늘의 칠판(얼음 · 우유가 떨어짐 · 머신이 데워지는 중): 알림 → 학생이 [손님에게 말하기] → 지은이 사정을 말하고 권함 → 손님 대답 → 주문이 바뀜
      const tellLack = (lack) => new Promise((done) => {
        phase = 'lack';
        const b = btn('speech', TODAY_SAY.tell, 'btn-big btn-main bw-tell');
        ui.tell = b;
        setPanel(askRow('', lack.notice), h('p', { class: 'bw-lack-say' }, h('i', { html: ICON('speech') }), lack.say), h('div', { class: 'bw-row' }, b));
        panel.dataset.kind = 'order';
        audio.sfx('hint');
        talk(sysV(lack.notice));
        focusLater(b);
        onTap(b, async () => {
          if (b.disabled) return;
          b.disabled = true;
          audio.sfx('tap');
          said = lack.say;
          setPanel(meLine(lack.say));
          await speak([[lack.say, 'jieun']]);
          showGuest('smile');
          setReact(lack.reply);
          await speak([guestV(lack.reply)]);
          R.adapted.push({ kind: lack.kind, from: cur.menu, to: lack.order.menu, temp: orderTemp(lack.order) });
          grow.add('asks');
          if (lack.kind === 'machine') {
            today.machine = false; // 기다리는 동안 머신이 다 데워짐
            showToday();
            audio.sfx('steam');
            setReact('');
            setPanel(askRow('', TODAY_SAY.machineReady));
            await speak([sysV(TODAY_SAY.machineReady)]);
          } else {
            cur = lack.order;
            orders[curIndex] = cur;
            renderTicket(new Set(['temp', 'togo']));
          }
          phase = 'order';
          done();
        });
      });
      const confirm = async () => {
        if (busy || phase !== 'order' || need.some((k) => !know.has(k))) return;
        busy = true;
        for (let n = 0; n < 3; n++) { // 우유도 얼음도 없으면 두 번
          const lack = lackOf(cur, today);
          if (!lack) break;
          await w(tellLack(lack));
        }
        audio.sfx('tap');
        said = repeatBack(cur);
        render();
        await speak([[said, 'jieun']]);
        showGuest('smile');
        setReact(SAY.yes);
        await speak([guestV(SAY.yes)]);
        showGuest('normal');
        phase = 'busy';
        resolve();
      };
      render();
    });
  }

  /* ---- 자동 플레이(?debug) ---- */
  let robot = null;   // null · 'auto' · 'bad'
  let speed = opts.maker === 'owner' ? 0.9 : 1; // 사장님 시연은 조금 천천히(0.9배, 2026-11-01 사용자). 자동 플레이는 3
  let badLeft = 0;    // 남은 '틀리게 고르기'
  let robotMiss = 0;  // 남은 '손 기술을 일부러 넘치게'(__mgAuto({ miss }))
  let robotKeep = false; // 넘친 뒤 [다시 하기] 대신 [이대로 하기](__mgAuto({ keep: true }))
  let robotGate = null; // 이 손 기술의 시작 창에서 자동 플레이를 멈춤(__mgAuto({ gate: 'pour' }): 손으로 시험할 때)
  let robotStop = null; // 시험: 이 단계(phase)에 오면 자동 플레이를 멈춤
  let driving = false;
  const clickIf = (b) => { if (b?.isConnected && !b.disabled) b.click(); };
  function robotTarget() {
    const t = orderTarget(cur);
    if (!badLeft) return t;
    const other = t.base === 'espresso' ? 'milk' : 'espresso'; // 자연스러운 실수: 바탕 재료를 바꿈(라테 → 따뜻한 우유처럼)
    // 그 재료가 카운터에 없는 날(정전 밤의 핸드드립: 머신이 없음)은 틀리게 고르기를 건너뜀(없는 단추를 기다리며 멈췄음, 2026-11-06)
    if (ui.hot && !ui.hot.has(`ing:${other}`)) { badLeft = 0; return t; }
    return { ...t, base: other, adds: t.adds.filter((a) => a !== other) };
  }
  function robotAct() {
    const t = robotTarget();
    if (robotStop && phase === robotStop) { robot = null; return; } // 시험: 이 단계부터는 손으로(__mgAuto({ stopAt }))
    switch (phase) {
      case 'recipe': {
        // 카운터 물건: 컵 → 재료(넘치거나 빠진 것) → 얼음 → [만들기 시작]
        if (made.cup !== t.cup) { clickIf(ui.hot?.get(`cup:${t.cup}`)); return; }
        const want = [t.base, ...t.adds];
        const extra = ings.find((x) => !want.includes(x));
        const miss = want.find((x) => !ings.includes(x));
        if (extra || miss) { clickIf(ui.hot?.get(`ing:${extra || miss}`)); return; }
        if (made.temp !== t.temp) { clickIf(tempEl ? ui.tempOpts?.get(t.temp) : ui.tempChip); return; } // 온도 창으로 고름
        arrange();
        if (!compareRecipe(made, t).length && badLeft) badLeft = 0;
        clickIf(ui.make);
        return;
      }
      case 'order': { const q = ui.asks?.find((b) => b?.isConnected && !b.disabled); if (q) q.click(); else clickIf(ui.confirm); return; }
      case 'lack': clickIf(ui.tell); return;
      case 'gate':
        if (robotGate && ui.gateSkill === robotGate) { robot = null; speed = 1; return; }
        clickIf(ui.gateGo);
        return;
      case 'retry': { // 일부러 넘친 뒤: [다시 하기](keep 이면 [이대로 하기] → 손님 반응에서 [다시 만들기])
        const b = robotKeep ? ui.goOn : ui.retry;
        if (b?.isConnected && !b.disabled) { robotMiss = Math.max(0, robotMiss - 1); b.click(); }
        return;
      }
      case 'serve': clickIf(ui.serve); return;
      case 'change': clickIf(ui.movePicks?.get(ui.moveWant)); return; // 가져가는 컵
      case 'wrong': if (robot === 'auto') clickIf(ui.toss?.isConnected ? ui.toss : ui.remake); return; // 다르게 만든 잔은 [버리기]
      case 'mild': clickIf(ui.remake); return; // 알맞게 다시 만듦
      case 'good': clickIf(ui.next); return;
      default:
    }
  }
  async function drive() {
    if (driving) return;
    driving = true;
    try {
      while (robot && !over && !stopped()) {
        await sleep(70);
        if (!robot || over || stopped()) break;
        if (bookEl) { closeBook(); continue; }
        if (document.querySelector('#layer-modal .ov, #layer-screen .scr')) continue;
        robotAct();
      }
    } finally { driving = false; }
  }
  if (debug) {
    window.__mgBad = async () => {
      if (over) return;
      badLeft = 1;
      robot = 'bad';
      speed = 3;
      drive();
      while (!over && !stopped() && !(phase === 'wrong' && !badLeft)) await sleep(60); // 다르게 만든 잔의 [버리기]가 뜰 때까지
      if (robot === 'bad') robot = null;
    };
    window.__mgAuto = async ({ miss = 0, keep = false, gate = null, stopAt = null } = {}) => {
      if (over) return;
      robotStop = stopAt;
      badLeft = 0;
      robotMiss = miss;
      robotKeep = keep;
      robotGate = gate;
      robot = 'auto';
      speed = 3;
      drive();
      await doneP;
    };
  }

  /* ---- 정리 ---- */
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    over = true;
    robot = null;
    curLoop?.stop();
    curLoop = null;
    curShot?.stop();
    curShot = null;
    closeTemp(false);
    closeBook(true);
    offQuit?.();
    talkNo += 1;
    document.body.classList.remove('brew-open');
    if (debug) { delete window.__mgAuto; delete window.__mgBad; }
    doneRes();
  }
  f.onAbort(() => { abortRes(STOP); cleanup(); });

  /* ---- 손님마다 ---- */
  try {
    for (let i = 0; i < orders.length; i++) {
      cur = orders[i];
      curIndex = i;
      let target = orderTarget(cur);
      if (!target) { console.warn('[brew] 없는 메뉴', cur.menu); continue; }
      f.el.querySelector('.mg-head h2').textContent = orders.length > 1 ? `${title} (${i + 1}/${orders.length})` : title;
      showGuest('normal');
      orderText.textContent = cur.say;
      setReact('');
      showProgress();
      setScene({ mode: 'recipe' });
      renderHots();
      // 처음 손님은 소개 말 다음에 주문(틀이 읽던 소개를 처음부터 이어서), 다음 손님은 바로 주문 → 주문 받기 → 레시피 고르기
      const ordering = takeOrder();
      talk(i === 0 ? sysV(speechOf(opts)) : null, guestV(cur.say), sysV(orderAsk(cur).length ? PROMPT.order : PROMPT.orderDone));
      await w(ordering);
      target = orderTarget(cur); // 오늘의 칠판으로 바뀐 주문
      setReact('');
      let pending = pickRecipe(false);
      talk(sysV(PROMPT.cup));
      fix = null;
      for (;;) {
        await w(pending);
        if (opts.maker === 'owner') { // 사장님이 내리는 장면: 다르면 만들지 않고 부드럽게 일러 줌 → 고른 것을 그대로 두고 다시
          const say = ownerCheck(target);
          if (say) {
            R.mistakes += 1;
            fix = { target, say };
            pending = pickRecipe(true);
            talk([say, voiceOf('owner', 'say')]);
            continue;
          }
          fix = null;
        }
        // 레시피와 다르게 골랐으면 손 동작 없이: 휘리릭 → [버리기] → 버리는 장면 → 처음부터 다시(2026-11-04 사용자)
        const diff = compareRecipe(made, target);
        if (diff.length) {
          await wrongMade(target, diff);
          pending = pickRecipe(false);
          talk(sysV(SYS.remake));
          continue;
        }
        const res = await makeDrink();
        await serve(res);
        if (cur.change) { // 손님이 마음을 바꿈: 가져가는 컵에 옮겨 담아 다시 드림
          await changeToGo(res);
          target = orderTarget(cur);
        }
        const how = await react(target, res);
        if (how === 'next') {
          // 오늘의 칠판: 드린 잔만큼 얼음 · 우유가 줄어듦(0 이면 다음 손님에게 사정을 말함)
          if (today?.ice !== undefined && made.temp === 'iced') today.ice = Math.max(0, today.ice - 1);
          if (today?.milk !== undefined && [made.base, ...made.adds].includes('milk')) today.milk = Math.max(0, today.milk - 1);
          showToday();
          if (cur.kid) { // 아이 잔: 드린 잔 수 · 우유를 알맞게(덜 뜨겁게) 데운 잔 수(선생님 화면 비고)
            R.kid.n += 1;
            if (res.checks.find((c) => c.skill === 'steam')?.zone === 'good') R.kid.good += 1;
          }
          break;
        }
        // 다시 만들기: 레시피가 틀렸으면 처음부터, 손 기술만 벗어났으면 같은 레시피로(고친 것만 다시 고를 수 있음)
        const keep = how === 'keep';
        pending = pickRecipe(keep);
        talk(guestV(SAY.wait), sysV(keep ? PROMPT.confirm : PROMPT.cup));
      }
    }
    phase = 'done';
    cleanup();
    f.close();
    await sleep(dur(150));
    return result();
  } catch (e) {
    cleanup();
    f.close(); // 정리(abortMinigame)로 이미 닫혔으면 그대로
    if (e !== STOP) throw e;
    return result(quitted ? { quit: true } : { aborted: true });
  }
}
