/**
 * 그림마다 제작 프롬프트 복기 (tools/export-credits.mjs 가 읽어 선생님 모드 '제작·저작권 정보'에 보여 줌)
 *
 * 그림은 사용자가 Google Flow로 만들었습니다. Flow에 실제로 넣은 글은 Flow 기록에만 남아 있어서,
 * 같은 그림을 다시 만들 수 있게 아래 자료로 프롬프트를 복기했습니다.
 * 지금 있는 것은 직업 마1스톤에서 가져와 다시 쓰는 그림(스탠딩·배경·효과·설정화)뿐입니다. 지운 그림(사진·소품·표지 영상·픽셀)의 줄은 뺐습니다.
 *   from: 'chat'   대화에서 드린 프롬프트를 그대로(기록 있음)
 *         'doc'    직업 마1스톤의 그림 요청서(image_requests.md · art_bible.md, 이 폴더에는 없음)의 블록을 바탕으로, 실제 그림(전신·흰 배경 등)에 맞춰 복기
 *         'look'   요청서에 없어 그림을 보고 복기
 *         'derived' 다른 그림에서 잘라 냄(새로 만들지 않음)
 *         'code'   생성 AI가 아니라 코드로 그림
 * 새 그림을 넣으면 여기에 한 줄을 더하고 `npm run credits`를 실행합니다.
 */

/* ---------- 공통 블록 (직업 마1스톤 그림 요청서 2.2·2.3) ---------- */
export const STYLE = 'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm bakery-cafe palette (crimson red #E3262E accents, cream, warm brown), consistent character design, sharp lineart, high resolution';
export const NEG = 'text, letters, numbers, watermark, logo, signature, writing on name tag, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, weapon, military uniform, persona 5 style, calling card, ransom-note letters, sexualized, revealing clothes, horror, gore';
const NEG_SAME = 'different outfit, different hairstyle, changed pose angle, text, letters, watermark, logo, writing on name tag, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects';
const WHITE = 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered';
const STUDIO = 'plain light grey-white studio background, whole body visible from head to feet with small margin above the head, single character centered';
const full = (dir) => `full-body character design, standing naturally, body turned slightly toward the viewer's ${dir}, looking at the viewer`;
const same = (ref, extra = '') => `Same character as the reference image (${ref}): identical face, hairstyle, outfit, colors, body proportions, line style and framing${extra}. Change only the facial expression and hands:`;

/* ---------- 인물 블록 (요청서 A·F, 아트 바이블 4.1) ---------- */
const YEONWOO = 'Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, white collared shirt with sleeves rolled up, deep crimson red bib apron tied at the waist, small blank brass name tag on the apron, black trousers, white sneakers, thin red string bracelet on left wrist';
const YEONWOO_IV = 'Korean young woman age 20, brown chin-length bob with soft bangs, large warm brown eyes, neat white button-up blouse, navy knit vest, black trousers, small brown crossbody bag strap across the chest, thin red string bracelet on left wrist, no apron, no name tag';
const DOHYUN = 'Korean man age 26, neat black hair, black rectangular glasses, white shirt with rolled sleeves, charcoal grey vest, wine red necktie, black trousers, brown shoes, calm kind face';
const MANAGER = 'Korean man age 42, short slate grey-green hair, short stubble beard, white shirt with rolled sleeves, black vest, navy necktie, gold pocket watch chain with a small crescent charm, dark grey trousers, small spiral notepad and pen';

/* ---------- 새 게임(바닷가 카페) 공통 블록 (docs/image_requests.md 0.3 · 5.2 · 6.2) ---------- */
const SEA_STYLE = 'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution';
const JIEUN = 'Korean young woman age 21, straight black hair tied in a low ponytail with short side bangs, calm round dark brown eyes, gentle slightly serious face, cream long-sleeve henley shirt with sleeves rolled up to the elbows, medium forest green (#25844A) canvas barista apron with a brown leather neck strap and two front pockets, beige cotton trousers, white canvas sneakers, small mustard yellow hair tie on her right wrist';
const OWNER = 'Korean man age 66, neatly combed back white hair, thick dark grey eyebrows, deep-set kind eyes, short neatly trimmed white beard, slim build, white collared shirt with sleeves rolled once, charcoal grey knit vest, dark brown canvas apron, dark trousers, brown leather shoes, reading glasses hanging on a cord around his neck';
const HAESUN = 'Korean grandmother age 80, short neatly combed silver-white hair, no glasses, gentle narrow eyes, soft wrinkles, navy blue cardigan over a cream blouse, long grey skirt, small brown cloth handbag, slightly bent posture';
const JIAN = 'Korean young woman age 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil tucked behind her right ear, kind slightly tired eyes, oversized soft mustard yellow knit cardigan over a white t-shirt, wide cream trousers, canvas tote bag on her shoulder, holding a closed plain black sketchbook against her chest with both arms';
const SEA_NEG = 'text, letters, numbers, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects';
const SEA_SAME = 'Same character as the reference image: identical face, hairstyle, outfit, colors, body proportions, line style, pose angle and framing, same plain pure white background, whole body from head to feet. Change only the facial expression and hands:';
const SEA_SAME_NEG = 'different outfit, different hairstyle, changed pose angle, text, letters, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects';
const BG_STORY = 'Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.';
const BG_MENU = 'Quiet atmospheric background plate for game menus: very calm, low contrast, soft focus, painterly. Large simple dark areas on the left and in the center where text panels will be placed; nothing detailed behind the panels. Palette of deep sea teal and navy with a little warm gold. 16:9, high resolution.';
const BG_NEG = 'text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion, red awning, red pendant lamps, bakery display case, rows of bread';
const CG_STYLE = 'Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.';
const CG_NEG = 'text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast';
const OBJ_LOOK = 'highly detailed semi-realistic 2D illustration with a soft 3D-rendered look, three-quarter view from slightly above (about 30 degrees), single soft key light from the upper left, no black outlines. The square image is divided into an invisible grid of 4 columns and 3 rows, exactly one object centered in each cell, the last cell (bottom right) empty. Flat solid chroma key green background (#00B140), no cast shadows on the background.';

const P = (parts) => parts.filter(Boolean).join('\n');
const main = (who, ref, dir, pose) => P([STYLE + '.', who + '.', `${full(dir)}, ${pose}.`, STUDIO + '.', `Reference image: ${ref} (character sheet) for the same face and outfit.`]);
const face = (ref, what) => P([same(ref), what + '.', STYLE + '.']);

/**
 * id → { title(한국어), prompt, neg?, from, note? }
 * id 는 assets/images.json 의 ID(종류는 export-credits 가 붙임) 또는 'sheet:…' · 'movie:…'
 */
export const IMAGE_PROMPTS = {
  /* ===== 주요 3인 스탠딩 (896×1200, 설정화를 참조 이미지로) ===== */
  yeonwoo_normal: { title: '연우 · 보통', from: 'doc', prompt: main(YEONWOO, 'yeonwoo_sheet.jpg', 'right', 'hands lightly together in front of the apron, calm neutral expression, mouth closed'), neg: NEG },
  yeonwoo_smile: { title: '연우 · 웃음', from: 'doc', prompt: face('yeonwoo_normal', 'bright open smile with eyes closed in joy, one hand raised in a small cheerful fist near the shoulder'), neg: NEG_SAME },
  yeonwoo_nervous: { title: '연우 · 긴장', from: 'doc', prompt: face('yeonwoo_normal', 'nervous expression, eyebrows drawn together, small sweat drop, fingers touching a shirt button at the collar'), neg: NEG_SAME },
  yeonwoo_determined: { title: '연우 · 다짐', from: 'doc', prompt: face('yeonwoo_normal', 'determined expression, firm mouth, focused eyes, one hand in a small fist at shoulder height'), neg: NEG_SAME },
  yeonwoo_surprised: { title: '연우 · 놀람', from: 'doc', prompt: face('yeonwoo_normal', 'surprised expression, eyes wide, small open mouth, one open hand raised near the shoulder'), neg: NEG_SAME },
  yeonwoo_sad: { title: '연우 · 슬픔', from: 'doc', prompt: face('yeonwoo_normal', 'teary sad expression, lips pressed together, eyes glistening, not crying loudly, hands together in front of the apron'), neg: NEG_SAME },
  'yeonwoo-interview_normal': { title: '연우 면접 복장 · 보통', from: 'doc', prompt: main(YEONWOO_IV, 'yeonwoo_sheet.jpg', 'right', 'hands lightly together in front, calm neutral expression, mouth closed'), neg: NEG, note: '앞치마를 받기 전(프롤로그·1장)에 입는 옷' },
  'yeonwoo-interview_smile': { title: '연우 면접 복장 · 웃음', from: 'doc', prompt: face('yeonwoo-interview_normal', 'bright open smile with eyes closed in joy, hands together in front'), neg: NEG_SAME },
  'yeonwoo-interview_nervous': { title: '연우 면접 복장 · 긴장', from: 'doc', prompt: face('yeonwoo-interview_normal', 'nervous expression, eyebrows drawn together, fingers touching the blouse collar button'), neg: NEG_SAME },
  'yeonwoo-interview_determined': { title: '연우 면접 복장 · 다짐', from: 'doc', prompt: face('yeonwoo-interview_normal', 'determined expression, focused eyes, one hand in a small fist at shoulder height'), neg: NEG_SAME },
  dohyun_normal: { title: '도현 · 보통', from: 'doc', prompt: main(DOHYUN, 'dohyun_sheet.jpg', 'left', 'arms relaxed at his sides, calm gentle expression, mouth closed'), neg: NEG },
  dohyun_smile: { title: '도현 · 웃음', from: 'doc', prompt: face('dohyun_normal', 'warm friendly smile, one hand resting on his chest'), neg: NEG_SAME },
  dohyun_teach: { title: '도현 · 알려 주기', from: 'doc', prompt: face('dohyun_normal', 'explaining kindly, one hand raised palm up as if showing a step, attentive eyes'), neg: NEG_SAME },
  manager_normal: { title: '점장님 · 보통', from: 'doc', prompt: main(MANAGER, 'manager_sheet.jpg', 'left', 'notepad and pen held at the waist, composed neutral expression'), neg: NEG },
  manager_smile: { title: '점장님 · 웃음', from: 'doc', prompt: face('manager_normal', 'proud genuine warm smile, one hand in the trouser pocket'), neg: NEG_SAME },
  manager_strict: { title: '점장님 · 엄격', from: 'doc', prompt: face('manager_normal', 'serious firm expression, standing straight, notepad held at chest height (no crossed arms, no glaring)'), neg: NEG_SAME },
  manager_think: { title: '점장님 · 생각', from: 'doc', prompt: face('manager_normal', 'thoughtful, hand on chin, looking at the notepad'), neg: NEG_SAME },

  /* ===== 크루·가족 (768×1376, 요청서 F 인물 블록) ===== */
  sora_normal: { title: '소라', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 23, high ponytail with coral hair tie, round glasses, white shirt and crimson red apron with three pens in the pocket, black trousers, white sneakers, instant film camera held in both hands with a strap around the neck, bright energetic smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  minjae_normal: { title: '민재', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 29, quiet gentle baker, short black hair, white baker cap, flour smudge on cheek, cream baker jacket, dark brown long apron, big blue noise-cancelling earmuffs resting around his neck, calm eyes, small kind smile.', full('left') + ', hands together in front.', WHITE + '.']), neg: NEG },
  mom_normal: { title: '엄마', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 48, warm caring mother, brown hair in a low bun, lavender cardigan over a cream blouse, grey trousers, gentle eyes and a soft smile.', full('left') + ', hands lightly together in front.', WHITE + '.']), neg: NEG },

  /* ===== 손님·조연 (2026-10-12 제작, 2026-10-14 2K 업스케일링) ===== */
  jiho_normal: { title: '지호(새 신입)', from: 'doc', prompt: P([STYLE + '.', 'Korean young man age 19, nervous first day at work, messy black hair, white shirt and crimson red apron, black trousers, hands together in front, shy hopeful smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  teacher_normal: { title: '김선영 선생님', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 38, special education teacher, shoulder-length brown hair, thin glasses, mint green cardigan over a cream top, navy trousers, firm and kind expression with a gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  grandma_normal: { title: '봉순 할머니', from: 'doc', prompt: P([STYLE + '.', 'Korean grandmother age 78, curly short grey hair, round glasses, warm terracotta coat over a patterned knit sweater, patchwork tote bag on her arm, kind wrinkled smile.', full('left') + ', hands together in front.', WHITE + '.']), neg: NEG },
  'grandma-cardigan_normal': { title: '할머니 손님(카디건)', from: 'look', prompt: P([STYLE + '.', 'Korean grandmother age 75, curly short grey hair, round glasses, dusty pink cardigan over a cream blouse, light patterned scarf, brown handbag held in front, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  seojin_normal: { title: '서진(휠체어 이용 손님)', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 31, office worker using a manual wheelchair, black bob haircut, green knit sweater, grey trousers, sitting comfortably in the wheelchair with hands on her lap, confident friendly smile, wheelchair wheels and push handles fully visible.', 'full-body view, body turned slightly toward the viewer\'s left, looking at the viewer.', WHITE + '.']), neg: NEG, note: '아트 바이블에는 청록 재킷으로 적었으나 그림은 초록 스웨터' },
  daeri_normal: { title: '최 대리 · 보통', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 33, office worker, navy suit, white shirt, red necktie, black briefcase in one hand, neutral busy face.', full('left') + '.', WHITE + '.']), neg: NEG },
  daeri_angry: { title: '최 대리 · 재촉', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 33, rushed office worker, navy suit, loosened red tie, checking his wristwatch, impatient frown, black briefcase.', full('left') + '.', WHITE + '.']), neg: NEG },
  hiker_normal: { title: '등산복 손님 · 보통', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 58, bright orange hiking jacket, beige cap, hiking backpack, grey hiking trousers, scratching the back of his head with a sheepish apologetic smile, slightly comical.', full('left') + '.', WHITE + '.']), neg: NEG, note: '표정을 고친 수정본을 씀(사용자 2026-10-15)' },
  hiker_angry: { title: '등산복 손님 · 화남', from: 'doc', prompt: P([STYLE + '.', 'Korean man age 58, bright orange hiking jacket and beige cap, hiking backpack, pointing forward and shouting, face flushed, loud angry expression (not violent), slightly comical.', full('left') + '.', WHITE + '.']), neg: NEG },
  auntie_normal: { title: '장바구니 아주머니', from: 'doc', prompt: P([STYLE + '.', 'Korean woman age 55, hurried shopper, short curly permed brown hair, beige quilted jacket, grey trousers, carrying a green shopping bag, kind slightly flustered smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  student_normal: { title: '대학생 손님', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 21, university student, messy black hair, grey zip-up hoodie over a white T-shirt, light blue jeans, backpack on one shoulder, one hand in the pocket, relaxed face.', full('left') + '.', WHITE + '.']), neg: NEG },
  customer_normal: { title: '손님(기본)', from: 'look', prompt: P([STYLE + '.', 'Korean man age 50, short grey hair, navy blazer over a grey turtleneck, beige chinos, holding a brown leather wallet, calm polite face.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-angry_normal': { title: '손님 · 항의', from: 'look', prompt: P([STYLE + '.', 'Korean man age 40, short black hair, light blue dress shirt with rolled sleeves, dark grey trousers, leaning forward pointing and shouting, face flushed red, angry but comical (not violent).', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-arms_normal': { title: '손님 · 팔짱', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 40, short wavy black bob, beige trench coat over a navy top, black trousers, beige handbag on her arm, arms crossed, annoyed frown while complaining.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-coffee_normal': { title: '손님 · 테이크아웃 커피', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 30, office worker, long straight black hair, beige long coat over a white blouse, navy trousers, holding a takeout coffee cup, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-film_normal': { title: '손님 · 휴대폰 촬영', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 25, messy black hair, black bomber jacket over a dark graphic T-shirt, ripped black jeans, sneakers, holding up a smartphone as if filming, irritated frown.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-laptop_normal': { title: '손님 · 노트북 가방', from: 'look', prompt: P([STYLE + '.', 'Korean man age 30, short black hair, round glasses, olive green overshirt over a white T-shirt, black trousers, carrying a dark laptop case, calm friendly smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-olive_normal': { title: '손님 · 올리브 셔츠', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 28, long wavy brown hair, olive green blouse with rolled sleeves, cream wide-leg trousers, woven straw tote bag on her shoulder, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-sporty_normal': { title: '손님 · 운동복', from: 'look', prompt: P([STYLE + '.', 'Korean woman age 25, sporty, black high ponytail, mint green zip-up track jacket, black leggings, sneakers, holding a water bottle, one hand on her hip, cheerful smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-stripe_normal': { title: '손님 · 줄무늬 셔츠', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 22, university student, black hair, round glasses, headphones around the neck, navy and white vertical striped open shirt over a white T-shirt, dark jeans, hands in pockets, relaxed smile.', full('left') + '.', WHITE + '.']), neg: NEG, note: '같은 프롬프트로 두 장(줄무늬 셔츠 2)' },
  'customer-stripe2_normal': { title: '손님 · 줄무늬 셔츠 2', from: 'look', prompt: P([STYLE + '.', 'Korean young man age 22, university student, black hair, round glasses, headphones around the neck, navy and white vertical striped open shirt over a white T-shirt, dark jeans, hands in pockets, relaxed smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-uniform_normal': { title: '손님 · 교복', from: 'look', prompt: P([STYLE + '.', 'Korean high school boy age 17, neat black hair, navy school blazer, white shirt and striped tie, cream knit vest, grey trousers, backpack straps on both shoulders, polite smile.', full('left') + '.', WHITE + '.']), neg: NEG },
  'customer-vest_normal': { title: '손님 · 니트 조끼', from: 'look', prompt: P([STYLE + '.', 'Korean man age 45, neat black hair, thin glasses, light blue shirt, grey knit vest, grey trousers, gentle smile.', full('left') + '.', WHITE + '.']), neg: NEG },

  /* ===== 루나 (2026-10-15, 대화에서 드린 프롬프트 그대로) ===== */
  luna_normal: {
    title: '루나(SNS 손님) · 웃음', from: 'chat',
    prompt: P([
      'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm bakery-cafe palette (crimson red #E3262E accents, cream, warm brown), consistent character design, sharp lineart, high resolution.',
      'Korean woman age 22, trendy social media influencer, long wavy chestnut-brown hair, red beret, pastel pink oversized jacket over a white top, light jeans, white sneakers, small crossbody bag, holding a smartphone at chest height with the screen facing her, playful bright smile with eyes slightly curved, cheerful friendly energy.',
      'Full-body character design, standing naturally, body turned three-quarters to the left, looking at the viewer.',
      'Plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.',
    ]),
    neg: 'text, letters, numbers, watermark, logo, signature, phone screen content, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, sexualized, revealing clothes, horror',
  },
  luna_worried: {
    title: '루나(SNS 손님) · 당황', from: 'chat',
    prompt: P([
      'Same character as the reference image: identical face, hair, red beret, pastel pink oversized jacket, outfit, colors, body proportions, line style and pose (body turned three-quarters to the left), same framing and pure white background, still holding the smartphone.',
      'Change only the facial expression: surprised and a little disappointed, eyebrows raised and tilted upward in the middle, eyes wide, lips slightly pouted and parted, one small sweat drop near the temple. Mild and polite, not angry or scary.',
      'clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, sharp lineart, high resolution.',
    ]),
    neg: 'different outfit, different hairstyle, changed pose angle, angry face, crying, text, letters, watermark, logo, phone screen content, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects',
    note: '참조 이미지: luna_normal',
  },

  /* ===== 지은 · 사장님 (2026-10-29, 새 게임 요청서 1장 그대로. 사장님 768×1376, 지은은 2026-10-30 수정본 1536×2752) ===== */
  jieun_normal: { title: '지은 · 보통', from: 'doc', prompt: P([SEA_STYLE + '.', JIEUN + '.', "full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, hands lightly together in front of the apron, calm neutral expression, mouth closed.", 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.', 'Same face and outfit as the reference image (character sheet).']), neg: SEA_NEG + ', writing on the apron', note: '참조 이미지: jieun_sheet · 2026-10-30 초록 앞치마 수정본(첫 판은 앞치마가 남색으로 나옴, 요청서 1.1 ④ · 검수 I-14). 2K 1536×2752' },
  ...Object.fromEntries([
    ['jieun_smile', '지은 · 웃음', 'warm happy smile with slightly closed eyes, hands lightly together in front of the apron'],
    ['jieun_nervous', '지은 · 긴장', 'nervous expression, eyebrows drawn together, small sweat drop, holding the edge of her apron with both hands'],
    ['jieun_determined', '지은 · 다짐', 'focused determined expression, steady eyes, mouth closed, one hand in a small fist at chest height'],
    ['jieun_surprised', '지은 · 놀람', 'surprised expression, eyes wide, mouth slightly open, both hands raised a little in front of her chest'],
    ['jieun_sad', '지은 · 슬픔', 'quietly sad expression, eyes lowered, lips pressed together, hands holding each other in front of the apron'],
  ].map(([id, title, what]) => [id, { title, from: 'doc', prompt: P([SEA_SAME, what + '.', SEA_STYLE + '.']), neg: SEA_SAME_NEG, note: '참조 이미지: jieun_normal · 2026-10-30 초록 앞치마 수정본(첫 판은 앞치마가 남색으로 나옴, 요청서 1.1 ④ · 검수 I-14). 2K 1536×2752' }])),
  owner_normal: { title: '사장님 · 보통', from: 'doc', prompt: P([SEA_STYLE + '.', OWNER + '.', "full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, hands loosely clasped behind his back, calm quiet expression, mouth closed.", 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.', 'Same face and outfit as the reference image (character sheet).']), neg: SEA_NEG, note: '참조 이미지: owner_sheet' },
  ...Object.fromEntries([
    ['owner_smile', '사장님 · 미소', 'rare small warm smile, eyes softened, hands loosely clasped behind his back'],
    ['owner_think', '사장님 · 생각', 'thoughtful expression, looking slightly down, one hand touching his beard'],
    ['owner_strict', '사장님 · 단호함', 'firm serious expression, eyebrows slightly lowered, arms relaxed at his sides, calm not angry'],
  ].map(([id, title, what]) => [id, { title, from: 'doc', prompt: P([SEA_SAME, what + '.', SEA_STYLE + '.']), neg: SEA_SAME_NEG, note: '참조 이미지: owner_normal' }])),

  /* ===== 해순 할머니 · 지안 (2026-10-30, 새 게임 요청서 1.3 · 1.4 그대로, 1536×2752) ===== */
  haesun_normal: { title: '해순 할머니 · 보통', from: 'doc', prompt: P([SEA_STYLE + '.', HAESUN + '.', "full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, both hands holding the small handbag in front, gentle calm expression.", 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.', 'Same face and outfit as the reference image (character sheet).']), neg: SEA_NEG + ', glasses', note: '참조 이미지: haesun_sheet' },
  ...Object.fromEntries([
    ['haesun_smile', '해순 할머니 · 작은 웃음', 'small warm smile with soft crinkled eyes, both hands holding the handbag in front'],
    ['haesun_look', '해순 할머니 · 옆을 바라봄', 'head turned slightly to her right, eyes lowered toward something beside her, a quiet wistful smile, hands holding the handbag in front'],
  ].map(([id, title, what]) => [id, { title, from: 'doc', prompt: P([SEA_SAME, what + '.', SEA_STYLE + '.']), neg: SEA_SAME_NEG, note: '참조 이미지: haesun_normal' }])),
  jian_normal: { title: '지안 · 보통', from: 'doc', prompt: P([SEA_STYLE + '.', JIAN + '.', "full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, quiet unsure expression, mouth closed.", 'plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.', 'Same face and outfit as the reference image (character sheet).']), neg: SEA_NEG + ', writing on the sketchbook', note: '참조 이미지: jian_sheet' },
  ...Object.fromEntries([
    ['jian_smile', '지안 · 작은 웃음', 'small surprised smile, eyebrows lifted a little, still holding the closed sketchbook against her chest'],
    ['jian_shy', '지안 · 망설임', 'shy hesitant expression, eyes looking down, hugging the closed sketchbook tightly with both arms'],
  ].map(([id, title, what]) => [id, { title, from: 'doc', prompt: P([SEA_SAME, what + '.', SEA_STYLE + '.']), neg: SEA_SAME_NEG, note: '참조 이미지: jian_normal' }])),

  /* ===== 배경 (직업 마1스톤 요청서 B, 1376×768): 새 이야기에 쓰지 않아 나중에 지울 것 ===== */
  ...Object.fromEntries([
    ['tea', '휴게 공간', 'small break nook in a cafe, window daylight, round wooden table, two empty mugs, potted plant'],
    ['office', '점장실', 'small manager office, venetian blinds casting soft stripes, dark wood desk with papers and a gold pocket watch, binders, framed certificates (blank), coffee sacks'],
    ['living', '거실 · 저녁', 'cozy Korean apartment living room at dusk, small dining table with lamp, sofa, warm orange window light'],
  ].map(([id, title, scene]) => [id, {
    title, from: 'doc',
    prompt: P(['anime visual novel background art, no people, clean painterly cel style, soft halftone texture, warm calm mood, eye-level camera, 16:9, uncluttered center (characters stand there), simple lower third (dialogue box covers it), no readable text anywhere.', scene + '.']),
    neg: 'people, characters, text, letters, numbers, watermark, logo, signature, readable signs',
  }])),

  /* ===== 새 배경 (2026-10-29, 새 게임 요청서 5장 · 2K) ===== */
  hall_morning: { title: '카페 홀 · 아침', from: 'doc', prompt: P([BG_STORY, 'Interior of the cafe in the morning, seen from just behind the wooden counter at standing eye level. On the left, a large old wooden-framed window looking out on a calm blue sea and a small harbor; under the window, a small round table with two mismatched wooden chairs side by side, both empty, one of them a little older. In the middle, open floor space with three small wooden tables. On the right wall, an empty dark green chalkboard in a wooden frame, a wooden shelf with plain cups and glass jars of coffee beans, and a glass door with a small brass bell. Blue-green tiles on the lower walls, a worn wooden floor, a few potted plants, small brass wall lamps. Soft morning light comes in from the window on the left with gentle shadows. The lower quarter of the picture is the plain, empty top of the counter. The middle of the picture stays simple so characters can stand in front of it.']), neg: BG_NEG },
  hall_evening: { title: '카페 홀 · 마감', from: 'doc', prompt: P(['Same cafe interior, same camera angle and the same layout as the reference image: the window seat with two chairs on the left, the empty chalkboard and the shelf on the right, the counter at the bottom.', 'Evening after closing time: outside the window the sea is deep blue at blue hour with a soft peach glow low on the horizon, small warm lamps are on inside (brass wall lamps and one small lamp on the counter), the chairs are neatly pushed in, a calm and quiet mood.', BG_STORY]), neg: BG_NEG, note: '참조 이미지: hall_morning' },
  cafe_front_morning: { title: '카페 앞 · 아침', from: 'doc', prompt: P([BG_STORY, 'Exterior of the same small old cafe as the reference image, on a quiet sloping alley in a seaside village, in the morning. A two-story building with weathered cream plaster and dark wood, a faded forest green fabric awning, a big wooden-framed front window with warm light inside, a glass door with a small brass bell, a blank wooden sign board above the door with nothing written on it, a small wooden bench and potted plants by the door, an empty folding chalkboard stand. The cafe fills the right half of the picture. On the left half, the alley slopes down toward a calm blue sea and a small harbor with a few fishing boats under a clear, soft sky; this side stays simple and calm.']), neg: BG_NEG, note: '참조 이미지: hall_morning' },
  title_cafe_dusk: { title: '처음 화면 · 해 질 녘 카페 앞', from: 'doc', prompt: P(['Same cafe exterior and the same alley as the reference image, at blue hour just after sunset. The sky is a calm gradient from deep blue to a soft peach color near the horizon, the sea is deep teal with a few gentle reflections, the cafe windows glow with warm golden light, and a few small street lamps are on along the alley. The left 45 percent of the picture (the alley and the sea) is calm and simple, with large dark areas for the game title and the menu buttons. Peaceful, inviting and quiet.', BG_STORY]), neg: BG_NEG, note: '참조 이미지: cafe_front_morning' },
  ui_sea_night: { title: '메뉴 뒤 · 밤바다', from: 'doc', prompt: P([BG_MENU, 'A night view of a calm sea from a seaside village. On the far right edge, the dark wooden frame of an old window and a little warm lamp glow. The rest of the picture is calm dark teal and navy water with soft silvery ripples and a smooth deep navy sky with gentle gradients, with no objects in the left and center. Very low contrast.']), neg: 'text, letters, numbers, logos, watermark, people, boats, buildings in the center, bright spots in the center, clutter' },
  ...Object.fromEntries([
    ['ui_cafe_dim', '메뉴 뒤 · 흐린 카페 안', BG_MENU, 'The inside of the same cafe at night, completely out of focus: warm golden lamp bokeh on the right, dark wooden walls and shelves melting into deep teal shadows. The left and center are calm and dark.', 'hall_evening'],
    ['hall_spring', '카페 홀 · 봄', BG_STORY, 'Same interior as the reference. Spring morning: pale pink cherry blossom trees along the shore outside the window, a few petals drifting past the glass, fresh soft light.', 'hall_morning'],
    ['hall_summer', '카페 홀 · 여름', BG_STORY, 'Same interior as the reference. Bright summer morning: deep blue sea and white clouds outside, the window half open, thin linen curtains moving softly, a small electric fan on the counter.', 'hall_morning'],
    ['hall_autumn', '카페 홀 · 가을', BG_STORY, 'Same interior as the reference. Autumn afternoon: yellow ginkgo trees by the shore outside, warm low golden light across the floor, a calmer grey-blue sea.', 'hall_morning'],
    ['hall_winter', '카페 홀 · 겨울', BG_STORY, 'Same interior as the reference. Winter morning: snow falling outside, snow along the window frame, a little fog at the edges of the glass, a small round heater near the tables.', 'hall_morning'],
    ['hall_blackout', '카페 홀 · 정전 밤', BG_STORY, 'Same interior as the reference during a snowy winter night blackout: the electric lights are off; the room is lit only by several candles in glass jars and two old camping lanterns on the counter and tables, small warm pools of light in deep blue darkness, heavy snow outside, a hand-drip kettle on the counter. Quiet, safe and warm, not scary.', 'hall_morning'],
    ['alley_morning', '바닷가 골목', BG_STORY, 'A narrow sloping alley of low old houses in the same seaside village, morning; flower pots, a hanging laundry line, stone steps, the green awning of the cafe at the far end, the calm sea at the bottom of the slope.', 'cafe_front_morning'],
    ['harbor_dawn', '항구 · 새벽', BG_STORY, 'A small fishing harbor at dawn in blue hour: a few small wooden fishing boats moored, coiled ropes and buoys on the stone pier, one small street lamp still on, calm water, the sky turning pale near the horizon.', ''],
    ['hall_busy_summer', '카페 홀 · 여름 줄', BG_STORY, 'Same interior as the reference on a busy summer day: through the window and the glass door, a long line of tourists in the alley is seen only as soft distant silhouettes; extra cups stacked on the counter; bright and lively.', 'hall_summer'],
    ['bus_terminal_evening', '버스 종점 · 저녁', BG_STORY, 'The last stop of a village bus line by the sea, evening: a small bus shelter with a wooden bench, a parked green-and-cream village bus with nothing written on it, the sea behind a low wall.', ''],
    ['hardware_front', '철물점 앞', BG_STORY, 'The front of an old hardware store on the same alley: tools, ropes and buckets hanging by the sliding glass doors, a wooden counter inside, a blank sign.', 'alley_morning'],
    ['post_office_front', '우체국 앞', BG_STORY, 'A small old post office building on the same alley: a blank sign, a postbox, a bicycle with a delivery bag leaning by the door.', 'alley_morning'],
    ['backroom', '카페 뒷방', BG_STORY, 'The small back room of the same cafe: hooks with aprons, shelves with milk crates and coffee bags, a small sink, a key hook by the back door, a little window.', 'hall_morning'],
    ['jieun_room_night', '지은의 방 · 밤', BG_STORY, 'A small rented room above a shop in the same village at night: a desk with a warm lamp and an open notebook, a window showing the dark sea, a folded green apron on the chair.', ''],
    ['festival_alley_autumn', '가을 축제의 골목', BG_STORY, 'The same alley decorated for a village autumn festival: plain paper lanterns strung between the houses, small food stalls with cream and green awnings, warm evening light.', 'alley_morning'],
  ].map(([id, title, block, scene, ref]) => [id, { title, from: 'doc', prompt: P([block, scene]), neg: id === 'hall_busy_summer' ? BG_NEG.replace('people', 'people inside the cafe, faces') : BG_NEG, note: ref ? `참조 이미지: ${ref}` : '' }])),
  workbench_morning: { title: '작업대 배경', from: 'doc', prompt: P(["Semi-realistic painterly 2D illustration with a soft 3D-rendered look, matching the reference image's lighting and rendering, no people.", "Close-up of a barista's work counter in a small old cafe in a Korean seaside village, seen from the barista's side; the camera is at standing eye level looking slightly down at the countertop.", 'Lower half: a long, empty, clean warm oak wooden countertop (game objects will be placed on it later).', 'Back wall: off-white subway tiles, one simple wooden shelf with a few plain mugs and glass jars of coffee beans, a small window on the upper right showing a calm blue sea and a morning sky.', 'Soft morning sunlight from the upper left, gentle shadows, a warm, cozy and calm mood, palette of warm wood, cream and soft sea blue. 16:9.']), neg: 'people, hands, text, letters, numbers, signs, logos, watermark, coffee machine, cups or objects on the countertop, clutter', note: '참조 이미지: sheet_tools' },

  /* ===== 장면 그림 · 이벤트 CG (2026-10-29, 새 게임 요청서 6장 · 2K) ===== */
  ...Object.fromEntries([
    ['cg_spring_first_cup', '봄 · 첫 컵', 'Early spring morning before opening, behind the wooden counter of the cafe. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord) gently hands JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist) a plain white mug of warm milk with a little steam; she receives it carefully with both hands, a little nervous but touched. Medium shot from the side at standing eye level, the two of them left of center, the big window behind them showing a calm pale blue sea in soft morning light. An empty dark green chalkboard on the wall, glass jars of coffee beans on a shelf.', 'owner_sheet · jieun_sheet · hall_morning'],
    ['cg_haesun_two_cups', '우유 두 잔과 빈 의자', 'Over-the-shoulder view from behind JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist): in the right foreground, at the middle height of the picture, her hands in cream sleeves hold a small wooden tray with two white mugs of warm milk. In the middle ground, HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the small round table by the big window; beside her is an empty, slightly older wooden chair that nobody sits on. She gently strokes the back of the empty chair with one hand and looks at it with a quiet, wistful smile. Soft morning light from the window, the calm sea outside.', 'jieun_sheet · hall_morning'],
    ['cg_owner_closing_milk', '봄 · 마감 우유', 'Night after closing time. Most cafe lights are off; one small warm lamp glows on the counter. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord) sits alone at the window table, holding a white mug of warm milk in both hands, thin steam rising, looking out at the dark blue night sea through the big window. The chairs are pushed in. Calm and a little lonely, but warm. Seen from across the room, slightly from the side.', 'owner_sheet · hall_evening'],
    ['cg_jian_color_menu', '메뉴판의 색 동그라미', 'Summer afternoon at the counter. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) stands in front of the counter, hugging a closed plain black sketchbook to her chest, looking up at the menu board on the wall. The menu board has no words at all: only a neat row of simple painted color circles (yellow, green, orange, brown, white, pink), each next to a small drawing of a cup. Her expression is quiet and unsure. Seen from behind the counter at standing eye level; she is in the center, the menu board on the upper right. Bright but soft summer light.', 'hall_morning(여름 빛)'],
    ['cg_blackout_cafe_lit', '겨울 · 불 켜진 카페', 'A heavy snowy winter night in the seaside village during a blackout: the houses, street lamps and the small harbor are all dark and covered in thick snow under a deep navy sky with falling snowflakes. Only one building glows: the small old cafe from the reference image, its big front window and glass door filled with warm candle and lantern light, a soft warm glow spilling onto the snow in front of it. Wide shot from a little above the sloping alley, the cafe slightly right of center. Quiet and safe, not scary.', 'cafe_front_morning'],
    ['cg_haesun_cup_for_him', '의자 앞의 잔', 'Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.\nSoft morning light from the window on the left. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the small round table by the window and gazes for a long time at the white mug of warm milk placed in front of the empty, slightly older wooden chair beside her. Her eyes are a little moist and she wears a quiet, grateful smile; one hand rests gently on the table near the cup. Seen from a low angle across the table: the steaming cup and the empty chair on the right at middle height, her face in the upper left. Tender and calm.', 'hall_morning'],
    ['cg_summer_line', '여름 · 골목 끝까지 선 줄', 'A hot, bright summer afternoon on the sloping alley: a long line of tourists in summer clothes stretches from the cafe door down to the far end of the alley, holding phones and hand fans, drawn small and simple; the cafe with its faded forest green awning on the right, the sea at the bottom of the slope. Lively but not chaotic.', 'cafe_front_morning'],
  ].map(([id, title, scene, ref]) => [id, { title: `장면 · ${title}`, from: 'doc', prompt: P([CG_STYLE, scene]), neg: CG_NEG, note: `참조 이미지: ${ref}` }])),

  /* ===== 작업대 물건 (2026-10-29, Flow 시트 두 장에서 잘라 냄: tools/import-objects.py) ===== */
  ...Object.fromEntries([
    ['sheet_tools', 'obj_machine 에스프레소 머신|obj_grinder 그라인더|obj_portafilter 포터필터|obj_portafilter_full 포터필터(가루)|obj_tamper 탬퍼|obj_pitcher 피처|obj_pitcher_milk 피처(우유 거품)|obj_milk_bottle 우유병|obj_kettle 드립 주전자|obj_dripper 드리퍼|obj_syrup 시럽 병', 'Row 1: a compact one-group espresso machine (stainless steel, wooden portafilter handle attached, small steam wand on the right side); a coffee grinder with a clear bean hopper full of coffee beans; an empty espresso portafilter with a wooden handle (empty basket visible); the same portafilter filled with flat tamped ground coffee.\nRow 2: a coffee tamper with a wooden handle; an empty stainless steel milk pitcher; the same milk pitcher full of steamed milk with a smooth white foam top; a glass milk bottle full of milk.\nRow 3: a stainless steel gooseneck kettle; a white ceramic pour-over dripper with a paper filter; a glass syrup bottle with a pump; the last cell (bottom right) completely empty.'],
    ['sheet_cups', 'cup_mug_empty 빈 머그|cup_mug_americano 머그 · 아메리카노|cup_mug_milk 머그 · 우유|cup_mug_latte 머그 · 라테|cup_mug_heart 머그 · 하트 라테|cup_thick 두꺼운 머그|cup_glass_empty 빈 유리잔|cup_glass_ice 유리잔 · 아이스 아메리카노|cup_paper 종이컵|cup_shot 에스프레소 잔|obj_tray 쟁반', 'Row 1 (the same plain white ceramic mug with identical shape, size and angle in every cell): an empty mug; the mug full of black americano coffee with light brown crema; the mug full of warm white milk with a little foam; the mug of cafe latte with a smooth light brown milk foam surface and no latte art.\nRow 2: the same white mug of cafe latte with a simple white heart latte art on top; an empty thick double-wall cream ceramic mug; an empty tall clear drinking glass; the same tall glass filled with iced americano and ice cubes.\nRow 3: a white paper takeaway cup with a white lid and a plain kraft paper sleeve; a small white espresso cup with a shot of espresso and crema; an empty rectangular warm oak serving tray; the last cell (bottom right) completely empty.'],
  ].flatMap(([sheet, items, rows]) => items.split('|').map((it) => {
    const [id, ...name] = it.split(' ');
    return [id, { title: `작업대 · ${name.join(' ')}`, from: 'doc', sheet, prompt: P([`A game asset sheet of cafe barista ${sheet === 'sheet_cups' ? 'cups and drinks' : 'equipment'}, ${OBJ_LOOK}`, rows]), neg: 'text, letters, numbers, labels, logos, brand names, watermark, people, hands, black outlines, overlapping objects, steam', note: `${sheet} 시트(4칸 × 3줄)에서 잘라 냄${sheet === 'sheet_cups' ? ' · 참조 이미지: sheet_tools' : ''}` }];
  }))),

  /* ===== VFX 텍스처 (요청서 I, 초록 배경 → 게임에서 초록을 지움) ===== */
  ...Object.fromEntries([
    ['vfx_sparkle', '반짝임', 'white four-pointed sparkle particle'],
    ['vfx_star', '별', 'plump yellow star'],
    ['vfx_glow', '빛 덩어리', 'soft round glowing white light particle'],
    ['vfx_confetti', '색종이', 'six colorful confetti pieces (red, yellow, mint, sky blue) scattered'],
    ['vfx_ink', '잉크 튐', 'red ink splash splat'],
    ['vfx_steam', '커피 김', 'single wisp of white semi-transparent coffee steam'],
    ['vfx_bubble', '비누 거품', 'iridescent soap bubble'],
    ['vfx_drop', '물방울', 'single blue water drop'],
    ['vfx_splash', '액체 튐', 'translucent brown liquid splash splat'],
    ['vfx_puff', '연기 퐁', 'round white smoke cloud poof'],
    ['vfx_flour', '밀가루 퐁', 'white flour dust burst'],
    ['vfx_ring', '소리 파동', 'circular glowing sound wave ring shockwave'],
    ['vfx_speedlines', '속도선 띠', 'horizontal white speed lines band (wide strip)'],
    ['vfx_gear', '톱니바퀴', 'small golden mechanical gear'],
    ['vfx_heart', '하트', 'small red heart'],
    ['vfx_paper', '종이 조각', 'small white paper scrap'],
  ].map(([id, title, thing]) => [id, {
    title: `효과 · ${title}`, from: 'doc',
    prompt: P(['game VFX particle texture, single element centered, soft edges, plain solid #00FF00 background.', thing + '.']),
    neg: 'text, letters, watermark, logo, extra elements, red background with rays',
    note: '요청서 블록(I) + 모양 설명을 영어로 옮김',
  }])),

  /* ===== 설정화 (표정 초상을 잘라 낸 원본, 896×1200) ===== */
  'sheet:yeonwoo': { title: '설정화 · 연우', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of YEONWOO, age 20, role: diligent baker, personality: diligent, warm.', YEONWOO + '.', 'full-body front view and side view, three expression headshots on the right: nervous, determination, bright smile.']), neg: 'watermark, logo, deformed hands', note: '그림 안의 글자(이름표 등)가 깨져 있어 게임에서는 쓰지 않음' },
  'sheet:dohyun': { title: '설정화 · 도현', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of DOHYUN (26).', DOHYUN + '.', 'full-body front view and side view, three expression headshots in boxes: friendly warm smile, attentive teaching look, adjusting glasses with confidence.']), neg: 'watermark, logo, deformed hands' },
  'sheet:manager': { title: '설정화 · 점장님', from: 'look', prompt: P([STYLE + ', plain white background.', 'character design sheet of the cafe manager.', MANAGER + '.', 'color swatches, full-body front view and side view, headshot, three expression headshots: strict disciplined look, serious thoughtful evaluation, proud genuine warm smile, small detail boxes: hand, pocket watch, apron pocket, name tag.']), neg: 'watermark, logo, deformed hands', note: '그림 속 가게 이름(CAFÉ LUMINA)은 옛 이름이라 쓰지 않음' },
};

/** 원래 파일 이름이 SOURCES.md 에 없는 그림 */
export const NO_SOURCE_NOTE = '원래 파일 이름 기록 없음';
