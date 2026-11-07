/**
 * 작업대 물건 · 다 만든 잔 · 놀이 시트의 칸과 Flow 프롬프트
 *  - 요청서(tools/export-requests.mjs → docs/requests_full.md 3장 · docs/아직 없는 그림.md)와 제작 정보(tools/credits/image_prompts.mjs)가 같은 글을 씀
 *  - 칸 순서는 tools/import-objects.py 의 SHEETS 와 같아야 함
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const PLASTIC = 'a tall clear plastic takeaway cup with clear ice cubes, a flat clear lid and a white paper straw';
export const OBJ_SHEETS = [
  {
    id: 'sheet_more', name: '카운터 물건(선반의 병 · 플라스틱 컵 · 얼음 통 · 수첩)', key: 'green', ref: '`sheet_tools` · `sheet_cups`', use: '카운터(재료 고르기)에 늘 보이는 물건: 벽 선반의 병 · 통 · 상자 · 봉지(그날 주문에 든 것만), 컵 줄의 플라스틱 컵, 오른쪽 끝 얼음 통(얼음이 다 떨어진 날은 빈 통), 왼쪽 앞 레시피 수첩',
    rows: [
      { intro: 'small kitchen containers that stand upright on a shelf, all about the same small height', items: [
        ['obj_decaf', 'a small glass jar of dark roasted coffee beans with a plain cream lid'],
        ['obj_drip_beans', 'a small kraft paper bag of whole coffee beans with a folded top, standing upright'],
        ['obj_mix', 'a small paper box of instant coffee mix with a few slim golden-yellow stick packets poking out of the open top'],
        ['obj_barley', 'a small paper box of roasted barley tea bags with a few tea bag tags on strings hanging over the edge'],
      ] },
      { items: [
        ['obj_yuja', 'a small glass jar of bright yellow-orange citron (yuja) tea preserve with thin peel slices and a plain white lid'],
        ['obj_strawberry', 'a small glass jar of red strawberry preserve with small fruit pieces and a plain white lid'],
        ['obj_cocoa', 'a small round tin of dark brown cocoa powder with the lid off and a small metal scoop resting in the powder'],
        ['cup_plastic', 'an empty tall clear plastic takeaway cup with a flat clear lid and a white paper straw'],
      ] },
      { items: [
        ['obj_ice_bucket', 'a small brushed stainless steel ice bucket filled to the top with clear ice cubes, a small metal ice scoop resting inside'],
        ['obj_ice_bucket_empty', 'the same ice bucket again, now empty: no ice cubes, only a little melted water at the bottom, the same metal scoop resting inside'],
        ['obj_recipe_book', 'a small closed recipe notebook lying flat, deep navy linen hardcover with thin gold corner trims and a gold ribbon bookmark hanging out, slightly worn'],
      ] },
    ],
  },
  {
    id: 'sheet_drinks', name: '다 만든 잔(머그 · 유리컵) · 건조대', key: 'green', ref: '`sheet_cups`', use: '드리기 쟁반 · 레시피 수첩의 다 만든 잔(머그 · 두꺼운 컵 · 유리컵 · 플라스틱 컵 딸기우유) + 버리는 장면의 식기 건조대',
    rows: [
      { intro: 'the same plain white ceramic mug as in the reference image, identical shape, size and angle, filled to the same level just below the rim', items: [
        ['cup_mug_barley', 'warm barley tea, clear amber brown'],
        ['cup_mug_yuja', 'warm citron (yuja) tea, bright golden yellow with thin peel strips floating'],
        ['cup_mug_cocoa', 'hot cocoa, dark chocolate brown with a little light foam'],
        ['cup_thick_latte', 'the thick double-wall cream ceramic mug from the reference image filled with cafe latte, smooth light brown milk foam, no latte art'],
      ] },
      { intro: 'the same tall clear drinking glass as the iced americano in the reference image, with clear ice cubes, filled to the same level', items: [
        ['cup_glass_latte', 'iced cafe latte, light caramel milk with soft coffee swirls'],
        ['cup_glass_barley', 'iced barley tea, clear amber'],
        ['cup_glass_yuja', 'iced citron (yuja) tea, golden yellow with thin peel strips'],
        ['cup_glass_strawberry', 'strawberry milk, soft pink milk with red strawberry preserve at the bottom'],
      ] },
      { items: [
        ['cup_glass_cocoa', 'iced cocoa in the same tall glass, light chocolate brown with ice cubes'],
        ['cup_plastic_strawberry', `strawberry milk in ${PLASTIC}`],
        ['obj_rack', 'an empty small stainless steel wire dish drying rack with a drip tray'],
      ] },
    ],
  },
  {
    id: 'sheet_drinks_blue', name: '다 만든 잔(플라스틱 컵 · 녹차라테) · 개수대 · 쓰레기통', key: 'blue', ref: '`sheet_cups`(+ 먼저 만든 `sheet_drinks`)', use: '플라스틱 컵(포장 · 아이스)의 다 만든 잔 · 녹차라테 세 가지 · 벽 선반의 말차 통 + 버리는 장면의 개수대 · 쓰레기통. 녹차라테 · 말차가 초록이라 **파란 바탕**',
    rows: [
      { intro: `the same ${PLASTIC} in every cell, identical shape, size and angle, filled to the same level`, items: [
        ['cup_plastic_americano', 'iced americano, dark coffee brown'],
        ['cup_plastic_latte', 'iced cafe latte, light caramel milk with soft coffee swirls'],
        ['cup_plastic_barley', 'iced barley tea, clear amber'],
        ['cup_plastic_yuja', 'iced citron (yuja) tea, golden yellow with thin peel strips'],
      ] },
      { items: [
        ['cup_plastic_cocoa', 'iced cocoa in the same plastic cup, light chocolate brown'],
        ['cup_plastic_greentea', 'iced green tea latte in the same plastic cup, soft matcha green milk'],
        ['cup_glass_greentea', 'iced green tea latte in a tall clear drinking glass with clear ice cubes (the same glass as the reference image)'],
        ['cup_mug_greentea', 'warm green tea latte in the plain white ceramic mug (the same mug as the reference image), soft matcha green milk foam, no latte art'],
      ] },
      { items: [
        ['obj_matcha', 'a small round tin of bright green matcha powder with the lid off and a small bamboo scoop resting in it'],
        ['obj_sink', 'a small rectangular stainless steel bar sink basin with a curved gooseneck faucet, empty and clean, seen from slightly above'],
        ['obj_bin', 'a small green kitchen trash bin with a lid'],
      ] },
    ],
  },
  {
    id: 'sheet_empty', name: '빈 우유병 · 손 그라인더 · 바 스푼', key: 'green', ref: '`sheet_tools`(우유병이 있는 시트)', use: '우유가 다 떨어진 날(오늘의 칠판 · 자유 영업) 카운터의 빈 우유병 + 거의 보이지 않는 손 도구 둘(손 기술 컷이 없을 때만). **첫 줄 세 칸만** 그리고 나머지는 비움',
    rows: [
      { items: [
        ['obj_milk_bottle_empty', 'the same glass milk bottle as in the reference image, now empty: clear glass with only a thin trace of milk at the bottom, the same cap'],
        ['obj_hand_grinder', 'a wooden manual hand coffee grinder with a metal crank handle'],
        ['obj_spoon', 'a long stainless steel bar spoon lying diagonally'],
      ] },
    ],
  },
  {
    id: 'sheet_gift', name: '선물 · 카운터 꾸미기', key: 'green', ref: '`sheet_tools` · `sheet_cups`', use: "수첩 '나의 성장'에서 사는 것(검수 13.91): 카운터 꾸미기 다섯(작업대 카운터 오른쪽 창틀 위에 놓임, 머그와 같은 배율) + 선물 여섯(선물 장면에서 상자가 열리면 보임). 초록 바탕이라 초록이 거의 없게(다육이는 청회색, 꽃은 말린 들꽃). 그림이 오기 전에는 동그라미 아이콘",
    rows: [
      { intro: 'small decorations for a cafe window sill, each about as tall as a mug or a little taller', items: [
        ['counter_plant', 'a small round terracotta pot with one plump pale blue-grey echeveria succulent (dusty blue-grey, not bright green)'],
        ['counter_shells', 'a small clear glass jar with a cork lid, filled with little seashells in cream, peach and pale pink'],
        ['counter_flowers', 'a small cream ceramic vase with a loose bunch of dried seaside wildflowers: lavender purple sea lavender, cream and pale yellow blossoms, muted olive-brown stems'],
        ['counter_hourglass', 'an hourglass with a warm oak wood frame and pale sand, the sand halfway fallen'],
      ] },
      { items: [
        ['counter_lighthouse', 'a small table lamp shaped like a lighthouse with red and white stripes and a softly glowing warm yellow window at the top'],
        ['gift_bread', 'a kraft paper bakery bag with the top folded open, two round golden bread rolls and the end of a baguette poking out'],
        ['gift_mug', 'a new ceramic mug in deep sea blue with a cream inside and a thin cream wave line around the middle, empty'],
        ['gift_scarf', 'a neatly folded soft knit wool scarf in warm mustard and cream stripes with short tassels'],
      ] },
      { items: [
        ['gift_postcard', 'a postcard with a painted calm blue sea and small islands, leaning on a plain cream envelope with a small sea-blue stamp shape, no writing anywhere'],
        ['gift_beans', 'a kraft paper coffee bean bag with a fold-over top and a tin tie, standing upright, a few roasted coffee beans beside it'],
        ['gift_blanket', 'a neatly folded soft fleece lap blanket in warm oatmeal beige with a cream tartan check pattern'],
      ] },
    ],
  },
];
export const KEY_EN = {
  green: 'Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.',
  blue: 'Flat solid chroma key blue background (#0047BB) everywhere, no gradients, no cast shadows on the background, no blue reflections.',
};
export const sheetItems = (sh) => sh.rows.flatMap((r) => r.items);

export const objPrompt = (sh) => `Same art style, angle, lighting and rendering as the reference images (barista equipment and cup sheets): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.\nThe square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each ${sheetItems(sh).length < 11 ? 'used ' : ''}cell with wide empty margins; nothing touches or overlaps.\n${sh.rows.map((r, i) => `Row ${i + 1}${r.intro ? ` (${r.intro})` : ''}: ${r.items.map(([, d]) => d).join('; ')}${i === 2 ? '; the last cell (bottom right) completely empty' : r.items.length < 4 ? '; the remaining cells of this row completely empty' : ''}.`).join('\n')}${sh.rows.length < 3 ? `\nRows ${sh.rows.length + 1} to 3: every cell completely empty. Only ${sheetItems(sh).length} objects in the whole image.` : ''}\n${KEY_EN[sh.key]}\nAvoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, steam, latte art, black outlines.`;

/* 새 놀이의 그림(docs/image_requests.md 8장): 상자 맨 앞의 [블록]을 채운 프롬프트 */
const imgDoc = () => fs.readFileSync(path.join(root, 'docs/image_requests.md'), 'utf8').replace(/\r\n/g, '\n');
const boxAfter = (text, from) => { const m = /```\n([\s\S]*?)\n```/.exec(text.slice(Math.max(0, from))); return m ? m[1] : ''; };
export function playPrompt(id) {
  const doc = imgDoc();
  const blockAfter = (label) => { const i = doc.indexOf(label); return i < 0 ? '' : boxAfter(doc, i); };
  const sec8 = doc.slice(doc.indexOf('## 8. '), doc.indexOf('## 9. '));
  const i = sec8.indexOf('`' + id + '`');
  return i < 0 ? '' : boxAfter(sec8, i).replace('[놀이 그림 블록]', blockAfter('**[놀이 그림]**')).replace('[5.2 이야기 배경 블록]', blockAfter('**[이야기 배경]**'));
}
