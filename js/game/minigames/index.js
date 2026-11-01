/**
 * 미니게임 등록부: mini('이름', 옵션) 비트로 실행합니다.
 * 틀(frame.js: 머리글·[그만하기]·도중 정리)과 실시간·턴 방식 고리(arcade.js)는 함께 씁니다.
 *  - brew: 커피 만들기(주문 받기 + 카운터 + 손 동작, PRD 6장)
 *  - routine: 순서대로(가게 열기 · 마감 · 혼자 여는 아침 · 정전 준비, 동작 H)
 *  - lookaround: 둘러보기(여는 때 · 닫는 때, 숨은 장면 찾기 Q-13)
 *  - tray: 쟁반 나르기(서두르면 쏟는다)
 *  - rush: 몰림(재미 개편 4.4: 도시 카페의 점심시간 · 우리 카페의 몰림 시간 · 그 갈매기 쫓기)
 *  - bus: 바닷가로 가는 버스(재미 개편 7장: 창밖 풍경 세기 · 덜컹하면 손잡이)
 */

import { brew, brewLines, brewProblems } from './brew.js';
import { routine, routineLines, routineProblems } from './routine.js';
import { lookaround, lookaroundLines, lookaroundProblems } from './lookaround.js';
import { tray, trayLines, trayProblems } from './tray.js';
import { rush, rushLines, rushProblems } from './rush.js';
import { bus, busLines, busProblems } from './bus.js';

export const MINIGAMES = { brew, routine, lookaround, tray, rush, bus };

/** 미니게임이 읽어 주는 문장 (tools/export-lines.mjs 가 mini 비트의 옵션으로 호출) */
export const MINIGAME_LINES = { brew: brewLines, routine: routineLines, lookaround: lookaroundLines, tray: trayLines, rush: rushLines, bus: busLines };

/** 미니게임 옵션 검사 (tools/validate-scenarios.mjs 가 mini 비트마다 부름): 문제 글 목록 */
export const MINIGAME_CHECKS = { brew: brewProblems, routine: routineProblems, lookaround: lookaroundProblems, tray: trayProblems, rush: rushProblems, bus: busProblems };

/** 미니게임의 모양(skin) 이름 (검사기용) */
export const MINIGAME_SKINS = {};

/** 미니게임 안에서 생기는 아차(아차 노트에 등록) */
export const MINIGAME_OOPS = [];
