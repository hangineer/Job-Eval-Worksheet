import { CRITERIA } from "../criteria";
import type { Scores, Weights } from "./types";

// 至少評過這個比例的項目才提供判斷（0.6 = 六成）
export const MIN_COVERAGE = 0.6;

export interface ScoreResult {
  /** 已評分項目的加權總分（score × weight 累加） */
  earned: number;
  /** 已評分項目的加權滿分（5 × weight 累加） */
  maxEarn: number;
  /** 已評分的項目數 */
  answeredCount: number;
  /** 正規化得分率 0~100：全部 1 分 = 0%、全部 3 分 = 50%、全部 5 分 = 100% */
  percent: number;
  /** 評分進度（已評 / 全部項目） */
  progress: number;
  /** 提供判斷所需的最少評分項目數 */
  minAnswered: number;
  /** 覆蓋率是否足以下判斷 */
  hasEnoughCoverage: boolean;
}

/** 依使用者的評分與權重，計算得分率、進度與是否足以下判斷 */
export function evaluateScores(scores: Scores, weights: Weights): ScoreResult {
  let earned = 0;
  let maxEarn = 0;
  let earnedMin = 0;
  let answeredCount = 0;
  for (const c of CRITERIA) {
    const score = scores[c.id];
    if (score == null) continue;
    const weight = weights[c.id] ?? c.weight;
    earned += score * weight;
    maxEarn += weight * 5;
    earnedMin += weight; // 該項最低可能得分（score = 1）
    answeredCount += 1;
  }

  // 正規化到實際可達範圍：全部 1 分 = 0%、全部 3 分 = 50%、全部 5 分 = 100%
  const range = maxEarn - earnedMin;
  const percent =
    range > 0 ? Math.round(((earned - earnedMin) / range) * 100) : 0;

  const progress = (answeredCount / CRITERIA.length) * 100;
  // 覆蓋率太低時不下判斷，避免只填幾項就給結論
  const minAnswered = Math.ceil(CRITERIA.length * MIN_COVERAGE);
  const hasEnoughCoverage = answeredCount >= minAnswered;

  return {
    earned,
    maxEarn,
    answeredCount,
    percent,
    progress,
    minAnswered,
    hasEnoughCoverage,
  };
}

export interface JudgmentBand {
  min: number;
  label: string;
}

export const JUDGMENT_BANDS: JudgmentBand[] = [
  { min: 75, label: "很值得轉" },
  { min: 60, label: "偏值得，但要確認風險" },
  { min: 40, label: "可以考慮，但不是明顯好選項" },
  { min: 25, label: "只有在你很想離職時才考慮" },
  { min: 0, label: "不建議轉" },
];

/** @param percent 0~100 的正規化得分率 */
export function getJudgment(percent: number): string {
  const band = JUDGMENT_BANDS.find(b => percent >= b.min);
  return band ? band.label : "";
}

// 產生區間的顯示文字，ex.「75% 以上」「60～74%」「低於 25%」
export function formatBandRange(index: number): string {
  const band = JUDGMENT_BANDS[index];
  if (index === 0) return `${band.min}% 以上`;

  const upper = JUDGMENT_BANDS[index - 1].min;
  if (band.min === 0) return `低於 ${upper}%`;

  return `${band.min}~${upper - 1}%`;
}
