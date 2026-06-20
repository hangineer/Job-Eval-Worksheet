import { Fragment } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { CATEGORIES, CRITERIA, SCORE_OPTIONS } from "../criteria";
import { WEIGHT_GUIDE } from "../lib/constants";
import type { Scores } from "../lib/types";

interface CriteriaTableProps {
  scores: Scores;
  getWeight: (id: string, defaultWeight: number) => number;
  onSelect: (id: string, value: number) => void;
  onWeightChange: (id: string, defaultWeight: number, value: number) => void;
}

export function CriteriaTable({
  scores,
  getWeight,
  onSelect,
  onWeightChange,
}: CriteriaTableProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left whitespace-nowrap font-semibold">面向</th>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left min-w-50 font-semibold">評估內容</th>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-center whitespace-nowrap font-semibold">
              <span className="inline-flex items-center justify-center gap-1">
                權重
                <button
                  type="button"
                  data-tooltip-id="weight-tooltip"
                  className="inline-flex items-center justify-center w-4 h-4 text-[10px] leading-none rounded-full bg-gray-200 hover:bg-gray-300 transition cursor-help"
                  aria-label="權重說明"
                >
                  ?
                </button>
              </span>
            </th>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left whitespace-nowrap font-semibold">
              <span className="inline-flex items-center gap-1">
                評分
                <button
                  type="button"
                  data-tooltip-id="score-tooltip"
                  className="inline-flex items-center justify-center w-4 h-4 text-[10px] leading-none rounded-full bg-gray-200 hover:bg-gray-300 transition cursor-help"
                  aria-label="評分說明"
                >
                  ?
                </button>
              </span>
            </th>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-center whitespace-nowrap font-semibold">加權分數</th>
            <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left min-w-45 hidden md:table-cell font-semibold">備註</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat) => {
            const rows = CRITERIA.filter((c) => c.category === cat.id);
            if (rows.length === 0) return null;
            return (
              <Fragment key={cat.id}>
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-2 bg-gray-200 border-b border-gray-200 text-sm font-semibold text-gray-700"
                  >
                    {cat.label}
                  </td>
                </tr>
                {rows.map((c) => {
                  const score = scores[c.id] ?? null;
                  const weight = getWeight(c.id, c.weight);
                  const weighted = score == null ? null : score * weight;
                  return (
                    <tr key={c.id}>
                <td className="px-3 py-2 border-b border-gray-100 font-semibold whitespace-nowrap">{c.title}</td>
                <td className="px-3 py-2 border-b border-gray-100 min-w-[200px]">{c.description}</td>
                <td className="px-3 py-2 border-b border-gray-100 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={weight <= 1}
                      className="w-7 h-7 rounded border border-gray-300 bg-gray-50 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition"
                      aria-label="降低權重"
                      onClick={() => onWeightChange(c.id, c.weight, weight - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="w-10 px-1 py-1 text-center border border-gray-300 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={weight}
                      onChange={(e) => {
                        const parsed = Number(e.target.value);
                        if (e.target.value === "" || Number.isNaN(parsed)) return;
                        onWeightChange(c.id, c.weight, parsed);
                      }}
                    />
                    <button
                      type="button"
                      disabled={weight >= 5}
                      className="w-7 h-7 rounded border border-gray-300 bg-gray-50 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition"
                      aria-label="提高權重"
                      onClick={() => onWeightChange(c.id, c.weight, weight + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-gray-100">
                  <div className="flex gap-1">
                    {SCORE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`w-9 h-9 rounded-md border-2 font-bold text-sm text-white transition ${
                          ["bg-red-600", "bg-orange-500", "bg-amber-500", "bg-lime-600", "bg-green-600", "bg-green-700"][opt.value]
                        } ${
                          score === opt.value
                            ? "opacity-100 border-slate-800 scale-105"
                            : "opacity-45 border-transparent hover:opacity-80 cursor-pointer"
                        }`}
                        title={opt.description}
                        onClick={() => onSelect(c.id, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-gray-100 text-center whitespace-nowrap">
                  {weighted == null ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    <span className="font-bold text-green-700">
                      {weighted}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-gray-100 text-gray-500 text-xs min-w-[180px] hidden md:table-cell">
                  {c.note && c.note !== c.description ? (
                    c.note
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                    </tr>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <Tooltip
        id="weight-tooltip"
        place="top"
        className="max-w-xs"
        content={
          <div className="text-left text-xs">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="pr-3 pb-1 font-bold text-right whitespace-nowrap">權重</th>
                  <th className="pb-1 font-bold text-left">意義</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_GUIDE.map((row) => (
                  <tr key={row.value}>
                    <td className="pr-3 py-0.5 text-right tabular-nums">{row.value}</td>
                    <td className="py-0.5">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
      <Tooltip
        id="score-tooltip"
        place="top"
        className="max-w-xs"
        content={
          <div className="text-left text-xs">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="pr-3 pb-1 font-bold text-right whitespace-nowrap">評分</th>
                  <th className="pb-1 font-bold text-left">意義</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_OPTIONS.map((opt) => (
                  <tr key={opt.value}>
                    <td className="pr-3 py-0.5 text-right">
                      <span
                        className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded-md font-bold text-white ${
                          ["bg-red-600", "bg-orange-500", "bg-amber-500", "bg-lime-600", "bg-green-600", "bg-green-700"][opt.value]
                        }`}
                      >
                        {opt.label}
                      </span>
                    </td>
                    <td className="py-0.5">{opt.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
}
