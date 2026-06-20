export interface Criterion {
  id: string;
  title: string;
  description: string;
  weight: number;
  note: string;
}

export const SCORE_OPTIONS = [
  { value: 0, label: "0", description: "如果你不在乎此面向，可選 0" },
  { value: 1, label: "1", description: "明顯偏差，需要考慮" },
  { value: 2, label: "2", description: "略差，但可接受" },
  { value: 3, label: "3", description: "普通，沒有明顯影響" },
  { value: 4, label: "4", description: "小加分，可以接受" },
  { value: 5, label: "5", description: "明顯加分，很有吸引力" },
] as const;

export const CRITERIA: Criterion[] = [
  { id: "salary-total", title: "總年薪", description: "月薪、年終、績效獎金、分紅等合計", weight: 5, note: "獎金是否白紙黑字、是否浮動" },
  { id: "salary-base", title: "月薪", description: "每月實際入帳是否夠舒服", weight: 4, note: "月薪低會影響現金流與未來談薪" },
  { id: "raise-potential", title: "未來調薪空間", description: "公司調薪制度、主管是否願意培養", weight: 4, note: "" },
  { id: "job-technicality", title: "工作內容", description: "是否以專業和職缺上的工作描述為主，而非行政、協調或支援", weight: 5, note: "若參雜跟工作內容相差甚遠的雜事需慎重考慮" },
  { id: "tech-growth", title: "技術成長", description: "是否有機會學新技術或接觸新領域", weight: 5, note: "" },
  { id: "experience-fit", title: "經驗銜接", description: "與既有經驗銜接", weight: 4, note: "經驗需能夠累積" },
  { id: "resume-value", title: "履歷與未來彈性", description: "公司品牌、職稱、工作內容，以及下一份工作可選的職能與市場廣度", weight: 5, note: "" },
  { id: "industry-outlook", title: "產業前景", description: "該產業是否穩定、有長期需求", weight: 4, note: "產業的成長性也需考量" },
  { id: "manager-team", title: "主管與團隊", description: "主管是否清楚、若完全沒經驗團隊是否有人帶或詢問", weight: 5, note: "" },
  { id: "job-stability", title: "工作穩定性", description: "公司制度、職缺穩定、組織風險", weight: 4, note: "大公司通常穩，但也看單位" },
  { id: "workload", title: "工時與壓力", description: "是否常加班、on-call、客戶壓力", weight: 5, note: "工時會直接影響生活品質" },
  { id: "commute", title: "通勤時間", description: "通勤時間、交通成本", weight: 4, note: "不要小看通勤的精力耗費" },
  { id: "remote-flexibility", title: "遠端 / 彈性", description: "是否可彈性上下班、遠端工作", weight: 3, note: "對生活品質有影響" },
  { id: "culture", title: "公司文化", description: "流程、政治、溝通方式是否能接受", weight: 4, note: "大公司文化不一定適合每個人" },
  { id: "learning-cost", title: "學習成本", description: "需要補多少新知識", weight: 3, note: "可控學習是加分，過度痛苦扣分" },
  { id: "willingness", title: "心理意願", description: "你自己是否真的想走這條路", weight: 5, note: "內在動機，若意願不高、沒興趣，再高薪也痛苦" },
];

export interface JudgmentBand {
  min: number;
  max: number;
  label: string;
}

export const JUDGMENT_BANDS: JudgmentBand[] = [
  { min: 240, max: Infinity, label: "很值得轉" },
  { min: 195, max: 239, label: "偏值得，但要確認風險" },
  { min: 155, max: 194, label: "可以考慮，但不是明顯好選項" },
  { min: 115, max: 154, label: "只有在你很想離職時才考慮" },
  { min: -Infinity, max: 114, label: "不建議轉" },
];

export function getJudgment(total: number): string {
  const band = JUDGMENT_BANDS.find((b) => total >= b.min && total <= b.max);
  return band ? band.label : "";
}
