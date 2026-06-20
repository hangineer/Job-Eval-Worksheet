export const STORAGE_KEY = "career-change-scores";
export const WEIGHTS_STORAGE_KEY = "career-change-weights";
export const JOB_NAME_STORAGE_KEY = "career-change-job-name";

export const WEIGHT_GUIDE = [
  { value: 1, meaning: "幾乎不重要" },
  { value: 2, meaning: "有影響，但不是關鍵" },
  { value: 3, meaning: "中等重要" },
  { value: 4, meaning: "很重要" },
  { value: 5, meaning: "核心關鍵" },
] as const;
