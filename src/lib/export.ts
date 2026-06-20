import { CRITERIA } from "./criteria";
import { getJudgment, type ScoreResult } from "./scoring";
import type { Scores, Weights } from "./types";
import * as XLSX from "xlsx-js-style";

export async function exportScoresToExcel(
  jobName: string,
  scores: Scores,
  weights: Weights,
  result: ScoreResult,
): Promise<void> {
  const rows = CRITERIA.map((c) => {
    const score = scores[c.id];
    const weight = weights[c.id] ?? c.weight;
    const hasScore = score != null;
    return {
      項目: c.title,
      說明: c.description,
      權重: weight,
      評分: hasScore ? score : "-",
      加權得分: hasScore ? score * weight : "-",
    };
  });

  const sheet = XLSX.utils.json_to_sheet(rows);

  const judgment = getJudgment(result.percent);

  XLSX.utils.sheet_add_aoa( // aoa: Array of Arrays
    sheet,
    [
      [],
      ["工作職稱", jobName || "（未填）"],
      ["已評分項目", `${result.answeredCount} / ${CRITERIA.length}`],
      ["得分率", `${result.percent}%`],
      ["判斷結果", judgment],
    ],
    { origin: -1 }, // 接在現有資料後面
  );

  sheet["!cols"] = [
    { wch: 16 }, // 項目
    { wch: 60 }, // 說明
    { wch: 8 },  // 權重
    { wch: 8 },  // 評分
    { wch: 10 }, // 加權得分
  ];

  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E5E7EB" } }, // 淺灰底
    alignment: { horizontal: "center" as const },
  };

  ["A1", "B1", "C1", "D1", "E1"].forEach((addr) => {
    if (sheet[addr]) sheet[addr].s = headerStyle;
  });

  // 評分(D)、加權得分(E) 兩欄靠右，讓 "-" 與數字對齊
  for (let r = 2; r <= CRITERIA.length + 1; r++) {
    for (const col of ["D", "E"]) {
      const cell = sheet[`${col}${r}`];
      if (cell) {
        cell.s = { ...cell.s, alignment: { horizontal: "right" } };
      }
    }
  }

  // 字體大小 14pt
  Object.keys(sheet).forEach((addr) => {
    if (addr.startsWith("!")) return; // 跳過 !cols、!ref 等中繼資料
    const cell = sheet[addr];
    cell.s = { ...cell.s, font: { ...cell.s?.font, sz: 14 } };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "工作評分表");
  XLSX.writeFile(workbook, `${jobName || "工作評分表"}.xlsx`);
}
