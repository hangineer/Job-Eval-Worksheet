export type CategoryId = "money" | "growth" | "fit" | "life" | "environment";

export interface Category {
  id: CategoryId;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "money", label: "金錢報酬" },
  { id: "growth", label: "職涯發展與未來選擇權" },
  { id: "fit", label: "工作內容與個人適配" },
  { id: "life", label: "生活品質" },
  { id: "environment", label: "環境與穩定性" },
];

export interface Criterion {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  weight: number;
  note: string;
}

export const SCORE_OPTIONS = [
  { value: 1, label: "1", description: "明顯偏差，需要考慮" },
  { value: 2, label: "2", description: "略差，但可接受" },
  { value: 3, label: "3", description: "普通，沒有明顯影響" },
  { value: 4, label: "4", description: "小加分，可以接受" },
  { value: 5, label: "5", description: "明顯加分，很有吸引力" },
] as const;

export const CRITERIA: Criterion[] = [
  // 金錢報酬
  { id: "salary-total", category: "money", title: "總年薪", description: "年終、績效獎金、分紅等合計", weight: 5, note: "獎金是否白紙黑字、是否浮動" },
  { id: "salary-base", category: "money", title: "月薪", description: "是否有足夠的現金流", weight: 4, note: "月薪低會影響現金流與未來談薪" },
  { id: "raise-potential", category: "money", title: "未來調薪空間", description: "公司調薪制度", weight: 4, note: "" },
  // 職涯發展與未來選擇權
  { id: "tech-growth", category: "growth", title: "技術成長", description: "是否有機會學新技術或接觸新領域", weight: 5, note: "" },
  { id: "experience-fit", category: "growth", title: "經驗銜接", description: "與既有經驗銜接", weight: 4, note: "經驗需能夠累積" },
  { id: "resume-value", category: "growth", title: "履歷與未來彈性", description: "公司品牌、職稱、工作內容，以及下一份工作可選的職能與市場廣度", weight: 5, note: "" },
  { id: "learning-cost", category: "growth", title: "學習成本", description: "需要補多少新知識", weight: 3, note: "可控學習是加分，過度痛苦扣分" },
  // 工作內容與個人適配
  { id: "job-technicality", category: "fit", title: "工作內容", description: "是否以專業和職缺上的工作描述為主，而非行政、協調或支援", weight: 5, note: "若參雜跟工作內容相差甚遠的雜事需慎重考慮" },
  { id: "willingness", category: "fit", title: "心理意願", description: "你自己是否真的想走這條路", weight: 5, note: "內在動機，若意願不高、沒興趣，再高薪也痛苦" },
  // 生活品質
  { id: "workload", category: "life", title: "工時與壓力", description: "是否常加班、on-call、客戶壓力", weight: 5, note: "工時會直接影響生活品質" },
  { id: "commute", category: "life", title: "通勤時間", description: "通勤時間、交通成本", weight: 4, note: "不要小看通勤的精力耗費" },
  { id: "remote-flexibility", category: "life", title: "遠端 / 彈性", description: "是否可彈性上下班、遠端工作", weight: 3, note: "對生活品質有影響" },
  // 環境與穩定性
  { id: "manager-team", category: "environment", title: "主管與團隊", description: "主管是否清楚、若完全沒經驗團隊是否有人帶或詢問", weight: 5, note: "" },
  { id: "culture", category: "environment", title: "公司文化", description: "流程、政治、溝通方式是否能接受", weight: 4, note: "大公司文化不一定適合每個人" },
  { id: "job-stability", category: "environment", title: "工作穩定性", description: "公司制度、職缺穩定、組織風險", weight: 4, note: "大公司通常穩，但也看單位" },
  { id: "industry-outlook", category: "environment", title: "產業前景", description: "該產業是否穩定、有長期需求", weight: 4, note: "產業的成長性也需考量" },
];
