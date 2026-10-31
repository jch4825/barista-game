/**
 * 장면 배경 (SVG, 1920x1080). 최종 일러스트가 들어오기 전까지 쓰는 '평면 그래픽' 배경입니다.
 * 최종 이미지가 생기면 assets/bg/{id}_{variant}.jpg 를 넣고 npm run assets 를 실행하면 이미지가 우선 쓰입니다(docs/image_requests.md B).
 */

import { img } from '../core/assets.js';

let seq = 0;
const svg = (body, defs = '') => `<svg class="bg-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const lin = (id, a, b, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rad = (id, c, o = 0.9) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

const SKY = {
  morning: ['#BFE3FF', '#FFF1D2'],
  day: ['#9ED0FF', '#E8F5FF'],
  evening: ['#6B5B95', '#FFB38A'],
  night: ['#141A33', '#33407A'],
};

const TINT = {
  morning: 'rgba(255,235,190,.10)',
  day: 'rgba(0,0,0,0)',
  peak: 'rgba(227,38,46,.10)',
  evening: 'rgba(255,140,70,.16)',
  closing: 'rgba(60,35,15,.22)',
  night: 'rgba(15,20,55,.38)',
  memory: 'rgba(120,90,40,.25)',
};

function windowGrid(x, y, w, h, cols, rows, color, lit = 0.35) {
  let out = '';
  const cw = w / cols;
  const rh = h / rows;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const on = Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233) * 43758.5453 % 1;
      const fill = Math.abs(on) < lit ? '#FFE7A8' : color;
      out += `<rect x="${x + c * cw + cw * 0.2}" y="${y + r * rh + rh * 0.2}" width="${cw * 0.6}" height="${rh * 0.55}" fill="${fill}"/>`;
    }
  }
  return out;
}

/* ---------------- 연우의 방 ---------------- */
function home(variant = 'night') {
  const n = ++seq;
  const night = variant === 'night';
  const [s1, s2] = SKY[night ? 'night' : 'morning'];
  const defs = lin(`hs${n}`, s1, s2) + rad(`lamp${n}`, '#FFD98A', 0.75);
  const body = `
  <rect width="1920" height="1080" fill="${night ? '#3B3550' : '#F4E6EC'}"/>
  <rect y="780" width="1920" height="300" fill="${night ? '#4A3A33' : '#C99A6B'}"/>
  <path d="M0 780h1920" stroke="${night ? '#2C2330' : '#A87B52'}" stroke-width="8"/>
  <rect x="150" y="130" width="500" height="440" rx="10" fill="url(#hs${n})" stroke="#F7F3EA" stroke-width="22"/>
  <path d="M400 130v440M150 350h500" stroke="#F7F3EA" stroke-width="14"/>
  ${night ? '<circle cx="540" cy="220" r="44" fill="#FFF6D6"/><circle cx="560" cy="206" r="40" fill="#22294D"/><circle cx="250" cy="200" r="4" fill="#fff"/><circle cx="320" cy="260" r="3" fill="#fff"/><circle cx="470" cy="300" r="3" fill="#fff"/>' : '<circle cx="520" cy="240" r="60" fill="#FFE07A" opacity=".9"/>'}
  <path d="M110 110h580v40H110z" fill="#E7C24A"/>
  <path d="M110 150q50 220 0 450h70q-30-230 0-450z" fill="#FFD95A" opacity=".95"/>
  <path d="M690 150q-50 220 0 450h-70q30-230 0-450z" fill="#FFD95A" opacity=".95"/>
  <rect x="1130" y="150" width="560" height="360" rx="12" fill="#C79A63" stroke="#8A6239" stroke-width="12"/>
  <text x="1410" y="205" text-anchor="middle" font-size="34" font-weight="900" fill="#3A2A1C" font-family="sans-serif">내일 할 일</text>
  ${[['07:00', '알람 끄기'], ['08:20', '해솔07 버스'], ['08:50', '카페 도착']].map(([t, l], i) => `<g transform="translate(${1160 + i * 175} 235)"><rect width="155" height="240" rx="8" fill="#FFFBEF" stroke="#3A2A1C" stroke-width="4"/><circle cx="77" cy="70" r="40" fill="${['#FFD43B', '#7FC8F8', '#E3262E'][i]}" opacity=".85"/><text x="77" y="82" text-anchor="middle" font-size="30" font-weight="900" fill="#1D1A22" font-family="sans-serif">${i + 1}</text><text x="77" y="160" text-anchor="middle" font-size="30" font-weight="800" fill="#1D1A22" font-family="sans-serif">${t}</text><text x="77" y="202" text-anchor="middle" font-size="24" font-weight="700" fill="#3A2A1C" font-family="sans-serif">${l}</text></g>`).join('')}
  <rect x="1060" y="600" width="740" height="40" rx="8" fill="#8A5A35"/>
  <rect x="1090" y="640" width="30" height="160" fill="#6E4628"/><rect x="1740" y="640" width="30" height="160" fill="#6E4628"/>
  <path d="M1180 600l40-150h70l40 150z" fill="${night ? '#FFE9A8' : '#F2EBDD'}" stroke="#3A2A1C" stroke-width="6"/>
  <rect x="1240" y="560" width="30" height="40" fill="#3A2A1C"/>
  ${night ? `<circle cx="1255" cy="520" r="260" fill="url(#lamp${n})"/>` : ''}
  <rect x="1480" y="540" width="120" height="60" rx="14" fill="#E3262E" stroke="#3A2A1C" stroke-width="6"/>
  <circle cx="1650" cy="566" r="30" fill="#FFFBEF" stroke="#3A2A1C" stroke-width="6"/><path d="M1650 548v18l12 8" stroke="#3A2A1C" stroke-width="5" fill="none"/>
  <path d="M800 190h200" stroke="#7A6A5A" stroke-width="8"/><path d="M900 190v30" stroke="#7A6A5A" stroke-width="6"/>
  <path d="M820 260l80-40 80 40v270H820z" fill="#FFFFFF" stroke="#3A2A1C" stroke-width="6"/>
  <path d="M860 250l40 40 40-40" fill="none" stroke="#3A2A1C" stroke-width="5"/>
  <path d="M0 860q300-90 640 0v220H0z" fill="${night ? '#5C5A8A' : '#A9C7E8'}"/>
  <path d="M0 900q300-60 640 0" stroke="#fff" stroke-width="10" fill="none" opacity=".5"/>`;
  return svg(body, defs);
}

/* ---------------- 거실(저녁) ---------------- */
function living() {
  const n = ++seq;
  const defs = lin(`ls${n}`, SKY.evening[0], SKY.evening[1]) + rad(`ll${n}`, '#FFD98A', 0.7);
  return svg(`
  <rect width="1920" height="1080" fill="#EBD9C4"/>
  <rect y="760" width="1920" height="320" fill="#B88A60"/>
  <rect x="1250" y="140" width="520" height="420" rx="10" fill="url(#ls${n})" stroke="#FBF5EA" stroke-width="22"/>
  <path d="M1510 140v420" stroke="#FBF5EA" stroke-width="14"/>
  <circle cx="1400" cy="430" r="70" fill="#FF9E6B" opacity=".8"/>
  <rect x="200" y="160" width="300" height="220" rx="8" fill="#F7EFE2" stroke="#7A5A40" stroke-width="10"/>
  <rect x="230" y="190" width="240" height="160" fill="#BFD7C8"/><circle cx="300" cy="270" r="40" fill="#8EBF9F"/>
  <path d="M700 0v170" stroke="#5A4636" stroke-width="6"/><path d="M620 170h160l-30 70H650z" fill="#FFD27A" stroke="#5A4636" stroke-width="6"/>
  <circle cx="700" cy="320" r="320" fill="url(#ll${n})"/>
  <ellipse cx="760" cy="700" rx="560" ry="70" fill="#8A5A35"/>
  <rect x="300" y="690" width="920" height="40" rx="10" fill="#9B6A40"/>
  <rect x="360" y="730" width="34" height="250" fill="#6E4628"/><rect x="1120" y="730" width="34" height="250" fill="#6E4628"/>
  <rect x="640" y="600" width="70" height="90" rx="10" fill="#7FB3D5" stroke="#3A2A1C" stroke-width="5"/>
  <path d="M675 600q-30-60 0-90 30 30 0 90" fill="#E3262E" opacity=".85"/>`, defs);
}

/* ---------------- 버스 정류장 ---------------- */
function busStop(variant = 'morning') {
  const n = ++seq;
  const [s1, s2] = SKY[variant] || SKY.morning;
  const defs = lin(`bs${n}`, s1, s2) + `<pattern id="tp${n}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#FFD43B"/><circle cx="12" cy="12" r="5" fill="#E8B800"/></pattern>`;
  const tree = (x, s = 1) => `<rect x="${x - 10}" y="${560 - 40 * s}" width="20" height="${120 * s}" fill="#6B4A2E"/><circle cx="${x}" cy="${470 - 30 * s}" r="${90 * s}" fill="#F2C230"/><circle cx="${x - 60 * s}" cy="${510 - 30 * s}" r="${60 * s}" fill="#E8B21E"/><circle cx="${x + 60 * s}" cy="${505 - 30 * s}" r="${64 * s}" fill="#F7CF45"/>`;
  return svg(`
  <rect width="1920" height="700" fill="url(#bs${n})"/>
  <g fill="#9FB6CC">
    <rect x="40" y="250" width="200" height="400"/><rect x="260" y="180" width="160" height="470"/><rect x="1500" y="210" width="190" height="440"/><rect x="1710" y="290" width="180" height="360"/>
  </g>
  <g>${windowGrid(40, 270, 200, 360, 4, 8, '#C9D8E6', 0.15)}${windowGrid(260, 200, 160, 430, 3, 9, '#C9D8E6', 0.15)}${windowGrid(1500, 230, 190, 400, 4, 8, '#C9D8E6', 0.15)}</g>
  ${tree(560, 1)}${tree(1360, 0.9)}
  <rect y="620" width="1920" height="200" fill="#5B5F66"/>
  <path d="M0 720h1920" stroke="#F4F4F4" stroke-width="8" stroke-dasharray="60 40"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${1560 + i * 56}" y="630" width="34" height="180" fill="#EDEDED"/>`).join('')}
  <rect y="820" width="1920" height="260" fill="#CFCAC2"/>
  <rect y="880" width="1920" height="36" fill="url(#tp${n})"/>
  <path d="M0 820h1920" stroke="#9C968C" stroke-width="10"/>
  <rect x="300" y="300" width="820" height="34" rx="6" fill="#2E5E4E"/>
  <rect x="320" y="334" width="16" height="490" fill="#3E4A4A"/><rect x="1084" y="334" width="16" height="490" fill="#3E4A4A"/>
  <rect x="340" y="420" width="740" height="330" fill="rgba(200,230,255,.38)" stroke="#E3EEF5" stroke-width="6"/>
  <rect x="420" y="640" width="560" height="26" rx="6" fill="#8A5A35"/><rect x="450" y="666" width="16" height="90" fill="#5B3D24"/><rect x="934" y="666" width="16" height="90" fill="#5B3D24"/>
  <rect x="640" y="340" width="400" height="80" rx="8" fill="#16161A" stroke="#3E4A4A" stroke-width="6"/>
  <text x="664" y="374" font-size="28" font-weight="800" fill="#FFB238" font-family="monospace">해솔07  3분 후</text>
  <text x="664" y="408" font-size="28" font-weight="800" fill="#FFB238" font-family="monospace">해솔17  곧 도착</text>
  <rect x="1240" y="380" width="14" height="440" fill="#3E4A4A"/>
  <rect x="1180" y="380" width="134" height="90" rx="10" fill="#2E7D5B" stroke="#fff" stroke-width="5"/>
  <text x="1247" y="418" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" font-family="sans-serif">해솔시장 앞</text>
  <text x="1247" y="452" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="sans-serif">07 · 17</text>`, defs);
}

/* ---------------- 카페 외관 ---------------- */
function cafeFront(variant = 'morning') {
  const n = ++seq;
  const [s1, s2] = SKY[variant] || SKY.morning;
  const evening = variant === 'evening';
  const defs = lin(`fs${n}`, s1, s2) + lin(`win${n}`, '#FFE2A8', '#FFB45E')
    + `<pattern id="br${n}" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#3B2F2F"/><path d="M0 0h80M0 20h80M40 0v20M0 20v20M80 20v20" stroke="#2A2121" stroke-width="3"/></pattern>`;
  const scallop = Array.from({ length: 22 }, (_, i) => `<path d="M${300 + i * 60} 360q30 40 60 0" fill="#B5121B"/>`).join('');
  const breads = (x0) => [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${x0 + 60 + i * 100}" cy="660" rx="38" ry="22" fill="#C98A3D" stroke="#7A4E21" stroke-width="4"/>`).join('');
  return svg(`
  <rect width="1920" height="1080" fill="url(#fs${n})"/>
  <rect x="200" y="120" width="1520" height="720" fill="url(#br${n})"/>
  <rect x="560" y="150" width="800" height="110" rx="12" fill="#17141C" stroke="#D9B44A" stroke-width="6"/>
  <text x="960" y="225" text-anchor="middle" font-size="64" font-weight="900" fill="#F2D06B" font-family="sans-serif" letter-spacing="6">CAFE MILESTONE</text>
  <g transform="translate(600 175)"><rect x="0" y="0" width="10" height="64" fill="#F2D06B"/><path d="M10 6h44l12 12-12 12H10z" fill="#E3262E"/></g>
  <rect x="290" y="300" width="1340" height="60" fill="#E3262E"/>
  ${scallop}
  <rect x="330" y="400" width="560" height="380" rx="6" fill="url(#win${n})" stroke="#17141C" stroke-width="12"/>
  <rect x="1030" y="400" width="560" height="380" rx="6" fill="url(#win${n})" stroke="#17141C" stroke-width="12"/>
  <rect x="350" y="640" width="520" height="16" fill="#7A4E21"/><rect x="1050" y="640" width="520" height="16" fill="#7A4E21"/>
  ${breads(350)}${breads(1050)}
  <rect x="900" y="420" width="120" height="420" fill="#17141C"/>
  <rect x="914" y="436" width="92" height="260" fill="${evening ? '#FFD68A' : '#FFE9C4'}" opacity=".85"/>
  <rect x="922" y="560" width="76" height="40" rx="6" fill="#fff" stroke="#E3262E" stroke-width="4"/>
  <text x="960" y="588" text-anchor="middle" font-size="22" font-weight="900" fill="#E3262E" font-family="sans-serif">OPEN</text>
  <rect y="840" width="1920" height="240" fill="#CFC8BD"/>
  <path d="M0 840h1920M0 960h1920" stroke="#B3AA9C" stroke-width="6"/>
  <g transform="translate(1660 720)"><path d="M0 120L50 0h60l50 120" fill="#2E2A33" stroke="#17141C" stroke-width="6"/><rect x="30" y="20" width="100" height="70" fill="#2F3B34"/><text x="80" y="50" text-anchor="middle" font-size="20" fill="#fff" font-weight="800" font-family="sans-serif">오늘의 빵</text><text x="80" y="78" text-anchor="middle" font-size="22" fill="#FFD43B" font-weight="900" font-family="sans-serif">소금빵</text></g>
  <g><rect x="220" y="760" width="90" height="80" rx="8" fill="#8A5A35"/><circle cx="265" cy="730" r="56" fill="#5AA35A"/><circle cx="240" cy="710" r="30" fill="#6CBF6C"/></g>
  ${evening ? `<rect width="1920" height="1080" fill="${TINT.evening}"/>` : ''}`, defs);
}

/* ---------------- 홀 & 카운터 ---------------- */
function counter(variant = 'day') {
  const n = ++seq;
  const defs = rad(`pl${n}`, '#FFDFA0', 0.85) + lin(`ct${n}`, '#9B6A40', '#6E4628') + lin(`sk${n}`, '#CDE9FF', '#FFF5DC');
  const crowd = variant === 'peak'
    ? Array.from({ length: 9 }, (_, i) => {
      const x = 120 + i * 210 + (i % 2) * 40;
      const y = 780 + (i % 3) * 30;
      return `<g fill="rgba(30,24,36,.88)"><circle cx="${x}" cy="${y - 120}" r="56"/><path d="M${x - 110} ${y + 140}q0-200 110-200t110 200z"/></g>`;
    }).join('')
    : '';
  const lampGlow = variant === 'closing' || variant === 'peak' ? 1 : 0.7;
  return svg(`
  <rect width="1920" height="1080" fill="#F3E3CC"/>
  <rect y="520" width="1920" height="560" fill="#8A5A35"/>
  <rect x="1360" y="110" width="440" height="380" rx="10" fill="url(#sk${n})" stroke="#FFFBF2" stroke-width="18"/>
  <path d="M1580 110v380" stroke="#FFFBF2" stroke-width="12"/>
  <rect x="620" y="80" width="660" height="330" rx="10" fill="#2B2B2B" stroke="#7A4E2C" stroke-width="18"/>
  <text x="950" y="140" text-anchor="middle" font-size="44" font-weight="900" fill="#FFFBF2" font-family="sans-serif" letter-spacing="8">MENU</text>
  ${[['아메리카노', '3,000'], ['카페라테', '3,500'], ['바닐라라테', '4,000'], ['소금빵', '2,800'], ['크루아상', '3,200']].map(([a, b], i) => `<text x="680" y="${195 + i * 44}" font-size="30" font-weight="700" fill="#F4F0E6" font-family="sans-serif">${a}</text><text x="1220" y="${195 + i * 44}" text-anchor="end" font-size="30" font-weight="700" fill="#FFD43B" font-family="sans-serif">${b}</text>`).join('')}
  <rect x="100" y="170" width="440" height="20" fill="#7A4E2C"/><rect x="100" y="300" width="440" height="20" fill="#7A4E2C"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${130 + i * 70} 170l8-50h36l8 50z" fill="${i % 2 ? '#FFFFFF' : '#E3262E'}" stroke="#3A2A1C" stroke-width="4"/>`).join('')}
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${140 + i * 80}" y="230" width="56" height="70" rx="6" fill="rgba(200,230,255,.8)" stroke="#3A2A1C" stroke-width="4"/>`).join('')}
  ${[420, 960, 1500].map((x) => `<path d="M${x} 0v70" stroke="#3A2A1C" stroke-width="5"/><path d="M${x - 50} 70h100l-20 40h-60z" fill="#E3262E" stroke="#3A2A1C" stroke-width="5"/><circle cx="${x}" cy="150" r="190" fill="url(#pl${n})" opacity="${lampGlow}"/>`).join('')}
  <rect x="1250" y="420" width="300" height="200" rx="16" fill="#C9CED6" stroke="#3A2A1C" stroke-width="7"/>
  <rect x="1280" y="450" width="240" height="60" rx="8" fill="#E3262E"/>
  <path d="M1320 520v40M1400 520v40M1480 520v40" stroke="#3A2A1C" stroke-width="10"/>
  <rect x="1580" y="470" width="110" height="150" rx="10" fill="#F2F2F2" stroke="#3A2A1C" stroke-width="6"/>
  <text x="1635" y="555" text-anchor="middle" font-size="22" font-weight="900" fill="#3A2A1C" font-family="sans-serif">ICE</text>
  <rect y="600" width="1920" height="40" fill="#5B3A22"/>
  <rect y="640" width="1920" height="440" fill="url(#ct${n})"/>
  <rect x="260" y="540" width="720" height="150" rx="10" fill="rgba(220,240,255,.55)" stroke="#3A2A1C" stroke-width="7"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${330 + i * 110}" cy="640" rx="40" ry="24" fill="${i % 3 === 0 ? '#C98A3D' : i % 3 === 1 ? '#E0A24E' : '#7A4A2B'}" stroke="#5B3A22" stroke-width="4"/>`).join('')}
  <rect x="1050" y="560" width="150" height="90" rx="8" fill="#2B2B33" stroke="#17141C" stroke-width="6"/><rect x="1068" y="574" width="114" height="50" rx="4" fill="#7FC8F8"/>
  ${crowd}
  <rect width="1920" height="1080" fill="${TINT[variant] || 'transparent'}"/>`, defs);
}

/* ---------------- 점장실 ---------------- */
function office() {
  const n = ++seq;
  const defs = lin(`os${n}`, '#CDE9FF', '#FFF2D8');
  const blinds = Array.from({ length: 12 }, (_, i) => `<rect x="140" y="${140 + i * 36}" width="440" height="18" fill="#EFE6D6"/>`).join('');
  const beams = [0, 1, 2, 3, 4].map((i) => `<path d="M600 ${180 + i * 70}L1200 ${380 + i * 90}L1200 ${410 + i * 90}L600 ${198 + i * 70}z" fill="rgba(255,240,200,.28)"/>`).join('');
  return svg(`
  <rect width="1920" height="1080" fill="#E7DCCB"/>
  <rect y="720" width="1920" height="360" fill="#6B4A33"/>
  <rect x="140" y="140" width="440" height="430" fill="url(#os${n})" stroke="#5B4636" stroke-width="16"/>
  ${blinds}${beams}
  <rect x="700" y="170" width="140" height="180" fill="#FFFBF2" stroke="#8A6A4A" stroke-width="10"/><rect x="870" y="190" width="160" height="120" fill="#FFFBF2" stroke="#8A6A4A" stroke-width="10"/>
  <path d="M725 220h90M725 250h90M725 280h60M895 230h110M895 260h80" stroke="#B9A88F" stroke-width="6"/>
  <circle cx="1100" cy="220" r="56" fill="#FFFBF2" stroke="#3A2A1C" stroke-width="8"/><path d="M1100 186v34l22 14" stroke="#3A2A1C" stroke-width="7" fill="none"/>
  <rect x="1300" y="140" width="500" height="22" fill="#7A4E2C"/><rect x="1300" y="330" width="500" height="22" fill="#7A4E2C"/><rect x="1300" y="520" width="500" height="22" fill="#7A4E2C"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${1320 + i * 46}" y="${170 + (i % 2) * 6}" width="38" height="${154 - (i % 2) * 6}" fill="${['#E3262E', '#2F3A55', '#FFD43B', '#5AA35A', '#8C7AE6'][i % 5]}" stroke="#3A2A1C" stroke-width="3"/>`).join('')}
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${1330 + i * 56}" y="${360 + (i % 3) * 8}" width="44" height="${154 - (i % 3) * 8}" fill="${['#B9A88F', '#3E4B4F', '#D9B44A'][i % 3]}" stroke="#3A2A1C" stroke-width="3"/>`).join('')}
  <g fill="#C7A574" stroke="#7A5A3A" stroke-width="5"><path d="M1540 720q-10-120 50-130 70 0 70 130z"/><path d="M1640 720q-10-100 50-110 60 0 60 110z"/></g>
  <rect y="760" width="1920" height="320" fill="#4A3122"/>
  <rect x="160" y="700" width="1600" height="70" rx="12" fill="#5B3A22"/>
  <rect x="420" y="660" width="300" height="50" fill="#FFFBF2" stroke="#B9A88F" stroke-width="4" transform="rotate(-4 570 685)"/>
  <circle cx="1300" cy="690" r="26" fill="#D9B44A" stroke="#7A5A1A" stroke-width="5"/>`, defs);
}

/* ---------------- 직원 공간 ---------------- */
function staff() {
  const n = ++seq;
  const defs = `<pattern id="tl${n}" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#E1F1EC"/><path d="M0 0h80v80" stroke="#C6E0D8" stroke-width="4" fill="none"/></pattern>`;
  const lockers = [0, 1, 2, 3].map((i) => `<rect x="${90 + i * 130}" y="170" width="120" height="640" rx="6" fill="#7E97AE" stroke="#3E4A56" stroke-width="6"/><path d="M${110 + i * 130} 210h80M${110 + i * 130} 224h80M${110 + i * 130} 238h80" stroke="#5D7387" stroke-width="5"/><circle cx="${190 + i * 130}" cy="480" r="7" fill="#3E4A56"/><text x="${150 + i * 130}" y="320" text-anchor="middle" font-size="34" font-weight="900" fill="#F4F7FA" font-family="sans-serif">${i + 1}</text>`).join('');
  const poster = [1, 2, 3, 4, 5, 6].map((k, i) => `<g transform="translate(${1010 + (i % 3) * 120} ${190 + Math.floor(i / 3) * 140})"><rect width="108" height="128" rx="8" fill="#FFFFFF" stroke="#2EAFC8" stroke-width="5"/><text x="54" y="70" text-anchor="middle" font-size="52" font-weight="900" fill="#2EAFC8" font-family="sans-serif">${k}</text><text x="54" y="112" text-anchor="middle" font-size="18" font-weight="800" fill="#3A2A1C" font-family="sans-serif">단계</text></g>`).join('');
  return svg(`
  <rect width="1920" height="1080" fill="url(#tl${n})"/>
  <rect y="820" width="1920" height="260" fill="#9FB1A9"/>
  ${lockers}
  <rect x="690" y="170" width="260" height="360" rx="130" fill="#DDEFF8" stroke="#8C9BA5" stroke-width="10"/>
  <path d="M760 250l60-60M760 320l120-120" stroke="#fff" stroke-width="10"/>
  <rect x="990" y="150" width="380" height="330" rx="12" fill="#F1FBFD" stroke="#2EAFC8" stroke-width="6"/>
  <text x="1180" y="182" text-anchor="middle" font-size="26" font-weight="900" fill="#1F7F93" font-family="sans-serif">올바른 손 씻기 6단계</text>
  ${poster}
  <rect x="980" y="560" width="420" height="40" rx="8" fill="#C9CED6" stroke="#5D6670" stroke-width="5"/>
  <path d="M1040 600h300l-30 120h-240z" fill="#E6EBEF" stroke="#5D6670" stroke-width="6"/>
  <path d="M1190 520v-40h50v20" stroke="#8C9BA5" stroke-width="12" fill="none"/>
  <rect x="1330" y="470" width="44" height="80" rx="10" fill="#7FC8F8" stroke="#3A5A70" stroke-width="5"/>
  <rect x="1460" y="150" width="400" height="330" rx="10" fill="#C49A63" stroke="#8A6239" stroke-width="10"/>
  ${[0, 1, 2].map((i) => `<rect x="${1490 + i * 120}" y="190" width="100" height="100" fill="#FFD43B" transform="rotate(${[-4, 3, -2][i]} ${1540 + i * 120} 240)"/>`).join('')}
  ${[0, 1, 2, 3].map((i) => `<rect x="${1490 + i * 90}" y="330" width="76" height="92" fill="#FFFFFF" stroke="#3A2A1C" stroke-width="3" transform="rotate(${[3, -3, 2, -2][i]} ${1528 + i * 90} 376)"/><rect x="${1497 + i * 90}" y="337" width="62" height="58" fill="${['#F7C5D9', '#BFE3FF', '#FFE7A8', '#C8E6C9'][i]}" transform="rotate(${[3, -3, 2, -2][i]} ${1528 + i * 90} 376)"/>`).join('')}`, defs);
}

/* ---------------- 주방 ---------------- */
function kitchen() {
  const n = ++seq;
  const defs = `<pattern id="kt${n}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#F6F4EF"/><path d="M0 0h60v60" stroke="#DCD6CC" stroke-width="3" fill="none"/></pattern>` + rad(`ov${n}`, '#FF9A3C', 0.9);
  return svg(`
  <rect width="1920" height="1080" fill="url(#kt${n})"/>
  <rect y="800" width="1920" height="280" fill="#B9B2A6"/>
  <rect x="120" y="230" width="560" height="560" rx="16" fill="#C9CED6" stroke="#4A4F57" stroke-width="10"/>
  <rect x="170" y="300" width="460" height="220" rx="10" fill="#3A2A1C"/>
  <rect x="190" y="320" width="420" height="180" rx="8" fill="url(#ov${n})"/>
  ${[0, 1, 2, 3].map((i) => `<ellipse cx="${250 + i * 100}" cy="440" rx="38" ry="20" fill="#C98A3D"/>`).join('')}
  <rect x="170" y="560" width="460" height="180" rx="10" fill="#B6BCC4" stroke="#4A4F57" stroke-width="6"/>
  <circle cx="230" cy="270" r="14" fill="#E3262E"/><circle cx="280" cy="270" r="14" fill="#4A4F57"/>
  <g transform="translate(820 360)"><rect x="0" y="380" width="300" height="60" rx="10" fill="#4A4F57"/><rect x="200" y="0" width="70" height="400" rx="16" fill="#E3262E" stroke="#3A2A1C" stroke-width="7"/><path d="M60 180h200v40H60z" fill="#E3262E" stroke="#3A2A1C" stroke-width="7"/><path d="M40 260h180l-20 120H60z" fill="#C9CED6" stroke="#3A2A1C" stroke-width="7"/></g>
  <rect x="1320" y="200" width="460" height="600" rx="8" fill="none" stroke="#8C9BA5" stroke-width="12"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="1330" y="${240 + i * 110}" width="440" height="14" fill="#8C9BA5"/>${[0, 1, 2, 3].map((j) => `<ellipse cx="${1390 + j * 105}" cy="${228 + i * 110}" rx="36" ry="16" fill="${(i + j) % 2 ? '#C98A3D' : '#E0A24E'}"/>`).join('')}`).join('')}
  <g fill="#EFE6D6" stroke="#B9A88F" stroke-width="5"><path d="M1180 800q-10-110 60-120 70 10 60 120z"/><path d="M1240 800q-6-80 50-86 56 6 50 86z"/></g>`, defs);
}

/* ---------------- 휴게(티타임) ---------------- */
function tea() {
  const n = ++seq;
  const defs = lin(`ts${n}`, '#CDE9FF', '#FFF5DC') + rad(`tw${n}`, '#FFF1C8', 0.7);
  return svg(`
  <rect width="1920" height="1080" fill="#E9F0E3"/>
  <rect y="760" width="1920" height="320" fill="#C7B08F"/>
  <rect x="300" y="120" width="680" height="480" rx="12" fill="url(#ts${n})" stroke="#FFFDF6" stroke-width="22"/>
  <path d="M640 120v480" stroke="#FFFDF6" stroke-width="14"/>
  <circle cx="640" cy="360" r="460" fill="url(#tw${n})"/>
  <rect x="1200" y="220" width="480" height="20" fill="#8A6239"/>
  <g><rect x="1240" y="150" width="60" height="70" rx="10" fill="#E3262E"/><rect x="1330" y="160" width="60" height="60" rx="10" fill="#FFD43B"/><path d="M1460 220q-20-80 30-80t30 80z" fill="#5AA35A"/></g>
  <ellipse cx="960" cy="800" rx="420" ry="70" fill="#8A5A35"/>
  <rect x="920" y="800" width="80" height="220" fill="#6E4628"/>
  <g transform="translate(780 700)"><path d="M0 0h90v60q0 34-34 34h-22Q0 94 0 60z" fill="#FFFFFF" stroke="#3A2A1C" stroke-width="6"/><path d="M90 16h18q16 0 16 18t-16 18H90" fill="none" stroke="#3A2A1C" stroke-width="6"/><path d="M30 -20q-10 -20 0-36M60 -20q-10 -20 0-36" stroke="#B9A88F" stroke-width="5" fill="none"/></g>
  <g transform="translate(1020 700)"><path d="M0 0h90v60q0 34-34 34h-22Q0 94 0 60z" fill="#FFD43B" stroke="#3A2A1C" stroke-width="6"/><path d="M90 16h18q16 0 16 18t-16 18H90" fill="none" stroke="#3A2A1C" stroke-width="6"/></g>`, defs);
}

/* ---------------- 교실(회상) ---------------- */
function school() {
  return svg(`
  <rect width="1920" height="1080" fill="#EFE3C8"/>
  <rect y="820" width="1920" height="260" fill="#B88A60"/>
  <rect x="260" y="110" width="1240" height="520" rx="10" fill="#2F5E46" stroke="#8A6239" stroke-width="24"/>
  <text x="880" y="210" text-anchor="middle" font-size="64" font-weight="900" fill="#FFFDF2" font-family="sans-serif">세 가지 약속</text>
  <text x="380" y="320" font-size="52" font-weight="800" fill="#FFF6C8" font-family="sans-serif">① 모르면 물어보기</text>
  <text x="380" y="420" font-size="52" font-weight="800" fill="#FFF6C8" font-family="sans-serif">② 실수하면 말하기</text>
  <text x="380" y="520" font-size="52" font-weight="800" fill="#FFF6C8" font-family="sans-serif">③ 힘들면 쉬겠다고 말하기</text>
  <rect x="1580" y="140" width="260" height="440" rx="8" fill="#CDE9FF" stroke="#FFFDF6" stroke-width="16"/>
  <rect x="200" y="700" width="420" height="40" rx="6" fill="#9B6A40"/><rect x="1300" y="700" width="420" height="40" rx="6" fill="#9B6A40"/>
  <rect width="1920" height="1080" fill="${TINT.memory}"/>`);
}

const SCENES = { home, living, bus_stop: busStop, cafe_front: cafeFront, counter, office, staff, kitchen, tea, school };

/**
 * 새 배경(바닷가 마을 카페, docs/image_requests.md 5장): 그림 파일만 있음. 그림이 없으면 가까운 임시 그림(SVG)으로
 * 예: bg('hall', 'spring') → assets/bg/hall_spring.jpg
 */
const PHOTO_SCENES = {
  hall: 'counter', alley: 'cafe_front', festival_alley: 'cafe_front', harbor: 'bus_stop', bus_terminal: 'bus_stop',
  hardware_front: 'cafe_front', post_office_front: 'cafe_front', backroom: 'staff', jieun_room: 'home', title_cafe: 'cafe_front',
};

/**
 * 최종 이미지: assets/bg/{id}_{variant}.jpg (변형이 없으면 {id}.jpg) 를 넣고 npm run assets 하면 자동으로 씀.
 * 파일 이름이 다를 때만 여기 직접 등록: { 'counter_day': 'counter_day.jpg' }
 */
export const BG_FILES = {};

export function renderBg(id, variant) {
  const key = `${id}_${variant || 'default'}`;
  const file = img.url('bg', variant ? `${id}_${variant}` : id) || (BG_FILES[key] ? `./assets/bg/${BG_FILES[key]}` : null);
  if (file) return `<img class="bg-img" src="${file}" alt="">`;
  if (id === 'black') return '<div class="bg-solid" style="background:#0E0C12"></div>';
  if (id === 'white') return '<div class="bg-solid" style="background:#FFF7E8"></div>';
  if (PHOTO_SCENES[id]) return SCENES[PHOTO_SCENES[id]]();
  const fn = SCENES[id];
  return fn ? fn(variant) : svg('<rect width="1920" height="1080" fill="#2A2630"/>');
}

export const BG_IDS = Object.keys(SCENES).concat(Object.keys(PHOTO_SCENES), ['black', 'white']);
