import { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { CriteriaTable } from "./components/CriteriaTable";
import { SiteFooter } from "./components/SiteFooter";
import { CRITERIA, getJudgment } from "./criteria";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { STORAGE_KEY, WEIGHTS_STORAGE_KEY } from "./lib/constants";
import type { Scores, Weights } from "./lib/types";

function App() {
  const [scores, setScores] = useLocalStorage<Scores>(STORAGE_KEY, {});
  const [weights, setWeights] = useLocalStorage<Weights>(WEIGHTS_STORAGE_KEY, {});

  const getWeight = (id: string, defaultWeight: number) =>
    weights[id] ?? defaultWeight;

  const maxTotal = useMemo(
    () => CRITERIA.reduce((sum, c) => sum + (weights[c.id] ?? c.weight) * 2, 0),
    [weights]
  );
  const minTotal = -maxTotal;

  const total = useMemo(
    () =>
      CRITERIA.reduce((sum, c) => {
        const score = scores[c.id];
        return sum + (score ?? 0) * (weights[c.id] ?? c.weight);
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

  const handleWeightChange = (id: string, defaultWeight: number, value: number) => {
    setWeight(id, defaultWeight, value);
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

        <CriteriaTable
          scores={scores}
          getWeight={getWeight}
          onSelect={handleSelect}
          onWeightChange={handleWeightChange}
        />

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

      <SiteFooter />
    </div>
  );
}

export default App;
