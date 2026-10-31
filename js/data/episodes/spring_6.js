/**
 * 봄 6일 · 바다 안 나가요: 새벽, 강 씨가 바다에 나가지 않음(대응 K2) → 배우의 사진을 보고 온 낯선 손님들(딸기우유 · 아아)
 * → 마감 둘러보기(숨은 장면 5: 칠판 오른쪽 아래의 빈칸을 사장님은 지우지 않음)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, mini, respond, branch, motion, end } from '../../core/dsl.js';

export default {
  id: 'spring_6',
  act: 1, season: 'spring', day: 6,
  label: '봄 6일',
  title: '바다 안 나가요',
  when: '봄 · 새벽',
  goal: '말하지 않는 마음 곁에 조용히 있어 줘요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  costume: { customer: 'olive' },
  diary: '강 씨는 오늘 바다에 나가지 않았다. 처음 보는 손님들이 사진을 찍으러 왔다. 칠판 구석은 늘 비어 있다.',
  script: [
    big('봄 · 6일', '바다 안 나가요'),
    bg('hall', 'morning'),
    amb('cafe'),
    place('봄 새벽 06:05', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', center: 'kang:normal', right: 'owner:normal' }),
    narr('오늘은 내가 먼저 와서 불을 켜 두었다. 강 씨는 창에 불이 켜져 있어야 들어오신다.'),
    narr('강 씨가 들어와 늘 앉는 창가에 앉는다. 사장님이 물을 끓이고, 천천히 블랙을 내린다.'),
    say('kang', 'normal', '…블랙.'),
    leave('owner'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    respond('kang', 'spring_sea'),
    leave('kang'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('jieun', 'normal', '사장님, 강 씨가 오늘은 바다에 안 나가신대요. 배가 나가는 걸 보기만 하셨어요.'),
    narr('드리퍼를 닦던 사장님의 손이 잠깐 멈춘다.'),
    say('owner', 'normal', '…그렇군요. 바다 사람이 바다에 안 나갈 때는, 다 이유가 있어요.'),
    say('owner', 'normal', '말하고 싶어지면 말할 거예요. 그때까지는 늘 하던 대로 해요.'),
    think('사장님은 무언가 아시는 것 같다. 그래도 강 씨에게 묻지 않으신다.'),

    // 사진을 보고 온 손님들
    place('봄 오전 11:00', '바닷가 마을 카페'),
    bgm('cafe'),
    sfx('bell'),
    show({ left: 'jieun:normal', right: 'customer:normal' }),
    narr('처음 보는 손님이 휴대전화 화면을 이리저리 비교하며 들어온다.'),
    say('customer', 'smile', '여기 맞죠? 배우가 사진 올린 그 카페!'),
    branch('spring_seat', {
      keep: [say('customer', 'smile', '배우가 그랬대요. 단골 자리를 지켜 주는 가게라고요.')],
      give: [say('customer', 'smile', '배우가 그랬대요. 할머니가 말없이 기다려 주는 카페라고요.')],
    }),
    say('customer', 'normal', '딸기우유 하나랑 아아 하나 주세요.'),
    mini('brew', {
      id: 'spring_6_tourist', title: '사진 보고 온 손님', level: 'normal',
      book: ['warm_milk', 'americano', 'latte', 'hand_drip', 'strawberry_milk'],
      orders: [
        { who: 'customer', say: '딸기우유 하나요.', menu: 'strawberry_milk', temp: 'iced', togo: false, ask: ['togo'], reply: { togo: '여기서 사진 찍고 마실게요.' }, thanks: '예쁘다! 분홍색이 사진에 잘 나오겠어요.' },
        { who: 'customer', say: '아아도 하나요. 이것도 여기서요.', menu: 'americano', temp: 'iced', togo: false, thanks: '시원해요. 고마워요.' },
      ],
    }),
    sfx('shutter_phone'),
    narr('손님이 창가 자리에서 이리저리 자리를 옮기며 사진을 여러 장 찍는다.'),
    leave('customer'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '사진 보고 오는 손님이 늘었네요.'),
    narr('사장님은 그 말만 하고, 창가의 빈 의자를 한 번 본다.'),
    think('손님이 느는 건 좋은 일이다. 그런데 사장님은 왜 저 의자를 보실까.'),

    // 마감 둘러보기: 숨은 장면 5
    bg('hall', 'evening'),
    bgm('warm'),
    place('봄 저녁 19:00', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '오늘도 닫기 전에 한 번 둘러봐요. 낮이랑 밤은 가게가 달라 보여요.'),
    mini('lookaround', {
      id: 'spring_6_look', title: '닫을 때 둘러보기', bg: ['hall', 'evening'],
      spots: [
        { name: '칠판', icon: 'memo', x: 83, y: 32, seen: 5, lines: ['사장님이 내일 메뉴를 고쳐 쓰셨다. 그런데 칠판 오른쪽 아래 한 칸만 비어 있다.', '사장님은 매일 칠판을 지우고 다시 쓰시는데, 그 칸만은 지우지도, 쓰지도 않으신다.', { t: 'think', text: '무엇을 쓰려고 비워 두셨을까.' }] },
        { name: '창가 자리', icon: 'chair', x: 24, y: 60, lines: ['낮에 손님들이 사진을 찍던 자리다. 빈 의자는 다시 제자리에 돌아와 있다.', { t: 'think', text: '사장님이 내일 아침 할머니가 오시기 전에 돌려 놓으셨구나.' }] },
        { name: '드리퍼', icon: 'coffee', x: 50, y: 84, lines: ['새벽에 강 씨의 블랙을 내린 드리퍼가 깨끗이 말라 있다.', { t: 'think', text: '강 씨는 내일 바다에 나가실까. 그래도 불은 켜 두어야지.' }] },
        { name: '창밖', icon: 'window', x: 12, y: 30, lines: ['벚꽃잎이 바람에 눈처럼 날린다. 봄이 조금씩 지나가고 있다.'] },
      ],
    }),
    say('owner', 'normal', '내일이면 벚꽃도 다 지겠네요. 그러면 손님도 조금 줄 거예요.'),
    think('여기 온 지 일주일이 다 되어 간다. 이제 단골들의 얼굴이 하나씩 보이기 시작한다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
