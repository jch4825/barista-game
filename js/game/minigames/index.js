/**
 * 미니게임 등록부: mini('이름', 옵션) 비트로 실행합니다.
 * 새 게임의 바리스타 작업대와 손 기술(PRD.md 6장)을 만들면 여기에 등록합니다.
 * 틀(frame.js: 머리글·[그만하기]·도중 정리)과 실시간·턴 방식 고리(arcade.js)는 그대로 씁니다.
 */

import { brew, brewLines, brewProblems } from './brew.js';

export const MINIGAMES = {
  brew, // 커피 만들기(바리스타 작업대 + 손 기술, PRD 6장): mini('brew', { orders: [{ who, say, menu }], level })
};

/** 미니게임이 읽어 주는 문장 (tools/export-lines.mjs 가 mini 비트의 옵션으로 호출) */
export const MINIGAME_LINES = {
  brew: brewLines,
};

/** 미니게임 옵션 검사 (tools/validate-scenarios.mjs 가 mini 비트마다 부름): 문제 글 목록 */
export const MINIGAME_CHECKS = {
  brew: brewProblems,
};

/** 미니게임의 모양(skin) 이름 (검사기용) */
export const MINIGAME_SKINS = {};

/** 미니게임 안에서 생기는 아차(아차 노트에 등록) */
export const MINIGAME_OOPS = [];
