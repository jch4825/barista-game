/**
 * 임시 초상 생성기 (일러스트가 아직 없는 인물용)
 * 일러스트 초상과 같은 비율(360x418)의 '증명사진' 느낌으로 그립니다.
 * 최종 일러스트가 들어오면 characters.js 에 faces 를 추가하는 것만으로 교체됩니다.
 */

const INK = '#2A2228';
let seq = 0;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const S = (w = 5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function backHair(st, hair) {
  switch (st) {
    case 'bob': return `<path d="M86 200 C80 110 130 78 180 78 C232 78 282 110 274 200 L280 286 C250 302 110 302 80 286 Z" fill="${hair}" ${S()}/>`;
    case 'long': return `<path d="M84 190 C78 105 130 74 180 74 C232 74 284 105 276 190 L294 362 C240 384 120 384 66 362 Z" fill="${hair}" ${S()}/>`;
    case 'ponytail': return `<path d="M246 128 C322 138 336 232 304 306 C292 254 282 206 250 172 Z" fill="${hair}" ${S()}/>`;
    case 'bun': return `<circle cx="180" cy="80" r="36" fill="${hair}" ${S()}/>`;
    case 'curly':
    case 'perm': {
      const r = st === 'curly' ? 1 : 0.85;
      return [[108, 132, 30], [138, 100, 31], [180, 90, 33], [222, 100, 31], [252, 132, 30], [98, 172, 24], [262, 172, 24]]
        .map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr * r}" fill="${hair}" ${S(4)}/>`).join('');
    }
    default: return '';
  }
}

function frontHair(st, hair, outfit) {
  switch (st) {
    case 'short': return `<path d="M100 175 C96 110 140 82 182 82 C228 82 266 112 262 175 C246 140 222 124 196 126 C172 128 160 118 150 128 C130 140 114 150 100 175 Z" fill="${hair}" ${S()}/>`;
    case 'messy': return `<path d="M100 178 C92 120 120 92 146 86 L150 66 L168 84 L186 62 L198 84 L222 70 L224 92 C252 102 270 132 262 178 C246 146 224 132 200 136 C182 120 170 136 150 132 C130 142 112 156 100 178 Z" fill="${hair}" ${S()}/>`;
    case 'bob': return `<path d="M98 182 C96 112 140 86 182 86 C226 86 266 114 262 182 C250 150 236 132 214 130 C196 148 168 148 150 130 C128 134 108 154 98 182 Z" fill="${hair}" ${S()}/>`;
    case 'ponytail': return `<path d="M100 172 C98 110 142 84 186 84 C230 86 266 116 262 170 C236 128 190 118 140 140 C122 148 108 158 100 172 Z" fill="${hair}" ${S()}/><rect x="244" y="118" width="16" height="22" rx="6" fill="#FF7A59" ${S(3)}/>`;
    case 'long': return `<path d="M98 186 C96 112 140 84 180 84 C220 84 264 112 262 186 C248 140 214 112 180 108 C146 112 112 140 98 186 Z" fill="${hair}" ${S()}/>`;
    case 'bun': return `<path d="M100 170 C98 112 140 88 182 88 C226 88 264 114 262 170 C240 132 214 120 182 120 C150 120 124 132 100 170 Z" fill="${hair}" ${S()}/>`;
    case 'curly':
    case 'perm': return [120, 150, 180, 210, 240].map((x) => `<circle cx="${x}" cy="${st === 'curly' ? 122 : 124}" r="${st === 'curly' ? 20 : 17}" fill="${hair}" ${S(4)}/>`).join('');
    case 'cap': {
      const c = shade(outfit, -40);
      return `<path d="M104 196 L102 160 M256 196 L258 160" stroke="${hair}" stroke-width="12"/>`
        + `<path d="M96 160 C100 100 150 78 182 78 C220 78 262 100 266 160 Z" fill="${c}" ${S()}/>`
        + `<path d="M84 160 L292 160 C282 182 98 182 84 160 Z" fill="${shade(c, -25)}" ${S()}/>`;
    }
    default: return '';
  }
}

function faceParts(face) {
  const eyeL = (rx = 9, ry = 12) => `<ellipse cx="150" cy="200" rx="${rx}" ry="${ry}" fill="${INK}"/><circle cx="153" cy="195" r="3" fill="#fff"/>`;
  const eyeR = (rx = 9, ry = 12) => `<ellipse cx="210" cy="200" rx="${rx}" ry="${ry}" fill="${INK}"/><circle cx="213" cy="195" r="3" fill="#fff"/>`;
  const brow = (d) => `<path d="${d}" fill="none" ${S(5)}/>`;
  const nose = `<path d="M180 214 Q176 226 183 230" fill="none" ${S(3)}/>`;
  const blush = `<ellipse cx="128" cy="230" rx="14" ry="8" fill="rgba(255,110,110,.35)"/><ellipse cx="232" cy="230" rx="14" ry="8" fill="rgba(255,110,110,.35)"/>`;
  switch (face) {
    case 'smile':
    case 'happy':
    case 'proud':
      return brow('M134 174 Q150 166 166 174') + brow('M194 174 Q210 166 226 174')
        + `<path d="M138 204 Q150 190 162 204" fill="none" ${S(5)}/><path d="M198 204 Q210 190 222 204" fill="none" ${S(5)}/>`
        + nose + `<path d="M158 242 Q180 274 202 242 Z" fill="#8B2E3A" ${S(4)}/>` + blush;
    case 'worried':
    case 'nervous':
    case 'scared':
      return brow('M134 180 L164 170') + brow('M196 170 L226 180') + eyeL() + eyeR() + nose
        + `<path d="M164 252 Q172 246 180 252 Q188 258 196 252" fill="none" ${S(4)}/>`
        + `<path d="M252 160 Q244 176 252 182 Q260 176 252 160 Z" fill="#9FD3F5" ${S(3)}/>`;
    case 'angry':
      return brow('M134 170 L166 184') + brow('M194 184 L226 170') + eyeL(9, 8) + eyeR(9, 8) + nose
        + `<ellipse cx="180" cy="254" rx="17" ry="12" fill="#5A1E24" ${S(4)}/>`;
    case 'surprised':
      return brow('M134 168 Q150 158 166 168') + brow('M194 168 Q210 158 226 168') + eyeL(11, 14) + eyeR(11, 14) + nose
        + `<ellipse cx="180" cy="254" rx="8" ry="10" fill="#5A1E24" ${S(3)}/>`;
    case 'sad':
      return brow('M134 182 L164 172') + brow('M196 172 L226 182') + eyeL(8, 10) + eyeR(8, 10) + nose
        + `<path d="M166 258 Q180 246 194 258" fill="none" ${S(4)}/>`;
    case 'think':
      return brow('M134 176 Q150 170 166 176') + brow('M194 168 Q210 160 226 170') + eyeL() + `<path d="M199 202 Q210 196 221 202" fill="none" ${S(5)}/>`
        + nose + `<path d="M170 252 L194 247" fill="none" ${S(4)}/>`;
    default:
      return brow('M134 176 Q150 170 166 176') + brow('M194 176 Q210 170 226 176') + eyeL() + eyeR() + nose
        + `<path d="M165 248 Q180 258 195 248" fill="none" ${S(4)}/>`;
  }
}

export function drawPortrait(spec = {}, face = 'normal') {
  const n = ++seq;
  const skin = spec.skin || '#F0C9A6';
  const hair = spec.hair || '#2B2320';
  const outfit = spec.outfit || '#9AA3AE';
  const acc = new Set(spec.acc || []);
  const st = spec.style || 'short';
  const parts = [];

  parts.push(`<defs><pattern id="ht${n}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="rgba(0,0,0,.07)"/></pattern></defs>`);
  parts.push(`<rect width="360" height="418" fill="${spec.bg || '#EEE'}"/><rect width="360" height="418" fill="url(#ht${n})"/>`);
  parts.push('<circle cx="180" cy="196" r="150" fill="rgba(255,255,255,.45)"/>');

  if (acc.has('wheelchair')) {
    parts.push(`<path d="M62 300 L62 418 M298 300 L298 418" stroke="#4A4F57" stroke-width="12"/><rect x="48" y="288" width="28" height="20" rx="7" fill="#2B2B33"/><rect x="284" y="288" width="28" height="20" rx="7" fill="#2B2B33"/>`);
  }
  parts.push(backHair(st, hair));
  parts.push(`<path d="M158 260 L158 324 L202 324 L202 260" fill="${skin}" ${S()}/>`);
  if (acc.has('hood')) parts.push(`<path d="M104 334 C112 290 248 290 256 334 C224 350 136 350 104 334 Z" fill="${shade(outfit, -30)}" ${S()}/>`);
  parts.push(`<path d="M28 418 C34 345 100 318 180 318 C260 318 326 345 332 418 Z" fill="${outfit}" ${S()}/>`);
  if (acc.has('zip')) parts.push(`<path d="M140 318 C150 302 210 302 220 318 L214 344 L146 344 Z" fill="${shade(outfit, -20)}" ${S()}/><path d="M180 330 L180 418" ${S(3)}/>`);
  else parts.push(`<path d="M150 318 L180 352 L210 318" fill="#fff" ${S()}/>`);
  if (spec.apron) parts.push(`<path d="M136 352 L224 352 L232 418 L128 418 Z" fill="${spec.apron}" ${S()}/><path d="M142 352 L156 322 M218 352 L204 322" stroke="${spec.apron}" stroke-width="8"/>`);
  if (acc.has('tie_loose')) parts.push(`<g transform="rotate(9 180 360)"><path d="M172 328 L188 328 L196 384 L180 404 L166 384 Z" fill="#B03A2E" ${S(4)}/></g>`);
  if (acc.has('backpack')) parts.push('<path d="M92 360 C108 334 120 324 132 318 M268 360 C252 334 240 324 228 318" stroke="#2F3E4E" stroke-width="13" fill="none"/>');

  parts.push(`<ellipse cx="100" cy="200" rx="12" ry="20" fill="${skin}" ${S()}/><ellipse cx="260" cy="200" rx="12" ry="20" fill="${skin}" ${S()}/>`);
  parts.push(`<ellipse cx="180" cy="190" rx="80" ry="92" fill="${skin}" ${S()}/>`);
  parts.push(frontHair(st, hair, outfit));
  if (acc.has('baker_cap')) parts.push(`<path d="M106 132 C110 74 250 74 254 132 Z" fill="#FFFFFF" ${S()}/><path d="M104 132 L256 132 L254 150 L106 150 Z" fill="#F1E9DA" ${S(4)}/>`);
  if (acc.has('beret')) parts.push(`<path d="M98 122 C110 68 252 68 264 114 C232 98 150 98 98 122 Z" fill="#C0392B" ${S()}/><circle cx="182" cy="74" r="6" fill="#C0392B" ${S(3)}/>`);

  parts.push(faceParts(face));
  if (acc.has('wrinkles')) parts.push(`<path d="M124 214 l12 4 M236 214 l-12 4 M128 222 l9 2 M232 222 l-9 2" ${S(2)}/>`);
  if (acc.has('flour')) parts.push('<ellipse cx="236" cy="236" rx="15" ry="7" fill="#fff" opacity=".9"/><circle cx="222" cy="244" r="3" fill="#fff"/><circle cx="250" cy="226" r="2.5" fill="#fff"/>');
  if (acc.has('glasses_round')) parts.push(`<circle cx="150" cy="200" r="22" fill="rgba(255,255,255,.18)" ${S(4)}/><circle cx="210" cy="200" r="22" fill="rgba(255,255,255,.18)" ${S(4)}/><path d="M172 200 Q180 193 188 200 M128 198 L104 192 M232 198 L256 192" fill="none" ${S(4)}/>`);
  if (acc.has('glasses_square')) parts.push(`<rect x="126" y="184" width="48" height="34" rx="8" fill="rgba(255,255,255,.18)" ${S(4)}/><rect x="186" y="184" width="48" height="34" rx="8" fill="rgba(255,255,255,.18)" ${S(4)}/><path d="M174 198 L186 198" ${S(4)}/>`);
  if (acc.has('earmuffs')) parts.push(`<path d="M112 326 C112 384 248 384 248 326" stroke="#3B6EA5" stroke-width="11" fill="none"/><ellipse cx="108" cy="328" rx="25" ry="29" fill="#3B6EA5" ${S(4)}/><ellipse cx="252" cy="328" rx="25" ry="29" fill="#3B6EA5" ${S(4)}/>`);
  if (acc.has('camera')) parts.push(`<path d="M144 322 L166 380 M216 322 L194 380" ${S(4)}/><rect x="148" y="372" width="64" height="42" rx="8" fill="#3D3D45" ${S(4)}/><circle cx="180" cy="393" r="12" fill="#9FC7E8" ${S(3)}/>`);
  if (acc.has('phone')) parts.push(`<rect x="248" y="296" width="44" height="78" rx="8" fill="#2B2B33" ${S(4)}/><rect x="254" y="304" width="32" height="56" rx="4" fill="#9FC7E8"/><ellipse cx="270" cy="372" rx="27" ry="18" fill="${skin}" ${S(4)}/>`);
  if (acc.has('bags')) parts.push(`<path d="M246 330 C266 362 300 362 312 330" stroke="#8A6A4A" stroke-width="8" fill="none"/><rect x="268" y="350" width="72" height="68" rx="10" fill="#E9D8B4" ${S(4)}/>`);
  // 새 단골의 소품(2026-10-31): 우편 가방 · 털모자 · 수염 · 운전 모자 · 아기 띠 · 이어폰 · 귀에 꽂은 연필 · 선글라스 · 헤드셋 · 목도리
  if (acc.has('mailbag')) parts.push(`<path d="M120 322 L238 418" stroke="#6B4A2A" stroke-width="14"/><rect x="226" y="360" width="96" height="58" rx="10" fill="#8A5A34" ${S(4)}/><rect x="236" y="372" width="76" height="14" rx="4" fill="#B0413E"/>`);
  if (acc.has('beanie')) parts.push(`<path d="M98 150 C100 84 260 84 262 150 Z" fill="#B0413E" ${S()}/><path d="M96 150 L264 150 L262 172 L98 172 Z" fill="#8E2F2C" ${S(4)}/>`);
  if (acc.has('stubble')) parts.push('<path d="M140 250 Q180 296 220 250 Q214 280 180 286 Q146 280 140 250 Z" fill="rgba(60,50,45,.28)"/>');
  if (acc.has('driver_cap')) parts.push(`<path d="M100 150 C104 96 256 96 260 150 Z" fill="#2F3A55" ${S()}/><path d="M92 150 L268 150 C258 166 102 166 92 150 Z" fill="#1E2538" ${S()}/><rect x="166" y="118" width="28" height="16" rx="4" fill="#E2B64E"/>`);
  if (acc.has('baby_sling')) parts.push(`<path d="M96 330 L270 418" stroke="#B48A9A" stroke-width="18"/><circle cx="214" cy="380" r="30" fill="#F6D5C0" ${S(4)}/><path d="M188 372 Q214 346 240 372" fill="#F2E3C8" ${S(3)}/>`);
  if (acc.has('earphones')) parts.push(`<path d="M100 214 C96 260 120 300 150 318 M260 214 C264 260 240 300 210 318" stroke="#FFFFFF" stroke-width="5" fill="none"/><circle cx="100" cy="212" r="9" fill="#FFFFFF" ${S(3)}/><circle cx="260" cy="212" r="9" fill="#FFFFFF" ${S(3)}/>`);
  if (acc.has('pencil_ear')) parts.push('<path d="M254 168 L284 128" stroke="#E2B64E" stroke-width="9" stroke-linecap="round"/><path d="M284 128 L290 120" stroke="#2A2228" stroke-width="5" stroke-linecap="round"/>');
  if (acc.has('sunglasses')) parts.push(`<rect x="124" y="186" width="52" height="30" rx="12" fill="#2A2228" ${S(3)}/><rect x="184" y="186" width="52" height="30" rx="12" fill="#2A2228" ${S(3)}/><path d="M176 198 L184 198" ${S(4)}/>`);
  if (acc.has('headset')) parts.push(`<path d="M96 196 C96 96 264 96 264 196" stroke="#2A2228" stroke-width="8" fill="none"/><rect x="84" y="184" width="22" height="36" rx="8" fill="#2A2228"/><path d="M96 220 Q110 262 150 262" stroke="#2A2228" stroke-width="5" fill="none"/>`);
  if (acc.has('scarf')) parts.push(`<path d="M120 318 C150 346 210 346 240 318 L246 342 C210 368 150 368 114 342 Z" fill="#E07B45" ${S(4)}/>`);

  // 임시 그림 표시(2026-10-31 사용자 "대체 요망이라고 적어두면 된다"): 폴라로이드 아래에만 보이고, 얼굴 동그라미에서는 잘림
  parts.push('<g><rect x="0" y="388" width="360" height="30" fill="rgba(20,20,24,.72)"/><text x="180" y="409" text-anchor="middle" font-size="18" font-weight="700" fill="#FFE14D" font-family="Pretendard, sans-serif">임시 그림 · 대체 요망</text></g>');
  return `<svg class="pol-svg" viewBox="0 0 360 418" xmlns="http://www.w3.org/2000/svg" role="img">${parts.join('')}</svg>`;
}
