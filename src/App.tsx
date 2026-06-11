import { useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { CRITERIA, SCORE_OPTIONS, getJudgment } from "./criteria";

type Scores = Record<string, number | null>;
type Weights = Record<string, number>;

const STORAGE_KEY = "career-change-scores";
const WEIGHTS_STORAGE_KEY = "career-change-weights";

const WEIGHT_GUIDE = [
  { value: 1, meaning: "幾乎不重要" },
  { value: 2, meaning: "有影響，但不是關鍵" },
  { value: 3, meaning: "中等重要" },
  { value: 4, meaning: "很重要" },
  { value: 5, meaning: "核心關鍵" },
] as const;

const SCORE_BG: Record<number, string> = {
  2: "bg-green-700",
  1: "bg-green-300",
  0: "bg-gray-400",
  "-1": "bg-red-300",
  "-2": "bg-red-700",
};

function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // ignore corrupted storage
    }
    return fallback;
  });

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  return [value, update] as const;
}

function App() {
  const [scores, setScores] = useLocalStorage<Scores>(STORAGE_KEY, {});
  const [weights, setWeights] = useLocalStorage<Weights>(WEIGHTS_STORAGE_KEY, {});

  const getWeight = (id: string, defaultWeight: number) =>
    weights[id] ?? defaultWeight;

  const maxTotal = useMemo(
    () => CRITERIA.reduce((sum, c) => sum + getWeight(c.id, c.weight) * 2, 0),
    [weights]
  );
  const minTotal = -maxTotal;

  const total = useMemo(
    () =>
      CRITERIA.reduce((sum, c) => {
        const score = scores[c.id];
        return sum + (score ?? 0) * getWeight(c.id, c.weight);
      }, 0),
    [scores, weights]
  );

  const answeredCount = CRITERIA.filter((c) => scores[c.id] != null).length;
  const progress = (answeredCount / CRITERIA.length) * 100;

  const handleSelect = (id: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }));
  };

  const handleReset = () => {
    setScores({});
  };

  const setWeight = (id: string, defaultWeight: number, value: number) => {
    const clamped = Math.min(5, Math.max(1, value));
    setWeights((prev) => {
      const next = { ...prev };
      if (clamped === defaultWeight) {
        delete next[id];
      } else {
        next[id] = clamped;
      }
      return next;
    });
  };

  const handleWeightChange = (id: string, defaultWeight: number, value: string) => {
    const parsed = Number(value);
    if (value === "" || Number.isNaN(parsed)) return;
    setWeight(id, defaultWeight, parsed);
  };

  const handleWeightAdjust = (id: string, defaultWeight: number, delta: number) => {
    setWeight(id, defaultWeight, getWeight(id, defaultWeight) + delta);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto w-full p-6 flex-1">
        <header className="mb-4">
          <h1 className="text-2xl font-bold mb-1">轉換工作評估表</h1>
          <p className="text-gray-600">
            針對每個面向給予 -2 ~ +2 分，系統會自動依「權重 × 評分」計算加權分數並加總。
          </p>
        </header>

        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left whitespace-nowrap">面向</th>
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left min-w-[200px]">評估內容</th>
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-center whitespace-nowrap">
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
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left whitespace-nowrap">
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
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-center whitespace-nowrap">加權分數</th>
                <th className="px-3 py-2 border-b border-gray-100 bg-gray-50 text-left min-w-[180px] hidden md:table-cell">備註</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => {
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
                          onClick={() => handleWeightAdjust(c.id, c.weight, -1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          className="w-10 px-1 py-1 text-center border border-gray-300 rounded [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={weight}
                          onChange={(e) => handleWeightChange(c.id, c.weight, e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={weight >= 5}
                          className="w-7 h-7 rounded border border-gray-300 bg-gray-50 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition"
                          aria-label="提高權重"
                          onClick={() => handleWeightAdjust(c.id, c.weight, 1)}
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
                            className={`w-9 h-9 rounded-md border-2 font-bold text-sm text-white transition ${SCORE_BG[opt.value]} ${
                              score === opt.value
                                ? "opacity-100 border-slate-800 scale-105"
                                : "opacity-45 border-transparent hover:opacity-80 cursor-pointer"
                            }`}
                            title={opt.description}
                            onClick={() => handleSelect(c.id, opt.value)}
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
                        <span className={`font-bold ${weighted >= 0 ? "text-green-700" : "text-red-700"}`}>
                          {weighted > 0 ? `+${weighted}` : weighted}
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
                            className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded-md font-bold text-white ${SCORE_BG[opt.value]}`}
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

        <section className="mt-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
          <div className="flex justify-between items-center py-1.5">
            <span>已評分項目</span>
            <span>
              {answeredCount} / {CRITERIA.length}
            </span>
          </div>
          <div className="h-2 mt-2 mb-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center py-1.5 my-1 text-2xl font-bold border-t border-b border-gray-100">
            <span>總分</span>
            <span className={total >= 0 ? "text-green-700" : "text-red-700"}>
              {total > 0 ? `+${total}` : total}
              <small className="ml-1 text-xs font-normal text-gray-400">
                （範圍 {minTotal} ~ {maxTotal}）
              </small>
            </span>
          </div>
          <div className="flex justify-end items-center py-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold">{getJudgment(total)}</span>
              <button
                type="button"
                data-tooltip-id="judgment-tooltip"
                className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 transition cursor-help"
              >
                判斷標準
              </button>
              <Tooltip
                id="judgment-tooltip"
                place="top"
                className="max-w-xs"
                content={
                  <div className="text-left text-xs">
                    <div className="font-bold mb-1">分數區間與判斷</div>
                    <div className="space-y-0.5 flex flex-col">
                      <span className="font-semibold">60 分以上：很值得轉</span>
                      <span className="font-semibold">40～59 分：偏值得，但要確認風險</span>
                      <span className="font-semibold">20～39 分：可以考慮，但不是明顯好選項</span>
                      <span className="font-semibold">0～19 分：只有在你很想離職時才考慮</span>
                      <span className="font-semibold">0 分以下：不建議轉</span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-4 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-200 transition"
            onClick={handleReset}
          >
            清空所有評分
          </button>

          <button
            type="button"
            className="mt-4 ml-2 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-200 transition"
            onClick={handleReset}
          >
            下載評分表
          </button>
        </section>
      </div>

      <footer className="w-full py-4 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
        © Hannah Wang. All Rights Reserved
      </footer>
    </div>
  );
}

export default App;
