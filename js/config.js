/**
 * 직업 ε바리스타3 - 전역 설정 (엔진은 직업 마1스톤 v2에서 가져옴)
 * 숫자·연도처럼 해마다 바뀌는 값은 모두 여기에서만 관리합니다.
 */

export const CONFIG = {
  // 제목(사용자 결정 2026-10-30, PRD.md Q-3). 앞의 ε는 '3을 좌우로 뒤집은 모양'입니다.
  // 글로만 쓰는 곳(창 제목·설치 파일·대본)은 그리스 문자 ε, 처음 화면의 큰 제목은 진짜 3을 뒤집어 그립니다(title.js).
  // 바꾸면 package.json 의 productName, main.js 의 창 제목, index.html 의 title 도 함께 바꿉니다.
  TITLE: '직업 ε바리스타3',
  // 소리로 읽는 제목(음성 · 화면 읽기 프로그램). 앞의 뒤집은 3과 뒤의 3은 꾸밈이라 소리 내지 않음(사용자 결정 2026-10-30)
  TITLE_SAY: '직업 바리스타',
  BADGE: 'BARISTA',
  // 처음 화면 한 줄 소개 [큰 줄, 작은 줄]: PRD.md 1.1의 제안(검수 전)
  TAGLINE: ['한 잔의 작은 친절이 사람을 바꾸고, 마을을 바꿔요.', '바닷가 마을 카페에서 바리스타가 되어 가는 사계절.'],
  VERSION: '0.1.0',
  // 직업 마1스톤(jobms.v2)과 섞이지 않게 따로 씁니다
  SAVE_KEY: 'barista.v1',

  // 고정 캔버스(16:9). 모든 UI 좌표는 이 크기를 기준으로 그립니다.
  SCREEN: { W: 1920, H: 1080 },

  // 최저임금(시급). 매년 8월 고시값으로 갱신합니다.
  // 2026년 10,320원 / 2027년 10,700원 (최저임금위원회 결정)
  WAGE_TABLE: { 2026: 10320, 2027: 10700 },

  // 근로 조건: 대본의 {wage}·{netPay}·{start} 같은 치환에 씁니다(js/core/text.js).
  // 직업 마1스톤에서 가져온 값이라, 새 게임의 근로 조건을 정하면 바꿉니다.
  JOB: {
    start: '09:00',
    end: '13:30',
    breakTime: '11:00 ~ 11:30',
    breakMinutes: 30,
    hoursPerDay: 4,
    hoursPerWeek: 20,
    payday: '매달 10일',
  },

  // 월급 예시. 공제율은 '예시'이며 실제 보험료율과 다를 수 있습니다.
  PAYSLIP: { workDays: 20, weeklyHolidayHours: 16, exampleDeductionRate: 0.09 },

  // 설정 기본값 (프로필마다 따로 저장됩니다)
  DEFAULT_SETTINGS: {
    textSize: 'normal',   // normal | large | xlarge
    textSpeed: 'normal',  // slow | normal | fast | instant
    auto: 'off',          // off | slow | normal
    voice: 'auto',        // auto(자동 읽기) | button(버튼으로만) | off
    voiceRate: 'normal',  // slow | normal | fast
    volMaster: 0.8,
    volBgm: 0.35,
    volSfx: 0.6,
    theme: 'pop',         // pop(밝은 화면) | calm(차분 모드)
    contrast: false,      // 고대비
    motion: 'full',       // full | reduced
    selectMode: 'one',    // one(한 번 눌러 고르기) | two(두 번 눌러 고르기)
    help: 'some',         // many(도움 많이) | some(보통) | self(스스로)
    timer: 'normal',      // 급한 장면의 시간 제한 막대: normal(보통) | slow(넉넉히, 2배) | off(끄기). 자동 스캔을 켜면 꺼짐
    readCards: false,     // 키보드·스캔으로 카드에 초점이 가면 읽어 주기(기본은 소리 아이콘을 눌러야 읽음)
    scan: false,          // 스위치 자동 스캔
    scanSpeed: 1.8,       // 초
    tutorial: true,       // 처음 보는 버튼 알려 주기(무지개 테두리 + 손가락 + 쪽지)
    helpBar: false,       // 커피 만들기 손 기술의 띠(재미 개편 Q-38: 띠는 도움 표시. 숨기면 잔이 알맞을 때 반짝 + 소리)
    growHelp: true,       // 손맛(지은의 성장)이 오르면 알맞아요 칸이 조금씩 넓어짐(Q-41)
  },

  DEFAULT_TEACHER_PIN: '1234',
};

/** 오늘 날짜 기준 시급. 표에 없는 해는 가장 최근 값을 씁니다. */
export function currentWage(date = new Date()) {
  const y = date.getFullYear();
  const years = Object.keys(CONFIG.WAGE_TABLE).map(Number).sort((a, b) => a - b);
  let pick = years[0];
  for (const yr of years) if (yr <= y) pick = yr;
  if (y > years[years.length - 1]) pick = years[years.length - 1];
  return { year: pick, hourly: CONFIG.WAGE_TABLE[pick] };
}

export const isElectron = () => typeof window !== 'undefined' && Boolean(window.electronAPI);
