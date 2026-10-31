/**
 * 그림 카드용 픽토그램 (64x64, 선 아이콘, currentColor)
 * 원칙: 한 그림 = 한 행동/물건, 실제 물건 모양에 가깝게, 글자 라벨과 항상 함께 씁니다.
 * 상업 AAC 상징(예: ARASAAC는 비영리 조건)을 쓰지 않고 직접 그린 그림입니다.
 */

const W = (body, extra = '') => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;
const dot = (x, y, r = 2.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const mitten = (tf) => `<g transform="${tf}"><path d="M-8 18 V-8 Q-8 -16 0 -16 Q8 -16 8 -8 V18 Z"/><path d="M-8 4 L-14 -2 Q-16 -6 -12 -7 L-8 -4"/></g>`;
const num = (n) => `<text x="52" y="60" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor" stroke="none" font-family="Arial, sans-serif">${n}</text>`;

const RAW = {
  clock: `<circle cx="32" cy="32" r="24"/><path d="M32 18v15l10 6"/>`,
  alarm: `<circle cx="32" cy="35" r="20"/><path d="M32 24v12l7 4M12 14l8-6M52 14l-8-6M20 55l-4 5M44 55l4 5"/>`,
  calendar: `<rect x="10" y="14" width="44" height="40" rx="5"/><path d="M10 26h44M22 8v10M42 8v10"/>${dot(24, 38)}${dot(32, 38)}${dot(40, 38)}${dot(24, 46)}`,
  bus: `<rect x="12" y="8" width="40" height="42" rx="7"/><rect x="18" y="16" width="28" height="12" rx="2"/><path d="M12 32h40M18 50v6M46 50v6"/>${dot(21, 41, 3)}${dot(43, 41, 3)}`,
  card: `<rect x="8" y="16" width="48" height="32" rx="5"/><rect x="14" y="24" width="10" height="8" rx="1.5"/><path d="M40 28q4 4 0 8M45 24q8 8 0 16"/>`,
  bag: `<path d="M20 22q0-14 12-14t12 14"/><rect x="12" y="22" width="40" height="34" rx="8"/><path d="M20 36h24v10H20z"/>`,
  note: `<path d="M14 8h26l12 12v36H14z"/><path d="M40 8v12h12M22 30h20M22 38h20M22 46h12"/>`,
  memo: `<rect x="10" y="14" width="44" height="42" rx="2"/><path d="M24 8h16v10H24zM18 30h28M18 38h28M18 46h18"/>`,
  contract: `<path d="M14 6h28l10 10v42H14z"/><path d="M42 6v10h10M22 24h22M22 32h22M22 40h12M30 52q4-6 8-2t8 0"/>`,
  stamp: `<path d="M24 8h16v14l6 8H18l6-8z"/><rect x="12" y="34" width="40" height="10" rx="2"/><path d="M14 54h36"/>`,
  pen: `<path d="M44 8l12 12-30 30-14 2 2-14z"/><path d="M38 14l12 12"/>`,
  coin: `<circle cx="32" cy="32" r="24"/><path d="M21 22l5 20 6-14 6 14 5-20M19 31h26"/>`,
  piggy: `<path d="M12 34q0-18 22-18 13 0 19 10l5 1v10l-5 2q-3 6-9 9v6h-7v-4H26v4h-7v-7q-7-5-7-13z"/><path d="M28 20h8"/>${dot(44, 30)}`,
  gift: `<rect x="10" y="26" width="44" height="30" rx="3"/><path d="M8 18h48v8H8zM32 18v38M32 18q-6-12-14-4 2 4 14 4M32 18q6-12 14-4-2 4-14 4"/>`,
  heart: `<path d="M32 54S8 40 8 24q0-14 13-14 8 0 11 7 3-7 11-7 13 0 13 14c0 16-24 30-24 30z"/>`,
  star: `<path d="M32 6l7.6 16.4L58 24.6 44.6 37.2 48 56 32 46.8 16 56l3.4-18.8L6 24.6l18.4-2.2z"/>`,
  check: `<circle cx="32" cy="32" r="24"/><path d="M20 33l8 8 16-18"/>`,
  question: `<path d="M10 12h44v32H30l-12 10V44h-8z"/><path d="M26 22q0-6 6-6t6 6q0 5-6 7v3"/>${dot(32, 37, 2)}`,
  speech: `<path d="M10 12h44v32H30l-12 10V44h-8z"/><path d="M20 24h24M20 32h16"/>`,
  hand: `<path d="M20 36V18q0-4 4-4t4 4v12V12q0-4 4-4t4 4v18V16q0-4 4-4t4 4v24q0 16-16 16-8 0-13-7l-7-9q-2-4 2-5 2 0 4 2l4 4"/>`,
  stop: `<circle cx="32" cy="32" r="27"/><path d="M24 38V24q0-3 3-3t3 3v8V20q0-3 3-3t3 3v12-8q0-3 3-3t3 3v16q0 10-10 10-5 0-9-5l-5-6"/>`,
  ear: `<path d="M20 26q0-16 15-16t15 15q0 8-7 12-5 3-5 10 0 9-9 9-6 0-8-6"/><path d="M28 28q0-7 7-7t7 7"/>`,
  earplug: `<path d="M18 26q0-16 15-16t15 15q0 8-7 12-5 3-5 10 0 9-9 9-6 0-8-6"/><rect x="34" y="24" width="16" height="10" rx="5" fill="currentColor"/>`,
  breathe: `<path d="M8 22h30a7 7 0 1 0-7-7M8 34h42a7 7 0 1 1-7 7M8 46h22"/>`,
  team: `<circle cx="22" cy="20" r="8"/><circle cx="44" cy="22" r="7"/><path d="M8 54q0-18 14-18t14 18M34 54q0-15 10-15t12 15"/>`,
  greet: `<circle cx="40" cy="14" r="7"/><path d="M36 23q-8 6-12 17M24 40l-3 17M24 40l9 17M33 28l10 7"/>`,
  smile: `<circle cx="32" cy="32" r="24"/>${dot(24, 27)}${dot(40, 27)}<path d="M22 38q10 10 20 0"/>`,
  handwash: `<path d="M18 10h20q6 0 6 6v4M44 26v2"/><path d="M44 31q4 5 3 7a3 3 0 0 1-6 0q-1-2 3-7z"/><path d="M8 54q4-12 16-14l12 4q4 2 0 6l-8-1M56 54q-4-12-16-14"/><circle cx="18" cy="26" r="3"/><circle cx="12" cy="34" r="2"/>`,
  apron: `<path d="M22 8q0 10 10 10t10-10M16 22l6-14M48 22l-6-14"/><path d="M16 22h32v34H16z"/><path d="M24 36h16v10H24z"/>`,
  locker: `<rect x="14" y="6" width="36" height="52" rx="3"/><path d="M32 6v52M19 14h7M38 14h7M19 19h7M38 19h7"/>${dot(28, 34, 1.8)}${dot(36, 34, 1.8)}`,
  mirror: `<ellipse cx="32" cy="26" rx="16" ry="20"/><path d="M32 46v10M22 56h20M26 20l6-6M26 28l12-12"/>`,
  cup: `<path d="M16 16h32l-4 40H20z"/><path d="M14 16h36M18 30h28"/>`,
  icecup: `<path d="M18 22h28l-3 34H21z"/><path d="M16 22h32M20 22q0-10 12-10t12 10M38 4l-4 18"/><rect x="24" y="32" width="6" height="6" rx="1"/><rect x="33" y="40" width="6" height="6" rx="1"/>`,
  straw: `<path d="M20 58L28 8M32 58V6M44 58L36 8M18 40h28"/>`,
  lid: `<path d="M12 36h40l-4-10H16z"/><path d="M24 26q0-8 8-8t8 8M14 42h36"/>`,
  window: `<rect x="10" y="10" width="44" height="44" rx="3"/><path d="M32 10v44M10 32h44"/><path d="M38 20q4-3 8 0t8 0M16 42q4-3 8 0t8 0" stroke-width="3"/>`,
  sign_open: `<path d="M20 20l12-12 12 12"/><rect x="6" y="20" width="52" height="26" rx="4"/><text x="32" y="39" text-anchor="middle" font-size="15" font-weight="900" fill="currentColor" stroke="none" font-family="Arial, sans-serif">OPEN</text>`,
  tray: `<path d="M6 46h52l-4 8H10z"/><path d="M14 46V30h12v16M30 46q0-12 10-12t10 12M20 30v-6"/>`,
  ticket: `<path d="M14 6h36v50l-6-4-6 4-6-4-6 4-6-4-6 4z"/><path d="M22 18h20M22 26h20M22 34h12"/>`,
  order_check: `<path d="M8 6h30v46l-5-3-5 3-5-3-5 3-5-3-5 3z"/><path d="M14 16h18M14 24h18M14 32h10"/><path d="M40 32v-8q0-3 3-3t3 3v13l4-2q4-1 4 3l-6 10q-3 6-9 6h-2q-6 0-6-6v-8q0-3 3-3t3 3"/>`,
  menu: `<rect x="10" y="8" width="44" height="40" rx="3"/><path d="M18 18h28M18 26h20M18 34h24M22 48l-4 10M42 48l4 10"/>`,
  bread: `<path d="M10 40q0-20 22-20t22 20v6q0 6-6 6H16q-6 0-6-6z"/><path d="M22 28l-2 10M32 26v12M42 28l2 10"/>`,
  croissant: `<path d="M8 42q8-24 24-26 16 2 24 26-8-3-12 1-6-10-12-10t-12 10q-4-4-12-1z"/><path d="M26 22l2 8M38 22l-2 8"/>`,
  muffin: `<path d="M16 34h32l-4 22H20z"/><path d="M14 34q0-16 18-16t18 16M26 40v12M38 40v12"/>`,
  coffee: `<path d="M12 22h34v20q0 14-14 14h-6q-14 0-14-14z"/><path d="M46 28h4q6 0 6 6t-6 6h-4M22 6q-3 4 0 8t0 8M32 6q-3 4 0 8t0 8"/>`,
  tea: `<path d="M12 26h32v12q0 14-14 14h-4q-14 0-14-14z"/><path d="M44 30h4q6 0 6 6t-6 6h-4M8 58h44M22 8q-3 4 0 8t0 8M32 8q-3 4 0 8t0 8"/>`,
  milk: `<path d="M20 20l6-10h12l6 10v36H20z"/><path d="M20 20h24M26 34h12v10H26z"/>`,
  juice: `<path d="M18 20h26l-4 36H22z"/><path d="M36 6l-4 14"/><circle cx="46" cy="20" r="8"/><path d="M46 12v16M38 20h16" stroke-width="2"/>`,
  wheelchair: `<circle cx="28" cy="10" r="5" fill="currentColor" stroke="none"/><path d="M28 18v16h14l6 14M28 26h12"/><path d="M22 30a14 14 0 1 0 18 18"/>`,
  camera: `<rect x="8" y="18" width="48" height="34" rx="6"/><path d="M22 18l4-8h12l4 8"/><circle cx="32" cy="35" r="10"/>`,
  no_camera: `<rect x="8" y="18" width="48" height="34" rx="6"/><path d="M22 18l4-8h12l4 8"/><circle cx="32" cy="35" r="10"/><path d="M6 6l52 52" stroke-width="5"/>`,
  phone: `<rect x="18" y="6" width="28" height="52" rx="5"/><path d="M28 50h8"/>`,
  caution: `<path d="M32 6L10 56h44z"/><path d="M32 24v14"/>${dot(32, 46)}`,
  mop: `<path d="M40 6L26 40"/><path d="M18 40h16l6 14H12z"/><path d="M18 54l-2 5M26 54v5M34 54l2 5"/>`,
  trash: `<path d="M12 16h40M24 16v-6h16v6M16 16l4 40h24l4-40M26 26v22M38 26v22"/>`,
  chair: `<path d="M20 8v28h24V8M20 36v20M44 36v20M20 26h24M20 46h24"/>`,
  light: `<path d="M24 40q-8-6-8-16a16 16 0 0 1 32 0q0 10-8 16v6H24z"/><path d="M26 54h12"/>`,
  light_off: `<path d="M24 40q-8-6-8-16a16 16 0 0 1 32 0q0 10-8 16v6H24z"/><path d="M26 54h12M8 8l48 48"/>`,
  cloth: `<path d="M10 20l20-8 24 10-6 28-22 6-14-10z"/><path d="M18 30l20-6M20 40l20-6"/>`,
  ice: `<rect x="8" y="10" width="48" height="44" rx="4"/><path d="M8 24h48"/><rect x="16" y="32" width="10" height="10" rx="2"/><rect x="30" y="36" width="10" height="10" rx="2"/>${dot(46, 17)}`,
  mixer: `<path d="M12 56h36M20 56V32h20v24M16 32h28l-4-10H20zM40 14h8v42"/>`,
  door: `<rect x="16" y="6" width="32" height="50" rx="2"/><path d="M8 58h48"/>${dot(40, 32)}`,
  run: `<circle cx="42" cy="10" r="6"/><path d="M38 18l-8 16 10 6-4 16M30 34l-12 4M36 22l12 8 6-4"/>`,
  walk: `<circle cx="34" cy="10" r="6"/><path d="M32 18l-4 18 8 8v14M28 36l-8 20M30 24l-10 8M30 24l12 6"/>`,
  freeze: `<circle cx="32" cy="32" r="24"/><path d="M20 30q4 4 8 0M36 30q4 4 8 0M24 44h16"/><path d="M50 10q-5 6 0 9 5-3 0-9z" stroke-width="3"/>`,
  shout: `<circle cx="32" cy="32" r="24"/><path d="M18 22l10 4M46 22l-10 4"/><ellipse cx="32" cy="42" rx="7" ry="5" fill="currentColor"/>`,
  bell_call: `<path d="M10 46h44M14 46q0-18 18-18t18 18M32 22v6M26 22h12M8 54h48"/>`,
  step_back: `<circle cx="42" cy="12" r="6"/><path d="M42 20v18l6 18M42 38l-6 18M42 26l-10 6M24 44H6M12 38l-6 6 6 6"/>`,
  shield: `<path d="M32 6l20 8v16q0 18-20 26-20-8-20-26V14z"/><path d="M24 32l6 6 12-12"/>`,
  watch: `<circle cx="32" cy="36" r="20"/><path d="M32 16V8M26 8h12M32 26v10l7 5"/>`,
  rewind: `<path d="M32 12a22 22 0 1 1-19 11"/><path d="M8 12l5 11 11-5"/><path d="M32 24v12l8 5"/>`,
  badge: `<circle cx="32" cy="26" r="16"/><path d="M24 40l-6 18 14-6 14 6-6-18"/><path d="M32 17l2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor" stroke-width="1"/>`,
  photo: `<rect x="12" y="8" width="40" height="48" rx="2"/><rect x="18" y="14" width="28" height="28"/><path d="M18 36l8-8 6 6 4-4 10 10"/>`,
  home: `<path d="M8 30L32 8l24 22M14 26v30h36V26M26 56V40h12v16"/>`,
  school: `<path d="M8 22L32 10l24 12-24 12z"/><path d="M16 26v14q0 8 16 8t16-8V26M56 22v16"/>`,
  resume: `<path d="M14 6h36v52H14z"/><circle cx="32" cy="20" r="6"/><path d="M22 34q4-6 10-6t10 6M22 42h20M22 50h14"/>`,
  idcard: `<rect x="8" y="14" width="48" height="36" rx="4"/><circle cx="22" cy="28" r="6"/><path d="M14 44q2-6 8-6t8 6M36 26h14M36 34h14"/>`,
  tissue: `<path d="M12 18l20-8 20 8-4 34H16z"/><path d="M24 30q8 6 16 0"/>`,
  sparkle: `<path d="M30 6l5 15 15 5-15 5-5 15-5-15-15-5 15-5z"/><path d="M50 42l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>`,
  think: `<path d="M16 34q-8-1-3-10-1-10 13-7 5-7 15-2 12-1 11 10 6 9-4 13-3 5-12 3-6 4-14-1-3 0-6-6z"/><circle cx="14" cy="48" r="4"/><circle cx="8" cy="56" r="2.5"/>`,
  hourglass: `<path d="M18 6h28M18 58h28M20 6q0 14 12 20 12 6 12 6t-12 6q-12 6-12 20M44 6q0 14-12 20M44 58q0-14-12-20"/>`,
  repeat: `<path d="M48 22H18l8-8M16 42h30l-8 8"/>`,
  mic: `<rect x="24" y="6" width="16" height="30" rx="8"/><path d="M14 30q0 18 18 18t18-18M32 48v10M24 58h16"/>`,
  keyboard: `<rect x="6" y="18" width="52" height="30" rx="4"/><path d="M14 27h4M24 27h4M34 27h4M44 27h4M14 35h4M24 35h4M34 35h4M44 35h4M20 42h24"/>`,
  chips: `<rect x="8" y="10" width="48" height="12" rx="6"/><rect x="8" y="26" width="48" height="12" rx="6"/><rect x="8" y="42" width="48" height="12" rx="6"/>`,
  volume: `<path d="M8 24h10l14-12v40L18 40H8z"/><path d="M42 22q6 10 0 20M48 16q12 16 0 32"/>`,
  book: `<path d="M8 12q12-3 24 4 12-7 24-4v40q-12-3-24 4-12-7-24-4z"/><path d="M32 16v40"/>`,
  settings: `<circle cx="32" cy="32" r="9"/><circle cx="32" cy="32" r="18"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/>`,
  pause: `<rect x="16" y="12" width="10" height="40" rx="2"/><rect x="38" y="12" width="10" height="40" rx="2"/>`,
  teacher: `<path d="M32 18q-8-6-22 0-4 14 4 28 6 10 12 10 4 0 6-2 2 2 6 2 6 0 12-10 8-14 4-28-14-6-22 0z"/><path d="M32 18q0-8 8-12"/>`,
  lock: `<rect x="14" y="28" width="36" height="28" rx="4"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/>${dot(32, 42, 3)}`,
  arrow_right: `<path d="M10 32h40M36 18l14 14-14 14"/>`,
  close: `<path d="M16 16l32 32M48 16L16 48"/>`,
  play: `<path d="M20 12l28 20-28 20z"/>`,
  knock: `<rect x="34" y="6" width="22" height="52" rx="2"/><path d="M8 30h14a6 6 0 0 1 0 12H12a4 4 0 0 1-4-4zM27 20l4-4M27 30h4M27 42l4 4"/>`,
  highfive: `<path d="M18 38V18q0-4 4-4t4 4v12V10q0-4 4-4t4 4v20V14q0-4 4-4t4 4v22q0 18-16 18-6 0-11-6l-7-9"/><path d="M50 12l5-5M52 22h7"/>`,
  germ: `<circle cx="32" cy="32" r="14"/><path d="M32 10v6M32 48v6M10 32h6M48 32h6M16 16l5 5M43 43l5 5M16 48l5-5M43 21l5-5"/>${dot(27, 30, 2)}${dot(37, 30, 2)}<path d="M27 38q5 3 10 0"/>`,
  checklist: `<rect x="12" y="8" width="40" height="50" rx="4"/><path d="M24 8V4h16v4M19 22l4 4 6-8M33 22h12M19 36l4 4 6-8M33 36h12M19 50h4M33 50h12"/>`,
  water: `<path d="M32 8q14 18 14 28a14 14 0 0 1-28 0q0-10 14-28z"/>`,
  towel: `<rect x="14" y="8" width="36" height="12" rx="3"/><path d="M18 20v34l7-4 7 4 7-4 7 4V20"/>`,
  rinse: `<path d="M18 10h20q6 0 6 6v4"/><path d="M44 26v4M40 34v4M48 34v4M44 42v4"/><path d="M12 56q8-10 20-10t20 10"/>`,
  // 손 씻기 6단계 (질병관리청 올바른 손 씻기 6단계)
  hw1: `${mitten('translate(24 32)')}${mitten('translate(40 32) scale(-1 1)')}<path d="M32 8v6M28 11h8" stroke-width="3"/>${num(1)}`,
  hw2: `${mitten('translate(30 34) rotate(-10)')}<g opacity=".55">${mitten('translate(36 30) rotate(10) scale(-1 1)')}</g><path d="M50 14l4 6-4 6" stroke-width="3"/>${num(2)}`,
  hw3: `${mitten('translate(26 32)')}${mitten('translate(38 32) scale(-1 1)')}<path d="M20 22l24 6M20 30l24 6M20 38l24 6" stroke-width="2.5"/>${num(3)}`,
  hw4: `<path d="M12 28q0-8 10-8h10q4 0 4 4t-4 4H22M52 36q0 8-10 8H32q-4 0-4-4t4-4h10"/><path d="M22 20v-6M42 44v6" stroke-width="3"/>${num(4)}`,
  hw5: `${mitten('translate(30 34)')}<path d="M14 26q-6 6 0 12t12 0" stroke-width="3"/><path d="M26 38l1-6-6 1" stroke-width="3"/>${num(5)}`,
  hw6: `<path d="M12 48q4-24 22-24t18 10"/>${dot(26, 34, 3)}${dot(32, 30, 3)}${dot(38, 30, 3)}<path d="M20 22q12-14 24 0" stroke-width="3"/><path d="M44 22l1-6-6 1" stroke-width="3"/>${num(6)}`,
  // 기분
  f_happy: `<circle cx="32" cy="32" r="26"/><path d="M19 27q4-5 8 0M37 27q4-5 8 0"/><path d="M19 38q13 14 26 0z" fill="currentColor"/>`,
  f_proud: `<circle cx="32" cy="34" r="24"/><path d="M20 32q4 4 8 0M36 32q4 4 8 0M22 42q10 8 20 0"/><path d="M50 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor" stroke-width="1"/>`,
  f_okay: `<circle cx="32" cy="32" r="26"/>${dot(23, 28, 3)}${dot(41, 28, 3)}<path d="M22 42h20"/>`,
  f_worried: `<circle cx="32" cy="32" r="26"/><path d="M18 24l10-4M46 24l-10-4"/>${dot(24, 31, 3)}${dot(40, 31, 3)}<path d="M22 44q5-4 10 0t10 0"/>`,
  f_tired: `<circle cx="32" cy="32" r="26"/><path d="M19 30h10M35 30h10M25 44q7-5 14 0"/><path d="M48 8h8l-8 8h8" stroke-width="3"/>`,
  // 기록 파일: 종이 + 상자(아래로 넣기 = 저장 · 위로 꺼내기 = 불러오기)
  file_save: `<path d="M18 32V6h20l10 10v16M38 6v10h10"/><path d="M33 18v24M24 33l9 9 9-9"/><path d="M10 44v12h46V44"/>`,
  file_load: `<path d="M18 32V6h20l10 10v16M38 6v10h10"/><path d="M33 42V18M24 27l9-9 9 9"/><path d="M10 44v12h46V44"/>`,
};

const ALIAS = { uniform: 'apron', earplugs: 'earplug', calm: 'breathe', report: 'speech', ask: 'question', help: 'hand', safety: 'caution', rights: 'contract', serve: 'greet', clean: 'mop', prepare: 'checklist', hygiene: 'handwash', time: 'clock', refuse: 'stop', saltbread: 'bread', americano: 'coffee', latte: 'coffee' };

export function ICON(name) {
  const key = RAW[name] ? name : ALIAS[name];
  return W(RAW[key] || RAW.star);
}

export function hasIcon(name) {
  return Boolean(RAW[name] || ALIAS[name]);
}

export const ICON_NAMES = Object.keys(RAW);
