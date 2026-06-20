import { useMemo } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { CriteriaTable } from "./components/CriteriaTable";
import { SiteFooter } from "./components/SiteFooter";
import Header from "./components/Header";
import { CRITERIA } from "./criteria";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  JOB_NAME_STORAGE_KEY,
  STORAGE_KEY,
  WEIGHTS_STORAGE_KEY,
} from "./lib/constants";
import {
  evaluateScores,
  getJudgment,
  JUDGMENT_BANDS,
  formatBandRange,
  type ScoreResult,
} from "./lib/scoring";
import type { Scores, Weights } from "./lib/types";

function getResultLabel(result: ScoreResult): string {
  const { answeredCount, hasEnoughCoverage, percent, minAnswered } = result;
  if (answeredCount === 0) return "尚未評分";
  if (!hasEnoughCoverage) {
    return `已評 ${answeredCount} / ${CRITERIA.length} 項，至少 ${minAnswered} 項才提供判斷`;
  }
  return getJudgment(percent);
}

function App() {
  const [scores, setScores] = useLocalStorage<Scores>(STORAGE_KEY, {});
  const [weights, setWeights] = useLocalStorage<Weights>(WEIGHTS_STORAGE_KEY, {});
  const [jobName, setJobName] = useLocalStorage<string>(JOB_NAME_STORAGE_KEY, "");

  const getWeight = (id: string, defaultWeight: number) =>
    weights[id] ?? defaultWeight;

  const result = useMemo(
    () => evaluateScores(scores, weights),
    [scores, weights],
  );
  const { answeredCount, percent, progress } = result;

  const handleSelect = (id: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }));
  };

  const handleReset = () => {
    setScores({});
    setJobName("");
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
      <Header />
      <div className="max-w-5xl mx-auto w-full p-6 flex-1">
        <label className="block mt-3 mb-3">
          <span className="text-lg font-semibold text-gray-800">工作職稱</span>
          <input
            type="text"
            className="max-w-lg ml-3 p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
            placeholder="A 公司 - 資深前端"
            value={jobName}
            onChange={e => setJobName(e.target.value)}
          />
        </label>
        <p className="text-gray-600">
          針對每個面向給予 1 ~ 5 分，系統依「權重 × 評分」計算得分率
        </p>
        <ul className="text-gray-600 list-disc list-inside my-1">
          <li>不在乎的面向：把權重調低（最低為 1）</li>
          <li>不知道的面向：留空跳過</li>
        </ul>

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
            <span>得分率</span>
            <span className="text-green-700">{`${percent}%`}</span>
          </div>
          <div className="flex justify-end items-center py-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold">{getResultLabel(result)}</span>
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
                    <div className="space-y-0.5 flex flex-col">
                      {JUDGMENT_BANDS.map((band, i) => (
                        <span key={band.label} className="font-semibold">
                          {formatBandRange(i)}：{band.label}
                        </span>
                      ))}
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-4 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-200 transition cursor-pointer"
            onClick={handleReset}
          >
            清空所有評分
          </button>

          <button
            type="button"
            className="mt-4 ml-2 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-200 transition cursor-pointer"
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
